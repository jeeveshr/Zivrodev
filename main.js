/* ============================================================
   ZIVRODEV — EDITORIAL JS + CONVEX INTEGRATION
   Buzzworthy-inspired interactions + Reactive Backend
   ============================================================ */
import { ConvexClient } from "convex/browser";
import { api } from "./convex/_generated/api";

// Initialize Convex Client (will be set automatically by Vite from .env)
const client = new ConvexClient(import.meta.env.VITE_CONVEX_URL || "");

(() => {
    'use strict';

    /* ---------- NAV SCROLL ---------- */
    const nav = document.getElementById('nav');
    const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    /* ---------- DARK / LIGHT MODE ---------- */
    const themeToggle = document.getElementById('themeToggle');
    const html = document.documentElement;
    const savedTheme = localStorage.getItem('ll-theme') || 'light';
    html.setAttribute('data-theme', savedTheme);

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const current = html.getAttribute('data-theme');
            const next = current === 'dark' ? 'light' : 'dark';
            html.setAttribute('data-theme', next);
            localStorage.setItem('ll-theme', next);
        });
    }

    /* ---------- MOBILE MENU ---------- */
    const toggle = document.getElementById('navToggle');
    const links = document.getElementById('navLinks');
    toggle.addEventListener('click', () => {
        toggle.classList.toggle('active');
        links.classList.toggle('open');
    });
    links.querySelectorAll('a').forEach(a =>
        a.addEventListener('click', () => {
            toggle.classList.remove('active');
            links.classList.remove('open');
        })
    );

    /* ---------- SMOOTH SCROLL ---------- */
    document.querySelectorAll('a[href^="#"]').forEach(a =>
        a.addEventListener('click', e => {
            const t = document.querySelector(a.getAttribute('href'));
            if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
        })
    );

    /* ---------- SCROLL REVEAL (Buzzworthy-style) ---------- */
    const reveals = document.querySelectorAll('[data-reveal]');
    const revealObs = new IntersectionObserver(
        entries => entries.forEach(e => {
            if (e.isIntersecting) {
                // Stagger by index within parent
                const siblings = Array.from(e.target.parentElement.children)
                    .filter(c => c.hasAttribute('data-reveal'));
                const idx = siblings.indexOf(e.target);
                setTimeout(() => e.target.classList.add('revealed'), idx * 100);
                revealObs.unobserve(e.target);
            }
        }),
        { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    reveals.forEach(el => revealObs.observe(el));

    /* ---------- TABBED SERVICES ---------- */
    const tabs = document.querySelectorAll('.services__tab');
    const panels = document.querySelectorAll('.services__panel');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            panels.forEach(p => p.classList.remove('active'));
            tab.classList.add('active');
            const target = document.getElementById('panel-' + tab.dataset.tab);
            if (target) target.classList.add('active');
        });
    });

    /* ---------- FAQ ACCORDION ---------- */
    document.querySelectorAll('.faq__question').forEach(btn => {
        btn.addEventListener('click', () => {
            const item = btn.closest('.faq__item');
            const wasActive = item.classList.contains('active');
            document.querySelectorAll('.faq__item').forEach(i => i.classList.remove('active'));
            if (!wasActive) item.classList.add('active');
        });
    });

    /* ---------- FLOATING HERO CARDS ---------- */
    const floatCards = document.querySelectorAll('[data-float]');
    let tick = 0;
    function animateFloat() {
        tick += 0.012;
        floatCards.forEach(card => {
            const i = parseInt(card.dataset.float);
            const y = Math.sin(tick + i * 1.2) * 10;
            card.style.transform = `translateY(${y}px)`;
        });
        requestAnimationFrame(animateFloat);
    }
    if (floatCards.length) animateFloat();

    /* ---------- MAGNETIC BUTTONS ---------- */
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    if (!isTouchDevice) {
        document.querySelectorAll('.magnetic-btn').forEach(btn => {
            const strength = 0.3; // how far the button follows cursor (0 = none, 1 = follows exactly)
            const resetSpeed = 0.15;

            btn.addEventListener('mousemove', e => {
                const rect = btn.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                const deltaX = (e.clientX - centerX) * strength;
                const deltaY = (e.clientY - centerY) * strength;
                btn.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
                btn.style.transition = 'transform 0.15s ease-out';
            });

            btn.addEventListener('mouseleave', () => {
                btn.style.transform = '';
                btn.style.transition = `transform 0.5s var(--ease)`;
            });
        });
    }

    /* ---------- SPEED TOGGLE ---------- */
    const speedBtn = document.getElementById('speedBtn');
    const speedScore = document.getElementById('speedScore');
    const speedArc = document.getElementById('speedArc');
    const metricFCP = document.getElementById('metricFCP');
    const metricLCP = document.getElementById('metricLCP');
    const metricCLS = document.getElementById('metricCLS');
    let speedOn = true;

    const highPerf = { score: 98, fcp: '0.8s', lcp: '1.2s', cls: '0.01', offset: 3 };
    const lowPerf = { score: 42, fcp: '3.6s', lcp: '5.1s', cls: '0.32', offset: 88 };

    function updateSpeed(data) {
        if (speedScore) speedScore.textContent = data.score;
        if (speedArc) speedArc.style.strokeDashoffset = data.offset;
        if (metricFCP) metricFCP.textContent = data.fcp;
        if (metricLCP) metricLCP.textContent = data.lcp;
        if (metricCLS) metricCLS.textContent = data.cls;
        // Color changes
        const color = data.score > 80 ? 'var(--teal)' : '#e74c3c';
        if (speedScore) speedScore.style.color = color;
        if (speedArc) speedArc.style.stroke = color;
    }

    if (speedBtn) {
        speedBtn.addEventListener('click', () => {
            speedOn = !speedOn;
            speedBtn.classList.toggle('off', !speedOn);
            updateSpeed(speedOn ? highPerf : lowPerf);
        });
    }

    // Animate speed score on visibility
    function animateSpeedIn() {
        let current = 0;
        const target = 98;
        const interval = setInterval(() => {
            current += 2;
            if (current >= target) { current = target; clearInterval(interval); }
            if (speedScore) speedScore.textContent = current;
        }, 20);
    }

    const speedToggleEl = document.getElementById('speedToggle');
    if (speedToggleEl) {
        const speedObs = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting) {
                animateSpeedIn();
                speedObs.unobserve(speedToggleEl);
            }
        }, { threshold: 0.3 });
        speedObs.observe(speedToggleEl);
    }

    /* ---------- WHATSAPP FAB ---------- */
    // Show FAB after scrolling a bit
    const fab = document.getElementById('whatsappFab');
    if (fab) {
        fab.style.opacity = '0';
        fab.style.transform = 'scale(0.8) translateY(10px)';
        fab.style.transition = 'opacity 0.4s ease, transform 0.4s ease';

        function checkFab() {
            if (window.scrollY > 300) {
                fab.style.opacity = '1';
                fab.style.transform = 'scale(1) translateY(0)';
            } else {
                fab.style.opacity = '0';
                fab.style.transform = 'scale(0.8) translateY(10px)';
            }
        }
        window.addEventListener('scroll', checkFab, { passive: true });
        checkFab();
    }

    /* ---------- CUSTOM CURSOR ---------- */
    const cursor = document.getElementById('customCursor');
    if (cursor && !isTouchDevice) {
        document.addEventListener('mousemove', e => {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
            if (!cursor.classList.contains('visible')) {
                cursor.classList.add('visible');
            }
        });

        document.addEventListener('mouseleave', () => {
            cursor.classList.remove('visible');
        });

        document.addEventListener('mouseenter', () => {
            cursor.classList.add('visible');
        });
    }

    /* ---------- PAYMENT MODAL ---------- */
    const paymentModal = document.getElementById('paymentModal');
    const paymentOverlay = document.getElementById('paymentOverlay');
    const paymentClose = document.getElementById('paymentClose');
    const paymentBody = document.getElementById('paymentBody');
    const paymentSuccess = document.getElementById('paymentSuccess');
    const payBtn = document.getElementById('payBtn');

    function openPaymentModal(e) {
        e.preventDefault();
        if (paymentModal) {
            // Reset state
            if (paymentBody) paymentBody.style.display = '';
            if (paymentSuccess) paymentSuccess.classList.remove('show');
            if (payBtn) {
                payBtn.classList.remove('processing');
                payBtn.textContent = 'Pay ₹15,000';
            }
            paymentModal.classList.add('open');
            document.body.style.overflow = 'hidden';
        }
    }

    function closePaymentModal() {
        if (paymentModal) {
            paymentModal.classList.remove('open');
            document.body.style.overflow = '';
        }
    }

    // Open modal buttons
    document.querySelectorAll('[data-open-payment]').forEach(btn => {
        btn.addEventListener('click', openPaymentModal);
    });

    // Close handlers
    if (paymentClose) paymentClose.addEventListener('click', closePaymentModal);
    if (paymentOverlay) paymentOverlay.addEventListener('click', closePaymentModal);

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') closePaymentModal();
    });

    // Pay button — real Convex integration
    if (payBtn) {
        payBtn.addEventListener('click', async () => {
            const emailInput = document.getElementById('paymentEmail');
            const email = emailInput ? emailInput.value : '';

            if (!email || !email.includes('@')) {
                alert('Please enter a valid email address.');
                return;
            }

            payBtn.classList.add('processing');
            payBtn.textContent = 'Processing...';

            try {
                // Send lead to Convex
                await client.mutation(api.leads.createLead, {
                    email: email,
                    source: "website",
                    message: "Purchased: AI Launch Website — Starter Plan"
                });

                // Show success UI
                if (paymentBody) paymentBody.style.display = 'none';
                if (paymentSuccess) paymentSuccess.classList.add('show');

                // Auto close after 2.5s
                setTimeout(closePaymentModal, 2500);
            } catch (err) {
                console.error("Convex Error:", err);
                payBtn.classList.remove('processing');
                payBtn.textContent = 'Error. Try again?';
            }
        });
    }

    /* ---------- NAV DARK MODE FIX ---------- */
    function updateNavBg() {
        const isDark = html.getAttribute('data-theme') === 'dark';
        if (nav) {
            nav.style.background = isDark
                ? 'rgba(10, 15, 26, 0.92)'
                : 'rgba(255, 244, 183, 0.9)';
        }
    }
    updateNavBg();

    // Extend theme toggle to also update nav
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            // Slight delay so the data-theme attribute updates first
            requestAnimationFrame(updateNavBg);
        });
    }

})();

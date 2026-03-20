/* ============================================================
   ZIVRODEV — DIGITAL NATURALISM JS + CONVEX INTEGRATION
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

    /* ---------- MOBILE MENU ---------- */
    const toggle = document.getElementById('navToggle');
    const links = document.getElementById('navLinks');
    if (toggle && links) {
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
    }

    /* ---------- SMOOTH SCROLL ---------- */
    document.querySelectorAll('a[href^="#"]').forEach(a =>
        a.addEventListener('click', e => {
            const t = document.querySelector(a.getAttribute('href'));
            if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
        })
    );

    /* ---------- SCROLL REVEAL ---------- */
    const reveals = document.querySelectorAll('[data-reveal]');
    const revealObs = new IntersectionObserver(
        entries => entries.forEach(e => {
            if (e.isIntersecting) {
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

    /* ---------- FOLDER TABS ---------- */
    const folderTabs = document.querySelectorAll('.folder-tab');
    folderTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            folderTabs.forEach(t => t.classList.remove('folder-tab--active'));
            tab.classList.add('folder-tab--active');
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

    /* ---------- MAGNETIC BUTTONS ---------- */
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    if (!isTouchDevice) {
        document.querySelectorAll('.magnetic-btn').forEach(btn => {
            const strength = 0.3;

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

    /* ---------- WHATSAPP FAB ---------- */
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

    document.querySelectorAll('[data-open-payment]').forEach(btn => {
        btn.addEventListener('click', openPaymentModal);
    });

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
                await client.mutation(api.leads.createLead, {
                    email: email,
                    source: "website",
                    message: "Purchased: AI Launch Website — Starter Plan"
                });

                if (paymentBody) paymentBody.style.display = 'none';
                if (paymentSuccess) paymentSuccess.classList.add('show');

                setTimeout(closePaymentModal, 2500);
            } catch (err) {
                console.error("Convex Error:", err);
                payBtn.classList.remove('processing');
                payBtn.textContent = 'Error. Try again?';
            }
        });
    }

})();

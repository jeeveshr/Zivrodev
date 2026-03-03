import { defineConfig } from 'vite'

export default defineConfig({
    // Use /Zivrodev/ for GitHub Pages, but / for Vercel
    base: process.env.VERCEL ? '/' : '/Zivrodev/',
})

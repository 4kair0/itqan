"use client"

import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { ArrowDown, Github, Linkedin, Mail, Download } from 'lucide-react'
import type { PortfolioLang } from '../data/i18n'
import { portfolioTranslations } from '../data/i18n'

interface HeroProps {
  lang: PortfolioLang
}

function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    const chars = 'アイウエオカキクケコサシスセソタチツテト0123456789ABCDEF<>{}[]()=/\\*&^%$#@!'
    const fontSize = 12
    const columns = Math.floor(canvas.width / fontSize)
    const drops: number[] = Array(columns).fill(1)

    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.fillStyle = '#00ff4120'
      ctx.font = `${fontSize}px monospace`

      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)]
        ctx.fillText(char, i * fontSize, drops[i] * fontSize)

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0
        }
        drops[i]++
      }
    }

    const interval = setInterval(draw, 50)
    return () => clearInterval(interval)
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full opacity-30"
    />
  )
}

export default function Hero({ lang }: HeroProps) {
  const t = portfolioTranslations[lang].hero
  const [typedText, setTypedText] = useState('')
  const [showCursor, setShowCursor] = useState(true)
  const fullText = t.name

  useEffect(() => {
    setTypedText('')
    let i = 0
    const interval = setInterval(() => {
      if (i < fullText.length) {
        setTypedText(fullText.slice(0, i + 1))
        i++
      } else {
        clearInterval(interval)
      }
    }, 100)
    return () => clearInterval(interval)
  }, [fullText])

  useEffect(() => {
    const blink = setInterval(() => setShowCursor(v => !v), 530)
    return () => clearInterval(blink)
  }, [])

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black"
    >
      {/* Matrix rain background */}
      <MatrixRain />

      {/* Scan line effect */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,65,0.1) 2px, rgba(0,255,65,0.1) 4px)',
        }}
      />

      {/* Radial glow */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#00ff41]/[0.03] rounded-full blur-[150px]" />
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-[#00d4ff]/[0.02] rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
        {/* Terminal-style greeting */}
        <motion.div
          className="inline-flex items-center gap-2 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <span className="text-[#00ff41]/60 font-mono text-sm">{'>'}</span>
          <span className="text-[#00ff41]/80 font-mono text-sm tracking-wider">
            {t.greeting}
          </span>
        </motion.div>

        {/* Name with typing effect */}
        <motion.h1
          className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold mb-4 font-mono tracking-tight"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <span className="text-[#00ff41] drop-shadow-[0_0_20px_rgba(0,255,65,0.3)]">
            {typedText}
          </span>
          <span
            className={`inline-block w-[3px] h-[0.75em] bg-[#00ff41] ml-1 align-middle transition-opacity ${
              showCursor ? 'opacity-100' : 'opacity-0'
            }`}
          />
        </motion.h1>

        {/* Title */}
        <motion.p
          className="text-xl md:text-2xl text-gray-300 mb-3 font-mono"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          {t.title}
        </motion.p>

        {/* Focus badge - neural network style */}
        <motion.div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#00d4ff]/30 bg-[#00d4ff]/5 mb-6"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <span className="w-2 h-2 rounded-full bg-[#00d4ff] animate-pulse shadow-[0_0_8px_rgba(0,212,255,0.8)]" />
          <span className="text-[#00d4ff] text-sm font-medium font-mono">{t.focus}</span>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          className="text-gray-500 text-base md:text-lg max-w-xl mx-auto mb-10 font-mono"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.0 }}
        >
          {t.subtitle}
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.2 }}
        >
          <button
            onClick={() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })}
            className="group px-8 py-3 bg-[#00ff41]/10 text-[#00ff41] font-bold font-mono rounded-lg border border-[#00ff41]/40 hover:bg-[#00ff41]/20 hover:border-[#00ff41] transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,255,65,0.2)] flex items-center gap-2"
          >
            {t.cta}
            <ArrowDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
          </button>
          <button className="px-8 py-3 border border-[#00d4ff]/30 text-[#00d4ff] font-medium font-mono rounded-lg hover:bg-[#00d4ff]/10 hover:border-[#00d4ff]/60 transition-all duration-300 flex items-center gap-2">
            <Download className="w-4 h-4" />
            {t.download}
          </button>
        </motion.div>

        {/* Social Links */}
        <motion.div
          className="flex items-center justify-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.4 }}
        >
          {[
            { icon: Github, href: '#', label: 'GitHub' },
            { icon: Linkedin, href: '#', label: 'LinkedIn' },
            { icon: Mail, href: '#', label: 'Email' },
          ].map(({ icon: Icon, href, label }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-lg border border-[#00ff41]/20 text-gray-500 hover:text-[#00ff41] hover:border-[#00ff41]/50 hover:bg-[#00ff41]/5 hover:shadow-[0_0_15px_rgba(0,255,65,0.1)] transition-all duration-300"
              aria-label={label}
            >
              <Icon className="w-5 h-5" />
            </a>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <ArrowDown className="w-5 h-5 text-[#00ff41]/40" />
      </motion.div>
    </section>
  )
}

"use client"

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowDown, Github, Linkedin, Mail, Download } from 'lucide-react'
import Noise from './Noise'
import type { PortfolioLang } from '../data/i18n'
import { portfolioTranslations } from '../data/i18n'

interface HeroProps {
  lang: PortfolioLang
}

export default function Hero({ lang }: HeroProps) {
  const t = portfolioTranslations[lang].hero
  const [typedText, setTypedText] = useState('')
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
    }, 80)
    return () => clearInterval(interval)
  }, [fullText])

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0a0f1a]"
    >
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0f1a] via-[#0a0f1a] to-[#111827]" />
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#00d4ff]/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[#8b5cf6]/5 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#f59e0b]/3 rounded-full blur-[150px]" />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(0,212,255,0.3) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(0,212,255,0.3) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <Noise patternSize={130} patternAlpha={12} patternRefreshInterval={3} patternScaleY={2} />

      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
        {/* Greeting */}
        <motion.p
          className="text-gray-400 text-lg md:text-xl mb-4 font-mono"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {t.greeting}
        </motion.p>

        {/* Name with typing effect */}
        <motion.h1
          className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-4 font-mono tracking-tight"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <span className="text-[#00d4ff]">{typedText}</span>
          <motion.span
            className="inline-block w-[3px] h-[0.8em] bg-[#00d4ff] ml-1 align-middle"
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 0.8, repeat: Infinity, ease: 'steps(1)' }}
          />
        </motion.h1>

        {/* Title */}
        <motion.p
          className="text-xl md:text-2xl text-gray-300 mb-3 font-[family-name:var(--font-inter)]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          {t.title}
        </motion.p>

        {/* Focus badge */}
        <motion.div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#8b5cf6]/30 bg-[#8b5cf6]/10 mb-6"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <span className="w-2 h-2 rounded-full bg-[#8b5cf6] animate-pulse" />
          <span className="text-[#8b5cf6] text-sm font-medium font-mono">{t.focus}</span>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          className="text-gray-400 text-base md:text-lg max-w-xl mx-auto mb-10 font-[family-name:var(--font-inter)]"
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
            className="group px-8 py-3 bg-[#00d4ff] text-[#0a0f1a] font-bold rounded-xl hover:bg-[#00d4ff]/90 transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,212,255,0.3)] flex items-center gap-2"
          >
            {t.cta}
            <ArrowDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
          </button>
          <button className="px-8 py-3 border border-[#f59e0b]/40 text-[#f59e0b] font-medium rounded-xl hover:bg-[#f59e0b]/10 hover:border-[#f59e0b] transition-all duration-300 flex items-center gap-2">
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
              className="p-3 rounded-xl border border-white/10 text-gray-400 hover:text-[#00d4ff] hover:border-[#00d4ff]/30 hover:bg-[#00d4ff]/5 transition-all duration-300"
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
        <ArrowDown className="w-5 h-5 text-gray-500" />
      </motion.div>
    </section>
  )
}

"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Globe } from 'lucide-react'
import type { PortfolioLang } from '../data/i18n'

interface NavigationProps {
  lang: PortfolioLang
  onLangChange: (lang: PortfolioLang) => void
}

export default function Navigation({ lang, onLangChange }: NavigationProps) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#0a0f1a]/90 backdrop-blur-xl border-b border-white/5'
          : 'bg-transparent'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <motion.button
            onClick={() => {
              document.getElementById('home')?.scrollIntoView({ behavior: 'smooth' })
            }}
            className="text-[#00d4ff] font-mono font-bold text-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {'<ME />'}
          </motion.button>

          <button
            onClick={() => onLangChange(lang === 'en' ? 'ar' : 'en')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-gray-400 hover:text-[#f59e0b] hover:bg-[#f59e0b]/10 transition-all text-sm font-mono"
            title={lang === 'en' ? 'العربية' : 'English'}
          >
            <Globe className="w-4 h-4" />
            <span>{lang === 'en' ? 'AR' : 'EN'}</span>
          </button>
        </div>
      </div>
    </motion.nav>
  )
}

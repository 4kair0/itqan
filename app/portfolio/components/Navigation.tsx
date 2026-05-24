"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Globe } from 'lucide-react'
import type { PortfolioLang } from '../data/i18n'
import { portfolioTranslations } from '../data/i18n'

interface NavigationProps {
  lang: PortfolioLang
  onLangChange: (lang: PortfolioLang) => void
}

const sections = ['home', 'about', 'events', 'projects', 'skills', 'education', 'contact'] as const

export default function Navigation({ lang, onLangChange }: NavigationProps) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('home')
  const t = portfolioTranslations[lang].nav

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)

      const sectionElements = sections.map(id => document.getElementById(id))
      const scrollPos = window.scrollY + 100

      for (let i = sectionElements.length - 1; i >= 0; i--) {
        const el = sectionElements[i]
        if (el && el.offsetTop <= scrollPos) {
          setActiveSection(sections[i])
          break
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
      setMobileOpen(false)
    }
  }

  return (
    <>
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
          <div className="flex items-center justify-between h-16">
            <motion.button
              onClick={() => scrollTo('home')}
              className="text-[#00d4ff] font-mono font-bold text-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {'<ME />'}
            </motion.button>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {sections.map((section) => (
                <button
                  key={section}
                  onClick={() => scrollTo(section)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeSection === section
                      ? 'text-[#00d4ff] bg-[#00d4ff]/10'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {t[section as keyof typeof t]}
                </button>
              ))}

              <button
                onClick={() => onLangChange(lang === 'en' ? 'ar' : 'en')}
                className="ml-3 p-2 rounded-lg text-gray-400 hover:text-[#f59e0b] hover:bg-[#f59e0b]/10 transition-all"
                title={lang === 'en' ? 'العربية' : 'English'}
              >
                <Globe className="w-4 h-4" />
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-2">
              <button
                onClick={() => onLangChange(lang === 'en' ? 'ar' : 'en')}
                className="p-2 rounded-lg text-gray-400 hover:text-[#f59e0b] transition-all"
              >
                <Globe className="w-4 h-4" />
              </button>
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="p-2 rounded-lg text-gray-400 hover:text-white transition-all"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-40 bg-[#0a0f1a]/98 backdrop-blur-xl md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex flex-col items-center justify-center h-full gap-4">
              {sections.map((section, i) => (
                <motion.button
                  key={section}
                  onClick={() => scrollTo(section)}
                  className={`text-xl font-medium transition-colors ${
                    activeSection === section ? 'text-[#00d4ff]' : 'text-gray-300'
                  }`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  {t[section as keyof typeof t]}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Globe } from 'lucide-react'
import type { PortfolioLang } from '../data/i18n'

interface NavigationProps {
  lang: PortfolioLang
  onLangChange: (lang: PortfolioLang) => void
}

const navItems = [
  { id: 'home', label: 'Home', labelAr: 'الرئيسية' },
  { id: 'about', label: 'Journey', labelAr: 'رحلتي' },
  { id: 'events', label: 'Events', labelAr: 'الفعاليات' },
  { id: 'projects', label: 'Projects', labelAr: 'المشاريع' },
  { id: 'skills', label: 'Skills', labelAr: 'المهارات' },
  { id: 'education', label: 'Education', labelAr: 'التعليم' },
  { id: 'contact', label: 'Contact', labelAr: 'تواصل' },
]

export default function Navigation({ lang, onLangChange }: NavigationProps) {
  const [scrolled, setScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState('home')

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)

      // Determine active section
      const sections = navItems.map(item => document.getElementById(item.id))
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i]
        if (section && section.getBoundingClientRect().top <= 150) {
          setActiveSection(navItems[i].id)
          break
        }
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/80 backdrop-blur-xl border-b border-gray-200 shadow-sm'
          : 'bg-transparent'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <motion.button
            onClick={() => {
              document.getElementById('home')?.scrollIntoView({ behavior: 'smooth' })
            }}
            className="text-blue-600 font-bold text-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {'<ME />'}
          </motion.button>

          {/* Nav links - desktop */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' })}
                className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                  activeSection === item.id
                    ? 'text-blue-600 bg-blue-50 font-medium'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                {lang === 'ar' ? item.labelAr : item.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => onLangChange(lang === 'en' ? 'ar' : 'en')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-200 transition-all text-sm"
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

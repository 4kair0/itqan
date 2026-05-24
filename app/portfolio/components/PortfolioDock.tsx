"use client"

import { useState, useEffect } from 'react'
import MacOSDock from '@/components/ui/mac-os-dock'
import type { PortfolioLang } from '../data/i18n'

interface PortfolioDockProps {
  lang: PortfolioLang
}

const dockSections = [
  {
    id: 'home',
    name: 'Home',
    nameAr: 'الرئيسية',
    icon: `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#0a0a0a"/><rect width="64" height="64" rx="14" fill="none" stroke="#00ff41" stroke-width="1.5" opacity="0.4"/><path d="M32 16L16 28v18a2 2 0 002 2h8v-10h12v10h8a2 2 0 002-2V28L32 16z" fill="#00ff41" opacity="0.9"/></svg>`)}`,
  },
  {
    id: 'about',
    name: 'Journey',
    nameAr: 'رحلتي',
    icon: `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#0a0a0a"/><rect width="64" height="64" rx="14" fill="none" stroke="#00d4ff" stroke-width="1.5" opacity="0.4"/><circle cx="32" cy="20" r="4" fill="#00d4ff" opacity="0.9"/><line x1="32" y1="24" x2="32" y2="48" stroke="#00d4ff" stroke-width="2" opacity="0.5" stroke-dasharray="4 3"/><circle cx="32" cy="34" r="3" fill="#00d4ff" opacity="0.7"/><circle cx="32" cy="48" r="3" fill="#00d4ff" opacity="0.9"/></svg>`)}`,
  },
  {
    id: 'events',
    name: 'Events',
    nameAr: 'الفعاليات',
    icon: `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#0a0a0a"/><rect width="64" height="64" rx="14" fill="none" stroke="#00ff41" stroke-width="1.5" opacity="0.4"/><rect x="16" y="20" width="32" height="28" rx="4" fill="#00ff41" opacity="0.15"/><rect x="16" y="20" width="32" height="28" rx="4" fill="none" stroke="#00ff41" opacity="0.8"/><rect x="16" y="20" width="32" height="8" rx="4" fill="#00ff41" opacity="0.3"/><circle cx="24" cy="17" r="2" fill="#00ff41"/><circle cx="40" cy="17" r="2" fill="#00ff41"/><rect x="21" y="33" width="6" height="4" rx="1" fill="#00ff41" opacity="0.5"/><rect x="29" y="33" width="6" height="4" rx="1" fill="#00ff41" opacity="0.5"/><rect x="37" y="33" width="6" height="4" rx="1" fill="#00ff41" opacity="0.5"/></svg>`)}`,
  },
  {
    id: 'projects',
    name: 'Projects',
    nameAr: 'المشاريع',
    icon: `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#0a0a0a"/><rect width="64" height="64" rx="14" fill="none" stroke="#00ff41" stroke-width="1.5" opacity="0.4"/><circle cx="24" cy="24" r="3" fill="#00ff41" opacity="0.9"/><circle cx="40" cy="24" r="3" fill="#00d4ff" opacity="0.9"/><circle cx="32" cy="40" r="3" fill="#00ff41" opacity="0.9"/><circle cx="20" cy="40" r="2" fill="#00d4ff" opacity="0.6"/><circle cx="44" cy="40" r="2" fill="#00d4ff" opacity="0.6"/><line x1="24" y1="24" x2="40" y2="24" stroke="#00ff41" stroke-width="1" opacity="0.4"/><line x1="24" y1="24" x2="32" y2="40" stroke="#00ff41" stroke-width="1" opacity="0.4"/><line x1="40" y1="24" x2="32" y2="40" stroke="#00d4ff" stroke-width="1" opacity="0.4"/></svg>`)}`,
  },
  {
    id: 'skills',
    name: 'Skills',
    nameAr: 'المهارات',
    icon: `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#0a0a0a"/><rect width="64" height="64" rx="14" fill="none" stroke="#00ff41" stroke-width="1.5" opacity="0.4"/><rect x="16" y="38" width="6" height="10" rx="1" fill="#00ff41" opacity="0.6"/><rect x="24" y="32" width="6" height="16" rx="1" fill="#00ff41" opacity="0.7"/><rect x="32" y="26" width="6" height="22" rx="1" fill="#00ff41" opacity="0.8"/><rect x="40" y="20" width="6" height="28" rx="1" fill="#00ff41" opacity="0.9"/></svg>`)}`,
  },
  {
    id: 'education',
    name: 'Education',
    nameAr: 'التعليم',
    icon: `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#0a0a0a"/><rect width="64" height="64" rx="14" fill="none" stroke="#00d4ff" stroke-width="1.5" opacity="0.4"/><path d="M32 18L14 28l18 10 18-10L32 18z" fill="#00d4ff" opacity="0.9"/><path d="M20 32v10c0 0 4 6 12 6s12-6 12-6V32" fill="none" stroke="#00d4ff" stroke-width="2" opacity="0.6"/><line x1="50" y1="28" x2="50" y2="44" stroke="#00d4ff" stroke-width="2" opacity="0.5"/></svg>`)}`,
  },
  {
    id: 'contact',
    name: 'Contact',
    nameAr: 'تواصل',
    icon: `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#0a0a0a"/><rect width="64" height="64" rx="14" fill="none" stroke="#00ff41" stroke-width="1.5" opacity="0.4"/><rect x="14" y="20" width="36" height="24" rx="4" fill="#00ff41" opacity="0.15"/><rect x="14" y="20" width="36" height="24" rx="4" fill="none" stroke="#00ff41" opacity="0.8"/><polyline points="14,22 32,36 50,22" fill="none" stroke="#00ff41" stroke-width="2" opacity="0.6"/></svg>`)}`,
  },
]

export default function PortfolioDock({ lang }: PortfolioDockProps) {
  const [activeSection, setActiveSection] = useState('home')
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      
      if (currentScrollY > lastScrollY && currentScrollY > 200) {
        setIsVisible(false)
      } else {
        setIsVisible(true)
      }
      setLastScrollY(currentScrollY)

      const sections = dockSections.map(s => s.id)
      const scrollPos = window.scrollY + window.innerHeight / 2

      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i])
        if (el && el.offsetTop <= scrollPos) {
          setActiveSection(sections[i])
          break
        }
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  const handleAppClick = (sectionId: string) => {
    const el = document.getElementById(sectionId)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const apps = dockSections.map(section => ({
    id: section.id,
    name: lang === 'ar' ? section.nameAr : section.name,
    icon: section.icon,
  }))

  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0'
      }`}
    >
      <MacOSDock
        apps={apps}
        onAppClick={handleAppClick}
        openApps={[activeSection]}
        className="!border-[#00ff41]/20 !shadow-[0_0_30px_rgba(0,255,65,0.1)]"
      />
    </div>
  )
}

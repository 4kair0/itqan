"use client"

import { useState, useEffect } from 'react'
import MacOSDock from '@/components/ui/mac-os-dock'
import type { PortfolioLang } from '../data/i18n'

interface PortfolioDockProps {
  lang: PortfolioLang
}

// SVG icons as data URIs for the dock (using simple, clean designs)
const dockSections = [
  {
    id: 'home',
    name: 'Home',
    nameAr: 'الرئيسية',
    icon: `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#00d4ff"/><stop offset="100%" style="stop-color:#0088cc"/></linearGradient></defs><rect width="64" height="64" rx="14" fill="url(#g1)"/><path d="M32 16L16 28v18a2 2 0 002 2h8v-10h12v10h8a2 2 0 002-2V28L32 16z" fill="white" opacity="0.95"/></svg>`)}`,
  },
  {
    id: 'about',
    name: 'Journey',
    nameAr: 'رحلتي',
    icon: `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><linearGradient id="g2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#8b5cf6"/><stop offset="100%" style="stop-color:#6d28d9"/></linearGradient></defs><rect width="64" height="64" rx="14" fill="url(#g2)"/><circle cx="32" cy="20" r="4" fill="white" opacity="0.95"/><line x1="32" y1="24" x2="32" y2="48" stroke="white" stroke-width="2" opacity="0.6" stroke-dasharray="4 3"/><circle cx="32" cy="34" r="3" fill="white" opacity="0.8"/><circle cx="32" cy="48" r="3" fill="white" opacity="0.95"/></svg>`)}`,
  },
  {
    id: 'events',
    name: 'Events',
    nameAr: 'الفعاليات',
    icon: `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><linearGradient id="g3" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#f59e0b"/><stop offset="100%" style="stop-color:#d97706"/></linearGradient></defs><rect width="64" height="64" rx="14" fill="url(#g3)"/><rect x="16" y="20" width="32" height="28" rx="4" fill="white" opacity="0.95"/><rect x="16" y="20" width="32" height="8" rx="4" fill="white"/><rect x="16" y="20" width="32" height="8" fill="rgba(0,0,0,0.15)"/><circle cx="24" cy="17" r="2" fill="white"/><circle cx="40" cy="17" r="2" fill="white"/><rect x="21" y="33" width="6" height="4" rx="1" fill="rgba(0,0,0,0.2)"/><rect x="29" y="33" width="6" height="4" rx="1" fill="rgba(0,0,0,0.2)"/><rect x="37" y="33" width="6" height="4" rx="1" fill="rgba(0,0,0,0.2)"/><rect x="21" y="40" width="6" height="4" rx="1" fill="rgba(0,0,0,0.2)"/><rect x="29" y="40" width="6" height="4" rx="1" fill="rgba(0,0,0,0.2)"/></svg>`)}`,
  },
  {
    id: 'projects',
    name: 'Projects',
    nameAr: 'المشاريع',
    icon: `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><linearGradient id="g4" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#10b981"/><stop offset="100%" style="stop-color:#059669"/></linearGradient></defs><rect width="64" height="64" rx="14" fill="url(#g4)"/><rect x="14" y="18" width="36" height="28" rx="3" fill="white" opacity="0.95"/><polyline points="22,34 28,28 34,34 42,26" fill="none" stroke="rgba(16,185,129,0.8)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><text x="18" y="42" font-size="5" fill="rgba(0,0,0,0.3)" font-family="monospace">&lt;/&gt;</text></svg>`)}`,
  },
  {
    id: 'skills',
    name: 'Skills',
    nameAr: 'المهارات',
    icon: `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><linearGradient id="g5" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#ec4899"/><stop offset="100%" style="stop-color:#be185d"/></linearGradient></defs><rect width="64" height="64" rx="14" fill="url(#g5)"/><polygon points="32,14 36,26 48,26 38,34 42,46 32,38 22,46 26,34 16,26 28,26" fill="white" opacity="0.95"/></svg>`)}`,
  },
  {
    id: 'education',
    name: 'Education',
    nameAr: 'التعليم',
    icon: `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><linearGradient id="g6" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#3b82f6"/><stop offset="100%" style="stop-color:#1d4ed8"/></linearGradient></defs><rect width="64" height="64" rx="14" fill="url(#g6)"/><path d="M32 18L14 28l18 10 18-10L32 18z" fill="white" opacity="0.95"/><path d="M20 32v10c0 0 4 6 12 6s12-6 12-6V32" fill="none" stroke="white" stroke-width="2" opacity="0.8"/><line x1="50" y1="28" x2="50" y2="44" stroke="white" stroke-width="2" opacity="0.6"/></svg>`)}`,
  },
  {
    id: 'contact',
    name: 'Contact',
    nameAr: 'تواصل',
    icon: `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><linearGradient id="g7" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#6366f1"/><stop offset="100%" style="stop-color:#4338ca"/></linearGradient></defs><rect width="64" height="64" rx="14" fill="url(#g7)"/><rect x="14" y="20" width="36" height="24" rx="4" fill="white" opacity="0.95"/><polyline points="14,22 32,36 50,22" fill="none" stroke="rgba(99,102,241,0.6)" stroke-width="2"/></svg>`)}`,
  },
]

export default function PortfolioDock({ lang }: PortfolioDockProps) {
  const [activeSection, setActiveSection] = useState('home')
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      
      // Hide dock when scrolling down quickly, show when scrolling up
      if (currentScrollY > lastScrollY && currentScrollY > 200) {
        setIsVisible(false)
      } else {
        setIsVisible(true)
      }
      setLastScrollY(currentScrollY)

      // Detect active section
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
      />
    </div>
  )
}

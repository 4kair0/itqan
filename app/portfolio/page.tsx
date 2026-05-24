"use client"

import { useState } from 'react'
import Navigation from './components/Navigation'
import Hero from './components/Hero'
import Timeline from './components/Timeline'
import EventsGrid from './components/EventsGrid'
import ProjectsSection from './components/ProjectsSection'
import CodeEditor from './components/CodeEditor'
import SkillsSection from './components/SkillsSection'
import Education from './components/Education'
import Contact from './components/Contact'
import type { PortfolioLang } from './data/i18n'

export default function PortfolioPage() {
  const [lang, setLang] = useState<PortfolioLang>('en')

  return (
    <div
      className="min-h-screen bg-[#0a0f1a] text-white font-[family-name:var(--font-inter)]"
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      <Navigation lang={lang} onLangChange={setLang} />
      <Hero lang={lang} />
      <Timeline lang={lang} />
      <EventsGrid lang={lang} />
      <ProjectsSection lang={lang} />
      <CodeEditor lang={lang} />
      <SkillsSection lang={lang} />
      <Education lang={lang} />
      <Contact lang={lang} />
    </div>
  )
}

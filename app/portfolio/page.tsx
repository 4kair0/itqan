"use client"

import { useState } from 'react'
import NeuralBackground from './components/NeuralBackground'
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
      className="min-h-screen bg-white text-gray-900 font-[family-name:var(--font-inter)]"
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      {/* Brain Neural Network Background */}
      <NeuralBackground />

      {/* Navigation */}
      <Navigation lang={lang} onLangChange={setLang} />

      {/* Sections */}
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

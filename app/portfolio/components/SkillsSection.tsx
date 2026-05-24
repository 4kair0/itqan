"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { skills, skillCategories } from '../data/skills'
import type { PortfolioLang } from '../data/i18n'
import { portfolioTranslations } from '../data/i18n'

interface SkillsSectionProps {
  lang: PortfolioLang
}

function SkillBar({ name, level, delay }: { name: string; level: number; delay: number }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })

  return (
    <div ref={ref} className="group">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm text-gray-400 font-mono">{name}</span>
        <span className="text-xs text-[#00ff41]/60 font-mono">{level}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-[#111111] overflow-hidden border border-[#00ff41]/5">
        <motion.div
          className="h-full rounded-full"
          style={{
            background: 'linear-gradient(90deg, #00ff41 0%, #00d4ff 100%)',
            boxShadow: '0 0 8px rgba(0,255,65,0.3)',
          }}
          initial={{ width: 0 }}
          animate={isInView ? { width: `${level}%` } : { width: 0 }}
          transition={{ duration: 1, delay, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  )
}

export default function SkillsSection({ lang }: SkillsSectionProps) {
  const [activeCategory, setActiveCategory] = useState<string>('frontend')
  const t = portfolioTranslations[lang].skills

  const categoryLabels: Record<string, string> = {
    frontend: t.frontend,
    backend: t.backend,
    ai: t.ai,
    tools: t.tools,
    design: t.design,
  }

  const filteredSkills = skills.filter(s => s.category === activeCategory)

  return (
    <section id="skills" className="relative py-24 md:py-32 bg-black">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-5xl font-bold text-[#00ff41] mb-4 font-mono drop-shadow-[0_0_15px_rgba(0,255,65,0.3)]">
            {t.title}
          </h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto font-mono">
            {t.subtitle}
          </p>
        </motion.div>

        {/* Category tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
          {skillCategories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-lg text-sm font-mono transition-all ${
                activeCategory === cat.id
                  ? 'bg-[#00ff41]/10 text-[#00ff41] border border-[#00ff41]/40 shadow-[0_0_10px_rgba(0,255,65,0.1)]'
                  : 'text-gray-500 border border-transparent hover:text-[#00ff41] hover:border-[#00ff41]/20'
              }`}
            >
              {categoryLabels[cat.id]}
            </button>
          ))}
        </div>

        {/* Skills grid */}
        <motion.div
          key={activeCategory}
          className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-5 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {filteredSkills.map((skill, i) => (
            <SkillBar
              key={skill.name}
              name={skill.name}
              level={skill.level}
              delay={i * 0.05}
            />
          ))}
        </motion.div>

        {/* Overall stats */}
        <motion.div
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          {[
            { label: 'Technologies', value: '30+' },
            { label: 'Projects', value: '15+' },
            { label: 'Years Coding', value: '4+' },
            { label: 'Events Managed', value: '10+' },
          ].map(stat => (
            <div
              key={stat.label}
              className="text-center p-4 rounded-lg border border-[#00ff41]/10 bg-black/40"
            >
              <div className="text-2xl md:text-3xl font-bold font-mono text-[#00ff41] drop-shadow-[0_0_8px_rgba(0,255,65,0.3)]">
                {stat.value}
              </div>
              <div className="text-xs text-gray-600 mt-1 font-mono">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

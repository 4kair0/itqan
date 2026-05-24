"use client"

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ExternalLink, Github, ChevronRight } from 'lucide-react'
import { projects, technologies } from '../data/projects'
import type { PortfolioLang } from '../data/i18n'
import { portfolioTranslations } from '../data/i18n'

interface ProjectsSectionProps {
  lang: PortfolioLang
}

function TechGraph({ activeTech }: { activeTech: string | null }) {
  const nodes = useMemo(() => {
    return technologies.map((tech, i) => {
      const angle = (i / technologies.length) * Math.PI * 2
      const radius = 120 + Math.random() * 60
      return {
        id: tech,
        x: 200 + Math.cos(angle) * radius,
        y: 200 + Math.sin(angle) * radius,
      }
    })
  }, [])

  const edges = useMemo(() => {
    const result: { from: string; to: string }[] = []
    projects.forEach(project => {
      for (let i = 0; i < project.technologies.length; i++) {
        for (let j = i + 1; j < project.technologies.length; j++) {
          const edge = { from: project.technologies[i], to: project.technologies[j] }
          if (!result.find(e => (e.from === edge.from && e.to === edge.to) || (e.from === edge.to && e.to === edge.from))) {
            result.push(edge)
          }
        }
      }
    })
    return result
  }, [])

  return (
    <div className="hidden lg:block w-full max-w-[420px] aspect-square relative">
      <svg width="400" height="400" viewBox="0 0 400 400" className="w-full h-full">
        {/* Edges */}
        {edges.map((edge, i) => {
          const from = nodes.find(n => n.id === edge.from)
          const to = nodes.find(n => n.id === edge.to)
          if (!from || !to) return null
          const isActive = activeTech === edge.from || activeTech === edge.to
          return (
            <line
              key={i}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke={isActive ? '#3b82f6' : '#e5e7eb'}
              strokeWidth={isActive ? 1.5 : 0.5}
              opacity={isActive ? 0.9 : 0.5}
            />
          )
        })}
        {/* Nodes */}
        {nodes.map(node => {
          const isActive = activeTech === node.id
          return (
            <g key={node.id}>
              {isActive && (
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={12}
                  fill="none"
                  stroke="#8b5cf6"
                  strokeWidth={0.5}
                  opacity={0.4}
                />
              )}
              <circle
                cx={node.x}
                cy={node.y}
                r={isActive ? 6 : 3}
                fill={isActive ? '#3b82f6' : '#d1d5db'}
                stroke={isActive ? '#3b82f6' : 'transparent'}
                strokeWidth={2}
                opacity={isActive ? 1 : 0.7}
              />
              {isActive && (
                <text
                  x={node.x}
                  y={node.y - 14}
                  textAnchor="middle"
                  fill="#3b82f6"
                  fontSize="10"
                  fontFamily="system-ui"
                >
                  {node.id}
                </text>
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}

export default function ProjectsSection({ lang }: ProjectsSectionProps) {
  const [filter, setFilter] = useState<'all' | 'web' | 'ai'>('all')
  const [hoveredTech, setHoveredTech] = useState<string | null>(null)
  const [expandedProject, setExpandedProject] = useState<string | null>(null)
  const t = portfolioTranslations[lang].projects

  const filtered = projects.filter(p => filter === 'all' || p.category === filter)

  return (
    <section id="projects" className="relative py-24 md:py-32 bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            {t.title}
          </h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            {t.subtitle}
          </p>
        </motion.div>

        {/* Filter */}
        <div className="flex items-center justify-center gap-2 mb-12">
          {(['all', 'web', 'ai'] as const).map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-lg text-sm transition-all ${
                filter === cat
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                  : 'text-gray-500 hover:text-blue-600 border border-gray-200 hover:border-blue-300 hover:bg-blue-50'
              }`}
            >
              {cat === 'all' ? t.filterAll : cat === 'web' ? t.filterWeb : t.filterAI}
            </button>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Graph */}
          <TechGraph activeTech={hoveredTech} />

          {/* Cards */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-5">
            <AnimatePresence mode="popLayout">
              {filtered.map(project => (
                <motion.div
                  key={project.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="rounded-xl border border-gray-200 bg-white overflow-hidden hover:border-blue-300 hover:shadow-lg hover:shadow-blue-50 transition-all duration-300 group"
                  onMouseEnter={() => setHoveredTech(project.technologies[0])}
                  onMouseLeave={() => setHoveredTech(null)}
                >
                  {/* Image */}
                  <div className="h-40 bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center relative overflow-hidden">
                    <div
                      className="absolute inset-0 opacity-5"
                      style={{
                        backgroundImage: 'linear-gradient(rgba(59,130,246,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.5) 1px, transparent 1px)',
                        backgroundSize: '30px 30px',
                      }}
                    />
                    <div className="text-3xl opacity-30">
                      {project.category === 'web' ? '🌐' : '🤖'}
                    </div>
                    <div className="absolute top-3 right-3 px-2 py-1 rounded-full text-xs bg-white/90 border border-gray-200 text-blue-600 font-medium shadow-sm">
                      {project.category.toUpperCase()}
                    </div>
                  </div>

                  <div className="p-5">
                    <h3 className="text-gray-900 font-semibold text-lg mb-2 group-hover:text-blue-600 transition-colors">
                      {lang === 'ar' ? project.titleAr : project.title}
                    </h3>
                    <p className="text-gray-500 text-sm mb-3 line-clamp-2">
                      {lang === 'ar' ? project.descriptionAr : project.description}
                    </p>

                    {/* Tech tags */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {project.technologies.slice(0, 4).map(tech => (
                        <span
                          key={tech}
                          className="px-2 py-0.5 rounded-full text-xs bg-blue-50 text-blue-600 border border-blue-100"
                          onMouseEnter={() => setHoveredTech(tech)}
                        >
                          {tech}
                        </span>
                      ))}
                      {project.technologies.length > 4 && (
                        <span className="px-2 py-0.5 rounded-full text-xs text-gray-400">
                          +{project.technologies.length - 4}
                        </span>
                      )}
                    </div>

                    {/* Expand for challenges */}
                    <button
                      onClick={() => setExpandedProject(expandedProject === project.id ? null : project.id)}
                      className="text-sm text-purple-500 hover:text-purple-700 flex items-center gap-1 transition-colors mb-3"
                    >
                      <ChevronRight className={`w-3 h-3 transition-transform ${expandedProject === project.id ? 'rotate-90' : ''}`} />
                      Challenges & Solutions
                    </button>

                    <AnimatePresence>
                      {expandedProject === project.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden mb-3"
                        >
                          <div className="space-y-2 text-xs">
                            {(lang === 'ar' ? project.challengesAr : project.challenges).map((challenge, i) => (
                              <div key={i} className="flex gap-2">
                                <span className="text-purple-500 mt-0.5">▸</span>
                                <span className="text-gray-600">{challenge}</span>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Links */}
                    <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                      <a href={project.github} className="text-gray-400 hover:text-blue-600 transition-colors">
                        <Github className="w-4 h-4" />
                      </a>
                      {project.live && (
                        <a href={project.live} className="text-gray-400 hover:text-purple-600 transition-colors">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}

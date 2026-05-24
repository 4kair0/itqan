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
              stroke={isActive ? '#00ff41' : '#1a1a1a'}
              strokeWidth={isActive ? 1.5 : 0.5}
              opacity={isActive ? 0.8 : 0.4}
              style={isActive ? { filter: 'drop-shadow(0 0 4px rgba(0,255,65,0.5))' } : undefined}
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
                  stroke="#00ff41"
                  strokeWidth={0.5}
                  opacity={0.3}
                />
              )}
              <circle
                cx={node.x}
                cy={node.y}
                r={isActive ? 6 : 3}
                fill={isActive ? '#00ff41' : '#333333'}
                stroke={isActive ? '#00ff41' : 'transparent'}
                strokeWidth={2}
                opacity={isActive ? 1 : 0.6}
                style={isActive ? { filter: 'drop-shadow(0 0 6px rgba(0,255,65,0.8))' } : undefined}
              />
              {isActive && (
                <text
                  x={node.x}
                  y={node.y - 14}
                  textAnchor="middle"
                  fill="#00ff41"
                  fontSize="10"
                  fontFamily="monospace"
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
    <section id="projects" className="relative py-24 md:py-32 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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

        {/* Filter */}
        <div className="flex items-center justify-center gap-2 mb-12">
          {(['all', 'web', 'ai'] as const).map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-mono transition-all ${
                filter === cat
                  ? 'bg-[#00ff41]/10 text-[#00ff41] border border-[#00ff41]/40 shadow-[0_0_10px_rgba(0,255,65,0.1)]'
                  : 'text-gray-500 hover:text-[#00ff41] border border-transparent hover:border-[#00ff41]/20'
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
                  className="rounded-lg border border-[#00ff41]/10 bg-black/60 backdrop-blur-sm overflow-hidden hover:border-[#00ff41]/30 hover:shadow-[0_0_20px_rgba(0,255,65,0.05)] transition-all duration-300 group"
                  onMouseEnter={() => setHoveredTech(project.technologies[0])}
                  onMouseLeave={() => setHoveredTech(null)}
                >
                  {/* Image */}
                  <div className="h-40 bg-gradient-to-br from-[#0a0a0a] to-[#111111] flex items-center justify-center relative overflow-hidden">
                    <div
                      className="absolute inset-0 opacity-5"
                      style={{
                        backgroundImage: 'linear-gradient(rgba(0,255,65,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,65,0.5) 1px, transparent 1px)',
                        backgroundSize: '30px 30px',
                      }}
                    />
                    <div className="text-3xl opacity-20">
                      {project.category === 'web' ? '🌐' : '🤖'}
                    </div>
                    <div className="absolute top-3 right-3 px-2 py-1 rounded text-xs font-mono bg-black/80 border border-[#00ff41]/20 text-[#00ff41]">
                      {project.category.toUpperCase()}
                    </div>
                  </div>

                  <div className="p-5">
                    <h3 className="text-white font-semibold text-lg mb-2 font-mono group-hover:text-[#00ff41] transition-colors">
                      {lang === 'ar' ? project.titleAr : project.title}
                    </h3>
                    <p className="text-gray-500 text-sm mb-3 font-mono line-clamp-2">
                      {lang === 'ar' ? project.descriptionAr : project.description}
                    </p>

                    {/* Tech tags */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {project.technologies.slice(0, 4).map(tech => (
                        <span
                          key={tech}
                          className="px-2 py-0.5 rounded text-xs font-mono bg-[#00ff41]/5 text-[#00ff41]/70 border border-[#00ff41]/10"
                          onMouseEnter={() => setHoveredTech(tech)}
                        >
                          {tech}
                        </span>
                      ))}
                      {project.technologies.length > 4 && (
                        <span className="px-2 py-0.5 rounded text-xs font-mono text-gray-600">
                          +{project.technologies.length - 4}
                        </span>
                      )}
                    </div>

                    {/* Expand for challenges */}
                    <button
                      onClick={() => setExpandedProject(expandedProject === project.id ? null : project.id)}
                      className="text-sm text-[#00d4ff]/70 hover:text-[#00d4ff] flex items-center gap-1 transition-colors mb-3 font-mono"
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
                          <div className="space-y-2 text-xs font-mono">
                            {(lang === 'ar' ? project.challengesAr : project.challenges).map((challenge, i) => (
                              <div key={i} className="flex gap-2">
                                <span className="text-red-400 shrink-0">▸</span>
                                <span className="text-gray-500">{challenge}</span>
                              </div>
                            ))}
                            {(lang === 'ar' ? project.solutionsAr : project.solutions).map((solution, i) => (
                              <div key={i} className="flex gap-2">
                                <span className="text-[#00ff41] shrink-0">✓</span>
                                <span className="text-gray-400">{solution}</span>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Links */}
                    <div className="flex items-center gap-3">
                      {project.liveUrl && (
                        <a href={project.liveUrl} className="flex items-center gap-1 text-xs font-mono text-gray-500 hover:text-[#00ff41] transition-colors">
                          <ExternalLink className="w-3 h-3" />
                          {t.liveDemo}
                        </a>
                      )}
                      {project.githubUrl && (
                        <a href={project.githubUrl} className="flex items-center gap-1 text-xs font-mono text-gray-500 hover:text-white transition-colors">
                          <Github className="w-3 h-3" />
                          {t.sourceCode}
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

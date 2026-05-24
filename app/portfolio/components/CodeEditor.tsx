"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { FileJson, FileCode, FileText, Terminal } from 'lucide-react'
import type { PortfolioLang } from '../data/i18n'
import { portfolioTranslations } from '../data/i18n'

interface CodeEditorProps {
  lang: PortfolioLang
}

const tabs = [
  { id: 'about', icon: FileJson, color: '#00ff41' },
  { id: 'skills', icon: FileCode, color: '#00d4ff' },
  { id: 'system', icon: FileText, color: '#00ff41' },
  { id: 'challenges', icon: Terminal, color: '#8b5cf6' },
] as const

const codeContent = {
  about: `{
  "name": "Mazen Elsaka",
  "title": "Web Developer & AI Engineer",
  "location": "Egypt",
  "focus": "Computer Vision",
  "languages": ["Arabic", "English"],
  "interests": [
    "Building intelligent web apps",
    "Computer Vision research",
    "Open source contribution",
    "Teaching & mentoring"
  ],
  "current_role": "Full-Stack Developer @ NASS Academy",
  "philosophy": "Code with purpose, build with passion"
}`,
  skills: `interface Developer {
  frontend: Framework[];
  backend: Technology[];
  ai: MLTool[];
  soft: HumanSkill[];
}

const mazen: Developer = {
  frontend: [
    { name: "React/Next.js", years: 4, love: "∞" },
    { name: "TypeScript", years: 3, love: "high" },
    { name: "Tailwind + Framer Motion", years: 3 },
  ],
  backend: [
    { name: "Node.js", years: 4 },
    { name: "Python/FastAPI", years: 2 },
    { name: "PostgreSQL + Supabase", years: 3 },
  ],
  ai: [
    { name: "TensorFlow/PyTorch", years: 2 },
    { name: "OpenCV", years: 1, growing: true },
    { name: "Hugging Face", years: 1 },
  ],
  soft: [
    "Event Management",
    "Team Leadership",
    "Technical Writing",
    "Problem Solving",
  ],
};`,
  system: `# SYSTEM INTEGRITY REPORT
# Generated: 2026-05-24
# Author: Mazen Elsaka

## Status: OPERATIONAL ✓

### Core Systems
- Frontend Pipeline .......... [████████████] 100%
- Backend Services ........... [██████████░░] 88%
- AI/ML Models ............... [████████░░░░] 72%
- Computer Vision Module ..... [██████░░░░░░] 68% (GROWING)
- DevOps & Deployment ........ [█████████░░░] 82%

### Analysis
> All systems nominal. Computer vision module
> actively expanding. Expected to reach 90%
> proficiency by Q4 2026.

### Recommendations
1. Continue OpenCV deep-dive
2. Build 3 more CV projects
3. Contribute to open-source CV libraries
4. Publish research findings`,
  challenges: `[2024-01-15] CHALLENGE: Real-time audio in browser
  → SOLUTION: WebRTC + custom audio worklets
  → RESULT: <50ms latency achieved

[2024-03-22] CHALLENGE: Arabic text NLP accuracy
  → SOLUTION: Fine-tuned AraBERT + custom tokenizer
  → RESULT: 94% accuracy on sentiment analysis

[2024-06-10] CHALLENGE: 500+ concurrent users
  → SOLUTION: Redis caching + connection pooling
  → RESULT: p99 latency < 200ms

[2024-09-05] CHALLENGE: Complex RBAC system
  → SOLUTION: JWT middleware + role hierarchy
  → RESULT: Zero unauthorized access incidents

[2025-01-20] CHALLENGE: Image segmentation speed
  → SOLUTION: ONNX Runtime + model quantization
  → RESULT: 30fps on consumer hardware

[2025-04-12] CHALLENGE: Full platform rebuild
  → SOLUTION: Next.js 16 + Supabase + edge functions
  → RESULT: 98 Lighthouse score, 2s FCP`,
}

export default function CodeEditor({ lang }: CodeEditorProps) {
  const [activeTab, setActiveTab] = useState<keyof typeof codeContent>('about')
  const t = portfolioTranslations[lang].codeEditor

  return (
    <section className="relative py-24 md:py-32 bg-black">
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
        </motion.div>

        {/* Editor */}
        <motion.div
          className="rounded-lg border border-[#00ff41]/20 bg-[#050505] overflow-hidden shadow-[0_0_40px_rgba(0,255,65,0.05)]"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Title bar */}
          <div className="flex items-center gap-2 px-4 py-3 bg-[#0a0a0a] border-b border-[#00ff41]/10">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
              <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
              <div className="w-3 h-3 rounded-full bg-[#28ca42]" />
            </div>
            <span className="text-[#00ff41]/50 text-xs font-mono ml-3">neural-portfolio // mazen-elsaka</span>
          </div>

          {/* Tabs */}
          <div className="flex items-center border-b border-[#00ff41]/10 bg-[#080808] overflow-x-auto">
            {tabs.map(tab => {
              const Icon = tab.icon
              const tabKey = tab.id as keyof typeof codeContent
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tabKey)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-xs font-mono border-r border-[#00ff41]/5 transition-all whitespace-nowrap ${
                    activeTab === tabKey
                      ? 'bg-[#050505] text-[#00ff41] border-t-2'
                      : 'text-gray-600 hover:text-gray-400 hover:bg-[#111111]'
                  }`}
                  style={{ borderTopColor: activeTab === tabKey ? tab.color : 'transparent' }}
                >
                  <Icon className="w-3.5 h-3.5" style={{ color: tab.color }} />
                  {t.tabs[tab.id as keyof typeof t.tabs]}
                </button>
              )
            })}
          </div>

          {/* Content */}
          <div className="flex">
            {/* Line numbers */}
            <div className="hidden sm:flex flex-col items-end py-4 px-3 bg-[#050505] border-r border-[#00ff41]/5 select-none">
              {codeContent[activeTab].split('\n').map((_, i) => (
                <span key={i} className="text-xs font-mono text-[#00ff41]/20 leading-6">
                  {i + 1}
                </span>
              ))}
            </div>

            {/* Code */}
            <div className="flex-1 p-4 overflow-x-auto">
              <pre className="text-sm font-mono leading-6 text-[#00ff41]/80">
                <code>{codeContent[activeTab]}</code>
              </pre>
            </div>
          </div>

          {/* Status bar */}
          <div className="flex items-center justify-between px-4 py-1.5 bg-[#0a0a0a] border-t border-[#00ff41]/10 text-xs font-mono text-gray-600">
            <div className="flex items-center gap-3">
              <span className="text-[#00ff41]">●</span>
              <span>UTF-8</span>
              <span>LF</span>
            </div>
            <div className="flex items-center gap-3">
              <span>{activeTab === 'about' ? 'JSON' : activeTab === 'skills' ? 'TypeScript' : activeTab === 'system' ? 'Markdown' : 'Log'}</span>
              <span>Ln {codeContent[activeTab].split('\n').length}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

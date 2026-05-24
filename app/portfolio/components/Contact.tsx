"use client"

import { motion } from 'framer-motion'
import { Mail, Github, Linkedin, Send, ArrowUp } from 'lucide-react'
import type { PortfolioLang } from '../data/i18n'
import { portfolioTranslations } from '../data/i18n'

interface ContactProps {
  lang: PortfolioLang
}

export default function Contact({ lang }: ContactProps) {
  const t = portfolioTranslations[lang].contact

  return (
    <section id="contact" className="relative py-24 md:py-32 bg-[#0a0f1a]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 font-mono">
            {t.title}
          </h2>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            {t.subtitle}
          </p>
        </motion.div>

        <motion.div
          className="max-w-xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          {/* Contact form */}
          <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label className="block text-sm text-gray-400 mb-2 font-mono">{t.name}</label>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-xl bg-[#111827] border border-white/10 text-white placeholder-gray-600 focus:border-[#00d4ff]/50 focus:outline-none focus:ring-1 focus:ring-[#00d4ff]/20 transition-all"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2 font-mono">{t.email}</label>
              <input
                type="email"
                className="w-full px-4 py-3 rounded-xl bg-[#111827] border border-white/10 text-white placeholder-gray-600 focus:border-[#00d4ff]/50 focus:outline-none focus:ring-1 focus:ring-[#00d4ff]/20 transition-all"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2 font-mono">{t.message}</label>
              <textarea
                rows={5}
                className="w-full px-4 py-3 rounded-xl bg-[#111827] border border-white/10 text-white placeholder-gray-600 focus:border-[#00d4ff]/50 focus:outline-none focus:ring-1 focus:ring-[#00d4ff]/20 transition-all resize-none"
                placeholder="Your message..."
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-[#00d4ff] text-[#0a0f1a] font-bold hover:bg-[#00d4ff]/90 transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,212,255,0.3)] flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              {t.send}
            </button>
          </form>

          {/* Social links */}
          <div className="mt-10 flex items-center justify-center gap-4">
            {[
              { icon: Github, href: '#', label: 'GitHub' },
              { icon: Linkedin, href: '#', label: 'LinkedIn' },
              { icon: Mail, href: 'mailto:mazen@example.com', label: 'Email' },
            ].map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-xl border border-white/10 text-gray-400 hover:text-[#00d4ff] hover:border-[#00d4ff]/30 hover:bg-[#00d4ff]/5 transition-all duration-300"
                aria-label={label}
              >
                <Icon className="w-5 h-5" />
              </a>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="mt-20 border-t border-white/5 pt-8 text-center">
        <p className="text-gray-600 text-sm font-mono">
          © {new Date().getFullYear()} Mazen Elsaka. Built with Next.js + Framer Motion
        </p>
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="mt-4 p-2 rounded-lg text-gray-500 hover:text-[#00d4ff] hover:bg-[#00d4ff]/5 transition-all inline-flex"
          aria-label="Back to top"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      </div>
    </section>
  )
}

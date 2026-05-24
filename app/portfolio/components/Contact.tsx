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
    <section id="contact" className="relative py-24 md:py-32 bg-black">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
              <label className="block text-sm text-gray-500 mb-2 font-mono">{t.name}</label>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-lg bg-[#0a0a0a] border border-[#00ff41]/15 text-[#00ff41] placeholder-gray-700 focus:border-[#00ff41]/50 focus:outline-none focus:ring-1 focus:ring-[#00ff41]/20 focus:shadow-[0_0_15px_rgba(0,255,65,0.05)] transition-all font-mono"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-2 font-mono">{t.email}</label>
              <input
                type="email"
                className="w-full px-4 py-3 rounded-lg bg-[#0a0a0a] border border-[#00ff41]/15 text-[#00ff41] placeholder-gray-700 focus:border-[#00ff41]/50 focus:outline-none focus:ring-1 focus:ring-[#00ff41]/20 focus:shadow-[0_0_15px_rgba(0,255,65,0.05)] transition-all font-mono"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-2 font-mono">{t.message}</label>
              <textarea
                rows={5}
                className="w-full px-4 py-3 rounded-lg bg-[#0a0a0a] border border-[#00ff41]/15 text-[#00ff41] placeholder-gray-700 focus:border-[#00ff41]/50 focus:outline-none focus:ring-1 focus:ring-[#00ff41]/20 focus:shadow-[0_0_15px_rgba(0,255,65,0.05)] transition-all resize-none font-mono"
                placeholder="Your message..."
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 rounded-lg bg-[#00ff41]/10 text-[#00ff41] border border-[#00ff41]/40 font-bold font-mono hover:bg-[#00ff41]/20 hover:border-[#00ff41] transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,255,65,0.15)] flex items-center justify-center gap-2"
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
                className="p-3 rounded-lg border border-[#00ff41]/20 text-gray-500 hover:text-[#00ff41] hover:border-[#00ff41]/50 hover:bg-[#00ff41]/5 hover:shadow-[0_0_15px_rgba(0,255,65,0.1)] transition-all duration-300"
                aria-label={label}
              >
                <Icon className="w-5 h-5" />
              </a>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="mt-20 border-t border-[#00ff41]/10 pt-8 text-center">
        <p className="text-gray-700 text-sm font-mono">
          © {new Date().getFullYear()} Mazen Elsaka // neural.portfolio v2.0
        </p>
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="mt-4 p-2 rounded-lg text-gray-600 hover:text-[#00ff41] hover:bg-[#00ff41]/5 transition-all inline-flex"
          aria-label="Back to top"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      </div>
    </section>
  )
}

"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, MapPin, X, Users } from 'lucide-react'
import { events } from '../data/events'
import type { PortfolioLang } from '../data/i18n'
import { portfolioTranslations } from '../data/i18n'
import type { Event } from '../data/events'

interface EventsGridProps {
  lang: PortfolioLang
}

function EventCard({ event, lang, onClick }: { event: Event; lang: PortfolioLang; onClick: () => void }) {
  return (
    <motion.div
      className="group relative rounded-lg overflow-hidden border border-[#00ff41]/10 bg-black/60 backdrop-blur-sm cursor-pointer hover:border-[#00ff41]/40 hover:shadow-[0_0_25px_rgba(0,255,65,0.08)] transition-all duration-300"
      whileHover={{ scale: 1.02, y: -5 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      layout
    >
      {/* Image placeholder */}
      <div className="relative h-48 bg-gradient-to-br from-[#0a0a0a] to-[#111111] overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-4xl opacity-30">📸</div>
        </div>
        {/* Data grid overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'linear-gradient(rgba(0,255,65,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,65,0.3) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
        {/* Date badge */}
        <div className="absolute top-3 right-3 px-3 py-1 rounded bg-black/80 backdrop-blur-sm border border-[#00ff41]/20 text-xs text-[#00ff41] font-mono">
          {event.date}
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-white font-semibold text-lg mb-2 font-mono group-hover:text-[#00ff41] transition-colors">
          {lang === 'ar' ? event.titleAr : event.title}
        </h3>
        <p className="text-gray-500 text-sm mb-3 line-clamp-2 font-mono">
          {lang === 'ar' ? event.descriptionAr : event.description}
        </p>
        <div className="flex items-center gap-3 text-xs text-gray-600 font-mono">
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3 text-[#00ff41]/60" />
            {lang === 'ar' ? event.locationAr : event.location}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-[#00d4ff]/60" />
            {event.date}
          </span>
        </div>
      </div>
    </motion.div>
  )
}

function EventModal({ event, lang, onClose }: { event: Event; lang: PortfolioLang; onClose: () => void }) {
  const t = portfolioTranslations[lang].events

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-lg bg-[#0a0a0a] border border-[#00ff41]/20 p-6 md:p-8 shadow-[0_0_40px_rgba(0,255,65,0.1)]"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg text-gray-500 hover:text-[#00ff41] hover:bg-[#00ff41]/10 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Image placeholder */}
        <div className="w-full h-56 rounded-lg bg-gradient-to-br from-[#111111] to-black mb-6 flex items-center justify-center border border-[#00ff41]/10">
          <span className="text-5xl opacity-30">📸</span>
        </div>

        <h2 className="text-2xl font-bold text-[#00ff41] mb-2 font-mono">
          {lang === 'ar' ? event.titleAr : event.title}
        </h2>

        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400 mb-4 font-mono">
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4 text-[#00d4ff]" />
            {event.date}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="w-4 h-4 text-[#00ff41]" />
            {lang === 'ar' ? event.locationAr : event.location}
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-4 h-4 text-[#8b5cf6]" />
            {lang === 'ar' ? event.roleAr : event.role}
          </span>
        </div>

        <p className="text-gray-400 leading-relaxed mb-4 font-mono text-sm">
          {lang === 'ar' ? event.detailsAr : event.details}
        </p>

        {event.impact && (
          <div className="px-4 py-3 rounded-lg bg-[#00ff41]/5 border border-[#00ff41]/20">
            <p className="text-[#00ff41] text-sm font-mono">
              {lang === 'ar' ? event.impactAr : event.impact}
            </p>
          </div>
        )}

        <button
          onClick={onClose}
          className="mt-6 w-full py-3 rounded-lg bg-[#00ff41]/10 border border-[#00ff41]/30 text-[#00ff41] hover:bg-[#00ff41]/20 transition-all font-mono"
        >
          {t.close}
        </button>
      </motion.div>
    </motion.div>
  )
}

export default function EventsGrid({ lang }: EventsGridProps) {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const t = portfolioTranslations[lang].events

  return (
    <section id="events" className="relative py-24 md:py-32 bg-black">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-5xl font-bold text-[#00ff41] mb-4 font-mono drop-shadow-[0_0_15px_rgba(0,255,65,0.3)]">
            {t.title}
          </h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto font-mono">
            {t.subtitle}
          </p>
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded border border-[#00d4ff]/20 bg-[#00d4ff]/5">
            <span className="w-2 h-2 rounded-full bg-[#00d4ff] animate-pulse" />
            <span className="text-[#00d4ff] text-sm font-mono">NASS Academy</span>
          </div>
        </motion.div>

        {/* Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.1 },
            },
          }}
        >
          {events.map((event) => (
            <motion.div
              key={event.id}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <EventCard event={event} lang={lang} onClick={() => setSelectedEvent(event)} />
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selectedEvent && (
          <EventModal event={selectedEvent} lang={lang} onClose={() => setSelectedEvent(null)} />
        )}
      </AnimatePresence>
    </section>
  )
}

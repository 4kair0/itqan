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
      className="group relative rounded-2xl overflow-hidden border border-white/5 bg-[#111827]/50 backdrop-blur-sm cursor-pointer hover:border-[#f59e0b]/30 transition-all duration-300"
      whileHover={{ scale: 1.02, y: -5 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      layout
    >
      {/* Image placeholder */}
      <div className="relative h-48 bg-gradient-to-br from-[#1f2937] to-[#111827] overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-4xl opacity-30">📸</div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-transparent to-transparent" />
        {/* Date badge */}
        <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-[#0a0f1a]/80 backdrop-blur-sm border border-white/10 text-xs text-gray-300 font-mono">
          {event.date}
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-white font-semibold text-lg mb-2 group-hover:text-[#f59e0b] transition-colors">
          {lang === 'ar' ? event.titleAr : event.title}
        </h3>
        <p className="text-gray-400 text-sm mb-3 line-clamp-2">
          {lang === 'ar' ? event.descriptionAr : event.description}
        </p>
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {lang === 'ar' ? event.locationAr : event.location}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
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
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl bg-[#111827] border border-white/10 p-6 md:p-8"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Image placeholder */}
        <div className="w-full h-56 rounded-xl bg-gradient-to-br from-[#1f2937] to-[#0a0f1a] mb-6 flex items-center justify-center">
          <span className="text-5xl opacity-30">📸</span>
        </div>

        <h2 className="text-2xl font-bold text-white mb-2">
          {lang === 'ar' ? event.titleAr : event.title}
        </h2>

        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400 mb-4">
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4 text-[#00d4ff]" />
            {event.date}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="w-4 h-4 text-[#f59e0b]" />
            {lang === 'ar' ? event.locationAr : event.location}
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-4 h-4 text-[#8b5cf6]" />
            {lang === 'ar' ? event.roleAr : event.role}
          </span>
        </div>

        <p className="text-gray-300 leading-relaxed mb-4">
          {lang === 'ar' ? event.detailsAr : event.details}
        </p>

        {event.impact && (
          <div className="px-4 py-3 rounded-xl bg-[#f59e0b]/5 border border-[#f59e0b]/20">
            <p className="text-[#f59e0b] text-sm font-medium">
              {lang === 'ar' ? event.impactAr : event.impact}
            </p>
          </div>
        )}

        <button
          onClick={onClose}
          className="mt-6 w-full py-3 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 transition-all font-medium"
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
    <section id="events" className="relative py-24 md:py-32 bg-[#0d1117]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 font-mono">
            {t.title}
          </h2>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            {t.subtitle}
          </p>
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#f59e0b]/20 bg-[#f59e0b]/5">
            <span className="text-[#f59e0b] text-sm font-medium">NASS Academy</span>
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

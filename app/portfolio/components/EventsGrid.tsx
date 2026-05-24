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
      className="group relative rounded-xl overflow-hidden border border-gray-200 bg-white cursor-pointer hover:border-blue-300 hover:shadow-xl hover:shadow-blue-50 transition-all duration-300"
      whileHover={{ scale: 1.02, y: -5 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      layout
    >
      {/* Image placeholder */}
      <div className="relative h-48 bg-gradient-to-br from-blue-50 to-purple-50 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-4xl opacity-40">📸</div>
        </div>
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: 'linear-gradient(rgba(59,130,246,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.5) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        />
        {/* Date badge */}
        <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm border border-gray-200 text-xs text-blue-600 font-medium shadow-sm">
          {event.date}
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-gray-900 font-semibold text-lg mb-2 group-hover:text-blue-600 transition-colors">
          {lang === 'ar' ? event.titleAr : event.title}
        </h3>
        <p className="text-gray-500 text-sm mb-3 line-clamp-2">
          {lang === 'ar' ? event.descriptionAr : event.description}
        </p>
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3 text-blue-500" />
            {lang === 'ar' ? event.locationAr : event.location}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-purple-500" />
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
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl bg-white border border-gray-200 p-6 md:p-8 shadow-2xl"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Image placeholder */}
        <div className="w-full h-56 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 mb-6 flex items-center justify-center border border-gray-100">
          <span className="text-5xl opacity-40">📸</span>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {lang === 'ar' ? event.titleAr : event.title}
        </h2>

        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-4">
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4 text-blue-500" />
            {event.date}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="w-4 h-4 text-purple-500" />
            {lang === 'ar' ? event.locationAr : event.location}
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-4 h-4 text-blue-500" />
            {lang === 'ar' ? event.roleAr : event.role}
          </span>
        </div>

        <p className="text-gray-600 leading-relaxed mb-4 text-sm">
          {lang === 'ar' ? event.detailsAr : event.details}
        </p>

        {event.impact && (
          <div className="px-4 py-3 rounded-lg bg-blue-50 border border-blue-200">
            <p className="text-blue-700 text-sm">
              {lang === 'ar' ? event.impactAr : event.impact}
            </p>
          </div>
        )}

        <button
          onClick={onClose}
          className="mt-6 w-full py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-all shadow-sm"
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
    <section id="events" className="relative py-24 md:py-32 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            {t.title}
          </h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            {t.subtitle}
          </p>
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-200 bg-blue-50">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-blue-700 text-sm font-medium">NASS Academy</span>
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

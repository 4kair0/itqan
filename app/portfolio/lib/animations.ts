import type { Variants } from 'framer-motion'

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
}

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.5 },
  },
}

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring', stiffness: 200, damping: 20 },
  },
}

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: 'spring', stiffness: 100, damping: 20 },
  },
}

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: 'spring', stiffness: 100, damping: 20 },
  },
}

export const cardHover = {
  rest: { scale: 1, boxShadow: '0 0 0 rgba(0, 212, 255, 0)' },
  hover: {
    scale: 1.02,
    boxShadow: '0 0 30px rgba(0, 212, 255, 0.15)',
    transition: { type: 'spring', stiffness: 300, damping: 20 },
  },
}

export const glowPulse: Variants = {
  animate: {
    boxShadow: [
      '0 0 20px rgba(0, 212, 255, 0.1)',
      '0 0 40px rgba(0, 212, 255, 0.2)',
      '0 0 20px rgba(0, 212, 255, 0.1)',
    ],
    transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
  },
}

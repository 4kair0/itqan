"use client"

import { useEffect, useRef } from 'react'

interface Node {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  opacity: number
  pulse: number
  pulseSpeed: number
  color: 'blue' | 'purple'
}

export default function NeuralBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)
  const nodesRef = useRef<Node[]>([])
  const mouseRef = useRef({ x: -1000, y: -1000 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resize()
    window.addEventListener('resize', resize)

    // Initialize nodes - brain-like distribution
    const nodeCount = Math.min(90, Math.floor((window.innerWidth * window.innerHeight) / 12000))
    nodesRef.current = Array.from({ length: nodeCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      radius: Math.random() * 2.5 + 1,
      opacity: Math.random() * 0.4 + 0.2,
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: Math.random() * 0.015 + 0.008,
      color: Math.random() > 0.5 ? 'blue' : 'purple',
    }))

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }

    const handleMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 }
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseleave', handleMouseLeave)

    const connectionDistance = 160
    const mouseRadius = 180

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const nodes = nodesRef.current

      // Update nodes
      for (const node of nodes) {
        node.x += node.vx
        node.y += node.vy
        node.pulse += node.pulseSpeed

        // Bounce off edges
        if (node.x < 0 || node.x > canvas.width) node.vx *= -1
        if (node.y < 0 || node.y > canvas.height) node.vy *= -1

        // Mouse attraction (brain-like, subtle pull)
        const dx = node.x - mouseRef.current.x
        const dy = node.y - mouseRef.current.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < mouseRadius && dist > 0) {
          const force = (mouseRadius - dist) / mouseRadius * 0.015
          node.vx += (dx / dist) * force
          node.vy += (dy / dist) * force
        }

        // Dampen velocity
        node.vx *= 0.99
        node.vy *= 0.99
      }

      // Draw connections (synapses)
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x
          const dy = nodes[i].y - nodes[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < connectionDistance) {
            const alpha = (1 - dist / connectionDistance) * 0.12
            const isBluePair = nodes[i].color === 'blue' || nodes[j].color === 'blue'
            ctx.beginPath()
            ctx.moveTo(nodes[i].x, nodes[i].y)
            ctx.lineTo(nodes[j].x, nodes[j].y)
            ctx.strokeStyle = isBluePair
              ? `rgba(59, 130, 246, ${alpha})`
              : `rgba(139, 92, 246, ${alpha})`
            ctx.lineWidth = 0.6
            ctx.stroke()
          }
        }
      }

      // Draw nodes (neurons)
      for (const node of nodes) {
        const pulseOpacity = node.opacity + Math.sin(node.pulse) * 0.12

        // Glow
        ctx.beginPath()
        ctx.arc(node.x, node.y, node.radius * 3.5, 0, Math.PI * 2)
        if (node.color === 'blue') {
          ctx.fillStyle = `rgba(59, 130, 246, ${pulseOpacity * 0.08})`
        } else {
          ctx.fillStyle = `rgba(139, 92, 246, ${pulseOpacity * 0.08})`
        }
        ctx.fill()

        // Core
        ctx.beginPath()
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2)
        if (node.color === 'blue') {
          ctx.fillStyle = `rgba(59, 130, 246, ${pulseOpacity})`
        } else {
          ctx.fillStyle = `rgba(139, 92, 246, ${pulseOpacity})`
        }
        ctx.fill()
      }

      // Draw signal pulses along connections (neural impulses)
      const time = Date.now() * 0.001
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x
          const dy = nodes[i].y - nodes[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < connectionDistance * 0.6) {
            const progress = ((time + i * 0.3) % 2) / 2
            const px = nodes[i].x + (nodes[j].x - nodes[i].x) * progress
            const py = nodes[i].y + (nodes[j].y - nodes[i].y) * progress

            ctx.beginPath()
            ctx.arc(px, py, 1.2, 0, Math.PI * 2)
            ctx.fillStyle = `rgba(139, 92, 246, 0.5)`
            ctx.fill()
          }
        }
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(animationRef.current)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
      style={{ opacity: 0.4 }}
    />
  )
}

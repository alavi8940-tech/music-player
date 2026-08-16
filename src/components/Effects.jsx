import { useRef, useEffect, useState } from 'react'

function Effects({ analyser, isPlaying }) {
  const canvasRef = useRef(null)
  const animationRef = useRef(null)
  const particlesRef = useRef([])
  const mouseRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    let width = window.innerWidth
    let height = window.innerHeight

    const resize = () => {
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width * window.devicePixelRatio
      canvas.height = height * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    }
    resize()
    window.addEventListener('resize', resize)

    class Particle {
      constructor(x, y, color) {
        this.x = x
        this.y = y
        this.size = Math.random() * 3 + 1
        this.speedX = (Math.random() - 0.5) * 2
        this.speedY = (Math.random() - 0.5) * 2
        this.color = color
        this.life = 1
        this.decay = Math.random() * 0.02 + 0.005
      }

      update() {
        this.x += this.speedX
        this.y += this.speedY
        this.life -= this.decay
      }

      draw() {
        ctx.save()
        ctx.globalAlpha = this.life
        ctx.fillStyle = this.color
        ctx.shadowBlur = 10
        ctx.shadowColor = this.color
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }
    }

    const colors = ['#ff00ff', '#00ffff', '#bf00ff', '#ff6600', '#00ff00']

    const addParticles = (x, y, count = 5) => {
      for (let i = 0; i < count; i++) {
        const color = colors[Math.floor(Math.random() * colors.length)]
        particlesRef.current.push(new Particle(x, y, color))
      }
    }

    const drawBackground = () => {
      const time = Date.now() * 0.001
      
      const gradient1 = ctx.createRadialGradient(
        width * 0.3 + Math.sin(time) * 100,
        height * 0.3 + Math.cos(time) * 100,
        0,
        width * 0.3,
        height * 0.3,
        400
      )
      gradient1.addColorStop(0, 'rgba(255, 0, 255, 0.1)')
      gradient1.addColorStop(1, 'rgba(255, 0, 255, 0)')

      const gradient2 = ctx.createRadialGradient(
        width * 0.7 + Math.cos(time) * 100,
        height * 0.7 + Math.sin(time) * 100,
        0,
        width * 0.7,
        height * 0.7,
        400
      )
      gradient2.addColorStop(0, 'rgba(0, 255, 255, 0.1)')
      gradient2.addColorStop(1, 'rgba(0, 255, 255, 0)')

      ctx.fillStyle = gradient1
      ctx.fillRect(0, 0, width, height)
      ctx.fillStyle = gradient2
      ctx.fillRect(0, 0, width, height)
    }

    const drawFloatingOrbs = () => {
      const time = Date.now() * 0.001

      for (let i = 0; i < 5; i++) {
        const x = width * (0.2 + i * 0.15) + Math.sin(time + i) * 50
        const y = height * 0.5 + Math.cos(time * 0.5 + i * 2) * 100
        const size = 30 + Math.sin(time + i) * 10

        const gradient = ctx.createRadialGradient(x, y, 0, x, y, size)
        gradient.addColorStop(0, i % 2 === 0 ? 'rgba(255, 0, 255, 0.3)' : 'rgba(0, 255, 255, 0.3)')
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')

        ctx.beginPath()
        ctx.arc(x, y, size, 0, Math.PI * 2)
        ctx.fillStyle = gradient
        ctx.fill()
      }
    }

    const animate = () => {
      ctx.clearRect(0, 0, width, height)
      
      drawBackground()
      drawFloatingOrbs()

      if (isPlaying && analyser) {
        const dataArray = new Uint8Array(analyser.frequencyBinCount)
        analyser.getByteFrequencyData(dataArray)
        
        const avgFrequency = dataArray.reduce((a, b) => a + b, 0) / dataArray.length
        
        if (avgFrequency > 100) {
          addParticles(
            Math.random() * width,
            Math.random() * height,
            Math.floor(avgFrequency / 50)
          )
        }
      }

      particlesRef.current = particlesRef.current.filter(p => p.life > 0)
      particlesRef.current.forEach(p => {
        p.update()
        p.draw()
      })

      if (particlesRef.current.length > 500) {
        particlesRef.current = particlesRef.current.slice(-500)
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    const handleMouseMove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
      if (Math.random() > 0.8) {
        addParticles(e.clientX, e.clientY, 3)
      }
    }

    window.addEventListener('mousemove', handleMouseMove)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [analyser, isPlaying])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  )
}

export default Effects

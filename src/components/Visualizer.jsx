import { useRef, useEffect, useState } from 'react'

function Visualizer({ analyser, isPlaying }) {
  const canvasRef = useRef(null)
  const animationRef = useRef(null)
  const [visualMode, setVisualMode] = useState('bars')

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !analyser) return

    const ctx = canvas.getContext('2d')
    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio
      canvas.height = canvas.offsetHeight * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    }
    resize()
    window.addEventListener('resize', resize)

    const drawBars = () => {
      analyser.getByteFrequencyData(dataArray)
      
      const width = canvas.offsetWidth
      const height = canvas.offsetHeight
      const barCount = 64
      const barWidth = width / barCount
      const gap = 2

      ctx.clearRect(0, 0, width, height)

      for (let i = 0; i < barCount; i++) {
        const dataIndex = Math.floor(i * bufferLength / barCount)
        const barHeight = (dataArray[dataIndex] / 255) * height * 0.8

        const gradient = ctx.createLinearGradient(0, height, 0, height - barHeight)
        gradient.addColorStop(0, '#ff00ff')
        gradient.addColorStop(0.5, '#bf00ff')
        gradient.addColorStop(1, '#00ffff')

        ctx.fillStyle = gradient
        ctx.shadowBlur = 15
        ctx.shadowColor = '#ff00ff'

        const x = i * barWidth + gap / 2
        const y = height - barHeight
        const radius = Math.min(barWidth / 2 - gap / 2, 4)

        ctx.beginPath()
        ctx.moveTo(x + radius, y)
        ctx.lineTo(x + barWidth - gap - radius, y)
        ctx.quadraticCurveTo(x + barWidth - gap, y, x + barWidth - gap, y + radius)
        ctx.lineTo(x + barWidth - gap, height)
        ctx.lineTo(x, height)
        ctx.lineTo(x, y + radius)
        ctx.quadraticCurveTo(x, y, x + radius, y)
        ctx.fill()
      }
    }

    const drawCircle = () => {
      analyser.getByteFrequencyData(dataArray)
      
      const width = canvas.offsetWidth
      const height = canvas.offsetHeight
      const centerX = width / 2
      const centerY = height / 2
      const radius = Math.min(width, height) * 0.3

      ctx.clearRect(0, 0, width, height)

      const avgFrequency = dataArray.reduce((a, b) => a + b, 0) / bufferLength
      const pulseRadius = radius + (avgFrequency / 255) * 20

      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, pulseRadius)
      gradient.addColorStop(0, 'rgba(255, 0, 255, 0.3)')
      gradient.addColorStop(0.5, 'rgba(191, 0, 255, 0.2)')
      gradient.addColorStop(1, 'rgba(0, 255, 255, 0.1)')

      ctx.beginPath()
      ctx.arc(centerX, centerY, pulseRadius, 0, Math.PI * 2)
      ctx.fillStyle = gradient
      ctx.fill()

      ctx.strokeStyle = '#ff00ff'
      ctx.lineWidth = 2
      ctx.shadowBlur = 20
      ctx.shadowColor = '#ff00ff'
      ctx.stroke()

      const bars = 64
      for (let i = 0; i < bars; i++) {
        const angle = (i / bars) * Math.PI * 2
        const dataIndex = Math.floor(i * bufferLength / bars)
        const barHeight = (dataArray[dataIndex] / 255) * 40

        const x1 = centerX + Math.cos(angle) * pulseRadius
        const y1 = centerY + Math.sin(angle) * pulseRadius
        const x2 = centerX + Math.cos(angle) * (pulseRadius + barHeight)
        const y2 = centerY + Math.sin(angle) * (pulseRadius + barHeight)

        const lineGradient = ctx.createLinearGradient(x1, y1, x2, y2)
        lineGradient.addColorStop(0, '#ff00ff')
        lineGradient.addColorStop(1, '#00ffff')

        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.strokeStyle = lineGradient
        ctx.lineWidth = 3
        ctx.lineCap = 'round'
        ctx.stroke()
      }
    }

    const drawWave = () => {
      analyser.getByteTimeDomainData(dataArray)
      
      const width = canvas.offsetWidth
      const height = canvas.offsetHeight

      ctx.clearRect(0, 0, width, height)

      const gradient = ctx.createLinearGradient(0, 0, width, 0)
      gradient.addColorStop(0, '#ff00ff')
      gradient.addColorStop(0.5, '#bf00ff')
      gradient.addColorStop(1, '#00ffff')

      ctx.beginPath()
      ctx.strokeStyle = gradient
      ctx.lineWidth = 3
      ctx.shadowBlur = 15
      ctx.shadowColor = '#ff00ff'

      const sliceWidth = width / bufferLength
      let x = 0

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0
        const y = (v * height) / 2

        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
        x += sliceWidth
      }

      ctx.lineTo(width, height / 2)
      ctx.stroke()

      ctx.beginPath()
      ctx.strokeStyle = 'rgba(0, 255, 255, 0.3)'
      ctx.lineWidth = 2

      x = 0
      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0
        const y = (v * height) / 2 + 5

        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
        x += sliceWidth
      }
      ctx.stroke()
    }

    const animate = () => {
      if (visualMode === 'bars') {
        drawBars()
      } else if (visualMode === 'circle') {
        drawCircle()
      } else {
        drawWave()
      }
      animationRef.current = requestAnimationFrame(animate)
    }

    if (isPlaying) {
      animate()
    } else {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      window.removeEventListener('resize', resize)
    }
  }, [analyser, isPlaying, visualMode])

  return (
    <div className="mt-6 glass rounded-3xl p-4 neon-border">
      <div className="flex items-center justify-center gap-2 mb-4">
        <button
          onClick={() => setVisualMode('bars')}
          className={`px-4 py-2 rounded-full text-sm transition-all ${
            visualMode === 'bars'
              ? 'bg-gradient-to-r from-neon-pink to-neon-blue text-white'
              : 'bg-white/10 text-gray-400 hover:text-white'
          }`}
        >
          میله‌ای
        </button>
        <button
          onClick={() => setVisualMode('circle')}
          className={`px-4 py-2 rounded-full text-sm transition-all ${
            visualMode === 'circle'
              ? 'bg-gradient-to-r from-neon-pink to-neon-blue text-white'
              : 'bg-white/10 text-gray-400 hover:text-white'
          }`}
        >
          دایره‌ای
        </button>
        <button
          onClick={() => setVisualMode('wave')}
          className={`px-4 py-2 rounded-full text-sm transition-all ${
            visualMode === 'wave'
              ? 'bg-gradient-to-r from-neon-pink to-neon-blue text-white'
              : 'bg-white/10 text-gray-400 hover:text-white'
          }`}
        >
          موجی
        </button>
      </div>
      
      <canvas
        ref={canvasRef}
        className="w-full h-48 rounded-2xl"
        style={{ background: 'rgba(0, 0, 0, 0.3)' }}
      />
    </div>
  )
}

export default Visualizer

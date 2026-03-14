import { useRef, useEffect, useState, useCallback } from 'react'

const TOOLS = {
  BRUSH: 'brush',
  ERASER: 'eraser',
  TRAIL: 'trail',
}

const ERASER_MODES = {
  WHITEOUT: 'whiteout',
  BORING: 'boring',
}

const TRAIL_PRESETS = [
  { id: 'classic', label: 'Classic litter', marks: ['•', '✦', '✕', '✿', '⚡'], rainbow: false },
  { id: 'sparkle', label: 'Y2K sparkles', marks: ['✦', '✧', '✨', '✶', '❋'], rainbow: false },
  { id: 'rainbow', label: 'Rainbow chaos', marks: ['🌈', '✦', '✶', '★', '✺'], rainbow: true },
]

const ERASE_COLOR = '#ffffff'

const SECRET_GLYPHS = ['✨', '🌈', '🦄', '💖', '⭐']

export default function VandalCanvas({ onClose }) {
  const wrapperRef = useRef(null)
  const canvasRef = useRef(null)
  const staticCanvasRef = useRef(null)
  const secretCanvasRef = useRef(null)
  const particlesRef = useRef([])
  const animationFrameRef = useRef(null)
  const trailHueRef = useRef(0)
  const drawing = useRef(false)
  const lastPos = useRef(null)
  const [tool, setTool] = useState(TOOLS.BRUSH)
  const [color, setColor] = useState('#e03c31')
  const [size, setSize] = useState(8)
  const [eraserMode, setEraserMode] = useState(ERASER_MODES.WHITEOUT)
  const [trailPreset, setTrailPreset] = useState(TRAIL_PRESETS[1].id)
  const [gravityDrop, setGravityDrop] = useState(true)

  const drawSecretWorld = useCallback((secretCanvas) => {
    const ctx = secretCanvas.getContext('2d')
    if (!ctx) return

    const { width, height } = secretCanvas
    if (width <= 0 || height <= 0) return

    const gradient = ctx.createLinearGradient(0, 0, width, height)
    gradient.addColorStop(0, '#ff4fd8')
    gradient.addColorStop(0.5, '#ff78e2')
    gradient.addColorStop(1, '#ff33cc')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)

    for (let y = 0; y < height; y += 26) {
      ctx.fillStyle = y % 52 === 0 ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.1)'
      ctx.fillRect(0, y, width, 13)
    }

    ctx.strokeStyle = '#00fff7'
    ctx.lineWidth = 4
    ctx.strokeRect(14, 14, width - 28, height - 28)

    ctx.fillStyle = '#fff700'
    ctx.font = 'bold 40px "Comic Sans MS", "Marker Felt", cursive'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    ctx.fillText('WELCOME TO THE FUN SIDE', width / 2, 38)

    ctx.fillStyle = '#00fff7'
    ctx.font = 'bold 22px "Comic Sans MS", "Marker Felt", cursive'
    ctx.fillText('~ this website is sitting in an s3 bucket behind a cloudfront distribution, in case you were curious. ~', width / 2, 90)

    for (let row = 0; row < Math.ceil(height / 140); row += 1) {
      for (let col = 0; col < Math.ceil(width / 90); col += 1) {
        const glyph = SECRET_GLYPHS[(row + col) % SECRET_GLYPHS.length]
        const x = 38 + col * 90 + (row % 2) * 20
        const y = 150 + row * 130
        ctx.font = `${26 + ((row + col) % 3) * 6}px serif`
        ctx.fillStyle = (row + col) % 2 === 0 ? '#ffffff' : '#d6ff00'
        ctx.fillText(glyph, x, y)
      }
    }

    const rainbowBands = [
      '#ff004c', '#ff7a00', '#ffe000', '#36d100', '#00b7ff', '#7a00ff', '#ff00bf',
    ]
    rainbowBands.forEach((band, index) => {
      const y = height - 170 + index * 12
      ctx.strokeStyle = band
      ctx.lineWidth = 10
      ctx.beginPath()
      ctx.moveTo(30, y)
      ctx.quadraticCurveTo(width / 2, y - 80, width - 30, y)
      ctx.stroke()
    })
  }, [])

  const stampSecretAt = useCallback((ctx, x, y, brushSize) => {
    const secretCanvas = secretCanvasRef.current
    if (!secretCanvas) return

    const radius = Math.max(3, brushSize / 2)
    ctx.save()
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, Math.PI * 2)
    ctx.clip()
    if (typeof ctx.drawImage === 'function') {
      ctx.drawImage(secretCanvas, 0, 0)
    }
    ctx.restore()
  }, [])

  const getTrailPreset = useCallback(
    () => TRAIL_PRESETS.find((preset) => preset.id === trailPreset) ?? TRAIL_PRESETS[0],
    [trailPreset],
  )

  const renderDisplay = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    const staticCanvas = staticCanvasRef.current
    if (!canvas || !ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    if (staticCanvas && typeof ctx.drawImage === 'function') {
      ctx.drawImage(staticCanvas, 0, 0)
    }

    particlesRef.current.forEach((particle) => {
      ctx.save()
      ctx.globalCompositeOperation = 'source-over'
      ctx.fillStyle = particle.color
      ctx.font = `${particle.fontSize}px serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(particle.mark, particle.x, particle.y)
      ctx.restore()
    })
  }, [])

  const animateParticles = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) {
      animationFrameRef.current = null
      return
    }

    const rect = canvas.getBoundingClientRect()
    const floorY = window.innerHeight - rect.top - 10
    let stillFalling = false

    particlesRef.current = particlesRef.current.map((particle) => {
      if (particle.settled) return particle

      const nextVy = particle.vy + particle.gravity
      const nextY = particle.y + nextVy

      if (nextY >= floorY) {
        return { ...particle, y: floorY, vy: 0, settled: true }
      }

      stillFalling = true
      return { ...particle, y: nextY, vy: nextVy }
    })

    renderDisplay()

    if (stillFalling) {
      animationFrameRef.current = window.requestAnimationFrame(animateParticles)
    } else {
      animationFrameRef.current = null
    }
  }, [renderDisplay])

  const startParticleAnimation = useCallback(() => {
    if (animationFrameRef.current !== null) return
    animationFrameRef.current = window.requestAnimationFrame(animateParticles)
  }, [animateParticles])

  const stampTrailMark = useCallback((ctx, x, y, selectedSize) => {
    const preset = getTrailPreset()
    const mark = preset.marks[Math.floor(Math.random() * preset.marks.length)]
    const fontSize = Math.max(14, selectedSize * (1.6 + Math.random() * 0.9))
    const resolvedColor = preset.rainbow
      ? `hsl(${trailHueRef.current % 360} 100% 60%)`
      : color

    trailHueRef.current = (trailHueRef.current + 22) % 360

    ctx.save()
    ctx.globalCompositeOperation = 'source-over'
    ctx.fillStyle = resolvedColor
    ctx.font = `${fontSize}px serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(mark, x, y)
    ctx.restore()

    return { mark, color: resolvedColor, fontSize }
  }, [color, getTrailPreset])

  // Size canvas to wrapper (full page content area)
  const resizeCanvas = useCallback(() => {
    const wrapper = wrapperRef.current
    const canvas = canvasRef.current
    if (!wrapper || !canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = Math.ceil(wrapper.clientWidth)
    const height = Math.ceil(wrapper.clientHeight)
    if (width <= 0 || height <= 0) return

    const staticCanvas = staticCanvasRef.current ?? document.createElement('canvas')
    staticCanvasRef.current = staticCanvas

    const secretCanvas = secretCanvasRef.current ?? document.createElement('canvas')
    secretCanvasRef.current = secretCanvas

    const prevWidth = staticCanvas.width
    const prevHeight = staticCanvas.height

    if (prevWidth === width && prevHeight === height) return

    let prevLayer = null
    if (prevWidth > 0 && prevHeight > 0) {
      prevLayer = document.createElement('canvas')
      prevLayer.width = prevWidth
      prevLayer.height = prevHeight
      const prevCtx = prevLayer.getContext('2d')
      prevCtx?.drawImage(staticCanvas, 0, 0)
    }

    staticCanvas.width = width
    staticCanvas.height = height

    secretCanvas.width = width
    secretCanvas.height = height
    drawSecretWorld(secretCanvas)

    if (prevLayer) {
      const staticCtx = staticCanvas.getContext('2d')
      if (staticCtx && typeof staticCtx.drawImage === 'function') {
        staticCtx.drawImage(prevLayer, 0, 0)
      }
    }

    canvas.width = width
    canvas.height = height
    renderDisplay()
  }, [drawSecretWorld, renderDisplay])

  useEffect(() => {
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    const wrapper = wrapperRef.current
    const observer = typeof ResizeObserver !== 'undefined' && wrapper
      ? new ResizeObserver(() => resizeCanvas())
      : null

    if (observer && wrapper) {
      observer.observe(wrapper)
    }

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      observer?.disconnect()
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [resizeCanvas])

  const getPos = (e) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }

    const rect = canvas.getBoundingClientRect()

    if (e.touches) {
      const t = e.touches[0]
      return { x: t.clientX - rect.left, y: t.clientY - rect.top }
    }

    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  const startDraw = (e) => {
    e.preventDefault()
    drawing.current = true
    const startPos = getPos(e)
    lastPos.current = startPos

    if (tool === TOOLS.TRAIL) {
      const staticCtx = staticCanvasRef.current?.getContext('2d')
      if (!staticCtx) return

      const stamped = stampTrailMark(staticCtx, startPos.x, startPos.y, size)

      if (gravityDrop) {
        particlesRef.current.push({
          ...stamped,
          x: startPos.x,
          y: startPos.y,
          vy: 0.6 + Math.random() * 1.2,
          gravity: 0.18 + Math.random() * 0.14,
          settled: false,
        })
        startParticleAnimation()
      }

      renderDisplay()
    } else if (tool === TOOLS.ERASER && eraserMode === ERASER_MODES.BORING) {
      const staticCtx = staticCanvasRef.current?.getContext('2d')
      if (!staticCtx) return
      stampSecretAt(staticCtx, startPos.x, startPos.y, size)
      renderDisplay()
    }
  }

  const draw = (e) => {
    if (!drawing.current) return
    e.preventDefault()
    const staticCtx = staticCanvasRef.current?.getContext('2d')
    if (!staticCtx || !lastPos.current) return
    const pos = getPos(e)

    if (tool === TOOLS.TRAIL) {
      const dx = pos.x - lastPos.current.x
      const dy = pos.y - lastPos.current.y
      const distance = Math.hypot(dx, dy)
      const step = Math.max(6, size)

      if (distance > 0) {
        const count = Math.floor(distance / step)

        for (let i = 1; i <= count; i += 1) {
          const t = (i * step) / distance
          const x = lastPos.current.x + dx * t
          const y = lastPos.current.y + dy * t

          const stamped = stampTrailMark(staticCtx, x, y, size)
          if (gravityDrop) {
            particlesRef.current.push({
              ...stamped,
              x,
              y,
              vy: 0.6 + Math.random() * 1.3,
              gravity: 0.18 + Math.random() * 0.15,
              settled: false,
            })
          }
        }

        if (gravityDrop) {
          startParticleAnimation()
        }
      }
    } else if (tool === TOOLS.ERASER && eraserMode === ERASER_MODES.BORING) {
      const dx = pos.x - lastPos.current.x
      const dy = pos.y - lastPos.current.y
      const distance = Math.hypot(dx, dy)
      const step = Math.max(2, size * 0.35)
      const count = Math.max(1, Math.floor(distance / step))

      for (let i = 1; i <= count; i += 1) {
        const t = i / count
        const x = lastPos.current.x + dx * t
        const y = lastPos.current.y + dy * t
        stampSecretAt(staticCtx, x, y, size)
      }
    } else {
      staticCtx.save()
      staticCtx.globalCompositeOperation = 'source-over'
      staticCtx.strokeStyle = tool === TOOLS.ERASER ? ERASE_COLOR : color
      staticCtx.lineWidth = size
      staticCtx.lineCap = 'round'
      staticCtx.lineJoin = 'round'
      staticCtx.beginPath()
      staticCtx.moveTo(lastPos.current.x, lastPos.current.y)
      staticCtx.lineTo(pos.x, pos.y)
      staticCtx.stroke()
      staticCtx.restore()
    }

    renderDisplay()
    lastPos.current = pos
  }

  const stopDraw = () => {
    drawing.current = false
    lastPos.current = null
  }

  const clearCanvas = () => {
    const staticCanvas = staticCanvasRef.current
    const staticCtx = staticCanvas?.getContext('2d')

    if (staticCanvas && staticCtx) {
      staticCtx.clearRect(0, 0, staticCanvas.width, staticCanvas.height)
    } else {
      const canvas = canvasRef.current
      const ctx = canvas?.getContext('2d')
      if (canvas && ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
      }
    }

    particlesRef.current = []
    renderDisplay()
  }

  const toolLabel = tool === TOOLS.BRUSH ? 'Brush' : tool === TOOLS.ERASER ? 'Eraser' : 'Trail'
  const cursorClass = tool === TOOLS.ERASER
    ? 'vandal-canvas--eraser'
    : tool === TOOLS.TRAIL
      ? 'vandal-canvas--trail'
      : 'vandal-canvas--brush'

  return (
    <div className="vandal-wrapper" data-testid="vandal-wrapper" ref={wrapperRef}>
      <canvas
        ref={canvasRef}
        className={`vandal-canvas ${cursorClass}`}
        data-testid="vandal-canvas"
        onMouseDown={startDraw}
        onMouseMove={draw}
        onMouseUp={stopDraw}
        onMouseLeave={stopDraw}
        onTouchStart={startDraw}
        onTouchMove={draw}
        onTouchEnd={stopDraw}
      />
      <div className="vandal-toolbar" data-testid="vandal-toolbar">
        <div className="vandal-toolbar-title">Tools</div>
        <div className="vandal-tools" role="group" aria-label="Drawing tools">
          <button
            className={`vandal-tool${tool === TOOLS.BRUSH ? ' vandal-tool--active' : ''}`}
            onClick={() => setTool(TOOLS.BRUSH)}
            aria-label="Brush tool"
            title="Brush"
          >
            Brush
          </button>
          <button
            className={`vandal-tool${tool === TOOLS.ERASER ? ' vandal-tool--active' : ''}`}
            onClick={() => setTool(TOOLS.ERASER)}
            aria-label="Eraser tool"
            title="Eraser"
          >
            Eraser
          </button>
          <button
            className={`vandal-tool${tool === TOOLS.TRAIL ? ' vandal-tool--active' : ''}`}
            onClick={() => setTool(TOOLS.TRAIL)}
            aria-label="Trail tool"
            title="Trail"
          >
            Trail
          </button>
        </div>

        <label className="vandal-control" htmlFor="vandal-color-picker">
          <span>Color</span>
          <input
            id="vandal-color-picker"
            className="vandal-color-wheel"
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            aria-label="Color wheel"
          />
        </label>

        <label className="vandal-control" htmlFor="vandal-size-slider">
          <span>Thickness</span>
          <input
            id="vandal-size-slider"
            className="vandal-thickness"
            type="range"
            min="2"
            max="40"
            step="1"
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
            aria-label="Stroke thickness"
          />
          <span className="vandal-thickness-value">{size}px</span>
        </label>

        {tool === TOOLS.ERASER && (
          <label className="vandal-control" htmlFor="vandal-eraser-mode">
            <span>Eraser style</span>
            <select
              id="vandal-eraser-mode"
              className="vandal-trail-select"
              value={eraserMode}
              onChange={(e) => setEraserMode(e.target.value)}
              aria-label="Eraser style"
            >
              <option value={ERASER_MODES.WHITEOUT}>Whiteout</option>
              <option value={ERASER_MODES.BORING}>Boring eraser</option>
            </select>
          </label>
        )}

        {tool === TOOLS.TRAIL && (
          <label className="vandal-control" htmlFor="vandal-trail-preset">
            <span>Trail style</span>
            <select
              id="vandal-trail-preset"
              className="vandal-trail-select"
              value={trailPreset}
              onChange={(e) => setTrailPreset(e.target.value)}
              aria-label="Trail style"
            >
              {TRAIL_PRESETS.map((preset) => (
                <option key={preset.id} value={preset.id}>{preset.label}</option>
              ))}
            </select>
          </label>
        )}

        {tool === TOOLS.TRAIL && (
          <label className="vandal-check">
            <input
              type="checkbox"
              checked={gravityDrop}
              onChange={(e) => setGravityDrop(e.target.checked)}
              aria-label="Gravity drop"
            />
            <span>Gravity drop</span>
          </label>
        )}

        <div className="vandal-current" aria-label="Current tool">{toolLabel}</div>

        <button className="vandal-clear" onClick={clearCanvas} title="Clear">
          Clear
        </button>
        <button className="vandal-close" onClick={onClose} title="Stop drawing">
          Done
        </button>
      </div>
    </div>
  )
}

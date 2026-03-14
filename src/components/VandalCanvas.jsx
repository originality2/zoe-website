import { useRef, useEffect, useState, useCallback } from 'react'

const COLORS = ['#e03c31', '#2266cc', '#22aa44', '#ee9900', '#8833bb', '#000000']
const SIZES = [3, 8, 16]

export default function VandalCanvas({ onClose }) {
  const canvasRef = useRef(null)
  const drawing = useRef(false)
  const lastPos = useRef(null)
  const [color, setColor] = useState(COLORS[0])
  const [size, setSize] = useState(SIZES[1])

  // Size canvas to window
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const prev = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height)
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    canvas.getContext('2d').putImageData(prev, 0, 0)
  }, [])

  useEffect(() => {
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
    return () => window.removeEventListener('resize', resizeCanvas)
  }, [resizeCanvas])

  const getPos = (e) => {
    if (e.touches) {
      const t = e.touches[0]
      return { x: t.clientX, y: t.clientY }
    }
    return { x: e.clientX, y: e.clientY }
  }

  const startDraw = (e) => {
    drawing.current = true
    lastPos.current = getPos(e)
  }

  const draw = (e) => {
    if (!drawing.current) return
    e.preventDefault()
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const pos = getPos(e)
    ctx.strokeStyle = color
    ctx.lineWidth = size
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.beginPath()
    ctx.moveTo(lastPos.current.x, lastPos.current.y)
    ctx.lineTo(pos.x, pos.y)
    ctx.stroke()
    lastPos.current = pos
  }

  const stopDraw = () => {
    drawing.current = false
    lastPos.current = null
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
  }

  return (
    <div className="vandal-wrapper" data-testid="vandal-wrapper">
      <canvas
        ref={canvasRef}
        className="vandal-canvas"
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
        <div className="vandal-colors">
          {COLORS.map((c) => (
            <button
              key={c}
              className={`vandal-color${color === c ? ' vandal-color--active' : ''}`}
              style={{ background: c }}
              onClick={() => setColor(c)}
              aria-label={`Color ${c}`}
              title={c}
            />
          ))}
        </div>
        <div className="vandal-sizes">
          {SIZES.map((s) => (
            <button
              key={s}
              className={`vandal-size${size === s ? ' vandal-size--active' : ''}`}
              onClick={() => setSize(s)}
              aria-label={`Brush size ${s}`}
              title={`Size ${s}`}
            >
              <span
                className="vandal-size-dot"
                style={{ width: s, height: s }}
              />
            </button>
          ))}
        </div>
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

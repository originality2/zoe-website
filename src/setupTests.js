import '@testing-library/jest-dom'
import { vi } from 'vitest'

// jsdom does not implement HTMLCanvasElement.getContext — stub it globally
const makeCtx = () => ({
  strokeStyle: '',
  lineWidth: 0,
  lineCap: '',
  lineJoin: '',
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  stroke: vi.fn(),
  clearRect: vi.fn(),
  getImageData: vi.fn(() => ({ data: new Uint8ClampedArray() })),
  putImageData: vi.fn(),
})

HTMLCanvasElement.prototype.getContext = vi.fn(makeCtx)

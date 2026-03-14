import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import VandalCanvas from './VandalCanvas'

describe('VandalCanvas', () => {
  it('renders canvas and toolbar', () => {
    render(<VandalCanvas onClose={() => {}} />)
    expect(screen.getByTestId('vandal-canvas')).toBeInTheDocument()
    expect(screen.getByTestId('vandal-toolbar')).toBeInTheDocument()
  })

  it('renders brush, eraser and trail tools', () => {
    render(<VandalCanvas onClose={() => {}} />)
    expect(screen.getByRole('button', { name: /brush tool/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /eraser tool/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /trail tool/i })).toBeInTheDocument()
  })

  it('renders color wheel and thickness slider', () => {
    render(<VandalCanvas onClose={() => {}} />)
    expect(screen.getByLabelText(/color wheel/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/stroke thickness/i)).toBeInTheDocument()
  })

  it('shows trail mark selector when trail tool is selected', async () => {
    const user = userEvent.setup()
    render(<VandalCanvas onClose={() => {}} />)
    expect(screen.queryByLabelText(/trail style/i)).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /trail tool/i }))
    expect(screen.getByLabelText(/trail style/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/gravity drop/i)).toBeInTheDocument()
  })

  it('shows eraser style selector when eraser tool is selected', async () => {
    const user = userEvent.setup()
    render(<VandalCanvas onClose={() => {}} />)
    expect(screen.queryByLabelText(/eraser style/i)).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /eraser tool/i }))
    expect(screen.getByLabelText(/eraser style/i)).toBeInTheDocument()
  })

  it('switches canvas cursor class by active tool', async () => {
    const user = userEvent.setup()
    render(<VandalCanvas onClose={() => {}} />)
    const canvas = screen.getByTestId('vandal-canvas')

    expect(canvas).toHaveClass('vandal-canvas--brush')
    await user.click(screen.getByRole('button', { name: /eraser tool/i }))
    expect(canvas).toHaveClass('vandal-canvas--eraser')
    await user.click(screen.getByRole('button', { name: /trail tool/i }))
    expect(canvas).toHaveClass('vandal-canvas--trail')
  })

  it('renders Clear and Done buttons', () => {
    render(<VandalCanvas onClose={() => {}} />)
    expect(screen.getByRole('button', { name: /clear/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /done/i })).toBeInTheDocument()
  })

  it('calls onClose when Done is clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<VandalCanvas onClose={onClose} />)
    await user.click(screen.getByRole('button', { name: /done/i }))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('clears canvas when Clear is clicked', async () => {
    const user = userEvent.setup()
    const clearRect = vi.fn()
    HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
      strokeStyle: '',
      lineWidth: 0,
      lineCap: '',
      lineJoin: '',
      fillStyle: '',
      font: '',
      textAlign: '',
      textBaseline: '',
      globalCompositeOperation: '',
      save: vi.fn(),
      restore: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      fillText: vi.fn(),
      drawImage: vi.fn(),
      createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
      strokeRect: vi.fn(),
      quadraticCurveTo: vi.fn(),
      arc: vi.fn(),
      clip: vi.fn(),
      clearRect,
      getImageData: vi.fn(() => ({ data: new Uint8ClampedArray() })),
      putImageData: vi.fn(),
    }))
    render(<VandalCanvas onClose={() => {}} />)
    await user.click(screen.getByRole('button', { name: /clear/i }))
    expect(clearRect).toHaveBeenCalled()
  })
})


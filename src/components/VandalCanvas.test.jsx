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

  it('renders color buttons', () => {
    render(<VandalCanvas onClose={() => {}} />)
    const colorBtns = screen.getAllByLabelText(/^Color #/)
    expect(colorBtns.length).toBeGreaterThan(0)
  })

  it('renders size buttons', () => {
    render(<VandalCanvas onClose={() => {}} />)
    const sizeBtns = screen.getAllByLabelText(/^Brush size/)
    expect(sizeBtns.length).toBeGreaterThan(0)
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
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      clearRect,
      getImageData: vi.fn(() => ({ data: new Uint8ClampedArray() })),
      putImageData: vi.fn(),
    }))
    render(<VandalCanvas onClose={() => {}} />)
    await user.click(screen.getByRole('button', { name: /clear/i }))
    expect(clearRect).toHaveBeenCalled()
  })
})


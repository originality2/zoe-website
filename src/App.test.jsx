import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

describe('App', () => {
  it('renders Zoe Higgins name and title', () => {
    render(<App />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Zoe Higgins')
    expect(screen.getByText('Engineering Manager')).toBeInTheDocument()
  })

  it('renders About, Approach and Contact sections', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: /about/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /how i work/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /contact/i })).toBeInTheDocument()
  })

  it('renders nav links', () => {
    render(<App />)
    expect(screen.getByRole('link', { name: /about/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /approach/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /contact/i })).toBeInTheDocument()
  })

  it('shows vandalise toggle button', () => {
    render(<App />)
    expect(screen.getByRole('button', { name: /vandalise/i })).toBeInTheDocument()
  })

  it('does not show vandal canvas initially', () => {
    render(<App />)
    expect(screen.queryByTestId('vandal-wrapper')).not.toBeInTheDocument()
  })

  it('shows vandal canvas after clicking vandalise button', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: /vandalise/i }))
    expect(screen.getByTestId('vandal-wrapper')).toBeInTheDocument()
  })

  it('hides vandal canvas after clicking Done', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: /vandalise/i }))
    await user.click(screen.getByRole('button', { name: /done/i }))
    expect(screen.queryByTestId('vandal-wrapper')).not.toBeInTheDocument()
  })

  it('toggle button shows "Drawing" label when active', async () => {
    const user = userEvent.setup()
    render(<App />)
    const btn = screen.getByRole('button', { name: /vandalise/i })
    await user.click(btn)
    expect(screen.getByRole('button', { name: /drawing/i })).toBeInTheDocument()
  })
})

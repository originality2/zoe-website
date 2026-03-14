import { useState } from 'react'
import VandalCanvas from './components/VandalCanvas'
import './App.css'

function App() {
  const [vandalMode, setVandalMode] = useState(false)

  return (
    <div className="site">
      <header className="site-header">
        <h1>Zoe Higgins</h1>
        <p className="tagline">Engineering Manager</p>
        <nav>
          <a href="#about">About</a>
          <a href="#approach">Approach</a>
          <a href="#contact">Contact</a>
        </nav>
      </header>

      <main>
        <section id="about">
          <h2>About</h2>
          <p>
            I'm an Engineering Manager with experience building and scaling
            software engineering teams. I care about shipping good software,
            growing engineers, and making work feel sustainable.
          </p>
          <p>
            My background is in software engineering. I spent several years as
            an individual contributor before moving into management. I find that
            technical context makes me a better partner to the engineers I work
            with.
          </p>
        </section>

        <section id="approach">
          <h2>How I Work</h2>
          <ul>
            <li>I think clarity is underrated. Clear goals, clear expectations, clear feedback.</li>
            <li>I prefer small, frequent improvements over occasional heroics.</li>
            <li>I try to remove blockers before being asked.</li>
            <li>Disagreement is fine. Unvoiced disagreement is a problem.</li>
            <li>I write things down.</li>
          </ul>
        </section>

        <section id="contact">
          <h2>Contact</h2>
          <p>
            The best way to reach me is by email:{' '}
            <a href="mailto:zoe@example.com">zoe@example.com</a>
          </p>
          <p>
            You can also find me on{' '}
            <a href="https://linkedin.com" target="_blank" rel="noreferrer">
              LinkedIn
            </a>
            {' '}or{' '}
            <a href="https://github.com" target="_blank" rel="noreferrer">
              GitHub
            </a>
            .
          </p>
        </section>
      </main>

      <footer className="site-footer">
        <p>Zoe Higgins &mdash; Engineering Manager</p>
      </footer>

      <button
        className={`vandal-toggle${vandalMode ? ' vandal-toggle--active' : ''}`}
        onClick={() => setVandalMode((v) => !v)}
        aria-pressed={vandalMode}
        title={vandalMode ? 'Stop drawing' : 'Draw on this page'}
      >
        {vandalMode ? '✏️ Drawing' : '✏️ Vandalise'}
      </button>

      {vandalMode && (
        <VandalCanvas onClose={() => setVandalMode(false)} />
      )}
    </div>
  )
}

export default App

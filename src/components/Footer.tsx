import { Link } from '@tanstack/react-router'

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-content">
        <div className="footer-links">
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
          <Link to="/download">Download</Link>
          <Link to="/contact">Contact</Link>
          <a href="https://github.com/bionsight/SynapSpec" target="_blank" rel="noreferrer">GitHub</a>
        </div>
        <p>© {new Date().getFullYear()} Bionsight. Accelerating drug discovery through AI-powered proteomics.</p>
      </div>
    </footer>
  )
}

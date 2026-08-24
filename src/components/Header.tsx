import { Link } from '@tanstack/react-router'

const navigation = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/download', label: 'Download' },
  { href: 'https://docs.synapspec.ai', label: 'Documentation' },
  { to: '/contact', label: 'Contact' },
] as const

export function Header() {
  return (
    <header className="site-header">
      <div className="container header-content">
        <Link to="/" className="brand" aria-label="SynapSpec home">
          <img src="/images/favicon.png" alt="" />
          <span><strong>Synap</strong>Spec</span>
        </Link>
        <nav className="nav-menu" aria-label="Main navigation">
          {navigation.map((item) =>
            'href' in item ? (
              <a href={item.href} key={item.label} target="_blank" rel="noreferrer">{item.label}</a>
            ) : (
              <Link key={item.label} to={item.to} activeProps={{ className: 'active' }}>
                {item.label}
              </Link>
            ),
          )}
        </nav>
      </div>
    </header>
  )
}

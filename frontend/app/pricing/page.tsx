import Link from 'next/link';

export default function PricingPage() {
  return (
    <>
      <nav className="navbar">
        <div className="nav-container">
          <Link href="/" className="logo">
            C2E
          </Link>
          <ul className="nav-links">
            <li>
              <Link href="/#features">Features</Link>
            </li>
            <li>
              <Link href="/#how-it-works">How it Works</Link>
            </li>
            <li>
              <Link href="/#security">Security</Link>
            </li>
            <li>
              <Link href="/pricing">Pricing</Link>
            </li>
          </ul>
          <Link href="/login" className="cta-button">
            Get Started
          </Link>
        </div>
      </nav>

      <main style={{ paddingTop: '8rem', paddingBottom: '4rem', background: 'var(--bg-primary)' }}>
        <div className="section-container">
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h1
              style={{
                fontFamily: '"Space Grotesk", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                fontSize: '3rem',
                fontWeight: 600,
                letterSpacing: '-0.04em',
                lineHeight: 1.1,
                color: 'var(--text-primary)',
                marginBottom: '1rem',
              }}
            >
              Simple Pricing
            </h1>
            <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', margin: 0 }}>
              Choose the plan that fits your workflow
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '1.25rem',
              maxWidth: 1200,
              margin: '0 auto',
            }}
          >
            {[
              {
                tier: 'Starter',
                price: '$29',
                period: '/month',
                desc: 'Perfect for getting started with secure video collaboration.',
                features: ['Up to 100GB storage', '5 active projects', 'Basic encryption', 'Email support'],
                cta: 'Try for free',
                featured: false,
              },
              {
                tier: 'Pro',
                price: '$79',
                period: '/month',
                desc: 'Memory for power users and quick moving teams.',
                features: ['Unlimited storage', 'Unlimited projects', 'End-to-end encryption', 'Priority support', 'Advanced analytics'],
                cta: 'Get started with Pro →',
                featured: true,
              },
              {
                tier: 'Enterprise',
                price: 'Custom',
                period: '',
                desc: 'Enterprise-grade memory for large organisations with dedicated support.',
                features: ['Everything in Professional', 'Custom integrations', 'Dedicated support', 'SLA guarantee', 'Team management'],
                cta: 'Get started with Enterprise →',
                featured: false,
              },
            ].map((p) => (
              <div
                key={p.tier}
                style={{
                  borderRadius: 20,
                  border: `1px solid ${p.featured ? 'rgba(0,102,255,0.35)' : 'var(--border)'}`,
                  background: p.featured
                    ? 'linear-gradient(135deg, rgba(0, 102, 255, 0.10), rgba(0, 212, 255, 0.05))'
                    : 'rgba(0,0,0,0.03)',
                  padding: '2rem',
                  boxShadow: p.featured ? '0 18px 50px rgba(0, 102, 255, 0.12)' : 'none',
                }}
              >
                <div style={{ marginBottom: '1rem' }}>
                  <div
                    style={{
                      display: 'inline-block',
                      padding: '0.35rem 0.75rem',
                      borderRadius: 999,
                      border: `1px solid ${p.featured ? 'rgba(0,102,255,0.25)' : 'rgba(0,0,0,0.12)'}`,
                      background: p.featured ? 'rgba(0, 102, 255, 0.10)' : 'rgba(255,255,255,0.65)',
                      fontFamily:
                        '"Space Grotesk", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                      fontSize: 12,
                      fontWeight: 600,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      color: p.featured ? 'var(--accent-start)' : 'var(--text-primary)',
                    }}
                  >
                    {p.tier}
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: '0.5rem',
                    marginBottom: '0.5rem',
                  }}
                >
                  <div
                    style={{
                      fontFamily:
                        '"Space Grotesk", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                      fontSize: 36,
                      fontWeight: 700,
                      letterSpacing: '-0.02em',
                      background: 'linear-gradient(135deg, var(--accent-start), var(--accent-end))',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    {p.price}
                  </div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{p.period}</div>
                </div>

                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>{p.desc}</p>

                <ul style={{ listStyle: 'none', padding: 0, margin: 0, marginBottom: '1.5rem' }}>
                  {p.features.map((f) => (
                    <li key={f} style={{ display: 'flex', gap: '0.6rem', padding: '0.5rem 0', color: 'var(--text-primary)' }}>
                      <span style={{ color: 'var(--accent-start)' }}>✓</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/login"
                  className={p.featured ? 'btn-primary' : 'btn-secondary'}
                  style={{
                    width: '100%',
                    justifyContent: 'center',
                  }}
                >
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="footer">
        <div className="section-container">
          <div className="footer-content">
            <div className="footer-brand">
              <div className="logo">C2E</div>
              <p>Secure video collaboration for creators and editors.</p>
            </div>
            <div className="footer-links">
              <div className="footer-column">
                <h4>Product</h4>
                <Link href="/#features">Features</Link>
                <Link href="/#how-it-works">How it Works</Link>
                <Link href="/pricing">Pricing</Link>
              </div>
              <div className="footer-column">
                <h4>Company</h4>
                <Link href="/#security">Security</Link>
                <a href="#">About</a>
                <a href="#">Contact</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2026 C2E. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>
  );
}


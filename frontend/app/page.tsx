'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import Link from 'next/link';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, fetchUser } = useAuthStore();
  const navbarRef = useRef<HTMLElement | null>(null);
  const workflowContainerRef = useRef<HTMLDivElement | null>(null);
  const blastWrapperRef = useRef<HTMLDivElement | null>(null);
  const blastHeadlineRef = useRef<HTMLHeadingElement | null>(null);
  const blastDescriptionRef = useRef<HTMLDivElement | null>(null);

  const [typingText, setTypingText] = useState('');
  const [activeHowIndex, setActiveHowIndex] = useState(0);

  const howSteps = useMemo(
    () => [
      {
        icon: '📤',
        number: '01',
        title: 'Creator Uploads',
        description:
          'Securely upload your raw video files through our encrypted dashboard. Your content stays private from the moment it leaves your device.',
      },
      {
        icon: '🔐',
        number: '02',
        title: 'Private Secure Transfer',
        description:
          'End-to-end encryption ensures your files travel safely. No public links. No cloud drives. Just direct, secure transfer.',
      },
      {
        icon: '🔔',
        number: '03',
        title: 'Editor Receives',
        description:
          'Editors get instant access with real-time notifications. Preview files before opening in your editing software.',
      },
      {
        icon: '🎬',
        number: '04',
        title: 'Open in Editing Software',
        description:
          'One-click integration with DaVinci Resolve and Adobe Premiere Pro. Start editing immediately—no downloads required.',
      },
    ],
    [],
  );

  useEffect(() => {
    // If already logged in, jump straight to dashboard.
    // Otherwise, show the marketing landing page.
    const check = async () => {
      try {
        await fetchUser();
        if (isAuthenticated) router.push('/dashboard');
      } catch {
        // ignore
      }
    };
    check();
  }, [isAuthenticated, fetchUser, router]);

  useEffect(() => {
    // Typing animation
    const text = 'Securely & Instantly.';
    const startDelay = 1000;
    const speed = 80;
    let timeout: number | undefined;
    let interval: number | undefined;

    timeout = window.setTimeout(() => {
      let i = 0;
      setTypingText('');
      interval = window.setInterval(() => {
        i += 1;
        setTypingText(text.slice(0, i));
        if (i >= text.length && interval) window.clearInterval(interval);
      }, speed);
    }, startDelay);

    return () => {
      if (timeout) window.clearTimeout(timeout);
      if (interval) window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    // Navbar scroll detection
    const onScroll = () => {
      const el = navbarRef.current;
      if (!el) return;
      if (window.scrollY > 50) el.classList.add('scrolled');
      else el.classList.remove('scrolled');
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    // Intersection observers for reveal animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('visible');
        });
      },
      { threshold: 0.2, rootMargin: '0px 0px -100px 0px' },
    );

    const revealTargets = Array.from(
      document.querySelectorAll('.workflow-step, .feature-card-new, .security-card'),
    );
    revealTargets.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    // Keep the "How it works" dots/arrows in sync with scroll position.
    const container = workflowContainerRef.current;
    if (!container) return;

    const steps = Array.from(container.querySelectorAll<HTMLElement>('.workflow-step'));
    if (steps.length === 0) return;

    // Center first card on load
    const centerIndex = (idx: number, behavior: ScrollBehavior) => {
      const step = steps[Math.max(0, Math.min(steps.length - 1, idx))];
      const containerWidth = container.clientWidth;
      const stepCenter = step.offsetLeft + step.offsetWidth / 2;
      const targetLeft = Math.max(0, stepCenter - containerWidth / 2);
      container.scrollTo({ left: targetLeft, behavior });
    };

    const initial = window.setTimeout(() => centerIndex(0, 'auto'), 80);

    let raf: number | null = null;
    const onScroll = () => {
      if (raf != null) return;
      raf = window.requestAnimationFrame(() => {
        raf = null;
        const center = container.scrollLeft + container.clientWidth / 2;
        let bestIdx = 0;
        let bestDist = Number.POSITIVE_INFINITY;
        steps.forEach((step, i) => {
          const stepCenter = step.offsetLeft + step.offsetWidth / 2;
          const dist = Math.abs(stepCenter - center);
          if (dist < bestDist) {
            bestDist = dist;
            bestIdx = i;
          }
        });
        setActiveHowIndex(bestIdx);
      });
    };

    container.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => {
      window.clearTimeout(initial);
      container.removeEventListener('scroll', onScroll);
      if (raf != null) window.cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    // Blast reveal (ported from script.js, but kept lightweight)
    const wrapper = blastWrapperRef.current;
    if (!wrapper) return;

    const headline = blastHeadlineRef.current;
    const desc = blastDescriptionRef.current;

    let raf: number | null = null;

    const update = () => {
      raf = null;
      const rect = wrapper.getBoundingClientRect();
      const windowHeight = window.innerHeight || 1;

      const elementCenter = rect.top + rect.height / 2;
      const viewportCenter = windowHeight / 2;
      const distanceFromCenter = Math.abs(elementCenter - viewportCenter);
      const maxDistance = windowHeight * 0.8;
      const rawProgress = Math.max(0, Math.min(1, 1 - distanceFromCenter / maxDistance));

      const blueIntensity = rawProgress;
      const r = Math.floor(0 * (1 - blueIntensity) + 0 * blueIntensity);
      const g = Math.floor(17 * (1 - blueIntensity) + 51 * blueIntensity);
      const b = Math.floor(34 * (1 - blueIntensity) + 102 * blueIntensity);

      const topWhite = 'rgb(255, 255, 255)';
      const lightGrey1 = 'rgb(245, 245, 245)';
      const lightGrey2 = 'rgb(230, 230, 230)';
      const midGrey = 'rgb(160, 160, 160)';
      const darkGrey = 'rgb(40, 40, 40)';
      const midColor = `rgb(${r}, ${Math.floor(g * 0.7)}, ${Math.floor(b * 0.7)})`;
      const endColor = `rgb(${r}, ${g}, ${b})`;

      wrapper.style.background = `linear-gradient(
        180deg,
        ${topWhite} 0%,
        ${topWhite} 6%,
        ${lightGrey1} 14%,
        ${lightGrey2} 22%,
        ${midGrey} 38%,
        ${darkGrey} 52%,
        ${midColor} 72%,
        ${endColor} 100%
      )`;

      if (headline) {
        const clipPercent = (1 - rawProgress) * 100;
        headline.style.setProperty('--reveal-progress', `${clipPercent}%`);
      }

      if (desc) {
        const paragraphs = Array.from(desc.querySelectorAll('p'));
        paragraphs.forEach((p, index) => {
          const pReveal = Math.max(0, Math.min(1, rawProgress - index * 0.1));
          (p as HTMLParagraphElement).style.opacity = String(pReveal);
          (p as HTMLParagraphElement).style.transform = `translateX(${-20 * (1 - pReveal)}px)`;
        });
      }
    };

    const onScroll = () => {
      if (raf != null) return;
      raf = window.requestAnimationFrame(update);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    update();

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf != null) window.cancelAnimationFrame(raf);
    };
  }, []);

  const scrollHowToIndex = (idx: number) => {
    const container = workflowContainerRef.current;
    if (!container) return;
    const steps = Array.from(container.querySelectorAll<HTMLElement>('.workflow-step'));
    const clamped = Math.max(0, Math.min(steps.length - 1, idx));
    const step = steps[clamped];
    const containerWidth = container.clientWidth;
    const stepCenter = step.offsetLeft + step.offsetWidth / 2;
    const targetLeft = Math.max(0, stepCenter - containerWidth / 2);
    container.scrollTo({ left: targetLeft, behavior: 'smooth' });
  };

  return (
    <>
      {/* Navigation Bar */}
      <nav className="navbar" ref={(el) => (navbarRef.current = el)}>
        <div className="nav-container">
          <a href="#hero" className="logo">
            C2E
          </a>
          <ul className="nav-links">
            <li>
              <a href="#how-it-works">How it Works</a>
            </li>
            <li>
              <a href="#features">Features</a>
            </li>
            <li>
              <a href="#security">Security</a>
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

      {/* Hero Section */}
      <section className="hero" id="hero">
        <div className="gradient-mesh" />

        <div className="cloud-container">
          {/* Put `cloud.webp` into `frontend/public/cloud.webp` */}
          <img src="/cloud.webp" alt="Cloud" className="cloud-image" />
        </div>

        <div className="hero-center">
          <div className="hero-badge-container">
            <a href="#how-it-works" className="hero-badge">
              <div className="badge-label">
                <div className="badge-stat" />
                <div className="badge-text">Creator to Editor</div>
              </div>
              <div className="badge-arrow" aria-hidden="true">
                <svg width="5" height="8" viewBox="0 0 4.94 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M 0.94 0 L 0 0.94 L 3.053 4 L 0 7.06 L 0.94 8 L 4.94 4 Z"
                    fill="rgb(255,255,255)"
                  />
                </svg>
              </div>
            </a>
          </div>

          <h1 className="hero-headline">
            <div className="hero-line-1">From Creator to Editor,</div>
            <div className="hero-line-2" id="typing-text">
              {typingText}
            </div>
          </h1>

          <p className="hero-subtitle">
            Secure, instant video collaboration for professionals. No downloads. No public links. Just seamless editing.
          </p>

          <div className="hero-cta">
            <Link href="/login" className="btn-primary">
              Start Collaborating
            </Link>
            <a href="#how-it-works" className="btn-secondary">
              See How It Works
            </a>
          </div>
        </div>

        <div className="hero-right" aria-hidden="true">
          <div className="floating-card card-1">
            <div className="card-icon">🎬</div>
            <div className="card-label">Video File</div>
          </div>
          <div className="floating-card card-2">
            <div className="card-icon">📁</div>
            <div className="card-label">Project Folder</div>
          </div>
          <div className="floating-card card-3">
            <div className="card-icon">🔒</div>
            <div className="card-label">Secure Transfer</div>
          </div>
        </div>
      </section>

      {/* Blast Effect Section */}
      <div className="blast-effect-wrapper" ref={(el) => (blastWrapperRef.current = el)}>
        <div className="blast-content">
          <div className="blast-text-wrap">
            <h2 className="blast-headline" ref={(el) => (blastHeadlineRef.current = el)}>
              From Creator to Editor
              <br />
              in milliseconds
            </h2>
            <div className="blast-description" ref={(el) => (blastDescriptionRef.current = el)}>
              <p>Secure video collaboration that just works.</p>
              <p>No downloads. No public links.</p>
              <p>Direct integration with your editing software.</p>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <section className="how-it-works" id="how-it-works">
        <div className="how-it-works-sticky">
          <div className="section-container">
            <div className="how-header">
              <div className="how-pill">
                <span>How it works</span>
              </div>
              <h2 className="section-title">From upload to editor in four simple steps</h2>
              <p className="section-subtitle">
                See how C2E moves your footage from creator to editor with secure, production-ready speed.
              </p>
            </div>

            <div className="how-carousel" aria-label="How it works carousel">
              <div
                className="workflow-steps"
                role="region"
                aria-label="How it works steps"
                tabIndex={0}
                ref={(el) => (workflowContainerRef.current = el)}
              >
                {howSteps.map((step, idx) => (
                  <div
                    className="workflow-step"
                    data-step={idx + 1}
                    role="group"
                    aria-roledescription="slide"
                    aria-label={`Step ${idx + 1} of ${howSteps.length}`}
                    key={step.number}
                  >
                    <div className="step-visual">
                      <div className="step-icon">{step.icon}</div>
                    </div>
                    <div className="step-content">
                      <div className="step-number">{step.number}</div>
                      <h3 className="step-title">{step.title}</h3>
                      <p className="step-description">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="how-carousel-controls" aria-label="Carousel controls">
                <button
                  className="how-carousel-arrow how-carousel-prev"
                  type="button"
                  aria-label="Previous step"
                  onClick={() => scrollHowToIndex(activeHowIndex - 1)}
                  disabled={activeHowIndex <= 0}
                >
                  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                    <path
                      d="M15 18l-6-6 6-6"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

                <div className="how-carousel-dots" role="tablist" aria-label="Step navigation">
                  {howSteps.map((_, i) => (
                    <button
                      key={String(i)}
                      type="button"
                      className="how-carousel-dot"
                      role="tab"
                      aria-label={`Go to step ${i + 1}`}
                      aria-selected={i === activeHowIndex ? 'true' : 'false'}
                      onClick={() => scrollHowToIndex(i)}
                    />
                  ))}
                </div>

                <button
                  className="how-carousel-arrow how-carousel-next"
                  type="button"
                  aria-label="Next step"
                  onClick={() => scrollHowToIndex(activeHowIndex + 1)}
                  disabled={activeHowIndex >= howSteps.length - 1}
                >
                  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                    <path
                      d="M9 6l6 6-6 6"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features" id="features">
        <div className="section-container">
          <div className="features-header">
            <div className="how-pill">
              <span>Built for professionals</span>
            </div>
            <h2 className="features-title">Built for Professionals</h2>
            <p className="features-subtitle">Everything you need for secure, fast video collaboration.</p>
          </div>

          <div className="features-grid-new" aria-label="Collaboration features">
            {[
              { icon: '🔒', title: 'End-to-End Encryption', desc: 'Your files are encrypted from upload to delivery. Only you and your editor have access.' },
              { icon: '⚡', title: 'Direct App Integration', desc: 'Open files directly in DaVinci Resolve and Premiere Pro. No downloads, no hassle.' },
              { icon: '🚫', title: 'No Public Links', desc: 'Private sharing only. Your content never touches public cloud storage or unsafe links.' },
              { icon: '👥', title: 'Built for Creators & Editors', desc: 'Designed by professionals, for professionals. Streamlined workflows that just work.' },
              { icon: '⚡', title: 'Lightning Fast', desc: 'Optimized transfer speeds mean your files arrive in minutes, not hours.' },
              { icon: '🎯', title: 'Professional Workflow', desc: 'Seamless integration with your existing tools and processes. No learning curve.' },
            ].map((f) => (
              <div className="feature-card-new" key={f.title}>
                <div className="feature-icon-wrapper">
                  <div className="feature-icon">{f.icon}</div>
                </div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-description">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="security" id="security">
        <div className="section-container">
          <div className="security-header">
            <div className="how-pill">
              <span>Security first</span>
            </div>
            <h2 className="security-title">Security First</h2>
            <p className="security-subtitle">Your content is protected at every step</p>
          </div>

          <div className="security-grid">
            {[
              {
                icon: '🛡️',
                title: 'Military-Grade Encryption',
                desc: 'AES-256 encryption ensures your files are unreadable to anyone except authorized parties.',
              },
              {
                icon: '🔐',
                title: 'Zero-Knowledge Architecture',
                desc: "We can't see your files. Only you and your editor have the keys to decrypt your content.",
              },
              {
                icon: '✅',
                title: 'SOC 2 Compliant',
                desc: 'Enterprise-grade security standards you can trust for your most sensitive projects.',
              },
            ].map((s) => (
              <div className="security-card" key={s.title}>
                <div className="security-icon-wrapper">
                  <div className="security-icon">{s.icon}</div>
                </div>
                <h3 className="security-card-title">{s.title}</h3>
                <p className="security-card-description">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="section-container">
          <div className="footer-content">
            <div className="footer-brand">
              <a href="#hero" className="logo">
                C2E
              </a>
              <p>Secure video collaboration for creators and editors.</p>
            </div>
            <div className="footer-links">
              <div className="footer-column">
                <h4>Product</h4>
                <a href="#features">Features</a>
                <a href="#how-it-works">How it Works</a>
                <Link href="/pricing">Pricing</Link>
              </div>
              <div className="footer-column">
                <h4>Company</h4>
                <a href="#security">Security</a>
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

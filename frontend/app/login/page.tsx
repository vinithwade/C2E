'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import Link from 'next/link';
import Image from 'next/image';
import styles from './login.module.css';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteToken = searchParams.get('invite');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      // If there's an invite token, redirect to accept invite page
      if (inviteToken) {
        router.push(`/accept-invite?token=${inviteToken}`);
      } else {
      router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/auth/google`;
  };

  const handleGithubLogin = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/auth/github`;
  };

  return (
    <div className={styles.loginPage}>
      {/* Left: Carousel (hidden on mobile) */}
      <section className={styles.loginCarousel}>
        <div className={styles.carouselContent}>
          <div className={styles.carouselSlides}>
            <div className={styles.carouselSlide} role="group" aria-roledescription="slide">
              <Image 
                src="/login.png" 
                alt="Creator to Editor Workflow" 
                width={800}
                height={600}
                className={styles.carouselImage}
                priority
              />
              <div className={styles.carouselOverlay}></div>
            </div>
            <div className={styles.carouselSlide} role="group" aria-roledescription="slide">
              <Image 
                src="/login.png" 
                alt="Secure Video Transfer" 
                width={800}
                height={600}
                className={styles.carouselImage}
              />
              <div className={styles.carouselOverlay}>
                <h1 className={styles.carouselText}>Trusted by creators, editors and professionals.</h1>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Right: Login Form */}
      <div className={styles.loginFormSection}>
        <div className={styles.loginHeader}>
          <h1 className={styles.loginTitleWrapper}>
            <span className={styles.loginTitleMobile}>Welcome to </span>
            <Link href="/" className={styles.loginLogoText}>C2E</Link>
          </h1>
          <h1 className={styles.loginSubtitle}>The unified video collaboration API for creators and editors.</h1>
        </div>

        <form className={styles.loginForm} onSubmit={handleSubmit}>
          {error && (
            <div className={styles.errorMessage}>
              {error}
            </div>
          )}

          <div className={styles.formGroup}>
            <p className={styles.formLabel}>Email</p>
            <input
              className={styles.formInput}
              type="email"
              id="email"
              name="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <p className={styles.formLabel}>Password</p>
            <input
              className={styles.formInput}
              type="password"
              id="password"
              name="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <button className={styles.btnSubmit} type="submit" disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Log in to C2E'}
            </button>
          </div>
        </form>

        <div className={styles.formDivider}>
          <div className={styles.dividerLine}></div>
          <span className={styles.dividerText}>OR</span>
          <div className={styles.dividerLine}></div>
        </div>

        <div className={styles.socialButtons}>
          <button className={styles.btnSocial} type="button" onClick={handleGoogleLogin}>
            <span className={styles.btnSocialIcon}>
              <svg fill="none" height="25" viewBox="0 0 24 25" width="24" xmlns="http://www.w3.org/2000/svg">
                <title>Google</title>
                <path d="M21.8055 10.2563H21V10.2148H12V14.2148H17.6515C16.827 16.5433 14.6115 18.2148 12 18.2148C8.6865 18.2148 6 15.5283 6 12.2148C6 8.90134 8.6865 6.21484 12 6.21484C13.5295 6.21484 14.921 6.79184 15.9805 7.73434L18.809 4.90584C17.023 3.24134 14.634 2.21484 12 2.21484C6.4775 2.21484 2 6.69234 2 12.2148C2 17.7373 6.4775 22.2148 12 22.2148C17.5225 22.2148 22 17.7373 22 12.2148C22 11.5443 21.931 10.8898 21.8055 10.2563Z" fill="#FFC107"></path>
                <path d="M3.15234 7.56034L6.43784 9.96984C7.32684 7.76884 9.47984 6.21484 11.9993 6.21484C13.5288 6.21484 14.9203 6.79184 15.9798 7.73434L18.8083 4.90584C17.0223 3.24134 14.6333 2.21484 11.9993 2.21484C8.15834 2.21484 4.82734 4.38334 3.15234 7.56034Z" fill="#FF3D00"></path>
                <path d="M12.0002 22.2152C14.5832 22.2152 16.9302 21.2267 18.7047 19.6192L15.6097 17.0002C14.5721 17.7897 13.3039 18.2166 12.0002 18.2152C9.39916 18.2152 7.19066 16.5567 6.35866 14.2422L3.09766 16.7547C4.75266 19.9932 8.11366 22.2152 12.0002 22.2152Z" fill="#4CAF50"></path>
                <path d="M21.8055 10.2563H21V10.2148H12V14.2148H17.6515C17.2571 15.3231 16.5467 16.2914 15.608 17.0003L15.6095 16.9993L18.7045 19.6183C18.4855 19.8173 22 17.2148 22 12.2148C22 11.5443 21.931 10.8898 21.8055 10.2563Z" fill="#1976D2"></path>
              </svg>
            </span>
            <span className={styles.btnSocialText}>Continue with Google</span>
          </button>
          <button className={styles.btnSocial} type="button" onClick={handleGithubLogin}>
            <span className={styles.btnSocialIcon}>
              <svg fill="none" height="25" viewBox="0 0 26 25" width="26" xmlns="http://www.w3.org/2000/svg">
                <title>Github</title>
                <g clipPath="url(#clip0_2579_3356)">
                  <path clipRule="evenodd" d="M12.9635 0.214844C6.20975 0.214844 0.75 5.71484 0.75 12.5191C0.75 17.9581 4.24825 22.5621 9.10125 24.1916C9.708 24.3141 9.93025 23.9268 9.93025 23.6011C9.93025 23.3158 9.91025 22.3381 9.91025 21.3193C6.51275 22.0528 5.80525 19.8526 5.80525 19.8526C5.25925 18.4266 4.45025 18.0601 4.45025 18.0601C3.33825 17.3063 4.53125 17.3063 4.53125 17.3063C5.76475 17.3878 6.412 18.5693 6.412 18.5693C7.50375 20.4433 9.263 19.9138 9.97075 19.5878C10.0718 18.7933 10.3955 18.2433 10.7393 17.9378C8.0295 17.6526 5.1785 16.5933 5.1785 11.8671C5.1785 10.5226 5.6635 9.42259 6.432 8.56709C6.31075 8.26159 5.886 6.99834 6.5535 5.30759C6.5535 5.30759 7.58475 4.98159 9.91 6.57059C10.9055 6.30126 11.9322 6.16425 12.9635 6.16309C13.9948 6.16309 15.046 6.30584 16.0168 6.57059C18.3423 4.98159 19.3735 5.30759 19.3735 5.30759C20.041 6.99834 19.616 8.26159 19.4948 8.56709C20.2835 9.42259 20.7485 10.5226 20.7485 11.8671C20.7485 16.5933 17.8975 17.6321 15.1675 17.9378C15.6125 18.3248 15.9965 19.0581 15.9965 20.2193C15.9965 21.8693 15.9765 23.1936 15.9765 23.6008C15.9765 23.9268 16.199 24.3141 16.8055 24.1918C21.6585 22.5618 25.1568 17.9581 25.1568 12.5191C25.1768 5.71484 19.697 0.214844 12.9635 0.214844Z" fill="currentColor" fillRule="evenodd"></path>
                </g>
                <defs>
                  <clipPath id="clip0_2579_3356">
                    <rect fill="currentColor" height="24" transform="translate(0.75 0.214844)" width="24.5"></rect>
                  </clipPath>
                </defs>
              </svg>
            </span>
            <span className={styles.btnSocialText}>Continue with Github</span>
          </button>
        </div>

        <p className={styles.loginFooter}>
          By continuing, you agree to our{' '}
          <span className="inline-block">
            <a href="#">Terms</a> and <a href="#">Privacy Policy</a>.
          </span>
        </p>

        <p className={styles.loginFooter} style={{ marginTop: '1rem' }}>
          Don't have an account?{' '}
          <Link href="/register" style={{ color: '#0066FF', textDecoration: 'underline' }}>
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-white p-4">
        <div className="text-center">
          <div className="animate-pulse">Loading...</div>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}

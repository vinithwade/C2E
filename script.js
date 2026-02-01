// ============================================
// Typing Animation
// ============================================

function typeWriter(element, text, speed = 100) {
    let i = 0;
    element.textContent = '';
    
    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

// Initialize typing animation when page loads
document.addEventListener('DOMContentLoaded', function() {
    const typingElement = document.getElementById('typing-text');
    if (typingElement) {
        // Wait for hero headline to fade in
        setTimeout(() => {
            typeWriter(typingElement, 'Securely & Instantly.', 80);
        }, 1000);
    }

    // Navbar scroll detection
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        function handleScroll() {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }
        
        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll(); // Check initial state
    }
});

// ============================================
// Scroll-triggered Animations
// ============================================

const observerOptions = {
    threshold: 0.2,
    rootMargin: '0px 0px -100px 0px'
};

// Base scroll position when first step is centered
let howItWorksBaseScroll = 0;

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

// Observe workflow steps
document.addEventListener('DOMContentLoaded', function() {
    const workflowSteps = document.querySelectorAll('.workflow-step');
    workflowSteps.forEach(step => {
        observer.observe(step);
    });
    
    // Center the first step on load
    const workflowStepsContainer = document.querySelector('.workflow-steps');
    if (workflowStepsContainer && workflowSteps.length > 0) {
        const firstStep = workflowSteps[0];
        // Scroll to center the first step
        setTimeout(() => {
            const containerWidth = workflowStepsContainer.offsetWidth;
            const stepWidth = firstStep.offsetWidth;
            const scrollPosition = firstStep.offsetLeft - (containerWidth / 2) + (stepWidth / 2);
            const clamped = Math.max(0, scrollPosition);
            workflowStepsContainer.scrollTo({
                left: clamped,
                behavior: 'auto'
            });
            howItWorksBaseScroll = clamped;
        }, 100);
    }

    // Framer-style carousel controls (dots + arrows) for "How it works"
    const howCarousel = document.querySelector('.how-carousel');
    const howDots = document.querySelector('.how-carousel-dots');
    const howPrev = document.querySelector('.how-carousel-prev');
    const howNext = document.querySelector('.how-carousel-next');
    const howItWorksSection = document.querySelector('#how-it-works');

    // When the user uses controls, temporarily stop scroll-driving so the click animation isn't overridden
    let howControlsOverrideUntil = 0;

    const getCenteredIndex = () => {
        if (!workflowStepsContainer || workflowSteps.length === 0) return 0;
        const center = workflowStepsContainer.scrollLeft + workflowStepsContainer.clientWidth / 2;
        let bestIdx = 0;
        let bestDist = Infinity;
        workflowSteps.forEach((step, i) => {
            const stepCenter = step.offsetLeft + step.offsetWidth / 2;
            const dist = Math.abs(stepCenter - center);
            if (dist < bestDist) {
                bestDist = dist;
                bestIdx = i;
            }
        });
        return bestIdx;
    };

    const scrollStepIntoCenter = (idx, behavior = 'smooth') => {
        if (!workflowStepsContainer || workflowSteps.length === 0) return;
        const clampedIdx = Math.max(0, Math.min(workflowSteps.length - 1, idx));
        const step = workflowSteps[clampedIdx];
        const containerWidth = workflowStepsContainer.clientWidth;
        const stepCenter = step.offsetLeft + step.offsetWidth / 2;
        const targetLeft = Math.max(0, stepCenter - containerWidth / 2);

        howControlsOverrideUntil = Date.now() + 900;
        workflowStepsContainer.scrollTo({ left: targetLeft, behavior });
    };

    const renderDots = () => {
        if (!howDots || workflowSteps.length === 0) return;
        howDots.innerHTML = '';
        workflowSteps.forEach((_, i) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'how-carousel-dot';
            btn.setAttribute('role', 'tab');
            btn.setAttribute('aria-label', `Go to step ${i + 1}`);
            btn.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
            btn.addEventListener('click', () => scrollStepIntoCenter(i, 'smooth'));
            howDots.appendChild(btn);
        });
    };

    const syncControls = () => {
        const idx = getCenteredIndex();
        if (howDots) {
            const dots = howDots.querySelectorAll('.how-carousel-dot');
            dots.forEach((d, i) => d.setAttribute('aria-selected', i === idx ? 'true' : 'false'));
        }
        if (howPrev) howPrev.disabled = idx <= 0;
        if (howNext) howNext.disabled = idx >= workflowSteps.length - 1;
    };

    if (howCarousel && workflowStepsContainer && howDots && howPrev && howNext) {
        renderDots();
        // Sync once after initial centering has happened
        setTimeout(syncControls, 160);

        howPrev.addEventListener('click', () => {
            const idx = getCenteredIndex();
            scrollStepIntoCenter(idx - 1, 'smooth');
        });
        howNext.addEventListener('click', () => {
            const idx = getCenteredIndex();
            scrollStepIntoCenter(idx + 1, 'smooth');
        });

        // Keep dots in sync as the user scrolls (either manually or via scroll-driving)
        let dotsRaf = null;
        workflowStepsContainer.addEventListener('scroll', () => {
            if (dotsRaf != null) return;
            dotsRaf = requestAnimationFrame(() => {
                dotsRaf = null;
                syncControls();
            });
        }, { passive: true });
    }

    // Vertical scroll drives horizontal carousel (scroll down → cards move left)
    if (workflowStepsContainer && howItWorksSection) {
        let rafId = null;
        let isAnimating = false;
        let currentLeft = workflowStepsContainer.scrollLeft;
        let targetLeft = workflowStepsContainer.scrollLeft;

        const updateHowItWorksCarousel = () => {
            rafId = null;
            // If the user is using the carousel controls, don't override with scroll-driving
            if (Date.now() < howControlsOverrideUntil) return;

            const rect = howItWorksSection.getBoundingClientRect();
            const viewportH = window.innerHeight || 1;

            // Progress from when section top hits viewport bottom (0)
            // to when section bottom hits viewport top (1)
            const start = viewportH;
            const end = -rect.height;
            const t = (start - rect.top) / (start - end);
            const progress = Math.max(0, Math.min(1, t));

            const maxScroll = workflowStepsContainer.scrollWidth - workflowStepsContainer.clientWidth;
            if (maxScroll <= 0) return;

            // Start from the centered first step and move through all steps
            const base = howItWorksBaseScroll || 0;
            const clampedBase = Math.min(base, maxScroll);
            targetLeft = clampedBase + (maxScroll - clampedBase) * progress;

            // Mark section as scroll-driven only while we're actively mapping scroll to the carousel
            // (prevents snap jitter)
            const isInRange = progress > 0 && progress < 1;
            howItWorksSection.classList.toggle('is-scroll-driven', isInRange);

            // Start a smooth animation loop toward the targetLeft
            if (!isAnimating) {
                isAnimating = true;
                currentLeft = workflowStepsContainer.scrollLeft;
                requestAnimationFrame(animateCarousel);
            }
        };

        const animateCarousel = () => {
            // Ease toward targetLeft (smooth, no jumps)
            const delta = targetLeft - currentLeft;
            currentLeft += delta * 0.14; // smoothing factor

            // Snap when close enough to avoid micro-jitter
            if (Math.abs(delta) < 0.5) {
                currentLeft = targetLeft;
            }

            workflowStepsContainer.scrollLeft = currentLeft;

            // Keep animating while we still need to move
            if (Math.abs(targetLeft - currentLeft) > 0.5) {
                requestAnimationFrame(animateCarousel);
                return;
            }

            isAnimating = false;
        };

        const onScroll = () => {
            if (rafId != null) return;
            rafId = window.requestAnimationFrame(updateHowItWorksCarousel);
        };

        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll, { passive: true });
        updateHowItWorksCarousel();
    }

    // Animate feature cards with Intersection Observer (new grid layout)
    const featureCardsNew = document.querySelectorAll('.feature-card-new');
    
    if (featureCardsNew.length > 0) {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const cardObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.classList.add('visible');
                    }, index * 100); // Stagger animation
                    cardObserver.unobserve(entry.target);
                }
            });
        }, observerOptions);

        featureCardsNew.forEach((card) => {
            cardObserver.observe(card);
        });
    }

    // Scroll-driven sequential reveal for feature cards (one at a time at same spot, with scroll-locking) - OLD VERSION
    const featuresSection = document.querySelector('#features');
    const featureCards = document.querySelectorAll('.feature-card');
    
    if (featuresSection && featureCards.length > 0) {
        let featuresRafId = null;
        
        const updateFeatureCards = () => {
            featuresRafId = null;
            
            const rect = featuresSection.getBoundingClientRect();
            const viewportH = window.innerHeight || 1;
            
            // Calculate scroll progress through the section (similar to how-it-works)
            // Start revealing when section top enters viewport (reaches viewport bottom)
            // Finish when section bottom exits viewport (reaches viewport top)
            const start = viewportH;
            const end = -rect.height;
            const t = (start - rect.top) / (start - end);
            const progress = Math.max(0, Math.min(1, t));
            
            // Only start showing cards when section is actually in viewport
            // Progress starts at 0 when section top reaches viewport bottom
            // We want the first card to start appearing only when progress > 0
            const cardCount = featureCards.length;
            
            // If section hasn't entered viewport yet, hide all cards
            if (progress <= 0) {
                featureCards.forEach((card) => {
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(100px)';
                    card.classList.remove('visible');
                });
                return;
            }
            
            // Map progress (0-1) to card transitions (0 to cardCount)
            // Each card gets a portion of the scroll, with overlap for smooth transitions
            
            // Calculate which card should be visible based on scroll progress
            // Each card occupies a portion of the scroll, with smooth transitions
            const cardPortion = 1 / cardCount; // Each card gets 1/cardCount of the scroll
            
            featureCards.forEach((card, index) => {
                // Calculate the progress range for this card
                const cardStart = index * cardPortion;
                const cardEnd = (index + 1) * cardPortion;
                
                // Calculate how far through this card's range we are
                let cardProgress;
                if (progress < cardStart) {
                    // Before this card's range
                    cardProgress = 0;
                } else if (progress > cardEnd) {
                    // After this card's range
                    cardProgress = 1;
                } else {
                    // Within this card's range
                    cardProgress = (progress - cardStart) / (cardEnd - cardStart);
                }
                
                // Fade thresholds: card is fully visible from 0.2 to 0.8 of its range
                // This ensures each card stays visible longer
                const fadeInEnd = 0.2; // Card fully visible after 20% of its range
                const fadeOutStart = 0.8; // Card starts fading out at 80% of its range
                
                let opacity;
                let translateY;
                
                if (cardProgress < fadeInEnd) {
                    // Fading in - starts from below, moves to center
                    opacity = cardProgress / fadeInEnd;
                    // Start at 100px (below), move to 0px (center) as it fades in
                    translateY = 100 - (opacity * 100);
                } else if (cardProgress > fadeOutStart) {
                    // Fading out - moves from center upward
                    const fadeOutProgress = (cardProgress - fadeOutStart) / (1 - fadeOutStart);
                    opacity = 1 - fadeOutProgress;
                    // Move from 0px (center) to -100px (above) as it fades out
                    translateY = -100 * fadeOutProgress;
                } else {
                    // Fully visible - centered at 0px
                    opacity = 1;
                    translateY = 0;
                }
                
                opacity = Math.max(0, Math.min(1, opacity));
                
                // Apply opacity and transform with circular upward motion
                card.style.opacity = opacity;
                card.style.transform = `translateY(${translateY}px)`;
                
                if (opacity > 0) {
                    card.classList.add('visible');
                } else {
                    card.classList.remove('visible');
                }
            });
        };
        
        const onFeaturesScroll = () => {
            if (featuresRafId != null) return;
            featuresRafId = window.requestAnimationFrame(updateFeatureCards);
        };
        
        window.addEventListener('scroll', onFeaturesScroll, { passive: true });
        window.addEventListener('resize', onFeaturesScroll, { passive: true });
        updateFeatureCards();
    }

    // Animate security cards with Intersection Observer
    const securityCards = document.querySelectorAll('.security-card');
    
    if (securityCards.length > 0) {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const securityObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.classList.add('visible');
                    }, index * 100); // Stagger animation
                    securityObserver.unobserve(entry.target);
                }
            });
        }, observerOptions);

        securityCards.forEach((card) => {
            securityObserver.observe(card);
        });
    }

    // Scroll-based blast effect reveal
    const blastWrapper = document.querySelector('.blast-effect-wrapper');
    const blastHeadline = document.querySelector('.blast-headline');
    const blastDescription = document.querySelector('.blast-description');
    
    if (blastWrapper) {
        let blastLocked = false;

        function updateBlastReveal() {
            const rect = blastWrapper.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            
            // Calculate element center position relative to viewport center
            const elementCenter = rect.top + (rect.height / 2);
            const viewportCenter = windowHeight / 2;
            const distanceFromCenter = Math.abs(elementCenter - viewportCenter);

            // Lock once the viewport center has passed the section center (scrolling down),
            // so it doesn't start hiding again while continuing to scroll down.
            // Unlock when scrolling up above the section center.
            const elementCenterY = window.scrollY + elementCenter;
            const viewportCenterY = window.scrollY + viewportCenter;
            blastLocked = viewportCenterY >= elementCenterY;
            
            // Calculate scroll progress (0 to 1)
            // Fully revealed when element is centered (distance = 0)
            // Start revealing when element enters viewport, fully revealed at center
            const maxDistance = windowHeight * 0.8; // Start revealing when this far from center
            const rawProgress = Math.max(0, Math.min(1, 1 - (distanceFromCenter / maxDistance)));
            const scrollProgress = blastLocked ? 1 : rawProgress;
            
            // Update background color (smooth from white to black/blue)
            const blueIntensity = scrollProgress;
            const r = Math.floor(0 * (1 - blueIntensity) + 0 * blueIntensity);
            const g = Math.floor(17 * (1 - blueIntensity) + 51 * blueIntensity);
            const b = Math.floor(34 * (1 - blueIntensity) + 102 * blueIntensity);
            
            // Colors for smooth blend:
            // - Start from pure white at the very top (to match hero background)
            // - Quickly move through light greys into dark / blue as we go down
            const topWhite = 'rgb(255, 255, 255)';
            const lightGrey1 = 'rgb(245, 245, 245)';
            const lightGrey2 = 'rgb(230, 230, 230)';
            const midGrey = 'rgb(160, 160, 160)';
            const darkGrey = 'rgb(40, 40, 40)';
            const midColor = `rgb(${r}, ${Math.floor(g * 0.7)}, ${Math.floor(b * 0.7)})`;
            const endColor = `rgb(${r}, ${g}, ${b})`;

            blastWrapper.style.background = `
                linear-gradient(
                    180deg,
                    ${topWhite} 0%,
                    ${topWhite} 6%,
                    ${lightGrey1} 14%,
                    ${lightGrey2} 22%,
                    ${midGrey} 38%,
                    ${darkGrey} 52%,
                    ${midColor} 72%,
                    ${endColor} 100%
                )
            `;
            
            // Update headline reveal (clip-path from right to left)
            // Reveals/unreveals based on scroll position
            if (blastHeadline) {
                const headlineReveal = scrollProgress;
                const clipPercent = (1 - headlineReveal) * 100;
                blastHeadline.style.setProperty('--reveal-progress', `${clipPercent}%`);
            }
            
            // Update description reveal (fade in paragraphs)
            // Reveals/unreveals based on scroll position
            if (blastDescription) {
                // Reveal paragraphs with stagger
                const paragraphs = blastDescription.querySelectorAll('p');
                paragraphs.forEach((p, index) => {
                    const pReveal = Math.max(0, Math.min(1, scrollProgress - (index * 0.1)));
                    p.style.opacity = pReveal;
                    p.style.transform = `translateX(${-20 * (1 - pReveal)}px)`;
                });
            }
        }
        
        window.addEventListener('scroll', updateBlastReveal, { passive: true });
        updateBlastReveal(); // Initial call
    }
});

// ============================================
// Parallax Effect for Hero
// ============================================

let lastScrollY = 0;
let ticking = false;

function updateParallax() {
    const scrollY = window.scrollY;
    const hero = document.querySelector('.hero');
    
    if (hero && scrollY < window.innerHeight) {
        const parallaxSpeed = 0.5;
        const yPos = scrollY * parallaxSpeed;
        
        // Apply parallax to floating cards
        const floatingCards = document.querySelectorAll('.floating-card');
        floatingCards.forEach((card, index) => {
            const offset = (index + 1) * 20;
            card.style.transform = `translateY(${-yPos + offset}px)`;
        });

        // Apply parallax to network nodes
        const networkNodes = document.querySelectorAll('.network-node');
        networkNodes.forEach((node, index) => {
            const offset = (index + 1) * 15;
            node.style.transform = `translateY(${yPos * 0.3 + offset}px)`;
        });

        // Fade out hero content as user scrolls
        const heroCenter = document.querySelector('.hero-center');
        if (heroCenter) {
            const opacity = Math.max(0, 1 - scrollY / window.innerHeight);
            heroCenter.style.opacity = opacity;
        }
    }
    
    lastScrollY = scrollY;
    ticking = false;
}

function requestTick() {
    if (!ticking) {
        window.requestAnimationFrame(updateParallax);
        ticking = true;
    }
}

window.addEventListener('scroll', requestTick);

// ============================================
// Enhanced Smooth Scroll for Navigation Links
// ============================================

// Custom easing function for smooth animation
function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// Smooth scroll function with custom animation
function smoothScrollTo(targetElement, duration = 1000) {
    const targetPosition = targetElement.offsetTop - 80; // Account for fixed navbar
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    let startTime = null;

    function animation(currentTime) {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const progress = Math.min(timeElapsed / duration, 1);
        
        // Apply easing
        const ease = easeInOutCubic(progress);
        
        window.scrollTo(0, startPosition + distance * ease);
        
        if (timeElapsed < duration) {
            requestAnimationFrame(animation);
        }
    }

    requestAnimationFrame(animation);
}

// Handle anchor links with smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        
        // Skip if it's an empty hash or just "#"
        if (href === '#' || !href) {
            return;
        }
        
        // Only handle same-page anchor links (not cross-page links like "index.html#section")
        if (href.startsWith('#') && !href.includes('.html')) {
            e.preventDefault();
            const target = document.querySelector(href);
            
            if (target) {
                // Smooth scroll to target with custom easing - fast and snappy
                smoothScrollTo(target, 400);
            }
        }
    });
});

// ============================================
// Enhanced Hover Effects
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // Add glow effect on hover for CTA buttons
    const ctaButtons = document.querySelectorAll('.cta-button, .btn-primary, .btn-pricing');
    ctaButtons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.boxShadow = '0 8px 24px rgba(0, 102, 255, 0.4)';
        });
        button.addEventListener('mouseleave', function() {
            this.style.boxShadow = '';
        });
    });

    // Enhanced card hover effects
    const cards = document.querySelectorAll('.feature-card, .pricing-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transition = 'all 0.3s ease';
        });
    });
});

// ============================================
// Network Animation Enhancement
// ============================================

// Data flow particles are now defined in HTML

// ============================================
// Page Transition Animation - REMOVED
// Pages now navigate instantly without transitions
// ============================================

// ============================================
// Mobile Menu Toggle (if needed)
// ============================================

// Add mobile menu functionality if needed in the future
function initMobileMenu() {
    // This can be expanded if mobile menu is needed
}

// ============================================
// Performance Optimization
// ============================================

// Debounce function for scroll events
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Optimize scroll handler
const optimizedParallax = debounce(updateParallax, 10);
window.addEventListener('scroll', optimizedParallax, { passive: true });

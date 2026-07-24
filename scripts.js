/* ==========================================================================
   MI DEV - INTERACTIVE JAVASCRIPT ENGINE
   GSAP + ScrollTrigger + Three.js + Lenis + Modern UI/UX Logic
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    // =========================================================================
    // 1. LENIS SMOOTH SCROLL INITIALIZATION
    // =========================================================================
    let lenis;
    try {
        lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            touchMultiplier: 2,
            infinite: false
        });

        lenis.on('scroll', ScrollTrigger.update);

        gsap.ticker.add((time) => {
            lenis.raf(time * 1000);
        });

        gsap.ticker.lagSmoothing(0);
    } catch (e) {
        console.warn('Lenis Smooth Scroll fallback:', e);
    }

    // =========================================================================
    // 2. LOADER INICIAL & ANIMAÇÃO DE ENTRADA
    // =========================================================================
    const preloader = document.getElementById('preloader');
    const loaderPercent = document.getElementById('loader-percent');
    const loaderBar = document.getElementById('loader-bar');

    // Simulate progress counter
    let progress = 0;
    const progressInterval = setInterval(() => {
        progress += Math.floor(Math.random() * 12) + 1;
        if (progress >= 100) {
            progress = 100;
            clearInterval(progressInterval);
            finishPreloader();
        }
        if (loaderPercent) loaderPercent.textContent = progress;
        if (loaderBar) loaderBar.style.width = `${progress}%`;
    }, 80);

    function finishPreloader() {
        if (!preloader) return;

        const tl = gsap.timeline({
            onComplete: () => {
                preloader.style.display = 'none';
                initHeroAnimations();
            }
        });

        tl.to('.loader-content', {
            opacity: 0,
            y: -30,
            duration: 0.6,
            ease: 'power3.inOut'
        })
            .to(preloader, {
                yPercent: -100,
                duration: 0.8,
                ease: 'power4.inOut'
            }, '-=0.2');
    }

    // Fallback timer for preloader
    setTimeout(() => {
        if (preloader && preloader.style.display !== 'none') {
            finishPreloader();
        }
    }, 4500);

    // =========================================================================
    // 3. THREE.JS 3D PARTICLES BACKGROUND ENGINE
    // =========================================================================
    const canvas = document.getElementById('bg-canvas');
    if (canvas) {
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });

        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Particle Geometry
        const particleCount = window.innerWidth < 768 ? 400 : 900;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);

        const colorRed = new THREE.Color('#ff1c24');
        const colorDarkRed = new THREE.Color('#80000b');
        const colorWhite = new THREE.Color('#ffffff');

        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 40;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 40;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 40;

            const randColor = Math.random();
            let c = colorDarkRed;
            if (randColor > 0.8) c = colorRed;
            else if (randColor > 0.95) c = colorWhite;

            colors[i * 3] = c.r;
            colors[i * 3 + 1] = c.g;
            colors[i * 3 + 2] = c.b;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        // Particle Material
        const material = new THREE.PointsMaterial({
            size: 0.12,
            vertexColors: true,
            transparent: true,
            opacity: 0.7,
            blending: THREE.AdditiveBlending
        });

        const particleSystem = new THREE.Points(geometry, material);
        scene.add(particleSystem);

        camera.position.z = 20;

        // Interactive Mouse Physics
        let targetX = 0;
        let targetY = 0;
        let mouseX = 0;
        let mouseY = 0;

        window.addEventListener('mousemove', (e) => {
            mouseX = (e.clientX - window.innerWidth / 2) * 0.001;
            mouseY = (e.clientY - window.innerHeight / 2) * 0.001;
        });

        // Animation Render Loop
        const clock = new THREE.Clock();
        function animateThree() {
            requestAnimationFrame(animateThree);

            const elapsedTime = clock.getElapsedTime();

            targetX += (mouseX - targetX) * 0.05;
            targetY += (mouseY - targetY) * 0.05;

            particleSystem.rotation.y = elapsedTime * 0.03 + targetX * 2;
            particleSystem.rotation.x = elapsedTime * 0.02 + targetY * 2;

            renderer.render(scene, camera);
        }
        animateThree();

        // Responsive Resize
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    // =========================================================================
    // 4. CUSTOM MAGNETIC CURSOR
    // =========================================================================
    const cursorDot = document.getElementById('cursor-dot');
    const cursorFollower = document.getElementById('cursor-follower');

    if (cursorDot && cursorFollower) {
        let posX = 0, posY = 0;
        let mouseX = 0, mouseY = 0;

        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;

            cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
        });

        function renderCursor() {
            posX += (mouseX - posX) * 0.15;
            posY += (mouseY - posY) * 0.15;

            cursorFollower.style.transform = `translate(${posX}px, ${posY}px) translate(-50%, -50%)`;
            requestAnimationFrame(renderCursor);
        }
        renderCursor();

        // Hover expand target bindings
        const interactiveElements = document.querySelectorAll('a, button, .glass-card, .magnetic-target');
        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
            el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
        });
    }

    // =========================================================================
    // 5. HERO ANIMATIONS (SPLIT TYPE & GSAP REVEALS)
    // =========================================================================
    function initHeroAnimations() {
        const heroTitle = document.getElementById('hero-title');

        if (heroTitle && typeof SplitType !== 'undefined') {
            const split = new SplitType(heroTitle, { types: 'words, chars' });
            gsap.from(split.words, {
                opacity: 0,
                y: 40,
                rotateX: -45,
                duration: 1,
                stagger: 0.04,
                ease: 'power4.out'
            });
        } else {
            gsap.from('#hero-title', { opacity: 0, y: 40, duration: 1, ease: 'power4.out' });
        }

        gsap.from('.hero-badge', { opacity: 0, y: -20, duration: 0.8, delay: 0.2 });
        gsap.from('#hero-subtitle', { opacity: 0, y: 30, duration: 0.8, delay: 0.4 });
        gsap.from('.hero-cta-group', { opacity: 0, y: 30, duration: 0.8, delay: 0.6 });
        gsap.from('.hero-tech-pills', { opacity: 0, y: 20, duration: 0.8, delay: 0.8 });
    }

    // =========================================================================
    // 6. SCROLLTRIGGER ANIMATIONS & REVEALS
    // =========================================================================
    gsap.registerPlugin(ScrollTrigger);

    // Navbar Scroll Background Toggle
    const navbar = document.getElementById('navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }

    // Generic Fade-Up Animations
    gsap.utils.toArray('.why-card, .service-card, .section-header, .testimonial-card').forEach(el => {
        gsap.from(el, {
            scrollTrigger: {
                trigger: el,
                start: 'top 85%',
                toggleActions: 'play none none reverse'
            },
            opacity: 0,
            y: 40,
            duration: 0.8,
            ease: 'power3.out'
        });
    });

    // Stats Counter Animation
    const statNumbers = document.querySelectorAll('.stat-number');
    statNumbers.forEach(stat => {
        const target = parseInt(stat.getAttribute('data-target'), 10);

        ScrollTrigger.create({
            trigger: stat,
            start: 'top 85%',
            onEnter: () => {
                gsap.to(stat, {
                    innerText: target,
                    duration: 2,
                    snap: { innerText: 1 },
                    ease: 'power2.out',
                    onUpdate: function () {
                        stat.textContent = Math.ceil(this.targets()[0].innerText);
                        if (target === 50) stat.textContent = `+${stat.textContent}`;
                    }
                });
            }
        });
    });

    // Timeline Progress Line ScrollTrigger
    const timelineProgress = document.getElementById('timeline-progress');
    const timelineSection = document.querySelector('.timeline-container');
    const timelineSteps = document.querySelectorAll('.timeline-step');

    if (timelineProgress && timelineSection) {
        gsap.to(timelineProgress, {
            scrollTrigger: {
                trigger: timelineSection,
                start: 'top 60%',
                end: 'bottom 60%',
                scrub: true
            },
            height: '100%',
            ease: 'none'
        });

        timelineSteps.forEach(step => {
            ScrollTrigger.create({
                trigger: step,
                start: 'top 70%',
                onEnter: () => step.classList.add('active'),
                onLeaveBack: () => step.classList.remove('active')
            });
        });
    }

    // =========================================================================
    // 7. CARD SPOTLIGHT & 3D TILT EFFECT
    // =========================================================================
    const tiltCards = document.querySelectorAll('.tilt-target, .glass-card');
    tiltCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);

            // Subtle 3D tilt
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / 25;
            const rotateY = (centerX - x) / 25;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
        });
    });

    // Showcase Device 3D Parallax Tilt
    const devicesWrapper = document.getElementById('devices-wrapper');
    const laptopMockup = document.querySelector('.laptop-mockup');

    if (devicesWrapper && laptopMockup) {
        devicesWrapper.addEventListener('mousemove', (e) => {
            const rect = devicesWrapper.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;

            laptopMockup.style.transform = `rotateY(${x * 12}deg) rotateX(${-y * 12}deg)`;
        });

        devicesWrapper.addEventListener('mouseleave', () => {
            laptopMockup.style.transform = 'rotateY(0deg) rotateX(0deg)';
        });
    }

    // =========================================================================
    // 8. TESTIMONIALS MANUAL SLIDER & EXPANDED MODAL
    // =========================================================================
    const track = document.getElementById('testimonial-track');
    const prevBtn = document.getElementById('testimonial-prev');
    const nextBtn = document.getElementById('testimonial-next');
    const dotsContainer = document.getElementById('testimonial-dots');

    if (track) {
        const cards = Array.from(track.children);
        let currentIndex = 0;

        // Calculate visible cards based on screen size
        function getCardsPerView() {
            if (window.innerWidth <= 640) return 1;
            if (window.innerWidth <= 992) return 2;
            return 3;
        }

        function getMaxIndex() {
            const visibleCards = getCardsPerView();
            return Math.max(0, cards.length - visibleCards);
        }

        // Render pagination dots
        function renderDots() {
            if (!dotsContainer) return;
            dotsContainer.innerHTML = '';
            const maxIndex = getMaxIndex();

            for (let i = 0; i <= maxIndex; i++) {
                const dot = document.createElement('div');
                dot.classList.add('dot');
                if (i === currentIndex) dot.classList.add('active');
                dot.addEventListener('click', () => goToSlide(i));
                dotsContainer.appendChild(dot);
            }
        }

        // Move slider to target index
        function goToSlide(index) {
            const maxIndex = getMaxIndex();
            currentIndex = Math.max(0, Math.min(index, maxIndex));

            const cardWidth = cards[0].offsetWidth;
            const gap = 24; // matches CSS gap
            const translateX = -(currentIndex * (cardWidth + gap));

            track.style.transform = `translateX(${translateX}px)`;

            // Update navigation button states
            if (prevBtn) prevBtn.disabled = (currentIndex === 0);
            if (nextBtn) nextBtn.disabled = (currentIndex >= maxIndex);

            // Update pagination dots
            if (dotsContainer) {
                const dots = dotsContainer.querySelectorAll('.dot');
                dots.forEach((dot, idx) => {
                    dot.classList.toggle('active', idx === currentIndex);
                });
            }
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                if (currentIndex > 0) goToSlide(currentIndex - 1);
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                const maxIndex = getMaxIndex();
                if (currentIndex < maxIndex) goToSlide(currentIndex + 1);
            });
        }

        // Responsive resize listener
        window.addEventListener('resize', () => {
            renderDots();
            goToSlide(currentIndex);
        });

        // Initialize slider
        renderDots();
        goToSlide(0);

        // Touch Swipe Navigation
        let startX = 0;
        let isDragging = false;

        track.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            isDragging = true;
        }, { passive: true });

        track.addEventListener('touchend', (e) => {
            if (!isDragging) return;
            const endX = e.changedTouches[0].clientX;
            const diffX = startX - endX;

            if (Math.abs(diffX) > 50) {
                if (diffX > 0 && currentIndex < getMaxIndex()) {
                    goToSlide(currentIndex + 1);
                } else if (diffX < 0 && currentIndex > 0) {
                    goToSlide(currentIndex - 1);
                }
            }
            isDragging = false;
        });

        // =========================================================================
        // TESTIMONIAL EXPANDED MODAL LOGIC (DESFOCADO)
        // =========================================================================
        const modal = document.getElementById('testimonial-modal');
        const modalClose = document.getElementById('modal-close');
        const modalStars = document.getElementById('modal-stars');
        const modalText = document.getElementById('modal-text');
        const modalAvatar = document.getElementById('modal-avatar');
        const modalName = document.getElementById('modal-name');
        const modalRole = document.getElementById('modal-role');

        cards.forEach(card => {
            card.addEventListener('click', () => {
                const starsHTML = card.querySelector('.stars')?.innerHTML || '';
                const text = card.querySelector('.testimonial-text')?.textContent || '';
                const avatar = card.querySelector('.author-avatar')?.textContent || '';
                const name = card.querySelector('.author-info h4')?.textContent || '';
                const role = card.querySelector('.author-info span')?.textContent || '';

                if (modalStars) modalStars.innerHTML = starsHTML;
                if (modalText) modalText.textContent = text;
                if (modalAvatar) modalAvatar.textContent = avatar;
                if (modalName) modalName.textContent = name;
                if (modalRole) modalRole.textContent = role;

                if (modal) {
                    modal.classList.add('active');
                    modal.setAttribute('aria-hidden', 'false');
                    document.body.style.overflow = 'hidden';
                    if (typeof lenis !== 'undefined' && lenis) lenis.stop();

                    if (typeof lucide !== 'undefined') {
                        lucide.createIcons();
                    }
                }
            });
        });

        function closeModal() {
            if (modal && modal.classList.contains('active')) {
                modal.classList.remove('active');
                modal.setAttribute('aria-hidden', 'true');
                document.body.style.overflow = '';
                if (typeof lenis !== 'undefined' && lenis) lenis.start();
            }
        }

        if (modalClose) {
            modalClose.addEventListener('click', (e) => {
                e.stopPropagation();
                closeModal();
            });
        }

        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    closeModal();
                }
            });
        }

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeModal();
            }
        });
    }

    // =========================================================================
    // 9. MOBILE MENU DRAWER & SMOOTH NAVIGATION
    // =========================================================================
    const mobileToggle = document.getElementById('mobile-toggle');
    const mobileClose = document.getElementById('mobile-close');
    const mobileDrawer = document.getElementById('mobile-drawer');

    if (mobileToggle && mobileDrawer) {
        mobileToggle.addEventListener('click', () => mobileDrawer.classList.add('active'));
    }

    if (mobileClose && mobileDrawer) {
        mobileClose.addEventListener('click', () => mobileDrawer.classList.remove('active'));
    }

    // Smooth Anchor Navigation
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                if (mobileDrawer) mobileDrawer.classList.remove('active');

                if (lenis) {
                    lenis.scrollTo(targetElement, { offset: -60 });
                } else {
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });

    // Back to Top Button
    const backToTop = document.getElementById('back-to-top');
    if (backToTop) {
        backToTop.addEventListener('click', () => {
            if (lenis) lenis.scrollTo(0);
            else window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

});

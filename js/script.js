/**
 * Kshitij Prasad - Portfolio
 * Professional JavaScript with GSAP Animations
 */

document.addEventListener("DOMContentLoaded", function () {
  // Initialize Lucide icons
  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }

  // ===== Scroll Progress Bar =====
  const scrollProgress = document.querySelector('.scroll-progress');
  
  function updateScrollProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = (scrollTop / docHeight) * 100;
    if (scrollProgress) {
      scrollProgress.style.width = scrollPercent + '%';
    }
  }
  
  window.addEventListener('scroll', updateScrollProgress, { passive: true });

  // ===== Preloader =====
  const preloader = document.querySelector(".preloader");
  
  window.addEventListener("load", () => {
    setTimeout(() => {
      preloader.classList.add("hidden");
      document.body.style.overflow = "";
      initAnimations();
      initAdvancedEffects();
    }, 1500);
  });

  // Fallback if load doesn't fire
  setTimeout(() => {
    if (!preloader.classList.contains("hidden")) {
      preloader.classList.add("hidden");
      document.body.style.overflow = "";
      initAnimations();
      initAdvancedEffects();
    }
  }, 4000);

  // ===== Custom Cursor =====
  const cursorFollower = document.querySelector(".cursor-follower");
  const cursorDot = document.querySelector(".cursor-dot");
  
  let mouseX = 0, mouseY = 0;
  let followerX = 0, followerY = 0;
  
  document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    // Instant update for dot
    cursorDot.style.left = mouseX + "px";
    cursorDot.style.top = mouseY + "px";
  });
  
  // Smooth follow animation
  function animateCursor() {
    followerX += (mouseX - followerX) * 0.12;
    followerY += (mouseY - followerY) * 0.12;
    
    cursorFollower.style.left = followerX + "px";
    cursorFollower.style.top = followerY + "px";
    
    requestAnimationFrame(animateCursor);
  }
  animateCursor();
  
  // Hover effects on interactive elements
  const interactiveElements = document.querySelectorAll("a, button, .project-card, .tech-icon, .contact-card, .experience-card");
  
  interactiveElements.forEach((el) => {
    el.addEventListener("mouseenter", () => {
      cursorFollower.classList.add("hover");
    });
    el.addEventListener("mouseleave", () => {
      cursorFollower.classList.remove("hover");
    });
  });

  // ===== Subtle Card Hover Effect (No 3D Tilt) =====
  function initCardHoverEffects() {
    const cards = document.querySelectorAll('.experience-card, .project-card, .glass-card');
    
    cards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Only update glow position, no 3D tilt
        card.style.setProperty('--mouse-x', (x / rect.width * 100) + '%');
        card.style.setProperty('--mouse-y', (y / rect.height * 100) + '%');
      });
    });
  }

  // ===== Magnetic Buttons =====
  function initMagneticButtons() {
    const buttons = document.querySelectorAll('.btn-primary, .btn-secondary');
    
    buttons.forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
      });
      
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
      });
    });
  }

  // ===== Text Reveal Animation =====
  function initTextReveal() {
    const titles = document.querySelectorAll('.section-title, .hero-title');
    
    titles.forEach(title => {
      const text = title.textContent;
      title.innerHTML = '';
      
      text.split('').forEach((char, i) => {
        const span = document.createElement('span');
        span.textContent = char === ' ' ? '\u00A0' : char;
        span.style.display = 'inline-block';
        span.style.opacity = '0';
        span.style.transform = 'translateY(30px)';
        span.style.transition = `all 0.5s cubic-bezier(0.4, 0, 0.2, 1) ${i * 0.03}s`;
        title.appendChild(span);
      });
    });
  }

  // ===== Initialize Advanced Effects =====
  function initAdvancedEffects() {
    initCardHoverEffects();
    
    // Animate text reveals when in view
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const spans = entry.target.querySelectorAll('span');
          spans.forEach(span => {
            span.style.opacity = '1';
            span.style.transform = 'translateY(0)';
          });
        }
      });
    }, { threshold: 0.3 });
    
    document.querySelectorAll('.section-title').forEach(el => observer.observe(el));
  }

  // ===== Advanced Antigravity Hero Animation (Google-style) =====
  const hero = document.querySelector(".hero");
  const heroContent = document.querySelector(".hero-content");
  const floatingCards = document.querySelectorAll(".floating-card");
  const gradientOrbs = document.querySelectorAll(".gradient-orb");
  const heroImageWrapper = document.querySelector(".hero-image-wrapper");
  const heroTitle = document.querySelector(".hero-title");
  const heroBadge = document.querySelector(".hero-badge");
  const heroStats = document.querySelector(".hero-stats");
  
  if (hero && heroContent) {
    let isInHero = true;
    let animationFrame;
    let targetX = 0, targetY = 0;
    let currentX = 0, currentY = 0;
    
    // Smooth interpolation for fluid motion
    const lerp = (start, end, factor) => start + (end - start) * factor;
    
    // Animation loop for smooth continuous movement
    function animateHero() {
      currentX = lerp(currentX, targetX, 0.08);
      currentY = lerp(currentY, targetY, 0.08);
      
      // Apply transforms with eased values
      floatingCards.forEach((card, index) => {
        const intensity = 25 + (index * 12);
        const rotation = currentX * 3;
        const moveX = -currentX * intensity;
        const moveY = -currentY * intensity;
        card.style.transform = `translate(${moveX}px, ${moveY}px) rotate(${rotation}deg) scale(${1 + Math.abs(currentX) * 0.05})`;
      });
      
      gradientOrbs.forEach((orb, index) => {
        const intensity = 35 + (index * 15);
        const scale = 1 + Math.abs(currentX * currentY) * 0.1;
        const moveX = currentX * intensity;
        const moveY = currentY * intensity;
        orb.style.transform = `translate(${moveX}px, ${moveY}px) scale(${scale})`;
      });
      
      if (heroImageWrapper) {
        const tiltX = currentY * 8;
        const tiltY = -currentX * 8;
        const scale = 1 + Math.abs(currentX * currentY) * 0.02;
        heroImageWrapper.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(${scale})`;
      }
      
      // Subtle text parallax
      if (heroTitle) {
        heroTitle.style.transform = `translate(${currentX * 5}px, ${currentY * 3}px)`;
      }
      
      if (heroBadge) {
        heroBadge.style.transform = `translate(${-currentX * 8}px, ${-currentY * 5}px)`;
      }
      
      if (heroStats) {
        heroStats.style.transform = `translate(${currentX * 3}px, ${currentY * 2}px)`;
      }
      
      if (isInHero) {
        animationFrame = requestAnimationFrame(animateHero);
      }
    }
    
    hero.addEventListener("mousemove", (e) => {
      if (!isInHero) return;
      
      const rect = hero.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      targetX = (x - centerX) / centerX;
      targetY = (y - centerY) / centerY;
    });
    
    hero.addEventListener("mouseenter", () => {
      if (!animationFrame && isInHero) {
        animateHero();
      }
    });
    
    hero.addEventListener("mouseleave", () => {
      targetX = 0;
      targetY = 0;
      
      // Let animation continue to smoothly return to center
      setTimeout(() => {
        floatingCards.forEach((card) => {
          card.style.transform = "";
        });
        gradientOrbs.forEach((orb) => {
          orb.style.transform = "";
        });
        if (heroImageWrapper) {
          heroImageWrapper.style.transform = "";
        }
        if (heroTitle) {
          heroTitle.style.transform = "";
        }
        if (heroBadge) {
          heroBadge.style.transform = "";
        }
        if (heroStats) {
          heroStats.style.transform = "";
        }
      }, 500);
    });
    
    // Start animation when hero is visible
    const heroObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        isInHero = entry.isIntersecting;
        if (isInHero && !animationFrame) {
          animateHero();
        } else if (!isInHero && animationFrame) {
          cancelAnimationFrame(animationFrame);
          animationFrame = null;
        }
      });
    }, { threshold: 0.1 });
    
    heroObserver.observe(hero);
    
    // Initial animation start
    animateHero();
  }

  // ===== Navigation =====
  const navbar = document.querySelector(".navbar");
  const menuToggle = document.querySelector(".menu-toggle");
  const navLinks = document.querySelector(".nav-links");
  const navItems = document.querySelectorAll(".nav-link");

  // Scroll effect for navbar
  let lastScroll = 0;
  
  window.addEventListener("scroll", () => {
    const currentScroll = window.scrollY;
    
    if (currentScroll > 50) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
    
    lastScroll = currentScroll;
  });

  // Mobile menu toggle
  if (menuToggle) {
    menuToggle.addEventListener("click", () => {
      navLinks.classList.toggle("active");
      menuToggle.classList.toggle("active");
      document.body.classList.toggle("menu-open");
    });
  }

  // Close mobile menu on link click
  navItems.forEach((item) => {
    item.addEventListener("click", () => {
      navLinks.classList.remove("active");
      if (menuToggle) menuToggle.classList.remove("active");
      document.body.classList.remove("menu-open");
    });
  });

  // Smooth scrolling
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute("href"));
      if (target) {
        const headerOffset = 100;
        const elementPosition = target.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      }
    });
  });

  // Active nav link on scroll
  const sections = document.querySelectorAll("section[id]");
  
  function updateActiveNav() {
    const scrollY = window.pageYOffset;

    sections.forEach((section) => {
      const sectionHeight = section.offsetHeight;
      const sectionTop = section.offsetTop - 150;
      const sectionId = section.getAttribute("id");
      const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);

      if (navLink) {
        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
          navLink.classList.add("active");
        } else {
          navLink.classList.remove("active");
        }
      }
    });
  }
  
  window.addEventListener("scroll", updateActiveNav);
  updateActiveNav();

  // ===== Counter Animation =====
  function animateCounter(element, target) {
    const duration = 2000;
    const start = 0;
    const startTime = performance.now();
    
    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(start + (target - start) * easeOut);
      
      element.textContent = current;
      
      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }
    
    requestAnimationFrame(update);
  }

  // Trigger counter animation when visible
  const statNumbers = document.querySelectorAll(".stat-number[data-count]");
  
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const target = parseInt(entry.target.dataset.count);
        animateCounter(entry.target, target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  
  statNumbers.forEach((stat) => counterObserver.observe(stat));

  // ===== Skill Bars Animation =====
  const skillCategories = document.querySelectorAll(".skill-category");
  
  const skillObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const fills = entry.target.querySelectorAll(".skill-fill");
        fills.forEach((fill, index) => {
          setTimeout(() => {
            fill.style.width = fill.style.getPropertyValue("--fill");
          }, index * 100);
        });
        skillObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  
  skillCategories.forEach((category) => skillObserver.observe(category));

  // ===== Scroll Animations (Simple AOS alternative) =====
  const animatedElements = document.querySelectorAll("[data-aos]");
  
  const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const delay = entry.target.dataset.aosDelay || 0;
        setTimeout(() => {
          entry.target.classList.add("aos-animate");
        }, parseInt(delay));
      }
    });
  }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });
  
  animatedElements.forEach((el) => scrollObserver.observe(el));

  // ===== GSAP Animations =====
  // ===== Interactive Mesh Dots (Google Antigravity Style) =====
  function initFloatingDots() {
    const container = document.getElementById('floatingDots');
    if (!container) return;

    // Create canvas for mesh effect
    const canvas = document.createElement('canvas');
    canvas.style.position = 'absolute';
    canvas.style.inset = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    container.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    
    function resizeCanvas() {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const dotCount = 80;
    const dots = [];
    const connectionDistance = 120;
    const mouseRadius = 150;

    // Create dots with properties
    for (let i = 0; i < dotCount; i++) {
      dots.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 2 + 1.5,
        originalVx: (Math.random() - 0.5) * 0.5,
        originalVy: (Math.random() - 0.5) * 0.5
      });
    }

    // Mouse tracking
    let mouse = { x: null, y: null };
    const hero = document.querySelector('.hero');
    
    if (hero) {
      hero.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
      });
      
      hero.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
      });
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update and draw dots
      dots.forEach((dot, i) => {
        // Mouse repulsion (antigravity effect)
        if (mouse.x !== null && mouse.y !== null) {
          const dx = dot.x - mouse.x;
          const dy = dot.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < mouseRadius) {
            const force = (mouseRadius - dist) / mouseRadius;
            const angle = Math.atan2(dy, dx);
            dot.vx += Math.cos(angle) * force * 0.8;
            dot.vy += Math.sin(angle) * force * 0.8;
          }
        }
        
        // Ease back to original velocity
        dot.vx = dot.vx * 0.96 + dot.originalVx * 0.04;
        dot.vy = dot.vy * 0.96 + dot.originalVy * 0.04;
        
        // Update position
        dot.x += dot.vx;
        dot.y += dot.vy;
        
        // Bounce off edges
        if (dot.x < 0 || dot.x > canvas.width) {
          dot.vx *= -1;
          dot.originalVx *= -1;
        }
        if (dot.y < 0 || dot.y > canvas.height) {
          dot.vy *= -1;
          dot.originalVy *= -1;
        }
        
        // Draw dot
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(132, 204, 22, 0.6)';
        ctx.fill();
        
        // Draw connections to nearby dots
        for (let j = i + 1; j < dots.length; j++) {
          const dx = dot.x - dots[j].x;
          const dy = dot.y - dots[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < connectionDistance) {
            const opacity = (1 - dist / connectionDistance) * 0.25;
            ctx.beginPath();
            ctx.moveTo(dot.x, dot.y);
            ctx.lineTo(dots[j].x, dots[j].y);
            ctx.strokeStyle = `rgba(132, 204, 22, ${opacity})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
        
        // Draw connection to mouse
        if (mouse.x !== null && mouse.y !== null) {
          const dx = dot.x - mouse.x;
          const dy = dot.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < mouseRadius) {
            const opacity = (1 - dist / mouseRadius) * 0.4;
            ctx.beginPath();
            ctx.moveTo(dot.x, dot.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = `rgba(250, 204, 21, ${opacity})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      });
      
      // Draw mouse glow
      if (mouse.x !== null && mouse.y !== null) {
        const gradient = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 60);
        gradient.addColorStop(0, 'rgba(132, 204, 22, 0.15)');
        gradient.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 60, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      }
      
      requestAnimationFrame(animate);
    }
    
    animate();
  }
  
  // Initialize floating dots
  initFloatingDots();

  function initAnimations() {
    if (typeof gsap === "undefined") return;

    gsap.registerPlugin(ScrollTrigger);

    // Hero section parallax (only affects gradient orbs when scrolling)
    gsap.to(".gradient-orb", {
      y: -100,
      scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "bottom top",
        scrub: 1,
      },
    });

    // Section headers - elegant fade in
    gsap.utils.toArray(".section-header").forEach((header) => {
      gsap.from(header, {
        y: 40,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: header,
          start: "top 85%",
          toggleActions: "play none none none",
        },
      });
    });

    // Experience cards - professional stagger animation
    gsap.utils.toArray(".experience-card").forEach((card, index) => {
      gsap.from(card, {
        y: 60,
        opacity: 0,
        duration: 0.8,
        delay: index * 0.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: card,
          start: "top 90%",
          toggleActions: "play none none none",
        },
      });
    });

    // Company logos in experience cards - subtle pop in
    gsap.utils.toArray(".company-logo").forEach((logo) => {
      gsap.from(logo, {
        scale: 0.5,
        opacity: 0,
        duration: 0.6,
        delay: 0.2,
        ease: "back.out(2)",
        scrollTrigger: {
          trigger: logo,
          start: "top 90%",
          toggleActions: "play none none none",
        },
      });
    });

    // Logo marquee items - cascade fade in
    gsap.from(".logos-section", {
      opacity: 0,
      y: 40,
      duration: 1.2,
      ease: "power3.out",
      scrollTrigger: {
        trigger: ".logos-section",
        start: "top 95%",
        toggleActions: "play none none none",
      },
    });

    // Timeline items - animate in and stay visible (legacy support)
    gsap.utils.toArray(".timeline-item").forEach((item, index) => {
      gsap.set(item, { opacity: 1 });
      
      gsap.from(item, {
        x: -30,
        opacity: 0,
        duration: 0.6,
        delay: index * 0.1,
        scrollTrigger: {
          trigger: item,
          start: "top 90%",
          toggleActions: "play none none none",
        },
      });
    });

    // Project cards stagger - professional reveal
    const projectCardsGSAP = document.querySelectorAll(".project-card");
    if (projectCardsGSAP.length > 0) {
      gsap.set(projectCardsGSAP, { opacity: 1 });
      
      gsap.from(projectCardsGSAP, {
        y: 80,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".projects-grid",
          start: "top 85%",
          toggleActions: "play none none none",
        },
      });
    }
    
    // Skill categories animation
    gsap.utils.toArray(".skill-category").forEach((category, index) => {
      gsap.from(category, {
        y: 50,
        opacity: 0,
        duration: 0.7,
        delay: index * 0.15,
        ease: "power3.out",
        scrollTrigger: {
          trigger: category,
          start: "top 90%",
          toggleActions: "play none none none",
        },
      });
    });

    // Tech icons stagger
    gsap.utils.toArray(".tech-icons").forEach(container => {
      const icons = container.querySelectorAll('.tech-icon');
      gsap.from(icons, {
        scale: 0,
        opacity: 0,
        duration: 0.4,
        stagger: 0.05,
        ease: "back.out(2)",
        scrollTrigger: {
          trigger: container,
          start: "top 90%",
          toggleActions: "play none none none",
        },
      });
    });

    // Contact cards wave animation
    gsap.utils.toArray(".contact-card").forEach((card, index) => {
      gsap.from(card, {
        x: -50,
        opacity: 0,
        duration: 0.6,
        delay: index * 0.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: card,
          start: "top 90%",
          toggleActions: "play none none none",
        },
      });
    });

    // Parallax effect for sections
    gsap.utils.toArray(".section").forEach(section => {
      const bg = section.querySelector('.section-header');
      if (bg) {
        gsap.to(bg, {
          y: -30,
          scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
        });
      }
    });
  }

  // ===== Modal Functionality =====
  const projectCards = document.querySelectorAll(".project-card");
  const modals = document.querySelectorAll(".modal");

  projectCards.forEach((card) => {
    card.addEventListener("click", () => {
      const projectId = card.getAttribute("data-project-id");
      const modal = document.getElementById(`modal-${projectId}`);
      if (modal) {
        openModal(modal);
      }
    });
  });

  function openModal(modal) {
    document.body.classList.add("modal-open");
    modal.classList.add("show");
    
    // Re-initialize icons in modal
    if (typeof lucide !== "undefined") {
      setTimeout(() => lucide.createIcons(), 100);
    }
  }

  function closeModal(modal) {
    // Pause all videos in the modal
    const videos = modal.querySelectorAll("video");
    videos.forEach((video) => {
      video.pause();
      video.currentTime = 0;
    });
    
    modal.classList.remove("show");
    document.body.classList.remove("modal-open");
  }

  // Modal close handlers
  modals.forEach((modal) => {
    const closeBtn = modal.querySelector(".modal-close");
    const backdrop = modal.querySelector(".modal-backdrop");
    
    if (closeBtn) {
      closeBtn.addEventListener("click", () => closeModal(modal));
    }
    
    if (backdrop) {
      backdrop.addEventListener("click", () => closeModal(modal));
    }
  });

  // Close modal on Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      modals.forEach((modal) => {
        if (modal.classList.contains("show")) {
          closeModal(modal);
        }
      });
    }
  });

  // ===== Back to Top Button =====
  const backToTop = document.getElementById("backToTop");
  
  window.addEventListener("scroll", () => {
    if (window.scrollY > 500) {
      backToTop.classList.add("show");
    } else {
      backToTop.classList.remove("show");
    }
  });
  
  if (backToTop) {
    backToTop.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    });
  }

  // ===== Contact Form =====
  const contactForm = document.getElementById("contact-form");
  
  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      
      const name = contactForm.querySelector("#name").value;
      const email = contactForm.querySelector("#email").value;
      const message = contactForm.querySelector("#message").value;
      
      // Create mailto link
      const mailtoLink = `mailto:kshitijp21@gmail.com?subject=Portfolio Contact from ${encodeURIComponent(name)}&body=${encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`)}`;
      
      window.location.href = mailtoLink;
    });
  }

  // ===== Logo Marquee - Pause on Hover =====
  const marqueeContent = document.querySelector(".marquee-content");
  
  if (marqueeContent) {
    marqueeContent.addEventListener("mouseenter", () => {
      marqueeContent.style.animationPlayState = "paused";
    });
    
    marqueeContent.addEventListener("mouseleave", () => {
      marqueeContent.style.animationPlayState = "running";
    });
  }

  // ===== Video Lazy Loading =====
  const videos = document.querySelectorAll("video");
  
  const videoObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const video = entry.target;
        const source = video.querySelector("source");
        if (source && source.dataset.src) {
          source.src = source.dataset.src;
          video.load();
        }
        videoObserver.unobserve(video);
      }
    });
  }, { rootMargin: "100px" });

  videos.forEach((video) => {
    videoObserver.observe(video);
  });

  // ===== Tech Icon Tooltip =====
  const techIcons = document.querySelectorAll(".tech-icon");
  
  techIcons.forEach((icon) => {
    icon.addEventListener("mouseenter", () => {
      icon.style.zIndex = "10";
    });
    
    icon.addEventListener("mouseleave", () => {
      icon.style.zIndex = "";
    });
  });

  // ===== Magnetic Button Effect =====
  const magneticButtons = document.querySelectorAll(".btn-primary, .btn-secondary");
  
  magneticButtons.forEach((btn) => {
    btn.addEventListener("mousemove", (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      
      btn.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px)`;
    });
    
    btn.addEventListener("mouseleave", () => {
      btn.style.transform = "";
    });
  });

  // ===== Tilt Effect on Cards =====
  const tiltCards = document.querySelectorAll(".project-card, .info-card, .contact-card");
  
  tiltCards.forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = (y - centerY) / 20;
      const rotateY = (centerX - x) / 20;
      
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
    });
    
    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
    });
  });

  // ===== Typing Effect for Role =====
  const roleText = document.querySelector(".role-text");
  
  if (roleText) {
    const roles = [
      "Autonomous Vehicle Engineer",
      "Robotics Developer",
      "RL Researcher",
      "ROS2 Specialist"
    ];
    
    let roleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 100;
    
    function typeRole() {
      const currentRole = roles[roleIndex];
      
      if (isDeleting) {
        roleText.textContent = currentRole.substring(0, charIndex - 1);
        charIndex--;
        typingSpeed = 50;
      } else {
        roleText.textContent = currentRole.substring(0, charIndex + 1);
        charIndex++;
        typingSpeed = 100;
      }
      
      if (!isDeleting && charIndex === currentRole.length) {
        typingSpeed = 2000;
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
        typingSpeed = 500;
      }
      
      setTimeout(typeRole, typingSpeed);
    }
    
    // Start typing after initial animation
    setTimeout(typeRole, 3000);
  }

  // ===== Performance Optimization - Reduce animations on low-end devices =====
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  
  if (prefersReducedMotion.matches) {
    // Disable intensive animations
    document.querySelectorAll(".gradient-orb, .floating-card, .image-ring").forEach((el) => {
      el.style.animation = "none";
    });
    
    // Disable cursor effects
    cursorFollower.style.display = "none";
    cursorDot.style.display = "none";
  }

  console.log("Portfolio loaded successfully! 🚀");
});

document.addEventListener("DOMContentLoaded", function () {
  // Initialize Lucide icons
  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }

  // Initialize AOS (Animate on Scroll) - subtle
  if (typeof AOS !== "undefined") {
    AOS.init({
      duration: 600,
      easing: "ease-out",
      once: true,
      offset: 30,
    });
  }

  // ===== Neural Network Background Animation =====
  const canvas = document.getElementById("neural-network");
  if (canvas) {
    const ctx = canvas.getContext("2d");
    let nodes = [];
    let animationId;
    
    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initNodes();
    }
    
    function initNodes() {
      nodes = [];
      const numNodes = Math.floor((canvas.width * canvas.height) / 25000);
      for (let i = 0; i < numNodes; i++) {
        nodes.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          radius: Math.random() * 1.5 + 0.5,
        });
      }
    }
    
    function drawNetwork() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw connections
      const maxDist = 120;
      ctx.strokeStyle = "rgba(59, 130, 246, 0.08)";
      ctx.lineWidth = 0.5;
      
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < maxDist) {
            const opacity = (1 - dist / maxDist) * 0.15;
            ctx.strokeStyle = `rgba(59, 130, 246, ${opacity})`;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }
      
      // Draw nodes
      for (const node of nodes) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(59, 130, 246, 0.4)";
        ctx.fill();
      }
    }
    
    function updateNodes() {
      for (const node of nodes) {
        node.x += node.vx;
        node.y += node.vy;
        
        if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
        if (node.y < 0 || node.y > canvas.height) node.vy *= -1;
      }
    }
    
    function animate() {
      updateNodes();
      drawNetwork();
      animationId = requestAnimationFrame(animate);
    }
    
    window.addEventListener("resize", resize);
    resize();
    animate();
  }

  // ===== Navigation =====
  const navbar = document.querySelector(".navbar");
  const menuToggle = document.querySelector(".menu-toggle");
  const navLinks = document.querySelector(".nav-links");
  const navItems = document.querySelectorAll(".nav-links a");

  // Scroll effect for navbar
  window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  });

  // Mobile menu toggle
  if (menuToggle) {
    menuToggle.addEventListener("click", () => {
      navLinks.classList.toggle("active");
      menuToggle.classList.toggle("active");
    });
  }

  // Close mobile menu on link click
  navItems.forEach((item) => {
    item.addEventListener("click", () => {
      navLinks.classList.remove("active");
      if (menuToggle) menuToggle.classList.remove("active");
    });
  });

  // Smooth scrolling
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute("href"));
      if (target) {
        const headerOffset = 80;
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
  window.addEventListener("scroll", () => {
    const scrollY = window.pageYOffset;

    sections.forEach((section) => {
      const sectionHeight = section.offsetHeight;
      const sectionTop = section.offsetTop - 100;
      const sectionId = section.getAttribute("id");
      const navLink = document.querySelector(`.nav-links a[href="#${sectionId}"]`);

      if (navLink) {
        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
          navLink.classList.add("active");
        } else {
          navLink.classList.remove("active");
        }
      }
    });
  });

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
    document.body.style.overflow = "hidden";
    modal.style.display = "flex";
    setTimeout(() => {
      modal.classList.add("show");
      if (typeof lucide !== "undefined") {
        lucide.createIcons();
      }
    }, 10);
  }

  function closeModal(modal) {
    // Pause all videos in the modal
    const videos = modal.querySelectorAll("video");
    videos.forEach((video) => {
      video.pause();
      video.currentTime = 0;
    });
    
    modal.classList.remove("show");
    setTimeout(() => {
      modal.style.display = "none";
      document.body.style.overflow = "";
    }, 250);
  }

  modals.forEach((modal) => {
    const closeBtn = modal.querySelector(".close");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => closeModal(modal));
    }

    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        closeModal(modal);
      }
    });
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

  // ===== Lightbox Functionality =====
  const lightboxModal = document.getElementById("modal-lightbox");
  const lightboxImg = document.getElementById("lightbox-img");
  const lightboxImages = document.querySelectorAll(".lightbox-img");

  lightboxImages.forEach((img) => {
    img.addEventListener("click", (e) => {
      e.stopPropagation();
      lightboxImg.src = img.src;
      openModal(lightboxModal);
    });
  });

  // ===== Video Lazy Loading =====
  const videos = document.querySelectorAll("video");
  const videoObserver = new IntersectionObserver(
    (entries) => {
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
    },
    { rootMargin: "100px" }
  );

  videos.forEach((video) => {
    videoObserver.observe(video);
  });
});

/*
  Bipin Kumar Singh Portfolio - Javascript Logic
  Features: Mobile Menu, Scroll Spy, Lightbox Modals, 
  and Client Relations Portal Form Validation (Birthday Reminder).
*/

document.addEventListener('DOMContentLoaded', () => {
  
  // --- Sticky Header on Scroll ---
  const header = document.querySelector('header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.style.boxShadow = 'var(--shadow-md)';
    } else {
      header.style.boxShadow = 'none';
    }
  });

  // --- Mobile Menu Toggle ---
  const mobileToggle = document.querySelector('.mobile-nav-toggle');
  const navMenu = document.querySelector('.nav-menu');
  const navLinks = document.querySelectorAll('.nav-menu a');

  mobileToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    mobileToggle.textContent = navMenu.classList.contains('active') ? '✕' : '☰';
  });

  // Close mobile nav when clicking a link
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('active');
      mobileToggle.textContent = '☰';
    });
  });

  // --- Scroll Spy for Active Navigation ---
  const sections = document.querySelectorAll('section');
  const observerOptions = {
    threshold: 0.25,
    rootMargin: '-80px 0px 0px 0px' // accounts for navigation bar height
  };

  const spyObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const sectionId = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach(section => spyObserver.observe(section));

  // --- Lightbox Modal for Gallery Images ---
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = lightbox.querySelector('.lightbox-img');
  const lightboxClose = lightbox.querySelector('.lightbox-close');
  const lightboxTitle = lightbox.querySelector('.lightbox-title');
  const lightboxDesc = lightbox.querySelector('.lightbox-desc');

  // Find all triggers
  const imageWrappers = document.querySelectorAll('.card-img-wrapper, .milestone-photo-wrapper');
  
  imageWrappers.forEach(wrapper => {
    wrapper.addEventListener('click', () => {
      const img = wrapper.querySelector('img');
      let title = '';
      let desc = '';
      
      // Attempt to find parent context for text
      const parentCard = wrapper.closest('.card, .milestone-card');
      if (parentCard) {
        const titleEl = parentCard.querySelector('.card-title, .milestone-title');
        const descEl = parentCard.querySelector('.card-desc, .milestone-desc');
        if (titleEl) title = titleEl.textContent;
        if (descEl) desc = descEl.textContent;
      }

      lightboxImg.src = img.src;
      lightboxTitle.textContent = title;
      lightboxDesc.textContent = desc;
      lightbox.classList.add('active');
    });
  });

  const closeLightbox = () => {
    lightbox.classList.remove('active');
    lightboxImg.src = '';
  };

  lightboxClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
      closeLightbox();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('active')) {
      closeLightbox();
    }
  });

  // --- Scroll Progress Bar Indicator ---
  window.addEventListener('scroll', () => {
    const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = height > 0 ? (winScroll / height) * 100 : 0;
    const progressBar = document.getElementById('scroll-progress');
    if (progressBar) {
      progressBar.style.width = scrolled + '%';
    }
  });

  // --- Native Scroll-Reveal Animation Observer ---
  const scrollCards = document.querySelectorAll('.milestone-card, .card, .orbit-card, .phone-mockup');
  
  // Set initial state for animations dynamically
  scrollCards.forEach(card => {
    card.classList.add('reveal-ready');
  });

  const cardObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        // Add a slight stagger delay dynamically for siblings entering together
        setTimeout(() => {
          entry.target.classList.add('reveal-visible');
          
          // Trigger organic float animation once orbit card slide-in settles
          if (entry.target.classList.contains('orbit-card')) {
            setTimeout(() => {
              entry.target.classList.add('reveal-floating');
            }, 1200);
          }
        }, index * 80);
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.05,
    rootMargin: '0px 0px -20px 0px'
  });

  scrollCards.forEach(card => {
    cardObserver.observe(card);
  });

  // --- Pure Vanilla JS Magnetic Hover Interaction ---
  const magneticElements = document.querySelectorAll('.btn, .floating-btn, .logo-symbol');
  magneticElements.forEach(elem => {
    elem.style.transition = 'transform 0.1s ease';

    elem.addEventListener('mousemove', (e) => {
      const rect = elem.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      elem.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
    });

    elem.addEventListener('mouseleave', () => {
      elem.style.transition = 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
      elem.style.transform = 'translate(0, 0)';
      
      setTimeout(() => {
        elem.style.transition = 'transform 0.1s ease';
      }, 500);
    });
  });


  // --- Toast Notification Helper ---
  const showToast = (message, type = 'success') => {
    // Create toast container if not already exists
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    // Select icon
    let iconSvg = '';
    if (type === 'success') {
      iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;
    } else {
      iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
    }

    toast.innerHTML = `
      ${iconSvg}
      <span>${message}</span>
    `;

    container.appendChild(toast);

    // Fade out and remove
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(8px)';
      toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, 4500);
  };
});

// --- Dismiss Preloader on Page Load ---
window.addEventListener('load', () => {
  const preloader = document.getElementById('preloader');
  const preloaderText = document.getElementById('preloaderText');
  
  if (preloader) {
    // Dynamic text cycle matching loading states
    const states = [
      { text: "Analyzing Risks...", time: 0 },
      { text: "Underwriting Safety...", time: 500 },
      { text: "Securing Assets...", time: 1000 },
      { text: "Active Coverage!", time: 1550 }
    ];

    states.forEach(state => {
      setTimeout(() => {
        if (preloaderText) preloaderText.textContent = state.text;
      }, state.time);
    });

    // Dismiss preloader after all cycles finish
    setTimeout(() => {
      preloader.classList.add('preloader-fade-out');
      document.body.classList.add('loaded');
    }, 2100);
  } else {
    document.body.classList.add('loaded');
  }
});

// --- Admin Portal Hidden Redirect Trigger ---
document.addEventListener('DOMContentLoaded', () => {
  const logoSymbol = document.querySelector('.logo-group .logo-symbol');
  
  if (logoSymbol) {
    // 1. Desktop Double Click
    logoSymbol.addEventListener('dblclick', (e) => {
      e.preventDefault();
      window.location.href = "admin.html";
    });

    // 2. Mobile / Touchscreen Double Tap
    let lastTap = 0;
    logoSymbol.addEventListener('touchend', (e) => {
      const currentTime = new Date().getTime();
      const tapLength = currentTime - lastTap;
      if (tapLength < 400 && tapLength > 0) {
        e.preventDefault();
        window.location.href = "admin.html";
      }
      lastTap = currentTime;
    });
  }
});

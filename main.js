/* ==========================================================================
   Global JavaScript Functions - Masaya Takagi Portfolio
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initMobileMenu();
  initScrollEffects();
  initRevealOnScroll();
  initStatsCounter();
  initContactForm();
});

/**
 * Theme Toggle Logic
 */
function initTheme() {
  const themeToggle = document.getElementById('themeToggle');
  if (!themeToggle) return;

  // Toggle Theme on click
  themeToggle.addEventListener('click', () => {
    const isDark = document.documentElement.classList.contains('dark');
    if (isDark) {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
  });
}

/**
 * Mobile Navigation Drawer Toggle
 */
function initMobileMenu() {
  const menuToggle = document.getElementById('menuToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  
  if (!menuToggle || !mobileMenu) return;

  menuToggle.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.contains('open');
    if (isOpen) {
      mobileMenu.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
      // Enable body scroll
      document.body.style.overflow = '';
    } else {
      mobileMenu.classList.add('open');
      menuToggle.setAttribute('aria-expanded', 'true');
      // Prevent body scroll when menu is open
      document.body.style.overflow = 'hidden';
    }
  });

  // Close mobile menu when clicking on a link
  const mobileLinks = mobileMenu.querySelectorAll('a');
  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });
}

/**
 * Scroll Progress & Scroll Top button
 */
function initScrollEffects() {
  const progressBar = document.getElementById('scrollProgress');
  const scrollTopBtn = document.getElementById('scrollTop');
  const header = document.querySelector('.header');

  window.addEventListener('scroll', () => {
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    
    // 1. Scroll Progress Bar
    if (progressBar && height > 0) {
      const scrolled = (winScroll / height) * 100;
      progressBar.style.width = scrolled + '%';
    }

    // 2. Scroll Top Button visibility
    if (scrollTopBtn) {
      if (winScroll > 300) {
        scrollTopBtn.classList.add('visible');
      } else {
        scrollTopBtn.classList.remove('visible');
      }
    }

    // 3. Header styling on scroll
    if (header) {
      if (winScroll > 10) {
        header.style.boxShadow = 'var(--shadow-md)';
        header.style.height = '70px';
      } else {
        header.style.boxShadow = 'none';
        header.style.height = '80px';
      }
    }
  }, { passive: true });

  // Scroll to Top on click
  if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
}

/**
 * Scroll reveal animation using IntersectionObserver
 */
function initRevealOnScroll() {
  const reveals = document.querySelectorAll('.reveal');
  if (reveals.length === 0) return;

  // Fallback if IntersectionObserver is not supported
  if (!('IntersectionObserver' in window)) {
    reveals.forEach(el => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // Unobserve once shown
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  reveals.forEach(el => {
    observer.observe(el);
  });
}

/**
 * Animate numbers (Stats) on home page when visible
 */
function initStatsCounter() {
  const statNumbers = document.querySelectorAll('.stat-number');
  if (statNumbers.length === 0) return;

  if (!('IntersectionObserver' in window)) {
    return; // Don't animate, keep default values
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const targetVal = parseFloat(el.getAttribute('data-target'));
        const isDecimal = el.getAttribute('data-decimal') === 'true';
        const suffix = el.getAttribute('data-suffix') || '';
        
        animateCount(el, targetVal, isDecimal, suffix);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  statNumbers.forEach(num => observer.observe(num));
}

function animateCount(element, target, isDecimal, suffix) {
  let start = 0;
  const duration = 1500; // 1.5s
  const startTime = performance.now();

  function updateCount(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Ease-out quad function
    const easeProgress = progress * (2 - progress);
    const currentVal = start + (target - start) * easeProgress;
    
    if (isDecimal) {
      element.textContent = currentVal.toFixed(1) + suffix;
    } else {
      element.textContent = Math.floor(currentVal) + suffix;
    }

    if (progress < 1) {
      requestAnimationFrame(updateCount);
    } else {
      element.textContent = (isDecimal ? target.toFixed(1) : target) + suffix;
    }
  }

  requestAnimationFrame(updateCount);
}

/**
 * Contact Form Ajax Submission with Formspree
 */
function initContactForm() {
  const form = document.getElementById('contactForm');
  const successContainer = document.getElementById('submitSuccess');
  const errorContainer = document.getElementById('formError');
  const submitBtn = document.getElementById('submitBtn');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Reset status
    if (errorContainer) {
      errorContainer.style.display = 'none';
      errorContainer.textContent = '';
    }
    
    // Set loading state
    const originalBtnText = submitBtn ? submitBtn.textContent : 'メッセージを送信';
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = '送信中...';
    }

    const formData = new FormData(form);

    try {
      const response = await fetch(form.action, {
        method: form.method,
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        // Success
        form.style.display = 'none';
        if (successContainer) {
          successContainer.style.display = 'block';
          // Smooth fade in
          successContainer.style.opacity = '0';
          setTimeout(() => {
            successContainer.style.transition = 'opacity 0.5s ease';
            successContainer.style.opacity = '1';
          }, 50);
        }
      } else {
        // Response not ok (server side validation etc.)
        const data = await response.json();
        if (data && data.errors) {
          throw new Error(data.errors.map(err => err.message).join(', '));
        } else {
          throw new Error('送信に失敗しました。時間をおいて再度お試しください。');
        }
      }
    } catch (error) {
      // Error
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
      }
      if (errorContainer) {
        errorContainer.textContent = error.message || '通信エラーが発生しました。ネットワーク接続を確認してください。';
        errorContainer.style.display = 'block';
      }
    }
  });
}


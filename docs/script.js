// Theme management
class ThemeManager {
  constructor() {
    this.theme = localStorage.getItem('theme') || 'light';
    this.init();
  }

  init() {
    this.setTheme(this.theme);

    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', () => this.toggleTheme());
    }
  }

  setTheme(theme) {
    this.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);

    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      themeToggle.setAttribute('aria-label',
        theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'
      );
      const sun = themeToggle.querySelector('.sun-icon');
      const moon = themeToggle.querySelector('.moon-icon');
      if (sun && moon) {
        if (theme === 'dark') {
          sun.style.display = 'block';
          moon.style.display = 'none';
        } else {
          sun.style.display = 'none';
          moon.style.display = 'block';
        }
      }
    }
  }

  toggleTheme() {
    const newTheme = this.theme === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }
}

// Mobile navigation management
class MobileNavigation {
  constructor() {
    this.menuOpen = false;
    this.init();
  }

  init() {
    const mobileButton = document.getElementById('toggle-navigation-menu');
    const header = document.getElementById('main-header');

    if (mobileButton && header) {
      mobileButton.addEventListener('click', () => {
        this.toggleMenu(header, mobileButton);
      });
    }

    const navLinks = document.querySelectorAll('#navigation-menu a');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (this.menuOpen && header && mobileButton) {
          this.toggleMenu(header, mobileButton);
        }
      });
    });

    document.addEventListener('click', (e) => {
      if (this.menuOpen &&
        !e.target.closest('#main-header') &&
        header && mobileButton) {
        this.toggleMenu(header, mobileButton);
      }
    });

    document.addEventListener('touchstart', (e) => {
      if (this.menuOpen &&
        !e.target.closest('#main-header') &&
        header && mobileButton) {
        this.toggleMenu(header, mobileButton);
      }
    }, { passive: true });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.menuOpen && header && mobileButton) {
        this.toggleMenu(header, mobileButton);
      }
    });
  }

  toggleMenu(header, button) {
    this.menuOpen = !this.menuOpen;

    if (this.menuOpen) {
      header.classList.add('menu-open');
      document.body.classList.add('menu-open');
      document.body.style.overflow = 'hidden';
    } else {
      header.classList.remove('menu-open');
      document.body.classList.remove('menu-open');
      document.body.style.overflow = '';
    }

    button.setAttribute('aria-expanded', this.menuOpen.toString());
  }
}

// Smooth scrolling for navigation links
class SmoothScroll {
  constructor() {
    this.init();
  }

  init() {
    const navLinks = document.querySelectorAll('a[href^="#"]');

    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href');
        const targetElement = document.querySelector(targetId);

        if (targetElement) {
          const header = document.getElementById('main-header');
          const headerHeight = header ? Math.ceil(header.getBoundingClientRect().height) : 0;
          const extraMargin = 8;
          const targetRect = targetElement.getBoundingClientRect();
          const targetPosition = window.pageYOffset + targetRect.top - (headerHeight + extraMargin);

          const sectionId = targetId.substring(1);
          const navigationHighlight = window.navigationHighlightInstance;
          if (navigationHighlight) {
            navigationHighlight.highlightNavLink(sectionId);
          }

          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });

          history.pushState(null, null, targetId);
        }
      });
    });
  }
}

// Active navigation link highlighting
class NavigationHighlight {
  constructor() {
    this.sections = [];
    this.navLinks = [];
    this.init();
  }

  init() {
    this.sections = document.querySelectorAll('section[id]');
    this.navLinks = document.querySelectorAll('#navigation-menu a[href^="#"]');

    if (this.sections.length > 0 && this.navLinks.length > 0) {
      this.setInitialActiveState();

      window.addEventListener('hashchange', () => {
        this.handleHashChange();
      });
    }
  }

  setInitialActiveState() {
    const hash = window.location.hash;
    if (hash && hash !== '#') {
      const targetId = hash.substring(1);
      this.highlightNavLink(targetId);
    }
  }

  handleHashChange() {
    const hash = window.location.hash;
    if (hash && hash !== '#') {
      const targetId = hash.substring(1);
      this.highlightNavLink(targetId);
    } else {
      this.clearAllActiveStates();
    }
  }

  highlightNavLink(activeId) {
    this.navLinks.forEach(link => {
      link.classList.remove('active');
      link.removeAttribute('aria-current');
    });

    const activeLink = document.querySelector(`#navigation-menu a[href="#${activeId}"]`);
    if (activeLink) {
      activeLink.classList.add('active');
      activeLink.setAttribute('aria-current', 'page');
    }
  }

  clearAllActiveStates() {
    this.navLinks.forEach(link => {
      link.classList.remove('active');
      link.removeAttribute('aria-current');
    });
  }
}

// Lazy load images
class LazyImageLoader {
  constructor() {
    this.init();
  }

  init() {
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.classList.remove('lazy');
            observer.unobserve(img);
          }
        });
      });

      const lazyImages = document.querySelectorAll('img[data-src]');
      lazyImages.forEach(img => imageObserver.observe(img));
    }
  }
}

// Markdown content loader
class MarkdownLoader {
  constructor() {
    this.sections = ['about', 'publications', 'blog', 'resume'];
    this.init();
  }

  init() {
    this.sections.forEach(section => {
      this.loadMarkdown(section);
    });
  }

  async loadMarkdown(section) {
    const contentElement = document.getElementById(`${section}-content`);
    if (!contentElement) return;

    const pathsToTry = [
      `./${section}.md`,
      `${section}.md`,
      `/${section}.md`
    ];

    let lastError = null;

    for (const fullPath of pathsToTry) {
      try {
        const response = await fetch(fullPath);
        if (response.ok) {
          const markdown = await response.text();
          const html = this.parseMarkdown(markdown);
          contentElement.innerHTML = html;
          return;
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      } catch (error) {
        lastError = error;
      }
    }

    contentElement.innerHTML = `
      <div class="error-message">
        Sorry, unable to load ${section} content at this time.
      </div>
    `;
  }

  parseMarkdown(markdown) {
    let html = markdown;

    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

    html = html.replace(/^\s*- (.+)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');

    const paragraphs = html.split(/\n\s*\n/);
    html = paragraphs.map(p => {
      p = p.trim();
      if (!p) return '';
      if (p.startsWith('<') && p.endsWith('>')) return p;
      if (p.includes('<h') || p.includes('<ul') || p.includes('<ol') || p.includes('<div')) return p;
      return `<p>${p}</p>`;
    }).join('\n');

    html = html.replace(/<p><\/p>/g, '');
    html = html.replace(/<p>\s*<\/li>/g, '</li>');
    html = html.replace(/^---$/gm, '<hr>');

    return html;
  }
}

// Initialize all functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new ThemeManager();
  new MobileNavigation();
  new SmoothScroll();

  window.navigationHighlightInstance = new NavigationHighlight();

  new LazyImageLoader();
  new MarkdownLoader();

  document.body.classList.add('loaded');
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') {
    document.body.classList.add('paused');
  } else {
    document.body.classList.remove('paused');
  }
});

// Keyboard navigation support
document.addEventListener('keydown', (e) => {
  if (e.key === 't' && (e.ctrlKey || e.metaKey)) {
    e.preventDefault();
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      themeToggle.click();
    }
  }
});

// Reduced motion support
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

if (prefersReducedMotion.matches) {
  document.documentElement.style.setProperty('scroll-behavior', 'auto');
}

prefersReducedMotion.addEventListener('change', () => {
  if (prefersReducedMotion.matches) {
    document.documentElement.style.setProperty('scroll-behavior', 'auto');
  } else {
    document.documentElement.style.setProperty('scroll-behavior', 'smooth');
  }
});

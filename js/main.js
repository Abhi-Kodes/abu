// ===========================
// RAM KRISHAN INDUSTRIES - MAIN JAVASCRIPT
// ===========================

// ---- Language translations ----
// translations object is now loaded from js/translations.js (must be included before this file)

let currentLang = 'en';

function applyTranslations(lang) {
  const t = translations[lang] || translations.en;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (t[key]) el.textContent = t[key];
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (t[key]) el.setAttribute('placeholder', t[key]);
  });
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  document.body.classList.toggle('rtl', lang === 'ar');
}

// ---- Navbar scroll ----
function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  });
}

// ---- Desktop "Products" nav dropdown (click-to-toggle, in addition to hover) ----
function initNavDropdown() {
  document.querySelectorAll('.nav-links > li').forEach(li => {
    const menu = li.querySelector(':scope > .dropdown-menu');
    if (!menu) return;
    const link = li.querySelector(':scope > a');
    const caret = link.querySelector('.fa-chevron-down');
    if (!caret) return;

    caret.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const isOpen = li.classList.toggle('dd-open');
      document.querySelectorAll('.nav-links > li.dd-open').forEach(other => {
        if (other !== li) other.classList.remove('dd-open');
      });
    });

    document.addEventListener('click', (e) => {
      if (!li.contains(e.target)) li.classList.remove('dd-open');
    });
  });
}

// ---- Mobile nav ----
function initMobileNav() {
  const ham = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobileNav');
  const mobileClose = document.getElementById('mobileNavClose');
  if (!ham || !mobileNav) return;

  ham.addEventListener('click', () => {
    mobileNav.classList.add('open');
    document.body.style.overflow = 'hidden';
  });
  const close = () => {
    mobileNav.classList.remove('open');
    document.body.style.overflow = '';
  };
  if (mobileClose) mobileClose.addEventListener('click', close);
  // Close the panel whenever any real link is tapped (submenu toggle is a <button>, unaffected)
  mobileNav.querySelectorAll('a').forEach(a => a.addEventListener('click', close));

  // Expandable "Products" submenu inside the hamburger panel
  mobileNav.querySelectorAll('.mobile-submenu-toggle').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      btn.closest('.mobile-nav-parent').classList.toggle('open');
    });
  });
}

// ---- Search overlay ----
function initSearch() {
  const openBtn = document.getElementById('searchBtn');
  const overlay = document.getElementById('searchOverlay');
  const closeBtn = document.getElementById('searchClose');
  const input = document.getElementById('searchInput');
  if (!overlay) return;

  openBtn && openBtn.addEventListener('click', () => {
    overlay.classList.add('active');
    setTimeout(() => input && input.focus(), 300);
  });
  const close = () => overlay.classList.remove('active');
  closeBtn && closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
}

// ---- Back to top ----
function initBackTop() {
  const btn = document.getElementById('backTop');
  if (!btn) return;
  window.addEventListener('scroll', () => btn.classList.toggle('visible', window.scrollY > 400));
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

// ---- Scroll reveal ----
function initReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

// ---- Custom language dropdown ----
function initLang() {
  const dropdown = document.getElementById('langDropdown');
  if (!dropdown) return;
  const btn = document.getElementById('langCurrentBtn');
  const menu = document.getElementById('langMenu');
  const flagImg = document.getElementById('langCurrentFlag');
  const codeSpan = document.getElementById('langCurrentCode');

  const setLang = (li, persist = true) => {
    const lang = li.getAttribute('data-lang');
    const code = li.getAttribute('data-code');
    const flagSrc = li.querySelector('img').getAttribute('src');
    currentLang = lang;
    flagImg.setAttribute('src', flagSrc);
    codeSpan.textContent = code;
    menu.querySelectorAll('li').forEach(item => item.classList.toggle('active', item === li));
    applyTranslations(lang);
    if (persist) {
      try { localStorage.setItem('rkiLang', lang); } catch (e) { /* storage unavailable */ }
    }
    dropdown.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
  };

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = dropdown.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(isOpen));
  });

  menu.querySelectorAll('li').forEach(li => {
    li.addEventListener('click', () => setLang(li));
  });

  // Restore the language the visitor previously selected (persists across page navigation)
  let savedLang = null;
  try { savedLang = localStorage.getItem('rkiLang'); } catch (e) { /* storage unavailable */ }
  if (savedLang) {
    const savedLi = menu.querySelector(`li[data-lang="${savedLang}"]`);
    if (savedLi) setLang(savedLi, false);
  }

  document.addEventListener('click', (e) => {
    if (!dropdown.contains(e.target)) {
      dropdown.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      dropdown.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    }
  });
}

// ---- Generic horizontal slider (arrow nav) ----
function initSlider(trackId, prevId, nextId) {
  const track = document.getElementById(trackId);
  const prev = document.getElementById(prevId);
  const next = document.getElementById(nextId);
  if (!track || !prev || !next) return;

  const scrollAmount = () => track.querySelector(':scope > *')?.offsetWidth + 20 || 200;

  const updateArrows = () => {
    prev.disabled = track.scrollLeft <= 4;
    next.disabled = track.scrollLeft >= track.scrollWidth - track.clientWidth - 4;
  };

  prev.addEventListener('click', () => track.scrollBy({ left: -scrollAmount() * 2, behavior: 'smooth' }));
  next.addEventListener('click', () => track.scrollBy({ left: scrollAmount() * 2, behavior: 'smooth' }));
  track.addEventListener('scroll', updateArrows);
  window.addEventListener('resize', updateArrows);
  updateArrows();
}

// ---- Continuous auto-slide (mobile only — Industries / Clients; overflow-based when alwaysOnOverflow=true) ----
function initAutoSlide(trackId, prevId, nextId, alwaysOnOverflow) {
  const track = document.getElementById(trackId);
  if (!track) return;
  const prev = document.getElementById(prevId);
  const next = document.getElementById(nextId);

  const SPEED = 0.6;   // px per tick — smooth continuous crawl
  const TICK = 16;
  let timer = null;
  let resumeTimeout = null;

  function step() {
    if (track.scrollWidth <= track.clientWidth + 1) return; // nothing to scroll
    if (track.scrollLeft >= track.scrollWidth - track.clientWidth - 1) {
      track.scrollLeft = 0;
    } else {
      track.scrollLeft += SPEED;
    }
  }

  function canRun() {
    if (alwaysOnOverflow) return track.scrollWidth > track.clientWidth + 1;
    return window.matchMedia('(max-width: 768px)').matches;
  }

  function start() {
    if (timer || !canRun()) return;
    timer = setInterval(step, TICK);
  }

  function stop() {
    clearInterval(timer);
    timer = null;
  }

  function pauseThenResume() {
    stop();
    clearTimeout(resumeTimeout);
    resumeTimeout = setTimeout(start, 2500);
  }

  track.addEventListener('touchstart', pauseThenResume, { passive: true });
  track.addEventListener('mousedown', pauseThenResume);
  track.addEventListener('wheel', pauseThenResume, { passive: true });
  if (prev) prev.addEventListener('click', pauseThenResume);
  if (next) next.addEventListener('click', pauseThenResume);

  window.addEventListener('resize', () => {
    if (canRun()) start(); else stop();
  });

  start();
}

// ---- Filter buttons (products page) ----
function initFilters() {
  const btns = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.product-item');
  if (!btns.length) return;

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.getAttribute('data-cat');
      let firstMatch = null;
      cards.forEach(card => {
        if (cat === 'all' || card.getAttribute('data-cat') === cat) {
          card.style.display = '';
          card.style.animation = 'fadeInUp 0.4s ease both';
          if (!firstMatch) firstMatch = card;
        } else {
          card.style.display = 'none';
        }
      });
      // Scroll to the first matching product so the click gives visible feedback
      if (firstMatch && cat !== 'all') {
        const targetSection = firstMatch.closest('section') || firstMatch;
        const top = targetSection.getBoundingClientRect().top + window.pageYOffset - 90;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // Mobile dropdown mirrors the same filter buttons (reuses their click logic)
  const select = document.getElementById('filterSelect');
  if (select) {
    select.addEventListener('change', () => {
      const match = document.querySelector(`.filter-btn[data-cat="${select.value}"]`);
      if (match) match.click();
    });
  }
}

// ---- Contact form (EmailJS) ----
//
// This site is static HTML, so enquiries are sent client-side with EmailJS
// (https://www.emailjs.com). To activate real email delivery to
// sales@ramkrishanindustries.com:
//   1. Create a free EmailJS account and an Email Service connected to
//      sales@ramkrishanindustries.com (Gmail, Outlook, or your own SMTP).
//   2. Create an Email Template with variables matching the ones sent
//      below: first_name, last_name, email, phone, company, country,
//      product, inquiry, message, to_email.
//   3. Replace the three placeholders in EMAILJS_CONFIG below with your
//      Public Key, Service ID, and Template ID from the EmailJS dashboard.
//   4. The <script src="https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js">
//      tag in the <head> of every page loads the EmailJS SDK — no other
//      code changes are required.
const EMAILJS_CONFIG = {
  publicKey: 'YOUR_EMAILJS_PUBLIC_KEY',   // <-- replace with your EmailJS Public Key
  serviceId: 'YOUR_EMAILJS_SERVICE_ID',   // <-- replace with your EmailJS Service ID
  templateId: 'YOUR_EMAILJS_TEMPLATE_ID', // <-- replace with your EmailJS Template ID
  toEmail: 'sales@ramkrishanindustries.com'
};

function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  // Initialize EmailJS once the SDK has loaded and a real Public Key has been set.
  const emailjsReady = typeof window.emailjs !== 'undefined' &&
    EMAILJS_CONFIG.publicKey && !EMAILJS_CONFIG.publicKey.startsWith('YOUR_');
  if (emailjsReady) {
    try { window.emailjs.init({ publicKey: EMAILJS_CONFIG.publicKey }); } catch (err) { /* ignore double-init */ }
  }

  const statusEl = document.getElementById('contactFormStatus');
  const showStatus = (msg, isError) => {
    if (!statusEl) return;
    statusEl.textContent = msg;
    statusEl.style.display = 'block';
    statusEl.style.color = isError ? '#c0392b' : '#16a34a';
  };

  form.addEventListener('submit', e => {
    e.preventDefault();

    // Basic required-field validation with visible feedback (native HTML5
    // "required" already blocks submission, but we double-check here so a
    // clear message shows even if validation is bypassed).
    const required = ['firstName', 'lastName', 'email', 'product', 'message'];
    for (const id of required) {
      const field = form.querySelector(`#${id}`);
      if (field && !field.value.trim()) {
        field.focus();
        showStatus('Please fill in all required fields before submitting.', true);
        return;
      }
    }
    const emailField = form.querySelector('#email');
    if (emailField && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailField.value.trim())) {
      emailField.focus();
      showStatus('Please enter a valid email address.', true);
      return;
    }

    const btn = form.querySelector('button[type=submit]');
    const original = btn.textContent;
    btn.textContent = 'Sending…';
    btn.disabled = true;

    const params = {
      first_name: form.querySelector('#firstName')?.value.trim() || '',
      last_name: form.querySelector('#lastName')?.value.trim() || '',
      email: form.querySelector('#email')?.value.trim() || '',
      phone: form.querySelector('#phone')?.value.trim() || '',
      company: form.querySelector('#company')?.value.trim() || '',
      country: form.querySelector('#country')?.value.trim() || '',
      product: form.querySelector('#product')?.value || '',
      inquiry: form.querySelector('#inquiry')?.value || '',
      message: form.querySelector('#message')?.value.trim() || '',
      to_email: EMAILJS_CONFIG.toEmail
    };

    const onSuccess = () => {
      btn.textContent = 'Message Sent! ✓';
      btn.style.background = '#16a34a';
      showStatus(`Thank you! Your enquiry has been sent to ${EMAILJS_CONFIG.toEmail}. Our team will respond within 24 hours.`, false);
      form.reset();
      setTimeout(() => {
        btn.textContent = original;
        btn.disabled = false;
        btn.style.background = '';
      }, 3500);
    };

    // Fallback used when EmailJS hasn't been configured: opens the visitor's own email app
    const sendViaMailto = () => {
      const subject = `New Enquiry from Website: ${params.first_name} ${params.last_name}`.trim();
      const bodyLines = [
        `Name: ${params.first_name} ${params.last_name}`.trim(),
        `Email: ${params.email}`,
        params.phone ? `Phone / WhatsApp: ${params.phone}` : '',
        params.company ? `Company: ${params.company}` : '',
        params.country ? `Country: ${params.country}` : '',
        `Product Interest: ${params.product}`,
        `Inquiry Type: ${params.inquiry}`,
        '',
        'Message:',
        params.message
      ].filter(Boolean).join('\n');

      const mailtoUrl = `mailto:${EMAILJS_CONFIG.toEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyLines)}`;
      window.location.href = mailtoUrl;

      btn.textContent = original;
      btn.disabled = false;
      showStatus(`Opening your email app to send this to ${EMAILJS_CONFIG.toEmail}. If nothing opens, please email us directly at ${EMAILJS_CONFIG.toEmail}.`, false);
      form.reset();
    };

    const onError = (err) => {
      console.error('Ram Krishan Industries contact form error:', err);
      sendViaMailto();
    };

    if (emailjsReady) {
      window.emailjs.send(EMAILJS_CONFIG.serviceId, EMAILJS_CONFIG.templateId, params)
        .then(onSuccess)
        .catch(onError);
    } else {
      // EmailJS keys have not been configured yet (see EMAILJS_CONFIG above)
      // — fall back to opening the visitor's email client directly.
      sendViaMailto();
    }
  });
}

// ---- Smooth counter animation ----
function animateCounter(el) {
  const target = parseInt(el.getAttribute('data-target'));
  const suffix = el.getAttribute('data-suffix') || '';
  const duration = 1800;
  const step = target / (duration / 16);
  let current = 0;
  const timer = setInterval(() => {
    current += step;
    if (current >= target) { current = target; clearInterval(timer); }
    el.textContent = (target >= 1000 ? Math.floor(current).toLocaleString('en-US') : Math.floor(current)) + suffix;
  }, 16);
}

function initCounters() {
  const counters = document.querySelectorAll('[data-target]');
  if (!counters.length) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { animateCounter(e.target); obs.unobserve(e.target); }
    });
  }, { threshold: 0.5 });
  counters.forEach(c => obs.observe(c));
}

// ---- Active nav link ----
function setActiveNav() {
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mobile-nav a').forEach(a => {
    if (a.getAttribute('href') === page) a.classList.add('active');
  });
}

// ---- Init all ----
function initHeroVideo() {
  const video = document.getElementById('heroVideo');
  if (!video) return;
  video.muted = true;
  video.setAttribute('muted', '');
  video.playsInline = true;
  const tryPlay = () => {
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // iOS may block until a user gesture — retry on first touch
        const resume = () => { video.play().catch(() => {}); document.removeEventListener('touchstart', resume); };
        document.addEventListener('touchstart', resume, { once: true, passive: true });
      });
    }
  };
  if (video.readyState >= 2) tryPlay();
  else video.addEventListener('loadedmetadata', tryPlay, { once: true });
}

function initHeroSlider() {
  const slider = document.getElementById('heroSlider');
  if (!slider) return;
  const slides = slider.querySelectorAll('.hero-slide');
  if (slides.length <= 1) return;
  let current = 0;
  setInterval(() => {
    slides[current].classList.remove('active');
    current = (current + 1) % slides.length;
    slides[current].classList.add('active');
  }, 2000);
}

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initNavDropdown();
  initMobileNav();
  initSearch();
  initBackTop();
  initReveal();
  initLang();
  initFilters();
  initHeroVideo();
  initHeroSlider();
  initSlider('clientsTrack', 'clientsPrev', 'clientsNext');
  initAutoSlide('clientsTrack', 'clientsPrev', 'clientsNext');
  initContactForm();
  initCounters();
  setActiveNav();
});

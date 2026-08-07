'use strict';

const galleryGrid = document.getElementById('gallery-grid');
const lightbox = document.getElementById('lightbox');
const filterButtons = document.querySelectorAll('.gallery__filters .pill[data-filter]');
const navToggle = document.querySelector('.nav-toggle');
const siteNav = document.getElementById('site-nav');
const navLinks = document.querySelectorAll('.site-nav__list a');

let artworks = [];
let activeFilter = 'all';

async function loadArtworks() {
  const response = await fetch('assets/data/artworks.json');
  artworks = await response.json();
  renderGallery();
}

function renderGallery() {
  if (!galleryGrid) return;

  const filtered = activeFilter === 'all'
    ? artworks
    : artworks.filter((item) => item.category === activeFilter);

  galleryGrid.innerHTML = '';

  if (filtered.length === 0) {
    galleryGrid.innerHTML = '<p class="gallery__empty">Nenhuma obra nesta categoria ainda.</p>';
    return;
  }

  filtered.forEach((artwork) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'gallery__item';
    button.dataset.id = artwork.id;
    button.setAttribute('aria-label', `Ver ${artwork.title}`);

    const img = document.createElement('img');
    img.src = artwork.thumb;
    img.alt = artwork.alt;
    img.loading = 'lazy';
    img.width = 800;
    img.height = 1000;

    button.appendChild(img);
    button.addEventListener('click', () => openLightbox(artwork));
    galleryGrid.appendChild(button);
  });
}

function openLightbox(artwork) {
  if (!lightbox) return;

  const image = lightbox.querySelector('.lightbox__image');
  const title = lightbox.querySelector('.lightbox__title');
  const meta = lightbox.querySelector('.lightbox__meta');
  const dimensions = lightbox.querySelector('.lightbox__dimensions');

  image.src = artwork.image;
  image.alt = artwork.alt;
  title.textContent = artwork.title;
  meta.textContent = artwork.technique;
  dimensions.textContent = artwork.dimensions;

  if (typeof lightbox.showModal === 'function') {
    lightbox.showModal();
  }
}

function closeLightbox() {
  if (lightbox && lightbox.open) {
    lightbox.close();
  }
}

function initFilters() {
  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      activeFilter = button.dataset.filter;

      filterButtons.forEach((btn) => {
        const isActive = btn === button;
        btn.classList.toggle('pill--active', isActive);
        btn.setAttribute('aria-selected', String(isActive));
      });

      renderGallery();
    });
  });
}

function initLightbox() {
  if (!lightbox) return;

  lightbox.querySelector('.lightbox__close')?.addEventListener('click', closeLightbox);

  lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox) {
      closeLightbox();
    }
  });

  lightbox.addEventListener('cancel', (event) => {
    event.preventDefault();
    closeLightbox();
  });
}

function initMobileNav() {
  if (!navToggle || !siteNav) return;

  navToggle.addEventListener('click', () => {
    const isOpen = siteNav.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
    navToggle.setAttribute('aria-label', isOpen ? 'Fechar menu' : 'Abrir menu');
  });

  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      siteNav.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.setAttribute('aria-label', 'Abrir menu');
    });
  });
}

function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (event) => {
      const targetId = anchor.getAttribute('href');
      if (!targetId || targetId === '#') return;

      const target = document.querySelector(targetId);
      if (!target) return;

      event.preventDefault();
      const offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h'), 10) || 72;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;

      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}

function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        navLinks.forEach((link) => {
          link.classList.toggle('is-active', link.getAttribute('href') === `#${entry.target.id}`);
        });
      });
    },
    { rootMargin: '-40% 0px -55% 0px', threshold: 0 }
  );

  sections.forEach((section) => observer.observe(section));
}

document.addEventListener('DOMContentLoaded', () => {
  loadArtworks();
  initFilters();
  initLightbox();
  initMobileNav();
  initSmoothScroll();
  initActiveNav();
});

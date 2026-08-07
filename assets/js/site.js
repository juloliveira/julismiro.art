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

    const overlay = document.createElement('span');
    overlay.className = 'gallery__item-overlay';
    
    const info = document.createElement('span');
    info.className = 'gallery__item-info';
    
    const title = document.createElement('span');
    title.className = 'gallery__item-title';
    title.textContent = artwork.title;
    
    const category = document.createElement('span');
    category.className = 'gallery__item-category';
    category.textContent = artwork.technique;
    
    info.appendChild(title);
    info.appendChild(category);
    overlay.appendChild(info);

    button.appendChild(img);
    button.appendChild(overlay);
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

async function loadSubstackPosts() {
  const substackContainer = document.getElementById('substack-posts');
  if (!substackContainer) return;

  try {
    const rssFeedUrl = 'https://julismiro.substack.com/feed';
    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssFeedUrl)}`;
    
    const response = await fetch(apiUrl);
    const data = await response.json();
    
    if (data.status === 'ok' && data.items && data.items.length > 0) {
      substackContainer.innerHTML = '';
      
      const posts = data.items.slice(0, 3);
      
      posts.forEach((post) => {
        const card = document.createElement('a');
        card.href = post.link;
        card.target = '_blank';
        card.rel = 'noopener noreferrer';
        card.className = 'substack-card';
        
        const dateObj = new Date(post.pubDate.replace(/-/g, "/"));
        const formattedDate = dateObj.toLocaleDateString('pt-BR', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        });

        const tempDiv = document.createElement('span');
        tempDiv.innerHTML = post.description || post.content;
        let textContent = tempDiv.textContent || tempDiv.innerText || '';
        if (textContent.length > 120) {
          textContent = textContent.substring(0, 117) + '...';
        }
        
        const thumbnail = (post.enclosure && post.enclosure.link) || post.thumbnail || 'assets/img/retrato-julis-miro-thumb.webp';
        
        card.innerHTML = `
          <span class="substack-card__image-wrapper">
            <img class="substack-card__image" src="${thumbnail}" alt="${post.title}" loading="lazy">
          </span>
          <span class="substack-card__content">
            <span class="substack-card__date">${formattedDate}</span>
            <span class="substack-card__title">${post.title}</span>
            <span class="substack-card__description">${textContent}</span>
            <span class="substack-card__link">Ler no Substack</span>
          </span>
        `;
        substackContainer.appendChild(card);
      });
    } else {
      substackContainer.innerHTML = '<p class="substack-error">Nenhum ensaio encontrado no momento.</p>';
    }
  } catch (error) {
    console.error('Erro ao carregar feed do Substack:', error);
    substackContainer.innerHTML = '<p class="substack-error">Erro ao carregar os ensaios do Substack. Visite <a href="https://julismiro.substack.com" target="_blank" rel="noopener noreferrer">julismiro.substack.com</a> para ler.</p>';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadArtworks();
  initFilters();
  initLightbox();
  initMobileNav();
  initSmoothScroll();
  initActiveNav();
  loadSubstackPosts();
});

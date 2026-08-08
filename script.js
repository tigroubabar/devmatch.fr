// DevMatch — interactions communes aux cinq pages.
(function () {
  'use strict';

  const DISCORD_INVITE_URL = 'https://discord.gg/9CwjnsuMZ5';
  const POPUP_STORAGE_KEY = 'devmatch-discord-invite-dismissed';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function observeReveal(elements) {
    const revealElements = Array.from(elements || document.querySelectorAll('.reveal'));

    if (!('IntersectionObserver' in window) || reduceMotion.matches) {
      revealElements.forEach((element) => element.classList.add('in'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    revealElements.forEach((element) => observer.observe(element));
  }

  window.DevMatch = Object.freeze({ observeReveal });

  function setupNavigation() {
    const toggle = document.getElementById('navToggle');
    const links = document.getElementById('navLinks');
    if (!toggle || !links) return;

    const setMenuOpen = (open) => {
      links.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
      toggle.textContent = open ? '×' : '☰';
    };

    toggle.addEventListener('click', () => {
      setMenuOpen(!links.classList.contains('open'));
    });

    links.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => setMenuOpen(false));
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && links.classList.contains('open')) {
        setMenuOpen(false);
        toggle.focus();
      }
    });
  }

  function wasPopupDismissed() {
    try {
      return window.sessionStorage.getItem(POPUP_STORAGE_KEY) === 'true';
    } catch (error) {
      return false;
    }
  }

  function rememberPopupDismissal() {
    try {
      window.sessionStorage.setItem(POPUP_STORAGE_KEY, 'true');
    } catch (error) {
      // Le pop-up reste fonctionnel même si le stockage est indisponible.
    }
  }

  function setupDiscordPopup() {
    if (wasPopupDismissed()) return;

    const popup = document.createElement('aside');
    popup.className = 'discord-invite-popup';
    popup.setAttribute('role', 'dialog');
    popup.setAttribute('aria-label', 'Invitation à rejoindre le serveur Discord DevMatch');
    popup.innerHTML = `
      <img src="assets/discord-invite.svg" width="181" height="230" alt="Carte d'invitation au serveur Discord DevMatch">
      <a class="discord-invite-link" href="${DISCORD_INVITE_URL}" target="_blank" rel="noopener noreferrer" aria-label="Rejoindre le serveur Discord DevMatch dans un nouvel onglet"></a>
      <button class="discord-invite-close" type="button" aria-label="Fermer l'invitation Discord">×</button>
    `;

    const closeButton = popup.querySelector('.discord-invite-close');
    const handleEscape = (event) => {
      if (event.key === 'Escape' && popup.isConnected) closePopup();
    };
    const closePopup = () => {
      if (popup.classList.contains('is-closing')) return;
      rememberPopupDismissal();
      popup.classList.add('is-closing');
      document.removeEventListener('keydown', handleEscape);
      window.setTimeout(() => popup.remove(), reduceMotion.matches ? 0 : 200);
    };

    closeButton.addEventListener('click', closePopup);
    document.addEventListener('keydown', handleEscape);

    document.body.appendChild(popup);
  }

  function isInternalPageLink(link) {
    if (link.target === '_blank' || link.hasAttribute('download')) return false;
    const destination = new URL(link.href, window.location.href);
    if (destination.origin !== window.location.origin) return false;
    if (destination.href === window.location.href) return false;
    if (destination.pathname === window.location.pathname && destination.hash) return false;
    return /\.html$/i.test(destination.pathname) || destination.pathname.endsWith('/');
  }

  function setupPageTransitions() {
    document.addEventListener('click', (event) => {
      const link = event.target.closest('a[href]');
      if (!link || event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (!isInternalPageLink(link)) return;

      if (reduceMotion.matches) return;
      event.preventDefault();
      document.body.classList.add('page-leaving');
      window.setTimeout(() => {
        window.location.href = link.href;
      }, 170);
    });

    window.addEventListener('pageshow', () => {
      document.body.classList.remove('page-leaving');
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    setupNavigation();
    observeReveal();
    setupDiscordPopup();
    setupPageTransitions();
  });
}());

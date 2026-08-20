import { useEffect, useRef, useState } from 'react';
import { DISCORD_INVITE } from './data/projects.js';
import { getProjects } from './data/projectsService.js';
import { useEditorialMotion } from './hooks/useEditorialMotion.js';
import { useVantaBirds } from './hooks/useVantaBirds.js';

const NAV_ITEMS = [
  ['home', 'Accueil'],
  ['projets', 'Projets'],
  ['salons', 'Salons'],
  ['apropos', 'Communauté'],
  ['fonctionnement', 'Utiliser DevMatch'],
  ['contact', 'Contact'],
];

const CHANNELS = [
  ['📜', 'présentation', 'Présentation de DevMatch : objectifs, règles et fonctionnement.'],
  ['📢', 'annonces', 'Informations importantes et mises à jour de la communauté.'],
  ['💫', 'tuto-commandes', 'Guides et commandes pour utiliser le serveur et les outils.'],
  ['💬', 'général', "Discussions quotidiennes et recherche d'aides pour tes tâches."],
  ['🤖', 'commandes-bot', 'Tester et interagir avec les commandes du bot.'],
  ['🔊', 'général (vocal)', "Espaces vocaux pour pair-programming, réunions et sessions d'entraide."],
];

const VALUES = [
  ['01', 'Échanger sur le code', "Les salons d'entraide permettent de présenter un problème technique et de demander un avis."],
  ['02', 'Suivre les projets', "Chaque projet dispose d'un espace pour regrouper les membres, les décisions et l'avancement."],
  ['03', 'Développer par la pratique', 'Les membres peuvent contribuer à un projet réel et travailler avec les contraintes définies par son équipe.'],
  ['04', 'Indiquer le niveau attendu', 'Chaque fiche de projet précise une difficulté pour aider les membres à choisir une contribution adaptée.'],
];

const STEPS = [
  {
    image: '/assets/fonctionnement-serveur.png',
    width: 497,
    height: 802,
    alt: "Aperçu d'une fiche de projet avec les informations de suivi et d'équipe.",
    title: '1. Découvre la communauté',
  },
  {
    image: '/assets/fonctionnement-projet.jpg',
    width: 1080,
    height: 2400,
    alt: "Commande de création d'un projet avec le titre, la description et les langages.",
    title: '2. Déclare ou rejoins un projet',
  },
  {
    image: '/assets/fonctionnement-equipe.jpg',
    width: 1080,
    height: 2400,
    alt: "Échanges techniques entre les membres d'une équipe autour d'un projet.",
    title: "3. Échange avec l'équipe",
  },
];

function SectionHeading({ eyebrow, children, titleId }) {
  return (
    <header className="dmx-heading" data-dmx-reveal>
      {eyebrow ? <p className="dmx-heading__eyebrow">{eyebrow}</p> : null}
      <div className="dmx-heading__mask">
        <h2 id={titleId} data-dmx-mask-copy>{children}</h2>
      </div>
    </header>
  );
}

function EditorialLink({ className = '', children, ...props }) {
  return (
    <a className={`dmx-action ${className}`.trim()} {...props}>
      <span>{children}</span>
      <span aria-hidden="true">↗</span>
    </a>
  );
}

function difficultyStars(value) {
  const count = Number(value);
  if (Number.isInteger(count) && count >= 1 && count <= 5) {
    return '★'.repeat(count) + '☆'.repeat(5 - count);
  }
  return { facile: '★☆☆☆☆', moyen: '★★★☆☆', difficile: '★★★★☆' }[String(value).toLowerCase()] || '☆☆☆☆☆';
}

function ProjectCard({ project, index }) {
  const owner = project.ownerUsername || project.owner || project.author || 'Anonyme';
  const count = typeof project.memberCount === 'number' ? project.memberCount : project.members?.length || 0;

  return (
    <article className="dmx-project" data-accent={project.accent || 1}>
      <p className="dmx-project__index">Projet {String(index + 1).padStart(2, '0')}</p>
      <h3>{project.title}</h3>
      <p className="dmx-project__summary">{project.description}</p>
      <div className="dmx-project__labels" aria-label="Technologies et caractéristiques">
        {project.languages.map((language) => (
          <span key={language}>{language}</span>
        ))}
        <span aria-label={`Difficulté ${project.difficulty} sur 5`}>{difficultyStars(project.difficulty)}</span>
        <span>{project.openSource ? '🔓 Open Source' : '🔒 Propriétaire'}</span>
      </div>
      <footer className="dmx-project__footer">
        <div>
          <strong>{owner}</strong>
          <span>{count} {count > 1 ? 'membres' : 'membre'}</span>
        </div>
        <EditorialLink href={DISCORD_INVITE} target="_blank" rel="noopener noreferrer">
          Rejoindre le projet
        </EditorialLink>
      </footer>
    </article>
  );
}

function ProjectsSection() {
  const [projects, setProjects] = useState([]);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    const controller = new AbortController();

    getProjects({ signal: controller.signal })
      .then((result) => {
        setProjects(result);
        setStatus(result.length ? 'ready' : 'empty');
        window.requestAnimationFrame(() => window.dispatchEvent(new Event('dmx-content-ready')));
      })
      .catch((error) => {
        if (controller.signal.aborted) return;
        console.error('Erreur pendant le chargement des projets :', error);
        setStatus('error');
      });

    return () => controller.abort();
  }, []);

  return (
    <section className="dmx-section dmx-section--projects" id="projets" aria-labelledby="dmx-projects-title">
      <div className="dmx-wrap">
        <header className="dmx-heading" data-dmx-reveal>
          <p className="dmx-heading__eyebrow">Liste des projets</p>
          <div className="dmx-heading__mask">
            <h2 id="dmx-projects-title" data-dmx-mask-copy>Projets actuellement publiés</h2>
          </div>
        </header>

        <div className="dmx-projects" aria-live="polite" aria-busy={status === 'loading'}>
          {status === 'loading' ? (
            <p className="dmx-status"><span aria-hidden="true" />Chargement des projets…</p>
          ) : null}
          {status === 'empty' ? <p className="dmx-status">Aucun projet n’est publié pour le moment.</p> : null}
          {status === 'error' ? <p className="dmx-status dmx-status--error">Impossible de charger les projets. Réessaie plus tard.</p> : null}
          {projects.map((project, index) => <ProjectCard key={project.id} project={project} index={index} />)}
        </div>
      </div>
    </section>
  );
}

function TrafficTradeSlot() {
  const frameRef = useRef(null);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame || frame.dataset.loaderMounted === 'true') return undefined;
    frame.dataset.loaderMounted = 'true';

    const host = document.createElement('div');
    host.className = 'dmx-advert__host';
    host.setAttribute('aria-label', 'Contenu partenaire');

    const loader = document.createElement('script');
    loader.src = 'https://traffictrade.fr/ads.js';
    loader.dataset.token = 'teNYjoP2nY5ubKvQGNty1dXIe0oDtmrV';
    loader.async = true;

    frame.append(host, loader);

    const observer = new MutationObserver(() => {
      const frames = host.querySelectorAll('iframe');
      frames.forEach((iframe, index) => {
        if (index > 0) iframe.remove();
      });
    });
    observer.observe(host, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      loader.remove();
      host.remove();
      delete frame.dataset.loaderMounted;
    };
  }, []);

  return (
    <aside className="dmx-advert" aria-label="Partenaire DevMatch">
      <div className="dmx-wrap" ref={frameRef} />
    </aside>
  );
}

function App() {
  const rootRef = useRef(null);
  const heroVantaRef = useRef(null);
  const [activeSection, setActiveSection] = useState('home');
  const { scrollToAnchor, focusSection } = useEditorialMotion(rootRef);
  useVantaBirds(heroVantaRef);

  useEffect(() => {
    let frameId = 0;
    const updateActive = () => {
      frameId = 0;
      let current = 'home';
      NAV_ITEMS.forEach(([id]) => {
        const section = document.getElementById(id);
        if (section && section.getBoundingClientRect().top <= 150) current = id;
      });
      setActiveSection(current);
    };
    const requestUpdate = () => {
      if (!frameId) frameId = window.requestAnimationFrame(updateActive);
    };

    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);
    updateActive();

    return () => {
      window.removeEventListener('scroll', requestUpdate);
      window.removeEventListener('resize', requestUpdate);
      if (frameId) window.cancelAnimationFrame(frameId);
    };
  }, []);

  const handleAnchor = (event) => {
    const href = event.currentTarget.getAttribute('href');
    if (!href?.startsWith('#')) return;
    const target = document.getElementById(href.slice(1));
    if (!target) return;

    event.preventDefault();
    window.history.replaceState(null, '', href);
    setActiveSection(target.id);
    scrollToAnchor(target, () => focusSection(target));
  };

  return (
    <div className="dmx-site" ref={rootRef}>
      <a className="dmx-skip" href="#projets" onClick={handleAnchor}>Aller au contenu</a>

      <header className="dmx-topbar">
        <div className="dmx-topbar__row">
          <a className="dmx-wordmark" href="#home" onClick={handleAnchor} aria-label="DevMatch — accueil">
            <img src="/assets/logo.png" width="48" height="48" alt="Logo DevMatch" />
            <span>DevMatch</span>
          </a>
          <a className="dmx-topbar__discord" href={DISCORD_INVITE} target="_blank" rel="noopener noreferrer">
            Discord <span aria-hidden="true">↗</span>
          </a>
        </div>
        <nav className="dmx-topbar__nav" aria-label="Navigation principale">
          {NAV_ITEMS.map(([id, label]) => (
            <a
              key={id}
              href={`#${id}`}
              onClick={handleAnchor}
              aria-current={activeSection === id ? 'location' : undefined}
            >
              {label}
            </a>
          ))}
        </nav>
      </header>

      <main>
        <section className="dmx-hero" id="home" aria-labelledby="dmx-hero-title">
          <div className="dmx-hero__vanta" ref={heroVantaRef} aria-hidden="true" />
          <div className="dmx-hero__rule" data-dmx-parallax aria-hidden="true" />
          <div className="dmx-wrap dmx-hero__layout">
            <p className="dmx-hero__label" data-dmx-reveal>Communauté francophone · Développement collectif</p>
            <div className="dmx-hero__statement">
              <h1 id="dmx-hero-title">Un lieu pour les développeurs</h1>
              <p>Présente un projet, rejoins une équipe ou demande de l'aide sur un sujet technique.</p>
            </div>
            <div className="dmx-hero__actions" data-dmx-reveal>
              <EditorialLink className="dmx-action--solid" href="#projets" onClick={handleAnchor}>Explorer les projets</EditorialLink>
              <EditorialLink href={DISCORD_INVITE} target="_blank" rel="noopener noreferrer">Rejoindre le serveur Discord</EditorialLink>
              <EditorialLink href="#apropos" onClick={handleAnchor}>Voir la présentation</EditorialLink>
            </div>
            <p className="dmx-hero__note" data-dmx-reveal>Publier · Contribuer · Progresser</p>
          </div>
        </section>

        <ProjectsSection />
        <TrafficTradeSlot />

        <section className="dmx-section" id="salons" aria-labelledby="dmx-salons-title">
          <div className="dmx-wrap">
            <header className="dmx-heading" data-dmx-reveal>
              <p className="dmx-heading__eyebrow">Salons</p>
              <div className="dmx-heading__mask"><h2 id="dmx-salons-title" data-dmx-mask-copy>Les salons</h2></div>
            </header>
            <p className="dmx-intro" data-dmx-reveal>
              Rejoins des discussions pour développer des projets en équipe, demander de l'aide ponctuelle ou trouver des personnes motivées pour contribuer à ton idée.
            </p>
            <div className="dmx-channel-list" data-dmx-reveal>
              {CHANNELS.map(([icon, name, description]) => (
                <article className="dmx-channel" key={name}>
                  <span className="dmx-channel__icon" aria-hidden="true">{icon}</span>
                  <h3>{name}</h3>
                  <p>{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="dmx-section dmx-section--ink" id="apropos" aria-labelledby="dmx-values-title">
          <div className="dmx-wrap">
            <header className="dmx-heading" data-dmx-reveal>
              <p className="dmx-heading__eyebrow">Objectifs</p>
              <div className="dmx-heading__mask"><h2 id="dmx-values-title" data-dmx-mask-copy>À quoi sert la communauté</h2></div>
            </header>
            <div className="dmx-value-list" data-dmx-reveal>
              {VALUES.map(([number, title, description]) => (
                <article className="dmx-value" key={number}>
                  <span>{number}</span>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="dmx-section" id="fonctionnement" aria-labelledby="dmx-steps-title">
          <div className="dmx-wrap">
            <header className="dmx-heading" data-dmx-reveal>
              <p className="dmx-heading__eyebrow">Fonctionnement</p>
              <div className="dmx-heading__mask"><h2 id="dmx-steps-title" data-dmx-mask-copy>Utiliser DevMatch en trois étapes</h2></div>
            </header>
            <div className="dmx-steps" data-dmx-reveal>
              {STEPS.map((step) => (
                <article className="dmx-step" key={step.title}>
                  <div className="dmx-step__visual">
                    <img src={step.image} width={step.width} height={step.height} loading="lazy" alt={step.alt} />
                  </div>
                  <h3>{step.title}</h3>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="dmx-join" aria-labelledby="dmx-join-title">
          <div className="dmx-wrap dmx-join__layout" data-dmx-reveal>
            <div className="dmx-join__copy">
              <p>Prêt à participer ?</p>
              <h2 id="dmx-join-title">Ton prochain projet commence ici</h2>
              <div>
                <p>Publie ton idée avec <code>/create-project</code> ou consulte les projets ouverts.</p>
                <EditorialLink className="dmx-action--solid" href="#projets" onClick={handleAnchor}>Explorer les projets</EditorialLink>
              </div>
            </div>
            <img
              className="dmx-join__character"
              src="/assets/personnage-devmatch.png"
              width="1550"
              height="1015"
              loading="lazy"
              alt="Personnage DevMatch accoudé sur le bord du cadre"
            />
          </div>
        </section>

        <section className="dmx-section dmx-contact" id="contact" aria-labelledby="dmx-contact-title">
          <div className="dmx-wrap">
            <SectionHeading titleId="dmx-contact-title">Contact</SectionHeading>
            <div className="dmx-contact__grid" data-dmx-reveal>
              <article>
                <p>E-mail</p>
                <a href="mailto:contact@devmatch.fr">contact@devmatch.fr</a>
              </article>
              <article>
                <p>Discord</p>
                <span>@tigroubabar, @aurel___jnc, @tigroubabar2</span>
              </article>
            </div>
          </div>
        </section>
      </main>

      <a className="dmx-discord-float" href={DISCORD_INVITE} target="_blank" rel="noopener noreferrer" aria-label="Rejoindre le serveur Discord DevMatch">
        <img src="/assets/discord.jpg" width="64" height="64" alt="Icône du serveur Discord DevMatch" />
        <span>Rejoindre Discord</span>
      </a>
    </div>
  );
}

export default App;

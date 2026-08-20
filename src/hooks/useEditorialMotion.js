import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const NAV_OFFSET = 112;

function focusSection(target) {
  const hadTabIndex = target.hasAttribute('tabindex');
  const previousTabIndex = target.getAttribute('tabindex');
  target.setAttribute('tabindex', '-1');
  target.focus({ preventScroll: true });

  const restore = () => {
    if (hadTabIndex) target.setAttribute('tabindex', previousTabIndex);
    else target.removeAttribute('tabindex');
  };

  target.addEventListener('blur', restore, { once: true });
  window.setTimeout(restore, 1200);
}

export function useEditorialMotion(rootRef) {
  const lenisRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    const reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const reduceMotion = reduceMotionQuery.matches;
    const lenis = reduceMotion
      ? null
      : new Lenis({
          autoRaf: false,
          duration: 0.85,
          smoothWheel: true,
          syncTouch: false,
          anchors: false,
        });

    lenisRef.current = lenis;
    let tickerCallback;

    if (lenis) {
      lenis.on('scroll', ScrollTrigger.update);
      tickerCallback = (time) => lenis.raf(time * 1000);
      gsap.ticker.add(tickerCallback);
      gsap.ticker.lagSmoothing(0);
    }

    const motionContext = gsap.context(() => {
      if (reduceMotion) return;

      root.dataset.motionReady = 'true';
      gsap.utils.toArray('[data-dmx-reveal]').forEach((element) => {
        gsap.set(element, { autoAlpha: 0, y: 8 });
        gsap.to(element, {
          autoAlpha: 1,
          y: 0,
          duration: 0.62,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: element,
            start: 'top 88%',
            once: true,
          },
        });
      });

      gsap.utils.toArray('[data-dmx-mask-copy]').forEach((element) => {
        gsap.set(element, { clipPath: 'inset(0 0 100% 0)' });
        gsap.to(element, {
          clipPath: 'inset(0 0 0% 0)',
          duration: 0.68,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: element,
            start: 'top 90%',
            once: true,
          },
        });
      });

      gsap.utils.toArray('[data-dmx-parallax]').forEach((element) => {
        gsap.fromTo(
          element,
          { yPercent: -3 },
          {
            yPercent: 3,
            ease: 'none',
            scrollTrigger: {
              trigger: element.parentElement,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 0.8,
            },
          },
        );
      });
    }, root);

    const handleContentReady = () => ScrollTrigger.refresh();
    window.addEventListener('dmx-content-ready', handleContentReady);

    return () => {
      window.removeEventListener('dmx-content-ready', handleContentReady);
      motionContext.revert();
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      if (tickerCallback) gsap.ticker.remove(tickerCallback);
      if (lenis) {
        lenis.off('scroll', ScrollTrigger.update);
        lenis.destroy();
      }
      delete root.dataset.motionReady;
      lenisRef.current = null;
    };
  }, [rootRef]);

  const scrollToAnchor = (target, onComplete) => {
    const lenis = lenisRef.current;
    if (lenis) {
      lenis.scrollTo(target, {
        offset: -NAV_OFFSET,
        duration: 0.75,
        onComplete,
      });
      return;
    }

    const targetTop = target.getBoundingClientRect().top + window.scrollY - NAV_OFFSET;
    window.scrollTo({ top: targetTop, behavior: 'auto' });
    onComplete?.();
  };

  return { scrollToAnchor, focusSection };
}

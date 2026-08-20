import { useEffect } from 'react';

function canCreateWebGlContext() {
  try {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    context?.getExtension('WEBGL_lose_context')?.loseContext();
    return Boolean(context);
  } catch {
    return false;
  }
}

export function useVantaBirds(containerRef) {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const desktopQuery = window.matchMedia('(min-width: 768px)');
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let effect = null;
    let idleHandle = null;
    let idleMode = null;
    let generation = 0;

    const cancelIdle = () => {
      if (idleHandle === null) return;
      if (idleMode === 'idle') window.cancelIdleCallback(idleHandle);
      else window.clearTimeout(idleHandle);
      idleHandle = null;
      idleMode = null;
    };

    const destroy = () => {
      generation += 1;
      cancelIdle();
      effect?.destroy();
      effect = null;
      container.dataset.vantaState = 'fallback';
    };

    const initialize = async () => {
      idleHandle = null;
      idleMode = null;
      const currentGeneration = generation;

      if (!desktopQuery.matches || reducedMotionQuery.matches || !canCreateWebGlContext()) {
        container.dataset.vantaState = 'fallback';
        return;
      }

      container.dataset.vantaState = 'loading';

      try {
        const [threeModule, birdsModule] = await Promise.all([
          import('three'),
          import('vanta/dist/vanta.birds.min.js'),
        ]);

        if (
          currentGeneration !== generation
          || !desktopQuery.matches
          || reducedMotionQuery.matches
          || effect
        ) return;

        const Birds = window.VANTA?.BIRDS || birdsModule.default || birdsModule;
        const THREE = threeModule.default || threeModule;
        if (typeof Birds !== 'function') {
          throw new TypeError('Vanta Birds factory is unavailable');
        }
        effect = Birds({
          el: container,
          THREE,
          mouseControls: true,
          touchControls: false,
          gyroControls: false,
          minHeight: 200,
          minWidth: 200,
          scale: 1,
          scaleMobile: 1,
          backgroundColor: 0xf5f6f2,
          color1: 0x101828,
          color2: 0x3155d9,
          colorMode: 'variance',
          birdSize: 0.65,
          wingSpan: 18,
          speedLimit: 1.4,
          separation: 58,
          alignment: 46,
          cohesion: 34,
          quantity: 2,
        });
        container.dataset.vantaState = 'active';
      } catch (error) {
        container.dataset.vantaState = 'fallback';
        console.warn('Le fond Vanta Birds reste en mode statique.', error);
      }
    };

    const schedule = () => {
      destroy();
      if (!desktopQuery.matches || reducedMotionQuery.matches) return;

      if ('requestIdleCallback' in window) {
        idleMode = 'idle';
        idleHandle = window.requestIdleCallback(initialize, { timeout: 1400 });
      } else {
        idleMode = 'timeout';
        idleHandle = window.setTimeout(initialize, 220);
      }
    };

    desktopQuery.addEventListener('change', schedule);
    reducedMotionQuery.addEventListener('change', schedule);
    schedule();

    return () => {
      desktopQuery.removeEventListener('change', schedule);
      reducedMotionQuery.removeEventListener('change', schedule);
      destroy();
      delete container.dataset.vantaState;
    };
  }, [containerRef]);
}

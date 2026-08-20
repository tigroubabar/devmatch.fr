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

export function useVantaClouds(containerRef) {
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
        const [threeModule, cloudsModule] = await Promise.all([
          import('three'),
          import('vanta/dist/vanta.clouds.min.js'),
        ]);

        if (
          currentGeneration !== generation
          || !desktopQuery.matches
          || reducedMotionQuery.matches
          || effect
        ) return;

        const Clouds = window.VANTA?.CLOUDS || cloudsModule.default || cloudsModule;
        const THREE = threeModule.default || threeModule;
        if (typeof Clouds !== 'function') {
          throw new TypeError('Vanta Clouds factory is unavailable');
        }

        effect = Clouds({
          el: container,
          THREE,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200,
          minWidth: 200,
          skyColor: 0x010101,
          cloudColor: 0xa0a1a4,
          cloudShadowColor: 0x6f7274,
          speed: 0.90,
        });
        container.dataset.vantaState = 'active';
      } catch (error) {
        container.dataset.vantaState = 'fallback';
        console.warn('Le fond Vanta Clouds reste en mode statique.', error);
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

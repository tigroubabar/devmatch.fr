// React Bits JS-CSS source variant, adapted to auto-disable on coarse pointers and reduced motion.
// Provenance: https://github.com/DavidHDev/react-bits/tree/main/src/content/Animations/Magnet
import { useState, useEffect, useRef } from 'react';

const Magnet = ({
  children,
  padding = 100,
  disabled = false,
  magnetStrength = 2,
  activeTransition = 'transform 0.3s ease-out',
  inactiveTransition = 'transform 0.5s ease-in-out',
  wrapperClassName = '',
  innerClassName = '',
  ...props
}) => {
  const [isActive, setIsActive] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [environmentDisabled, setEnvironmentDisabled] = useState(true);
  const magnetRef = useRef(null);
  const isDisabled = disabled || environmentDisabled;

  useEffect(() => {
    const coarseQuery = window.matchMedia('(pointer: coarse)');
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setEnvironmentDisabled(coarseQuery.matches || motionQuery.matches);
    update();
    coarseQuery.addEventListener('change', update);
    motionQuery.addEventListener('change', update);
    return () => {
      coarseQuery.removeEventListener('change', update);
      motionQuery.removeEventListener('change', update);
    };
  }, []);

  useEffect(() => {
    if (isDisabled) {
      setIsActive(false);
      setPosition({ x: 0, y: 0 });
      return undefined;
    }

    const handleMouseMove = (event) => {
      if (!magnetRef.current) return;
      const { left, top, width, height } = magnetRef.current.getBoundingClientRect();
      const centerX = left + width / 2;
      const centerY = top + height / 2;
      const distX = Math.abs(centerX - event.clientX);
      const distY = Math.abs(centerY - event.clientY);

      if (distX < width / 2 + padding && distY < height / 2 + padding) {
        setIsActive(true);
        setPosition({
          x: (event.clientX - centerX) / magnetStrength,
          y: (event.clientY - centerY) / magnetStrength,
        });
      } else {
        setIsActive(false);
        setPosition({ x: 0, y: 0 });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [padding, isDisabled, magnetStrength]);

  const transitionStyle = isActive ? activeTransition : inactiveTransition;

  return (
    <div
      ref={magnetRef}
      className={wrapperClassName}
      style={{ position: 'relative', display: 'inline-block' }}
      {...props}
    >
      <div
        className={innerClassName}
        style={{
          transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
          transition: transitionStyle,
          willChange: isDisabled ? 'auto' : 'transform',
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default Magnet;

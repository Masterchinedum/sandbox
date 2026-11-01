import { createContext, useContext, useId } from 'react';

// Each layer owns its material definitions so multiple Oris can share an SVG, and
// either layer can be rendered independently by the conversation compositor.
const MaterialContext = createContext('ori');
export const useOriMaterial = () => {
  const prefix = useContext(MaterialContext);
  return (name: string) => `url(#${prefix}-${name})`;
};

export const EDGE = {
  stroke: '#202b3c',
  strokeWidth: 2.4,
  strokeLinejoin: 'round',
  strokeLinecap: 'round',
  vectorEffect: 'non-scaling-stroke',
} as const;

export const ETCH = { ...EDGE, strokeWidth: 1.25, stroke: '#566275' } as const;

export const OriMaterials: React.FC<React.PropsWithChildren> = ({ children }) => {
  const prefix = `ori-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const id = (name: string) => `${prefix}-${name}`;
  return (
    <MaterialContext.Provider value={prefix}>
      <defs>
        <radialGradient id={id('ceramic')} cx="33%" cy="22%" r="82%" fx="29%" fy="19%">
          <stop offset="0" stopColor="#fff7df" />
          <stop offset="0.38" stopColor="#dddccb" />
          <stop offset="0.68" stopColor="#a6b4b5" />
          <stop offset="0.88" stopColor="#687d8a" />
          <stop offset="1" stopColor="#3d5266" />
        </radialGradient>
        <linearGradient id={id('edge')} x1="0" y1="0" x2="0.9" y2="1">
          <stop stopColor="#dbe9e7" />
          <stop offset="0.4" stopColor="#879b9e" />
          <stop offset="1" stopColor="#33475a" />
        </linearGradient>
        <linearGradient id={id('barrel')} x1="0" y1="0" x2="1" y2="0.12">
          <stop stopColor="#5e7381" />
          <stop offset="0.2" stopColor="#c1cecb" />
          <stop offset="0.4" stopColor="#f2efdb" />
          <stop offset="0.62" stopColor="#d7d8c9" />
          <stop offset="0.88" stopColor="#85999c" />
          <stop offset="1" stopColor="#455b6e" />
        </linearGradient>
        <radialGradient id={id('metal')} cx="30%" cy="20%" r="80%">
          <stop stopColor="#8dabb4" />
          <stop offset="0.45" stopColor="#455d71" />
          <stop offset="0.8" stopColor="#24384b" />
          <stop offset="1" stopColor="#152538" />
        </radialGradient>
        <linearGradient id={id('rubber')} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#354957" />
          <stop offset="0.5" stopColor="#1b2c3b" />
          <stop offset="1" stopColor="#0c1928" />
        </linearGradient>
        <radialGradient id={id('glass')} cx="35%" cy="0%" r="100%">
          <stop stopColor="#526879" />
          <stop offset="0.32" stopColor="#263c4c" />
          <stop offset="0.65" stopColor="#101e2b" />
          <stop offset="1" stopColor="#050d17" />
        </radialGradient>
        <linearGradient id={id('reflection')} x1="0" y1="0" x2="0.45" y2="1">
          <stop stopColor="#e2f5ff" stopOpacity="0.55" />
          <stop offset="0.42" stopColor="#adcbdc" stopOpacity="0.14" />
          <stop offset="1" stopColor="#a1c4db" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={id('copper')} x1="0" y1="0" x2="0.8" y2="1">
          <stop stopColor="#ffe1a6" />
          <stop offset="0.3" stopColor="#e6a05e" />
          <stop offset="0.65" stopColor="#a85c35" />
          <stop offset="1" stopColor="#613e33" />
        </linearGradient>
        <radialGradient id={id('light')} cx="40%" cy="35%" r="70%">
          <stop stopColor="#fff6c9" />
          <stop offset="0.4" stopColor="#ffd68b" />
          <stop offset="0.8" stopColor="#ffa143" />
          <stop offset="1" stopColor="#e96420" />
        </radialGradient>
        <radialGradient id={id('bounce')} cx="50%" cy="100%" r="80%">
          <stop stopColor="#ffbb78" stopOpacity="0.4" />
          <stop offset="1" stopColor="#ffbb78" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={id('halo')}>
          <stop stopColor="#ff9e49" stopOpacity="0.5" />
          <stop offset="0.45" stopColor="#ff8527" stopOpacity="0.15" />
          <stop offset="1" stopColor="#ff8527" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={id('mug')} x1="0" y1="0" x2="1" y2="0">
          <stop stopColor="#416e73" />
          <stop offset="0.3" stopColor="#8bb1a8" />
          <stop offset="0.55" stopColor="#67978f" />
          <stop offset="1" stopColor="#294a54" />
        </linearGradient>
        <filter id={id('glow')} x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="3.5" />
        </filter>
        <filter id={id('soft')} x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
      </defs>
      {children}
    </MaterialContext.Provider>
  );
};

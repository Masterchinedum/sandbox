// Face pieces shared by the drawn robots' heads.

import type { Point } from './geometry';
import { DETAIL_INK, INK, NIGHT } from './palette';

// A dark glass visor with a glossy streak.
export const Visor: React.FC<{ centre: Point; width: number; height: number; radius: number }> = ({
  centre,
  width,
  height,
  radius,
}) => {
  const left = centre.x - width / 2;
  const top = centre.y - height / 2;
  return (
    <g>
      <rect x={left} y={top} width={width} height={height} rx={radius} fill={NIGHT.visor} />
      <rect
        x={left}
        y={top}
        width={width}
        height={height}
        rx={radius}
        fill="url(#c2d-visor-gloss)"
      />
      <path
        d={`M ${left + width * 0.12} ${top + height * 0.2} L ${left + width * 0.3} ${top + height * 0.2} L ${left + width * 0.2} ${top + height * 0.5} L ${left + width * 0.06} ${top + height * 0.5} Z`}
        fill="#FFFFFF"
        opacity={0.1}
      />
      <rect x={left} y={top} width={width} height={height} rx={radius} fill="none" {...INK} />
    </g>
  );
};

// A round port on the side of a head, ringed with the robot's colour.
export const Ear: React.FC<{ centre: Point; radius: number; squash: number; color: string }> = ({
  centre,
  radius,
  squash,
  color,
}) => {
  return (
    <g transform={`translate(${centre.x} ${centre.y}) scale(${squash} 1)`}>
      <circle r={radius} fill={NIGHT.shellShade} {...INK} />
      <circle r={radius * 0.62} fill={NIGHT.joint} {...DETAIL_INK} />
      <circle r={radius * 0.3} fill={color} opacity={0.9} />
    </g>
  );
};

export function averageX(corners: Point[]): number {
  return corners.reduce((sum, corner) => sum + corner.x, 0) / corners.length;
}

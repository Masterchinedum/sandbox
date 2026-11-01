// The pieces every drawn robot is built from: shell panels with their cel shading, boxes seen
// three-quarters on, limbs between joints, hands, boots, and glowing eyes that can blink and
// show a mood.
//
// Lighting, the same for every piece: the lamp on the table warms the lower front of each
// panel, and the moonlight behind the robots leaves a cool rim along the top.

import type { Mood } from '../types';
import { capsulePath, clamp, point, type Point, roundedPolygonPath } from './geometry';
import { DETAIL_INK, INK, NIGHT } from './palette';

export const PartDefs: React.FC = () => {
  return (
    <>
      <linearGradient id="c2d-warm-below" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0.3" stopColor={NIGHT.shellWarm} stopOpacity={0} />
        <stop offset="1" stopColor={NIGHT.shellWarm} stopOpacity={0.62} />
      </linearGradient>
      <linearGradient id="c2d-rim-above" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={NIGHT.rim} stopOpacity={0.95} />
        <stop offset="0.07" stopColor={NIGHT.rim} stopOpacity={0.35} />
        <stop offset="0.16" stopColor={NIGHT.rim} stopOpacity={0} />
      </linearGradient>
      <linearGradient id="c2d-shade-depth" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={NIGHT.shellDeep} stopOpacity={0} />
        <stop offset="1" stopColor={NIGHT.shellDeep} stopOpacity={0.55} />
      </linearGradient>
      <linearGradient id="c2d-visor-gloss" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#FFFFFF" stopOpacity={0.22} />
        <stop offset="0.45" stopColor="#FFFFFF" stopOpacity={0.04} />
        <stop offset="1" stopColor="#FFFFFF" stopOpacity={0} />
      </linearGradient>
      <filter id="c2d-glow" x="-150%" y="-150%" width="400%" height="400%">
        <feGaussianBlur stdDeviation="7" />
      </filter>
      <filter id="c2d-glow-wide" x="-200%" y="-200%" width="500%" height="500%">
        <feGaussianBlur stdDeviation="16" />
      </filter>
      <filter id="c2d-soft" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="6" />
      </filter>
    </>
  );
};

// ---- Panels ---------------------------------------------------------------------------------

type PanelProps = {
  d: string;
  // A lit panel faces us and the lamp; a shaded one is the side turned away.
  tone: 'lit' | 'shade';
  fill?: string;
  noInk?: boolean;
};

// One piece of shell: its colour, the lamp's warmth from below (or the depth of a shaded side),
// the moonlit rim along its top, and the ink outline.
export const Panel: React.FC<PanelProps> = ({ d, tone, fill, noInk = false }) => {
  const isLit = tone === 'lit';
  let baseColor: string = NIGHT.shellShade;
  let overlay = 'url(#c2d-shade-depth)';
  if (isLit) {
    baseColor = NIGHT.shell;
    overlay = 'url(#c2d-warm-below)';
  }
  return (
    <g>
      <path d={d} fill={fill ?? baseColor} />
      <path d={d} fill={overlay} />
      <path d={d} fill="url(#c2d-rim-above)" />
      {noInk ? null : <path d={d} fill="none" {...INK} />}
    </g>
  );
};

// ---- Boxes seen three-quarters on ---------------------------------------------------------

export type BoxShape = {
  centreX: number;
  top: number;
  bottom: number;
  topWidth: number;
  bottomWidth: number;
  depth: number;
  // -1 turned to screen left, 0 facing us, 1 turned to screen right.
  yaw: number;
};

export type BoxFaces = {
  front: Point[];
  side: Point[];
  frontCentreX: number;
  frontTopWidth: number;
};

// A box turned by `yaw`: its front face narrows and slides towards the way it faces, and its
// side shows on the other side, a little shorter at the far edge, as perspective makes it.
export function boxFaces(shape: BoxShape): BoxFaces {
  const turn = Math.abs(shape.yaw);
  const direction = shape.yaw >= 0 ? 1 : -1;
  const sideWidth = shape.depth * turn * 0.6;
  const frontTop = shape.topWidth * (1 - 0.3 * turn);
  const frontBottom = shape.bottomWidth * (1 - 0.3 * turn);
  const halfTop = (frontTop + sideWidth) / 2;
  const halfBottom = (frontBottom + sideWidth) / 2;
  const { centreX, top, bottom } = shape;
  // Perspective: the side's far edge is a little shorter than its near edge.
  const farInset = sideWidth * 0.1;

  if (direction > 0) {
    const frontTopLeft = centreX - halfTop + sideWidth;
    const frontBottomLeft = centreX - halfBottom + sideWidth;
    return {
      front: [
        point(frontTopLeft, top),
        point(centreX + halfTop, top),
        point(centreX + halfBottom, bottom),
        point(frontBottomLeft, bottom),
      ],
      side: [
        point(centreX - halfTop, top + farInset),
        point(frontTopLeft, top),
        point(frontBottomLeft, bottom),
        point(centreX - halfBottom, bottom - farInset * 0.5),
      ],
      frontCentreX: centreX + sideWidth / 2,
      frontTopWidth: frontTop,
    };
  }
  const frontTopRight = centreX + halfTop - sideWidth;
  const frontBottomRight = centreX + halfBottom - sideWidth;
  return {
    front: [
      point(centreX - halfTop, top),
      point(frontTopRight, top),
      point(frontBottomRight, bottom),
      point(centreX - halfBottom, bottom),
    ],
    side: [
      point(frontTopRight, top),
      point(centreX + halfTop, top + farInset),
      point(centreX + halfBottom, bottom - farInset * 0.5),
      point(frontBottomRight, bottom),
    ],
    frontCentreX: centreX - sideWidth / 2,
    frontTopWidth: frontTop,
  };
}

type ShellBoxProps = {
  shape: BoxShape;
  radius: number;
};

export const ShellBox: React.FC<ShellBoxProps> = ({ shape, radius }) => {
  const faces = boxFaces(shape);
  const hasSide = Math.abs(shape.yaw) > 0.02;
  return (
    <g>
      {hasSide ? <Panel d={roundedPolygonPath(faces.side, radius * 0.7)} tone="shade" /> : null}
      <Panel d={roundedPolygonPath(faces.front, radius)} tone="lit" />
    </g>
  );
};

// ---- Limbs and joints -----------------------------------------------------------------------

type LimbProps = {
  from: Point;
  to: Point;
  fromWidth: number;
  toWidth: number;
  // Which side the cel shadow runs down: 1 or -1, across the limb.
  shadeSide?: 1 | -1;
  // The far arm or leg sits in shadow.
  isFar?: boolean;
};

export const Limb: React.FC<LimbProps> = ({
  from,
  to,
  fromWidth,
  toWidth,
  shadeSide = 1,
  isFar = false,
}) => {
  const outline = capsulePath(from, to, fromWidth, toWidth);
  // The shadow is a narrower tube pushed to one side of the limb.
  const length = Math.max(Math.hypot(to.x - from.x, to.y - from.y), 0.001);
  const acrossX = (-(to.y - from.y) / length) * shadeSide;
  const acrossY = ((to.x - from.x) / length) * shadeSide;
  const push = fromWidth * 0.22;
  const shadeFrom = point(from.x + acrossX * push, from.y + acrossY * push);
  const shadeTo = point(to.x + acrossX * push * 0.9, to.y + acrossY * push * 0.9);
  const shadow = capsulePath(shadeFrom, shadeTo, fromWidth * 0.55, toWidth * 0.55);
  let baseColor: string = NIGHT.shell;
  if (isFar) {
    baseColor = NIGHT.shellShade;
  }
  return (
    <g>
      <path d={outline} fill={baseColor} />
      <path d={shadow} fill={isFar ? NIGHT.shellDeep : NIGHT.shellShade} opacity={0.85} />
      <path d={outline} fill="url(#c2d-rim-above)" opacity={0.6} />
      <path d={outline} fill="none" {...INK} />
    </g>
  );
};

// A ball joint: a dark socket, a lighter ball, a bolt in the middle.
export const Joint: React.FC<{ at: Point; radius: number }> = ({ at, radius }) => {
  return (
    <g>
      <circle cx={at.x} cy={at.y} r={radius} fill={NIGHT.joint} {...INK} />
      <circle
        cx={at.x - radius * 0.18}
        cy={at.y - radius * 0.2}
        r={radius * 0.62}
        fill={NIGHT.jointLight}
      />
      <circle cx={at.x} cy={at.y} r={radius * 0.22} fill={NIGHT.shellShade} {...DETAIL_INK} />
    </g>
  );
};

// A flexible ribbed section (a neck, a waist): rings stacked between two points.
export const Ribbed: React.FC<{
  centreX: number;
  top: number;
  bottom: number;
  width: number;
}> = ({ centreX, top, bottom, width }) => {
  const ringCount = 3;
  const ringHeight = (bottom - top) / ringCount;
  const rings: React.ReactNode[] = [];
  for (let index = 0; index < ringCount; index++) {
    const ringTop = top + index * ringHeight;
    rings.push(
      <rect
        key={index}
        x={centreX - width / 2}
        y={ringTop}
        width={width}
        height={ringHeight + 2}
        rx={ringHeight / 2}
        fill={index % 2 === 0 ? NIGHT.joint : NIGHT.jointLight}
        {...DETAIL_INK}
      />,
    );
  }
  return <g>{rings}</g>;
};

// A bolt head on a panel.
export const Bolt: React.FC<{ at: Point; radius?: number }> = ({ at, radius = 4 }) => {
  return (
    <g>
      <circle cx={at.x} cy={at.y} r={radius} fill={NIGHT.shellShade} {...DETAIL_INK} />
      <line
        x1={at.x - radius * 0.55}
        y1={at.y}
        x2={at.x + radius * 0.55}
        y2={at.y}
        {...DETAIL_INK}
        strokeWidth={1.2}
      />
    </g>
  );
};

// A seam line across a panel.
export const Seam: React.FC<{ d: string }> = ({ d }) => {
  return <path d={d} fill="none" {...DETAIL_INK} opacity={0.75} />;
};

// ---- Hands and boots ------------------------------------------------------------------------

type HandProps = {
  wrist: Point;
  // Degrees: the direction the hand points (along the forearm, or wherever it's held).
  angle: number;
  // 0 a relaxed mitten resting flat, 1 open with the fingers spread, talking.
  open: number;
  // Which side the thumb is on: 1 or -1.
  thumbSide: 1 | -1;
  size?: number;
  isFar?: boolean;
};

// A robot hand: a palm, three thick fingers and a thumb, all in one rotated drawing so it
// follows the forearm.
export const Hand: React.FC<HandProps> = ({
  wrist,
  angle,
  open,
  thumbSide,
  size = 1,
  isFar = false,
}) => {
  const spread = open * 16;
  const fingerLength = 22 + open * 6;
  const thumbAngle = (28 + open * 34) * thumbSide;
  const fill = isFar ? NIGHT.shellShade : NIGHT.shell;
  return (
    <g transform={`translate(${wrist.x} ${wrist.y}) rotate(${angle}) scale(${size})`}>
      {[-1, 0, 1].map((finger) => {
        const fingerAngle = finger * spread;
        const base = point(30, finger * 9);
        const radians = (fingerAngle * Math.PI) / 180;
        const tip = point(
          base.x + Math.cos(radians) * fingerLength,
          base.y + Math.sin(radians) * fingerLength,
        );
        return (
          <g key={finger}>
            <path d={capsulePath(base, tip, 11, 10)} fill={fill} {...INK} />
          </g>
        );
      })}
      <g transform={`rotate(${thumbAngle} 10 ${thumbSide * 10})`}>
        <path
          d={capsulePath(point(10, thumbSide * 10), point(28, thumbSide * 18), 12, 10)}
          fill={fill}
          {...INK}
        />
      </g>
      <path
        d={roundedPolygonPath([point(-4, -16), point(34, -15), point(36, 15), point(-4, 16)], 9)}
        fill={fill}
        {...INK}
      />
      <path d="M 4 -9 L 4 9" fill="none" {...DETAIL_INK} opacity={0.6} />
      <rect
        x={6}
        y={4 * -thumbSide - 6}
        width={22}
        height={10}
        rx={5}
        fill={isFar ? NIGHT.shellDeep : NIGHT.shellShade}
        opacity={0.7}
      />
    </g>
  );
};

type BootProps = {
  ankle: Point;
  // 1 toes to screen right, -1 to screen left, 0 towards us.
  facing: number;
  size?: number;
  isFar?: boolean;
};

export const Boot: React.FC<BootProps> = ({ ankle, facing, size = 1, isFar = false }) => {
  const fill = isFar ? NIGHT.shellShade : NIGHT.shell;
  if (facing === 0) {
    // Seen from the front: a rounded toe cap over a dark sole.
    return (
      <g transform={`translate(${ankle.x} ${ankle.y}) scale(${size})`}>
        <rect x={-27} y={22} width={54} height={12} rx={6} fill={NIGHT.joint} {...INK} />
        <path
          d={roundedPolygonPath([point(-20, -6), point(20, -6), point(27, 26), point(-27, 26)], 12)}
          fill={fill}
          {...INK}
        />
        <path d="M -14 12 Q 0 6 14 12" fill="none" {...DETAIL_INK} />
      </g>
    );
  }
  const direction = facing > 0 ? 1 : -1;
  return (
    <g transform={`translate(${ankle.x} ${ankle.y}) scale(${direction * size} ${size})`}>
      <path
        d={roundedPolygonPath([point(-18, 22), point(58, 22), point(62, 33), point(-20, 33)], 5)}
        fill={NIGHT.joint}
        {...INK}
      />
      <path
        d={roundedPolygonPath(
          [
            point(-18, -8),
            point(14, -8),
            point(26, 6),
            point(58, 10),
            point(60, 24),
            point(-18, 24),
          ],
          10,
        )}
        fill={fill}
        {...INK}
      />
      <path d="M 18 4 L 22 22" fill="none" {...DETAIL_INK} opacity={0.7} />
    </g>
  );
};

// ---- Eyes -----------------------------------------------------------------------------------

type EyeProps = {
  // A unique name for this eye's clip shape.
  id: string;
  centre: Point;
  width: number;
  height: number;
  color: string;
  lightColor: string;
  blink: number;
  mood: Mood | null;
  // Which side of the face the eye is on, for a sad brow: -1 left, 1 right.
  side: -1 | 1;
};

// How much of the eye the lid hides for each mood, and how far it tips (a sad slant).
const MOOD_LID: Record<Mood, { cover: number; slant: number }> = {
  amused: { cover: 0, slant: 0 },
  surprised: { cover: 0, slant: 0 },
  sad: { cover: 0.32, slant: 0.32 },
  deadpan: { cover: 0.5, slant: 0 },
  thoughtful: { cover: 0.28, slant: -0.06 },
  warm: { cover: 0, slant: 0 },
  curious: { cover: 0.06, slant: 0 },
};

// A glowing eye with an anime highlight. Amused and warm eyes close into happy arcs; the other
// moods lower or tip the lid; a blink closes it.
export const Eye: React.FC<EyeProps> = ({
  id,
  centre,
  width,
  height,
  color,
  lightColor,
  blink,
  mood,
  side,
}) => {
  const isHappy = mood === 'amused' || mood === 'warm';
  if (isHappy && blink < 0.5) {
    return (
      <HappyEye centre={centre} width={width} height={height} color={color} light={lightColor} />
    );
  }
  let eyeWidth = width;
  let eyeHeight = height;
  if (mood === 'surprised') {
    eyeWidth = width * 1.12;
    eyeHeight = height * 1.18;
  }
  const lid = mood ? MOOD_LID[mood] : { cover: 0, slant: 0 };
  const cover = clamp(lid.cover + blink * (1 - lid.cover), 0, 1);
  const left = centre.x - eyeWidth / 2;
  const top = centre.y - eyeHeight / 2;
  const lidY = top + eyeHeight * cover;
  // A sad lid is higher on the inner side (towards the nose), lower on the outer.
  const slantPixels = lid.slant * eyeHeight * (1 - blink);
  const innerY = lidY - slantPixels;
  const outerY = lidY + slantPixels;
  let leftY = outerY;
  let rightY = innerY;
  if (side > 0) {
    leftY = innerY;
    rightY = outerY;
  }
  const open = cover < 0.92;
  return (
    <g>
      <clipPath id={id}>
        <polygon
          points={`${left - 4},${leftY} ${left + eyeWidth + 4},${rightY} ${left + eyeWidth + 4},${top + eyeHeight + 4} ${left - 4},${top + eyeHeight + 4}`}
        />
      </clipPath>
      <rect
        x={left - 5}
        y={top - 5}
        width={eyeWidth + 10}
        height={eyeHeight + 10}
        rx={eyeWidth / 2}
        fill={color}
        opacity={0.75 * (1 - blink * 0.7)}
        filter="url(#c2d-glow)"
      />
      {open ? (
        <g clipPath={`url(#${id})`}>
          <rect
            x={left}
            y={top}
            width={eyeWidth}
            height={eyeHeight}
            rx={Math.min(eyeWidth, eyeHeight) / 2}
            fill={color}
          />
          <ellipse
            cx={centre.x}
            cy={centre.y + eyeHeight * 0.12}
            rx={eyeWidth * 0.32}
            ry={eyeHeight * 0.3}
            fill={lightColor}
            opacity={0.85}
          />
          <ellipse
            cx={left + eyeWidth * 0.3}
            cy={top + eyeHeight * 0.3}
            rx={eyeWidth * 0.16}
            ry={eyeHeight * 0.15}
            fill="#FFFFFF"
          />
          <circle
            cx={left + eyeWidth * 0.66}
            cy={top + eyeHeight * 0.62}
            r={Math.min(eyeWidth, eyeHeight) * 0.07}
            fill="#FFFFFF"
            opacity={0.9}
          />
        </g>
      ) : (
        <line
          x1={left + 2}
          y1={centre.y + eyeHeight * 0.2}
          x2={left + eyeWidth - 2}
          y2={centre.y + eyeHeight * 0.2}
          stroke={color}
          strokeWidth={Math.max(3, eyeHeight * 0.14)}
          strokeLinecap="round"
        />
      )}
    </g>
  );
};

const HappyEye: React.FC<{
  centre: Point;
  width: number;
  height: number;
  color: string;
  light: string;
}> = ({ centre, width, height, color, light }) => {
  const arc =
    `M ${centre.x - width / 2} ${centre.y + height * 0.12} ` +
    `Q ${centre.x} ${centre.y - height * 0.55} ${centre.x + width / 2} ${centre.y + height * 0.12}`;
  const thickness = Math.max(4, height * 0.24);
  return (
    <g>
      <path
        d={arc}
        fill="none"
        stroke={color}
        strokeWidth={thickness * 2}
        strokeLinecap="round"
        opacity={0.6}
        filter="url(#c2d-glow)"
      />
      <path d={arc} fill="none" stroke={color} strokeWidth={thickness} strokeLinecap="round" />
      <path
        d={arc}
        fill="none"
        stroke={light}
        strokeWidth={thickness * 0.35}
        strokeLinecap="round"
      />
    </g>
  );
};

// A soft coloured glow, for lights that should bloom (a badge, a mouth, an antenna tip).
export const Glow: React.FC<{ at: Point; radius: number; color: string; strength?: number }> = ({
  at,
  radius,
  color,
  strength = 0.8,
}) => {
  return (
    <circle
      cx={at.x}
      cy={at.y}
      r={radius}
      fill={color}
      opacity={strength}
      filter="url(#c2d-glow)"
    />
  );
};

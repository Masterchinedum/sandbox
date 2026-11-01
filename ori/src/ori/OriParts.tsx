import { angleBetween, distance, lerpPoint, type Point } from '../shared/geometry';
import { type ArmPose } from '../shared/limbs';
import { EDGE, ETCH, useOriMaterial } from './OriMaterials';

export const Fastener: React.FC<{ x: number; y: number; r?: number }> = ({ x, y, r = 3 }) => {
  const m = useOriMaterial();
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle cy={1} r={r + 1} fill="#1a2b38" opacity={0.55} />
      <circle r={r} fill={m('metal')} stroke="#a8bab9" strokeWidth={0.7} />
      <path d={`M ${-r * 0.4} 0 H ${r * 0.4}`} stroke="#142333" strokeWidth={1.2} />
    </g>
  );
};

export const Socket: React.FC<{ at: Point; radius: number; accent?: boolean }> = ({
  at,
  radius,
  accent = false,
}) => {
  const m = useOriMaterial();
  return (
    <g transform={`translate(${at.x} ${at.y})`}>
      <circle cy={2} r={radius + 2} fill="#111e2d" {...EDGE} />
      <circle r={radius} fill={m('metal')} stroke="#a1b5bd" strokeWidth={1} />
      <circle r={radius * 0.73} fill="none" stroke="#172b3c" strokeWidth={3} />
      <path d={`M ${-radius * 0.72} ${-radius * 0.2} A ${radius * 0.75} ${radius * 0.75} 0 0 1 ${radius * 0.3} ${-radius * 0.7}`} fill="none" stroke="#b4d1d4" strokeWidth={1.3} opacity={0.7} />
      <circle r={radius * 0.47} fill={m(accent ? 'copper' : 'edge')} stroke="#152638" strokeWidth={1.2} />
      <Fastener x={0} y={0} r={radius * 0.16} />
    </g>
  );
};

// Convex armour around an inset mechanical shaft. Top ellipses and lower lips
// expose thickness, while the narrow highlights describe the rounded section.
export const Segment: React.FC<{
  from: Point;
  to: Point;
  width: number;
  endWidth?: number;
  accent?: boolean;
}> = ({ from, to, width, endWidth = width * 0.72, accent = false }) => {
  const m = useOriMaterial();
  const length = distance(from, to);
  const a = width / 2;
  const b = endWidth / 2;
  const start = 8;
  const end = Math.max(start + 8, length - 9);
  const body = `M ${-a * 0.68} ${start} Q 0 ${start - 9} ${a * 0.7} ${start} C ${a * 1.15} ${start + 14} ${b + 4} ${end - 13} ${b} ${end} Q 0 ${end + 12} ${-b} ${end} C ${-b - 6} ${end - 16} ${-a * 1.1} ${start + 17} ${-a * 0.68} ${start} Z`;
  return (
    <g transform={`translate(${from.x} ${from.y}) rotate(${angleBetween(from, to) - 90})`}>
      <path d={`M 0 0 V ${length}`} stroke="#152535" strokeWidth={width * 0.58} strokeLinecap="round" />
      <path d={body} fill={m('barrel')} {...EDGE} />
      <path d={`M ${a * 0.55} ${start + 6} Q ${a * 0.6} ${length * 0.45} ${b * 0.7} ${end - 2} Q ${b * 0.18} ${end + 6} ${-b * 0.65} ${end - 1}`} fill="none" stroke="#405b6d" strokeWidth={2} opacity={0.6} />
      <path d={`M ${-a * 0.5} ${start + 8} Q ${-a * 0.64} ${length * 0.4} ${-b * 0.5} ${end - 12}`} fill="none" stroke="#fff9e3" strokeWidth={2.5} opacity={0.65} strokeLinecap="round" />
      <path d={`M ${-a * 0.66} ${start + 3} Q 0 ${start - 4} ${a * 0.68} ${start + 3}`} fill="none" stroke="#edf6ec" strokeWidth={1.5} />
      {accent && <path d={`M ${-a * 0.85} ${start + 18} Q 0 ${start + 11} ${a * 0.85} ${start + 18} L ${a * 0.82} ${start + 25} Q 0 ${start + 18} ${-a * 0.84} ${start + 25} Z`} fill={m('copper')} opacity={0.95} />}
      <Fastener x={b * 0.25} y={end - 8} r={2.3} />
    </g>
  );
};

export const Shoulder: React.FC<{ at: Point; side: number }> = ({ at, side }) => {
  const m = useOriMaterial();
  return (
    <g transform={`translate(${at.x} ${at.y}) rotate(${side * -16})`}>
      <ellipse cy={8} rx={30} ry={27} fill={m('rubber')} {...EDGE} />
      <path d="M -31 6 C -37 -21 -20 -38 1 -38 C 28 -38 39 -15 31 12 Q 1 22 -31 6 Z" fill={m('ceramic')} {...EDGE} />
      <path d="M -28 7 Q 2 23 30 12 L 29 17 Q 1 28 -27 13 Z" fill={m('edge')} />
      <path d="M -26 -11 C -26 -27 -11 -33 4 -32" fill="none" stroke="#fff8df" strokeWidth={2.2} strokeLinecap="round" />
      <path d="M 16 -27 Q 32 -14 27 4" fill="none" {...ETCH} />
      <Fastener x={23} y={5} r={3} />
    </g>
  );
};

export const RobotHand: React.FC<{
  wrist: Point;
  angle: number;
  open: number;
  thumbSide: number;
}> = ({ wrist, angle, open, thumbSide }) => {
  const m = useOriMaterial();
  return (
    <g transform={`translate(${wrist.x} ${wrist.y}) rotate(${angle}) scale(0.92)`}>
      {[-1, 0, 1].map((finger) => {
        const length = finger === 0 ? 26 : 22;
        return (
          <g key={finger} transform={`translate(27 ${finger * 10}) rotate(${finger * open * 17})`}>
            <path d={`M 0 0 H ${length}`} fill="none" stroke="#162536" strokeWidth={12} strokeLinecap="round" />
            <path d={`M 0 -1 H ${length}`} fill="none" stroke="#c8d1c7" strokeWidth={8.5} strokeLinecap="round" />
            <path d={`M 0 -3 H ${length - 3}`} fill="none" stroke="#fff3d7" strokeWidth={1.7} strokeLinecap="round" />
            <path d="M 11 -5 V 4" stroke="#536a76" strokeWidth={1.6} />
          </g>
        );
      })}
      <g transform={`rotate(${thumbSide * (32 + open * 28)} 8 ${thumbSide * 11})`}>
        <path d={`M 8 ${thumbSide * 11} L 25 ${thumbSide * 18}`} stroke="#172a38" strokeWidth={14} strokeLinecap="round" />
        <path d={`M 8 ${thumbSide * 11} L 25 ${thumbSide * 18}`} stroke="#c1cdc5" strokeWidth={9} strokeLinecap="round" />
      </g>
      <path d="M 0 -14 Q 15 -21 30 -15 Q 39 -1 30 15 Q 12 21 0 14 Q -7 0 0 -14 Z" fill={m('ceramic')} {...EDGE} />
      <path d="M 7 -9 Q 19 -13 28 -8 L 29 7 Q 19 13 8 8 Z" fill={m('edge')} stroke="#667e85" strokeWidth={1} />
      <path d="M 11 -8 Q 20 -10 26 -7" fill="none" stroke="#e8efe0" strokeWidth={1.2} />
      <Socket at={{ x: 0, y: 0 }} radius={9} />
    </g>
  );
};

export const SculptedArm: React.FC<{ shoulder: Point; arm: ArmPose; open: number; side: number }> = ({ shoulder, arm, open, side }) => (
  <g>
    <Segment from={shoulder} to={arm.elbow} width={35} endWidth={29} />
    <Socket at={arm.elbow} radius={18} accent />
    <Segment from={lerpPoint(arm.elbow, arm.wrist, 0.12)} to={arm.wrist} width={46} endWidth={29} accent />
    <RobotHand wrist={arm.wrist} angle={arm.handAngle} open={open} thumbSide={side} />
    <Shoulder at={shoulder} side={side} />
  </g>
);

export const RobotBoot: React.FC<{ at: Point; side: number }> = ({ at, side }) => {
  const m = useOriMaterial();
  return (
    <g transform={`translate(${at.x} ${at.y}) rotate(${side * -5})`}>
      <path d="M -27 8 Q -37 13 -36 31 Q -7 45 38 34 Q 41 23 30 13 Z" fill={m('rubber')} {...EDGE} />
      <path d="M -22 -12 Q -3 -22 17 -10 L 21 4 Q 38 9 38 25 C 25 36 -18 35 -34 24 Q -32 8 -22 -12 Z" fill={m('ceramic')} {...EDGE} />
      <path d="M -23 2 Q -2 -3 18 4 L 27 12 Q -3 6 -28 14 Z" fill={m('copper')} stroke="#925e3d" strokeWidth={0.8} />
      <path d="M -29 22 Q -3 31 32 23" fill="none" stroke="#f7efd8" strokeWidth={1.6} opacity={0.8} />
      <path d="M -31 30 Q -1 40 35 30" fill="none" stroke="#657c85" strokeWidth={1.5} />
      {[-21, -8, 5, 18].map((x) => <path key={x} d={`M ${x} 34 v 5`} stroke="#0a1826" strokeWidth={3} />)}
      <Fastener x={-19} y={-2} r={2.6} />
    </g>
  );
};

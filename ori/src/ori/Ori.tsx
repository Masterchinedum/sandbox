// Ori is an observatory companion with ceramic armour, copper fittings and a
// warm optical face. The original pose and body/arms layer contract is intact.
import { useCurrentFrame } from 'remotion';
import { point, type Point } from '../shared/geometry';
import { type ArmPose, blendArm } from '../shared/limbs';
import type { RobotPose, RobotProps } from '../shared/pose';
import { OriHead } from './OriHead';
import { EDGE, ETCH, OriMaterials, useOriMaterial } from './OriMaterials';
import { Fastener, RobotBoot, SculptedArm, Segment, Socket } from './OriParts';

const LEFT_ARM: ArmPose = { elbow: point(-134, -159), wrist: point(-83, -111), handAngle: -10 };
const RIGHT_REST: ArmPose = { elbow: point(137, -157), wrist: point(86, -104), handAngle: 190 };
const RIGHT_TALK: ArmPose = { elbow: point(147, -175), wrist: point(151, -238), handAngle: -83 };

export const Ori: React.FC<RobotProps> = ({ pose, layer }) => {
  const frame = useCurrentFrame();
  return (
    <OriMaterials>
      {layer === 'body' ? <OriBody pose={pose} /> : <OriArms pose={pose} frame={frame} />}
    </OriMaterials>
  );
};

const OriBody: React.FC<{ pose: RobotPose }> = ({ pose }) => {
  const m = useOriMaterial();
  const lift = pose.breathing * 0.5;
  return (
    <g>
      <Stool />
      {[-1, 1].map((side) => {
        const knee = point(side * 53, 27);
        const ankle = point(side * 62, 140);
        return (
          <g key={side}>
            <Segment from={point(side * 35, -37)} to={knee} width={57} endWidth={46} />
            <Segment from={point(knee.x, knee.y + 8)} to={ankle} width={48} endWidth={32} />
            <Socket at={knee} radius={24} />
            <path
              d={`M ${knee.x - 12} ${knee.y + 37} Q ${knee.x - 10} ${knee.y + 59} ${ankle.x - 8} ${ankle.y - 16}`}
              fill="none"
              stroke="#344e60"
              strokeWidth={4}
              strokeLinecap="round"
            />
            <path
              d={`M ${knee.x - 11} ${knee.y + 38} Q ${knee.x - 9} ${knee.y + 59} ${ankle.x - 7} ${ankle.y - 17}`}
              fill="none"
              stroke="#b6c4bf"
              strokeWidth={1}
            />
            <RobotBoot at={ankle} side={side} />
          </g>
        );
      })}
      <path
        d="M -65 -52 Q 0 -77 65 -52 L 58 -17 Q 40 6 0 6 Q -43 5 -58 -16 Z"
        fill={m('metal')}
        {...EDGE}
      />
      <path
        d="M -62 -49 Q -43 -60 -13 -55 L -18 -15 Q -41 -8 -56 -20 Z"
        fill={m('ceramic')}
        {...EDGE}
      />
      <path d="M 13 -55 Q 43 -61 62 -49 L 56 -20 Q 41 -8 18 -15 Z" fill={m('ceramic')} {...EDGE} />
      <path d="M -10 -52 Q 0 -57 10 -52 L 8 -18 Q 0 -13 -8 -18 Z" fill={m('copper')} />
      <g transform={`rotate(${-pose.lean * 0.35} 0 -63)`}>
        <Bellows x={0} top={-105} width={79} rings={4} spacing={11} />
        <g transform={`translate(0 ${lift})`}>
          <Chest />
          <ellipse cy={-295} rx={47} ry={16} fill="#112333" opacity={0.65} />
          <ellipse cy={-300} rx={43} ry={15} fill={m('edge')} {...EDGE} />
          <ellipse cy={-303} rx={30} ry={9} fill={m('rubber')} />
          <Bellows x={0} top={-326} width={44} rings={3} spacing={9} />
          <path
            d="M -18 -318 Q -43 -323 -47 -300"
            fill="none"
            stroke="#152636"
            strokeWidth={8}
            strokeLinecap="round"
          />
          <path
            d="M -19 -320 Q -40 -324 -46 -302"
            fill="none"
            stroke="#a3a894"
            strokeWidth={2}
            strokeLinecap="round"
          />
          <OriHead neck={point(0, -327 + pose.breathing * 0.5)} pose={pose} />
        </g>
      </g>
    </g>
  );
};

const CHEST =
  'M -69 -293 C -42 -312 40 -312 70 -291 C 93 -274 99 -241 94 -211 L 79 -137 C 75 -107 48 -91 4 -89 C -43 -88 -73 -101 -79 -131 L -95 -213 C -101 -245 -92 -276 -69 -293 Z';

const Chest: React.FC = () => {
  const m = useOriMaterial();
  return (
    <g>
      <path d={CHEST} transform="translate(0 6)" fill={m('rubber')} {...EDGE} />
      <path d={CHEST} fill={m('ceramic')} {...EDGE} />
      <path
        d="M 62 -293 C 93 -240 76 -158 57 -126 Q 33 -103 -22 -101 Q 60 -88 78 -128 L 94 -210 Q 104 -266 62 -293 Z"
        fill={m('edge')}
        opacity={0.6}
      />
      <path
        d="M -79 -253 C -83 -274 -61 -291 -31 -296"
        fill="none"
        stroke="#fff8df"
        strokeWidth={3}
        strokeLinecap="round"
        opacity={0.8}
      />
      {/* A suspended chest yoke, rather than a rectangle drawn on the torso. */}
      <path
        d="M -78 -268 Q -43 -295 -5 -287 Q 42 -298 79 -267 L 74 -240 Q 37 -254 0 -251 Q -41 -251 -75 -236 Z"
        fill="#243e4c"
        opacity={0.38}
        transform="translate(0 5)"
      />
      <path
        d="M -78 -272 Q -44 -295 -5 -288 Q 39 -297 79 -272 L 72 -248 Q 36 -262 0 -260 Q -40 -261 -72 -246 Z"
        fill={m('edge')}
        {...EDGE}
      />
      <path
        d="M -72 -272 Q -37 -288 -5 -282 Q 37 -291 73 -271"
        fill="none"
        stroke="#eef0d9"
        strokeWidth={1.6}
        opacity={0.85}
      />
      <path
        d="M -13 -285 L -10 -263 Q 0 -261 10 -263 L 13 -286"
        fill={m('copper')}
        stroke="#705544"
        strokeWidth={1}
      />
      <Fastener x={-62} y={-261} />
      <Fastener x={63} y={-262} />
      {/* The recessed chest instrument has a thick copper bezel and a glass lens. */}
      <g transform="translate(7 -211)">
        <ellipse cy={6} rx={39} ry={35} fill="#1b3543" opacity={0.36} />
        <circle r={35} fill={m('edge')} {...EDGE} />
        <circle cy={-1} r={29} fill={m('copper')} stroke="#dbb783" strokeWidth={1} />
        <circle cy={-1} r={23} fill={m('rubber')} stroke="#253746" strokeWidth={2} />
        <circle cy={-1} r={19} fill={m('glass')} />
        <circle cy={-1} r={26} fill={m('halo')} />
        <circle cy={-1} r={11} fill={m('light')} />
        <circle cx={-3} cy={-5} r={3.5} fill="#fff7d9" />
        <path
          d="M -17 -6 A 18 18 0 0 1 7 -18"
          fill="none"
          stroke="#e0edf0"
          strokeWidth={1.5}
          opacity={0.65}
        />
        {[0, 90, 180, 270].map((angle) => (
          <path
            key={angle}
            d="M 0 -27 V -30"
            transform={`rotate(${angle})`}
            stroke="#5e4c40"
            strokeWidth={1.5}
          />
        ))}
      </g>
      <g transform="translate(-53 -208) rotate(-8)">
        <rect
          x={-12}
          y={-15}
          width={24}
          height={38}
          rx={6}
          fill={m('metal')}
          stroke="#81979c"
          strokeWidth={1}
        />
        {[0, 1, 2].map((row) => (
          <path
            key={row}
            d={`M -5 ${row * 8 - 6} H 5`}
            stroke={row === 0 ? '#ffc788' : '#a2bbb9'}
            strokeWidth={2}
            strokeLinecap="round"
            opacity={row === 0 ? 1 : 0.5}
          />
        ))}
      </g>
      <path
        d="M -64 -165 Q 1 -139 66 -165 L 61 -142 Q 0 -118 -59 -141 Z"
        fill={m('edge')}
        {...ETCH}
      />
      <path d="M -58 -159 Q 0 -138 60 -159" fill="none" stroke="#e5e8d2" strokeWidth={1.5} />
      <text
        x={5}
        y={-137}
        textAnchor="middle"
        fontFamily="monospace"
        fontSize={9}
        fontWeight={600}
        letterSpacing={3}
        fill="#2a414f"
      >
        ORI
      </text>
      <path d="M -47 -118 Q 0 -104 49 -119" fill="none" {...ETCH} />
      {[-25, -15, -5, 5, 15, 25].map((x) => (
        <path
          key={x}
          d={`M ${x} ${-119 + Math.abs(x) * -0.06} l 0 5`}
          stroke="#4c656f"
          strokeWidth={2.2}
          strokeLinecap="round"
        />
      ))}
      <Fastener x={-64} y={-136} />
      <Fastener x={65} y={-136} />
    </g>
  );
};

const Bellows: React.FC<{
  x: number;
  top: number;
  width: number;
  rings: number;
  spacing: number;
}> = ({ x, top, width, rings, spacing }) => {
  const m = useOriMaterial();
  return (
    <g transform={`translate(${x} ${top})`}>
      <rect
        x={-width * 0.39}
        y={0}
        width={width * 0.78}
        height={(rings - 1) * spacing + 9}
        fill={m('rubber')}
      />
      {Array.from({ length: rings }, (_, i) => (
        <g key={i} transform={`translate(0 ${i * spacing})`}>
          <path
            d={`M ${-width / 2} 0 Q 0 -10 ${width / 2} 0 V 6 Q 0 17 ${-width / 2} 6 Z`}
            fill={m('metal')}
            {...EDGE}
          />
          <path
            d={`M ${-width / 2 + 4} 1 Q -2 10 ${width / 2 - 4} 1`}
            fill="none"
            stroke="#91a7ae"
            strokeWidth={1.2}
            opacity={0.7}
          />
        </g>
      ))}
    </g>
  );
};

const OriArms: React.FC<{ pose: RobotPose; frame: number }> = ({ pose, frame }) => {
  const lift = pose.breathing * 0.5;
  // Use the shortest angular route from a resting hand to an upright palm.
  // The original 190 -> -83 interpolation took a distracting 273-degree spin.
  const right = blendArm({ ...RIGHT_REST, handAngle: -170 }, RIGHT_TALK, pose);
  return (
    <g transform={`rotate(${-pose.lean * 0.35} 0 -63)`}>
      <Mug at={point(-37, -116)} frame={frame} />
      <SculptedArm shoulder={point(-98, -265 + lift)} arm={LEFT_ARM} open={0} side={-1} />
      <SculptedArm shoulder={point(98, -265 + lift)} arm={right} open={pose.gesture} side={1} />
    </g>
  );
};

const Stool: React.FC = () => {
  const m = useOriMaterial();
  return (
    <g>
      {[-1, 1].map((side) => (
        <g key={side}>
          <path
            d={`M ${side * 45} 6 L ${side * 76} 172`}
            stroke="#152535"
            strokeWidth={13}
            strokeLinecap="round"
          />
          <path
            d={`M ${side * 45 - 1} 6 L ${side * 76 - 1} 172`}
            stroke="#657d81"
            strokeWidth={7}
            strokeLinecap="round"
          />
          <path
            d={`M ${side * 45 - 2} 9 L ${side * 76 - 2} 163`}
            stroke="#b7c1ac"
            strokeWidth={1.5}
            strokeLinecap="round"
          />
        </g>
      ))}
      <path d="M -65 113 Q 0 130 65 113" fill="none" stroke="#182a39" strokeWidth={9} />
      <path d="M -65 111 Q 0 128 65 111" fill="none" stroke="#7a8c88" strokeWidth={3} />
      <path d="M -73 -3 Q 0 -26 73 -3 V 8 Q 0 35 -73 8 Z" fill="#48372e" {...EDGE} />
      <ellipse cy={-3} rx={73} ry={20} fill="#9c7552" {...EDGE} />
      <path
        d="M -63 -5 Q -4 -21 61 -5 M -43 5 Q 1 -6 48 4"
        fill="none"
        stroke="#d0a77b"
        strokeWidth={1.4}
        opacity={0.6}
      />
      <path d="M -68 12 Q 0 31 68 12" stroke={m('copper')} strokeWidth={3} fill="none" />
    </g>
  );
};

const Mug: React.FC<{ at: Point; frame: number }> = ({ at, frame }) => {
  const m = useOriMaterial();
  return (
    <g transform={`translate(${at.x} ${at.y})`}>
      {[0, 1].map((wisp) => {
        const drift = Math.sin(frame / 23 + wisp * 2.4) * 5;
        const rise = ((frame * 0.5 + wisp * 30) % 60) / 60;
        return (
          <path
            key={wisp}
            d={`M ${-7 + wisp * 15} -58 q ${12 + drift} -16 0 -29 q ${-11 - drift} -16 2 -30`}
            transform={`translate(0 ${-rise * 10})`}
            fill="none"
            stroke="#d7e6e0"
            strokeWidth={2.3}
            strokeLinecap="round"
            opacity={0.24 * (1 - rise * 0.7)}
          />
        );
      })}
      <path d="M -22 -40 C -54 -47 -54 -7 -23 -13" fill="none" stroke="#152b37" strokeWidth={12} />
      <path d="M -22 -40 C -54 -47 -54 -7 -23 -13" fill="none" stroke="#729d95" strokeWidth={7} />
      <path
        d="M -25 -49 Q 0 -57 25 -49 L 22 -6 Q 19 4 0 5 Q -19 4 -22 -6 Z"
        fill={m('mug')}
        {...EDGE}
      />
      <path
        d="M -18 -41 L -16 -10"
        stroke="#bad5c3"
        strokeWidth={2.5}
        opacity={0.65}
        strokeLinecap="round"
      />
      <path d="M -21 -6 Q 0 3 21 -6 L 20 -1 Q 0 9 -20 -1 Z" fill={m('copper')} />
      <ellipse cy={-49} rx={25} ry={7.5} fill="#b1c6b6" {...EDGE} />
      <ellipse cy={-48.5} rx={20.5} ry={4.4} fill="#30271e" />
      <path d="M -17 -49 Q 0 -53 16 -49" fill="none" stroke="#ae7953" strokeWidth={1} />
      <path
        d="M 4 -35 L 6 -29 L 12 -27 L 6 -25 L 4 -19 L 2 -25 L -4 -27 L 2 -29 Z"
        fill="#e7c997"
        opacity={0.85}
      />
    </g>
  );
};

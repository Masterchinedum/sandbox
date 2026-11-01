import { useId } from 'react';
import { clamp, type Point } from '../shared/geometry';
import type { RobotPose } from '../shared/pose';
import type { Mood } from '../types';
import { EDGE, ETCH, useOriMaterial } from './OriMaterials';
import { Fastener } from './OriParts';

const HELMET =
  'M -104 -51 C -119 -77 -115 -115 -90 -143 C -59 -178 4 -180 48 -162 C 87 -147 111 -113 111 -79 C 115 -43 94 -17 56 -6 C 16 7 -41 3 -76 -13 Q -97 -26 -104 -51 Z';
const VISOR =
  'M -88 -98 C -81 -124 -41 -137 1 -137 C 44 -138 81 -124 90 -99 C 99 -74 87 -44 65 -32 C 31 -15 -29 -19 -60 -35 C -83 -48 -95 -74 -88 -98 Z';

export const OriHead: React.FC<{ neck: Point; pose: RobotPose }> = ({ neck, pose }) => {
  const m = useOriMaterial();
  const prefix = `ori-face-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const yaw = clamp(pose.headYaw, -1, 1);
  const faceX = yaw * 30;
  const faceScale = 1 - Math.abs(yaw) * 0.27;
  const pitch = clamp(pose.headPitch, -1, 1);
  const mouthWidth = 13 + pose.speech * 14;
  const mouthHeight = 2.5 + pose.speech * 8;
  return (
    <g transform={`translate(${neck.x} ${neck.y - 2}) rotate(${pose.headRoll})`}>
      <g transform={`translate(0 ${-pitch * 5})`}>
        <defs>
          <clipPath id={`${prefix}-shell`}>
            <path d={HELMET} />
          </clipPath>
          <clipPath id={`${prefix}-glass`}>
            <path d={VISOR} />
          </clipPath>
        </defs>
        {/* The receiver has a weighted tip and follows the existing antenna lag. */}
        <g transform={`translate(${-49 - yaw * 15} -156) rotate(${-18 + pose.antennaSway})`}>
          <path d="M 0 0 L -2 -30" stroke="#172a3b" strokeWidth={7} strokeLinecap="round" />
          <path d="M -1 -4 L -3 -29" stroke="#a2b9bd" strokeWidth={2} strokeLinecap="round" />
          <ellipse cx={-2} cy={-33} rx={8} ry={7} fill={m('copper')} {...EDGE} />
          <ellipse cx={-3} cy={-34} rx={4} ry={3} fill={m('light')} />
        </g>
        <path d={HELMET} fill={m('ceramic')} {...EDGE} />
        <g clipPath={`url(#${prefix}-shell)`}>
          <path
            d={`M ${58 + yaw * 23} -167 C ${120 + yaw * 12} -108 102 -32 30 4 L 140 16 L 142 -179 Z`}
            fill={m('edge')}
            opacity={0.55}
          />
          <ellipse cx={2} cy={-15} rx={115} ry={52} fill={m('bounce')} />
          <path
            d="M -100 -92 C -103 -123 -74 -154 -36 -162 C -5 -170 29 -167 52 -157"
            fill="none"
            stroke="#edf6e9"
            strokeWidth={3}
            opacity={0.85}
            strokeLinecap="round"
          />
          <path
            d={`M ${49 + yaw * 15} -165 Q ${87 + yaw * 10} -139 ${89 + yaw * 8} -112`}
            fill="none"
            {...ETCH}
            opacity={0.65}
          />
        </g>
        {[-1, 1].map((side) => (
          <EarPod
            key={side}
            x={side * 103 + yaw * 6}
            y={-73 + pitch * 2}
            squash={clamp(0.42 - side * yaw * 0.4, 0.12, 0.86)}
          />
        ))}
        {/* Face foreshortening is independent of the round cranial shell. */}
        <g clipPath={`url(#${prefix}-shell)`}>
          <g
            transform={`translate(${faceX} ${-pitch * 9}) scale(${faceScale} ${1 - Math.abs(pitch) * 0.04})`}
          >
            <path
              d={VISOR}
              transform="translate(0 5) scale(1.045 1.025)"
              fill="#172c3b"
              opacity={0.6}
            />
            <path
              d={VISOR}
              transform="scale(1.045 1.045) translate(0 2)"
              fill={m('edge')}
              stroke="#71868c"
              strokeWidth={1}
            />
            <path d={VISOR} fill={m('glass')} stroke="#172330" strokeWidth={2} />
            <g clipPath={`url(#${prefix}-glass)`}>
              <path
                d="M -93 -101 C -57 -134 31 -137 80 -106 Q 9 -117 -72 -84 Z"
                fill={m('reflection')}
              />
              <path
                d="M -66 -128 Q -87 -105 -86 -82"
                stroke="#d1eef6"
                strokeWidth={2}
                fill="none"
                opacity={0.6}
              />
              <ellipse cx={0} cy={-42} rx={74} ry={28} fill={m('halo')} opacity={0.3} />
              {([-1, 1] as const).map((side) => (
                <LensEye
                  key={side}
                  id={`${prefix}-eye-${side}`}
                  x={side * 35 + pose.eyeYaw * 13}
                  y={-81 - pose.eyePitch * 10}
                  side={side}
                  mood={pose.mood}
                  blink={pose.blink}
                />
              ))}
              <ellipse
                cx={0}
                cy={-41}
                rx={mouthWidth}
                ry={mouthHeight + 2}
                fill="#ff9c4c"
                opacity={0.35}
                filter={m('glow')}
              />
              <path
                d={`M ${-mouthWidth / 2} -44 Q 0 ${-38 + pose.speech * 3} ${mouthWidth / 2} -44 Q ${mouthWidth * 0.4} ${-42 + mouthHeight} 0 ${-42 + mouthHeight} Q ${-mouthWidth * 0.4} ${-42 + mouthHeight} ${-mouthWidth / 2} -44 Z`}
                fill={m('light')}
              />
              <path
                d="M -72 -54 Q -67 -43 -53 -38 M 55 -39 Q 72 -47 79 -65"
                fill="none"
                stroke="#ffad65"
                strokeWidth={1}
                opacity={0.18}
              />
            </g>
            {/* A real overhanging brow and a rolled chin lip, with distinct light planes. */}
            <path
              d="M -94 -101 C -89 -133 -42 -151 3 -149 C 47 -149 84 -130 94 -102 C 60 -125 -52 -138 -94 -101 Z"
              fill={m('ceramic')}
              {...EDGE}
            />
            <path
              d="M -87 -111 C -46 -143 46 -138 84 -111"
              fill="none"
              stroke="#fff7df"
              strokeWidth={2.4}
              strokeLinecap="round"
              opacity={0.85}
            />
            <path d="M -72 -30 Q 0 9 76 -29 Q 45 1 -2 2 Q -48 1 -72 -30 Z" fill={m('edge')} />
            <path
              d="M -64 -24 Q 0 5 65 -23"
              fill="none"
              stroke="#e8e4cd"
              strokeWidth={2.2}
              opacity={0.7}
            />
            <path
              d="M -10 -157 Q 0 -160 10 -157"
              fill="none"
              stroke="#354e5e"
              strokeWidth={2}
              strokeLinecap="round"
            />
            <path d="M -5 -157 H 5" stroke="#edaf72" strokeWidth={1.8} />
          </g>
        </g>
        <Fastener x={-82 + faceX * 0.4} y={-29} r={3} />
        <Fastener x={83 + faceX * 0.4} y={-29} r={3} />
      </g>
    </g>
  );
};

const EarPod: React.FC<{ x: number; y: number; squash: number }> = ({ x, y, squash }) => {
  const m = useOriMaterial();
  return (
    <g transform={`translate(${x} ${y}) scale(${squash} 1)`}>
      <circle cy={1} r={29} fill={m('rubber')} {...EDGE} />
      <circle r={25} fill={m('edge')} stroke="#afc5c7" strokeWidth={1.2} />
      <circle r={19} fill={m('copper')} stroke="#182c3b" strokeWidth={1.8} />
      <circle r={13.5} fill={m('metal')} stroke="#ffd6a0" strokeWidth={1} />
      <path
        d="M -4 -6 H 4 M -5 0 H 5 M -4 6 H 4"
        stroke="#b8cbd0"
        strokeWidth={1.6}
        strokeLinecap="round"
      />
      <path
        d="M -18 -13 A 22 22 0 0 1 10 -20"
        stroke="#eff3e3"
        strokeWidth={2}
        fill="none"
        opacity={0.7}
      />
    </g>
  );
};

const LensEye: React.FC<{
  id: string;
  x: number;
  y: number;
  mood: Mood | null;
  blink: number;
  side: -1 | 1;
}> = ({ id, x, y, mood, blink, side }) => {
  const m = useOriMaterial();
  const rx = mood === 'surprised' ? 16 : 13.5;
  const ry = mood === 'surprised' ? 23 : mood === 'curious' && side === 1 ? 21 : 19;
  const cover =
    mood === 'deadpan' ? 0.52 : mood === 'thoughtful' ? 0.26 : mood === 'sad' ? 0.25 : 0;
  const lid = -ry + ry * 2 * (cover + blink * (1 - cover));
  const slant = mood === 'sad' ? side * 7 * (1 - blink) : mood === 'curious' ? side * -2 : 0;
  const closed = blink > 0.92 || mood === 'amused';
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse rx={27} ry={32} fill={m('halo')} opacity={closed ? 0.4 : 0.85} />
      {closed ? (
        <path
          d={mood === 'amused' ? 'M -12 3 Q 0 -12 12 3' : 'M -12 5 Q 0 8 12 5'}
          fill="none"
          stroke="#ffd48b"
          strokeWidth={4.5}
          strokeLinecap="round"
        />
      ) : (
        <>
          <clipPath id={id}>
            <path
              d={`M -22 ${lid - slant} Q 0 ${lid - 2} 22 ${lid + slant} ${mood === 'warm' ? `V ${ry - 2} Q 0 ${ry - 10} -22 ${ry - 2}` : 'V 30 H -22'} Z`}
            />
          </clipPath>
          <g clipPath={`url(#${id})`}>
            <ellipse rx={rx + 2} ry={ry + 2} fill="#ffad51" opacity={0.6} filter={m('glow')} />
            <ellipse rx={rx} ry={ry} fill={m('light')} stroke="#ffc171" strokeWidth={1} />
            <ellipse cx={-3.5} cy={-6} rx={3} ry={5} fill="#fffbe4" opacity={0.9} />
            <path
              d={`M ${rx * 0.5} ${ry * 0.7} Q 0 ${ry} ${-rx * 0.5} ${ry * 0.7}`}
              stroke="#fff0bc"
              strokeWidth={1}
              fill="none"
              opacity={0.5}
            />
          </g>
        </>
      )}
    </g>
  );
};

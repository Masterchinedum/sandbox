import { AbsoluteFill } from 'remotion';
import { Ori } from './ori/Ori';
import { OriHead } from './ori/OriHead';
import { OriMaterials } from './ori/OriMaterials';
import type { RobotPose } from './shared/pose';

export const DESIGN_POSE: RobotPose = {
  headYaw: 0, headPitch: 0, headRoll: 0, eyeYaw: 0, eyePitch: 0,
  blink: 0, mood: 'warm', speech: 0, gesture: 0, gestureBeat: 0,
  breathing: 0, antennaSway: 0, lean: 0,
};

const PORTRAITS: { label: string; note: string; pose: Partial<RobotPose> }[] = [
  { label: 'WARM', note: 'Soft gaze · relaxed mouth', pose: { mood: 'warm', headRoll: -3 } },
  { label: 'THOUGHTFUL', note: 'Listening to the left', pose: { mood: 'thoughtful', headYaw: -0.8, eyeYaw: -0.12, headRoll: 3 } },
  { label: 'CURIOUS', note: 'Listening to the right', pose: { mood: 'curious', headYaw: 0.8, eyeYaw: 0.12, headRoll: -5 } },
  { label: 'AMUSED', note: 'Arced eyes · open smile', pose: { mood: 'amused', headRoll: -5, speech: 0.3 } },
  { label: 'CONCERNED', note: 'Slanted lids · quieter light', pose: { mood: 'sad', headYaw: -0.25, headPitch: -0.4, headRoll: 6 } },
  { label: 'SURPRISED', note: 'Wide lenses · raised gaze', pose: { mood: 'surprised', headPitch: 0.35, speech: 0.85 } },
];

export const OriDesignSheet: React.FC = () => {
  const hero = { ...DESIGN_POSE, headYaw: 0.12, headRoll: -4, gesture: 0.85 };
  return (
    <AbsoluteFill style={{ background: '#172a34' }}>
      <svg width={1920} height={1080} viewBox="0 0 1920 1080" fontFamily="'Helvetica Neue', Arial, sans-serif">
        <defs>
          <radialGradient id="ori-sheet-bg" cx="0.24" cy="0.48" r="0.8">
            <stop stopColor="#3e555e" /><stop offset="1" stopColor="#162832" />
          </radialGradient>
          <radialGradient id="ori-sheet-shadow"><stop stopColor="#07131c" stopOpacity="0.8" /><stop offset="1" stopColor="#07131c" stopOpacity="0" /></radialGradient>
        </defs>
        <rect width={1920} height={1080} fill="url(#ori-sheet-bg)" />
        <text x={92} y={112} fontSize={62} fontWeight={500} letterSpacing={12} fill="#f3ecd9">ORI</text>
        <text x={96} y={151} fontSize={18} letterSpacing={3.2} fill="#b7c7c7">THE OBSERVATORY COMPANION</text>
        <text x={1818} y={106} textAnchor="end" fontSize={13} letterSpacing={2.6} fill="#a9bcbf">CHARACTER STUDY / 01</text>
        <path d="M 760 200 V 936" stroke="#b8cecc" opacity={0.16} />
        <ellipse cx={391} cy={1010} rx={270} ry={36} fill="url(#ori-sheet-shadow)" />
        <g transform="translate(393 809) scale(1.13)">
          <Ori pose={hero} layer="body" /><Ori pose={hero} layer="arms" />
        </g>
        <text x={866} y={186} fontSize={14} letterSpacing={2.5} fill="#e1b783">A LITTLE MACHINE. A LOT TO WONDER ABOUT.</text>
        {PORTRAITS.map(({ label, note, pose }, i) => {
          const x = 975 + (i % 3) * 354;
          const y = i < 3 ? 462 : 811;
          return (
            <g key={label}>
              <g transform={`translate(${x} ${y}) scale(1.08)`}>
                <OriMaterials><OriHead neck={{ x: 0, y: 0 }} pose={{ ...DESIGN_POSE, ...pose }} /></OriMaterials>
              </g>
              <text x={x} y={y + 47} textAnchor="middle" fontSize={14} fontWeight={500} letterSpacing={2.8} fill="#efe9d6">{label}</text>
              <text x={x} y={y + 74} textAnchor="middle" fontSize={14} fill="#9db4ba">{note}</text>
            </g>
          );
        })}
        <path d="M 863 952 H 1818" stroke="#b8cecc" opacity={0.2} />
        {[
          ['#e4e2cd', 'CERAMIC'], ['#bb7b4e', 'COPPER'], ['#263c4d', 'GRAPHITE'], ['#ffbf6c', 'AMBER'],
        ].map(([color, name], i) => (
          <g key={name} transform={`translate(${875 + i * 235} 993)`}>
            <circle r={10} fill={color} stroke="#cfdbcf" strokeWidth={0.5} />
            <text x={24} y={5} fontSize={12} letterSpacing={2} fill="#b2c3c5">{name}</text>
          </g>
        ))}
      </svg>
    </AbsoluteFill>
  );
};

// A dedicated rig contact sheet covers both extremes and every expression.
// Keeping it in Studio makes future geometry changes easy to check visually.
export const OriRigCheck: React.FC = () => {
  const cases: Partial<RobotPose>[] = [
    { headYaw: -1, headPitch: -1, mood: 'sad' },
    { headYaw: 1, headPitch: 1, mood: 'surprised' },
    { mood: 'deadpan' }, { mood: 'amused', blink: 1 },
    { mood: 'warm', blink: 0.5 }, { mood: 'thoughtful', headRoll: 16 },
    { mood: 'curious', headRoll: -16 }, { mood: null },
  ];
  return (
    <AbsoluteFill style={{ background: '#304752' }}>
      <svg viewBox="0 0 1600 900">
        {cases.map((pose, i) => (
          <g key={i} transform={`translate(${210 + (i % 4) * 395} ${i < 4 ? 380 : 810}) scale(1.4)`}>
            <OriMaterials><OriHead neck={{ x: 0, y: 0 }} pose={{ ...DESIGN_POSE, ...pose }} /></OriMaterials>
          </g>
        ))}
      </svg>
    </AbsoluteFill>
  );
};

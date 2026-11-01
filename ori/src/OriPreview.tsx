// Ori on its own: no room, no table, no other robots. A short made-up scene has Ori talk to the
// camera, turn to listen to Luma off screen, and answer, so a few seconds show its blinks, head
// turns, moods, mouth and talking hand.
//
// The acting comes from the same performance code as the real conversation (src/acting/).

import { AbsoluteFill, useCurrentFrame } from 'remotion';
import {
  type ConversationLine,
  type ConversationTrack,
  poseAt,
  ROBOTS,
} from './acting/performance';
import { Ori } from './ori/Ori';
import { point } from './shared/geometry';
import { type RobotName } from './shared/palette';
import { PartDefs } from './shared/robotParts';

// The vertical Shorts frame the videos use.
export const FRAME = { width: 1080, height: 1920, fps: 30 };

export const ORI_PREVIEW_FRAMES = 240;

// Who Ori turns to listen to, off screen to its left (our right), as at the table.
const LISTENS_TO: RobotName = 'luma';

// Where Ori's origin (the top of its stool seat) goes in the frame, and how big it is drawn, so
// the whole robot and its stool fill the frame.
const SEAT = point(540, 1240);
const SCALE = 1.9;
// The stool's feet stand this far below the origin, at scale 1.
const FLOOR_DROP = 180;

export const OriPreview: React.FC = () => {
  const frame = useCurrentFrame();
  const pose = poseAt(PREVIEW_TRACK, 'ori', frame);

  return (
    <AbsoluteFill style={{ backgroundColor: '#14232f' }}>
      <svg width={FRAME.width} height={FRAME.height} viewBox={`0 0 ${FRAME.width} ${FRAME.height}`}>
        <defs>
          <PartDefs />
          <radialGradient id="preview-backdrop" cx="0.46" cy="0.4" r="0.7">
            <stop offset="0" stopColor="#3a505b" />
            <stop offset="0.65" stopColor="#243843" />
            <stop offset="1" stopColor="#14232f" />
          </radialGradient>
          <radialGradient id="preview-floor">
            <stop offset="0" stopColor="#070f19" stopOpacity="0.8" />
            <stop offset="0.55" stopColor="#0b1721" stopOpacity="0.4" />
            <stop offset="1" stopColor="#0b1721" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="preview-spot">
            <stop offset="0" stopColor="#c4c3a4" stopOpacity="0.1" />
            <stop offset="1" stopColor="#c4c3a4" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#preview-backdrop)" />
        <ellipse cx={SEAT.x} cy={1590} rx={590} ry={260} fill="url(#preview-spot)" />
        <FloorShadow />
        <g transform={`translate(${SEAT.x} ${SEAT.y}) scale(${SCALE})`}>
          <Ori pose={pose} layer="body" />
          <Ori pose={pose} layer="arms" />
        </g>
      </svg>
    </AbsoluteFill>
  );
};

// A soft pool of Ori's orange on the floor under the stool.
const FloorShadow: React.FC = () => {
  const floorY = SEAT.y + FLOOR_DROP * SCALE;
  return (
    <g>
      <ellipse cx={SEAT.x} cy={floorY} rx={380} ry={64} fill="url(#preview-floor)" />
      <ellipse
        cx={SEAT.x}
        cy={floorY}
        rx={220}
        ry={21}
        fill="url(#preview-floor)"
      />
    </g>
  );
};

// ---- The made-up scene ----------------------------------------------------------------------

const PREVIEW_LINES: ConversationLine[] = [
  // Talks into the lens, warmly.
  { speaker: 'ori', camera: 'ori-to-camera', startFrame: 0, endFrame: 90, mood: 'warm' },
  // Luma says something off screen; Ori turns to listen.
  { speaker: LISTENS_TO, camera: null, startFrame: 90, endFrame: 150, mood: null },
  // Answers, curious, with its hand up.
  {
    speaker: 'ori',
    camera: null,
    startFrame: 150,
    endFrame: ORI_PREVIEW_FRAMES,
    mood: 'curious',
  },
];

// A loudness curve for every robot: syllable-like bumps while it has the line, silence otherwise.
function speechFor(lines: ConversationLine[]): Record<RobotName, number[]> {
  const speech = {} as Record<RobotName, number[]>;
  for (const robot of ROBOTS) {
    speech[robot] = new Array<number>(ORI_PREVIEW_FRAMES).fill(0);
  }
  for (const line of lines) {
    for (let frame = line.startFrame; frame < line.endFrame; frame++) {
      speech[line.speaker][frame] = syllableLevel(frame - line.startFrame);
    }
  }
  return speech;
}

// Two waves at different speeds: their product opens and closes the mouth about four times a
// second, with an occasional near-silent gap, like words in a sentence.
function syllableLevel(framesIntoLine: number): number {
  const syllables = Math.abs(Math.sin(framesIntoLine / 2.4));
  const phrasing = 0.55 + 0.45 * Math.sin(framesIntoLine / 11);
  return syllables * phrasing;
}

// Made once: poseAt keeps its worked-out performance against this object.
const PREVIEW_TRACK: ConversationTrack = {
  totalFrames: ORI_PREVIEW_FRAMES,
  lines: PREVIEW_LINES,
  speechBySpeaker: speechFor(PREVIEW_LINES),
};

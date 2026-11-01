// The robots' acting, frame by frame: who looks at whom, when they blink, how far their mouths
// open, when the speaker talks with a hand, and the expression each line asks for.
//
// The whole performance is worked out once for the whole video and kept, because a head that
// turns smoothly needs to know where it was a moment ago.

import type { Mood } from '../types';
import { clamp, onTwos } from '../shared/geometry';
import type { RobotName } from '../shared/palette';
import type { RobotPose } from '../shared/pose';
import { GAZE, type GazeTarget, RESTING_GAZE } from './staging';

export type ConversationLine = {
  speaker: RobotName;
  camera: string | null;
  startFrame: number;
  // The frame the next line starts on.
  endFrame: number;
  mood: Mood | null;
};

export type ConversationTrack = {
  totalFrames: number;
  lines: ConversationLine[];
  // 0 (silent) to 1 (loud), one value per frame, for each robot.
  speechBySpeaker: Record<RobotName, number[]>;
};

export const ROBOTS: RobotName[] = ['ori', 'hollis', 'luma'];

// Listeners turn to a new speaker a moment after they start, as people do.
const LISTENER_DELAY_FRAMES = 5;
// How quickly a head settles on a new direction, in frames (a time constant).
const HEAD_SETTLE_FRAMES = 4.5;
const EYE_SETTLE_FRAMES = 1.5;
const GESTURE_SETTLE_FRAMES = 7;
const MOOD_SETTLE_FRAMES = 6;
// A line this long or longer gets a talking hand.
const GESTURE_MIN_FRAMES = 75;
const GESTURE_IN_DELAY_FRAMES = 10;
const GESTURE_OUT_LEAD_FRAMES = 14;

const BLINK_FRAMES = 6;
// Each robot blinks on its own rhythm, so they never blink together.
const BLINK_EVERY_FRAMES: Record<RobotName, number> = { ori: 104, hollis: 131, luma: 89 };
const BLINK_OFFSET_FRAMES: Record<RobotName, number> = { ori: 30, hollis: 75, luma: 10 };
const BREATH_FRAMES: Record<RobotName, number> = { ori: 46, hollis: 58, luma: 39 };
const BREATH_PIXELS = 2.2;
// Listeners nod very slightly now and then, so no one ever looks frozen.
const LISTENING_NOD = 0.035;
const LISTENING_NOD_FRAMES: Record<RobotName, number> = { ori: 23, hollis: 31, luma: 19 };

// How each mood holds the head: a nod down for sad, a lift for surprise, a tilt for curiosity.
const MOOD_HEAD: Record<Mood, { pitch: number; roll: number }> = {
  amused: { pitch: 0.02, roll: 4 },
  surprised: { pitch: 0.12, roll: 0 },
  sad: { pitch: -0.32, roll: -3 },
  deadpan: { pitch: -0.04, roll: 0 },
  thoughtful: { pitch: 0.16, roll: 5 },
  warm: { pitch: 0.04, roll: -4 },
  curious: { pitch: 0.04, roll: 9 },
};

type Performance = Record<RobotName, RobotPose[]>;

const cache = new WeakMap<ConversationTrack, Performance>();

// A robot's pose on a frame. The robots are drawn on twos, so odd frames repeat the even one.
export function poseAt(track: ConversationTrack, robot: RobotName, frame: number): RobotPose {
  let performance = cache.get(track);
  if (!performance) {
    performance = perform(track);
    cache.set(track, performance);
  }
  const poses = performance[robot];
  const index = clamp(onTwos(frame), 0, poses.length - 1);
  return poses[index];
}

// The line being spoken at `frame` (the last one that has started).
export function lineAt(track: ConversationTrack, frame: number): ConversationLine {
  let index = 0;
  while (index + 1 < track.lines.length && track.lines[index + 1].startFrame <= frame) {
    index++;
  }
  return track.lines[index];
}

export function lineIndexAt(track: ConversationTrack, frame: number): number {
  return track.lines.indexOf(lineAt(track, frame));
}

// ---------------------------------------------------------------------------------------------

function perform(track: ConversationTrack): Performance {
  const performance = {} as Performance;
  for (const robot of ROBOTS) {
    performance[robot] = performRobot(track, robot);
  }
  return performance;
}

function performRobot(track: ConversationTrack, robot: RobotName): RobotPose[] {
  const poses: RobotPose[] = [];
  let headYaw = GAZE[robot][RESTING_GAZE[robot]].yaw;
  let headPitch = 0;
  let eyeYaw = headYaw;
  let eyePitch = 0;
  let gesture = 0;
  let moodPitch = 0;
  let moodRoll = 0;
  let previousTarget: GazeTarget | null = null;
  let lastTurnFrame = -100;
  const yawHistory: number[] = [];

  for (let frame = 0; frame < track.totalFrames; frame++) {
    const speakingLine = lineAt(track, frame);
    const isSpeaking = speakingLine.speaker === robot;
    const target = gazeTarget(track, robot, frame);
    if (target !== previousTarget) {
      previousTarget = target;
      lastTurnFrame = frame;
    }
    const gaze = GAZE[robot][target];

    const mood = isSpeaking ? speakingLine.mood : null;
    const moodHead = mood ? MOOD_HEAD[mood] : { pitch: 0, roll: 0 };
    moodPitch = settle(moodPitch, moodHead.pitch, MOOD_SETTLE_FRAMES);
    moodRoll = settle(moodRoll, moodHead.roll, MOOD_SETTLE_FRAMES);

    headYaw = settle(headYaw, gaze.yaw, HEAD_SETTLE_FRAMES);
    headPitch = settle(headPitch, gaze.pitch + moodPitch, HEAD_SETTLE_FRAMES);
    eyeYaw = settle(eyeYaw, gaze.yaw, EYE_SETTLE_FRAMES);
    eyePitch = settle(eyePitch, gaze.pitch + moodPitch, EYE_SETTLE_FRAMES);
    yawHistory.push(headYaw);

    const speech = isSpeaking ? (track.speechBySpeaker[robot][frame] ?? 0) : 0;
    gesture = settle(gesture, gestureTarget(speakingLine, robot, frame), GESTURE_SETTLE_FRAMES);
    // A speaker's head bobs a little with the words; a listener's nods slowly.
    const talkingNod = Math.sin(frame / 5.5) * 0.035 * speech;
    let listeningNod = 0;
    if (!isSpeaking) {
      listeningNod = Math.sin(frame / LISTENING_NOD_FRAMES[robot]) * LISTENING_NOD;
    }

    poses.push({
      headYaw,
      headPitch: headPitch + talkingNod + listeningNod,
      headRoll: moodRoll + Math.sin(frame / 9) * 1.4 * speech,
      eyeYaw: eyeYaw - headYaw,
      eyePitch: eyePitch - headPitch,
      blink: blinkAmount(robot, frame, lastTurnFrame),
      mood,
      speech,
      gesture,
      gestureBeat: Math.sin(frame / 6.5) * clamp(speech * 1.4, 0, 1),
      breathing: Math.sin((frame / BREATH_FRAMES[robot]) * Math.PI * 2) * BREATH_PIXELS,
      antennaSway: antennaSway(yawHistory, frame),
      lean: gesture * 3 + (isSpeaking ? 1.5 : 0),
    });
  }
  return poses;
}

// Who a robot looks at: the speaker looks at whoever they're answering (or into the lens on a
// line to camera); everyone else looks at the speaker, a moment late.
function gazeTarget(track: ConversationTrack, robot: RobotName, frame: number): GazeTarget {
  const index = lineIndexAt(track, frame);
  const line = track.lines[index];
  if (line.speaker === robot) {
    if (line.camera?.endsWith('-to-camera')) {
      return 'camera';
    }
    return addressee(track, index);
  }
  const delayedLine = lineAt(track, Math.max(0, frame - LISTENER_DELAY_FRAMES));
  if (delayedLine.speaker === robot) {
    // Still finishing their own turn: keep looking where they were.
    return addressee(track, track.lines.indexOf(delayedLine));
  }
  return delayedLine.speaker;
}

// The robot a line is spoken to: the one who spoke before, or else the one who answers.
function addressee(track: ConversationTrack, index: number): RobotName {
  const speaker = track.lines[index].speaker;
  const previous = track.lines[index - 1];
  if (previous && previous.speaker !== speaker) {
    return previous.speaker;
  }
  const next = track.lines[index + 1];
  if (next && next.speaker !== speaker) {
    return next.speaker;
  }
  return RESTING_GAZE[speaker];
}

function gestureTarget(line: ConversationLine, robot: RobotName, frame: number): number {
  if (line.speaker !== robot) {
    return 0;
  }
  if (line.endFrame - line.startFrame < GESTURE_MIN_FRAMES) {
    return 0;
  }
  const isUnderway = frame >= line.startFrame + GESTURE_IN_DELAY_FRAMES;
  const isWindingDown = frame >= line.endFrame - GESTURE_OUT_LEAD_FRAMES;
  if (isUnderway && !isWindingDown) {
    return 1;
  }
  return 0;
}

// A regular blink on each robot's own rhythm, and one more whenever the head turns to someone
// new, as anime characters do.
function blinkAmount(robot: RobotName, frame: number, lastTurnFrame: number): number {
  const sinceTurn = frame - lastTurnFrame;
  if (sinceTurn >= 0 && sinceTurn < BLINK_FRAMES) {
    return Math.sin((sinceTurn / BLINK_FRAMES) * Math.PI);
  }
  const phase = (frame + BLINK_OFFSET_FRAMES[robot]) % BLINK_EVERY_FRAMES[robot];
  if (phase >= BLINK_FRAMES) {
    return 0;
  }
  return Math.sin((phase / BLINK_FRAMES) * Math.PI);
}

// The antenna lags behind the head: it leans against the way the head has just turned.
function antennaSway(yawHistory: number[], frame: number): number {
  const lookBack = Math.min(4, yawHistory.length - 1);
  const recentTurn =
    yawHistory[yawHistory.length - 1] - yawHistory[yawHistory.length - 1 - lookBack];
  const idle = Math.sin(frame / 23) * 2.5;
  return clamp(-recentTurn * 120, -18, 18) + idle;
}

// Moves `current` a step towards `target`, covering about 63% of the gap every
// `settleFrames` frames: a quick start that eases into place.
function settle(current: number, target: number, settleFrames: number): number {
  const step = 1 - Math.exp(-1 / settleFrames);
  return current + (target - current) * step;
}

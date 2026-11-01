// Where everything is in the drawn conversation: the seats around the table, which way each
// robot has to turn its head to look at the others, and the camera framings named on the
// storyboard's lines.
//
// The world is laid out in the 1080 × 1920 frame as the wide shot sees it. Ori sits on the far
// side of a round table, facing us; Hollis on the left and Luma on the right sit side-on,
// turned three-quarters towards the middle. The night window fills the wall behind them.

import { point, type Point } from '../shared/geometry';
import type { RobotName } from '../shared/palette';

export type Seat = {
  // Where the robot's seat is, in the world; its drawing's origin.
  position: Point;
  // Luma is small, Hollis tall.
  scale: number;
};

export const SEATS: Record<RobotName, Seat> = {
  ori: { position: point(540, 1092), scale: 1 },
  hollis: { position: point(196, 1104), scale: 1.08 },
  luma: { position: point(874, 1066), scale: 0.84 },
};

export const TABLE = {
  centre: point(548, 1006),
  radiusX: 262,
  radiusY: 58,
  thickness: 22,
  // Where the pedestal meets the floor.
  footY: 1300,
};

export const FLOOR_LINE_Y = 1080;

export type GazeTarget = RobotName | 'camera';

export type Gaze = {
  // -1 turned fully to screen left, 0 facing the camera, 1 fully to screen right.
  yaw: number;
  // -1 looking down, 1 looking up.
  pitch: number;
};

// How each robot turns to look at each target. They "cheat" towards the camera, as actors do:
// a little less turned than the true direction, so their faces stay in view.
export const GAZE: Record<RobotName, Record<GazeTarget, Gaze>> = {
  ori: {
    ori: { yaw: 0, pitch: 0 },
    hollis: { yaw: -0.62, pitch: 0.02 },
    luma: { yaw: 0.6, pitch: -0.1 },
    camera: { yaw: 0, pitch: 0 },
  },
  hollis: {
    ori: { yaw: 0.48, pitch: -0.02 },
    hollis: { yaw: 0.4, pitch: 0 },
    luma: { yaw: 0.78, pitch: -0.14 },
    camera: { yaw: 0.05, pitch: 0 },
  },
  luma: {
    ori: { yaw: -0.5, pitch: 0.06 },
    hollis: { yaw: -0.8, pitch: 0.16 },
    luma: { yaw: -0.4, pitch: 0 },
    camera: { yaw: -0.02, pitch: 0.02 },
  },
};

// Each robot's resting direction when no one is talking.
export const RESTING_GAZE: Record<RobotName, RobotName> = {
  ori: 'luma',
  hollis: 'ori',
  luma: 'ori',
};

export type Framing = {
  zoom: number;
  // The world point that lands at the frame's centre.
  focus: Point;
};

// The point of interest for each framing and where it should land on screen. A face sits in
// the upper half, clear of the captions at 1320.
type FramingRecipe = {
  zoom: number;
  subject: Point;
  screen: Point;
};

const FRAME_CENTRE = point(540, 960);

const RECIPES: Record<string, FramingRecipe> = {
  wide: { zoom: 1.12, subject: point(540, 880), screen: point(540, 820) },
  ori: { zoom: 2.55, subject: point(540, 712), screen: point(540, 690) },
  hollis: { zoom: 2.35, subject: point(214, 684), screen: point(510, 690) },
  luma: { zoom: 2.75, subject: point(862, 790), screen: point(600, 700) },
  'luma-to-camera': { zoom: 3.05, subject: point(870, 790), screen: point(540, 700) },
  'hollis-and-ori': { zoom: 1.62, subject: point(380, 720), screen: point(540, 700) },
};

export function framingFor(camera: string): Framing {
  const recipe = RECIPES[camera] ?? RECIPES.wide;
  return {
    zoom: recipe.zoom,
    focus: point(
      recipe.subject.x - (recipe.screen.x - FRAME_CENTRE.x) / recipe.zoom,
      recipe.subject.y - (recipe.screen.y - FRAME_CENTRE.y) / recipe.zoom,
    ),
  };
}

export { FRAME_CENTRE };

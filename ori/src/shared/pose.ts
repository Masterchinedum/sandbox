// What every drawn character is given to draw itself on a frame. The scene works these values
// out (src/explainer/conversation2d/performance.ts) and the character only has to show them, so
// a redesigned character keeps working in every video as long as it takes these props.

import type { Mood } from '../types';

export type RobotPose = {
  // -1 turned to screen left, 0 facing the camera, 1 turned to screen right.
  headYaw: number;
  // -1 looking down, 1 looking up.
  headPitch: number;
  // Degrees of tilt to the side.
  headRoll: number;
  // The eyes lead the head: how much further they have already turned.
  eyeYaw: number;
  eyePitch: number;
  // 0 open, 1 shut.
  blink: number;
  mood: Mood | null;
  // 0 to 1: how far the mouth light opens.
  speech: number;
  // 0 hands resting, 1 the front hand raised and talking.
  gesture: number;
  // -1 to 1: the small beats of a talking hand.
  gestureBeat: number;
  // Pixels the chest and head rise and fall.
  breathing: number;
  // Degrees: the antenna swings behind a turn of the head.
  antennaSway: number;
  // Degrees the body leans towards the table.
  lean: number;
};

// Each character is drawn in two layers, so a table can sit between them: the body (legs,
// seat, torso, head) behind the table top, and the arms resting on it in front.
export type RobotLayer = 'body' | 'arms';

export type RobotProps = {
  pose: RobotPose;
  layer: RobotLayer;
};

// Colours for the drawn night conversation. The room is lit two ways, as anime night interiors
// usually are: cool blue moonlight from the window behind the robots, and a warm pool from the
// lamp on the table. So shells are pale in front, blue in shadow, and catch a warm glow from
// below and a cool rim of moonlight along their top edges.

export const NIGHT = {
  ink: '#161A2C',
  // Outlines stay this many screen pixels wide however close the camera gets.
  inkWidth: 3.2,
  detailWidth: 1.8,

  shell: '#E7ECF5',
  shellShade: '#9AA5C6',
  shellDeep: '#6E7899',
  // The lamp's glow on the shell's lower, front-facing surfaces.
  shellWarm: '#FFCF9E',
  rim: '#CFE4FF',
  joint: '#454D6B',
  jointLight: '#68718F',
  visor: '#11131F',
  visorShine: '#3A4466',

  wall: '#323B5C',
  wallDeep: '#232A45',
  wallWarm: '#7A5E5E',
  trim: '#C9CFE0',
  trimShade: '#7E87A6',
  floor: '#3A3550',
  floorBoard: '#2C2840',
  floorWarm: '#7B5A4E',
  rug: '#5B3F57',
  rugBorder: '#8E6A7E',
  rugInner: '#3F2D46',

  skyTop: '#060B22',
  skyMiddle: '#14235A',
  skyHorizon: '#3B5598',
  hills: '#0B1028',
  hillsNear: '#070A1B',
  moon: '#FFF6DE',
  moonShade: '#E3D6B8',
  star: '#FFFFFF',
  windowLight: '#9FC1FF',

  curtain: '#3E3460',
  curtainShade: '#2A2346',
  curtainLight: '#5A4D86',

  wood: '#8A5A3C',
  woodShade: '#5E3B27',
  woodLight: '#B17A52',
  tableTop: '#C08A5E',
  tableTopShade: '#8F6243',

  lamp: '#FFB866',
  lampCore: '#FFF1D6',
  lampShade: '#F4E3C8',

  scarf: '#9C2F3E',
  scarfShade: '#6E1F2C',
  scarfStripe: '#D9A441',

  ori: '#FF6A00',
  oriLight: '#FFB37A',
  hollis: '#00C7B3',
  hollisLight: '#8BF5E8',
  luma: '#8A4DFF',
  lumaLight: '#C7A6FF',
} as const;

export type RobotName = 'ori' | 'hollis' | 'luma';

export const ROBOT_COLOR: Record<RobotName, { glow: string; light: string }> = {
  ori: { glow: NIGHT.ori, light: NIGHT.oriLight },
  hollis: { glow: NIGHT.hollis, light: NIGHT.hollisLight },
  luma: { glow: NIGHT.luma, light: NIGHT.lumaLight },
};

// Every ink line in the scene: the stroke keeps its screen width at any zoom.
export const INK = {
  stroke: NIGHT.ink,
  strokeWidth: NIGHT.inkWidth,
  strokeLinejoin: 'round',
  strokeLinecap: 'round',
  vectorEffect: 'non-scaling-stroke',
} as const;

export const DETAIL_INK = {
  ...INK,
  strokeWidth: NIGHT.detailWidth,
} as const;

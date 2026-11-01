// Small geometry helpers for the drawn characters: points, easing, the outline of a limb
// between two joints, polygons with rounded corners, and the two-bone reach that bends an arm
// or a leg so its hand or foot lands where it is put.
//
// Coordinates are SVG pixels, y pointing down.

export type Point = { x: number; y: number };

export function point(x: number, y: number): Point {
  return { x, y };
}

export function add(first: Point, second: Point): Point {
  return { x: first.x + second.x, y: first.y + second.y };
}

export function scalePoint(value: Point, factor: number): Point {
  return { x: value.x * factor, y: value.y * factor };
}

export function distance(first: Point, second: Point): number {
  return Math.hypot(second.x - first.x, second.y - first.y);
}

export function lerp(start: number, end: number, progress: number): number {
  return start + (end - start) * progress;
}

export function lerpPoint(start: Point, end: Point, progress: number): Point {
  return { x: lerp(start.x, end.x, progress), y: lerp(start.y, end.y, progress) };
}

export function clamp(value: number, lowest: number, highest: number): number {
  return Math.min(Math.max(value, lowest), highest);
}

export function smoothstep(value: number): number {
  const clamped = clamp(value, 0, 1);
  return clamped * clamped * (3 - 2 * clamped);
}

// The direction from one point to another, in degrees (0 points right, 90 points down).
export function angleBetween(from: Point, to: Point): number {
  return (Math.atan2(to.y - from.y, to.x - from.x) * 180) / Math.PI;
}

// Anime holds each drawing for two frames ("on twos"); the characters move on even frames only.
export function onTwos(frame: number): number {
  return frame - (frame % 2);
}

// The outline of a limb from one joint to another: a tube that narrows from `startWidth` to
// `endWidth`, with round ends.
export function capsulePath(start: Point, end: Point, startWidth: number, endWidth: number) {
  const length = Math.max(distance(start, end), 0.001);
  // A unit vector across the limb.
  const acrossX = -(end.y - start.y) / length;
  const acrossY = (end.x - start.x) / length;
  const startRadius = startWidth / 2;
  const endRadius = endWidth / 2;
  const startLeft = point(start.x + acrossX * startRadius, start.y + acrossY * startRadius);
  const startRight = point(start.x - acrossX * startRadius, start.y - acrossY * startRadius);
  const endLeft = point(end.x + acrossX * endRadius, end.y + acrossY * endRadius);
  const endRight = point(end.x - acrossX * endRadius, end.y - acrossY * endRadius);
  return [
    `M ${format(startLeft)}`,
    `L ${format(endLeft)}`,
    `A ${endRadius} ${endRadius} 0 0 0 ${format(endRight)}`,
    `L ${format(startRight)}`,
    `A ${startRadius} ${startRadius} 0 0 0 ${format(startLeft)}`,
    'Z',
  ].join(' ');
}

// A polygon whose corners are rounded off by up to `radius` pixels.
export function roundedPolygonPath(corners: Point[], radius: number): string {
  const commands: string[] = [];
  corners.forEach((corner, index) => {
    const previous = corners[(index - 1 + corners.length) % corners.length];
    const next = corners[(index + 1) % corners.length];
    // A corner can't round off more than half of either edge it joins.
    const cornerRadius = Math.min(
      radius,
      distance(corner, previous) / 2,
      distance(corner, next) / 2,
    );
    const entry = towards(corner, previous, cornerRadius);
    const exit = towards(corner, next, cornerRadius);
    const verb = index === 0 ? 'M' : 'L';
    commands.push(`${verb} ${format(entry)}`, `Q ${format(corner)} ${format(exit)}`);
  });
  commands.push('Z');
  return commands.join(' ');
}

export function format(value: Point): string {
  return `${value.x.toFixed(1)} ${value.y.toFixed(1)}`;
}

export function pointsAttribute(corners: Point[]): string {
  return corners.map((corner) => `${corner.x.toFixed(1)},${corner.y.toFixed(1)}`).join(' ');
}

function towards(from: Point, to: Point, length: number): Point {
  const total = Math.max(distance(from, to), 0.001);
  return lerpPoint(from, to, length / total);
}

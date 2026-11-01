// Arms, legs and shoulder pads that every drawn robot is built from. Each robot passes its own
// joint positions and widths; these draw the shells, joints and hands between them.

import { angleBetween, lerp, lerpPoint, point, type Point, roundedPolygonPath } from './geometry';
import { DETAIL_INK, INK, NIGHT } from './palette';
import type { RobotPose } from './pose';
import { Boot, Hand, Joint, Limb, Panel, Seam } from './robotParts';

// An arm held in one position: where the elbow and wrist are, and which way the hand points.
export type ArmPose = { elbow: Point; wrist: Point; handAngle: number };

type ArmProps = {
  shoulder: Point;
  arm: ArmPose;
  // 0 a resting mitten, 1 open and talking.
  open: number;
  thumbSide: 1 | -1;
  // Which side of the arm the cel shadow runs down.
  shadeSide: 1 | -1;
  widths: { upper: number; forearm: number };
  handSize?: number;
};

// An upper arm, a forearm with its armour plate, and the hand.
export const Arm: React.FC<ArmProps> = ({
  shoulder,
  arm,
  open,
  thumbSide,
  shadeSide,
  widths,
  handSize = 1.1,
}) => {
  const { elbow, wrist } = arm;
  return (
    <g>
      <Limb
        from={shoulder}
        to={elbow}
        fromWidth={widths.upper}
        toWidth={widths.upper * 0.84}
        shadeSide={shadeSide}
      />
      <Limb
        from={elbow}
        to={wrist}
        fromWidth={widths.forearm}
        toWidth={widths.forearm * 0.8}
        shadeSide={shadeSide}
      />
      <ForearmPlate elbow={elbow} wrist={wrist} width={widths.forearm} />
      <Joint at={elbow} radius={widths.upper * 0.44} />
      <Hand wrist={wrist} angle={arm.handAngle} open={open} thumbSide={thumbSide} size={handSize} />
      <circle cx={wrist.x} cy={wrist.y} r={widths.forearm * 0.26} fill={NIGHT.joint} {...INK} />
    </g>
  );
};

// A raised plate along the middle of the forearm, with a seam across it.
const ForearmPlate: React.FC<{ elbow: Point; wrist: Point; width: number }> = ({
  elbow,
  wrist,
  width,
}) => {
  const plateStart = lerpPoint(elbow, wrist, 0.28);
  const plateEnd = lerpPoint(elbow, wrist, 0.78);
  const seamAt = lerpPoint(elbow, wrist, 0.55);
  const angle = angleBetween(elbow, wrist);
  return (
    <g>
      <Limb from={plateStart} to={plateEnd} fromWidth={width * 1.14} toWidth={width * 1.02} />
      <g transform={`translate(${seamAt.x} ${seamAt.y}) rotate(${angle})`}>
        <line x1={0} y1={-width * 0.5} x2={0} y2={width * 0.5} {...DETAIL_INK} />
      </g>
    </g>
  );
};

// Part way between a resting arm and a talking one, with the small beats of a talking hand.
export function blendArm(resting: ArmPose, talking: ArmPose, pose: RobotPose): ArmPose {
  const beat = pose.gestureBeat * pose.gesture;
  const wrist = lerpPoint(resting.wrist, talking.wrist, pose.gesture);
  return {
    elbow: lerpPoint(resting.elbow, talking.elbow, pose.gesture),
    wrist: point(wrist.x + beat * 6, wrist.y + beat * 10),
    handAngle: lerp(resting.handAngle, talking.handAngle, pose.gesture) + beat * 10,
  };
}

// The far arm of a robot seen side-on: its upper arm is hidden by the body, so only the
// forearm and hand show, resting on the table.
export const ForearmOnly: React.FC<{
  elbow: Point;
  wrist: Point;
  thumbSide: 1 | -1;
  width: number;
}> = ({ elbow, wrist, thumbSide, width }) => {
  return (
    <g>
      <Limb from={elbow} to={wrist} fromWidth={width} toWidth={width * 0.85} isFar />
      <Hand
        wrist={wrist}
        angle={angleBetween(elbow, wrist)}
        open={0}
        thumbSide={thumbSide}
        size={1.05}
        isFar
      />
    </g>
  );
};

type LegProps = {
  hip: Point;
  knee: Point;
  ankle: Point;
  facing: 1 | -1;
  isFar?: boolean;
};

export const Leg: React.FC<LegProps> = ({ hip, knee, ankle, facing, isFar = false }) => {
  return (
    <g>
      <Limb from={hip} to={knee} fromWidth={54} toWidth={46} shadeSide={1} isFar={isFar} />
      <Limb from={knee} to={ankle} fromWidth={44} toWidth={36} shadeSide={-1} isFar={isFar} />
      <Joint at={knee} radius={21} />
      <Boot ankle={ankle} facing={facing} isFar={isFar} />
    </g>
  );
};

// A rounded shoulder pad over the top of the arm.
export const ShoulderCap: React.FC<{ at: Point; size?: number }> = ({ at, size = 1 }) => {
  return (
    <g transform={`translate(${at.x} ${at.y}) scale(${size})`}>
      <Panel
        d={roundedPolygonPath([point(-30, -22), point(30, -22), point(34, 12), point(-34, 12)], 16)}
        tone="lit"
      />
      <Seam d="M -24 -4 L 24 -4" />
    </g>
  );
};

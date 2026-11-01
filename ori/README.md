# Ori sandbox

Ori, one robot from our drawn (2.5D anime) conversation Shorts, on its own. This folder is a
**copy**: change anything here and the real videos stay exactly as they are. When a redesign is
approved, it gets copied back into the main project by hand (see the end of this file).

## Run it

From this folder (`sandbox/ori`):

```bash
npm run studio     # live preview: open the "ori" composition; it reloads on every save
npm run still      # one picture: out/ori.png (frame 40)
npm run render     # the 8-second clip: out/ori.mp4
npm run typecheck
npm run format
```

`node_modules` here is a link to the main project's installed packages (Remotion, React), so
nothing is downloaded twice. Only packages are shared, never code. If you copy this folder
anywhere else, delete that `node_modules` link and run `npm install` here first.

## What Ori is

- The warm, thoughtful one of the cast. Orange glow (`NIGHT.ori` in `../shared/palette.ts`).
- A boxy robot with a dark visor, two round eyes and a mouth light. It sits on a wooden stool
  and holds a mug of something steaming.
- In the conversation it sits on the far side of a round table, facing the camera. Hollis sits
  on the left and Luma on the right.
- Its voice is a calm male voice (`sceptic-1`). It talks about big questions such as death,
  space and time.

## Files

| File                        | What it is                                                                                                                   |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `src/ori/Ori.tsx`           | Ori's body: legs, boots, stool, torso, chest badge, neck, arms and mug.                                                      |
| `src/ori/OriHead.tsx`       | Ori's head: box shell, fin and status light, visor, eyes, mouth light, ear port.                                             |
| `src/shared/robotParts.tsx` | Building blocks: cel-shaded shell panels, boxes seen three-quarters on, limbs, joints, hands, boots, eyes with moods, glows. |
| `src/shared/limbs.tsx`      | Arms, legs and shoulder pads built from those blocks.                                                                        |
| `src/shared/face.tsx`       | The visor and ear port.                                                                                                      |
| `src/shared/palette.ts`     | Colours and the ink-line style.                                                                                              |
| `src/shared/geometry.ts`    | Points, easing, rounded polygons and limb outlines.                                                                          |
| `src/shared/pose.ts`        | **The contract:** what Ori is given on every frame.                                                                          |
| `src/acting/`               | The acting: who Ori looks at, blinks, mouth, gestures. Copied from the real conversation; leave as is.                       |
| `src/OriPreview.tsx`        | The preview scene: Ori talks to camera, turns to listen to Luma off screen, answers.                                         |

## The contract: keep this and the redesign drops straight into the videos

`Ori` is a React component that returns SVG, drawn in two layers so a table can sit between them:

```tsx
<Ori pose={pose} layer="body" />  // legs, stool, torso, head: behind the table
<Ori pose={pose} layer="arms" />  // arms and mug: in front of the table
```

- **Coordinates.** The origin `(0, 0)` is the top of the stool seat. y points down. At scale 1,
  Ori is about 520 px from boot soles (y ≈ 178) to the top of the head (y ≈ −500). The real
  scene places Ori at (540, 1092) in a 1080 × 1920 frame.
- **Table.** In the real scene the table top is at about y = −86 in Ori's coordinates. The
  forearms and mug rest on it, at y ≈ −100. In this preview there's no table, so the arms float.
- **Close-ups.** The real videos zoom in up to about 3× on Ori's head and chest, so details
  have to hold up close.
- **Pose.** `pose` (type `RobotPose` in `src/shared/pose.ts`) has these fields:
  - `headYaw` runs from −1 to 1 and turns the head. Ori looks at Hollis at about −0.6 and at
    Luma at about 0.6.
  - `headPitch` (nod) and `headRoll` (tilt) move the head the other ways.
  - `eyeYaw` and `eyePitch` are how far the eyes lead the head.
  - `blink` runs from 0 (open) to 1 (shut).
  - `mood` is one of `amused`, `surprised`, `sad`, `deadpan`, `thoughtful`, `warm`, `curious`,
    or null.
  - `speech` runs from 0 to 1 and opens the mouth.
  - `gesture` runs from 0 (hands resting) to 1 (talking hand up), and `gestureBeat` adds the
    small beats of a talking hand.
  - `breathing` is in pixels. `lean` is in degrees.

  The acting code works all of these out. Ori only has to show them.

- **Drawing on twos.** The pose changes every other frame, like hand-drawn anime, so don't add
  per-frame jitter. Steam from the mug is the exception: it moves on every frame on purpose.
- **Style.**
  - Ink outlines use `INK` and `DETAIL_INK` from the palette (non-scaling strokes).
  - Shells are cel shaded: lit and shade tones, plus a warm lamp glow from below and a cool
    moonlight rim on top.
  - SVG `id`s must be unique on the page. Prefix them with `ori-`.
- You can rewrite `src/ori/` and `src/shared/` freely, add files, or swap SVG for anything that
  React can render, as long as `Ori` keeps these props.

## What the user has said so far

- The 3D (Blender) version of this cast was rejected because it had no legs and was too simple.
  Judge a design as a viewer would. Check legs, joints and detail in still frames before long
  renders.
- The user wants a lasting, better design for the bots. Detail, appeal and clear expressions
  matter more than render speed.

## Other Ori attempts to look at

These are references, not used by the videos:

- `../../src/explainer/conceptCast/ori.tsx` (in the main project): a standing Ori drawn from a concept image (helmet
  sweeping back to a point, wrap-around visor, big forearms, flared boots).
- `public/codex-approved-robots/cast.png`: a painted cast image. `out/conversations/ori-concept-crop.png`
  and `concept-ori-test.png` are concept crops of Ori.
- `src/explainer/codex-approved-conversation/`: a separate version that cuts the painted image
  into puppet parts. Its README explains how.

## Bringing an approved redesign back

In the main project, the real Ori is `src/characters/ori/` and its parts are
`src/characters/shared/`. Copy `src/ori/*` and any changed `src/shared/*` files over those.
Then, from the main project, run `npm run typecheck` and render a few frames of
`conversation-c001-last-astronomers-anime`. Hollis and Luma use the main project's
`shared/` too, so check them as well.

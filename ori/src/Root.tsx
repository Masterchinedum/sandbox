// The sandbox has one composition: Ori on its own, in the vertical Shorts frame.

import { Composition } from 'remotion';
import { FRAME, ORI_PREVIEW_FRAMES, OriPreview } from './OriPreview';
import { OriDesignSheet, OriRigCheck } from './OriDesignSheet';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="ori"
        component={OriPreview}
        durationInFrames={ORI_PREVIEW_FRAMES}
        fps={FRAME.fps}
        width={FRAME.width}
        height={FRAME.height}
      />
      <Composition
        id="ori-design"
        component={OriDesignSheet}
        durationInFrames={1}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="ori-rig-check"
        component={OriRigCheck}
        durationInFrames={1}
        fps={30}
        width={1600}
        height={900}
      />
    </>
  );
};

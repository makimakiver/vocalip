import React, { useState } from 'react';
import {Composition} from 'remotion';
import MyComposition from './Composition';
 
export const RemotionRoot: React.FC = () => {

  return (
    <>
      <Composition
        id="MyComp"
        component={MyComposition}
        durationInFrames={1000}
        fps={30}
        width={300}
        height={450}
        defaultProps={{ caption: [], voiceUrl: ''}}
      />
    </>
  );
};
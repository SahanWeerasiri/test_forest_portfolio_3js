import { useGLTF } from '@react-three/drei';
import React, { useMemo } from 'react'
import WaterfallScene from '../assets/waterfall.glb'
const Waterfall = ({ ...props }) => {
    const { scene } = useGLTF(WaterfallScene);

    // Clone the scene for each instance
    const clonedScene = useMemo(() => scene.clone(true), [scene]);
    return <primitive object={clonedScene} {...props} />;
}

export default Waterfall
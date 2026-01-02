import { useGLTF } from '@react-three/drei';
import React, { useMemo } from 'react'
import rockScene from '../assets/stylized_rocks.glb'
const Rock = ({ ...props }) => {
    const { scene } = useGLTF(rockScene);

    // Clone the scene for each instance
    const clonedScene = useMemo(() => scene.clone(true), [scene]);
    return <primitive object={clonedScene} {...props} />;
}

export default Rock
import grassScene from '../assets/green_grass.glb'
import { useGLTF } from '@react-three/drei';
import { useMemo } from 'react';

const DarkGrass = (props) => {
    const { scene } = useGLTF(grassScene);
    // Clone the scene for each instance
    const clonedScene = useMemo(() => scene.clone(true), [scene]);
    return <primitive object={clonedScene} {...props} />;
}

export default DarkGrass
import treeScene from '../assets/cartoon_fallen_tree.glb'
import { useGLTF } from '@react-three/drei';
import { useMemo } from 'react';

const MagicTree = (props) => {
    const { scene } = useGLTF(treeScene);

    // Clone the scene for each instance
    const clonedScene = useMemo(() => scene.clone(true), [scene]);
    return <primitive object={clonedScene} {...props} />;
}

export default MagicTree
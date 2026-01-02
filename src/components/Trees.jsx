import treeScene from '../assets/stylized_pine_tree_tree.glb'
import { useGLTF } from '@react-three/drei';
import { useMemo } from 'react';

const Trees = (props) => {
    const { scene } = useGLTF(treeScene);
    // Clone the scene for each instance
    const clonedScene = useMemo(() => scene.clone(true), [scene]);
    return <primitive object={clonedScene} {...props} />;
}

export default Trees
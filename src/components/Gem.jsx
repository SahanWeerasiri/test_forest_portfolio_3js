import React, { useEffect, useRef } from 'react'
import testScence from '../assets/test/arch_tree_-_stylized_animated_model.glb'
import { useAnimations, useGLTF } from '@react-three/drei';

const Gem = ({ ...props }) => {
    const testRef = useRef();
    const { scene, animations } = useGLTF(testScence);
    const { actions } = useAnimations(animations, testRef);
    useEffect(() => {
        // console.log(actions);
        actions['Armature|Action'].play();
    }, [actions]);
    return (
        <mesh ref={testRef}>
            <primitive object={scene} {...props} />
        </mesh>
    )
}

export default Gem
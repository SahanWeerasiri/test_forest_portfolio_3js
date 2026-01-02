import React, { useEffect, useRef } from 'react'
import testScence from '../assets/dragon_head_cave.glb'
import { useAnimations, useGLTF } from '@react-three/drei';

const DragonCave = ({ ...props }) => {
    const testRef = useRef();
    const { scene, animations } = useGLTF(testScence);
    const { actions } = useAnimations(animations, testRef);
    useEffect(() => {
        console.log(actions);
        // actions['Armature|Action'].play();
    }, [actions]);
    return (
        <mesh ref={testRef}>
            <primitive object={scene} {...props} />
        </mesh>
    )
}

export default DragonCave
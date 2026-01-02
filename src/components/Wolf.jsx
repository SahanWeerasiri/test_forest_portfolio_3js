import React, { useEffect, useRef } from 'react'
import testScence from '../assets/fantasy_fox.glb'
import { useAnimations, useGLTF } from '@react-three/drei';

const Wolf = ({ ...props }) => {
    const testRef = useRef();
    const { scene, animations } = useGLTF(testScence);
    const { actions } = useAnimations(animations, testRef);
    useEffect(() => {
        // console.log(actions);
        actions['GltfAnimation 0'].play();
    }, [actions]);
    return (
        <mesh ref={testRef}>
            <primitive object={scene} {...props} />
        </mesh>
    )
}

export default Wolf
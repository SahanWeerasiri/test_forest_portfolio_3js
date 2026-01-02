import React, { useEffect, useRef } from 'react'
import testScence from '../assets/test/chakra.glb'
import { useAnimations, useGLTF } from '@react-three/drei';

const Chakra = ({ ...props }) => {
    const testRef = useRef();
    const { scene, animations } = useGLTF(testScence);
    const { actions } = useAnimations(animations, testRef);
    useEffect(() => {
        // console.log(actions);
        actions['Take 001'].play();
    }, [actions]);
    return (
        <mesh ref={testRef}>
            <primitive object={scene} {...props} />
        </mesh>
    )
}

export default Chakra
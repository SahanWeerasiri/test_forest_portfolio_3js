import React, { useEffect, useRef } from 'react'
import testScence from '../assets/treasure_of_the_sand_king.glb'
import { useAnimations, useGLTF } from '@react-three/drei';

const SandKing = ({ ...props }) => {
    const testRef = useRef();
    const { scene, animations } = useGLTF(testScence);
    const { actions } = useAnimations(animations, testRef);
    useEffect(() => {
        // console.log(actions);
        actions['Animation'].play();
    }, [actions]);
    return (
        <mesh ref={testRef}>
            <primitive object={scene} {...props} />
        </mesh>
    )
}

export default SandKing
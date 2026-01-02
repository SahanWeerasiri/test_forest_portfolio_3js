import React, { useRef } from 'react'
import mountainScene from '../assets/hero_mountain.glb'
import { useGLTF } from '@react-three/drei';
const Mountain = () => {
    const mountainRef = useRef();
    const { scene } = useGLTF(mountainScene);
    return (
        <mesh ref={mountainRef}>
            <primitive object={scene} scale={3} position={[-1.7, -0.3, 1.5]} rotation={[0, -Math.PI / 3 * 2, 0]} />
        </mesh>
    )
}

export default Mountain
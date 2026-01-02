import React, { useEffect, useRef, useState } from 'react'
import Mountain from './Mountain';
import Grass from './Grass';
import DarkGrass from './DarkGrass';
import Trees from './Trees';

const Land = ({ ...props }) => {
    const landRef = useRef();
    const [isDragging, setIsDragging] = useState(false);
    const [lastX, setLastX] = useState(0);
    const [lastY, setLastY] = useState(0);
    const sensitivity = 0.0001;

    const handlePointerDown = (e) => {
        setIsDragging(true);
        setLastX(e.clientX);
        setLastY(e.clientY);
    };

    const handlePointerUp = () => {
        setIsDragging(false);
    };

    const handlePointerMove = (e) => {
        if (!isDragging) return;
        const deltaX = e.clientX - lastX;
        const deltaY = e.clientY - lastY;
        setLastX(e.clientX);
        setLastY(e.clientY);
        if (landRef.current) {
            const newYRotation = landRef.current.rotation.y + deltaX * sensitivity;
            landRef.current.rotation.y = newYRotation;
            const newXRotation = landRef.current.rotation.x + deltaY * sensitivity;
            if (0.5 < newXRotation && newXRotation < 1.5) {
                landRef.current.rotation.x = newXRotation;
            }
        }
    };

    useEffect(() => {
        window.addEventListener('pointerdown', handlePointerDown);
        window.addEventListener('pointerup', handlePointerUp);
        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('wheel', handleWheel);

        return () => {
            window.removeEventListener('pointerdown', handlePointerDown);
            window.removeEventListener('pointerup', handlePointerUp);
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('wheel', handleWheel);
        };
    }, [isDragging]);

    // Zoom handler
    const handleWheel = (e) => {
        if (landRef.current) {
            let scale = landRef.current.scale.x - e.deltaY * 0.001;
            scale = Math.max(1.5, Math.min(2, scale)); // Clamp scale between 1 and 2
            landRef.current.scale.set(scale, scale, scale);
        }
    };

    // Array of grass positions
    const grassPositions = [
        [2.2, 0, 0],
        [0.5, 0, 0.5],
        [0.3, 0, -1],
        [-0.5, 0, -1.5],
        [0.8, 0, 1.5],
        [1.8, 0, -1.5]
    ];
    const grassScales = [0.03, 0.06, 0.06, 0.065, 0.09, 0.06];
    const grassRotations = [[0, 1, 0], [0, 0.2, 0], [0, 2.2, 0], [0, 0.6, 0], [0, 1, 0], [0, 0, 0]];

    return (
        <mesh
            ref={landRef}
            {...props}
        >
            <Mountain />
            {grassPositions.map((pos, i) => (
                <Grass key={i} position={pos} scale={grassScales[i]} rotation={grassRotations[i]} />
            ))}
            <DarkGrass position={[1, 0.2, -1]} scale={0.6} rotation={[0, 0, 0]} />
            <DarkGrass position={[1, 0.2, 1.5]} scale={0.6} rotation={[0, 0, 0]} />
            <DarkGrass position={[-1, 0.2, -1]} scale={0.6} rotation={[0, 0, 0]} />

            <Trees position={[0, 0, 1]} scale={0.8} rotation={[0, Math.PI / 4, 0]} />

            <boxGeometry args={[5, 0.1, 5]} />
            <meshStandardMaterial color="green" />
        </mesh>
    );
}

export default Land
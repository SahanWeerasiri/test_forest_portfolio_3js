import React, { useEffect, useRef, useState } from 'react'
import Mountain from './Mountain';
import Grass from './Grass';
import DarkGrass from './DarkGrass';
import Trees from './Trees';
import Fox from './Fox';
import MagicTree from './MagicTree';
import InfoBox from './InfoBox';
import * as THREE from 'three';
import Rock from './Rock';
import Waterfall from './Waterfall';

// Debug mode toggle
const DEBUG_COLLISION = true;

const GroundGrass = ({ SPECIAL_OBJECTS, setFoxLocation, infoBoxesStates, setInfoBoxesStates, ...props }) => {
    const landRef = useRef();
    const [isDragging, setIsDragging] = useState(false);
    const [lastX, setLastX] = useState(0);
    const [lastY, setLastY] = useState(0);
    const sensitivity = 0.0001;
    // Fence tree positions (big and small)
    const fenceRadius = 12; // half of 15x15
    const fenceCount = 36; // number of trees per side
    const fencePositions = [];
    // Top and bottom
    for (let i = 0; i < fenceCount; i++) {
        const x = -fenceRadius + (i * (fenceRadius * 2 / (fenceCount - 1)));
        fencePositions.push([x, 0, -fenceRadius]); // top
        fencePositions.push([x, 0, fenceRadius]); // bottom
    }
    // Left and right
    for (let i = 1; i < fenceCount - 1; i++) {
        const z = -fenceRadius + (i * (fenceRadius * 2 / (fenceCount - 1)));
        fencePositions.push([-fenceRadius, 0, z]); // left
        fencePositions.push([fenceRadius, 0, z]); // right
    }

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
            scale = Math.max(1, Math.min(2, scale)); // Clamp scale between 1 and 2
            landRef.current.scale.set(scale, scale, scale);
        }
    };
    return (
        <mesh
            ref={landRef}
            {...props}
        >
            {/* Debug: visualize collision objects */}
            {DEBUG_COLLISION && SPECIAL_OBJECTS.map((obj, i) => {
                if (obj.type === 'circle') {
                    return (
                        <mesh key={i} position={obj.position}>
                            <sphereGeometry args={[obj.radius, 16, 16]} />
                            <meshBasicMaterial color="red" wireframe transparent opacity={0.5} />
                        </mesh>
                    );
                } else if (obj.type === 'box') {
                    // Calculate center and size
                    const size = [
                        Math.abs(obj.max.x - obj.min.x),
                        Math.abs(obj.max.y - obj.min.y) || 0.1,
                        Math.abs(obj.max.z - obj.min.z)
                    ];
                    const center = [
                        (obj.min.x + obj.max.x) / 2,
                        (obj.min.y + obj.max.y) / 2,
                        (obj.min.z + obj.max.z) / 2
                    ];
                    return (
                        <mesh key={i} position={center}>
                            <boxGeometry args={size} />
                            <meshBasicMaterial color="blue" wireframe transparent opacity={0.5} />
                        </mesh>
                    );
                }
                return null;
            })}

            {/* Fence trees (big and small) */}
            {fencePositions.map((pos, i) => (
                <Trees
                    key={`fence-tree-${i}`}
                    position={pos}
                    scale={i % 3 === 0 ? 0.008 : 0.004}
                    rotation={[0, 0, 0]}
                />
            ))}
            <MagicTree position={[9, 0, 0]} scale={0.005} rotation={[0, 0, 0]} />
            <Rock position={[0, 0, 7]} scale={0.15} rotation={[0, 0, 0]} />
            <Waterfall position={[7, -0.1, 8]} scale={0.08} rotation={[0, 0, 0.1]} />

            {/* Trees scattered around the land */}
            {[
                [15, 0, 10], [-12, 0, 8], [8, 0, -15], [-10, 0, -12],
                [20, 0, -5], [-18, 0, 3], [5, 0, 18], [-8, 0, 16],
                [12, 0, -20], [-15, 0, -18], [22, 0, 8], [-20, 0, -8],
                [3, 0, -25], [-25, 0, 5], [18, 0, 22], [-22, 0, 18],
                [25, 0, -12], [-16, 0, 25], [14, 0, -18], [-14, 0, 20],
                [30, 0, 0], [-30, 0, 0], [0, 0, 30], [0, 0, -30],
                [25, 0, 25], [-25, 0, -25], [25, 0, -25], [-25, 0, 25]
            ].map((pos, i) => (
                <Trees
                    key={i}
                    position={pos.map(coord => coord / 5)}
                    scale={0.003}
                    rotation={[0, 0, 0]}
                />
            ))}

            {Array.from({ length: 10 }, (_, i) => (i - 3) * 2.4).flatMap(i =>
                Array.from({ length: 10 }, (_, j) => (j - 2) * 2.4).map(j =>
                    <DarkGrass
                        key={`${i},${j}`}
                        position={[i, 0.15, j]}
                        scale={0.5}
                        rotation={[0, 0, 0]}
                    />
                )
            )}

            <Fox debug={true} position={[0, 0.25, 0]} scale={0.05} rotation={[0, 0, 0]} SPECIAL_OBJECTS={SPECIAL_OBJECTS} setFoxLocation={setFoxLocation} />

            {/* InfoBox components - positioned relative to the scene */}
            {SPECIAL_OBJECTS.map((obj, index) => (
                <InfoBox
                    key={index}
                    info={obj.info}
                    link={obj.link}
                    position={[obj.position_info.x, 1, obj.position_info.z]}
                    visible={infoBoxesStates?.[index] || false}
                    onClose={() => {
                        if (setInfoBoxesStates) {
                            setInfoBoxesStates((prevStates) => {
                                const newStates = [...prevStates];
                                newStates[index] = false;
                                return newStates;
                            });
                        }
                    }}
                />
            ))}

            {/* <DarkGrass position={[0, 0.3, 0]} scale={1} rotation={[0, 0, 0]} /> */}
            {/* <DarkGrass position={[1, 0.2, 1.5]} scale={1} rotation={[0, 0, 0]} />
            <DarkGrass position={[-1, 0.2, -1]} scale={1} rotation={[0, 0, 0]} /> */}

            {/* <Trees position={[0, 0, 1]} scale={0.8} rotation={[0, Math.PI / 4, 0]} /> */}

            <boxGeometry args={[100, 0.1, 100]} />
            <meshStandardMaterial color="green" />
        </mesh>
    );
}

export default GroundGrass
import React, { useEffect, useRef, useState } from 'react'
import DarkGrass from './DarkGrass';
import Trees from './Trees';
import Fox from './Fox';
import MagicTree from './MagicTree';
import InfoBox from './InfoBox';
import Rock from './Rock';
import Waterfall from './Waterfall';
import Wolf from './Wolf';
import Butterfly from './Butterfly';
import MonsterInn from './MonsterInn';
import SandKing from './SandKing';
import Snake1 from './Snake1';
import Gem from './Gem';
import Snake2 from './Snake2';
import Luna from './Luna';
import DragonCave from './DragonCave';
import Griffin from './Griffin';
import Chakra from './Chakra';

// Debug mode toggle
const DEBUG_COLLISION = false;

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
    const fenceAdditionalPositions = [];
    // Top and bottom
    for (let i = 0; i < fenceCount; i++) {
        const x = -fenceRadius + (i * (fenceRadius * 2 / (fenceCount - 1)));
        fencePositions.push([x, 0, -fenceRadius]); // top
        fencePositions.push([x, 0, fenceRadius]); // bottom
        fenceAdditionalPositions.push([x, 0, -fenceRadius - 1.5]); // top additional
        fenceAdditionalPositions.push([x, 0, fenceRadius + 1.5]); // bottom additional
    }
    // Left and right
    for (let i = 1; i < fenceCount - 1; i++) {
        const z = -fenceRadius + (i * (fenceRadius * 2 / (fenceCount - 1)));
        fencePositions.push([-fenceRadius, 0, z]); // left
        fencePositions.push([fenceRadius, 0, z]); // right
        fenceAdditionalPositions.push([-fenceRadius - 1.5, 0, z]); // left additional
        fenceAdditionalPositions.push([fenceRadius + 1.5, 0, z]); // right additional
    }

    // add additional corner trees
    fenceAdditionalPositions.push([-fenceRadius - 1.3, 0, -fenceRadius - 1]);
    fenceAdditionalPositions.push([fenceRadius + 1.3, 0, -fenceRadius - 1]);
    fenceAdditionalPositions.push([-fenceRadius - 1.3, 0, fenceRadius + 1]);
    fenceAdditionalPositions.push([fenceRadius + 1.3, 0, fenceRadius + 1]);

    // Touch drag and pinch zoom support
    const touchState = useRef({ dragging: false, lastX: 0, lastY: 0, pinchDist: null, startScale: 1 });

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
            if (0.15 < newXRotation && newXRotation < 1.1) {
                landRef.current.rotation.x = newXRotation;
            }
        }
    };

    // Touch events
    const handleTouchStart = (e) => {
        if (window.__foxTouchActive) return;
        if (e.touches.length === 1) {
            touchState.current.dragging = true;
            touchState.current.lastX = e.touches[0].clientX;
            touchState.current.lastY = e.touches[0].clientY;
        } else if (e.touches.length === 2) {
            // Pinch zoom
            const dx = e.touches[0].clientX - e.touches[1].clientX;
            const dy = e.touches[0].clientY - e.touches[1].clientY;
            touchState.current.pinchDist = Math.sqrt(dx * dx + dy * dy);
            touchState.current.startScale = landRef.current ? landRef.current.scale.x : 1;
        }
    };
    const handleTouchMove = (e) => {
        if (window.__foxTouchActive) return;
        if (e.touches.length === 1 && touchState.current.dragging) {
            const deltaX = e.touches[0].clientX - touchState.current.lastX;
            const deltaY = e.touches[0].clientY - touchState.current.lastY;
            touchState.current.lastX = e.touches[0].clientX;
            touchState.current.lastY = e.touches[0].clientY;
            if (landRef.current) {
                const newYRotation = landRef.current.rotation.y + deltaX * sensitivity;
                landRef.current.rotation.y = newYRotation;
                const newXRotation = landRef.current.rotation.x + deltaY * sensitivity;
                if (0.15 < newXRotation && newXRotation < 1.1) {
                    landRef.current.rotation.x = newXRotation;
                }
            }
        } else if (e.touches.length === 2 && landRef.current) {
            // Pinch zoom
            const dx = e.touches[0].clientX - e.touches[1].clientX;
            const dy = e.touches[0].clientY - e.touches[1].clientY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (touchState.current.pinchDist) {
                let scale = touchState.current.startScale * (dist / touchState.current.pinchDist);
                scale = Math.max(1, Math.min(2, scale));
                landRef.current.scale.set(scale, scale, scale);
            }
        }
    };
    const handleTouchEnd = (e) => {
        if (window.__foxTouchActive) return;
        touchState.current.dragging = false;
        touchState.current.pinchDist = null;
    };

    useEffect(() => {
        window.addEventListener('pointerdown', handlePointerDown);
        window.addEventListener('pointerup', handlePointerUp);
        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('wheel', handleWheel);
        window.addEventListener('touchstart', handleTouchStart);
        window.addEventListener('touchmove', handleTouchMove);
        window.addEventListener('touchend', handleTouchEnd);

        return () => {
            window.removeEventListener('pointerdown', handlePointerDown);
            window.removeEventListener('pointerup', handlePointerUp);
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('wheel', handleWheel);
            window.removeEventListener('touchstart', handleTouchStart);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleTouchEnd);
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
            {/*Boundry additional */}
            {fenceAdditionalPositions.map((pos, i) => (
                <Trees
                    key={`fence-tree-additional-${i}`}
                    position={pos}
                    scale={0.02}
                    rotation={[0, 0, 0]}
                />
            ))}
            <MagicTree position={[9, 0, 0]} scale={0.005} rotation={[0, 0, 0]} />
            <Rock position={[0, 0, 7]} scale={0.15} rotation={[0, 0, 0]} />
            <Waterfall position={[7, -0.1, 8]} scale={0.08} rotation={[0, 0, 0.1]} />
            <MonsterInn position={[-7, 0.15, 9.5]} scale={0.007} rotation={[0, Math.PI / 6 * 5, 0]} />
            <SandKing position={[10, 0.2, -10]} scale={0.8} rotation={[0, -Math.PI / 4, 0]} />
            <Gem position={[-10, 0.5, -10]} scale={0.2} rotation={[0, Math.PI / 4, 0]} />
            <DragonCave position={[-9, 0.4, 9]} scale={0.3} rotation={[0, -Math.PI / 4, 0]} />
            <Chakra position={[-9, 0.2, 0]} scale={0.5} rotation={[0, 0, 0]} />
            {/* Trees scattered around the land */}
            {[
                [15, 0, 10], [-12, 0, 8], [8, 0, -15], [-10, 0, -12],
                [20, 0, -5], [-18, 0, 3], [5, 0, 18], [-8, 0, 16],
                [12, 0, -20], [-15, 0, -18], [22, 0, 8], [-20, 0, -8],
                [3, 0, -25], [-25, 0, 5], [18, 0, 22], [-22, 0, 18],
                [25, 0, -12], [-16, 0, 25], [14, 0, -18], [-14, 0, 20],
                [30, 0, 0], [-30, 0, 0], [0, 0, 30], [0, 0, -30],
                [25, 0, 25], [-25, 0, -25],
            ].map((pos, i) => (
                <Trees
                    key={i}
                    position={pos.map(coord => coord / 3)}
                    scale={0.003}
                    rotation={[0, 0, 0]}
                />
            ))}

            {Array.from({ length: 14 }, (_, i) => (i - 6) * 2.4).flatMap(i =>
                Array.from({ length: 14 }, (_, j) => (j - 6) * 2.4).map(j =>
                    <DarkGrass
                        key={`${i},${j}`}
                        position={[i, 0.15, j]}
                        scale={0.5}
                        rotation={[0, 0, 0]}
                    />
                )
            )}

            <Fox debug={true} position={[0, 0.25, 0]} scale={0.05} rotation={[0, 0, 0]} SPECIAL_OBJECTS={SPECIAL_OBJECTS} setFoxLocation={setFoxLocation} />
            <Wolf position={[5, 0.1, 8]} scale={0.015} rotation={[0, Math.PI / 3, 0]} />
            <Butterfly position={[10, 0.8, -1]} scale={0.15} rotation={[0, -Math.PI / 6, 0]} />
            <Snake1 position={[9.2, 0.15, -9.2]} scale={0.02} rotation={[0, -Math.PI / 4 * 3, 0]} />
            <Snake2 position={[-9.8, 0.6, -9.8]} scale={0.35} rotation={[0, -Math.PI / 4, 0]} />
            <Luna position={[-9, 0.5, 0]} scale={1.2} rotation={[0, Math.PI / 2, 0]} />
            <Griffin position={[1.2, 0.6, 7]} scale={0.3} rotation={[0, Math.PI, 0]} />
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
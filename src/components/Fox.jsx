import React, { useEffect, useRef } from 'react'
import foxScene from '../assets/fox.glb'
import { useAnimations, useGLTF } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const Fox = ({ SPECIAL_OBJECTS, setFoxLocation, ...props }) => {
    const { scene, animations } = useGLTF(foxScene);
    const foxRef = useRef();
    const { actions } = useAnimations(animations, foxRef);
    const { camera } = useThree();
    // Camera follow offset (behind and above the fox)
    const cameraOffset = { x: 0, y: 1, z: 2.5 };
    // Camera follow logic
    useFrame(() => {
        if (foxRef.current) {
            // Get fox world position
            const fox = foxRef.current;
            const foxWorldPos = fox.getWorldPosition(new THREE.Vector3());
            // Camera stays at a fixed offset (does not rotate with fox)
            camera.position.x = foxWorldPos.x + cameraOffset.x;
            camera.position.y = foxWorldPos.y + cameraOffset.y;
            camera.position.z = foxWorldPos.z + cameraOffset.z;
            camera.lookAt(foxWorldPos.x, foxWorldPos.y + 0.2, foxWorldPos.z);
        }
    });
    const stepRef = useRef(0.02);
    // Move fox with arrow keys
    const lastFoxPosRef = useRef(new THREE.Vector3());
    const actionsRef = useRef(actions);
    const updateTimeoutRef = useRef(null);
    // }, [actions]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!foxRef.current) return;

            let positionChanged = false;

            const isArrow = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key);
            if (isArrow) {
                if (e.shiftKey) {
                    actionsRef.current['hit']?.play();
                    stepRef.current = 0.04;
                } else {
                    actionsRef.current['walk']?.play();
                    stepRef.current = 0.02;
                }
            }

            const rotateStep = Math.PI / 96;
            let nextX = foxRef.current.position.x;
            let nextZ = foxRef.current.position.z;
            const angle = foxRef.current.rotation.y;
            if (e.key === 'ArrowUp') {
                nextX += Math.sin(angle) * stepRef.current;
                nextZ += Math.cos(angle) * stepRef.current;
            }
            if (e.key === 'ArrowDown') {
                nextX -= Math.sin(angle) * stepRef.current;
                nextZ -= Math.cos(angle) * stepRef.current;
            }
            // Collision detection: check if next position is too close to any special object
            let blocked = false;
            for (const obj of SPECIAL_OBJECTS) {
                if (obj.type === 'circle') {
                    const dist = Math.sqrt(
                        (nextX - obj.position.x) ** 2 +
                        (foxRef.current.position.y - obj.position.y) ** 2 +
                        (nextZ - obj.position.z) ** 2
                    );
                    if (dist < obj.radius) {
                        blocked = true;
                        break;
                    }
                } else if (obj.type === 'box') {
                    if (
                        nextX >= obj.min.x && nextX <= obj.max.x &&
                        foxRef.current.position.y >= obj.min.y && foxRef.current.position.y <= obj.max.y &&
                        nextZ >= obj.min.z && nextZ <= obj.max.z
                    ) {
                        blocked = true;
                        break;
                    }
                }
            }
            if (!blocked) {
                if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                    foxRef.current.position.x = nextX;
                    foxRef.current.position.z = nextZ;
                    positionChanged = true;
                }
            }
            if (e.key === 'ArrowLeft') {
                foxRef.current.rotation.y += rotateStep;
                positionChanged = true;
            }
            if (e.key === 'ArrowRight') {
                foxRef.current.rotation.y -= rotateStep;
                positionChanged = true;
            }

            // Only update fox location if changed and value is different
            if (positionChanged) {
                const newPos = foxRef.current.position.clone();
                // Only update if newPos is different from last
                if (!lastFoxPosRef.current.equals(newPos)) {
                    // Clear any pending timeout
                    if (updateTimeoutRef.current) {
                        clearTimeout(updateTimeoutRef.current);
                    }
                    // Throttle the update to prevent infinite loops
                    updateTimeoutRef.current = setTimeout(() => {
                        setFoxLocation(newPos);
                        lastFoxPosRef.current.copy(newPos);
                        updateTimeoutRef.current = null;
                    }, 10);
                }
            }
        }

        const handleKeyUp = (e) => {
            if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
                actionsRef.current['walk']?.stop();
                actionsRef.current['hit']?.stop();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };

    }, []); // Remove actions dependency

    return (
        <mesh ref={foxRef}>
            <primitive object={scene} {...props} />
        </mesh>
    )
}

export default Fox
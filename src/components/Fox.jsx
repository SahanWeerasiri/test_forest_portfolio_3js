import React, { useEffect, useRef } from 'react'
import foxScene from '../assets/fox.glb'
import { useAnimations, useGLTF } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Shared flag to coordinate touch ownership between fox and land
window.__foxTouchActive = false;

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
        // Helper to move fox by drag delta
        const dragFox = (dx, dy) => {
            if (!foxRef.current) return;
            // Move in local forward/backward direction (z axis)
            const angle = foxRef.current.rotation.y;
            // Project drag to forward/backward and left/right
            const forward = -(dy) * 0.01; // negative because screen y increases down
            const strafe = dx * 0.01;
            // Calculate new position
            let nextX = foxRef.current.position.x + Math.sin(angle) * forward + Math.cos(angle) * strafe;
            let nextZ = foxRef.current.position.z + Math.cos(angle) * forward - Math.sin(angle) * strafe;
            // Collision detection
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
                foxRef.current.position.x = nextX;
                foxRef.current.position.z = nextZ;
                const newPos = foxRef.current.position.clone();
                if (!lastFoxPosRef.current.equals(newPos)) {
                    if (updateTimeoutRef.current) {
                        clearTimeout(updateTimeoutRef.current);
                    }
                    updateTimeoutRef.current = setTimeout(() => {
                        setFoxLocation(newPos);
                        lastFoxPosRef.current.copy(newPos);
                        updateTimeoutRef.current = null;
                    }, 10);
                }
            }
        };

        // Helper to check if touch is near fox
        const isTouchNearFox = (clientX, clientY) => {
            if (!foxRef.current) return false;
            // Project fox position to screen
            const foxPos = foxRef.current.getWorldPosition(new THREE.Vector3());
            const canvas = document.querySelector('canvas');
            if (!canvas) return false;
            const rect = canvas.getBoundingClientRect();
            // Use camera from useThree
            const { x, y, z } = foxPos;
            const vector = new THREE.Vector3(x, y, z);
            camera.updateMatrixWorld();
            vector.project(camera);
            // Convert to screen coordinates
            const screenX = ((vector.x + 1) / 2) * rect.width + rect.left;
            const screenY = ((-vector.y + 1) / 2) * rect.height + rect.top;
            // Calculate distance in pixels
            const dist = Math.sqrt((clientX - screenX) ** 2 + (clientY - screenY) ** 2);
            // Convert fox radius (0.8 world units) to pixels (approximate)
            // Assume 1 world unit ~ 50px (tweak as needed)
            const radiusPx = 0.8 * 50;
            return dist < radiusPx;
        };

        // Keyboard
        const moveFox = (direction, shift = false) => {
            if (!foxRef.current) return;
            let positionChanged = false;
            if (shift) {
                actionsRef.current['hit']?.play();
                stepRef.current = 0.04;
            } else {
                actionsRef.current['walk']?.play();
                stepRef.current = 0.02;
            }
            const rotateStep = Math.PI / 96;
            let nextX = foxRef.current.position.x;
            let nextZ = foxRef.current.position.z;
            const angle = foxRef.current.rotation.y;
            if (direction === 'up') {
                nextX += Math.sin(angle) * stepRef.current;
                nextZ += Math.cos(angle) * stepRef.current;
            }
            if (direction === 'down') {
                nextX -= Math.sin(angle) * stepRef.current;
                nextZ -= Math.cos(angle) * stepRef.current;
            }
            // Collision detection
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
                if (direction === 'up' || direction === 'down') {
                    foxRef.current.position.x = nextX;
                    foxRef.current.position.z = nextZ;
                    positionChanged = true;
                }
            }
            if (direction === 'left') {
                foxRef.current.rotation.y += rotateStep;
                positionChanged = true;
            }
            if (direction === 'right') {
                foxRef.current.rotation.y -= rotateStep;
                positionChanged = true;
            }
            if (positionChanged) {
                const newPos = foxRef.current.position.clone();
                if (!lastFoxPosRef.current.equals(newPos)) {
                    if (updateTimeoutRef.current) {
                        clearTimeout(updateTimeoutRef.current);
                    }
                    updateTimeoutRef.current = setTimeout(() => {
                        setFoxLocation(newPos);
                        lastFoxPosRef.current.copy(newPos);
                        updateTimeoutRef.current = null;
                    }, 10);
                }
            }
        };

        const handleKeyDown = (e) => {
            if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
                moveFox(e.key.replace('Arrow', '').toLowerCase(), e.shiftKey);
            }
        };
        const handleKeyUp = (e) => {
            if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
                actionsRef.current['walk']?.stop();
                actionsRef.current['hit']?.stop();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        // Touch drag for fox
        let foxDragActive = false;
        let foxDragLastX = null;
        let foxDragLastY = null;

        const handleTouchStart = (e) => {
            if (e.touches.length === 1) {
                const x = e.touches[0].clientX;
                const y = e.touches[0].clientY;
                if (isTouchNearFox(x, y)) {
                    foxDragActive = true;
                    window.__foxTouchActive = true;
                    foxDragLastX = x;
                    foxDragLastY = y;
                    actionsRef.current['walk']?.play();
                } else {
                    foxDragActive = false;
                    window.__foxTouchActive = false;
                }
            }
        };
        const handleTouchMove = (e) => {
            if (foxDragActive && e.touches.length === 1) {
                const x = e.touches[0].clientX;
                const y = e.touches[0].clientY;
                const dx = x - foxDragLastX;
                const dy = y - foxDragLastY;
                foxDragLastX = x;
                foxDragLastY = y;
                dragFox(dx, dy);
            }
        };
        const handleTouchEnd = (e) => {
            if (foxDragActive) {
                foxDragActive = false;
                window.__foxTouchActive = false;
                actionsRef.current['walk']?.stop();
                actionsRef.current['hit']?.stop();
            }
        };

        window.addEventListener('touchstart', handleTouchStart);
        window.addEventListener('touchmove', handleTouchMove);
        window.addEventListener('touchend', handleTouchEnd);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            window.removeEventListener('touchstart', handleTouchStart);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleTouchEnd);
        };
    }, []);

    return (
        <mesh ref={foxRef}>
            <primitive object={scene} {...props} />
        </mesh>
    )
}

export default Fox
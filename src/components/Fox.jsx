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
        // Helper to move fox by direction
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

        // Keyboard
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

        // Touch swipe
        let touchStartX = null;
        let touchStartY = null;
        let touchStartTime = null;
        const minSwipeDist = 30;
        const maxSwipeTime = 500;
        const handleTouchStart = (e) => {
            if (e.touches.length === 1) {
                touchStartX = e.touches[0].clientX;
                touchStartY = e.touches[0].clientY;
                touchStartTime = Date.now();
            }
        };
        const handleTouchEnd = (e) => {
            if (touchStartX === null || touchStartY === null) return;
            const touch = e.changedTouches[0];
            const dx = touch.clientX - touchStartX;
            const dy = touch.clientY - touchStartY;
            const dt = Date.now() - touchStartTime;
            if (dt > maxSwipeTime) return;
            if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > minSwipeDist) {
                // Horizontal swipe
                if (dx > 0) moveFox('right');
                else moveFox('left');
            } else if (Math.abs(dy) > minSwipeDist) {
                // Vertical swipe
                if (dy > 0) moveFox('down');
                else moveFox('up');
            }
            touchStartX = null;
            touchStartY = null;
            touchStartTime = null;
        };
        window.addEventListener('touchstart', handleTouchStart);
        window.addEventListener('touchend', handleTouchEnd);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            window.removeEventListener('touchstart', handleTouchStart);
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
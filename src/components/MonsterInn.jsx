import React, { useEffect, useRef } from 'react'
import testScence from '../assets/new/icy_dragon.glb'
import { useAnimations, useGLTF } from '@react-three/drei';

const MonsterInn = ({ ...props }) => {
    const testRef = useRef();
    const { scene, animations } = useGLTF(testScence);
    const { actions } = useAnimations(animations, testRef);
    const stopTime = 8; // when the play time is 5 sec, stop the play and restart from beginning
    const startTime = 2.5; // Set your desired start time here (in seconds)
    // Play animation from startTime to stopTime, then loop
    const playAnimationForDuration = (action, startTime, stopTime) => {
        if (!action) return;
        const duration = stopTime - startTime;
        const play = () => {
            action.reset();
            action.time = startTime;
            action.play();
        };
        play();
        return setInterval(() => {
            action.stop();
            play();
        }, duration * 1000);
    };

    useEffect(() => {
        // Try to use the named action, else fallback to first available
        let action = actions['Take 001'];
        if (!action) {
            const keys = Object.keys(actions);
            if (keys.length > 0) action = actions[keys[0]];
        }
        let intervalId;
        if (action) {
            intervalId = playAnimationForDuration(action, startTime, stopTime);
        }
        return () => {
            if (intervalId) clearInterval(intervalId);
            if (action) action.stop();
        };
    }, [actions, startTime, stopTime]);
    return (
        <mesh ref={testRef}>
            <primitive object={scene} {...props} />
        </mesh>
    )
}

export default MonsterInn
import { Canvas, useThree } from '@react-three/fiber';
import Land from '../components/Land';
import GroundGrass from '../components/GroundGrass';
import * as THREE from 'three';
import { useState, useRef, useEffect } from 'react';
import InfoBox from '../components/InfoBox';

const SPECIAL_OBJECTS = [
    { type: 'box', min: new THREE.Vector3(10.6, 0, -1.2), max: new THREE.Vector3(12.7, 1, -0.5), info: "MagicTree", link: "www.google.com", position_info: new THREE.Vector3(12, 0, -1), radius_info: 4 },
    { type: 'circle', position: new THREE.Vector3(0, 0, 7), radius: 0.5, info: "Rock", link: "www.google.com", position_info: new THREE.Vector3(0, 0, 7), radius_info: 4 },
    { type: 'circle', position: new THREE.Vector3(7, -0.1, 8), radius: 1.5, info: "Mountain", link: "www.google.com", position_info: new THREE.Vector3(7, 0, 8), radius_info: 4 },
];

const Home = () => {
    const [foxLocation, setFoxLocation] = useState(new THREE.Vector3(0, 0, 0));
    const [infoBoxesStates, setInfoBoxesStates] = useState(
        SPECIAL_OBJECTS.map(() => false)
    );
    useEffect(() => {
        // Compute new infoBoxesStates array based on foxLocation and SPECIAL_OBJECTS
        const newStates = SPECIAL_OBJECTS.map((obj) => {
            const foxPos = foxLocation;
            const objRadius = obj.radius_info;
            const objPos = obj.position_info;
            const distance = foxPos.distanceTo(objPos);
            return distance <= objRadius;
        });
        // Only update state if changed
        setInfoBoxesStates((prevStates) => {
            const changed = prevStates.some((v, i) => v !== newStates[i]);
            return changed ? newStates : prevStates;
        });
    }, [foxLocation]);

    return (
        <div className="w-full h-screen bg-blue-200" style={{ position: 'relative' }}>
            <Canvas
                camera={{
                    near: 0.1,
                    far: 8, // Increased far plane
                    position: [0, 10, 20] // Optional: Set a better camera position
                }}
                style={{ display: 'block' }}
            >
                <directionalLight position={[10, 10, 5]} intensity={1} />
                <ambientLight intensity={1.5} />
                <GroundGrass
                    position={[0, 0, 0]}
                    rotation={[0.5, 0.8, 0]}
                    SPECIAL_OBJECTS={SPECIAL_OBJECTS}
                    setFoxLocation={setFoxLocation}
                    infoBoxesStates={infoBoxesStates}
                    setInfoBoxesStates={setInfoBoxesStates}
                />
            </Canvas>

            {/* {SPECIAL_OBJECTS.map((obj, index) => (
                <InfoBox
                    key={index}
                    info={obj.info}
                    link={obj.link}
                    position={{ x: window.innerWidth / 2, y: window.innerHeight / 2 - 100 - index * 120 }}
                    visible={infoBoxesStates[index]}
                    onClose={() => {
                        setInfoBoxesStates((prevStates) => {
                            const newStates = [...prevStates];
                            newStates[index] = false;
                            return newStates;
                        });
                    }}
                />
            ))} */}
        </div>
    );
}

export default Home;
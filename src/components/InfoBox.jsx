import React, { useRef, useEffect, useState } from 'react';
import { Html } from '@react-three/drei';

const InfoBox = ({ info, link, position, visible, onClose }) => {
    // Animation state: 'enter', 'exit', or ''
    const [animState, setAnimState] = useState('');

    useEffect(() => {
        if (visible) {
            setAnimState('enter');
        } else if (animState === 'enter') {
            setAnimState('exit');
            // Remove after animation duration
            const timeout = setTimeout(() => setAnimState(''), 350);
            return () => clearTimeout(timeout);
        }
    }, [visible]);

    // Ensure position is a plain array, not a THREE.Vector3
    const meshPosition = Array.isArray(position) ? position : [position.x, position.y, position.z];
    if (!visible && animState !== 'exit') return null;

    return (
        <mesh position={meshPosition}>
            <boxGeometry args={[1.6, 0.7, 0.05]} />
            <meshStandardMaterial color={0xffffff} transparent opacity={0} />
            <Html center style={{ pointerEvents: 'auto' }}>
                <div
                    className={`info-box ${animState === 'enter' ? 'popup-enter' : ''}${animState === 'exit' ? ' popup-exit' : ''}`}
                    style={{
                        position: 'relative',
                        background: 'rgba(255,255,255,0.25)',
                        borderRadius: '18px',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
                        padding: '1.5rem 2rem',
                        minWidth: 260,
                        backdropFilter: 'blur(12px)',
                        border: '1.5px solid rgba(255,255,255,0.35)',
                        color: '#222',
                        overflow: 'hidden',
                        transition: 'box-shadow 0.3s',
                        animation: animState === 'enter' ? 'scaleFadeIn 0.35s cubic-bezier(.4,2,.6,1)' :
                            animState === 'exit' ? 'scaleFadeOut 0.35s cubic-bezier(.4,2,.6,1)' : 'none',
                        pointerEvents: 'auto',
                    }}
                >
                    <div style={{ fontWeight: 800, fontSize: 24, marginBottom: 10, letterSpacing: 0.5, color: '#222', textShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                        {info}
                    </div>
                    <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            color: '#ffffff',
                            textDecoration: 'none',
                            fontWeight: 600,
                            fontSize: 18,
                            background: 'rgba(37,99,235,0.08)',
                            padding: '6px 14px',
                            borderRadius: '8px',
                            boxShadow: '0 2px 8px rgba(37,99,235,0.08)',
                            transition: 'background 0.2s',
                            display: 'inline-block',
                            marginBottom: 6
                        }}
                        onMouseOver={e => e.currentTarget.style.background = 'rgba(37,99,235,0.18)'}
                        onMouseOut={e => e.currentTarget.style.background = 'rgba(37,99,235,0.08)'}
                    >
                        Learn More
                    </a>
                    <style>{`
                        @keyframes scaleFadeIn {
                            0% {
                                opacity: 0;
                                transform: scale(0.7) translateY(20px);
                            }
                            60% {
                                opacity: 1;
                                transform: scale(1.05) translateY(-4px);
                            }
                            100% {
                                opacity: 1;
                                transform: scale(1) translateY(0);
                            }
                        }
                        @keyframes scaleFadeOut {
                            0% {
                                opacity: 1;
                                transform: scale(1) translateY(0);
                            }
                            100% {
                                opacity: 0;
                                transform: scale(0.7) translateY(20px);
                            }
                        }
                    `}</style>
                </div>
            </Html>
        </mesh>
    );
};

export default InfoBox;

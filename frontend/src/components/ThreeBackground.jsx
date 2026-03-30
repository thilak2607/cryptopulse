import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, Float, MeshDistortMaterial } from '@react-three/drei';

function ElegantOrb({ position, speed, size }) {
  const meshRef = useRef();

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    meshRef.current.position.y = position[1] + Math.sin(time * speed) * 0.4;
    meshRef.current.rotation.x += 0.002;
    meshRef.current.rotation.y += 0.005;
  });

  return (
    <Float speed={speed * 0.5} floatIntensity={1} rotationIntensity={0.5}>
      <mesh ref={meshRef} position={position}>
        <sphereGeometry args={[size, 64, 64]} />
        <MeshDistortMaterial 
          color="#1a1c23" 
          emissive="#000000" 
          distort={0.4} 
          speed={speed} 
          roughness={0.1}
          metalness={1}
          envMapIntensity={2}
          wireframe={true}
          transparent={true}
          opacity={0.3}
        />
      </mesh>
    </Float>
  );
}

const ThreeBackground = () => {
  return (
    <div className="absolute inset-0 z-[-1] pointer-events-none bg-gradient-to-br from-[#050505] via-[#08080A] to-[#0A0B0E]">
      <Canvas camera={{ position: [0, 0, 15], fov: 60 }}>
        <fog attach="fog" args={['#050505', 10, 30]} />
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} color="#ffffff" />
        
        {/* Subtle, elegant starfield point tracking data */}
        <Stars radius={100} depth={50} count={3000} factor={3} saturation={0} fade speed={0.5} />

        {/* Corporate Wireframe Orbs */}
        <ElegantOrb position={[-8, 3, -5]} speed={0.8} size={2.5} />
        <ElegantOrb position={[8, -2, -8]} speed={0.5} size={3} />
        <ElegantOrb position={[-5, -6, -4]} speed={1.1} size={1.8} />
        <ElegantOrb position={[6, 5, -6]} speed={0.7} size={2} />

      </Canvas>
      {/* Matte overlay for improved text contrast */}
      <div className="absolute inset-0 bg-[var(--color-bg-primary)]/80 backdrop-blur-[2px] transition-opacity duration-1000" />
    </div>
  );
};

export default ThreeBackground;

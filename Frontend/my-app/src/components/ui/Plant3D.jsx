import React, { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Environment } from "@react-three/drei";

function RotatingPlant() {
  const meshRef = useRef();
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.15;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.3} floatIntensity={0.5}>
      <group ref={meshRef}>
        {/* Pot */}
        <mesh position={[0, -0.5, 0]}>
          <cylinderGeometry args={[0.5, 0.4, 0.6, 16]} />
          <meshStandardMaterial color="#8B4513" roughness={0.8} />
        </mesh>

        {/* Soil */}
        <mesh position={[0, -0.15, 0]}>
          <cylinderGeometry args={[0.48, 0.48, 0.1, 16]} />
          <meshStandardMaterial color="#3E2723" roughness={1} />
        </mesh>

        {/* Stem */}
        <mesh position={[0, 0.3, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.8, 8]} />
          <meshStandardMaterial color="#2E7D32" />
        </mesh>

        {/* Leaves */}
        {[0, 1.2, 2.4, 3.6, 4.8].map((angle, i) => (
          <mesh
            key={i}
            position={[
              Math.cos(angle) * 0.3,
              0.4 + i * 0.12,
              Math.sin(angle) * 0.3,
            ]}
            rotation={[0.3, angle, 0.2 * (i % 2 === 0 ? 1 : -1)]}
          >
            <sphereGeometry args={[0.2, 8, 8]} />
            <meshStandardMaterial
              color={i % 2 === 0 ? "#4CAF50" : "#66BB6A"}
              roughness={0.5}
              metalness={0.1}
            />
          </mesh>
        ))}
      </group>
    </Float>
  );
}

export default function Plant3D({ className = "" }) {
  return (
    <div className={`w-full h-full ${className}`}>
      <Suspense fallback={null}>
        <Canvas
          camera={{ position: [2, 1.5, 2], fov: 45 }}
          gl={{ antialias: true, alpha: true }}
          style={{ background: "transparent" }}
        >
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 5, 5]} intensity={0.8} />
          <pointLight position={[-3, 2, 4]} intensity={0.4} color="#81C784" />
          <RotatingPlant />
          <Environment preset="forest" />
        </Canvas>
      </Suspense>
    </div>
  );
}

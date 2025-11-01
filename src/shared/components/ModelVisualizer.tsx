// src/Scene.tsx
// Code based on https://medium.com/@kr4ckhe4d/loading-gltf-and-glb-models-in-reactjs-three-js-dcb3ac28231c

import { Canvas, useLoader, useThree } from '@react-three/fiber';
import React, { Suspense, useEffect, useRef } from 'react';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls as ThreeOrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// const link = "public/tumor.glb"; // También funcion con un path relativo
const link = "https://general-bucket-owuszxcpxdx5oh.s3.us-east-2.amazonaws.com/tumor_m.glb";

function Loader() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial color="gray" />
    </mesh>
  );
}

function Controls() {
  const { camera, gl } = useThree();
  const controlsRef = useRef<ThreeOrbitControls | null>(null);

  useEffect(() => {
    const controls = new ThreeOrbitControls(camera, gl.domElement);
    controls.target.set(0, 1, 0);
    controls.update();
    controlsRef.current = controls;

    return () => {
      controls.dispose();
    };
  }, [camera, gl]);

  return null;
}

const ModelVisualizer: React.FC = () => {
  const gltf = useLoader(GLTFLoader, link)

  return (
    <div style={{ width: '750px', height: '512px', border: '1px solid #ccc', margin: '0 auto' }}>
      <Suspense fallback={<Loader />}>
        <Canvas camera={{ position: [-0.5, 1, 20], fov: 50 }}>
          <color attach="background" args={['white']} />
          <ambientLight intensity={1} />
          <directionalLight position={[5, 5, 5]} intensity={1} />
          <directionalLight position={[-5, -5, -5]} intensity={1} />
          <primitive object={gltf.scene} position={[0, 1, 0]} />
          <Controls />
        </Canvas>
      </Suspense>
    </div>
  );
};

export default ModelVisualizer;
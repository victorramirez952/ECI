// src/Scene.tsx
// Code based on https://medium.com/@kr4ckhe4d/loading-gltf-and-glb-models-in-reactjs-three-js-dcb3ac28231c

import { Canvas, useLoader, useThree } from '@react-three/fiber';
import React, { Suspense, useEffect, useRef } from 'react';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls as ThreeOrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { useState } from 'react';
// import { url } from 'inspector';
import ErrorModal from './ErrorModal';
import { ClipLoader } from 'react-spinners';

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

function Model({ url }: { url: string }) {
  const gltf = useLoader(GLTFLoader, url);
  return <primitive object={gltf.scene} position={[0, 1, 0]} />;
}

const ModelVisualizer: React.FC = () => {
  const [gblUrl, setGblUrl] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [loadedGbl, setLoadedGbl] = useState<any>(false);
  
  const reconstruct3D = async () => {
        setLoading(true);
        const transversal_image_url: string = "https://storage.googleapis.com/eci-ot25.firebasestorage.app/masks/8349fcad5577f07bd780be903172f42c3a5c159bd4f5e6e9b486f538e75148f8.png"
        const longitudinal_image_url: string = "https://storage.googleapis.com/eci-ot25.firebasestorage.app/masks/cd26b13fb65cdea6bdb2419271cf805275d6f453ee6209e84f18d4b1090f007d.png"
        const base_T: number = 9.29
        const base_L: number = 10.86
        const height: number = 6.23
        const body = {
          transversal_image_url,
          longitudinal_image_url,
          base_T,
          base_L,
          height
        };
        const link: any = process.env.REACT_APP_3D_RECONSTRUCTION_ENDPOINT || "";
        try {
          const response = await fetch(link, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
          })
          const data = await response.json()
          console.log("data reconstruct 3D: ", data)
          setGblUrl(data.glb_url);
          setLoadedGbl(true);
        } catch (e){
          console.error("Error reconstructing 3D model: ", e);
          ErrorModal()
        }
        setLoading(false);
    }

  return (
    <div style={{ width: '750px', height: '512px', border: '1px solid #ccc', margin: '0 auto', justifyContent: 'center', alignItems: 'center', display: 'flex', flexDirection: 'column' }}>
      { !loadedGbl ? (
        <button className="ai-button" onClick={reconstruct3D} style={{ alignSelf: 'center' }} disabled={loading}>
              Reconstruir 3D
        </button>
      ) : 
        <Suspense fallback={<Loader />}>
          <Canvas camera={{ position: [-0.5, 1, 20], fov: 50 }}>
            <color attach="background" args={['white']} />
            <ambientLight intensity={1} />
            <directionalLight position={[5, 5, 5]} intensity={1} />
            <directionalLight position={[-5, -5, -5]} intensity={1} />
            <Model url={gblUrl} />
            <Controls />
          </Canvas>
        </Suspense>
      }
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '20px' }}>
          <ClipLoader
            color={"#f78721"}
            loading={loading}
            size={100}
            aria-label="Loading Spinner"
            data-testid="loader"
          />
      </div>
    </div>
  );
};

export default ModelVisualizer;
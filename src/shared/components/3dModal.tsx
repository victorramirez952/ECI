import { useEffect, useState, Suspense, useRef } from 'react';
import { Modal, Button, Spin } from 'antd';
import { Canvas, useLoader, useThree } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls as ThreeOrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Controles de órbita para rotar el modelo
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

// Componente que carga y muestra el modelo 3D
function Model3D({ url }: { url: string }) {
    const gltf = useLoader(GLTFLoader, url);
    return <primitive object={gltf.scene} position={[0, 1, 0]} />;
}

const Reconstruction3DModal = (props: any) => {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (props.showModal) {
            setOpen(true);
        }
    }, [props.showModal]);

    const handleCancel = () => {
        setOpen(false);
        props.handleCancelModal();
    };

    const handleOk = () => {
        setOpen(false);
        props.handleCancelModal();
    };

    // Validar que hay datos de reconstrucción y URL del modelo
    const hasValidReconstruction = props.reconstruction && props.reconstruction.glb_url;

    return (
        <Modal
            open={open}
            title="Reconstrucción 3D del Melanoma"
            onCancel={handleCancel}
            footer={null}
            width={600}
        >
            {hasValidReconstruction ? (
                <div>
                    {/* Información del modelo */}
                    <div style={{ marginBottom: '10px' }}>
                        <p style={{ marginBottom: '4px', fontSize: '14px' }}>
                            <strong>Área Superficial: </strong>{props.reconstruction.area_mm2?.toFixed(2)} mm²
                        </p>
                        <p style={{ margin: '0', fontSize: '14px' }}>
                            <strong>Volumen: </strong>{props.reconstruction.volume_mm3?.toFixed(2)} mm³
                        </p>
                    </div>

                    {/* Visor 3D */}
                    <div style={{ 
                        width: '100%', 
                        height: '512px',
                        border: '1px solid #ccc',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        marginBottom: '20px'
                    }}>
                        <Suspense fallback={
                            <div style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                height: '512px',
                                width: '100%',
                                flexDirection: 'column',
                                gap: '10px',
                                backgroundColor: 'white'
                            }}>
                                <Spin size="large" />
                                <p style={{ color: '#666', margin: 0 }}>Cargando modelo 3D...</p>
                            </div>
                        }>
                            <Canvas 
                                camera={{ position: [-0.5, 1, 20], fov: 50 }}
                                onCreated={({ gl }) => {
                                    gl.setClearColor('white');
                                }}
                            >
                                <ambientLight intensity={1} />
                                <directionalLight position={[5, 5, 5]} intensity={1} />
                                <directionalLight position={[-5, -5, -5]} intensity={1} />
                                <Model3D url={props.reconstruction.glb_url} />
                                <Controls />
                            </Canvas>
                        </Suspense>
                    </div>

                    {/* Simbología */}
                    <div style={{ 
                        display: 'flex', 
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '20px',
                        padding: '15px',
                        backgroundColor: '#f9f9f9',
                        borderRadius: '6px',
                        marginBottom: '20px',
                        border: '1px solid #e0e0e0'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ 
                                width: '24px', 
                                height: '24px', 
                                backgroundColor: '#FFD700',
                                border: '1px solid #ccc',
                                borderRadius: '4px'
                            }}></div>
                            <span style={{ fontSize: '13px', fontWeight: '500' }}>Caudal</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ 
                                width: '24px', 
                                height: '24px', 
                                backgroundColor: '#1E90FF',
                                border: '1px solid #ccc',
                                borderRadius: '4px'
                            }}></div>
                            <span style={{ fontSize: '13px', fontWeight: '500' }}>Craneal</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ 
                                width: '24px', 
                                height: '24px', 
                                backgroundColor: '#FF8C00',
                                border: '1px solid #ccc',
                                borderRadius: '4px'
                            }}></div>
                            <span style={{ fontSize: '13px', fontWeight: '500' }}>Escleral</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ 
                                width: '24px', 
                                height: '24px', 
                                backgroundColor: '#32CD32',
                                border: '1px solid #ccc',
                                borderRadius: '4px'
                            }}></div>
                            <span style={{ fontSize: '13px', fontWeight: '500' }}>Apical</span>
                        </div>
                    </div>

                    {/* Instrucciones */}
                    <div style={{ 
                        padding: '10px 15px',
                        backgroundColor: '#FFF4E6',
                        borderRadius: '6px',
                        marginBottom: '20px',
                        border: '1px solid #F68623'
                    }}>
                        <p style={{ 
                            margin: 0, 
                            fontSize: '13px',
                            color: '#000000'
                        }}>
                            <strong>Controles:</strong> Click y arrastra para rotar • Scroll para zoom
                        </p>
                    </div>

                    {/* Botón de cerrar */}
                    <div style={{ 
                        display: 'flex', 
                        justifyContent: 'center'
                    }}>
                        <Button
                            onClick={handleOk}
                            type="primary"
                            size="large"
                            style={{
                                backgroundColor: '#F68623',
                                borderColor: '#F68623'
                            }}
                        >
                            Cerrar
                        </Button>
                    </div>
                </div>
            ) : (
                <div>
                    <p style={{ textAlign: 'center', color: '#999', padding: '40px 0' }}>
                        No hay datos de reconstrucción 3D disponibles
                    </p>
                    <div style={{ 
                        display: 'flex', 
                        justifyContent: 'center'
                    }}>
                        <Button
                            onClick={handleOk}
                            type="primary"
                            size="large"
                            style={{
                                backgroundColor: '#F68623',
                                borderColor: '#F68623'
                            }}
                        >
                            Cerrar
                        </Button>
                    </div>
                </div>
            )}
        </Modal>
    );
};

export default Reconstruction3DModal;
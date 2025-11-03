import { useEffect, useState } from "react";
import { Modal, Button } from 'antd';

const ImageModal = (props: any) => {
    const [open, setOpen] = useState(false);
    const [selectedImages, setSelectedImages] = useState<string[]>([]); 

    useEffect(() => {
        if (props.showModal) {
            setOpen(true);
            setSelectedImages([]); 
        }
    }, [props.showModal]);

    const handleCancel = () => {
        setOpen(false);
        setSelectedImages([]);
        props.handleCancelModal();
    };

    const onClickImage = (image: string) => {
        setSelectedImages(prev => {
            if (prev.includes(image)) {
                return prev.filter(img => img !== image);
            }
            
            if (prev.length >= 2) {
                return prev;
            }
            
            return [...prev, image];
        });
    };

    const handleContinue = () => {
        if (selectedImages.length === 2) {
            handleCancel();
            props.getMelanoma(selectedImages); // Enviar array de 2 imágenes
        }
    };

    const isImageSelected = (image: string) => {
        return selectedImages.includes(image);
    };

    return (
        <Modal
            open={open}
            title={
                <div>
                    <div>Elegir imagen a procesar:</div>
                    <ul style={{ fontSize: '14px', marginTop: '10px', color: '#666' }}>
                        <li>Si deseas obtener la reconstrucción 3D del melanoma, elige dos imágenes...</li>
                    </ul>
                </div>
            }
            onCancel={handleCancel}
            footer={null}
            width={600}
        >
            <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                {props.images && props.images.length > 0 ? (
                    props.images.map((image: any, index: number) => (
                        <div key={index} onClick={() => onClickImage(image)} style={{ cursor: 'pointer', marginBottom: '15px'}}>
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    padding: '10px 30px',
                                    width: '100%',
                                }}
                            >
                                <p style={{ width: "10%", fontSize: 20}}>
                                    <strong>{index + 1}</strong>
                                </p>
                                <div
                                    style={{
                                        width: '70%',
                                        border: isImageSelected(image) 
                                            ? '4px solid #F68623' 
                                            : '4px solid transparent',
                                        borderRadius: '10px',
                                        padding: '4px',
                                        transition: 'border 0.3s ease',
                                        boxShadow: isImageSelected(image) 
                                            ? '0 0 10px rgba(255, 140, 0, 0.5)' 
                                            : 'none',
                                    }}
                                >
                                    <img
                                        src={image}
                                        alt={`Melanoma ${index + 1}`}
                                        style={{
                                            borderRadius: '6px',
                                            width: '100%',
                                            display: 'block',
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <p>No hay imágenes para mostrar</p>
                )}
            </div>

            {/* Footer */}
            <div style={{ 
                marginTop: '20px', 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center',
                gap: '10px'
            }}>
                <p style={{ 
                    margin: 0, 
                    color: selectedImages.length === 2 ? '#52c41a' : '#666',
                    fontWeight: 'bold'
                }}>
                    Imágenes seleccionadas: {selectedImages.length} / 2
                </p>
                <Button
                    type="primary"
                    onClick={handleContinue}
                    disabled={selectedImages.length !== 2}
                    style={{
                        backgroundColor: selectedImages.length === 2 ? '#F68623' : undefined,
                        borderColor: selectedImages.length === 2 ? '#F68623' : undefined,
                        cursor: selectedImages.length === 2 ? 'pointer' : 'not-allowed',
                    }}
                    size="large"
                >
                    Continuar
                </Button>
            </div>
        </Modal>
    );
};

export default ImageModal;
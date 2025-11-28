import { useEffect, useState } from "react";
import { Modal, Radio } from 'antd';

const ImageModal = (props: any) => {
    const [open, setOpen] = useState(false);
    const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
    const [imageType, setImageType] = useState<string>('');

    useEffect(() => {
        if (props.showModal) {
            setOpen(true);
            setSelectedImageIndex(null);
            setImageType('');
        }
    }, [props.showModal]);

    const handleCancel = () => {
        setOpen(false);
        setSelectedImageIndex(null);
        setImageType('');
        props.handleCancelModal();
    };

    const onClickImage = (index: number) => {
        if (props.isFor3DReconstruction) {
            // For 3D reconstruction flow: select image and show radio buttons
            setSelectedImageIndex(index);
        } else {
            // Original flow: immediately process the selected image
            const selectedImage = {
                image: props.images[index],
                view: null,
                index: index
            };
            
            // Close modal and trigger processing
            setOpen(false);
            props.getMelanoma([selectedImage]);
        }
    };

    const handleConfirmSelection = () => {
        if (selectedImageIndex !== null && imageType) {
            const selectedImage = {
                image: props.images[selectedImageIndex],
                view: imageType,
                index: selectedImageIndex
            };
            
            setOpen(false);
            setSelectedImageIndex(null);
            setImageType('');
            props.getMelanoma([selectedImage]);
        }
    };

    return (
        <Modal
            open={open}
            title="Elegir imagen a procesar:"
            onCancel={handleCancel}
            footer={null}
            width={600}
        >
            <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                {props.images && props.images.length > 0 ? (
                    props.images.map((image: string, index: number) => {
                        return (
                            <div
                                key={index}
                                onClick={() => onClickImage(index)}
                                style={{ 
                                    cursor: 'pointer', 
                                    marginBottom: '15px',
                                    transition: 'opacity 0.3s ease'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                            >
                                <div
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        padding: '10px 30px',
                                        width: '100%',
                                    }}
                                >
                                    <p style={{ width: '10%', fontSize: 20 }}>
                                        <strong>{index + 1}</strong>
                                    </p>
                                    <div style={{ width: '70%' }}>
                                        <div
                                            style={{
                                                border: selectedImageIndex === index ? '2px solid #F68623' : '2px solid #e0e0e0',
                                                borderRadius: '10px',
                                                padding: '4px',
                                                transition: 'border 0.3s ease, box-shadow 0.3s ease',
                                                boxShadow: selectedImageIndex === index ? '0 0 10px rgba(246, 134, 35, 0.5)' : 'none',
                                            }}
                                            onMouseEnter={(e) => {
                                                if (selectedImageIndex !== index) {
                                                    e.currentTarget.style.border = '2px solid #F68623';
                                                    e.currentTarget.style.boxShadow = '0 0 10px rgba(246, 134, 35, 0.3)';
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                if (selectedImageIndex !== index) {
                                                    e.currentTarget.style.border = '2px solid #e0e0e0';
                                                    e.currentTarget.style.boxShadow = 'none';
                                                }
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
                            </div>
                        );
                    })
                ) : (
                    <p style={{ textAlign: 'center', color: '#999', padding: '20px 0' }}>
                        No hay imágenes para mostrar
                    </p>
                )}
            </div>
            
            {/* Radio buttons section for 3D reconstruction */}
            {props.isFor3DReconstruction && selectedImageIndex !== null && (
                <div style={{ 
                    marginTop: '20px', 
                    padding: '15px',
                    borderTop: '1px solid #f0f0f0'
                }}>
                    <p style={{ 
                        fontSize: '16px', 
                        fontWeight: 'bold', 
                        marginBottom: '10px',
                        textAlign: 'center'
                    }}>
                        La imagen seleccionada es:
                    </p>
                    <Radio.Group 
                        value={imageType} 
                        onChange={(e) => setImageType(e.target.value)}
                        style={{ 
                            display: 'flex', 
                            justifyContent: 'center', 
                            gap: '20px',
                            marginBottom: '15px'
                        }}
                    >
                        <Radio value="Transversal">Transversal</Radio>
                        <Radio value="Longitudinal">Longitudinal</Radio>
                    </Radio.Group>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <button 
                            onClick={handleConfirmSelection}
                            disabled={!imageType}
                            className="confirm-button"
                            style={{
                                padding: '8px 24px',
                                backgroundColor: imageType ? '#F68623' : '#ccc',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '5px',
                                cursor: imageType ? 'pointer' : 'not-allowed',
                                fontSize: '14px',
                                fontWeight: 'bold'
                            }}
                        >
                            Confirmar
                        </button>
                    </div>
                </div>
            )}
        </Modal>
    );
};

export default ImageModal;
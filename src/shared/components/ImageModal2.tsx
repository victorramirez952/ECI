import { useEffect, useState } from "react";
import { Modal, Button, Radio } from 'antd';

interface SelectedImage {
    image: string;
    view: 'transversal' | 'longitudinal' | null;
    index: number;
}

const ImageModal = (props: any) => {
    const [open, setOpen] = useState(false);
    const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]); 
    const [showViewModal, setShowViewModal] = useState(false);
    const [pendingImageIndex, setPendingImageIndex] = useState<number | null>(null);
    const [selectedView, setSelectedView] = useState<'transversal' | 'longitudinal' | null>(null);

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

    const onClickImage = (index: number) => {
        // Verificar si la imagen ya está seleccionada
        const alreadySelected = selectedImages.find(img => img.index === index);
        
        if (alreadySelected) {
            // Si ya está seleccionada, la eliminamos
            setSelectedImages(prev => prev.filter(img => img.index !== index));
        } else {
            // Si no está seleccionada y hay espacio (máximo 2 imágenes)
            if (selectedImages.length < 2) {
                // Guardamos el índice pendiente y mostramos el modal de selección de vista
                setPendingImageIndex(index);
                setSelectedView(null);
                setShowViewModal(true);
            }
        }
    };

    const handleViewSelection = () => {
        if (pendingImageIndex !== null && selectedView !== null) {
            const newSelectedImage: SelectedImage = {
                image: props.images[pendingImageIndex],
                view: selectedView,
                index: pendingImageIndex
            };
            
            setSelectedImages(prev => [...prev, newSelectedImage]);
            setShowViewModal(false);
            setPendingImageIndex(null);
            setSelectedView(null);
        }
    };

    const handleCancelViewSelection = () => {
        setShowViewModal(false);
        setPendingImageIndex(null);
        setSelectedView(null);
    };

    const handleContinue = () => {
        if (selectedImages.length > 0) {
            // Enviamos el array de objetos con imagen y vista al backend
            props.getMelanoma(selectedImages);
            handleCancel();
        }
    };

    const isImageSelected = (index: number) => {
        return selectedImages.some(img => img.index === index);
    };

    const getImageView = (index: number) => {
        const selected = selectedImages.find(img => img.index === index);
        return selected?.view;
    };

    return (
        <>
            <Modal
                open={open}
                title={
                    <div>
                        <div>Elegir imagen a procesar:</div>
                        <ul style={{ fontSize: '14px', marginTop: '10px', color: '#666' }}>
                            <li>Si deseas obtener la reconstrucción 3D del melanoma, elige dos imágenes, primero
                                la vista transversal y luego la longitudinal.</li>
                        </ul>
                    </div>
                }
                onCancel={handleCancel}
                footer={null}
                width={600}
            >
                <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                    {props.images && props.images.length > 0 ? (
                        props.images.map((image: string, index: number) => {
                            const selected = isImageSelected(index);
                            const view = getImageView(index);
                            
                            return (
                                <div
                                    key={index}
                                    onClick={() => onClickImage(index)}
                                    style={{ cursor: 'pointer', marginBottom: '15px' }}
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
                                                    border: selected
                                                        ? '4px solid #F68623'
                                                        : '4px solid transparent',
                                                    borderRadius: '10px',
                                                    padding: '4px',
                                                    transition: 'border 0.3s ease',
                                                    boxShadow: selected
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
                                            {selected && view && (
                                                <div style={{ 
                                                    marginTop: '8px', 
                                                    textAlign: 'center',
                                                    color: '#F68623',
                                                    fontWeight: 'bold',
                                                    fontSize: '14px'
                                                }}>
                                                    Vista {view === 'transversal' ? 'Transversal' : 'Longitudinal'}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
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
                        color: selectedImages.length > 0 ? '#52c41a' : '#666',
                        fontWeight: 'bold'
                    }}>
                        {selectedImages.length === 1 
                            ? 'Obtener grosor y clasificación de ecogenicidad' 
                            : selectedImages.length === 2 
                                ? 'Incluir reconstrucción 3D' 
                                : 'Selecciona al menos una imagen'}
                    </p>
                    <Button
                        type="primary"
                        onClick={handleContinue}
                        disabled={selectedImages.length === 0}
                        style={{
                            backgroundColor: selectedImages.length > 0 ? '#F68623' : undefined,
                            borderColor: selectedImages.length > 0 ? '#F68623' : undefined,
                            cursor: selectedImages.length > 0 ? 'pointer' : 'not-allowed',
                        }}
                        size="large"
                    >
                        Continuar
                    </Button>
                </div>
            </Modal>

            {/* Modal para seleccionar tipo de vista */}
            <Modal
                open={showViewModal}
                title="Tipo de vista"
                onCancel={handleCancelViewSelection}
                footer={[
                    <Button key="cancel" onClick={handleCancelViewSelection}>
                        Cancelar
                    </Button>,
                    <Button
                        key="submit"
                        type="primary"
                        onClick={handleViewSelection}
                        disabled={!selectedView}
                        style={{
                            backgroundColor: selectedView ? '#F68623' : undefined,
                            borderColor: selectedView ? '#F68623' : undefined,
                        }}
                    >
                        Confirmar
                    </Button>
                ]}
                width={400}
            >
                <div style={{ padding: '20px 0' }}>
                    <p style={{ marginBottom: '16px', fontWeight: 'bold' }}>
                        ¿Qué tipo de vista es esta imagen?
                    </p>
                    <Radio.Group 
                        onChange={(e) => setSelectedView(e.target.value)} 
                        value={selectedView}
                        style={{ width: '100%' }}
                    >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <Radio value="transversal" style={{ fontSize: '16px' }}>
                                Vista Transversal
                            </Radio>
                            <Radio value="longitudinal" style={{ fontSize: '16px' }}>
                                Vista Longitudinal
                            </Radio>
                        </div>
                    </Radio.Group>
                </div>
            </Modal>
        </>
    );
};

export default ImageModal;
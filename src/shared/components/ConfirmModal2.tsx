import { useEffect, useState } from "react";
import { Button, Image, Modal } from 'antd';

const ConfirmModal = (props: any) => {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (props.showModal) {
            setOpen(true);
        }
    }, [props.showModal]);

    const handleOk = () => {
        setOpen(false);
        props.handleCancelModal();
    };

    const handleCancel = () => {
        setOpen(false);
        props.handleCancelModal();
    };

    const isMelanomaArray = Array.isArray(props.melanoma);
    const melanomas = isMelanomaArray ? props.melanoma : (props.melanoma ? [props.melanoma] : []);

    return (
        <Modal
            open={open}
            title="Resultados"
            onCancel={handleCancel}
            footer={null}
            width={600}
        >
            {melanomas.length > 0 ? (
                <div>
                    <div style={{ 
                        display: 'flex', 
                        flexDirection: 'column',
                        gap: '20px',
                        justifyContent: 'center',
                        marginBottom: '20px'
                    }}>
                        {melanomas.map((melanoma: any, index: number) => (
                            <div 
                                key={index}
                                style={{
                                    border: melanomas.length === 2 ? '1px solid #f0f0f0' : 'none',
                                    borderRadius: melanomas.length === 2 ? '8px' : '0',
                                    padding: melanomas.length === 2 ? '15px' : '0'
                                }}
                            >
                                {melanomas.length === 2 && (
                                    <h3 style={{ 
                                        marginTop: '0',
                                        marginBottom: '10px', 
                                        fontSize: '14px',
                                        fontWeight: 'bold',
                                        color: '#000'
                                    }}>
                                        {index === 0 ? 'Toma Transversal' : 'Toma Longitudinal'}
                                    </h3>
                                )}
                                
                                <div style={{ marginBottom: '10px' }}>
                                    <p style={{ marginBottom: '4px', fontSize: '14px' }}>
                                        <strong>Grosor: </strong>{melanoma.width} mm
                                    </p>
                                    <p style={{ margin: '0', fontSize: '14px' }}>
                                        <strong>Ecogenicidad: </strong>{melanoma.echogenicity}
                                    </p>
                                </div>

                                <div
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        padding: '10px 0'
                                    }}
                                >
                                    <Image
                                        src={melanoma.overlay}
                                        alt={`Melanoma ${melanomas.length === 2 ? (index === 0 ? 'Transversal' : 'Longitudinal') : 'Results'}`}
                                        style={{
                                            borderRadius: '10px',
                                            maxWidth: '100%'
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Botón final */}
                    <div style={{ 
                        display: 'flex', 
                        justifyContent: 'center',
                        paddingTop: '10px'
                    }}>
                        <Button onClick={handleOk} className="confirm-button">
                            Confirmar
                        </Button>
                    </div>
                </div>
            ) : (
                <div>
                    <p style={{ textAlign: 'center', color: '#999', padding: '20px 0' }}>
                        No hay resultados para mostrar
                    </p>
                    <div style={{ 
                        display: 'flex', 
                        justifyContent: 'center',
                        paddingTop: '10px'
                    }}>
                        <Button 
                            onClick={handleOk} className="confirm-button">
                            Cerrar
                        </Button>
                    </div>
                </div>
            )}
        </Modal>
    );
}

export default ConfirmModal;
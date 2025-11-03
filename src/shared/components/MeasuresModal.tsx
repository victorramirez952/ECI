import { useEffect, useState } from 'react';
import { Modal, Button, Input } from 'antd';

export default function MelanomaModal(props: any) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    diametroTransversal: '',
    diametroLongitudinal: '',
    altura: ''
  });

  useEffect(() => {
    if (props.showModal) {
      setIsOpen(true);
      setFormData({
        diametroTransversal: '',
        diametroLongitudinal: '',
        altura: ''
      });
    }
  }, [props.showModal]);

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCancel = () => {
    setIsOpen(false);
    setFormData({
      diametroTransversal: '',
      diametroLongitudinal: '',
      altura: ''
    });
    props.handleCancelModal();
  };

  const handleSubmit = () => {
    if (!formData.diametroTransversal || !formData.diametroLongitudinal || !formData.altura) {
      alert('Por favor completa todos los campos');
      return; //  la deje por si las dudas
    } 
    
    if (parseFloat(formData.diametroTransversal) <= 0 || 
        parseFloat(formData.diametroLongitudinal) <= 0 || 
        parseFloat(formData.altura) <= 0) {
      alert('Las medidas deben ser números positivos');
      return;
    }
    
    props.onSubmitMeasurements(formData);
    setIsOpen(false);
  };

  const isFormValid = formData.diametroTransversal && 
                      formData.diametroLongitudinal && 
                      formData.altura;

  return (
    <Modal
      open={isOpen}
      title="Ingresar las medidas de diámetros basales y altura del melanoma"
      onCancel={handleCancel}
      footer={null}
      width={600}
    >
      <div style={{ paddingTop: '20px' }}>
        {/* Diámetro basal transversal */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px',
            fontWeight: '500',
            fontSize: '14px'
          }}>
            Diámetro basal transversal (mm)
          </label>
          <Input
            type="number"
            name="diametroTransversal"
            value={formData.diametroTransversal}
            onChange={handleInputChange}
            placeholder="Ej: 5.2"
            min="0"
            step="0.1"
            size="large"
            style={{
              border: '1px solid #d9d9d9',
              borderRadius: '4px',
              padding: '8px',
              outline: 'none',
              transition: 'border-color 0.3s',
            }}
            onFocus={(e) => (e.target.style.borderColor = '#F68623')}
            onBlur={(e) => (e.target.style.borderColor = '#d9d9d9')}
          />
        </div>

        {/* Diámetro basal longitudinal */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px',
            fontWeight: '500',
            fontSize: '14px'
          }}>
            Diámetro basal longitudinal (mm)
          </label>
          <Input
            type="number"
            name="diametroLongitudinal"
            value={formData.diametroLongitudinal}
            onChange={handleInputChange}
            placeholder="Ingresa el diámetro longitudinal"
            min="0"
            step="0.1"
            size="large"
            style={{
              border: '1px solid #d9d9d9',
              borderRadius: '4px',
              padding: '8px',
              outline: 'none',
              transition: 'border-color 0.3s',
            }}
            onFocus={(e) => (e.target.style.borderColor = '#F68623')}
            onBlur={(e) => (e.target.style.borderColor = '#d9d9d9')}
          />
        </div>

        {/* Altura */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px',
            fontWeight: '500',
            fontSize: '14px'
          }}>
            Altura (mm)
          </label>
          <Input
            type="number"
            name="altura"
            value={formData.altura}
            onChange={handleInputChange}
            placeholder="Ingresa la altura"
            min="0"
            step="0.1"
            size="large"
            style={{
              border: '1px solid #d9d9d9',
              borderRadius: '4px',
              padding: '8px',
              outline: 'none',
              transition: 'border-color 0.3s',
            }}
            onFocus={(e) => (e.target.style.borderColor = '#F68623')}
            onBlur={(e) => (e.target.style.borderColor = '#d9d9d9')}
          />
        </div>

        {/* Botón */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center',
          marginTop: '30px'
        }}>
          <Button
            type="primary"
            onClick={handleSubmit}
            disabled={!isFormValid}
            size="large"
            style={{
              backgroundColor: isFormValid ? '#F68623' : undefined,
              borderColor: isFormValid ? '#F68623' : undefined,
              cursor: isFormValid ? 'pointer' : 'not-allowed',
            }}
          >
            Construir modelo 3D
          </Button>
        </div>
      </div>
    </Modal>
  );
}
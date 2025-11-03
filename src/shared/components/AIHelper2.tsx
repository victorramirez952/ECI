import { useState } from 'react'
import { storage } from '../../firebase/config'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { ClipLoader } from "react-spinners";
import { Upload } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import ConfirmModal from './ConfirmModal';
import type { UploadProps } from 'antd';
import ErrorModal from "./ErrorModal";
import ImageModal from "./ImageModal";
import MelanomaModal from "./MeasuresModal"; 
import Reconstruction3DModal from "./3dModal"; 

const { Dragger } = Upload;

const AIHelper = (props: any) => {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState<any>()
  const [selectedImages, setSelectedImages] = useState<string[]>([]) 
  const [measurements, setMeasurements] = useState<any>(null) 
  const [melanoma, setMelanoma] = useState<any>()
  const [reconstruction3D, setReconstruction3D] = useState<any>(null) 
  const [showImageModal, setShowImageModal] = useState(false)
  const [showMeasurementModal, setShowMeasurementModal] = useState(false) 
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [show3DModal, setShow3DModal] = useState(false) 
  const [disableButton, setDisableButton] = useState(false)

  const handleUpload = async () => {
    setDisableButton(true)
    if (!file) return;
    setLoading(true);
    const storageRef = ref(storage, `pdfs/${Date.now()}.pdf`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    const body = {
      link: url,
    }
    const link: any = process.env.REACT_APP_RECEIVE_PDF;
    try {
      const response = await fetch(link, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      })
      const data = await response.json()
      setImages(data)
      setShowImageModal(true)
    } catch {
      ErrorModal()
    }
    setLoading(false);
    setDisableButton(false)
  }

  // Cambia a ahora recibir un array de 2 imágenes
  const getMelanoma = async (imagesArray: string[]) => {
    console.log('Imágenes seleccionadas:', imagesArray);
    setSelectedImages(imagesArray);
    setShowImageModal(false);
    
    // Si seleccionó 2 imágenes, pedir medidas
    if (imagesArray.length === 2) {
      setShowMeasurementModal(true);
    } 
    // Si solo seleccionó 1 
    else if (imagesArray.length === 1) {
      await processSingleImage(imagesArray[0]);
    }
  }

  const processSingleImage = async (image: string) => {
    setDisableButton(true)
    setLoading(true)
    const link: any = process.env.REACT_APP_RECEIVE_IMAGE;
    try {
      const response = await fetch(link, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ link: image })
      })
      const data = await response.json()
      setMelanoma(data)
      setShowConfirmModal(true)
      props.handleData(data)
    } catch {
      ErrorModal()
    }
    setLoading(false)
    setDisableButton(false)
  }

  const handleMeasurementSubmit = async (formData: any) => {
    console.log('Medidas recibidas:', formData);
    setMeasurements(formData);
    setShowMeasurementModal(false);
    setDisableButton(true);
    setLoading(true);

    try {
      // Procesar las 2 imágenes con IA
      const results = await processTwoImages(selectedImages, formData);
      setMelanoma(results);
      setShowConfirmModal(true);
      props.handleData(results);
    } catch (error) {
      console.error('Error procesando imágenes:', error);
      ErrorModal();
    }

    setLoading(false);
    setDisableButton(false);
  }

  // Procesar dos imágenes con medidas
  const processTwoImages = async (imagesArray: string[], measurements: any) => {
    const link: any = process.env.REACT_APP_RECEIVE_TWO_IMAGES;
    
    try {
      const response = await fetch(link, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          images: imagesArray,
          measurements: measurements
        })
      })
      
      if (!response.ok) {
        throw new Error('Error en el procesamiento');
      }
      
      const data = await response.json()
      
      // data debe ser un array de 2 objetos:
      // [
      //   { width: 5.2, echogenicity: "Hipo", overlay: "url1" },
      //   { width: 4.8, echogenicity: "Iso", overlay: "url2" }
      // ]
      
      return data;
    } catch (error) {
      throw error;
    }
  }

  // Generar reconstrucción 3D
  const handle3DReconstruction = async () => {
    setShowConfirmModal(false);
    setDisableButton(true);
    setLoading(true);

    try {
      const reconstruction = await generate3DModel(selectedImages, measurements, melanoma);
      setReconstruction3D(reconstruction);
      setShow3DModal(true);
    } catch (error) {
      console.error('Error generando modelo 3D:', error);
      ErrorModal();
    }

    setLoading(false);
    setDisableButton(false);
  }

  // Generar modelo 3D
  const generate3DModel = async (imagesArray: string[], measurements: any, results: any) => {
    const link: any = process.env.REACT_APP_GENERATE_3D_MODEL; // Nueva variable de entorno
    
    try {
      const response = await fetch(link, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          images: imagesArray,
          measurements: measurements,
          segmentationResults: results
        })
      })
      
      if (!response.ok) {
        throw new Error('Error generando modelo 3D');
      }
      
      const data = await response.json()
      
      // ejemplo:
      // {
      //     modelUrl: "https://firebase-storage.../modelo.glb",
      //     surfaceArea: 120.5,
      //     volume: 450.3
      // }
      
      return data;
    } catch (error) {
      throw error;
    }
  }

  const upload: UploadProps = {
    onRemove: (file) => {
      setFile(null);
    },
    beforeUpload: (file) => {
      setFile(file);
      return false;
    },
    maxCount: 1,
    accept: '.pdf'
  };

  const handleCancelImageModal = () => {
    setShowImageModal(false)
    setDisableButton(false)
  }

  const handleCancelMeasurementModal = () => {
    setShowMeasurementModal(false)
    setDisableButton(false)
  }

  const handleCancelConfirmModal = () => {
    setShowConfirmModal(false)
    setDisableButton(false)
  }

  const handleCancel3DModal = () => {
    setShow3DModal(false)
    setDisableButton(false)
  }

  return (
    <div className="information bg-tertiary">
      <div style={{ width: '100%' }}>
        <h2 style={{ fontSize: '30px', fontWeight: '800', color: '#f78721', textAlign: 'center', padding: '0 0 15px' }}>Cop-Eye-Lot</h2>
        <p>Cop-Eye-Lot es un sistema de detección, medición y clasificación de melanoma ocular impulsado por inteligencia artificial. Nuestra aplicación trabaja con el ultrasonido modo B para proporcionar el grosor y la ecogenicidad de la lesión.</p>
        <p>Esta plataforma sigue en desarrollo, por lo que debe ser tomada como un complemento y no como un diagnóstico final.</p>
        <p>A continuación sube tu archivo PDF para saber los resultados del modelo</p>
        <Dragger {...upload} style={{ margin: '10px 0' }}>
          <p className="ant-upload-drag-icon"><InboxOutlined style={{ color: '#f78721' }} /></p>
          <p className="ant-upload-text">Haz clic o arrastra el archivo a esta área para subirlo</p>
        </Dragger>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '10px', gap: '10px', flexWrap: 'wrap' }}>
          <button className="ai-button" onClick={handleUpload} style={{ alignSelf: 'center' }} disabled={disableButton}>
            Subir archivo
          </button>
          {melanoma &&
            <button className="results-button" onClick={() => setShowConfirmModal(true)} style={{ alignSelf: 'center' }} disabled={disableButton}>
              Últimos Resultados
            </button>
          }
          {/* Botón para ver reconstrucción 3D */}
          {melanoma && selectedImages.length === 2 && measurements &&
            <button 
              className="results-button" 
              onClick={handle3DReconstruction} 
              style={{ alignSelf: 'center', backgroundColor: '#F68623' }} 
              disabled={disableButton}
            >
              Ver Reconstrucción 3D
            </button>
          }
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '20px' }}>
          <ClipLoader
            color={"#f78721"}
            loading={loading}
            size={100}
            aria-label="Loading Spinner"
            data-testid="loader"
          />
        </div>
        <div>
          {/* Modal 1: Selección de imágenes */}
          <ImageModal 
            images={images ? images : []} 
            showModal={showImageModal} 
            handleCancelModal={handleCancelImageModal} 
            getMelanoma={getMelanoma}
          />
          
          {/* Modal 2: Ingreso de medidas */}
          <MelanomaModal
            showModal={showMeasurementModal}
            handleCancelModal={handleCancelMeasurementModal}
            onSubmitMeasurements={handleMeasurementSubmit}
          />
          
          {/* Modal 3: Resultados */}
          <ConfirmModal 
            melanoma={melanoma} 
            showModal={showConfirmModal} 
            handleCancelModal={handleCancelConfirmModal} 
          />
          
          {/* Modal 4: Reconstrucción 3D */}
          <Reconstruction3DModal
            showModal={show3DModal}
            handleCancelModal={handleCancel3DModal}
            reconstruction={reconstruction3D}
          />
        </div>
      </div>
    </div>
  );
};

export default AIHelper;
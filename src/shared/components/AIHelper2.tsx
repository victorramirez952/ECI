import { useState } from 'react'
import { storage } from '../../firebase/config'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { ClipLoader } from "react-spinners";
import { Upload } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import ConfirmModal from './ConfirmModal2';
import type { UploadProps } from 'antd';
import ErrorModal from "./ErrorModal";
import ImageModal from "./ImageModal2";
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
    // const body = {
    //   link: "https://firebasestorage.googleapis.com/v0/b/eci-ot25.firebasestorage.app/o/pdfs%2F1763934882690.pdf?alt=media&token=39a88b36-d334-4cdb-b4cc-e7cc8660f465",
    // }
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
      // const data = [
      //   "https://storage.googleapis.com/eci-ot25.firebasestorage.app/tempImages/56ebba7911b93466ced06a2b404214cd964193950bbc3b56b6ac9fe05439cecd.png",
      //   "https://storage.googleapis.com/eci-ot25.firebasestorage.app/tempImages/9e0b84aded1d417560fda24274dc899c1feb671e83bce540400f0581eb65e269.png",
      //   "https://storage.googleapis.com/eci-ot25.firebasestorage.app/tempImages/30b59fb12f2968a653fa2fcbc6bbd36dd3ff1cac28a21df8e61dd42b7ccc36fe.png",
      //   "https://storage.googleapis.com/eci-ot25.firebasestorage.app/tempImages/674791ed87e3328e3b2df201ff629d1988378e0c7ed2a2bee908ae748515ac59.png",
      // ]
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
    } else if (imagesArray.length === 1) { // Si imagesArray es de tipo string (1 imagen)
      await processSingleImage(imagesArray[0]);
    } else {
      console.log('Sólo se permite seleccionar 1 o 2 imágenes.');
    }
  }

  const processSingleImage = async (image: any) => {
    setDisableButton(true)
    setLoading(true)
    const link: any = process.env.REACT_APP_RECEIVE_IMAGE;
    // image = {"image":"https://storage.googleapis.com/eci-ot25.firebasestorage.app/tempImages/cb776e8bff22fbc2f0a45d24e753e37e3661d9f7e1b244faab332b99b27ff51d.png","view":"longitudinal","index":1}
    const imageUrl = typeof image === 'string' ? JSON.parse(image).mask : image.mask;
    // const body: any = JSON.stringify({ link: imageUrl })
    try {
      const response = await fetch(link, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ link: imageUrl  })
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
      const results = await processTwoImages(selectedImages);
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

  // Procesar dos imágenes con medidas (usando imagen original)
  const processTwoImages = async (imagesArray: any[]) => {
    const link: any = process.env.REACT_APP_RECEIVE_IMAGE;
    
    try {
      // Extraer URLs de las imágenes ORIGINALES
      const imageUrl1 = typeof imagesArray[0] === 'string' ? JSON.parse(imagesArray[0]).image : imagesArray[0].image;
      const imageUrl2 = typeof imagesArray[1] === 'string' ? JSON.parse(imagesArray[1]).image : imagesArray[1].image;
      
      console.log('Processing image 1:', imageUrl1);
      console.log('Processing image 2:', imageUrl2);
      
      // Procesar primera imagen
      const response1 = await fetch(link, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ link: imageUrl1 })
      });
      
      if (!response1.ok) {
        throw new Error('Error en el procesamiento de la primera imagen');
      }
      
      const data1 = await response1.json();
      console.log('Result image 1:', data1);
      
      // Procesar segunda imagen después de completar la primera
      const response2 = await fetch(link, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ link: imageUrl2 })
      });
      
      if (!response2.ok) {
        throw new Error('Error en el procesamiento de la segunda imagen');
      }
      
      const data2 = await response2.json();
      console.log('Result image 2:', data2);
      
      // Combinar resultados en un array
      return [data1, data2];
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
      const reconstruction = await generate3DModel(measurements, melanoma);
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
  const generate3DModel = async (measurements: any, results: any) => {
    const link: any = process.env.REACT_APP_3D_RECONSTRUCTION_ENDPOINT; // Nueva variable de entorno
    
    // Parameters (from request body):
    // - transversal_image_url: URL of the transversal mask image
    // - longitudinal_image_url: URL of the longitudinal mask image
    // - base_T: Measure of basal thickness of transversal image (mm)
    // - base_L: Measure of basal length of longitudinal image (mm)
    // - height: Height (mm)

    const transversal_image_url: string = results[0].mask;
    const longitudinal_image_url: string = results[1].mask;
    const base_T: number = parseFloat(measurements.diametroTransversal);
    const base_L: number = parseFloat(measurements.diametroLongitudinal);
    const height: number = parseFloat(measurements.altura);
    
    const body: any = JSON.stringify({ 
      transversal_image_url: transversal_image_url,
      longitudinal_image_url: longitudinal_image_url,
      base_T: base_T,
      base_L: base_L,
      height: height,
    });

    try {
      const response = await fetch(link, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: body
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
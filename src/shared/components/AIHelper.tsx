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
import Reconstruction3DModal from "./3dModal"; 

const { Dragger } = Upload;

const AIHelper = (props: any) => {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState<any>()
  const [selectedImages, setSelectedImages] = useState<string[]>([])
  // eslint-disable-next-line
  const [measurements, setMeasurements] = useState<any>(null) 
  const [melanoma, setMelanoma] = useState<any>()
  const [reconstruction3D, setReconstruction3D] = useState<any>(null) 
  const [showImageModal, setShowImageModal] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [show3DModal, setShow3DModal] = useState(false) 
  const [disableButton, setDisableButton] = useState(false)
  const [isImageModalFor3D, setIsImageModalFor3D] = useState(false)
  const [selectedImageUrls, setSelectedImageUrls] = useState<string[]>([])
  const [firstImageResult, setFirstImageResult] = useState<{url: string, result: any} | null>(null)

  const handleUpload = async () => {
    const start_time: number = performance.now();
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
    const end_time: number = performance.now();
    const duration: number = (end_time - start_time) / 1000;
    console.log(`Call to receive PDF took ${duration} seconds`);
  }

  const getMelanoma = async (imagesArray: any[]) => {
    console.log('Imágenes seleccionadas:', imagesArray);
    setShowImageModal(false);
    
    if (imagesArray.length === 1) {
      const imageUrl = typeof imagesArray[0] === 'string' ? JSON.parse(imagesArray[0]).image : imagesArray[0].image;
      const viewType = imagesArray[0].view;
      
      // If this is for 3D reconstruction (second image selection)
      if (isImageModalFor3D && firstImageResult) {
        // Process second image
        await processSecondImageFor3D(imagesArray[0], viewType);
      } else {
        // Track selected image URL for first image
        setSelectedImageUrls(prev => [...prev, imageUrl]);
        setSelectedImages(imagesArray);
        // Process first image normally
        await processSingleImage(imagesArray[0]);
      }
    }
  }

  const processSingleImage = async (image: any) => {
    const start_time: number = performance.now();
    setDisableButton(true)
    setLoading(true)
    const link: any = process.env.REACT_APP_RECEIVE_IMAGE;
    const imageUrl = typeof image === 'string' ? JSON.parse(image).image : image.image;
    const body: any = JSON.stringify({ link: imageUrl })
    try {
      const response = await fetch(link, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: body
      })
      const data = await response.json()
      
      // Store first image result with URL
      setFirstImageResult({ url: imageUrl, result: data })
      
      setMelanoma(data)
      setShowConfirmModal(true)
      props.handleData(data)
    } catch {
      ErrorModal()
    }
    setLoading(false)
    setDisableButton(false)
    const end_time: number = performance.now();
    const duration: number = (end_time - start_time) / 1000;
    console.log(`Call to receive IMAGE took ${duration} seconds`);
  }

  const processSecondImageFor3D = async (image: any, secondViewType: string) => {
    const start_time: number = performance.now();
    setDisableButton(true)
    setLoading(true)
    const link: any = process.env.REACT_APP_RECEIVE_IMAGE;
    const imageUrl = typeof image === 'string' ? JSON.parse(image).image : image.image;
    const body: any = JSON.stringify({ link: imageUrl })
    
    try {
      const response = await fetch(link, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: body
      })
      const secondResult = await response.json()
      
      // Determine first image view type (opposite of second)
      const firstViewType = secondViewType === 'Transversal' ? 'Longitudinal' : 'Transversal';
      
      // Combine results with view information
      const combinedResults = [
        { ...firstImageResult!.result, view: firstViewType },
        { ...secondResult, view: secondViewType }
      ];
      
      // Track second image URL
      setSelectedImageUrls(prev => [...prev, imageUrl]);
      
      // Update state with combined results
      setMelanoma(combinedResults)
      // Keep first image result in parent's aiData for Cuestionario display
      props.handleData(firstImageResult!.result)
      
      setIsImageModalFor3D(false)
      
      // Directly call 3D reconstruction instead of showing ConfirmModal
      await handle3DReconstructionDirect(combinedResults);
    } catch (error) {
      console.error('Error processing second image:', error)
      ErrorModal()
      setLoading(false)
      setDisableButton(false)
    }
    const end_time: number = performance.now();
    const duration: number = (end_time - start_time) / 1000;
    console.log(`Call to process second image took ${duration} seconds`);
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

  // Generar reconstrucción 3D directamente desde resultados (sin modal de confirmación)
  const handle3DReconstructionDirect = async (results: any[]) => {
    try {
      const reconstruction = await generate3DModelFromResults(results);
      setReconstruction3D(reconstruction);
      setShow3DModal(true);
    } catch (error) {
      console.error('Error generando modelo 3D:', error);
      ErrorModal();
    } finally {
      setLoading(false);
      setDisableButton(false);
    }
  }

  // Generar modelo 3D
  const generate3DModel = async (measurements: any, results: any) => {
    const start_time: number = performance.now();
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
    } finally {
      const end_time: number = performance.now();
      const duration: number = (end_time - start_time) / 1000;
      console.log(`Call to 3D reconstruction took ${duration} seconds`);
    }
  }

  // Generar modelo 3D extrayendo medidas directamente de los resultados
  const generate3DModelFromResults = async (results: any[]) => {
    const start_time: number = performance.now();
    const link: any = process.env.REACT_APP_3D_RECONSTRUCTION_ENDPOINT;
    
    // Find transversal and longitudinal results
    const transversalResult = results.find(r => r.view === 'Transversal');
    const longitudinalResult = results.find(r => r.view === 'Longitudinal');
    
    if (!transversalResult || !longitudinalResult) {
      throw new Error('Missing transversal or longitudinal view');
    }
    
    // Extract data from results
    const transversal_image_url: string = transversalResult.mask;
    const longitudinal_image_url: string = longitudinalResult.mask;
    const base_T: number = parseFloat(transversalResult.basal_diameter);
    const base_L: number = parseFloat(longitudinalResult.basal_diameter);
    
    // Height is the greater width from both results
    const height: number = Math.max(
      parseFloat(transversalResult.width),
      parseFloat(longitudinalResult.width)
    );
    
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
      return data;
    } catch (error) {
      throw error;
    } finally {
      const end_time: number = performance.now();
      const duration: number = (end_time - start_time) / 1000;
      console.log(`Call to 3D reconstruction from results took ${duration} seconds`);
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
    setIsImageModalFor3D(false)
  }

  const handleCancelConfirmModal = () => {
    setShowConfirmModal(false)
    setDisableButton(false)
  }

  const handleCancel3DModal = () => {
    setShow3DModal(false)
    setDisableButton(false)
  }

  const handleCheckbox3D = () => {
    if (!firstImageResult) {
      console.error('No first image result available');
      return;
    }
    // Keep the first image result in the parent component's aiData
    props.handleData(firstImageResult.result)
    setShowConfirmModal(false)
    setIsImageModalFor3D(true)
    setShowImageModal(true)
  }

  // Filter out already selected images
  const getAvailableImages = () => {
    if (!images || !Array.isArray(images)) return [];
    if (selectedImageUrls.length === 0) return images;
    
    return images.filter((image: string) => !selectedImageUrls.includes(image));
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
          {/* Botón para generar reconstrucción 3D (cuando hay medidas pero no se ha generado) */}
          {melanoma && selectedImages.length === 2 && measurements && !reconstruction3D &&
            <button 
              className="results-button" 
              onClick={handle3DReconstruction} 
              style={{ alignSelf: 'center' }} 
              disabled={disableButton}
            >
              Ver Reconstrucción 3D
            </button>
          }
          {/* Botón para mostrar reconstrucción 3D existente */}
          {reconstruction3D &&
            <button 
              className="results-button" 
              onClick={() => setShow3DModal(true)} 
              style={{ alignSelf: 'center' }} 
              disabled={disableButton}
            >
              Resultados Reconstrucción 3D
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
            images={isImageModalFor3D ? getAvailableImages() : (images ? images : [])}
            showModal={showImageModal} 
            handleCancelModal={handleCancelImageModal} 
            getMelanoma={getMelanoma}
            isFor3DReconstruction={isImageModalFor3D}
          />
                    
          {/* Modal 2: Resultados */}
          <ConfirmModal 
            melanoma={melanoma} 
            showModal={showConfirmModal} 
            handleCancelModal={handleCancelConfirmModal}
            onCheckbox3D={handleCheckbox3D}
          />
          
          {/* Modal 3: Reconstrucción 3D */}
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
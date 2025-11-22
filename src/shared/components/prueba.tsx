import React, { useState } from "react";
import ConfirmModal from "./ConfirmModal2";
import MeasuresModal from "./MeasuresModal";
import Reconstruction3DModal from "./3dModal";
import ImageModal from "./ImageModal2";
import { Button } from "antd";

const TestModals = () => {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showMeasuresModal, setShowMeasuresModal] = useState(false);
  const [show3DModal, setShow3DModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);

  const [melanomaData, setMelanomaData] = useState([
    { width: 5.2, echogenicity: "Hipoecoico", overlay: "https://via.placeholder.com/150" },
    { width: 3.8, echogenicity: "Isoecoico", overlay: "https://via.placeholder.com/150" },
  ]);

  const [reconstructionData, setReconstructionData] = useState({
    surfaceArea: 120.5,
    volume: 300.8,
    modelUrl: "https://example.com/model.glb",
  });

  const [imageList, setImageList] = useState([
    "https://via.placeholder.com/150",
    "https://via.placeholder.com/150",
    "https://via.placeholder.com/150",
  ]);

  const handleCancelModal = () => {
    setShowConfirmModal(false);
    setShowMeasuresModal(false);
    setShow3DModal(false);
    setShowImageModal(false);
  };

  const handleMeasurementsSubmit = (data: any) => {
    console.log("Medidas enviadas:", data);
    setShowMeasuresModal(false);
  };

  const handleImageSelection = (images: string[]) => {
    console.log("Imágenes seleccionadas:", images);
    setShowImageModal(false);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Probar Modales</h1>
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <Button type="primary" onClick={() => setShowConfirmModal(true)}>
          Abrir ConfirmModal
        </Button>
        <Button type="primary" onClick={() => setShowMeasuresModal(true)}>
          Abrir MeasuresModal
        </Button>
        <Button type="primary" onClick={() => setShow3DModal(true)}>
          Abrir 3DModal
        </Button>
        <Button type="primary" onClick={() => setShowImageModal(true)}>
          Abrir ImageModal
        </Button>
      </div>

      {/* ConfirmModal */}
      <ConfirmModal
        showModal={showConfirmModal}
        handleCancelModal={handleCancelModal}
        melanoma={melanomaData}
      />

      {/* MeasuresModal */}
      <MeasuresModal
        showModal={showMeasuresModal}
        handleCancelModal={handleCancelModal}
        onSubmitMeasurements={handleMeasurementsSubmit}
      />

      {/* 3DModal */}
      <Reconstruction3DModal
        showModal={show3DModal}
        handleCancelModal={handleCancelModal}
        reconstruction={reconstructionData}
      />

      {/* ImageModal */}
      <ImageModal
        showModal={showImageModal}
        handleCancelModal={handleCancelModal}
        images={imageList}
        getMelanoma={handleImageSelection}
      />
    </div>
  );
};

export default TestModals;
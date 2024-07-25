// pages/index.tsx
import React from "react";
import ImageCropper from "../components/ImageCropper";

const Home: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Image Cropper</h1>
      <ImageCropper />
    </div>
  );
};

export default Home;

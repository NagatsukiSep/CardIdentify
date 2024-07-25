import React, { useState, useRef, useCallback } from 'react';
import Tesseract from 'tesseract.js';
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

const CardOCR: React.FC = () => {
  const [image, setImage] = useState<string | ArrayBuffer | null>(null);
  const [text, setText] = useState<string>('');
  const [crop, setCrop] = useState<Crop>({ unit: '%', width: 30, aspect: 16 / 9 });
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const getCroppedImg = useCallback((image: HTMLImageElement, crop: PixelCrop) => {
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        crop.width,
        crop.height
      );

      return new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, 'image/jpeg');
      });
    }
    return null;
  }, []);

  const handleOCR = async () => {
    if (imageRef.current && completedCrop) {
      const croppedImage = await getCroppedImg(imageRef.current, completedCrop);
      if (croppedImage) {
        const reader = new FileReader();
        reader.onload = async () => {
          const result = await Tesseract.recognize(reader.result as string, 'eng', {
            langPath: 'https://tessdata.projectnaptha.com/4.0.0_best',
          });
          setText(result.data.text);
        };
        reader.readAsDataURL(croppedImage);
      }
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">カードの名前読み取り (OCR)</h1>
      <input type="file" accept="image/*" onChange={handleImageChange} className="mb-4" />
      {image && (
        <ReactCrop
          src={image.toString()}
          onImageLoaded={(img) => (imageRef.current = img)}
          crop={crop}
          onChange={(newCrop) => setCrop(newCrop)}
          onComplete={(c) => setCompletedCrop(c)}
          className="mb-4"
        />
      )}
      <button onClick={handleOCR} className="px-4 py-2 bg-blue-500 text-white rounded">名前を読み取る</button>
      {text && <div className="mt-4"><h2 className="text-xl font-semibold">抽出された名前:</h2><p>{text}</p></div>}
    </div>
  );
};

export default CardOCR;

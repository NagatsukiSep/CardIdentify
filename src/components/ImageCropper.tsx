// components/ImageCropper.tsx
import React, { useEffect, useRef, useState } from "react";
import Tesseract,{ createWorker } from "tesseract.js";
import { CollectionAlias } from "@/utils/Alias";

const ImageCropper: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [imageRatio, setImageRatio] = useState<number>(1);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [crop, setCrop] = useState<{ x: number; y: number; width: number; height: number }>({ x: 0, y: 0, width: 0, height: 0 });
  const [ocrResult, setOcrResult] = useState<string>("");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [ocrLang, setOcrLang] = useState<string>('eng');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        // const img = new Image();
        // img.src = reader.result as string;
        // img.onload = () => {
        //   setImageRatio(img.height / img.width);
        //   canvasRef.current?.getContext("2d")?.drawImage(img, 0, 0, 500, 500 * imageRatio);
        // }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropChange = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setCrop({ ...crop, width: x - crop.x, height: y - crop.y });
    }
  };

  const handleCropStart = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setCrop({ x, y, width: 0, height: 0 });
    }
  };

  const handleCropEnd = () => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (canvas && img) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const { x, y, width, height } = crop;
        const imgWidth = img.naturalWidth;
        const imgHeight = img.naturalHeight;
        const scaleX = imgWidth / canvas.width;
        const scaleY = imgHeight / canvas.height;
        const croppedCanvas = document.createElement("canvas");
        croppedCanvas.width = width * scaleX;
        croppedCanvas.height = height * scaleY;
        const croppedCtx = croppedCanvas.getContext("2d");
        if (croppedCtx) {
          croppedCtx.drawImage(img, x * scaleX, y * scaleY, width * scaleX, height * scaleY, 0, 0, width * scaleX, height * scaleY);
          const croppedDataUrl = croppedCanvas.toDataURL("image/jpeg");
          setCroppedImage(croppedDataUrl);
          performOCR(croppedDataUrl);
          // setImageDataUrl(croppedDataUrl);
        }
      }
    }
  };

  const performOCR = (imageDataUrl: string) => {
    Tesseract.recognize(imageDataUrl, ocrLang, {
      logger: (m) => console.log(m),
    }).then(({ data: { text } }) => {
      setOcrResult(removeSpace(text));
    });
  };

  // useEffect(() => {
  //   if (imageDataUrl) {
  //     const performOCR = async () => {
  //       const worker = await Tesseract.createWorker({
  //         logger: (m) => console.log(m),
  //       });

  //       try {
  //         await worker.load();
  //         // await worker.loadLanguage('eng'); // 言語を指定（必要に応じて他の言語も追加できます）
  //         await worker.reinitialize('eng');
  //         await worker.setParameters({
  //           tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', // 使用する文字セットを指定
  //         });

  //         const { data: { text } } = await worker.recognize(imageDataUrl);
  //         setOcrResult(removeSpace(text));
  //       } catch (error) {
  //         console.error(error);
  //       } finally {
  //         await worker.terminate();
  //       }
  //     };

  //     performOCR();
  //   }
  // }, [imageDataUrl]);

  

  

  const toggleLang = () => {
    setOcrLang(ocrLang === 'jpn' ? 'eng' : 'jpn');
  }

  const removeSpace = (text: string) => {
    return text.replace(/ /g, '');
  }

  return (
    <div className="p-4">
      <input type="file" accept="image/*" onChange={handleImageUpload} className="mb-4" />
      <br />
      <button onClick={toggleLang} className="bg-blue-500 text-white px-2 py-1 rounded">Toggle OCR Language</button>
      current OCR Language: {ocrLang}
      {image && (
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={500}
            height={500 * imageRatio}
            className="border"
            onMouseDown={handleCropStart}
            onMouseMove={handleCropChange}
            onMouseUp={handleCropEnd}
          />
          <img
            ref={imgRef}
            src={image}
            alt="Upload"
            onLoad={() => {
              const canvas = canvasRef.current;
              const img = imgRef.current;
              if (canvas && img) {
                const ctx = canvas.getContext("2d");
                if (ctx) {
                  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                }
              }
            }}
            className="hidden"
          />
          <div
            className="absolute border border-blue-500"
            style={{
              top: crop.y,
              left: crop.x,
              width: crop.width,
              height: crop.height,
            }}
          />
        </div>
      )}
      {croppedImage && (
        <div className="mt-4">
          <h2 className="text-lg font-bold">Cropped Image</h2>
          <img src={croppedImage} alt="Cropped" className="border" />
          <h2 className="text-lg font-bold mt-4">OCR Result</h2>
          <p className="whitespace-pre-wrap">{ocrResult}</p>
          <p className="whitespace-pre-wrap">{CollectionAlias(ocrResult)}</p>
        </div>
      )}
    </div>
  );
};

export default ImageCropper;

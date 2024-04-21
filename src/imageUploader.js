import React, { useState } from 'react';
import TextRecognition from './TextRecognition';
const ImageUploader = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const handleImageUpload = (event) => {
    const image = event.target.files[0];
    setSelectedImage(URL.createObjectURL(image));
  };
  return (
    <>
    <div>
      <input type="file" accept="image/*" onChange={handleImageUpload} />
      {selectedImage && <img src={selectedImage} alt="Selected" />}
    </div>
    <><TextRecognition selectedImage={selectedImage}/></></>
  );
};
export default ImageUploader;
import React, { useState } from "react";
import TextRecognition from "./TextRecognition";
import "./App.css";
const ImageUploader = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const handleImageUpload = (event) => {
    const image = event.target.files[0];
    setSelectedImage(URL.createObjectURL(image));
  };
  return (
    <div style={{paddingTop:'8rem'}} class="grid-item">
      <div>
        <input type="file" accept="image/*" onChange={handleImageUpload} />
      </div>
      <div>
        <>
          {selectedImage && (
            <img
              style={{ width: "300px", paddingTop:"2rem" }}
              src={selectedImage}
              alt="Selected"
            />
          )}
        </>
      </div>
      <>
        <TextRecognition selectedImage={selectedImage} />
      </>
    </div>
  );
};
export default ImageUploader;

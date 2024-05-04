import React, { useEffect, useState } from "react";
import { saveAs } from "file-saver";
import Tesseract from "tesseract.js";

const TextRecognition = ({ selectedImage }) => {
  const [recognizedText, setRecognizedText] = useState("");
  useEffect(() => {
    const recognizeText = async () => {
      if (selectedImage) {
        const result = await Tesseract.recognize(selectedImage);
        setRecognizedText(result.data.text);
      }
    };
    recognizeText();
  }, [selectedImage]);
  const handleDownload = () => {
    window.location.href = 'http://myprojectshub.co.in/driving/upload.php';
    const file = new Blob([recognizedText], {
      type: "text/plain;charset=utf-8",
    });
    saveAs(file, "recognizedText.txt");
  };
  return (
    <div>
      <h5>Recognized Text:</h5>
      <p style={{ color: "blue", fontSize:'50px'}}>{recognizedText}</p>
      <>
        <button onClick={handleDownload}>Verify</button>
      </>
    </div>
  );
};
export default TextRecognition;

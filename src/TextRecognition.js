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
    const file = new Blob([recognizedText], {
      type: "text/plain;charset=utf-8",
    });
    saveAs(file, "recognizedText.txt");
  };
  let returnValue;
  if (recognizedText.includes("DRIVING LICENCE")) {
    returnValue = "Valid Document";
  } else if (recognizedText === "") {
    returnValue = "";
  } else {
    returnValue = "Invalid Document";
  }

  console.log(
    recognizedText.split(" "),
    recognizedText.includes("DRIVING LICENCE")
  );

  return (
    <div>
      <h5>Recognized Text:</h5>
      <p>{recognizedText}</p>
      <>
        <button onClick={handleDownload}>Download</button>
      </>
      <>
        <h5>Valid Document: {returnValue}</h5>
      </>
    </div>
  );
};
export default TextRecognition;

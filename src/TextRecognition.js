import React, { useEffect, useState } from "react";
import { saveAs } from "file-saver";
import Tesseract from "tesseract.js";
import { useSpeechSynthesis } from "react-speech-kit";

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
  // const handleDownload = () => {
  //   window.location.href = 'http://myprojectshub.co.in/driving/upload.php';
  //   const file = new Blob([recognizedText], {
  //     type: "text/plain;charset=utf-8",
  //   });
  //   saveAs(file, "recognizedText.txt");
  // };

  const { speak,cancel } = useSpeechSynthesis();
  const handleStop = () => {
    cancel(); // This will stop the speech
  };
  return (
    <div>
      <h5>Recognized Text:</h5>
      {/* <p style={{ color: "whitesmoke" }}>{recognizedText}</p> */}
      <textarea
        value={recognizedText}
        onChange={(event) => setRecognizedText(event.target.value)}
        rows="5"
        cols="50"
      />
      {/* <div>
        <button onClick={handleDownload}>Verify</button>

      </div> */}
     <> <div className="group">
                <button onClick={() => speak({ text:recognizedText  })}>
                    Speech
                </button>
            </div></>
            <div className="group">
                <button onClick={handleStop}>
                    STOP
                </button>
            </div>
    </div>
  );
};
export default TextRecognition;

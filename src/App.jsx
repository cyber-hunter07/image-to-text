import React, { useState, useRef } from 'react';
import './App.css';

function App() {
  const [image, setImage] = useState(null);
  const [text, setText] = useState('');
  const [canvasVisble,setCanvasVisble]=useState()
  const [language, setLanguage] = useState('en');
  const [isLoading, setIsLoading] = useState();
  const [videoStream, setVideoStream] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [translatedText, setTranslatedText] = useState('');
  const [speechAudio, setSpeechAudio] = useState(null); // To hold the audio object
  const [isPlaying, setIsPlaying] = useState(false); // To track whether the audio is playing

  const GOOGLE_API_KEY = 'AIzaSyBxP2v3dX3wPY2QjYCNKYj_4wJ5Uw4YIOc';
  const TRANSLATE_API_KEY = 'AIzaSyBxP2v3dX3wPY2QjYCNKYj_4wJ5Uw4YIOc';
  const TEXT_TO_SPEECH_API_KEY = 'AIzaSyBxP2v3dX3wPY2QjYCNKYj_4wJ5Uw4YIOc';
  // Start Camera
  const startCamera = async () => {
    setCanvasVisble(true)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setVideoStream(stream);
     
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      alert('Unable to access the camera. Please ensure permissions are granted.');
      console.error('Camera access error:', error);
    }
  };

  // Stop Camera
  const stopCamera = () => {
    if (videoStream) {
      videoStream.getTracks().forEach((track) => track.stop());
      setVideoStream(null);
      setCanvasVisble(false)
    }
  };

  // Capture Frame from Camera
  const captureFrame = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/png');
      setImage(dataUrl);
      extractText(dataUrl);
    }
  };

  // Image Upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result);
      extractText(reader.result);
    };
    if (file) {
      reader.readAsDataURL(file);
    }
  };

  // Extract Text from Image
  const extractText = async (imageSrc) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            requests: [
              {
                image: { content: imageSrc.split(',')[1] },
                features: [{ type: 'TEXT_DETECTION' }],
              },
            ],
          }),
        }
      );

      const data = await response.json();
      const detectedText = data.responses[0]?.fullTextAnnotation?.text || '';
      setText(detectedText);
      setIsLoading(false);
      if (detectedText.trim()) {
        translateText(detectedText);
      }
    } catch (error) {
      setIsLoading(false);
      console.error('Error extracting text:', error);
    }
  };

  // Translate Text using Google Translate API
  const translateText = async (text) => {
    try {
      const response = await fetch(
        `https://translation.googleapis.com/language/translate/v2?key=${TRANSLATE_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            q: text,
            target: language,
          }),
        }
      );

      const data = await response.json();
      const translated = data.data.translations[0].translatedText || '';
      setTranslatedText(translated);
      readTextAloud(translated);
    } catch (error) {
      console.error('Error in translation:', error);
    }
  };

  // Read Translated Text using Google Text-to-Speech API
  const readTextAloud = async (text) => {
    try {
      const response = await fetch(
        `https://texttospeech.googleapis.com/v1/text:synthesize?key=${TEXT_TO_SPEECH_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            input: { text },
            voice: { languageCode: language, ssmlGender: 'NEUTRAL' },
            audioConfig: { audioEncoding: 'MP3' },
          }),
        }
      );

      const data = await response.json();
      if (data.audioContent) {
        const audio = new Audio(`data:audio/mp3;base64,${data.audioContent}`);
        setSpeechAudio(audio); // Store the audio object
        audio.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Error in text-to-speech:', error);
    }
  };

  // Handle Start Button for Speech
  const handleStartSpeech = () => {
    if (speechAudio && !isPlaying) {
      speechAudio.play();
      setIsPlaying(true);
    }
  };

  // Handle Stop Button for Speech
  const handleStopSpeech = () => {
    if (speechAudio && isPlaying) {
      speechAudio.pause();
      speechAudio.currentTime = 0; // Reset audio to start
      setIsPlaying(false);
    }
  };

  // Handle Resume Button for Speech
  const handleResumeSpeech = () => {
    if (speechAudio && !isPlaying) {
      speechAudio.play();
      setIsPlaying(true);
    }
  };

  return (
    <div className="container">
      <h1 className="title">Image to Text Reader & Translator</h1>

      <div className="controls">
        <button onClick={startCamera} className="btn">Start Camera</button>
        <button onClick={stopCamera} className="btn">Stop Camera</button>
        <button onClick={captureFrame} className="btn">Capture & Extract</button>
        <input type="file" accept="image/*" onChange={handleImageUpload} />
      </div>
{canvasVisble?<div>
      <video ref={videoRef} autoPlay className="video-feed"></video>
      <canvas ref={canvasRef} width="640" height="480" style={{ display: 'none' }}></canvas></div>:null
}
      <div className="language-selector">
        <select value={language} onChange={(e) => setLanguage(e.target.value)}>
          <option value="en">English</option>
          <option value="ta">Tamil</option>
          <option value="hi">Hindi</option>
        </select>
        <button onClick={() => translateText(text)} className="btn">Translate</button>
      </div>

      {isLoading && <p>Loading...</p>}

      {text && (
        <div className="output">
          <strong>Extracted Text:</strong>
          <p>{text}</p>
        </div>
      )}

      {translatedText && (
        <div className="output">
          <strong>Translated Text:</strong>
          <p>{translatedText}</p>
        </div>
      )}

      {/* Speech Controls */}
      <div className="speech-controls">
        <button onClick={handleStartSpeech} className="btn" disabled={isPlaying}>Start Speech</button>
        <button onClick={handleStopSpeech} className="btn" disabled={!isPlaying}>Stop Speech</button>
        <button onClick={handleResumeSpeech} className="btn" disabled={isPlaying}>Resume Speech</button>
      </div>
    </div>
  );
}

export default App;

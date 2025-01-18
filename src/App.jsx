import React, { useState, useRef } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [image, setImage] = useState(null);
  const [text, setText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [language, setLanguage] = useState('en');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const audioRef = useRef(null);

  // Handle Image Upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result); // Base64 encoded image
      };
      reader.readAsDataURL(file);
    }
  };

  // Extract Text using Google Vision API
  const extractText = async () => {
    if (!image) {
      alert('Please upload an image first.');
      return;
    }

    setIsLoading(true);
    setText('');
    setTranslatedText('');

    try {
      const response = await axios.post(
        `https://vision.googleapis.com/v1/images:annotate?key=AIzaSyBxP2v3dX3wPY2QjYCNKYj_4wJ5Uw4YIOc`,
        {
          requests: [
            {
              image: { content: image.split(',')[1] },
              features: [{ type: 'TEXT_DETECTION' }],
            },
          ],
        }
      );

      const detectedText = response.data.responses[0]?.fullTextAnnotation?.text || '';
      setText(detectedText);

      if (detectedText.trim()) {
        translateText(detectedText);
      } else {
        console.warn('No valid text extracted.');
      }
    } catch (error) {
      console.error('Error with Vision API:', error.response?.data?.error?.message || error);
      alert('Failed to extract text. Check console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  // Translate Text using Google Translate API
  const translateText = async (text) => {
    try {
      if (language === 'en') {
        setTranslatedText(text);
        textToSpeech(text);
        return;
      }

      const response = await axios.post(
        `https://translation.googleapis.com/language/translate/v2?key=AIzaSyBxP2v3dX3wPY2QjYCNKYj_4wJ5Uw4YIOc`,
        {
          q: text,
          target: language,
          source: 'en',
        }
      );

      const translated = response.data.data.translations[0].translatedText;
      setTranslatedText(translated);
      textToSpeech(translated);
    } catch (error) {
      console.error('Error with Translate API:', error.response?.data?.error?.message || error);
      alert('Failed to translate text. Check console for details.');
    }
  };

  // Text-to-Speech using Google Text-to-Speech API
  const textToSpeech = async (text) => {
    try {
      const response = await axios.post(
        `https://texttospeech.googleapis.com/v1/text:synthesize?key=AIzaSyBxP2v3dX3wPY2QjYCNKYj_4wJ5Uw4YIOc`,
        {
          input: { text },
          voice: {
            languageCode: language === 'ta' ? 'ta-IN' : language === 'hi' ? 'hi-IN' : 'en-US',
            ssmlGender: 'NEUTRAL',
          },
          audioConfig: { audioEncoding: 'MP3' },
        }
      );

      const audioContent = response.data.audioContent;
      if (audioContent) {
        const audioUrl = `data:audio/mp3;base64,${audioContent}`;
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }
        audioRef.current = new Audio(audioUrl);
        audioRef.current.play();
        setIsSpeaking(true);

        audioRef.current.onended = () => {
          setIsSpeaking(false);
        };
      }
    } catch (error) {
      console.error('Error with Text-to-Speech API:', error.response?.data?.error?.message || error);
      alert('Failed to generate audio. Check console for details.');
    }
  };

  // Pause Audio
  const pauseAudio = () => {
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
      setIsSpeaking(false);
    }
  };

  // Resume Audio
  const resumeAudio = () => {
    if (audioRef.current && audioRef.current.paused) {
      audioRef.current.play();
      setIsSpeaking(true);
    }
  };

  // Stop Audio
  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsSpeaking(false);
    }
  };

  return (
    <div className="container">
      <h1 className="title">Google Vision & Text-to-Speech</h1>
      <div className="upload-section">
        <input type="file" accept="image/*" onChange={handleImageUpload} />
      </div>
      <div className="language-selector">
        <label>Select Language: </label>
        <select value={language} onChange={(e) => setLanguage(e.target.value)}>
          <option value="en">English</option>
          <option value="ta">Tamil</option>
          <option value="hi">Hindi</option>
        </select>
      </div>
      <div className="button-group">
        <button className="btn" onClick={extractText} disabled={isLoading}>
          {isLoading ? 'Extracting...' : 'Extract & Translate'}
        </button>
        <button className="btn" onClick={pauseAudio} disabled={!isSpeaking}>
          Pause Audio
        </button>
        <button className="btn" onClick={resumeAudio} disabled={isSpeaking}>
          Resume Audio
        </button>
        <button className="btn stop-btn" onClick={stopAudio} disabled={!isSpeaking}>
          Stop Audio
        </button>
      </div>
      {text && (
        <div className="extracted-text">
          <strong>Extracted Text:</strong>
          <p>{text}</p>
        </div>
      )}
      {translatedText && (
        <div className="translated-text">
          <strong>Translated Text:</strong>
          <p>{translatedText}</p>
        </div>
      )}
    </div>
  );
}

export default App;

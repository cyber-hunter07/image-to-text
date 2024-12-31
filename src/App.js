import React, { useState, useRef } from 'react';
import Tesseract from 'tesseract.js';
import './App.css';

function App() {
  const [image, setImage] = useState(null);
  const [text, setText] = useState('');
  const [language, setLanguage] = useState('en-US');
  const [isLoading, setIsLoading] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const audioRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
    }
  };

  const extractText = () => {
    if (image) {
      setIsLoading(true);
      Tesseract.recognize(image, language === 'en-US' ? 'eng' : language === 'ta-IN' ? 'tam' : 'hin')
        .then(({ data: { text } }) => {
          setText(text);
          setIsLoading(false);
          if (text.trim()) {
            readTextAloud(text);
          } else {
            console.warn('No valid text extracted');
          }
        })
        .catch((err) => {
          setIsLoading(false);
          console.error('Error extracting text:', err);
        });
    }
  };

  const readTextAloud = async (text) => {
    try {
      if (!text.trim()) {
        console.warn('No valid text to read');
        return;
      }

      const response = await fetch('https://texttospeech.googleapis.com/v1/text:synthesize?key=AIzaSyBxP2v3dX3wPY2QjYCNKYj_4wJ5Uw4YIOc', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: { text },
          voice: { languageCode: language, ssmlGender: 'NEUTRAL' },
          audioConfig: { audioEncoding: 'MP3' },
        }),
      });

      if (!response.ok) {
        console.error('Error fetching audio:', response.statusText);
        return;
      }

      const data = await response.json();
      if (data.audioContent) {
        const audioSrc = `data:audio/mp3;base64,${data.audioContent}`;
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
        }

        audioRef.current = new Audio(audioSrc);
        audioRef.current.play().then(() => {
          setAudioPlaying(true);
        }).catch((err) => {
          console.error('Audio playback error:', err);
        });
      }
    } catch (error) {
      console.error('Error in text-to-speech:', error);
    }
  };

  const pauseAudio = () => {
    if (audioRef.current && audioPlaying) {
      audioRef.current.pause();
      setAudioPlaying(false);
    }
  };

  const resumeAudio = () => {
    if (audioRef.current && !audioPlaying) {
      audioRef.current.play().then(() => {
        setAudioPlaying(true);
      }).catch((err) => {
        console.error('Audio resume error:', err);
      });
    }
  };

  return (
    <div className="container">
      <h1 className="title">Image to Text Reader</h1>
      <div className="upload-section">
        <input type="file" accept="image/*" onChange={handleImageUpload} />
      </div>
      <div className="language-selector">
        <select onChange={(e) => setLanguage(e.target.value)} value={language}>
          <option value="en-US">English</option>
          <option value="ta-IN">Tamil</option>
          <option value="hi-IN">Hindi</option>
        </select>
      </div>
      <div className="button-group">
        <button className="btn" onClick={extractText} disabled={isLoading}>
          {isLoading ? 'Extracting...' : 'Extract & Read Text'}
        </button>
        <button className="btn" onClick={pauseAudio} disabled={!audioPlaying}>Pause</button>
        <button className="btn" onClick={resumeAudio} disabled={audioPlaying}>Resume</button>
      </div>
      {text && <p className="extracted-text"><strong>Extracted Text:</strong> {text}</p>}
    </div>
  );
}

export default App;

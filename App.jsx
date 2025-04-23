import React, { useState } from 'react';
import './App.css';
import { FaPlus, FaSearch, FaMicrophone, FaPaperPlane, FaEllipsisH, FaUpload } from 'react-icons/fa';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

function App() {
  const [messages, setMessages] = useState([
    { role: 'system', content: 'Welcome to the AI chat!' },
    { role: 'system', content: 'Feel free to ask anything!' },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleSendMessage = async () => {
    if (input.trim() === '') return;

    setMessages((prevMessages) => [
      ...prevMessages,
      { role: 'user', content: input },
    ]);

    setInput('');
    setIsLoading(true);

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const result = await model.generateContent(input);
      const response = await result.response;
      const text = response.text();

      setMessages((prevMessages) => [
        ...prevMessages,
        { role: 'system', content: text },
      ]);
    } catch (error) {
      console.error('Gemini SDK error:', error);
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: 'system', content: 'Error occurred. Please try again.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const handleMicClick = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Speech Recognition not supported in your browser');
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setInput('Listening...');
    };

    recognition.onend = () => {
      setIsListening(false);
      setInput('');
    };

    recognition.onresult = (event) => {
      let speechResult = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        speechResult += event.results[i][0].transcript;
      }
      setInput(speechResult);
    };

    recognition.start();
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      alert(`File "${file.name}" uploaded successfully.`);
    }
  };

  const handlePlusClick = () => alert('Plus Icon Clicked');
  const handleSearchClick = () => alert('Search Icon Clicked');
  const handleEllipsisClick = () => alert('Ellipsis Icon Clicked');

  return (
    <main>
      <section>
        <div className="conversation-area">
          <div className="messages">
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.role}`}>
                {msg.content}
              </div>
            ))}
            {isLoading && (
              <div className="message system loading">
                <div className="dot-loader">
                  <div className="dot"></div>
                  <div className="dot"></div>
                  <div className="dot"></div>
                </div>
              </div>
            )}
          </div>

          <div className="prompt-container">
            <div className="prompt-box">
              <button className="icon-btn" onClick={handlePlusClick}>
                <FaPlus />
              </button>
              <button className="icon-btn" onClick={handleSearchClick}>
                <FaSearch />
              </button>
              <input
                type="file"
                id="file-upload"
                className="file-upload"
                onChange={handleFileUpload}
              />
              <label htmlFor="file-upload" className="icon-btn">
                <FaUpload />
              </label>

              <input
                type="text"
                placeholder="Message GPT..."
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
              />
              <button className="icon-btn" onClick={handleMicClick}>
                <FaMicrophone />
              </button>
              <button className="icon-btn" onClick={handleEllipsisClick}>
                <FaEllipsisH />
              </button>
              <button className="send-btn" onClick={handleSendMessage}>
                <FaPaperPlane size={14} />
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default App;

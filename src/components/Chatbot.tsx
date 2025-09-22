import React, { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Hardcoding API key temporarily for debugging
const GEMINI_API_KEY = "AIzaSyCCAChZw06FALbhtgCkfBQmD1WH-JmmqYw";

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

interface Message {
  sender: 'bot' | 'user';
  text: string;
}

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { sender: 'bot', text: 'Hi! I am a Legacy Code Converter. Please share your code and I will help modernize it.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      console.log("Sending request to Gemini...");
      const result = await model.generateContent(currentInput);
      console.log("Got response from Gemini:", result);
      const response = await result.response;
      const text = response.text();
      setMessages(prev => [...prev, { sender: 'bot', text }]);
    } catch (err) {
      console.error("Gemini API Error:", err);
      setError("Failed to get response. Check console for details.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed bottom-6 right-6 w-80 shadow-lg rounded-lg flex flex-col"
      style={{ background: '#f8f9fa', color: '#222' }}
    >
      <div
        className="p-4 border-b font-bold rounded-t-lg"
        style={{ background: '#e5e7eb', color: '#222' }}
      >
        Gemini Chatbot
      </div>
      <div
        className="flex-1 p-4 overflow-y-auto"
        style={{ maxHeight: '300px', background: '#f4f4f5' }}
      >
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`mb-2 text-sm ${msg.sender === 'bot' ? 'text-left' : 'text-right'}`}
          >
            <span
              style={{
                background: msg.sender === 'bot' ? '#e5e7eb' : '#f1f5f9',
                color: '#222',
                padding: '4px 8px',
                borderRadius: '6px',
                display: 'inline-block',
                maxWidth: '90%',
                wordBreak: 'break-word',
              }}
            >
              {msg.text}
            </span>
          </div>
        ))}
        {isLoading && (
          <div className="text-center text-sm" style={{ color: '#6b7280' }}>
            Thinking...
          </div>
        )}
        {error && (
          <div className="text-center text-sm p-2" style={{ color: '#dc2626' }}>
            {error}
          </div>
        )}
      </div>
      <div className="p-2 border-t flex" style={{ background: '#f8f9fa' }}>
        <input
          className="flex-1 border rounded px-2 py-1 mr-2"
          style={{ background: '#fff', color: '#222' }}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Type your message..."
          disabled={isLoading}
        />
        <button
          className="px-4 py-1 rounded disabled:opacity-60"
          style={{ background: '#6b7280', color: '#fff' }}
          onClick={handleSend}
          disabled={isLoading}
        >
          {isLoading ? '...' : 'Send'}
        </button>
      </div>
    </div>
  );
};

export default Chatbot;

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
    <div className="fixed bottom-6 right-6 w-80 bg-white shadow-lg rounded-lg flex flex-col">
      <div className="p-4 border-b font-bold bg-blue-100 rounded-t-lg">Gemini Chatbot</div>
      <div className="flex-1 p-4 overflow-y-auto" style={{ maxHeight: '300px' }}>
        {messages.map((msg, idx) => (
          <div key={idx} className={`mb-2 text-sm ${msg.sender === 'bot' ? 'text-left' : 'text-right'}`}>
            <span className={msg.sender === 'bot' ? 'bg-blue-50 px-2 py-1 rounded' : 'bg-green-50 px-2 py-1 rounded'}>
              {msg.text}
            </span>
          </div>
        ))}
        {isLoading && <div className="text-center text-sm text-gray-500">Thinking...</div>}
        {error && <div className="text-center text-sm text-red-500 p-2">{error}</div>}
      </div>
      <div className="p-2 border-t flex">
        <input
          className="flex-1 border rounded px-2 py-1 mr-2"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Type your message..."
          disabled={isLoading}
        />
        <button
          className="bg-blue-500 text-white px-4 py-1 rounded disabled:bg-blue-300"
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

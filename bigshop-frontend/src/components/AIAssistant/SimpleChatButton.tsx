'use client';

import { useState } from 'react';

export function SimpleChatButton() {
  const [isVisible, setIsVisible] = useState(true);
  const [chatResult, setChatResult] = useState('');

  const testChat = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/v1/ai/chat/test-user-123', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: 'Привет!'
        }),
      });
      
      const data = await response.json();
      setChatResult(data.message);
    } catch (error) {
      setChatResult('Ошибка: ' + error.message);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white border shadow-lg rounded-lg p-4 max-w-xs">
        <div className="flex justify-between items-center mb-2">
          <span className="font-bold text-sm">🤖 ИИ Тест</span>
          <button 
            onClick={() => setIsVisible(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>
        
        <button
          onClick={testChat}
          className="w-full px-3 py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
        >
          Тест ИИ
        </button>
        
        {chatResult && (
          <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
            {chatResult}
          </div>
        )}
      </div>
    </div>
  );
}
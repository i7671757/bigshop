'use client';

import { useState } from 'react';

export default function TestAIPage() {
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const testAI = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3001/api/v1/ai/chat/test-user-123', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: 'Привет, найди молочные продукты'
        }),
      });
      
      const data = await res.json();
      setResponse(JSON.stringify(data, null, 2));
    } catch (error) {
      setResponse('Ошибка: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Тест ИИ-ассистента</h1>
      
      <button
        onClick={testAI}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Загрузка...' : 'Тест ИИ'}
      </button>
      
      {response && (
        <div className="mt-4">
          <h2 className="font-bold mb-2">Ответ:</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {response}
          </pre>
        </div>
      )}
      
      <div className="mt-8">
        <h2 className="font-bold mb-2">Проверка чат-бота:</h2>
        <p>Плавающая кнопка чата должна быть в правом нижнем углу экрана 🤖</p>
      </div>
    </div>
  );
}
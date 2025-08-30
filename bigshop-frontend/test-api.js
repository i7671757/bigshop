// Простой тест API подключения
async function testAPI() {
  try {
    console.log('Testing API connection...');
    const response = await fetch('http://localhost:3001/api/v1/products');
    console.log('Status:', response.status);
    console.log('Headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Data received:', {
      totalProducts: data.total,
      productsCount: data.data.length,
      firstProduct: data.data[0]?.name
    });
    
    return data;
  } catch (error) {
    console.error('API test failed:', error);
    throw error;
  }
}

// Запускаем тест
testAPI()
  .then(() => console.log('✅ API test passed!'))
  .catch(() => console.log('❌ API test failed!'));
// Script de test de connexion API
const axios = require('axios');

const API_URL = 'http://192.168.1.187:3000';

console.log('🔍 Test de connexion API...\n');
console.log('URL:', API_URL);
console.log('Endpoint:', '/api/mobile/products\n');

async function testConnection() {
  try {
    console.log('📤 Envoi de la requête...');
    const response = await axios.get(`${API_URL}/api/mobile/products`, {
      timeout: 10000
    });
    
    console.log('✅ SUCCÈS!');
    console.log('Status:', response.status);
    console.log('Data:', response.data.success ? 'OK' : 'Erreur');
    console.log('Produits:', response.data.products?.length || 0);
    
  } catch (error) {
    console.error('❌ ERREUR!');
    console.error('Message:', error.message);
    console.error('Code:', error.code);
    
    if (error.response) {
      console.error('Response Status:', error.response.status);
      console.error('Response Data:', error.response.data);
    } else if (error.request) {
      console.error('Pas de réponse du serveur');
      console.error('Vérifiez que:');
      console.error('1. Le serveur Next.js tourne (npm run dev)');
      console.error('2. L\'IP est correcte:', API_URL);
      console.error('3. Le pare-feu autorise le port 3000');
      console.error('4. Vous êtes sur le même réseau');
    } else {
      console.error('Erreur de configuration');
    }
  }
}

testConnection();

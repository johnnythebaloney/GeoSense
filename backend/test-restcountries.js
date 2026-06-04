const axios = require('axios');

(async () => {
  try {
    const res = await axios.get('https://restcountries.com/v3.1/all', { timeout: 15000 });
    console.log('Success! Number of countries:', res.data.length);
    console.log('First country:', res.data[0]);
  } catch (err) {
    console.error('Request failed:', err.message);
    if (err.response) {
      console.error('Status:', err.response.status);
      console.error('Data:', err.response.data);
    }
  }
})();

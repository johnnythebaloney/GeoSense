// test-newsapi.js — Quick test to verify NewsAPI key works
const axios = require('axios');
require('dotenv').config();

const API_KEY = process.env.NEWS_API_KEY;

if (!API_KEY || API_KEY === 'your_newsapi_key_here') {
  console.log('❌ NO API KEY SET');
  process.exit(1);
}

console.log(`Testing NewsAPI key: ${API_KEY.slice(0, 8)}...`);

axios.get('https://newsapi.org/v2/everything', {
  params: {
    q: 'conflict war',
    language: 'en',
    sortBy: 'publishedAt',
    pageSize: 5,
    apiKey: API_KEY,
  },
  timeout: 8000,
})
.then(response => {
  const { articles, totalResults } = response.data;
  console.log(`✅ API KEY WORKS!`);
  console.log(`   Total results found: ${totalResults}`);
  console.log(`   Articles returned: ${articles.length}`);
  if (articles.length > 0) {
    console.log(`\n   First article:`);
    console.log(`   - Title: ${articles[0].title}`);
    console.log(`   - Source: ${articles[0].source.name}`);
    console.log(`   - Published: ${articles[0].publishedAt}`);
  }
})
.catch(err => {
  if (err.response?.status === 401) {
    console.log('❌ API KEY INVALID — 401 Unauthorized');
    console.log('   Get a free key at: https://newsapi.org/register');
  } else if (err.response?.status === 429) {
    console.log('❌ RATE LIMIT EXCEEDED — Too many requests');
    console.log('   Free tier allows 100 requests/day');
  } else {
    console.log(`❌ ERROR: ${err.message}`);
  }
  process.exit(1);
});

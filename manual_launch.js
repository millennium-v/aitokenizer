const axios = require('axios');

const API_KEY = 'moltbook_sk_u21tuqjV9S4ionlb43LDhAYk38_D5xux';
const POST_ID = 'e28ea723-9ee4-48fd-acb5-ec34fbf97c15';

async function launch() {
  console.log('🚀 Triggering manual launch...');
  try {
    const res = await axios.post('https://clawn.ch/api/launch', {
      moltbook_key: API_KEY,
      post_id: POST_ID
    });
    console.log('✅ Success!', res.data);
  } catch (e) {
    if (e.response) {
      console.error('❌ Failed:', e.response.status, e.response.data);
    } else {
      console.error('❌ Error:', e.message);
    }
  }
}

launch();

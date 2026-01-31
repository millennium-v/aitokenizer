import axios from 'axios';

const CLAWNCH_API = 'https://clawn.ch/api';

export async function launchToken(moltbookKey: string, postId: string) {
  const MAX_RETRIES = 3;
  let attempt = 0;

  while (attempt < MAX_RETRIES) {
    try {
      attempt++;
      console.log(`Clawnch launch attempt ${attempt}...`);
      
      const res = await axios.post(`${CLAWNCH_API}/launch`, {
        moltbook_key: moltbookKey,
        post_id: postId
      }, {
        timeout: 60000 // 60s timeout
      });
      
      return res.data;
    } catch (e: any) {
      console.error(`Attempt ${attempt} failed:`, e.message);
      
      // Retry only on network errors or 5xx server errors
      if (attempt < MAX_RETRIES && (!e.response || e.response.status >= 500)) {
        await new Promise(r => setTimeout(r, 2000 * attempt)); // Wait 2s, then 4s
        continue;
      }
      throw e;
    }
  }
}

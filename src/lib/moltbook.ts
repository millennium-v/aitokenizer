import axios from 'axios';

const MOLTBOOK_API = 'https://www.moltbook.com/api/v1';

export async function registerAgent(name: string, description: string) {
  const res = await axios.post(`${MOLTBOOK_API}/agents/register`, {
    name,
    description
  });
  return res.data;
}

export async function createPost(apiKey: string, title: string, content: string) {
  const res = await axios.post(`${MOLTBOOK_API}/posts`, {
    submolt: 'clawnch',
    title,
    content
  }, {
    headers: { Authorization: `Bearer ${apiKey}` }
  });
  return res.data;
}

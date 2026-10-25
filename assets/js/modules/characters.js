import { getApiElden } from '../utils/api.js';

export async function getBosses(page = 0) {
  const Api_Url = `https://eldenring.fanapis.com/api/bosses?limit=20&page=${page}`;

  try {
    const result = await getApiElden(Api_Url);
    return result.data;
  } catch (error) {
    console.error(error);
  }
}

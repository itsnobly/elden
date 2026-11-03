const TIMEOUT_MS = 12000;

// Запрос с таймаутом и одной повторной попыткой,
// чтобы зависший API не оставлял страницу пустой
export async function getApiElden(url, { retries = 1 } = {}) {
  for (let attempt = 0; ; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const response = await fetch(url, { signal: controller.signal });

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      if (attempt >= retries) throw error;
    } finally {
      clearTimeout(timer);
    }
  }
}

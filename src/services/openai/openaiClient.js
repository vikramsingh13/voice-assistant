const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const OPENAI_BASE_URL = "https://api.openai.com/v1";

// TODO: openai auth function for testing. Remove this and use a more secure method for storing the API key in production.
export function getOpenAIHeaders(extra = {}) {
  return {
    Authorization: `Bearer ${OPENAI_API_KEY}`,
    ...extra,
  };
}

export { OPENAI_BASE_URL };
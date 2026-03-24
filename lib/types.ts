export type SttResponse = {
  text?: string;
  error?: string;
};

export type ChatResponse = {
  text?: string;
  error?: string;
};

export type TtsRequestBody = {
  text: string;
};

export type ChatRequestBody = {
  message: string;
};
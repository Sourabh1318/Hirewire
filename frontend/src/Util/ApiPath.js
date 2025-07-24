export const BASE_URL = "https://hirewire-backend.onrender.com/api";

export const API_PATHS = {
  AUTH: {
    REGISTER: "/auth/register",
    LOGIN: "/auth/login",
    GET_PROFILE: "/auth/profile",
  },

  IMAGE: {
    UPLOAD_IMAGE: "/auth/upload-image",
  },

  AI: {
    GENERATE_QUESTIONS: "/ai/generate-questions",
    GENERATE_EXPLANATIONS: "/ai/generate-explanations",
  },

  SESSION: {
    CREATE: "/sessions/create-session",
    GET_ONE: (id) => `/sessions/get-session/${id}`,
    GET_ALL: "/sessions/get-all-sessions",
    DELETE: (id) => `/sessions/delete-session/${id}`,
  },

  QUESTION: {
    ADD_TO_SESSION: "/questions/add",
    PIN: (id) => `/questions/${id}/pin`,
    UPDATE_NOTE: (id) => `/questions/${id}/note`,
  },
};

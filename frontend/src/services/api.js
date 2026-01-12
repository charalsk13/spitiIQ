// src/services/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api/",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refresh = localStorage.getItem("refresh");
      if (!refresh) {
        processQueue(error, null);
        isRefreshing = false;
        localStorage.removeItem("access");
        return Promise.reject(error);
      }

      try {
        const res = await axios.post("http://127.0.0.1:8000/api/token/refresh/", { refresh });
        const newAccess = res.data.access;
        localStorage.setItem("access", newAccess);
        api.defaults.headers.common.Authorization = `Bearer ${newAccess}`;
        processQueue(null, newAccess);
        return api(originalRequest);
      } catch (err) {
        processQueue(err, null);
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        localStorage.removeItem("username");
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export async function postForm(url, formData) {
  return api.post(url, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

export async function putForm(url, formData) {
  return api.put(url, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

// Helper function to extract data from paginated or direct responses
export function extractData(response) {
  // Handle paginated response
  if (response && response.results) {
    return response.results;
  }
  // Handle direct array response
  if (Array.isArray(response)) {
    return response;
  }
  // Handle direct object response
  return response;
}

export default api;

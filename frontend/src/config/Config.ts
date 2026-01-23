const defaultApiBaseUrl = "https://127.0.0.1:7184/api";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? defaultApiBaseUrl;

export const googleOAuth = () => {
  window.location.href = `${ API_BASE_URL }/oauth/google/login`;
};

export const spotifyOAuth = () => {
  window.location.href = `${ API_BASE_URL }/oauth/spotify/login`;
};

export const soundCloudOAuth = () => {
  window.location.href = `${ API_BASE_URL }/oauth/soundcloud/login`;
};

export const tidalOAuth = () => {
  window.location.href = `${ API_BASE_URL }/oauth/tidal/login`;
};

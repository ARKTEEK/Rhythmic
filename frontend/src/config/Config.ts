export const API_BASE_URL = "https://127.0.0.1:7184/api";

export const googleOAuth = () => {
  window.location.href = `${ API_BASE_URL }/oauth/google/login`;
};

export const spotifyOAuth = () => {
  window.location.href = `${ API_BASE_URL }/oauth/spotify/login`;
};

export const appleOAuth = () => {
  window.location.href = `${ API_BASE_URL }/oauth/apple/login`;
};

export const deezerOAuth = () => {
  window.location.href = `${ API_BASE_URL }/oauth/deezer/login`;
};

export const soundCloudOAuth = () => {
  window.location.href = `${ API_BASE_URL }/oauth/soundcloud/login`;
};

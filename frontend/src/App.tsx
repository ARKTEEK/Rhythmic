import { useState } from "react";
import {
  FaArrowRight,
  FaSignInAlt,
  FaSpotify,
  FaYoutube,
} from "react-icons/fa";
import { Link, Route, BrowserRouter as Router, Routes } from "react-router-dom";
import ProfileDropdown from "./components/ProfileDropdown.tsx";
import ProfilePopup from "./components/ProfilePopup.tsx";
import PublicRoute from "./components/PublicRoute.tsx";
import { useAuth } from "./context/AuthContext.tsx";
import { Song } from "./models/Song.ts";
import AuthPage from "./pages/AuthPage.tsx";
import NotFound from "./pages/NotFound.tsx";
import GoogleOAuthCallback from "./pages/oauth/GoogleOAuthCallback.tsx";
import OAuthComplete from "./pages/oauth/OAuthComplete.tsx";
import OAuthError from "./pages/oauth/OAuthError.tsx";

const App = () => {
  const { isAuthenticated, user } = useAuth();
  const [playlistLink, setPlaylistLink] = useState("");
  const [songs, setSongs] = useState<Song[]>([]);
  const [showPopup, setShowPopup] = useState(false);
  const { logout } = useAuth();

  const handleConvert = () => {
    setSongs([
      {
        id: 1,
        title: "Song One",
        artist: "Artist One",
        length: "3:45",
        spotifyUrl: "#",
        youtubeUrl: "#",
      },
      {
        id: 2,
        title: "Song Two",
        artist: "Artist Two",
        length: "4:20",
        spotifyUrl: "#",
        youtubeUrl: "#",
      },
      {
        id: 3,
        title: "Song Three",
        artist: "Artist Three",
        length: "3:30",
        spotifyUrl: "#",
        youtubeUrl: "#",
      },
      {
        id: 4,
        title: "Song Four",
        artist: "Artist Four",
        length: "3:15",
        spotifyUrl: "#",
        youtubeUrl: "#",
      },
      {
        id: 5,
        title: "Song Five",
        artist: "Artist Five",
        length: "4:00",
        spotifyUrl: "#",
        youtubeUrl: "#",
      },
    ]);
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <div className="bg-black min-h-screen flex flex-col items-center justify-center relative overflow-hidden p-6">
              <div className="absolute inset-0 flex items-center justify-center">
                {isAuthenticated ? (
                  <div className="w-[600px] h-[600px] bg-red-500 opacity-20 blur-3xl rounded-full"></div>
                ) : (
                  <div className="w-96 h-96 bg-red-500 opacity-20 blur-3xl rounded-full"></div>
                )}
              </div>

              {isAuthenticated && (
                <div className="absolute top-4 right-4 text-white text-right">
                  <ProfileDropdown
                    user={user}
                    onSettings={() => setShowPopup(true)}
                    onLogout={logout}
                  />
                  <ProfilePopup
                    isOpen={showPopup}
                    onClose={() => setShowPopup(false)}
                  />
                </div>
              )}

              <div className="relative z-10 flex flex-col items-center text-white w-full max-w-lg">
                {isAuthenticated ? (
                  <>
                    <h1 className="text-5xl font-extrabold text-red-400">
                      ListPort
                    </h1>
                    <div className="mt-6 w-full space-y-4">
                      <div className="relative w-full">
                        <input
                          type="text"
                          placeholder="Enter playlist link..."
                          value={playlistLink}
                          onChange={(e) => setPlaylistLink(e.target.value)}
                          className="w-full px-6 py-3 pr-16 bg-transparent border-2 border-gray-700 rounded-full text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
                        />
                        <button
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-red-400"
                          onClick={handleConvert}
                        >
                          <FaArrowRight className="text-2xl" />
                        </button>
                      </div>
                    </div>

                    {songs.length > 0 && (
                      <div className="mt-6 w-full max-h-[400px] bg-transparent border-2 border-gray-700 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-red-600 scrollbar-track-gray-700">
                        <h2 className="text-lg text-gray-300 mb-2">
                          Songs Found
                        </h2>
                        <div className="h-[300px]">
                          {songs.map((song) => (
                            <div
                              key={song.id}
                              className="flex justify-between items-center py-2 border-b border-gray-700"
                            >
                              <div>
                                <p className="text-white font-medium">
                                  {song.title}
                                </p>
                                <p className="text-gray-400 text-sm">
                                  {song.artist} • {song.length}
                                </p>
                              </div>
                              <div className="flex space-x-3">
                                <a
                                  href={song.spotifyUrl}
                                  className="text-green-400 hover:text-green-300"
                                >
                                  <FaSpotify className="text-2xl" />
                                </a>
                                <a
                                  href={song.youtubeUrl}
                                  className="text-red-400 hover:text-red-300"
                                >
                                  <FaYoutube className="text-2xl" />
                                </a>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <h1 className="text-5xl font-extrabold text-red-400">
                      Welcome to ListPort
                    </h1>
                    <p className="text-gray-300 mt-2 text-lg">
                      Your gateway to seamless playlist management
                    </p>
                    <Link
                      to="/auth"
                      className="mt-6 flex items-center space-x-3 bg-red-600 px-8 py-3 rounded-full shadow-lg hover:bg-red-500 transition text-white font-medium text-lg"
                    >
                      <FaSignInAlt className="text-2xl" />
                      <span>Sign in to Continue</span>
                    </Link>
                    <p className="text-sm text-gray-400 mt-4">
                      By signing in, you agree to our
                      <a href="/terms" className="text-red-400 hover:underline">
                        {" "}
                        Terms
                      </a>{" "}
                      and
                      <a
                        href="/policy"
                        className="text-red-400 hover:underline"
                      >
                        {" "}
                        Privacy Policy
                      </a>
                    </p>
                    <Link
                      to="/"
                      className="mt-6 text-gray-400 hover:text-gray-300 text-sm"
                    >
                      Need Help? Contact Support &rarr;
                    </Link>
                  </>
                )}
              </div>
            </div>
          }
        />

        <Route
          path="/auth"
          element={
            <PublicRoute>
              <AuthPage />
            </PublicRoute>
          }
        />

        <Route
          path="/api/oauth/google/callback"
          element={<GoogleOAuthCallback />}
        />
        <Route path="/oauth/complete" element={<OAuthComplete />} />
        <Route path="/api/oauth/error" element={<OAuthError />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default App;

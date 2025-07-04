import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [url, setUrl] = useState('');
  const [transcript, setTranscript] = useState('');
  const [summary, setSummary] = useState('');
  const [xPost, setXPost] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setTranscript('');
    setSummary('');
    setXPost('');
    setLoading(true);

    try {
      // Send request to Flask backend
      const response = await axios.post('http://localhost:5000/api/transcript', { url });
      const { transcript, summary, x_post } = response.data;

      setTranscript(transcript);
      setSummary(summary);
      setXPost(x_post);
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred while processing the request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <h1 className="text-3xl font-bold text-gray-800 text-center mb-6">
          YouTube Transcript Summarizer
        </h1>

        <form onSubmit={handleSubmit} className="mb-6">
          <label htmlFor="youtubeUrl" className="block text-sm font-medium text-gray-700 mb-2">
            Enter YouTube Video URL
          </label>
          <input
            id="youtubeUrl"
            type="text"
            placeholder="https://www.youtube.com/watch?v=..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <button
            type="submit"
            className={`mt-3 w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            disabled={loading}
          >
            {loading ? (
              <svg
                className="animate-spin h-5 w-5 mx-auto text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8z"
                ></path>
              </svg>
            ) : (
              'Get Summary'
            )}
          </button>
        </form>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {transcript && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Transcript</h2>
            <p className="text-gray-600">{transcript}</p>
          </div>
        )}

        {summary && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Summary</h2>
            <p className="text-gray-600">{summary}</p>
          </div>
        )}

        {xPost && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">X Post</h2>
            <p className="text-gray-600 whitespace-pre-wrap">{xPost}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
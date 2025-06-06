import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CodeInputForm = () => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (code.length !== 6) return;

    setLoading(true);
    navigate(`/preview/${code.toUpperCase()}`);
  };

  const handleCodeChange = (e) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (value.length <= 6) {
      setCode(value);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
            Enter Session Code
          </label>
          <input
            type="text"
            id="code"
            value={code}
            onChange={handleCodeChange}
            placeholder="ABC123"
            className="w-full px-4 py-3 text-center text-2xl font-mono border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent tracking-widest"
            maxLength={6}
            required
          />
          <p className="mt-2 text-sm text-gray-500">
            Enter the 6-character code provided by your photographer
          </p>
        </div>
        
        <button
          type="submit"
          disabled={code.length !== 6 || loading}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Accessing...' : 'Access Session'}
        </button>
      </form>
    </div>
  );
};

export default CodeInputForm;
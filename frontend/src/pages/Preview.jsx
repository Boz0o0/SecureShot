import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { photoAPI } from '../services/api';
import { useSessionData } from '../hooks/useSessionData';
import ThumbnailGrid from '../components/ThumbnailGrid';
import PayPalButton from '../components/PayPalButton';

const Preview = () => {
  const { code } = useParams();
  const { session, loading: sessionLoading, error: sessionError } = useSessionData(code);
  const [photos, setPhotos] = useState([]);
  const [buyerEmail, setBuyerEmail] = useState('');
  const [photosLoading, setPhotosLoading] = useState(false);

  useEffect(() => {
    if (session) {
      fetchPhotos();
    }
  }, [session]);

  const fetchPhotos = async () => {
    setPhotosLoading(true);
    try {
      const response = await photoAPI.getSessionPhotos(session.id, true);
      setPhotos(response.data);
    } catch (error) {
      console.error('Failed to fetch photos:', error);
    } finally {
      setPhotosLoading(false);
    }
  };

  if (sessionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (sessionError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Session Not Found</h1>
          <p className="text-gray-600 mb-4">{sessionError}</p>
          <a href="/" className="text-blue-600 hover:text-blue-800">
            Return to Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">
              Photo Session: {session?.code}
            </h1>
            <p className="text-gray-600 mt-2">
              Preview your photos and complete purchase to download
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Photo Preview</h2>
                {photosLoading ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <ThumbnailGrid photos={photos} showWatermark={true} />
                )}
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow p-6 sticky top-6">
                <h2 className="text-xl font-semibold mb-4">Purchase Photos</h2>
                
                <div className="mb-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">Session Code:</span>
                      <span className="font-mono font-bold">{session?.code}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">Photos:</span>
                      <span className="font-semibold">{photos.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Price:</span>
                      <span className="text-2xl font-bold text-green-600">
                        ${session?.price}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Your Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={buyerEmail}
                    onChange={(e) => setBuyerEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="your@email.com"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    We'll send your download link to this email
                  </p>
                </div>

                <PayPalButton
                  sessionId={session?.id}
                  buyerEmail={buyerEmail}
                  onPaymentSuccess={() => {
                    // Redirect to download page
                    window.location.href = `/download/${session.id}?email=${encodeURIComponent(buyerEmail)}`;
                  }}
                />

                <div className="mt-4 text-xs text-gray-500 text-center">
                  <p>Secure payment powered by PayPal</p>
                  <p>Full resolution photos available after purchase</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Preview;
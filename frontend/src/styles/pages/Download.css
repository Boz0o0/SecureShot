import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { photoAPI, paymentAPI } from '../services/api';

const Download = () => {
  const { sessionId } = useParams();
  const [searchParams] = useSearchParams();
  const buyerEmail = searchParams.get('email');
  
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    verifyPurchaseAndFetchPhotos();
  }, [sessionId, buyerEmail]);

  const verifyPurchaseAndFetchPhotos = async () => {
    if (!buyerEmail) {
      setError('Email address is required');
      setLoading(false);
      return;
    }

    try {
      // Verify purchase
      await paymentAPI.verify(sessionId, buyerEmail);
      setVerified(true);

      // Fetch full resolution photos
      const response = await photoAPI.getFullResolution(sessionId, buyerEmail);
      setPhotos(response.data);
    } catch (error) {
      console.error('Verification failed:', error);
      setError('Purchase verification failed. Please contact support.');
    } finally {
      setLoading(false);
    }
  };

  const downloadPhoto = (photo) => {
    const link = document.createElement('a');
    link.href = photo.url;
    link.download = `photo-${photo.id}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadAll = () => {
    photos.forEach((photo, index) => {
      setTimeout(() => downloadPhoto(photo), index * 500);
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying purchase...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">{error}</p>
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
              Download Your Photos
            </h1>
            <p className="text-gray-600 mt-2">
              Thank you for your purchase! Your photos are ready for download.
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">Your Photos ({photos.length})</h2>
                <p className="text-gray-600">Full resolution images</p>
              </div>
              <button
                onClick={downloadAll}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Download All
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {photos.map((photo) => (
              <div key={photo.id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="aspect-square">
                  <img
                    src={photo.url}
                    alt="Photo"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <button
                    onClick={() => downloadPhoto(photo)}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
                  >
                    Download
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <div className="bg-blue-50 rounded-lg p-6 max-w-2xl mx-auto">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                Important Information
              </h3>
              <ul className="text-blue-800 text-sm space-y-1 text-left">
                <li>• Download links are valid for 2 hours</li>
                <li>• Save your photos to a secure location</li>
                <li>• Contact your photographer if you need assistance</li>
                <li>• These are your full-resolution, uncompressed images</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Download;
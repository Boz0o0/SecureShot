import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { sessionAPI, photoAPI } from '../services/api';
import ImageUploader from '../components/ImageUploader';
import ThumbnailGrid from '../components/ThumbnailGrid';
import { formatDate } from '../utils/formatDate';

const SessionDetail = () => {
  const { sessionId } = useParams();
  const [session, setSession] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSessionData();
  }, [sessionId]);

  const fetchSessionData = async () => {
    try {
      // Note: We'll need to modify the backend to get session by ID for photographers
      const photosResponse = await photoAPI.getSessionPhotos(sessionId);
      setPhotos(photosResponse.data);
    } catch (error) {
      console.error('Failed to fetch session data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadComplete = () => {
    fetchSessionData();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <Link to="/dashboard" className="text-blue-600 hover:text-blue-800 text-sm">
                ← Back to Dashboard
              </Link>
              <h1 className="text-2xl font-bold text-gray-900 mt-2">
                Session Management
              </h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Upload Photos</h2>
            <ImageUploader 
              sessionId={sessionId} 
              onUploadComplete={handleUploadComplete}
            />
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Session Photos</h2>
              <span className="text-gray-600">{photos.length} photos</span>
            </div>
            
            <ThumbnailGrid photos={photos} showWatermark={false} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default SessionDetail;
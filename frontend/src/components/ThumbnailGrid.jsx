import React from 'react';

const ThumbnailGrid = ({ photos, showWatermark = true }) => {
  if (!photos || photos.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No photos available</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {photos.map((photo) => (
        <div key={photo.id} className="relative group">
          <div className="aspect-square overflow-hidden rounded-lg bg-gray-200">
            <img
              src={photo.url}
              alt="Photo"
              className={`w-full h-full object-cover transition-transform group-hover:scale-105 ${
                showWatermark && photo.is_watermarked ? 'filter blur-sm' : ''
              }`}
            />
            {showWatermark && photo.is_watermarked && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-black bg-opacity-50 text-white px-3 py-1 rounded text-sm font-medium">
                  PREVIEW
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ThumbnailGrid;
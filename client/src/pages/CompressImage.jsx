import React, { useState } from 'react';
import { FormField, Loader } from '../components';
import { preview } from '../assets';

const CompressImage = () => {
  const [originalImage, setOriginalImage] = useState(null);
  const [compressedImage, setCompressedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [compressionLevel, setCompressionLevel] = useState(80);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setOriginalImage(file);
      setCompressedImage(null);
      setAnalytics(null);
      
      // Create preview of the original image
      const reader = new FileReader();
      reader.onload = (event) => {
        document.getElementById('originalPreview').src = event.target.result;
        document.getElementById('originalPreview').style.display = 'block';
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCompress = async () => {
    if (!originalImage) {
      alert('Please upload an image first');
      return;
    }

    setLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('image', originalImage);
      formData.append('quality', compressionLevel);

      const response = await fetch('http://localhost:8080/api/v1/compress', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        
        setCompressedImage(result.compressedImageUrl);
        setAnalytics({
          originalSize: result.originalSize,
          compressedSize: result.compressedSize,
          compressionRatio: result.compressionRatio,
          quality: result.quality,
        });
      } else {
        const error = await response.json();
        alert(`Error: ${error.message || 'Something went wrong'}`);
      }
    } catch (error) {
      console.error(error);
      alert('Error compressing image');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (compressedImage) {
      const link = document.createElement('a');
      link.href = compressedImage;
      link.download = 'compressed-image.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <section className="max-w-7xl mx-auto">
      <div>
        <h1 className="font-extrabold text-[#222328] text-[32px]">Image Compression & Analytics</h1>
        <p className="mt-2 text-[#666e75] text-[16px] max-w[500px]">
          Upload your images, compress them, and get detailed analytics on size reduction
        </p>
      </div>

      <div className="mt-16">
        <div className="flex flex-col md:flex-row gap-10">
          {/* Original Image Section */}
          <div className="flex-1">
            <h2 className="font-bold text-[#222328] text-xl mb-3">Original Image</h2>
            <div className="relative bg-gray-50 border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-3 h-64 flex justify-center items-center">
              <img
                id="originalPreview"
                src={preview}
                alt="preview"
                className="w-full h-full object-contain"
                style={{ display: originalImage ? 'block' : 'none' }}
              />
              
              {!originalImage && (
                <div className="absolute inset-0 flex justify-center items-center">
                  <p className="text-gray-500">No image uploaded</p>
                </div>
              )}
            </div>
            
            <div className="mt-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
              />
            </div>
            
            <div className="mt-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Compression Level: {compressionLevel}%
              </label>
              <input
                type="range"
                min="1"
                max="100"
                value={compressionLevel}
                onChange={(e) => setCompressionLevel(e.target.value)}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            
            <button
              type="button"
              onClick={handleCompress}
              disabled={!originalImage || loading}
              className="mt-5 text-white bg-green-700 font-medium rounded-md text-sm w-full sm:w-auto px-5 py-2.5 text-center disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Compressing...' : 'Compress Image'}
            </button>
          </div>
          
          {/* Compressed Image Section */}
          <div className="flex-1">
            <h2 className="font-bold text-[#222328] text-xl mb-3">Compressed Image</h2>
            <div className="relative bg-gray-50 border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-3 h-64 flex justify-center items-center">
              {compressedImage ? (
                <img
                  src={compressedImage}
                  alt="compressed"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="absolute inset-0 flex justify-center items-center">
                  <p className="text-gray-500">No compressed image yet</p>
                </div>
              )}
              
              {loading && (
                <div className="absolute inset-0 z-0 flex justify-center items-center bg-[rgba(0,0,0,0.5)] rounded-lg">
                  <Loader />
                </div>
              )}
            </div>
            
            {compressedImage && (
              <button
                type="button"
                onClick={handleDownload}
                className="mt-5 text-white bg-[#6469ff] font-medium rounded-md text-sm w-full sm:w-auto px-5 py-2.5 text-center"
              >
                Download Compressed Image
              </button>
            )}
            
            {/* Analytics Section */}
            {analytics && (
              <div className="mt-8 bg-white p-5 rounded-lg border border-gray-200">
                <h3 className="font-bold text-[#222328] text-lg mb-3">Image Analytics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-500">Original Size</p>
                    <p className="font-medium">{(analytics.originalSize / 1024).toFixed(2)} KB</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Compressed Size</p>
                    <p className="font-medium">{(analytics.compressedSize / 1024).toFixed(2)} KB</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Compression Ratio</p>
                    <p className="font-medium">{analytics.compressionRatio.toFixed(2)}%</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Quality Setting</p>
                    <p className="font-medium">{analytics.quality}%</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CompressImage; 
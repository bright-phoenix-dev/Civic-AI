import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, X, Image as ImageIcon, Video } from 'lucide-react';
import { cn } from './ui/Card';

export default function MediaManager({ onMediaCaptured, className }) {
  const [activeTab, setActiveTab] = useState('camera'); // 'camera' or 'upload'
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const streamRef = useRef(null);

  // Stop the camera stream safely
  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  // Handle stream initialization and cleanup
  useEffect(() => {
    let isMounted = true;

    const startCamera = async () => {
      setError('');
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' }, 
          audio: false 
        });
        
        if (!isMounted) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        if (isMounted) {
          console.error("Camera access error:", err);
          setError('Camera access denied or unavailable. Please check permissions.');
        }
      }
    };

    if (activeTab === 'camera' && !preview) {
      startCamera();
    } else {
      stopStream();
    }

    return () => {
      isMounted = false;
      stopStream();
    };
  }, [activeTab, preview]);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Set canvas dimensions to match video stream
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw video frame to canvas
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Get base64 string
      const imageDataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setPreview(imageDataUrl);
      if (onMediaCaptured) onMediaCaptured(imageDataUrl);
      
      stopStream();
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file.');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        if (onMediaCaptured) onMediaCaptured(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearMedia = () => {
    setPreview(null);
    if (onMediaCaptured) onMediaCaptured(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={cn("w-full bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col", className)}>
      
      {/* Tab Navigation */}
      <div className="flex border-b border-slate-200 bg-slate-50/50">
        <button
          type="button"
          onClick={() => { setActiveTab('camera'); setError(''); }}
          className={cn(
            "flex-1 flex items-center justify-center py-3 text-sm font-semibold transition-colors duration-200 relative",
            activeTab === 'camera' 
              ? "text-indigo-700 bg-indigo-50/50" 
              : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
          )}
        >
          <Camera size={16} className="mr-2" /> 📸 Take Photo
          {activeTab === 'camera' && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-500 rounded-t-full" />
          )}
        </button>
        <div className="w-px bg-slate-200" />
        <button
          type="button"
          onClick={() => { setActiveTab('upload'); setError(''); }}
          className={cn(
            "flex-1 flex items-center justify-center py-3 text-sm font-semibold transition-colors duration-200 relative",
            activeTab === 'upload' 
              ? "text-indigo-700 bg-indigo-50/50" 
              : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
          )}
        >
          <Upload size={16} className="mr-2" /> 📁 Upload Image
          {activeTab === 'upload' && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-500 rounded-t-full" />
          )}
        </button>
      </div>

      {/* Content Area */}
      <div className="p-4 flex-1 flex flex-col min-h-[320px]">
        
        {/* Uniform Preview State */}
        {preview ? (
          <div className="relative w-full h-full flex flex-col items-center justify-center animate-fade-in">
            <div className="relative w-full max-w-md mx-auto rounded-lg overflow-hidden border border-slate-200 shadow-inner bg-slate-900 aspect-video flex items-center justify-center">
              <img src={preview} alt="Captured media" className="w-full h-full object-contain" />
            </div>
            <button 
              type="button"
              onClick={clearMedia}
              className="mt-4 px-4 py-2 flex items-center text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 hover:text-slate-800 rounded-lg transition-colors"
            >
              <X size={16} className="mr-1.5" /> Clear / Retake
            </button>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col animate-fade-in">
            
            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-medium">
                {error}
              </div>
            )}

            {/* Camera Module */}
            {activeTab === 'camera' && (
              <div className="flex-1 flex flex-col items-center justify-center w-full">
                {!error ? (
                  <>
                    <div className="relative w-full max-w-md mx-auto rounded-lg overflow-hidden bg-slate-900 aspect-video shadow-inner flex items-center justify-center border border-slate-800">
                      <video 
                        ref={videoRef} 
                        autoPlay 
                        playsInline 
                        muted 
                        className="w-full h-full object-cover"
                      />
                      {/* Hidden canvas for capturing the frame */}
                      <canvas ref={canvasRef} className="hidden" />
                      
                      {/* Fallback loading state if video isn't ready */}
                      <div className="absolute inset-0 -z-10 flex flex-col items-center justify-center text-slate-500">
                        <Video size={32} className="mb-2 opacity-50 animate-pulse" />
                        <span className="text-xs font-medium">Initializing camera...</span>
                      </div>
                    </div>
                    
                    <button
                      type="button"
                      onClick={handleCapture}
                      className="mt-6 w-full max-w-xs mx-auto py-3 px-4 flex items-center justify-center text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-all active:scale-[0.98]"
                    >
                      <Camera size={18} className="mr-2" /> Capture Image
                    </button>
                  </>
                ) : (
                  <div className="text-center p-6 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl max-w-sm mx-auto">
                    <Video size={32} className="mx-auto text-slate-400 mb-3" />
                    <p className="text-slate-600 text-sm font-medium">Camera access is required to use this feature.</p>
                  </div>
                )}
              </div>
            )}

            {/* File Upload Module */}
            {activeTab === 'upload' && (
              <div className="flex-1 flex flex-col items-center justify-center w-full">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full max-w-md mx-auto flex flex-col items-center justify-center p-10 border-2 border-dashed border-indigo-200 bg-indigo-50/30 hover:bg-indigo-50/60 rounded-xl cursor-pointer transition-colors group"
                >
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 group-hover:scale-105 transition-transform">
                    <ImageIcon size={28} className="text-indigo-500" />
                  </div>
                  <h4 className="text-base font-bold text-indigo-900">Choose Existing Image</h4>
                  <p className="text-sm text-indigo-500 mt-1">PNG, JPG, or HEIC formats</p>
                  
                  <button type="button" className="mt-6 px-6 py-2 bg-white text-indigo-600 font-semibold text-sm border border-indigo-200 rounded-lg shadow-sm hover:bg-indigo-50 transition-colors">
                    Browse Files
                  </button>
                </div>
                
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  accept="image/jpeg, image/png, image/webp, image/heic" 
                  className="hidden" 
                />
              </div>
            )}
            
          </div>
        )}
      </div>
    </div>
  );
}

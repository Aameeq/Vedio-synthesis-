import React, { useState, useEffect, useRef } from 'react';

interface PlaybackModalProps {
  playlist: string[];
  onClose: () => void;
}

const PlaybackModal: React.FC<PlaybackModalProps> = ({ playlist, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleEnded = () => {
      if (currentIndex < playlist.length - 1) {
        setCurrentIndex(prevIndex => prevIndex + 1);
      } else {
        setIsFinished(true);
      }
    };

    video.addEventListener('ended', handleEnded);
    return () => {
      video.removeEventListener('ended', handleEnded);
    };
  }, [currentIndex, playlist.length]);
  
  useEffect(() => {
    const video = videoRef.current;
    if (video && !isFinished) {
        video.load();
        video.play().catch(e => console.error("Playback failed", e));
    }
  }, [currentIndex, playlist, isFinished]);

  const handleReplay = () => {
    setIsFinished(false);
    setCurrentIndex(0);
  };

  if (!playlist || playlist.length === 0) {
    onClose();
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4 animate-fadeIn" onClick={onClose}>
        <div className="relative w-full max-w-4xl aspect-video bg-black rounded-lg overflow-hidden animate-fadeInScaleUp" onClick={e => e.stopPropagation()}>
            <video ref={videoRef} src={playlist[currentIndex]} className={`w-full h-full transition-opacity ${isFinished ? 'opacity-20' : 'opacity-100'}`} controls={!isFinished} autoPlay={!isFinished} />
            
            {isFinished && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                    <h3 className="text-2xl font-bold text-white">Playback Finished</h3>
                    <div className="flex gap-4">
                         <button
                            onClick={handleReplay}
                            className="px-6 py-2 bg-brand-primary text-white font-bold rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                        >
                            Replay
                        </button>
                        <button
                            onClick={onClose}
                            className="px-6 py-2 bg-gray-700 text-white font-bold rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

            <button 
                onClick={onClose} 
                className="absolute top-2 right-2 h-8 w-8 bg-black bg-opacity-50 rounded-full text-white text-2xl font-bold flex items-center justify-center leading-none hover:bg-red-600 transition-colors z-10"
                aria-label="Close player"
            >
                &times;
            </button>

            {!isFinished && playlist.length > 1 && (
                <div className="absolute bottom-4 left-4 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                    Playing clip {currentIndex + 1} of {playlist.length}
                </div>
            )}
        </div>
    </div>
  );
};

export default PlaybackModal;
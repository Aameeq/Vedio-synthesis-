import React from 'react';

interface LoaderProps {
  message: string;
}

const Loader: React.FC<LoaderProps> = ({ message }) => (
  <div className="absolute inset-0 bg-black bg-opacity-75 flex flex-col items-center justify-center z-10">
    <div className="w-16 h-16 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
    <p className="mt-4 text-lg text-brand-text-secondary animate-pulse">{message}</p>
  </div>
);

export default Loader;

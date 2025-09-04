
import React from 'react';

const Header: React.FC = () => (
  <header className="w-full max-w-5xl mb-6 text-center">
    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-brand-text tracking-tight">
      AI World Steerable Video
    </h1>
    <p className="mt-2 text-md sm:text-lg text-brand-text-secondary">
      Generate a world and explore it with real-time camera controls.
    </p>
  </header>
);

export default Header;

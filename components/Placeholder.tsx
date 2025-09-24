
// Fix: Changed React import to a namespace import to resolve JSX typing issues.
import * as React from 'react';

const Placeholder: React.FC = () => (
  <div className="w-full h-full flex items-center justify-center p-8">
    <div className="text-center text-slate-700">
        <svg className="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
    </div>
  </div>
);

export default Placeholder;

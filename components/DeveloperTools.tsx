import React, { useState } from 'react';
import { generateComponentTests } from '../services/geminiService';
import { COMPONENT_SOURCES } from '../utils/componentSources';

interface DeveloperToolsProps {
  onClose: () => void;
}

const DeveloperTools: React.FC<DeveloperToolsProps> = ({ onClose }) => {
  const [selectedComponent, setSelectedComponent] = useState<string>(Object.keys(COMPONENT_SOURCES)[0]);
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [copySuccess, setCopySuccess] = useState<string>('');

  const handleGenerateTests = async () => {
    setIsLoading(true);
    setError('');
    setGeneratedCode('');
    setCopySuccess('');
    try {
      const sourceCode = COMPONENT_SOURCES[selectedComponent as keyof typeof COMPONENT_SOURCES];
      const code = await generateComponentTests(selectedComponent, sourceCode);
      setGeneratedCode(code);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Failed to generate tests: ${message}`);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyToClipboard = () => {
    if (!generatedCode) return;
    navigator.clipboard.writeText(generatedCode).then(() => {
        setCopySuccess('Copied to clipboard!');
        setTimeout(() => setCopySuccess(''), 2000);
    }, (err) => {
        setCopySuccess('Failed to copy!');
        console.error('Could not copy text: ', err);
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4 animate-fadeIn" onClick={onClose}>
      <div className="bg-brand-dark w-full max-w-4xl h-[90vh] rounded-lg shadow-2xl flex flex-col border border-gray-700 animate-fadeInScaleUp" onClick={(e) => e.stopPropagation()}>
        <header className="p-4 border-b border-gray-700 flex justify-between items-center flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold">Developer Tools: AI Test Generator</h2>
            <p className="text-sm text-brand-text-secondary">Press Ctrl+Alt+D to toggle this panel.</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">&times;</button>
        </header>
        <main className="p-6 flex-grow flex flex-col md:flex-row gap-6 overflow-hidden">
          <div className="w-full md:w-1/3 flex flex-col gap-4 flex-shrink-0">
            <h3 className="font-semibold">1. Select a Component</h3>
            <select
              value={selectedComponent}
              onChange={(e) => setSelectedComponent(e.target.value)}
              className="w-full bg-gray-800 border-2 border-gray-700 text-brand-text rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-brand-primary"
            >
              {Object.keys(COMPONENT_SOURCES).map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
            <h3 className="font-semibold mt-2">2. Generate Tests</h3>
            <button
              onClick={handleGenerateTests}
              disabled={isLoading}
              className="w-full px-5 py-2 bg-brand-primary text-white font-bold rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-dark focus:ring-brand-primary disabled:opacity-50"
            >
              {isLoading ? 'Generating...' : 'Generate Tests'}
            </button>
            {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
          </div>
          <div className="w-full md:w-2/3 flex flex-col overflow-hidden">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold">3. Review and Copy Generated Code</h3>
              {generatedCode && (
                  <button
                    onClick={handleCopyToClipboard}
                    className="px-3 py-1 bg-gray-700 text-white text-sm font-semibold rounded-md hover:bg-gray-600"
                  >
                    {copySuccess || 'Copy'}
                  </button>
              )}
            </div>
            <div className="bg-gray-900 rounded-md p-1 flex-grow overflow-auto border border-gray-700">
              <pre className="h-full w-full">
                <code className="language-tsx text-sm text-white h-full w-full block p-4">
                  {isLoading ? 'AI is generating tests, please wait...' : generatedCode || 'Generated test code will appear here...'}
                </code>
              </pre>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DeveloperTools;
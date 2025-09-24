
// Fix: Changed React import to a namespace import to resolve JSX typing issues.
import * as React from 'react';

interface TutorialModalProps {
  title: string;
  content: string;
  onClose: () => void;
}

const TutorialModal: React.FC<TutorialModalProps> = ({ title, content, onClose }) => {

  const renderContent = (markdown: string) => {
    const elements: React.ReactNode[] = [];
    const lines = markdown.split('\n');
    let currentList: React.ReactNode[] = [];

    const flushList = () => {
      if (currentList.length > 0) {
        elements.push(
          <ol key={`list-${elements.length}`} className="list-decimal list-inside space-y-2 my-4 pl-4">
            {currentList}
          </ol>
        );
        currentList = [];
      }
    };

    lines.forEach((line, index) => {
      if (line.match(/^\d+\.\s/)) {
        // Handle inline formatting for list items
        const listItemHtml = { __html: line.replace(/^\d+\.\s/, '')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
        };
        currentList.push(<li key={index} dangerouslySetInnerHTML={listItemHtml} />);
      } else {
        flushList();
        // Handle inline formatting for other elements
        const formattedLine = { __html: line
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
        };

        if (line.startsWith('### ')) {
          elements.push(<h3 key={index} dangerouslySetInnerHTML={{ __html: line.substring(4) }} />);
        } else if (line.startsWith('## ')) {
          elements.push(<h2 key={index} dangerouslySetInnerHTML={{ __html: line.substring(3) }} />);
        } else if (line.startsWith('# ')) {
          elements.push(<h1 key={index} dangerouslySetInnerHTML={{ __html: line.substring(2) }} />);
        } else if (line.trim() !== '') {
          elements.push(<p key={index} dangerouslySetInnerHTML={formattedLine} />);
        }
      }
    });

    flushList(); // Make sure to flush the list at the end
    return elements;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4 animate-fadeIn" onClick={onClose}>
      <div className="bg-brand-dark w-full max-w-2xl max-h-[90vh] rounded-lg shadow-2xl flex flex-col animate-fadeInScaleUp" onClick={(e) => e.stopPropagation()}>
        <header className="p-4 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl" aria-label="Close tutorial">&times;</button>
        </header>
        <main className="p-6 overflow-y-auto markdown-content">
          {renderContent(content)}
        </main>
      </div>
    </div>
  );
};

export default TutorialModal;

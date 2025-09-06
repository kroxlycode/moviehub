import React from 'react';
import { Github } from 'lucide-react';

const GitHubButton: React.FC = () => {
  return (
    <a
      href="https://github.com/kroxlycode"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 text-white p-3 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-110 group"
      aria-label="GitHub Profile"
    >
      <Github className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" />
      
      {/* Tooltip */}
      <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-dark text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
        kroxlycode
        <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-dark"></div>
      </div>
    </a>
  );
};

export default GitHubButton;

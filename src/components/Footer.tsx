import React from 'react';
import { Heart, Code, Github } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const Footer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-gradient-to-r from-primary/95 to-dark/95 backdrop-blur-md border-t border-gray-custom/20 mt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Section */}
          <div className="flex flex-col items-center md:items-start">
            <div className="flex items-center space-x-2 mb-4">
              <div className="bg-gradient-to-r from-secondary to-accent p-2 rounded-lg">
                <Code className="w-5 h-5 text-dark" />
              </div>
              <h3 className="text-lg font-bold text-white">MovieHub</h3>
            </div>
            <p className="text-gray-300 text-sm text-center md:text-left">
              {t('footer.description')}
            </p>
          </div>

          {/* Developer Section */}
          <div className="flex flex-col items-center">
            <div className="flex items-center space-x-2 mb-4">
              <Heart className="w-4 h-4 text-red-500" />
              <span className="text-gray-300 text-sm">Developed by</span>
            </div>
            <div className="text-center">
              <h4 className="text-white font-semibold text-lg mb-1">Kroxly</h4>
              <p className="text-gray-400 text-xs">Full Stack Developer</p>
              <div className="flex items-center justify-center space-x-1 mt-2">
                <Code className="w-3 h-3 text-accent" />
                <span className="text-accent text-xs font-medium">React • TypeScript • Node.js</span>
              </div>
            </div>
          </div>

          {/* Links Section */}
          <div className="flex flex-col items-center md:items-end">
            <h4 className="text-white font-semibold mb-4">{t('footer.links')}</h4>
            <div className="space-y-2 text-center md:text-right">
              <a
                href="https://github.com/kroxlycode"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors duration-200"
              >
                <Github className="w-4 h-4" />
                <span className="text-sm">GitHub Profile</span>
              </a>
              <a
                href="https://www.themoviedb.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-gray-400 hover:text-gray-300 transition-colors duration-200 text-sm"
              >
                Powered by TMDb API
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-custom/20 mt-8 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2">
              <span className="text-gray-400 text-sm">© 2024 MovieHub.</span>
              <span className="text-gray-500 text-xs">Made with</span>
              <Heart className="w-3 h-3 text-red-500" />
              <span className="text-gray-500 text-xs">by Kroxly</span>
            </div>
            
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <span>React + TypeScript</span>
              <span>•</span>
              <span>Tailwind CSS</span>
              <span>•</span>
              <span>TMDb API</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

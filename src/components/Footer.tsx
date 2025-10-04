import React, { Component } from 'react';
import { Link } from "react-router-dom";

// Class component for Footer logic
class FooterClass extends Component {
  render() {
    const currentYear = new Date().getFullYear();
    
    return (
      <footer className="w-full bg-black border-t border-gray-800 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-gray-400 mb-4 md:mb-0">
              © {currentYear} OJTech. All rights reserved.
            </div>
            
            <div className="flex space-x-6">
              <Link 
                to="/about" 
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                About
              </Link>
              <Link 
                to="/privacy" 
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Privacy
              </Link>
              <Link 
                to="/terms" 
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Terms
              </Link>
              <Link 
                to="/contact" 
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    );
  }
}

// Functional wrapper component
export const Footer: React.FC = () => {
  return <FooterClass />;
};

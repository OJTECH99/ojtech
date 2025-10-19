import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Button } from './ui/Button';
import { AuthContext } from '../providers/AuthProvider';
import { useTheme } from 'next-themes';
import { Menu, X } from 'lucide-react';

interface NavbarState {
  isDropdownOpen: boolean;
  isMobileMenuOpen: boolean;
}

// Class component for Navbar logic
class NavbarClass extends Component<{ setTheme: (theme: string) => void; theme?: string }, NavbarState> {
  static contextType = AuthContext;
  declare context: React.ContextType<typeof AuthContext>;
  private dropdownRef = React.createRef<HTMLDivElement>();
  private mobileMenuRef = React.createRef<HTMLDivElement>();

  constructor(props: { setTheme: (theme: string) => void; theme?: string }) {
    super(props);
    this.state = {
      isDropdownOpen: false,
      isMobileMenuOpen: false
    };
  }

  componentDidMount() {
    document.addEventListener('mousedown', this.handleClickOutside);
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleClickOutside);
  }

  handleClickOutside = (event: MouseEvent) => {
    if (this.dropdownRef.current && !this.dropdownRef.current.contains(event.target as Node)) {
      this.setState({ isDropdownOpen: false });
    }
    if (this.mobileMenuRef.current && !this.mobileMenuRef.current.contains(event.target as Node)) {
      this.setState({ isMobileMenuOpen: false });
    }
  };

  toggleDropdown = () => {
    this.setState(prevState => ({
      isDropdownOpen: !prevState.isDropdownOpen
    }));
  };

  toggleMobileMenu = () => {
    this.setState(prevState => ({
      isMobileMenuOpen: !prevState.isMobileMenuOpen
    }));
  };

  closeMobileMenu = () => {
    this.setState({ isMobileMenuOpen: false });
  };

  render() {
    const { user, isLoading, logout } = this.context || {};
    const { isDropdownOpen, isMobileMenuOpen } = this.state;
    
    // Don't render anything while checking auth
    if (isLoading) {
      return (
        <nav className="w-full bg-black text-white border-b border-gray-800">
          <div className="container mx-auto px-4 flex h-14 items-center justify-between">
            <div className="flex items-center">
              <span className="font-bold text-lg mr-8">OJTech</span>
            </div>
            <div className="h-6 w-6 animate-spin rounded-full border-2 loading-spinner" />
          </div>
        </nav>
      );
    }

    return (
      <nav className="w-full bg-black text-white border-b border-gray-800 relative">
        <div className="container mx-auto px-4 flex h-14 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="font-bold text-lg">
              OJTech
            </Link>
          </div>

          {/* Desktop Navigation - Hidden on mobile */}
          {user && user.roles && (
            <div className="hidden md:flex space-x-6">
              {/* Student-specific navigation */}
              {user.roles.includes('ROLE_STUDENT') && (
                <>
                  <Link to="/opportunities" className="text-gray-400 hover:text-white transition-colors">
                    Find Jobs
                  </Link>
                  <Link to="/applications" className="text-gray-400 hover:text-white transition-colors">
                    My Applications
                  </Link>
                </>
              )}
              
              {/* Employer-specific navigation */}
              {user.roles.includes('ROLE_NLO') && !user.username?.includes('nlo_staff') && (
                <>
                  <Link to="/employer/jobs" className="text-gray-400 hover:text-white transition-colors">
                    Manage Jobs
                  </Link>
                </>
              )}
              
              {/* Admin-specific navigation */}
              {user.roles.includes('ROLE_ADMIN') && (
                <>
                  <Link to="/admin/dashboard" className="text-gray-400 hover:text-white transition-colors">
                    Dashboard
                  </Link>
                  <Link to="/admin/users" className="text-gray-400 hover:text-white transition-colors">
                    Users
                  </Link>
                  <Link to="/admin/profile" className="text-gray-400 hover:text-white transition-colors">
                    Profile
                  </Link>
                </>
              )}

              {/* NLO-specific navigation */}
              {user.roles.includes('ROLE_NLO') && user.username === 'nlo_staff' && (
                <>
                  <Link to="/employer/jobs" className="text-gray-400 hover:text-white transition-colors">
                    Manage Jobs
                  </Link>
                  <Link to="/nlo/students/verification" className="text-gray-400 hover:text-white transition-colors">
                    Student Verification
                  </Link>
                  <Link to="/nlo/companies" className="text-gray-400 hover:text-white transition-colors">
                    Companies
                  </Link>
                </>
              )}
            </div>
          )}
          
          {/* Right side controls */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {user ? (
              <>
                {/* Role Badge - Hidden on very small screens */}
                {user.roles && user.roles.length > 0 && (
                  <span className="hidden sm:block px-2 py-1 text-xs rounded-full bg-gray-700 text-white font-medium">
                    {user.roles.includes('ROLE_ADMIN') 
                      ? 'Admin' 
                      : user.roles.includes('ROLE_NLO') 
                        ? 'Employer' 
                          : 'Student'}
                  </span>
                )}
                
                {/* Profile Dropdown */}
                <div className="relative z-50 pointer-events-auto" ref={this.dropdownRef}>
                  <button 
                    onClick={this.toggleDropdown}
                    className="h-8 w-8 rounded-full bg-gray-700 cursor-pointer flex items-center justify-center overflow-hidden hover:ring-2 hover:ring-gray-600 transition-all"
                  >
                    {user.profile?.avatar_url ? (
                      <img 
                        src={user.profile.avatar_url} 
                        alt="Avatar" 
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-white text-sm">
                        {user.username?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    )}
                  </button>
                  
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 pointer-events-auto">
                      <Link 
                        to="/profile" 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                        onClick={this.toggleDropdown}
                      >
                        {user.roles?.includes('ROLE_NLO') ? "Company Profile" : "My Profile"}
                      </Link>
                      
                      {/* Resume Management link for students only */}
                      {user.roles?.includes('ROLE_STUDENT') && (
                        <Link 
                          to="/resume" 
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                          onClick={this.toggleDropdown}
                        >
                          Manage Resume
                        </Link>
                      )}
                      
                      <button 
                        onClick={() => {
                          if (logout) logout();
                          this.toggleDropdown();
                        }} 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>

                {/* Mobile Menu Button - Only show for logged in users */}
                <button 
                  onClick={this.toggleMobileMenu}
                  className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
                  aria-label="Toggle mobile menu"
                >
                  {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hidden sm:block">
                  <Button variant="ghost" className="text-white text-sm">Log In</Button>
                </Link>
                <Link to="/register">
                  <Button className="bg-white text-black hover:bg-gray-200 text-sm px-3 sm:px-4">Sign Up</Button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {user && isMobileMenuOpen && (
          <div 
            ref={this.mobileMenuRef}
            className="md:hidden absolute top-14 left-0 right-0 bg-black border-b border-gray-800 shadow-lg z-40"
          >
            <div className="container mx-auto px-4 py-4 space-y-3">
              {/* Student-specific navigation */}
              {user.roles?.includes('ROLE_STUDENT') && (
                <>
                  <Link 
                    to="/opportunities" 
                    className="block text-gray-400 hover:text-white transition-colors py-2"
                    onClick={this.closeMobileMenu}
                  >
                    Find Jobs
                  </Link>
                  <Link 
                    to="/applications" 
                    className="block text-gray-400 hover:text-white transition-colors py-2"
                    onClick={this.closeMobileMenu}
                  >
                    My Applications
                  </Link>
                </>
              )}
              
              {/* Employer-specific navigation */}
              {user.roles?.includes('ROLE_NLO') && !user.username?.includes('nlo_staff') && (
                <>
                  <Link 
                    to="/employer/jobs" 
                    className="block text-gray-400 hover:text-white transition-colors py-2"
                    onClick={this.closeMobileMenu}
                  >
                    Manage Jobs
                  </Link>
                </>
              )}
              
              {/* Admin-specific navigation */}
              {user.roles?.includes('ROLE_ADMIN') && (
                <>
                  <Link 
                    to="/admin/dashboard" 
                    className="block text-gray-400 hover:text-white transition-colors py-2"
                    onClick={this.closeMobileMenu}
                  >
                    Dashboard
                  </Link>
                  <Link 
                    to="/admin/users" 
                    className="block text-gray-400 hover:text-white transition-colors py-2"
                    onClick={this.closeMobileMenu}
                  >
                    Users
                  </Link>
                  <Link 
                    to="/admin/profile" 
                    className="block text-gray-400 hover:text-white transition-colors py-2"
                    onClick={this.closeMobileMenu}
                  >
                    Profile
                  </Link>
                </>
              )}

              {/* NLO-specific navigation */}
              {user.roles?.includes('ROLE_NLO') && user.username === 'nlo_staff' && (
                <>
                  <Link 
                    to="/employer/jobs" 
                    className="block text-gray-400 hover:text-white transition-colors py-2"
                    onClick={this.closeMobileMenu}
                  >
                    Manage Jobs
                  </Link>
                  <Link 
                    to="/nlo/students/verification" 
                    className="block text-gray-400 hover:text-white transition-colors py-2"
                    onClick={this.closeMobileMenu}
                  >
                    Student Verification
                  </Link>
                  <Link 
                    to="/nlo/companies" 
                    className="block text-gray-400 hover:text-white transition-colors py-2"
                    onClick={this.closeMobileMenu}
                  >
                    Companies
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    );
  }
} 

// Wrapper component to provide theme context
export const Navbar: React.FC = () => {
  const { setTheme, theme } = useTheme();
  return <NavbarClass setTheme={setTheme} theme={theme} />;
}; 
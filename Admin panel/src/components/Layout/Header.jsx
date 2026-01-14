import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Header = ({ onMenuClick, collapsed }) => {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showMenu && !event.target.closest('.user-menu')) {
        setShowMenu(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showMenu]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className={`fixed top-0 right-0 left-0 h-16 bg-white/80 backdrop-blur-sm border-b border-gray-200/50 shadow-sm flex items-center justify-between transition-all duration-300 z-30 ${
      collapsed ? 'lg:left-20 lg:px-4' : 'lg:left-64 lg:px-6'
    } px-4 sm:px-6`}>
      <div className='w-full flex items-center justify-between'>
        {/* Mobile Menu Button */}
        <button
          className="lg:hidden p-2 -ml-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          onClick={onMenuClick}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Desktop: Breadcrumb or Title */}
        <div className="hidden lg:flex items-center">
          {collapsed && (
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">A</span>
            </div>
          )}
        </div>

        {/* Spacer for mobile */}
        <div className="lg:hidden flex-1" />

        {/* User Menu */}
        <div className="relative user-menu">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200 ${collapsed ? 'lg:px-2 lg:gap-1' : ''
              }`}
          >
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
              {admin?.username?.charAt(0).toUpperCase()}
            </div>
            {!collapsed && (
              <span className="hidden sm:block text-sm font-medium text-gray-700">{admin?.username}</span>
            )}
            {!collapsed && (
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                <p className="text-sm font-medium text-gray-900">{admin?.username}</p>
                <p className="text-xs text-gray-500 mt-0.5">{admin?.email}</p>
                <span className="inline-block mt-1.5 text-xs px-2 py-0.5 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 border border-blue-200 rounded">
                  {admin?.adminType}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Search, LibraryMusic, Logout, QueueMusic } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  return (
    <nav className="fixed top-0 left-0 bottom-0 w-64 bg-black text-gray-400 p-6 z-50">
      <div className="flex flex-col h-full">
        <div className="mb-8">
          <Link to="/" className="flex items-center space-x-2">
          <img
  src="/logo.png"
  alt="Music Platform Logo"
  className="w-10 h-10 mr-2"
/>
<span className="text-2xl font-bold text-white">Music</span>

           
          </Link>
        </div>

        <div className="space-y-4">
          <Link
            to="/"
            className={`flex items-center space-x-4 px-2 py-2 rounded-md transition-colors ${
              location.pathname === '/'
                ? 'text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Home className={location.pathname === '/' ? 'text-white' : ''} />
            <span className="font-bold">Home</span>
          </Link>
          <Link
            to="/search"
            className={`flex items-center space-x-4 px-2 py-2 rounded-md transition-colors ${
              location.pathname === '/search'
                ? 'text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Search className={location.pathname === '/search' ? 'text-white' : ''} />
            <span className="font-bold">Search</span>
          </Link>
          <Link
            to="/library"
            className={`flex items-center space-x-4 px-2 py-2 rounded-md transition-colors ${
              location.pathname === '/library'
                ? 'text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <LibraryMusic className={location.pathname === '/library' ? 'text-white' : ''} />
            <span className="font-bold">Your Library</span>
          </Link>
          <Link
            to="/smart-playlist"
            className={`flex items-center space-x-4 px-2 py-2 rounded-md transition-colors ${location.pathname === '/smart-playlist' ? 'text-white' : 'text-gray-400 hover:text-white'}`}
          >
            <QueueMusic className={location.pathname === '/smart-playlist' ? 'text-white' : ''} />
            <span className="font-bold">Smart Playlist</span>
          </Link>
        </div>

        <div className="mt-10 pt-4 border-t border-gray-800">
  <div className="px-2">
    <button
      onClick={handleLogout}
      className="flex items-center space-x-4 px-2 py-2 text-gray-400 hover:text-white transition-colors w-full"
    >
      <Logout className="text-gray-400" />
      <span className="font-bold">Logout</span>
    </button>
  </div>
</div>

      </div>
    </nav>
  );
};

export default Navbar;

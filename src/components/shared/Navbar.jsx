import React, { useContext } from 'react';
import { Home, LogOut, User, Key, Lollipop, Luggage, Magnet, MapIcon, MapPinCheck, MapPinHouse, Mars, Martini, MegaphoneIcon } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';

const Navbar = ({ title, setView }) => {
  const { user, handleLogout } = useContext(AuthContext);
  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md p-4 flex justify-between items-center fixed top-0 left-0 w-full z-10">
      <div className="flex items-center">
        <Home className="text-blue-500 mr-2" />
        <h1 className="text-xl font-bold">{title}</h1>
      </div>
      <div className="flex items-center space-x-4">
        {user?.profile?.role === 'resident' && (
          <button onClick={() => setView('resident-dashboard')} className="p-2 rounded-full hover:bg-yellow-300 dark:hover:bg-gray-700 transition">
            <User />
          </button>
        )}
        {(user?.profile?.role === 'admin' || user?.profile?.role === 'staff') && (
          <button onClick={() => setView('admin-dashboard')} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition">
            <Key />
          </button>
        )}
        <button onClick={handleLogout} className="p-2 rounded-full hover:bg-red-500 dark:hover:bg-gray-700 transition">
          <LogOut />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
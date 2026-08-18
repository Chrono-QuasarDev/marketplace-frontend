import { Link, useNavigate } from 'react-router-dom';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import {
  ShoppingBagIcon,
  UserCircleIcon,
  PlusCircleIcon,
  TruckIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import useAuthStore from '../../stores/authStore';

function Navbar() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, isSeller, isAdmin, isBuyer } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <ShoppingBagIcon className="h-8 w-8 text-primary-600" />
            <span className="text-xl font-bold text-gray-900">MarketPlace</span>
          </Link>

          <div className="flex items-center space-x-4">
            <Link to="/products" className="text-gray-600 hover:text-gray-900">
              Browse Products
            </Link>

            {isAuthenticated ? (
              <Menu as="div" className="relative">
                <MenuButton className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
                  <UserCircleIcon className="h-8 w-8" />
                  <span className="hidden md:inline">{user?.username}</span>
                </MenuButton>
                <MenuItems className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 border border-gray-200 z-50 focus:outline-none">
                  <MenuItem>
                    <Link to="/profile" className="block px-4 py-2 text-sm data-[focus]:bg-gray-100">
                      Profile
                    </Link>
                  </MenuItem>
                  {isSeller() && (
                    <>
                      <MenuItem>
                        <Link to="/products/create" className="block px-4 py-2 text-sm data-[focus]:bg-gray-100">
                          <PlusCircleIcon className="inline-block h-4 w-4 mr-2" />
                          Sell Product
                        </Link>
                      </MenuItem>
                      <MenuItem>
                        <Link to="/orders" className="block px-4 py-2 text-sm data-[focus]:bg-gray-100">
                          <TruckIcon className="inline-block h-4 w-4 mr-2" />
                          Orders
                        </Link>
                      </MenuItem>
                    </>
                  )}
                  {isBuyer() && (
                    <MenuItem>
                      <Link to="/orders" className="block px-4 py-2 text-sm data-[focus]:bg-gray-100">
                        <ShoppingBagIcon className="inline-block h-4 w-4 mr-2" />
                        My Orders
                      </Link>
                    </MenuItem>
                  )}
                  {isAdmin() && (
                    <MenuItem>
                      <Link to="/admin" className="block px-4 py-2 text-sm data-[focus]:bg-gray-100">
                        <ChartBarIcon className="inline-block h-4 w-4 mr-2" />
                        Admin Dashboard
                      </Link>
                    </MenuItem>
                  )}
                  <hr className="my-1" />
                  <MenuItem>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 data-[focus]:bg-gray-100"
                    >
                      Logout
                    </button>
                  </MenuItem>
                </MenuItems>
              </Menu>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login" className="text-gray-600 hover:text-gray-900">
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

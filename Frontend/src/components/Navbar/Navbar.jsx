import React, { useState } from "react";
import {
  ChevronDown,
  User,
  LogOut,
  Wallet,
  Settings,
  Shield,
  BarChart3,
  Bell,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useWebSocket } from "../../hooks/useWebSocket";
import LoginModal from "../Auth/LoginModal";
import RegisterModal from "../Auth/RegisterModal";

const Navbar = () => {
  const { user, isAuthenticated, logout, isLoading } = useAuth();
  const { isConnected } = useWebSocket();
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications] = useState([
    { id: 1, message: "Welcome to SafeSwap!" },
    { id: 2, message: "Your swap was successful." },
    { id: 3, message: "New feature: Scam detection upgraded!" },
  ]);

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  const switchToRegister = () => {
    setShowLoginModal(false);
    setShowRegisterModal(true);
  };

  const switchToLogin = () => {
    setShowRegisterModal(false);
    setShowLoginModal(true);
  };

  return (
    <>
      <nav className="bg-[#18181c] border-b border-[#23232a] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-cyan-600 rounded-full flex items-center justify-center">
                <Shield size={20} className="text-white" />
              </div>
              <span className="text-xl font-bold text-white">SafeSwap</span>
            </Link>
            {/* WebSocket Status */}
            <div className="flex items-center space-x-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  isConnected ? "bg-green-500" : "bg-red-500"
                }`}
              ></div>
              <span className="text-xs text-gray-400">
                {isConnected ? "Live" : "Offline"}
              </span>
            </div>
          </div>

          {/* Navigation Menu */}
          <div className="flex items-center space-x-8">
            <Link
              to="/"
              className={`px-3 py-2 rounded-lg transition ${
                location.pathname === "/"
                  ? "text-cyan-400 bg-cyan-600/10"
                  : "text-gray-300 hover:text-cyan-400"
              }`}
            >
              Home
            </Link>
            <Link
              to="/swap"
              className={`px-3 py-2 rounded-lg transition ${
                location.pathname === "/swap"
                  ? "text-cyan-400 bg-cyan-600/10"
                  : "text-gray-300 hover:text-cyan-400"
              }`}
            >
              Swap
            </Link>
            <Link
              to="/feature"
              className={`px-3 py-2 rounded-lg transition ${
                location.pathname === "/feature"
                  ? "text-cyan-400 bg-cyan-600/10"
                  : "text-gray-300 hover:text-cyan-400"
              }`}
            >
              Feature
            </Link>
            <Link
              to="/pricing"
              className={`px-3 py-2 rounded-lg transition ${
                location.pathname === "/pricing"
                  ? "text-cyan-400 bg-cyan-600/10"
                  : "text-gray-300 hover:text-cyan-400"
              }`}
            >
              Pricing
            </Link>
            {isAuthenticated && (
              <Link
                to="/dashboard"
                className={`px-3 py-2 rounded-lg transition ${
                  location.pathname === "/dashboard"
                    ? "text-cyan-400 bg-cyan-600/10"
                    : "text-gray-300 hover:text-cyan-400"
                }`}
              >
                Dashboard
              </Link>
            )}
          </div>

          {/* User Section */}
          <div className="flex items-center space-x-4">
            {/* Notification Bell */}
            <div className="relative">
              <button
                className="relative p-2 rounded-full hover:bg-[#23232a] focus:outline-none"
                onClick={() => setShowNotifications((prev) => !prev)}
                onMouseEnter={() => setShowNotifications(true)}
                onMouseLeave={() => setShowNotifications(false)}
              >
                <Bell className="w-6 h-6 text-cyan-400" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs font-bold rounded-full px-1.5 py-0.5 border-2 border-[#18181c]">
                    {notifications.length}
                  </span>
                )}
              </button>
              {/* Notification Dropdown */}
              {showNotifications && (
                <div
                  className="absolute right-0 mt-2 w-80 bg-[#18181c] border border-[#23232a] rounded-xl shadow-lg py-2 z-50"
                  onMouseEnter={() => setShowNotifications(true)}
                  onMouseLeave={() => setShowNotifications(false)}
                >
                  <div className="px-4 py-2 border-b border-[#23232a] text-white font-semibold">
                    Notifications
                  </div>
                  {notifications.length === 0 ? (
                    <div className="px-4 py-4 text-gray-400 text-center">
                      No notifications
                    </div>
                  ) : (
                    <ul className="max-h-60 overflow-y-auto">
                      {notifications.map((n) => (
                        <li
                          key={n.id}
                          className="px-4 py-3 text-gray-200 hover:bg-[#23232a] transition border-b border-[#23232a] last:border-b-0"
                        >
                          {n.message}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
            {!isLoading && (
              <>
                {isAuthenticated ? (
                  <div className="relative">
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center space-x-3 bg-[#111112] px-4 py-2 rounded-xl border border-[#23232a] hover:border-cyan-600 transition"
                    >
                      {user?.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-8 h-8 rounded-full"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-cyan-600 rounded-full flex items-center justify-center">
                          <User size={16} className="text-white" />
                        </div>
                      )}
                      <div className="text-left">
                        <p className="text-white font-medium text-sm">
                          {user?.name}
                        </p>
                        <p className="text-gray-400 text-xs">{user?.email}</p>
                      </div>
                      <ChevronDown size={16} className="text-gray-400" />
                    </button>

                    {/* User Dropdown */}
                    {showUserMenu && (
                      <div className="absolute right-0 mt-2 w-64 bg-[#18181c] border border-[#23232a] rounded-xl shadow-lg py-2 z-50">
                        <div className="px-4 py-2 border-b border-[#23232a]">
                          <p className="text-white font-medium">{user?.name}</p>
                          <p className="text-gray-400 text-sm">{user?.email}</p>
                          {user?.walletAddress && (
                            <p className="text-cyan-500 text-xs mt-1">
                              {user.walletAddress.slice(0, 6)}...
                              {user.walletAddress.slice(-4)}
                            </p>
                          )}
                        </div>

                        <Link
                          to="/dashboard"
                          className="w-full px-4 py-2 text-left text-gray-300 hover:bg-[#23232a] transition flex items-center space-x-2"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <BarChart3 size={16} />
                          <span>Dashboard</span>
                        </Link>

                        <Link
                          to="/wallet"
                          className="w-full px-4 py-2 text-left text-gray-300 hover:bg-[#23232a] transition flex items-center space-x-2"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <Wallet size={16} />
                          <span>Wallet</span>
                        </Link>

                        <Link
                          to="/settings"
                          className="w-full px-4 py-2 text-left text-gray-300 hover:bg-[#23232a] transition flex items-center space-x-2"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <Settings size={16} />
                          <span>Settings</span>
                        </Link>

                        <hr className="border-[#23232a] my-2" />

                        <button
                          onClick={handleLogout}
                          className="w-full px-4 py-2 text-left text-red-400 hover:bg-[#23232a] transition flex items-center space-x-2"
                        >
                          <LogOut size={16} />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setShowLoginModal(true)}
                      className="px-4 py-2 text-cyan-600 hover:text-cyan-500 font-medium transition"
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => setShowRegisterModal(true)}
                      className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-medium rounded-xl transition"
                    >
                      Sign Up
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Click outside to close user menu */}
        {showUserMenu && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowUserMenu(false)}
          />
        )}
      </nav>

      {/* Auth Modals */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSwitchToRegister={switchToRegister}
      />

      <RegisterModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onSwitchToLogin={switchToLogin}
      />
    </>
  );
};

export default Navbar;

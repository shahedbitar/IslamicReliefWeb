import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, User as UserIcon } from "lucide-react";

export default function AuthHeader() {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getRoleLabel = (role: string, portfolio?: string) => {
    if (role === "co-president") return "Co-President";
    if (role === "vp" && portfolio)
      return `VP - ${portfolio.charAt(0).toUpperCase() + portfolio.slice(1)}`;
    if (role === "team-member") return "Team Member";
    if (role === "volunteer") return "Volunteer";
    return role;
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <Link to="/dashboard" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg group-hover:bg-blue-700 transition-colors">
                I
              </div>
              <span className="font-bold text-gray-900 hidden sm:inline">
                IRC
              </span>
            </Link>

            <nav className="flex items-center gap-6 hidden md:flex">
              <Link
                to="/dashboard"
                className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
              >
                Dashboard
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {/* User Menu */}
            <div ref={userMenuRef} className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <UserIcon className="w-4 h-4 text-blue-600" />
                </div>
                <span className="hidden sm:inline text-sm font-medium text-gray-900">
                  {user?.name}
                </span>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200">
                  <div className="p-4 border-b border-gray-200">
                    <p className="font-semibold text-gray-900 text-sm">
                      {user?.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {user?.email}
                    </p>
                    <p className="text-xs text-blue-600 font-semibold mt-2">
                      {getRoleLabel(user?.role || "", user?.portfolio)}
                    </p>
                  </div>
                  <div className="border-t border-gray-200 py-2">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

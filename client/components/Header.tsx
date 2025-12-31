import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg group-hover:bg-blue-700 transition-colors">
              I
            </div>
            <span className="font-bold text-gray-900 hidden sm:inline">
              Islamic Relief Canada
            </span>
            <span className="font-bold text-gray-900 sm:hidden">IRC</span>
          </Link>
        </div>
      </div>
    </header>
  );
}

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="text-center">
            <div className="mb-8">
              <h1 className="text-6xl sm:text-7xl font-bold text-blue-600 mb-4">
                404
              </h1>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Page Not Found
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
                The page you're looking for doesn't exist or is still being
                developed. Please check back soon or return to the home page.
              </p>
            </div>

            <div className="flex gap-4 justify-center flex-wrap sm:flex-nowrap">
              <Link
                to="/"
                className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-block"
              >
                Back to Home
              </Link>
              <Link
                to="/dashboard"
                className="px-8 py-3 border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors inline-block"
              >
                Go to Dashboard
              </Link>
            </div>

            <div className="mt-16 bg-gray-50 rounded-xl p-8 border border-gray-200 max-w-2xl mx-auto">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Exploring New Features?
              </h3>
              <p className="text-gray-600 mb-6">
                We're constantly expanding the IRC system with new features and
                pages. If you're looking for something specific, feel free to
                reach out to the team or check back soon!
              </p>
              <p className="text-sm text-gray-500">
                For questions or support, contact IRC at contact@ircanada.org
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NotFound;

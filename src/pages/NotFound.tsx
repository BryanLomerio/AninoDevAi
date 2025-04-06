import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";

const useLog404Error = (path: string) => {
  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", path);
  }, [path]);
};

const NotFound = () => {
  const location = useLocation();

  useLog404Error(location.pathname);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
      <div className="text-center space-y-6 px-6 py-8 bg-white rounded-xl shadow-lg max-w-lg">
        <h1 className="text-6xl font-extrabold text-red-600">Uh-oh!</h1>
        <p className="text-3xl text-gray-800 mb-4">Looks like the page you're searching for doesn't exist.</p>
        <p className="text-lg text-gray-500">The requested URL <strong>{location.pathname}</strong> could not be found on this server.</p>
        <Link to="/" className="mt-6 inline-block px-6 py-3 text-lg text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md transition duration-300">
          Go Back to Homepage
        </Link>
      </div>
    </div>
  );
};

export default NotFound;

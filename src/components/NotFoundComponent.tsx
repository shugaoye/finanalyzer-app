import { Link } from "@tanstack/react-router";

function NotFoundComponent() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-slate-900 mb-4">
          Page Not Found
        </h2>
        <p className="text-slate-600 mb-6">
          The page you are looking for does not exist.
        </p>
        <Link to="/" className="text-blue-600 hover:text-blue-800">
          Go back to Home
        </Link>
      </div>
    </div>
  );
}

export default NotFoundComponent;
import { Link } from "react-router-dom";

function NotFound() {
    return (
        <div className="h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-100 mt-16">
            <div className="max-w-md w-full mx-4 px-6 py-6 bg-white rounded-xl shadow-lg text-center">
                <h2 className="text-5xl font-bold text-gray-900 mb-3">4😵4</h2>
                <div className="mb-4">
                    <img 
                        src="https://i.kym-cdn.com/photos/images/newsfeed/001/042/619/4ea.jpg" 
                        alt="John Travolta Confused Meme" 
                        className="w-full h-48 object-cover rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300"
                    />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    Looks like you're lost!
                </h3>
                <p className="text-gray-600 mb-4 text-sm">
                    The page you're looking for has pulled a disappearing act. 
                    Maybe it's on vacation? 🏖️
                </p>
                <div className="space-y-2">
                    <Link 
                        to="/login" 
                        className="block w-full bg-gray-900 text-white py-2 px-4 rounded-lg hover:bg-gray-800 transition-colors duration-300 font-medium text-sm"
                    >
                        Go to Login
                    </Link>
                    <Link 
                        to="/" 
                        className="block w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors duration-300 text-sm"
                    >
                        Back to Home
                    </Link>
                </div>
                <p className="mt-4 text-xs text-gray-500">
                    Pro tip: If you're seeing this page, either you've discovered a new dimension, 
                    or you might want to check that URL again! 🕵️‍♂️
                </p>
            </div>
        </div>
    );
}

export default NotFound;
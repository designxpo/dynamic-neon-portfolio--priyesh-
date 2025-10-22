import React, { useState } from 'react';

interface LoginPageProps {
    onLoginSuccess: () => void;
    password?: string;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, password = 'admin' }) => {
    const [enteredPassword, setEnteredPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (enteredPassword === password) {
            setError('');
            onLoginSuccess();
        } else {
            setError('Invalid password.');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="p-8 bg-white rounded-lg shadow-md w-full max-w-sm">
                <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">Admin Login</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <input
                            type="password"
                            value={enteredPassword}
                            onChange={(e) => setEnteredPassword(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-purple focus:border-brand-purple sm:text-sm text-gray-900"
                            required
                        />
                    </div>
                    {error && <p className="text-sm text-red-600">{error}</p>}
                    <button
                        type="submit"
                        className="w-full bg-brand-purple text-white px-5 py-2 rounded-lg hover:bg-brand-purple-light transition-colors duration-300"
                    >
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;

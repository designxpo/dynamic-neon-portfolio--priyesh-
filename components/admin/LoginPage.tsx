import React, { useState } from 'react';
import { Lock, Mail, LogIn } from 'lucide-react';

interface LoginPageProps {
    onLoginSuccess: () => void;
    password?: string;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, password = 'admin' }) => {
    const [email, setEmail] = useState('');
    const [enteredPassword, setEnteredPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Simple validation
        if (!email) {
            setError('Email is required.');
            return;
        }
        
        if (enteredPassword === password) {
            setError('');
            onLoginSuccess();
        } else {
            setError('Invalid password.');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-black via-black to-deep-violet/20 relative overflow-hidden">
            {/* Animated background effects */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-electric-blue/50 to-transparent"></div>
            <div className="absolute -top-20 -left-20 w-64 h-64 bg-electric-blue/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-deep-violet/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-electric-blue/5 to-deep-violet/5 rounded-full blur-3xl"></div>
            
            {/* Login Card */}
            <div className="relative z-10 w-full max-w-md mx-4">
                <div className="backdrop-blur-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-2xl shadow-2xl p-8 relative overflow-hidden">
                    {/* Card glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-electric-blue/5 to-deep-violet/5 rounded-2xl"></div>
                    
                    <div className="relative z-10">
                        {/* Logo */}
                        <div className="flex justify-center mb-6">
                            <div className="relative">
                                <img
                                    src="/images/pmlogo.png"
                                    alt="Logo"
                                    className="h-20 w-auto drop-shadow-glow"
                                />
                                <div className="absolute inset-0 blur-xl bg-electric-blue/30"></div>
                            </div>
                        </div>
                        
                        {/* Title */}
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Admin Login</h1>
                            <p className="text-sm text-gray-400 tracking-wide">Enter your credentials to access the dashboard</p>
                        </div>
                        
                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Email Field */}
                            <div>
                                <label className="admin-label flex items-center gap-2 mb-2">
                                    <Mail size={16} className="text-electric-blue" />
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        setError('');
                                    }}
                                    className="admin-input"
                                    placeholder="admin@example.com"
                                    required
                                />
                            </div>
                            
                            {/* Password Field */}
                            <div>
                                <label className="admin-label flex items-center gap-2 mb-2">
                                    <Lock size={16} className="text-electric-blue" />
                                    Password
                                </label>
                                <input
                                    type="password"
                                    value={enteredPassword}
                                    onChange={(e) => {
                                        setEnteredPassword(e.target.value);
                                        setError('');
                                    }}
                                    className="admin-input"
                                    placeholder="Enter your password"
                                    required
                                />
                            </div>
                            
                            {/* Error Message */}
                            {error && (
                                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                                    <p className="text-sm text-red-400 text-center">{error}</p>
                                </div>
                            )}
                            
                            {/* Submit Button */}
                            <button
                                type="submit"
                                className="admin-button-primary w-full flex items-center justify-center gap-2 py-3 text-base"
                            >
                                <LogIn size={20} />
                                Sign In
                            </button>
                        </form>
                        
                        {/* Footer Note */}
                        <div className="mt-6 text-center">
                            <p className="text-xs text-gray-500">
                                Default password: <span className="text-electric-blue font-mono">admin</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;

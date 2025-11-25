import React, { useState } from 'react';
import { auth } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

const Auth = ({ onAuthSuccess }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                await createUserWithEmailAndPassword(auth, email, password);
            }
            if (onAuthSuccess) onAuthSuccess();
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-dark-bg relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-neon-purple opacity-20 blur-[100px] rounded-full"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-neon-blue opacity-20 blur-[100px] rounded-full"></div>
            </div>

            <div className="z-10 w-full max-w-md p-8 bg-dark-surface rounded-2xl border border-gray-800 shadow-[0_0_50px_rgba(0,0,0,0.5)] backdrop-blur-sm relative">
                <button
                    onClick={() => onAuthSuccess && onAuthSuccess()}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white"
                >
                    ✕
                </button>
                <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">
                    {isLogin ? 'Welcome Back' : 'Join FreeCanvas'}
                </h2>

                {error && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded text-red-500 text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-gray-400 text-sm font-bold mb-2">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="input-field"
                            placeholder="artist@example.com"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-400 text-sm font-bold mb-2">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="input-field"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button type="submit" className="w-full btn-primary py-3 text-lg shadow-[0_0_20px_rgba(0,243,255,0.3)]">
                        {isLogin ? 'Start Drawing' : 'Create Account'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-gray-400 hover:text-white text-sm underline decoration-neon-pink decoration-2 underline-offset-4 transition-colors"
                    >
                        {isLogin ? "Don't have an account? Sign up" : "Already have an account? Log in"}
                    </button>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-800 text-center">
                    <p className="text-xs text-gray-500">
                        Guests are not allowed. <br />
                        <span className="text-neon-pink">Registration required to prevent bots.</span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Auth;

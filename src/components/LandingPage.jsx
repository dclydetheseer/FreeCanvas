import React, { useState } from 'react';
import { ArrowRight, Palette, Globe, Zap, Users, LogIn } from 'lucide-react';

const LandingPage = ({ onGetStarted, onViewGallery, onJoinRoom, onLogin }) => {
    const [roomId, setRoomId] = useState('');

    return (
        <div className="min-h-screen bg-dark-bg text-white overflow-y-auto overflow-x-hidden relative">
            {/* Header / Nav */}
            <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-50">
                <div className="text-2xl font-bold bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">
                    FreeCanvas
                </div>
                <button
                    onClick={onLogin}
                    className="flex items-center gap-2 px-4 py-2 bg-dark-surface border border-gray-700 rounded-lg hover:border-neon-blue transition-colors text-sm font-bold"
                >
                    <LogIn size={16} />
                    Login / Sign Up
                </button>
            </div>

            {/* Hero Section */}
            <main className="flex-1 flex flex-col items-center justify-center text-center px-4 relative z-10 min-h-screen pt-20">
                {/* Background Effects */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-neon-purple opacity-20 blur-[120px] rounded-full animate-pulse"></div>
                    <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-neon-blue opacity-20 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
                </div>

                <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tighter animate-heavy-fade-in">
                    CREATE <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink animate-pulse">TOGETHER</span>
                </h1>
                <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-2xl animate-heavy-fade-in" style={{ animationDelay: '0.2s' }}>
                    The ultimate real-time collaborative drawing platform. <br />
                    No limits. Just art.
                </p>

                <div className="flex flex-col md:flex-row gap-6 animate-heavy-fade-in" style={{ animationDelay: '0.4s' }}>
                    <button
                        onClick={onGetStarted}
                        className="px-8 py-4 bg-neon-blue text-black font-black text-xl rounded-full hover:bg-white hover:scale-105 transition-all shadow-[0_0_20px_rgba(0,243,255,0.5)] hover-heavy"
                    >
                        JOIN GLOBAL SERVER
                    </button>
                    <div className="flex items-center gap-2 bg-dark-surface p-2 rounded-full border border-gray-700 hover-heavy">
                        <input
                            type="text"
                            placeholder="Private Room ID"
                            value={roomId}
                            onChange={(e) => setRoomId(e.target.value)}
                            className="bg-transparent px-4 py-2 outline-none text-white w-40"
                        />
                        <button
                            onClick={() => roomId && onJoinRoom(roomId)}
                            className="p-2 bg-gray-700 rounded-full hover:bg-neon-purple hover:text-black transition-colors"
                        >
                            <ArrowRight />
                        </button>
                    </div>
                    {/* <div className="mt-4">
                        <button
                            onClick={onViewGallery}
                            className="w-full px-6 py-3 border border-gray-700 text-white font-bold rounded-lg hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
                        >
                            <Palette size={20} />
                            View Gallery
                        </button>
                    </div> */}
                </div>
            </main>

            {/* Feature Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 max-w-6xl w-full z-10 px-4 pb-20 mx-auto">
                <div className="p-6 rounded-2xl bg-dark-surface border border-gray-800 hover:border-neon-purple/50 transition-colors group animate-heavy-slide-up" style={{ animationDelay: '0.6s' }}>
                    <div className="w-12 h-12 rounded-lg bg-neon-purple/20 flex items-center justify-center text-neon-purple mb-4 group-hover:scale-110 transition-transform">
                        <Globe size={24} />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Global Multiplayer</h3>
                    <p className="text-gray-400">Collaborate with anyone, anywhere in the world instantly.</p>
                </div>
                <div className="p-6 rounded-2xl bg-dark-surface border border-gray-800 hover:border-neon-blue/50 transition-colors group animate-heavy-slide-up" style={{ animationDelay: '0.7s' }}>
                    <div className="w-12 h-12 rounded-lg bg-neon-blue/20 flex items-center justify-center text-neon-blue mb-4 group-hover:scale-110 transition-transform">
                        <Zap size={24} />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Zero Latency</h3>
                    <p className="text-gray-400">Powered by Firebase for lightning-fast stroke synchronization.</p>
                </div>
                <div className="p-6 rounded-2xl bg-dark-surface border border-gray-800 hover:border-neon-pink/50 transition-colors group animate-heavy-slide-up" style={{ animationDelay: '0.8s' }}>
                    <div className="w-12 h-12 rounded-lg bg-neon-pink/20 flex items-center justify-center text-neon-pink mb-4 group-hover:scale-110 transition-transform">
                        <Palette size={24} />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Pro Tools</h3>
                    <p className="text-gray-400">Advanced brushes, layers, and export options for professionals.</p>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;

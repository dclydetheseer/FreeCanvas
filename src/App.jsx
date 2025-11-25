import React, { useEffect, useState } from 'react';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import Auth from './components/Auth';
import Canvas from './components/Canvas';
import Ads from './components/Ads';
import LandingPage from './components/LandingPage';
import Gallery from './components/Gallery';
import Profile from './components/Profile';
import Chat from './components/Chat';
import Modal from './components/Modal';
import VoiceChat from './components/VoiceChat';

function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('landing'); // landing, gallery, app, profile
    const [isPro, setIsPro] = useState(false);
    const [currentRoom, setCurrentRoom] = useState('global');

    // Modal State
    const [modalOpen, setModalOpen] = useState(false);
    const [modalConfig, setModalConfig] = useState({ title: '', message: '', onConfirm: null });

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
            // Don't auto-redirect to app, let them choose a room first
        });
        return () => unsubscribe();
    }, []);

    const handleGoPro = () => {
        setIsPro(true);
        setModalConfig({
            title: 'Welcome to Pro!',
            message: 'Ads have been removed. Enjoy the premium experience!',
            onConfirm: () => setModalOpen(false)
        });
        setModalOpen(true);
    };

    const handleJoinRoom = (roomId) => {
        if (!user) {
            setModalConfig({
                title: 'Authentication Required',
                message: 'Please sign in or create an account to join a room!',
                onConfirm: () => {
                    setModalOpen(false);
                    setView('auth');
                }
            });
            setModalOpen(true);
            return;
        }
        setCurrentRoom(roomId);
        setView('app');
    };

    if (loading) {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-dark-bg text-neon-blue">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neon-blue"></div>
            </div>
        );
    }

    if (view === 'gallery') {
        return <Gallery onBack={() => setView('landing')} />;
    }

    if (view === 'profile' && user) {
        return <Profile user={user} isPro={isPro} onBack={() => setView('app')} />;
    }

    if (view === 'auth') {
        return <Auth onAuthSuccess={() => setView('landing')} />;
    }

    if (view === 'landing') {
        return (
            <>
                <LandingPage
                    onGetStarted={() => handleJoinRoom('global')}
                    onJoinRoom={handleJoinRoom}
                    onViewGallery={() => setView('gallery')}
                    onLogin={() => setView('auth')}
                />
                <Modal
                    isOpen={modalOpen}
                    onClose={() => setModalOpen(false)}
                    title={modalConfig.title}
                >
                    <div className="space-y-4">
                        <p>{modalConfig.message}</p>
                        <div className="flex justify-end">
                            <button
                                onClick={modalConfig.onConfirm || (() => setModalOpen(false))}
                                className="px-4 py-2 bg-neon-blue text-black font-bold rounded hover:bg-white transition-colors"
                            >
                                OK
                            </button>
                        </div>
                    </div>
                </Modal>
            </>
        );
    }

    return (
        <div className="h-screen w-screen flex flex-col">
            {!user ? (
                <Auth />
            ) : (
                <div className="flex-1 flex relative">
                    {!isPro && <Ads position="left" onGoPro={handleGoPro} />}
                    <div className="flex-1 relative">
                        <Canvas user={user} isPro={isPro} roomId={currentRoom} />
                        <Chat user={user} roomId={currentRoom} />
                        <VoiceChat user={user} roomId={currentRoom} />

                        {/* Room ID Overlay */}
                        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 pointer-events-none z-50">
                            <div className="bg-dark-surface/80 backdrop-blur px-4 py-1 rounded-full border border-neon-blue/30 text-neon-blue text-xs font-mono">
                                ROOM: {currentRoom}
                            </div>
                        </div>
                        {/* Profile Button Overlay */}
                        <button
                            onClick={() => setView('profile')}
                            className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-dark-surface border border-gray-700 flex items-center justify-center hover:border-neon-blue transition-colors"
                            title="Profile"
                        >
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neon-blue to-neon-purple"></div>
                        </button>
                    </div>
                    {!isPro && <Ads position="right" onGoPro={handleGoPro} />}
                </div>
            )}

            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={modalConfig.title}
            >
                <div className="space-y-4">
                    <p>{modalConfig.message}</p>
                    <div className="flex justify-end">
                        <button
                            onClick={modalConfig.onConfirm || (() => setModalOpen(false))}
                            className="px-4 py-2 bg-neon-blue text-black font-bold rounded hover:bg-white transition-colors"
                        >
                            OK
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

export default App;

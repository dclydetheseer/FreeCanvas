import React from 'react';
import { ArrowLeft, User, Crown, Settings, LogOut } from 'lucide-react';
import { auth } from '../firebase';

const Profile = ({ user, isPro, onBack }) => {
    return (
        <div className="min-h-screen bg-dark-bg text-white p-8">
            <div className="max-w-2xl mx-auto">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
                >
                    <ArrowLeft size={24} /> Back to App
                </button>

                <div className="bg-dark-surface border border-gray-800 rounded-2xl p-8 shadow-2xl">
                    <div className="flex items-center gap-6 mb-8">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-neon-blue to-neon-purple p-1">
                            <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                                <User size={48} className="text-gray-400" />
                            </div>
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">{user.email.split('@')[0]}</h1>
                            <p className="text-gray-400">{user.email}</p>
                            {isPro && (
                                <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-neon-purple/20 text-neon-purple text-sm font-bold mt-2 border border-neon-purple/50">
                                    <Crown size={14} /> PRO MEMBER
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-xl font-bold border-b border-gray-800 pb-2 mb-4">Account Settings</h2>

                        <button className="w-full flex items-center justify-between p-4 rounded-xl bg-gray-900/50 hover:bg-gray-900 transition-colors group">
                            <div className="flex items-center gap-3">
                                <Settings size={20} className="text-gray-400 group-hover:text-white" />
                                <span>Preferences</span>
                            </div>
                            <span className="text-gray-600">Coming Soon</span>
                        </button>

                        <button
                            onClick={() => auth.signOut()}
                            className="w-full flex items-center justify-between p-4 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <LogOut size={20} />
                                <span>Sign Out</span>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;

import React from 'react';
import { X, Check, Crown } from 'lucide-react';

const ProModal = ({ onClose, onSubscribe }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-dark-surface border border-neon-purple rounded-2xl max-w-md w-full p-8 relative shadow-[0_0_50px_rgba(168,85,247,0.2)]">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white"
                >
                    <X size={24} />
                </button>

                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-neon-purple/20 text-neon-purple mb-4">
                        <Crown size={32} />
                    </div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-neon-purple to-neon-pink bg-clip-text text-transparent">
                        Upgrade to Pro
                    </h2>
                    <p className="text-gray-400 mt-2">Unlock the full potential of your creativity.</p>
                </div>

                <div className="space-y-4 mb-8">
                    <Feature icon={Check} text="Ad-free experience" />
                    <Feature icon={Check} text="Unlimited layers" />
                    <Feature icon={Check} text="4K Export quality" />
                    <Feature icon={Check} text="Custom brushes & textures" />
                </div>

                <div className="text-center">
                    <div className="text-3xl font-bold text-white mb-1">$4.99<span className="text-sm text-gray-400 font-normal">/mo</span></div>
                    <p className="text-xs text-gray-500 mb-6">Cancel anytime. No questions asked.</p>

                    <button
                        onClick={onSubscribe}
                        className="w-full py-3 bg-gradient-to-r from-neon-purple to-neon-pink text-white font-bold rounded-xl hover:scale-105 transition-transform shadow-lg shadow-neon-purple/25"
                    >
                        Start Free Trial
                    </button>
                </div>
            </div>
        </div>
    );
};

const Feature = ({ icon: Icon, text }) => (
    <div className="flex items-center gap-3">
        <div className="p-1 rounded-full bg-neon-green/20 text-neon-green">
            <Icon size={16} color="#00ff00" />
        </div>
        <span className="text-gray-200">{text}</span>
    </div>
);

export default ProModal;

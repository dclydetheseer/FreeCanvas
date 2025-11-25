import React, { useState } from 'react';
import ProModal from './ProModal';

const Ads = ({ position, onGoPro }) => {
    const [showModal, setShowModal] = useState(false);

    return (
        <div className={`hidden md:flex flex-col w-64 bg-dark-surface border-${position === 'left' ? 'r' : 'l'} border-gray-800 p-4 gap-4`}>
            <div className="flex-1 bg-gray-900 rounded-lg flex flex-col items-center justify-center border border-gray-800 relative overflow-hidden group p-4 text-center">
                <div className="absolute inset-0 bg-gradient-to-br from-neon-blue/5 to-neon-purple/5 opacity-50"></div>
                <h4 className="text-neon-blue font-bold mb-2 z-10">FreeCanvas Pro</h4>
                <p className="text-gray-500 text-xs z-10">Unlock 4K Export, Infinite Layers, and more!</p>
            </div>

            <div className="h-32 bg-gradient-to-br from-neon-purple to-neon-pink rounded-lg p-4 flex flex-col items-center justify-center text-center shadow-lg">
                <h3 className="text-white font-bold mb-2">Upgrade Now</h3>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-white text-neon-purple px-4 py-1 rounded-full text-sm font-bold hover:scale-105 transition-transform shadow-md"
                >
                    Get Pro 👑
                </button>
            </div>

            {showModal && <ProModal onClose={() => setShowModal(false)} onSubscribe={() => {
                onGoPro();
                setShowModal(false);
            }} />}
        </div>
    );
};

export default Ads;

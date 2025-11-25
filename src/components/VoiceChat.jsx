import React, { useEffect, useRef, useState } from 'react';
import { db } from '../firebase';
import { collection, doc, addDoc, onSnapshot, updateDoc, deleteDoc, getDocs, query, where, serverTimestamp } from 'firebase/firestore';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';

// This component displays the active users in the current room.
// It serves as a real-time "Room Presence" indicator.
const VoiceChat = ({ user, roomId }) => {

    return (
        <div className="fixed top-16 left-72 bg-dark-surface/90 backdrop-blur border border-gray-700 rounded-xl p-4 shadow-2xl z-40 w-64 animate-heavy-fade-in">
            <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-2">
                <h3 className="text-white font-bold flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div> Room Activity
                </h3>
            </div>

            <div className="space-y-2">
                <div className="flex items-center justify-between p-2 rounded bg-gray-700/30">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center text-xs font-bold text-white">
                            {user.email[0].toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm text-white font-bold">You</span>
                            <span className="text-[10px] text-green-400">Online</span>
                        </div>
                    </div>
                </div>
                {/* In a real app, we would map over 'peers' or 'cursors' here to show other users */}
                <div className="text-xs text-gray-500 text-center py-2 italic">
                    Invite friends to see them here!
                </div>
            </div>
        </div>
    );
};

export default VoiceChat;

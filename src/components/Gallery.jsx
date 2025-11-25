import React, { useEffect, useState } from 'react';
import { ArrowLeft, Heart, Share2 } from 'lucide-react';
import { db } from '../firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';

const Gallery = ({ onBack }) => {
    const [drawings, setDrawings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchGallery = async () => {
            try {
                const q = query(collection(db, "gallery"), orderBy("createdAt", "desc"), limit(20));
                const snapshot = await getDocs(q);
                const artDocs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setDrawings(artDocs);
            } catch (error) {
                console.error("Error fetching gallery:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchGallery();
    }, []);

    return (
        <div className="min-h-screen bg-dark-bg text-white p-8 overflow-y-auto">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-12 flex items-center justify-between">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                >
                    <ArrowLeft size={24} /> Back to Home
                </button>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">
                    Community Gallery
                </h1>
                <div className="w-24"></div> {/* Spacer */}
            </div>

            {/* Grid */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {loading ? (
                    [...Array(6)].map((_, i) => (
                        <div key={i} className="aspect-video bg-dark-surface rounded-xl animate-pulse border border-gray-800"></div>
                    ))
                ) : (
                    drawings.map((art) => (
                        <div key={art.id} className="group relative bg-dark-surface rounded-xl overflow-hidden border border-gray-800 hover:border-neon-blue/50 transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-neon-blue/10">
                            {/* Art Image */}
                            <div className="w-full aspect-video bg-gray-900">
                                <img
                                    src={art.imageUrl}
                                    alt={art.title}
                                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                    loading="lazy"
                                />
                            </div>

                            <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/90 to-transparent">
                                <h3 className="font-bold text-lg">{art.title}</h3>
                                <p className="text-sm text-gray-400">by {art.author}</p>

                                <div className="flex items-center justify-between mt-3">
                                    <button className="flex items-center gap-1 text-xs text-gray-300 hover:text-neon-pink transition-colors">
                                        <Heart size={14} /> {art.likes}
                                    </button>
                                    <button className="flex items-center gap-1 text-xs text-gray-300 hover:text-neon-blue transition-colors">
                                        <Share2 size={14} /> Share
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Gallery;

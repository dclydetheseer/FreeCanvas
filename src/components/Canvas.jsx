import React, { useRef, useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, deleteDoc, doc, writeBatch } from 'firebase/firestore';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import Toolbar from './Toolbar';
import Modal from './Modal';

const Canvas = ({ user, isPro, roomId }) => {
    const mapContainerRef = useRef(null);
    const canvasRef = useRef(null);
    const contextRef = useRef(null);
    const mapRef = useRef(null);
    const currentStrokeRef = useRef([]);

    // State
    const [isDrawing, setIsDrawing] = useState(false);
    const [color, setColor] = useState('#00f3ff');
    const [size, setSize] = useState(5);
    const [tool, setTool] = useState('pan'); // Default to 'pan' for wplace-like feel
    const [strokes, setStrokes] = useState([]);
    const [otherCursors, setOtherCursors] = useState([]);
    const [startPos, setStartPos] = useState(null);
    const [showGrid, setShowGrid] = useState(false);
    const [sticker, setSticker] = useState('🔥');

    // Layers
    const [layers, setLayers] = useState([{ id: 'layer-1', name: 'Layer 1', visible: true }]);
    const [activeLayer, setActiveLayer] = useState('layer-1');

    // Modal
    const [modalOpen, setModalOpen] = useState(false);
    const [modalConfig, setModalConfig] = useState({ title: '', type: 'alert', onConfirm: null });
    const [modalInput, setModalInput] = useState('');

    // Navigation
    const [coordinates, setCoordinates] = useState({ lng: 0, lat: 0 });
    const [showCopied, setShowCopied] = useState(false);

    // Ink State
    const MAX_INK = 100;
    const [ink, setInk] = useState(MAX_INK);
    const INK_COST_PER_METER = 0.5; // Adjust for balance
    const INK_REGEN_RATE = 10; // Per second

    // Device Detection
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    // Initialize Map
    useEffect(() => {
        if (mapRef.current) return;

        const params = new URLSearchParams(window.location.search);
        const startLng = parseFloat(params.get('lng')) || 0;
        const startLat = parseFloat(params.get('lat')) || 0;
        const startZoom = parseFloat(params.get('zoom')) || 2;

        const map = new maplibregl.Map({
            container: mapContainerRef.current,
            style: 'https://demotiles.maplibre.org/style.json',
            center: [startLng, startLat],
            zoom: startZoom,
            attributionControl: false
        });

        mapRef.current = map;

        map.on('load', () => {
            resizeCanvas();
            renderCanvas();
        });

        map.on('move', () => {
            renderCanvas();
            const center = map.getCenter();
            setCoordinates({ lng: center.lng.toFixed(4), lat: center.lat.toFixed(4) });
        });

        map.on('resize', () => {
            resizeCanvas();
            renderCanvas();
        });

        return () => {
            map.remove();
            mapRef.current = null;
        };
    }, []);

    // Ink Regeneration
    useEffect(() => {
        if (isDrawing) return;
        const interval = setInterval(() => {
            setInk(prev => Math.min(prev + (INK_REGEN_RATE / 10), MAX_INK)); // Update every 100ms
        }, 100);
        return () => clearInterval(interval);
    }, [isDrawing]);

    // Helper: Haversine Distance (Meters)
    const getDistance = (p1, p2) => {
        const R = 6371e3; // Earth radius in meters
        const φ1 = p1.lat * Math.PI / 180;
        const φ2 = p2.lat * Math.PI / 180;
        const Δφ = (p2.lat - p1.lat) * Math.PI / 180;
        const Δλ = (p2.lng - p1.lng) * Math.PI / 180;

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
    };

    // Helper: Ramer-Douglas-Peucker Simplification
    const simplifyPoints = (points, tolerance) => {
        if (points.length <= 2) return points;
        const sqTolerance = tolerance * tolerance;

        // Distance from point p to line segment v-w
        const pointLineDistSq = (p, v, w) => {
            const l2 = ((v.lng - w.lng) ** 2) + ((v.lat - w.lat) ** 2);
            if (l2 === 0) return ((p.lng - v.lng) ** 2) + ((p.lat - v.lat) ** 2);
            let t = ((p.lng - v.lng) * (w.lng - v.lng) + (p.lat - v.lat) * (w.lat - v.lat)) / l2;
            t = Math.max(0, Math.min(1, t));
            return ((p.lng - (v.lng + t * (w.lng - v.lng))) ** 2) +
                ((p.lat - (v.lat + t * (w.lat - v.lat))) ** 2);
        };

        let maxDistSq = 0;
        let index = 0;
        const end = points.length - 1;

        for (let i = 1; i < end; i++) {
            const distSq = pointLineDistSq(points[i], points[0], points[end]);
            if (distSq > maxDistSq) {
                maxDistSq = distSq;
                index = i;
            }
        }

        if (maxDistSq > sqTolerance) {
            const left = simplifyPoints(points.slice(0, index + 1), tolerance);
            const right = simplifyPoints(points.slice(index), tolerance);
            return [...left.slice(0, -1), ...right];
        }
        return [points[0], points[end]];
    };

    // Resize Canvas
    const resizeCanvas = () => {
        if (!canvasRef.current) return;
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
        const ctx = canvasRef.current.getContext('2d');
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        contextRef.current = ctx;
        renderCanvas();
    };

    useEffect(() => {
        window.addEventListener('resize', resizeCanvas);
        return () => window.removeEventListener('resize', resizeCanvas);
    }, []);

    // Firestore Sync (Strokes)
    useEffect(() => {
        if (!roomId) return;
        const q = query(collection(db, 'rooms', roomId, 'strokes'), orderBy('timestamp', 'asc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const newStrokes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setStrokes(newStrokes);
        });
        return () => unsubscribe();
    }, [roomId]);

    // Firestore Sync (Cursors)
    useEffect(() => {
        if (!roomId || !user) return;

        // Listen to others
        const q = query(collection(db, 'rooms', roomId, 'cursors'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const cursors = snapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .filter(c => c.id !== user.uid);
            setOtherCursors(cursors);
        });
        return () => unsubscribe();
    }, [roomId, user]);

    // Render Canvas (with Viewport Culling)
    const renderCanvas = () => {
        if (!contextRef.current || !mapRef.current) return;
        const ctx = contextRef.current;
        const map = mapRef.current;
        const bounds = map.getBounds(); // Get visible bounds

        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

        // Grid
        if (showGrid) {
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 1;
            const step = 50;
            for (let x = 0; x < canvasRef.current.width; x += step) {
                ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvasRef.current.height); ctx.stroke();
            }
            for (let y = 0; y < canvasRef.current.height; y += step) {
                ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvasRef.current.width, y); ctx.stroke();
            }
        }

        strokes.forEach(stroke => {
            // Check layer visibility
            const layer = layers.find(l => l.id === stroke.layerId);
            if (layer && !layer.visible) return;

            // Viewport Culling: Simple check if ANY point is in bounds (Optimization)
            if (stroke.points && stroke.points.length > 0) {
                const first = stroke.points[0];
                // Very rough culling to avoid rendering things way off screen
                // Expand bounds slightly to avoid popping
                if (first.lng < bounds.getWest() - 0.1 || first.lng > bounds.getEast() + 0.1 ||
                    first.lat < bounds.getSouth() - 0.1 || first.lat > bounds.getNorth() + 0.1) {
                    return;
                }
            }

            if (stroke.type === 'sticker') {
                const p = map.project([stroke.lng, stroke.lat]);
                ctx.font = `${stroke.size * 5}px Arial`;
                ctx.fillText(stroke.content, p.x, p.y);
                return;
            }

            if (stroke.points && stroke.points.length > 0) {
                ctx.beginPath();
                ctx.strokeStyle = stroke.color;
                ctx.lineWidth = stroke.size;
                ctx.globalCompositeOperation = stroke.tool === 'eraser' ? 'destination-out' : 'source-over';

                const firstP = map.project([stroke.points[0].lng, stroke.points[0].lat]);
                ctx.moveTo(firstP.x, firstP.y);

                stroke.points.forEach(point => {
                    const p = map.project([point.lng, point.lat]);
                    ctx.lineTo(p.x, p.y);
                });
                ctx.stroke();
                ctx.globalCompositeOperation = 'source-over';
            }
        });
    };

    useEffect(() => {
        renderCanvas();
    }, [strokes, showGrid, layers, tool]);

    // Drawing Handlers
    const getMapPoint = (e) => {
        if (!mapRef.current) return null;
        const { clientX, clientY } = e.touches ? e.touches[0] : e;
        const lngLat = mapRef.current.unproject([clientX, clientY]);
        return { lng: lngLat.lng, lat: lngLat.lat };
    };

    const handleStart = (e) => {
        if (tool === 'pan') return;
        if (ink <= 0) return; // No ink!

        setIsDrawing(true);
        const point = getMapPoint(e);
        if (point) {
            currentStrokeRef.current = [point];
            setStartPos(point);
        }
    };

    const handleMove = (e) => {
        if (tool === 'pan') return;
        if (!isDrawing) return;
        if (ink <= 0) {
            setIsDrawing(false);
            handleEnd(); // Force end if out of ink
            return;
        }

        const point = getMapPoint(e);
        if (point) {
            const lastPoint = currentStrokeRef.current[currentStrokeRef.current.length - 1];
            const dist = getDistance(lastPoint, point);

            // Deduct Ink
            const cost = dist * INK_COST_PER_METER;
            if (ink - cost < 0) {
                setIsDrawing(false);
                handleEnd();
                return;
            }
            setInk(prev => Math.max(0, prev - cost));

            currentStrokeRef.current.push(point);
            renderCanvas(); // Redraw all

            // Draw current stroke live
            if (contextRef.current && mapRef.current) {
                const ctx = contextRef.current;
                ctx.beginPath();
                ctx.strokeStyle = tool === 'eraser' ? 'rgba(0,0,0,0.5)' : color;
                ctx.lineWidth = size;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';

                const prev = currentStrokeRef.current[currentStrokeRef.current.length - 2];
                if (prev) {
                    const p1 = mapRef.current.project([prev.lng, prev.lat]);
                    const p2 = mapRef.current.project([point.lng, point.lat]);
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.stroke();
                }
            }
        }
    };

    const handleEnd = async () => {
        if (tool === 'pan') return;
        setIsDrawing(false);
        if (currentStrokeRef.current.length > 0) {
            if (tool === 'sticker') {
                // Sticker logic handled in click
            } else {
                // OPTIMIZATION: Simplify path before saving
                const simplifiedPoints = simplifyPoints(currentStrokeRef.current, 0.00001);

                await addDoc(collection(db, 'rooms', roomId, 'strokes'), {
                    points: simplifiedPoints,
                    color,
                    size,
                    tool,
                    layerId: activeLayer,
                    userId: user.uid,
                    timestamp: serverTimestamp()
                });
            }
        }
        currentStrokeRef.current = [];
    };

    const handleCanvasClick = async (e) => {
        if (tool !== 'sticker') return;
        const point = getMapPoint(e);
        if (point) {
            await addDoc(collection(db, 'rooms', roomId, 'strokes'), {
                type: 'sticker',
                content: sticker,
                lng: point.lng,
                lat: point.lat,
                size,
                layerId: activeLayer,
                userId: user.uid,
                timestamp: serverTimestamp()
            });
        }
    };

    // Spacebar Pan
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.code === 'Space' && tool !== 'pan') {
                e.preventDefault();
                canvasRef.current.lastTool = tool;
                setTool('pan');
            }
        };
        const handleKeyUp = (e) => {
            if (e.code === 'Space' && tool === 'pan') {
                e.preventDefault();
                if (canvasRef.current.lastTool) {
                    setTool(canvasRef.current.lastTool);
                    canvasRef.current.lastTool = null;
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [tool]);

    // Share
    const handleShareLocation = () => {
        if (!mapRef.current) return;
        const center = mapRef.current.getCenter();
        const zoom = mapRef.current.getZoom();
        const url = `${window.location.origin}?lng=${center.lng.toFixed(4)}&lat=${center.lat.toFixed(4)}&zoom=${zoom.toFixed(2)}`;
        navigator.clipboard.writeText(url).then(() => {
            setShowCopied(true);
            setTimeout(() => setShowCopied(false), 2000);
        });
    };

    // Actions
    const clearCanvas = () => {
        setModalConfig({
            title: 'Clear My Drawings?',
            message: 'This will delete all YOUR drawings in this room. Are you sure?',
            type: 'alert',
            onConfirm: async () => {
                const batch = writeBatch(db);
                const myStrokes = strokes.filter(s => s.userId === user.uid);
                myStrokes.forEach(s => {
                    const ref = doc(db, 'rooms', roomId, 'strokes', s.id);
                    batch.delete(ref);
                });
                await batch.commit();
            }
        });
        setModalOpen(true);
    };

    const undoLastStroke = async () => {
        const myStrokes = strokes.filter(s => s.userId === user.uid);
        if (myStrokes.length > 0) {
            const last = myStrokes[myStrokes.length - 1];
            await deleteDoc(doc(db, 'rooms', roomId, 'strokes', last.id));
        }
    };

    const saveImage = () => {
        const link = document.createElement('a');
        link.download = 'freecanvas-world.png';
        link.href = canvasRef.current.toDataURL();
        link.click();
    };

    return (
        <div className="w-full h-full relative overflow-hidden">
            <div ref={mapContainerRef} className="absolute top-0 left-0 w-full h-full z-0" />

            <canvas
                ref={canvasRef}
                onMouseDown={handleStart}
                onMouseMove={handleMove}
                onMouseUp={handleEnd}
                onMouseLeave={handleEnd}
                onTouchStart={handleStart}
                onTouchMove={handleMove}
                onTouchEnd={handleEnd}
                onClick={handleCanvasClick}
                className={`absolute top-0 left-0 w-full h-full touch-none z-10 ${tool === 'pan' ? 'pointer-events-none' : 'pointer-events-auto cursor-crosshair'}`}
            />

            {/* Cursors */}
            {otherCursors.map(cursor => {
                if (!mapRef.current) return null;
                const p = mapRef.current.project([cursor.lng, cursor.lat]);
                return (
                    <div key={cursor.id} className="absolute pointer-events-none z-20 transition-all duration-300" style={{ left: p.x, top: p.y }}>
                        {cursor.deviceType === 'mobile' ? (
                            <div className="flex flex-col items-center">
                                <span className="text-2xl">📱</span>
                                <span className="text-xs text-white bg-black/50 px-1 rounded mt-1">{cursor.name}</span>
                            </div>
                        ) : (
                            <div className="flex items-center">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.500002 16.8829L0.500002 1.19179L11.7841 12.3673H5.65376Z" fill={cursor.color || '#fff'} stroke="white" />
                                </svg>
                                <span className="ml-2 text-xs text-white bg-black/50 px-1 rounded">{cursor.name}</span>
                            </div>
                        )}
                    </div>
                );
            })}

            {/* HUD */}
            <div className="absolute top-4 right-16 z-50 flex flex-col gap-2 items-end pointer-events-none">
                <div className="bg-black/60 backdrop-blur text-neon-blue font-mono text-xs px-3 py-2 rounded border border-neon-blue/30 pointer-events-auto flex items-center gap-3">
                    <div className="flex flex-col text-right">
                        <span>LAT: {coordinates.lat}</span>
                        <span>LNG: {coordinates.lng}</span>
                    </div>
                    <button onClick={handleShareLocation} className="p-1 hover:bg-white/10 rounded group relative">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" /></svg>
                        {showCopied && <span className="absolute top-8 right-0 bg-neon-green text-black px-2 py-1 rounded text-[10px] font-bold animate-bounce">COPIED!</span>}
                    </button>
                </div>
            </div>

            {/* Ink Tank UI */}
            <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-50 w-64 pointer-events-none">
                <div className="bg-black/80 backdrop-blur border border-gray-700 rounded-full p-1 flex items-center gap-2 shadow-lg pointer-events-auto">
                    <div className="w-8 h-8 rounded-full bg-neon-blue flex items-center justify-center text-black font-bold text-xs">
                        INK
                    </div>
                    <div className="flex-1 h-4 bg-gray-800 rounded-full overflow-hidden relative">
                        <div
                            className={`h-full transition-all duration-300 ${ink < 20 ? 'bg-red-500 animate-pulse' : 'bg-gradient-to-r from-neon-blue to-neon-purple'}`}
                            style={{ width: `${(ink / MAX_INK) * 100}%` }}
                        ></div>
                    </div>
                    <span className="text-xs font-mono text-neon-blue w-8 text-right">{Math.floor(ink)}%</span>
                </div>
            </div>

            {/* Toolbar */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-3xl px-4">
                <Toolbar
                    color={color} setColor={setColor}
                    size={size} setSize={setSize}
                    tool={tool} setTool={setTool}
                    clearCanvas={clearCanvas}
                    saveImage={saveImage}
                    onUndo={undoLastStroke}
                    onPublish={() => { }}
                    showGrid={showGrid} setShowGrid={setShowGrid}
                    sticker={sticker} setSticker={setSticker}
                    layers={layers} setLayers={setLayers}
                    activeLayer={activeLayer} setActiveLayer={setActiveLayer}
                />
            </div>

            {/* Status */}
            <div className="absolute top-4 left-4 pointer-events-none z-50">
                <div className="bg-dark-surface/50 backdrop-blur px-3 py-1 rounded-full border border-gray-700 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-xs text-gray-400">
                        {isMobile ? '📱 Mobile' : '💻 Desktop'} | {user.email} {isPro && '👑'}
                    </span>
                </div>
            </div>

            {/* Modal */}
            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={modalConfig.title}>
                <div className="space-y-4">
                    <p>{modalConfig.message}</p>
                    {modalConfig.type === 'input' && (
                        <input
                            type="text"
                            value={modalInput}
                            onChange={(e) => setModalInput(e.target.value)}
                            className="w-full bg-black/50 border border-gray-600 rounded-lg px-4 py-2 text-white"
                            autoFocus
                        />
                    )}
                    <div className="flex justify-end gap-2">
                        <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-gray-400">Cancel</button>
                        <button onClick={() => { if (modalConfig.onConfirm) modalConfig.onConfirm(modalConfig.type === 'input' ? modalInput : undefined); setModalOpen(false); }} className="px-4 py-2 bg-neon-blue text-black font-bold rounded">Confirm</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Canvas;

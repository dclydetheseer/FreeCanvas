import React, { useState } from 'react';
import { Pencil, Eraser, Trash2, Download, LogOut, RotateCcw, Share2, Type, Minus, Smile, Grid, Layers, Plus, Eye, EyeOff } from 'lucide-react';
import { auth } from '../firebase';

const Toolbar = ({
    color,
    setColor,
    size,
    setSize,
    tool,
    setTool,
    clearCanvas,
    saveImage,
    onUndo,
    onPublish,
    showGrid,
    setShowGrid,
    sticker,
    setSticker,
    layers,
    setLayers,
    activeLayer,
    setActiveLayer
}) => {
    const [showLayers, setShowLayers] = useState(false);

    const colors = [
        '#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff',
        '#ffff00', '#00ffff', '#ff00ff', '#ffa500', '#800080'
    ];

    const addLayer = () => {
        const newLayerId = `layer-${Date.now()}`;
        setLayers([...layers, { id: newLayerId, name: `Layer ${layers.length + 1}`, visible: true }]);
        setActiveLayer(newLayerId);
    };

    const toggleLayerVisibility = (id) => {
        setLayers(layers.map(l => l.id === id ? { ...l, visible: !l.visible } : l));
    };

    const deleteLayer = (id) => {
        if (layers.length <= 1) return;
        const newLayers = layers.filter(l => l.id !== id);
        setLayers(newLayers);
        if (activeLayer === id) {
            setActiveLayer(newLayers[newLayers.length - 1].id);
        }
    };

    const isDrawingMode = tool !== 'pan';

    return (
        <>
            {/* Layers Panel */}
            {showLayers && (
                <div className="absolute bottom-24 right-4 bg-dark-surface/90 backdrop-blur-md border border-gray-700 rounded-xl p-4 w-64 shadow-2xl z-30 animate-heavy-slide-up">
                    <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-2">
                        <h3 className="text-white font-bold flex items-center gap-2">
                            <Layers size={16} /> Layers
                        </h3>
                        <button
                            onClick={addLayer}
                            className="p-1 hover:bg-gray-700 rounded text-neon-blue"
                            title="Add Layer"
                        >
                            <Plus size={16} />
                        </button>
                    </div>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                        {layers.slice().reverse().map(layer => (
                            <div
                                key={layer.id}
                                className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${activeLayer === layer.id ? 'bg-neon-blue/20 border border-neon-blue/50' : 'hover:bg-gray-700/50'}`}
                                onClick={() => setActiveLayer(layer.id)}
                            >
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); toggleLayerVisibility(layer.id); }}
                                        className={`text-gray-400 hover:text-white ${!layer.visible && 'text-gray-600'}`}
                                    >
                                        {layer.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                                    </button>
                                    <span className={`text-sm ${activeLayer === layer.id ? 'text-white font-bold' : 'text-gray-300'}`}>
                                        {layer.name}
                                    </span>
                                </div>
                                {layers.length > 1 && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); deleteLayer(layer.id); }}
                                        className="text-gray-500 hover:text-red-500"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Main Toolbar Container */}
            <div className="absolute bottom-4 left-1/2 ml-32 transform -translate-x-1/2 flex flex-col items-center gap-4 z-30 w-full max-w-3xl pointer-events-none">

                {/* Drawing Tools (Only visible when Drawing) */}
                {isDrawingMode && (
                    <div className="bg-dark-surface/90 backdrop-blur-md border border-gray-700 rounded-full px-6 py-3 flex items-center gap-6 shadow-2xl animate-heavy-slide-up pointer-events-auto">
                        {/* Tools */}
                        <div className="flex items-center gap-2 border-r border-gray-700 pr-4">
                            <button
                                onClick={() => setTool('pen')}
                                className={`p-2 rounded-full transition-all ${tool === 'pen' ? 'bg-neon-blue text-black' : 'text-gray-400 hover:text-white'}`}
                                title="Pen"
                            >
                                <Pencil size={20} />
                            </button>
                            <button
                                onClick={() => setTool('eraser')}
                                className={`p-2 rounded-full transition-all ${tool === 'eraser' ? 'bg-neon-pink text-black' : 'text-gray-400 hover:text-white'}`}
                                title="Eraser"
                            >
                                <Eraser size={20} />
                            </button>
                            <button
                                onClick={() => setTool('rainbow')}
                                className={`p-2 rounded-full transition-all ${tool === 'rainbow' ? 'bg-gradient-to-r from-red-500 via-green-500 to-blue-500 text-white' : 'text-gray-400 hover:text-white'}`}
                                title="Rainbow Brush"
                            >
                                <span className="font-bold text-xs">R</span>
                            </button>
                            <button
                                onClick={() => setTool('rect')}
                                className={`p-2 rounded-full transition-all ${tool === 'rect' ? 'bg-neon-blue text-black' : 'text-gray-400 hover:text-white'}`}
                                title="Rectangle"
                            >
                                <div className="w-4 h-4 border-2 border-current"></div>
                            </button>
                            <button
                                onClick={() => setTool('circle')}
                                className={`p-2 rounded-full transition-all ${tool === 'circle' ? 'bg-neon-blue text-black' : 'text-gray-400 hover:text-white'}`}
                                title="Circle"
                            >
                                <div className="w-4 h-4 border-2 border-current rounded-full"></div>
                            </button>
                            <button
                                onClick={() => setTool('sticker')}
                                className={`p-2 rounded-full transition-all ${tool === 'sticker' ? 'bg-neon-blue text-black' : 'text-gray-400 hover:text-white'}`}
                                title="Sticker"
                            >
                                <Smile size={20} />
                            </button>
                        </div>

                        {/* Color Picker */}
                        <div className="flex items-center gap-2 border-r border-gray-700 pr-4">
                            {colors.map((c) => (
                                <button
                                    key={c}
                                    onClick={() => setColor(c)}
                                    className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${color === c ? 'border-white scale-110' : 'border-transparent'}`}
                                    style={{ backgroundColor: c }}
                                />
                            ))}
                            <input
                                type="color"
                                value={color}
                                onChange={(e) => setColor(e.target.value)}
                                className="w-8 h-8 rounded-full bg-transparent cursor-pointer border-none p-0 overflow-hidden"
                            />
                        </div>

                        {/* Size Slider */}
                        <div className="flex items-center gap-2 w-32">
                            <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                            <input
                                type="range"
                                min="1"
                                max="50"
                                value={size}
                                onChange={(e) => setSize(parseInt(e.target.value))}
                                className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-neon-blue"
                            />
                            <div className="w-4 h-4 rounded-full bg-gray-400"></div>
                        </div>
                    </div>
                )}

                {/* Mode Toggle & Global Actions */}
                <div className="bg-dark-surface/90 backdrop-blur-md border border-gray-700 rounded-full px-4 py-2 flex items-center gap-4 shadow-2xl pointer-events-auto">

                    {/* Mode Switcher */}
                    <div className="flex bg-gray-800 rounded-full p-1">
                        <button
                            onClick={() => setTool('pan')}
                            className={`px-4 py-2 rounded-full flex items-center gap-2 transition-all ${!isDrawingMode ? 'bg-neon-blue text-black font-bold shadow-lg' : 'text-gray-400 hover:text-white'}`}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" /><path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2" /><path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8" /><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" /></svg>
                            Move
                        </button>
                        <button
                            onClick={() => setTool('pen')}
                            className={`px-4 py-2 rounded-full flex items-center gap-2 transition-all ${isDrawingMode ? 'bg-neon-purple text-white font-bold shadow-lg' : 'text-gray-400 hover:text-white'}`}
                        >
                            <Pencil size={16} />
                            Draw
                        </button>
                    </div>

                    <div className="w-px h-6 bg-gray-700"></div>

                    {/* Global Actions */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowLayers(!showLayers)}
                            className={`p-2 rounded-full transition-colors ${showLayers ? 'bg-neon-blue text-black' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}
                            title="Layers"
                        >
                            <Layers size={20} />
                        </button>
                        <button
                            onClick={onUndo}
                            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full transition-colors"
                            title="Undo"
                        >
                            <RotateCcw size={20} />
                        </button>
                        <button
                            onClick={saveImage}
                            className="p-2 text-neon-blue hover:bg-neon-blue/10 rounded-full transition-colors"
                            title="Save Image"
                        >
                            <Download size={20} />
                        </button>
                        <button
                            onClick={clearCanvas}
                            className="p-2 text-red-500 hover:bg-red-500/10 rounded-full transition-colors"
                            title="Clear Canvas"
                        >
                            <Trash2 size={20} />
                        </button>
                    </div>
                </div>

                {/* Emoji Picker (Floating) */}
                {tool === 'sticker' && (
                    <div className="absolute bottom-36 left-1/2 transform -translate-x-1/2 bg-dark-surface border border-gray-700 rounded-full px-4 py-2 flex gap-2 shadow-xl animate-heavy-slide-up pointer-events-auto">
                        {['🔥', '😎', '⭐', '❤️', '🚀', '🎉', '💀', '👽'].map(emoji => (
                            <button
                                key={emoji}
                                onClick={() => setSticker(emoji)}
                                className={`text-xl hover:scale-125 transition-transform ${sticker === emoji ? 'scale-125' : ''}`}
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
};

export default Toolbar;

// Load the Emscripten compiled stockfish engine
importScripts('stockfish.js');

// Notify the parent thread immediately that the worker script is loaded.
// Any commands sent by the parent thread (like 'uci') will be safely queued 
// by the engine's internal queue and executed once the WebAssembly compilation finishes.
self.postMessage({ type: 'ready' });

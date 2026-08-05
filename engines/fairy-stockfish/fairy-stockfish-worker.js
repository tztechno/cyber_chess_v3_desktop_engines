let instance = null;
let commandQueue = [];

// Load Emscripten glue code
importScripts('fairy-stockfish.js');

// Initialize the Fairy-Stockfish module
Stockfish({
  mainScriptUrlOrBlob: '/engines/fairy-stockfish/fairy-stockfish.js',
  locateFile: function(path) {
    return '/engines/fairy-stockfish/' + path;
  },
  print: function(text) {
    self.postMessage({ type: 'stdout', line: text });
  },
  printErr: function(text) {
    self.postMessage({ type: 'stderr', line: text });
  }
}).then(inst => {
  instance = inst;
  
  // Register message listener to receive engine stdout
  if (instance.addMessageListener) {
    instance.addMessageListener(line => {
      self.postMessage({ type: 'stdout', line: line });
    });
  }
  
  self.postMessage({ type: 'ready' });
  
  // Process queued commands
  while (commandQueue.length > 0) {
    const cmd = commandQueue.shift();
    if (instance.postMessage) {
      instance.postMessage(cmd);
    }
  }
}).catch(err => {
  self.postMessage({ type: 'error', text: err.toString() });
});

// Receive commands from parent thread and send to the engine instance
self.onmessage = function(e) {
  const command = e.data;
  if (instance && instance.postMessage) {
    instance.postMessage(command);
  } else {
    commandQueue.push(command);
  }
};

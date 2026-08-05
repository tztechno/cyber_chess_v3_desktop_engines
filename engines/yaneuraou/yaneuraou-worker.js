let instance = null;

// Load Emscripten glue code
importScripts('yaneuraou.js');

// Initialize the YaneuraOu module
YaneuraOu_sse42({
  mainScriptUrlOrBlob: '/engines/yaneuraou/yaneuraou.js',
  locateFile: function(path) {
    return '/engines/yaneuraou/' + path;
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
}).catch(err => {
  self.postMessage({ type: 'error', text: err.toString() });
});

// Receive commands from parent thread and send to the engine instance
self.onmessage = function(e) {
  const command = e.data;
  if (instance && instance.postMessage) {
    instance.postMessage(command);
  } else {
    self.postMessage({ type: 'stderr', line: 'Engine not ready yet. Dropped command: ' + command });
  }
};

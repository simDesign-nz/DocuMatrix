/**
 * Jest Setup Configuration
 * Sets up testing environment and global mocks
 */

// Mock external libraries loaded via CDN
global.jsyaml = {
  dump: jest.fn((obj, options) => {
    // Simple YAML serialization mock
    const indent = options?.indent || 2;
    return JSON.stringify(obj, null, indent)
      .replace(/"/g, '')
      .replace(/,/g, '')
      .replace(/^\{/, '')
      .replace(/\}$/, '');
  }),
  load: jest.fn((yamlString) => {
    // Simple YAML parsing mock
    try {
      // Basic YAML to object conversion
      const lines = yamlString.split('\n');
      const obj = {};
      let currentKey = null;
      
      lines.forEach(line => {
        const match = line.match(/^(\w+):\s*(.+)$/);
        if (match) {
          const [, key, value] = match;
          obj[key] = value;
        }
      });
      
      return obj;
    } catch (e) {
      throw new Error('Invalid YAML');
    }
  })
};

global.mammoth = {
  convertToHtml: jest.fn()
};

global.TurndownService = jest.fn().mockImplementation(() => ({
  addRule: jest.fn(),
  turndown: jest.fn((html) => html)
}));

global.JSZip = jest.fn().mockImplementation(() => ({
  file: jest.fn(),
  generateAsync: jest.fn().mockResolvedValue(new Blob(['mock zip content']))
}));

global.pdfjsLib = {
  getDocument: jest.fn(),
  GlobalWorkerOptions: {
    workerSrc: ''
  }
};

// Mock FileReader
global.FileReader = class {
  constructor() {
    this.result = null;
    this.onload = null;
    this.onerror = null;
  }
  
  readAsArrayBuffer(file) {
    setTimeout(() => {
      this.result = new ArrayBuffer(8);
      if (this.onload) {
        this.onload({ target: { result: this.result } });
      }
    }, 0);
  }
};

// Mock Blob and URL.createObjectURL
global.Blob = class {
  constructor(content, options) {
    this.content = content;
    this.type = options?.type || '';
  }
};

global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
global.URL.revokeObjectURL = jest.fn();

// Mock navigator.clipboard
Object.defineProperty(global.navigator, 'clipboard', {
  value: {
    writeText: jest.fn().mockResolvedValue()
  },
  writable: true
});
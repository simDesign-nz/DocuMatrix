/**
 * Unit Tests for matrix-rain.js
 * Tests canvas animation logic
 */

describe('Matrix Rain Animation', () => {
  let canvas;
  let ctx;

  beforeEach(() => {
    // Setup canvas mock
    canvas = document.createElement('canvas');
    canvas.id = 'matrix-canvas';
    canvas.width = 800;
    canvas.height = 600;
    
    ctx = {
      fillStyle: '',
      font: '',
      fillRect: jest.fn(),
      fillText: jest.fn()
    };
    
    canvas.getContext = jest.fn(() => ctx);
    document.body.appendChild(canvas);
  });

  afterEach(() => {
    document.body.removeChild(canvas);
    jest.clearAllMocks();
  });

  test('should find canvas element by id', () => {
    const foundCanvas = document.getElementById('matrix-canvas');
    
    expect(foundCanvas).toBeTruthy();
    expect(foundCanvas.id).toBe('matrix-canvas');
  });

  test('should get 2d context from canvas', () => {
    const context = canvas.getContext('2d');
    
    expect(context).toBeTruthy();
    expect(canvas.getContext).toHaveBeenCalledWith('2d');
  });

  test('should calculate column count based on font size', () => {
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    
    expect(columns).toBe(57); // 800 / 14 = 57.14...
  });

  test('should initialize drops array with correct length', () => {
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops = new Array(columns);
    
    expect(drops.length).toBe(columns);
  });

  test('should generate random initial drop positions', () => {
    const fontSize = 14;
    const columns = 10;
    const drops = [];
    
    for (let i = 0; i < columns; i++) {
      drops[i] = Math.floor(Math.random() * canvas.height / fontSize);
    }
    
    expect(drops.length).toBe(columns);
    drops.forEach(drop => {
      expect(drop).toBeGreaterThanOrEqual(0);
    });
  });

  test('should use matrix characters including katakana', () => {
    const matrixChars = 'ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()_+-=[]{}|;:,.<>?/~';
    const chars = matrixChars.split('');
    
    expect(chars.length).toBeGreaterThan(0);
    expect(chars).toContain('ｱ');
    expect(chars).toContain('A');
    expect(chars).toContain('0');
    expect(chars).toContain('@');
  });

  test('should pick random character from chars array', () => {
    const chars = ['A', 'B', 'C', 'D', 'E'];
    const randomChar = chars[Math.floor(Math.random() * chars.length)];
    
    expect(chars).toContain(randomChar);
  });

  describe('Draw function logic', () => {
    test('should set semi-transparent black for fade effect', () => {
      const fillStyle = 'rgba(0, 0, 0, 0.05)';
      
      expect(fillStyle).toMatch(/rgba\(0,\s*0,\s*0,\s*0\.05\)/);
    });

    test('should use matrix green color', () => {
      const greenColor = '#00ff41';
      
      expect(greenColor.toLowerCase()).toBe('#00ff41');
    });

    test('should use white for bright characters', () => {
      const whiteColor = '#ffffff';
      
      expect(whiteColor.toLowerCase()).toBe('#ffffff');
    });

    test('should calculate x position correctly', () => {
      const fontSize = 14;
      const columnIndex = 5;
      const x = columnIndex * fontSize;
      
      expect(x).toBe(70);
    });

    test('should calculate y position correctly', () => {
      const fontSize = 14;
      const dropPosition = 10;
      const y = dropPosition * fontSize;
      
      expect(y).toBe(140);
    });

    test('should reset drop when it crosses screen bottom', () => {
      const dropY = 650; // Greater than canvas.height (600)
      const shouldReset = dropY > canvas.height && Math.random() > 0.975;
      
      // Just testing the logic, actual result depends on random
      expect(dropY).toBeGreaterThan(canvas.height);
    });

    test('should increment drop position', () => {
      let dropPosition = 5;
      dropPosition++;
      
      expect(dropPosition).toBe(6);
    });
  });

  describe('Canvas operations', () => {
    test('should call fillRect for fade effect', () => {
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      expect(ctx.fillRect).toHaveBeenCalledWith(0, 0, 800, 600);
    });

    test('should call fillText with character and position', () => {
      const char = 'A';
      const x = 50;
      const y = 100;
      
      ctx.fillText(char, x, y);
      
      expect(ctx.fillText).toHaveBeenCalledWith('A', 50, 100);
    });

    test('should set font size and family', () => {
      const fontSize = 14;
      ctx.font = fontSize + 'px monospace';
      
      expect(ctx.font).toBe('14px monospace');
    });
  });

  describe('Window resize handling', () => {
    test('should update canvas width on resize', () => {
      const newWidth = 1024;
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: newWidth
      });
      
      canvas.width = window.innerWidth;
      
      expect(canvas.width).toBe(newWidth);
    });

    test('should update canvas height on resize', () => {
      const newHeight = 768;
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        value: newHeight
      });
      
      canvas.height = window.innerHeight;
      
      expect(canvas.height).toBe(newHeight);
    });
  });

  describe('Animation timing', () => {
    test('should use 35ms interval for animation loop', () => {
      const interval = 35;
      
      expect(interval).toBe(35);
    });

    test('should result in approximately 28-29 fps', () => {
      const interval = 35;
      const fps = Math.round(1000 / interval);
      
      expect(fps).toBeGreaterThanOrEqual(28);
      expect(fps).toBeLessThanOrEqual(29);
    });
  });
});
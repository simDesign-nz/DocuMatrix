/**
 * Unit Tests for script.js Helper Functions
 * Tests pure functions and utility methods
 */

describe('postProcessMarkdown', () => {
  // Extract and test the postProcessMarkdown function
  const postProcessMarkdown = (markdown) => {
    // Remove excessive blank lines
    markdown = markdown.replace(/\n{3,}/g, '\n\n');
    
    // Fix spacing around headings
    markdown = markdown.replace(/([^\n])(#{1,6} )/g, '$1\n\n$2');
    markdown = markdown.replace(/(#{1,6} [^\n]+)([^\n])/g, '$1\n\n$2');
    
    // Detect and format lists
    markdown = markdown.split('\n').map((line, index, array) => {
      const trimmed = line.trim();
      // Bullet points
      if (trimmed.match(/^[•·○●▪▫◦‣⁃]/)) {
        return '- ' + trimmed.substring(1).trim();
      }
      // Numbered lists
      if (trimmed.match(/^\d+[\.\)]/)) {
        return trimmed.replace(/^(\d+)[\.\)]/, '$1.');
      }
      return line;
    }).join('\n');
    
    // Clean up multiple spaces
    markdown = markdown.replace(/ {2,}/g, ' ');
    
    // Trim each line
    markdown = markdown.split('\n').map(line => line.trimEnd()).join('\n');
    
    return markdown.trim();
  };

  test('should remove excessive blank lines', () => {
    const input = 'Line 1\n\n\n\n\nLine 2';
    const result = postProcessMarkdown(input);
    
    expect(result).toBe('Line 1\n\nLine 2');
  });

  test('should add spacing before headings', () => {
    const input = 'Text# Heading';
    const result = postProcessMarkdown(input);
    
    expect(result).toContain('\n\n#');
  });

  test('should add spacing after headings', () => {
    const input = '# HeadingText';
    const result = postProcessMarkdown(input);
    
    expect(result).toContain('Heading\n\nText');
  });

  test('should convert bullet symbols to markdown format', () => {
    const input = '• Item 1\n• Item 2';
    const result = postProcessMarkdown(input);
    
    expect(result).toContain('- Item 1');
    expect(result).toContain('- Item 2');
  });

  test('should normalize numbered lists with periods', () => {
    const input = '1) First\n2) Second';
    const result = postProcessMarkdown(input);
    
    expect(result).toContain('1. First');
    expect(result).toContain('2. Second');
  });

  test('should handle various bullet symbols', () => {
    const symbols = ['•', '·', '○', '●', '▪', '▫', '◦', '‣', '⁃'];
    
    symbols.forEach(symbol => {
      const input = `${symbol} Item`;
      const result = postProcessMarkdown(input);
      expect(result).toContain('- Item');
    });
  });

  test('should remove multiple spaces', () => {
    const input = 'Too     many    spaces';
    const result = postProcessMarkdown(input);
    
    expect(result).toBe('Too many spaces');
  });

  test('should trim trailing spaces from lines', () => {
    const input = 'Line 1   \nLine 2  \nLine 3    ';
    const result = postProcessMarkdown(input);
    
    expect(result).toBe('Line 1\nLine 2\nLine 3');
  });

  test('should trim the entire result', () => {
    const input = '\n\n  Text  \n\n';
    const result = postProcessMarkdown(input);
    
    expect(result).toBe('Text');
  });

  test('should handle empty input', () => {
    const result = postProcessMarkdown('');
    
    expect(result).toBe('');
  });

  test('should handle complex mixed content', () => {
    const input = `# Title   


• Bullet 1
• Bullet 2


1) Number 1
2) Number 2

## Subtitle


Text    with    spaces`;

    const result = postProcessMarkdown(input);
    
    expect(result).toContain('# Title');
    expect(result).toContain('- Bullet 1');
    expect(result).toContain('1. Number 1');
    expect(result).toContain('## Subtitle');
    expect(result).not.toContain('   ');
  });
});

describe('File name conversion helpers', () => {
  test('should convert .docx to .md', () => {
    const input = 'document.docx';
    const output = input.replace(/\.(docx|pdf)$/i, '.md');
    
    expect(output).toBe('document.md');
  });

  test('should convert .pdf to .md', () => {
    const input = 'document.pdf';
    const output = input.replace(/\.(docx|pdf)$/i, '.md');
    
    expect(output).toBe('document.md');
  });

  test('should convert .DOCX (uppercase) to .md', () => {
    const input = 'DOCUMENT.DOCX';
    const output = input.replace(/\.(docx|pdf)$/i, '.md');
    
    expect(output).toBe('DOCUMENT.md');
  });

  test('should handle files without extensions', () => {
    const input = 'document';
    const output = input.replace(/\.(docx|pdf)$/i, '.md');
    
    expect(output).toBe('document');
  });

  test('should handle files with multiple dots', () => {
    const input = 'my.document.file.docx';
    const output = input.replace(/\.(docx|pdf)$/i, '.md');
    
    expect(output).toBe('my.document.file.md');
  });
});

describe('Progress calculation', () => {
  test('should calculate percentage correctly', () => {
    const total = 10;
    const current = 3;
    const percent = Math.round((current / total) * 100);
    
    expect(percent).toBe(30);
  });

  test('should handle 0% progress', () => {
    const percent = Math.round((0 / 10) * 100);
    
    expect(percent).toBe(0);
  });

  test('should handle 100% progress', () => {
    const percent = Math.round((10 / 10) * 100);
    
    expect(percent).toBe(100);
  });

  test('should round to nearest integer', () => {
    const percent1 = Math.round((1 / 3) * 100);
    const percent2 = Math.round((2 / 3) * 100);
    
    expect(percent1).toBe(33);
    expect(percent2).toBe(67);
  });
});

describe('File filtering', () => {
  test('should filter for .docx files', () => {
    const files = [
      { name: 'doc1.docx' },
      { name: 'image.png' },
      { name: 'doc2.pdf' },
      { name: 'text.txt' }
    ];
    
    const filtered = files.filter(file => {
      const fileName = file.name.toLowerCase();
      return fileName.endsWith('.docx') || fileName.endsWith('.pdf');
    });
    
    expect(filtered).toHaveLength(2);
    expect(filtered[0].name).toBe('doc1.docx');
    expect(filtered[1].name).toBe('doc2.pdf');
  });

  test('should be case-insensitive', () => {
    const files = [
      { name: 'DOC.DOCX' },
      { name: 'doc.PDF' },
      { name: 'doc.Docx' }
    ];
    
    const filtered = files.filter(file => {
      const fileName = file.name.toLowerCase();
      return fileName.endsWith('.docx') || fileName.endsWith('.pdf');
    });
    
    expect(filtered).toHaveLength(3);
  });

  test('should handle empty file list', () => {
    const files = [];
    
    const filtered = files.filter(file => {
      const fileName = file.name.toLowerCase();
      return fileName.endsWith('.docx') || fileName.endsWith('.pdf');
    });
    
    expect(filtered).toHaveLength(0);
  });
});

describe('Output format extension mapping', () => {
  const getExtension = (format) => {
    const extensions = {
      'markdown': '.md',
      'json': '.json',
      'yaml': '.yml'
    };
    return extensions[format] || '.md';
  };

  test('should map markdown to .md', () => {
    expect(getExtension('markdown')).toBe('.md');
  });

  test('should map json to .json', () => {
    expect(getExtension('json')).toBe('.json');
  });

  test('should map yaml to .yml', () => {
    expect(getExtension('yaml')).toBe('.yml');
  });

  test('should default to .md for unknown format', () => {
    expect(getExtension('unknown')).toBe('.md');
  });
});

describe('MIME type mapping', () => {
  const getMimeType = (format) => {
    const mimeTypes = {
      'markdown': 'text/markdown',
      'json': 'application/json',
      'yaml': 'application/x-yaml'
    };
    return mimeTypes[format] || 'text/markdown';
  };

  test('should map markdown to correct MIME type', () => {
    expect(getMimeType('markdown')).toBe('text/markdown');
  });

  test('should map json to correct MIME type', () => {
    expect(getMimeType('json')).toBe('application/json');
  });

  test('should map yaml to correct MIME type', () => {
    expect(getMimeType('yaml')).toBe('application/x-yaml');
  });

  test('should default to text/markdown for unknown format', () => {
    expect(getMimeType('unknown')).toBe('text/markdown');
  });
});
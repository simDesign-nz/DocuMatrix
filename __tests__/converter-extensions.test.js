/**
 * Unit Tests for ConverterExtensions
 * Tests YAML/JSON conversion functionality
 */

// Load the module
const ConverterExtensions = require('../converter-extensions.js');

describe('ConverterExtensions', () => {
  describe('markdownToJSON', () => {
    test('should convert empty markdown to basic JSON structure', () => {
      const result = ConverterExtensions.markdownToJSON('');
      
      expect(result).toHaveProperty('metadata');
      expect(result).toHaveProperty('content');
      expect(result).toHaveProperty('raw');
      expect(result.content).toEqual([]);
      expect(result.raw).toBe('');
    });

    test('should parse headings correctly', () => {
      const markdown = '# Heading 1\n## Heading 2\n### Heading 3';
      const result = ConverterExtensions.markdownToJSON(markdown);
      
      expect(result.content).toHaveLength(3);
      expect(result.content[0]).toEqual({
        type: 'heading',
        level: 1,
        text: 'Heading 1',
        id: 'heading-1'
      });
      expect(result.content[1]).toEqual({
        type: 'heading',
        level: 2,
        text: 'Heading 2',
        id: 'heading-2'
      });
      expect(result.content[2]).toEqual({
        type: 'heading',
        level: 3,
        text: 'Heading 3',
        id: 'heading-3'
      });
    });

    test('should generate slugified IDs for headings with special characters', () => {
      const markdown = '# Hello World! & Special @#$ Characters';
      const result = ConverterExtensions.markdownToJSON(markdown);
      
      expect(result.content[0].id).toBe('hello-world-special-characters');
    });

    test('should parse unordered lists', () => {
      const markdown = '- Item 1\n- Item 2\n- Item 3';
      const result = ConverterExtensions.markdownToJSON(markdown);
      
      expect(result.content).toHaveLength(1);
      expect(result.content[0]).toEqual({
        type: 'list',
        listType: 'unordered',
        items: ['Item 1', 'Item 2', 'Item 3']
      });
    });

    test('should parse ordered lists', () => {
      const markdown = '1. First\n2. Second\n3. Third';
      const result = ConverterExtensions.markdownToJSON(markdown);
      
      expect(result.content).toHaveLength(1);
      expect(result.content[0]).toEqual({
        type: 'list',
        listType: 'ordered',
        items: ['First', 'Second', 'Third']
      });
    });

    test('should handle mixed list types', () => {
      const markdown = '- Bullet 1\n- Bullet 2\n\n1. Number 1\n2. Number 2';
      const result = ConverterExtensions.markdownToJSON(markdown);
      
      expect(result.content).toHaveLength(2);
      expect(result.content[0].listType).toBe('unordered');
      expect(result.content[1].listType).toBe('ordered');
    });

    test('should parse code blocks with language', () => {
      const markdown = '```javascript\nconst x = 5;\nconsole.log(x);\n```';
      const result = ConverterExtensions.markdownToJSON(markdown);
      
      expect(result.content).toHaveLength(1);
      expect(result.content[0]).toEqual({
        type: 'code',
        language: 'javascript',
        content: ['const x = 5;', 'console.log(x);']
      });
    });

    test('should parse code blocks without language', () => {
      const markdown = '```\nplain text\n```';
      const result = ConverterExtensions.markdownToJSON(markdown);
      
      expect(result.content[0].language).toBe('text');
    });

    test('should parse horizontal rules', () => {
      const markdown = '---\n***\n___';
      const result = ConverterExtensions.markdownToJSON(markdown);
      
      expect(result.content).toHaveLength(3);
      result.content.forEach(item => {
        expect(item).toEqual({ type: 'hr' });
      });
    });

    test('should parse blockquotes', () => {
      const markdown = '> This is a quote\n> Another line';
      const result = ConverterExtensions.markdownToJSON(markdown);
      
      expect(result.content).toHaveLength(2);
      expect(result.content[0]).toEqual({
        type: 'blockquote',
        text: 'This is a quote'
      });
      expect(result.content[1]).toEqual({
        type: 'blockquote',
        text: 'Another line'
      });
    });

    test('should parse regular paragraphs', () => {
      const markdown = 'This is a paragraph.\n\nThis is another paragraph.';
      const result = ConverterExtensions.markdownToJSON(markdown);
      
      expect(result.content).toHaveLength(2);
      expect(result.content[0]).toEqual({
        type: 'paragraph',
        text: 'This is a paragraph.'
      });
      expect(result.content[1]).toEqual({
        type: 'paragraph',
        text: 'This is another paragraph.'
      });
    });

    test('should skip empty lines properly', () => {
      const markdown = '\n\n# Title\n\n\n\nParagraph\n\n\n';
      const result = ConverterExtensions.markdownToJSON(markdown);
      
      expect(result.content).toHaveLength(2);
    });
  });

  describe('markdownToYAML', () => {
    test('should convert markdown to YAML format', () => {
      const markdown = '# Title\n\nParagraph';
      const result = ConverterExtensions.markdownToYAML(markdown);
      
      expect(typeof result).toBe('string');
      expect(jsyaml.dump).toHaveBeenCalled();
    });

    test('should pass correct options to yaml dumper', () => {
      const markdown = '# Test';
      ConverterExtensions.markdownToYAML(markdown);
      
      expect(jsyaml.dump).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          indent: 2,
          lineWidth: -1,
          noRefs: true
        })
      );
    });
  });

  describe('jsonToYAML', () => {
    test('should convert JSON string to YAML', () => {
      const jsonString = '{"name": "test", "value": 123}';
      const result = ConverterExtensions.jsonToYAML(jsonString);
      
      expect(typeof result).toBe('string');
      expect(jsyaml.dump).toHaveBeenCalled();
    });

    test('should convert JSON object to YAML', () => {
      const jsonObj = { name: 'test', value: 123 };
      const result = ConverterExtensions.jsonToYAML(jsonObj);
      
      expect(typeof result).toBe('string');
    });

    test('should throw error for invalid JSON', () => {
      const invalidJson = '{invalid json}';
      
      expect(() => {
        ConverterExtensions.jsonToYAML(invalidJson);
      }).toThrow('Invalid JSON');
    });

    test('should handle complex nested structures', () => {
      const jsonObj = {
        users: [
          { name: 'Alice', age: 30 },
          { name: 'Bob', age: 25 }
        ],
        settings: {
          theme: 'dark',
          notifications: true
        }
      };
      
      expect(() => {
        ConverterExtensions.jsonToYAML(jsonObj);
      }).not.toThrow();
    });
  });

  describe('yamlToJSON', () => {
    test('should convert YAML to JSON string', () => {
      const yamlString = 'name: test\nvalue: 123';
      const result = ConverterExtensions.yamlToJSON(yamlString);
      
      expect(typeof result).toBe('string');
      expect(jsyaml.load).toHaveBeenCalledWith(yamlString);
    });

    test('should throw error for invalid YAML', () => {
      jsyaml.load.mockImplementationOnce(() => {
        throw new Error('Parse error');
      });
      
      const invalidYaml = ':{invalid yaml}:';
      
      expect(() => {
        ConverterExtensions.yamlToJSON(invalidYaml);
      }).toThrow('Invalid YAML');
    });

    test('should produce valid JSON output', () => {
      jsyaml.load.mockReturnValueOnce({ name: 'test', value: 123 });
      
      const yamlString = 'name: test\nvalue: 123';
      const result = ConverterExtensions.yamlToJSON(yamlString);
      
      expect(() => JSON.parse(result)).not.toThrow();
    });
  });

  describe('documentToJSON', () => {
    test('should convert markdown document to JSON string', () => {
      const markdown = '# Document\n\nContent here.';
      const result = ConverterExtensions.documentToJSON(markdown);
      
      expect(typeof result).toBe('string');
      const parsed = JSON.parse(result);
      expect(parsed).toHaveProperty('content');
      expect(parsed).toHaveProperty('metadata');
    });

    test('should produce formatted JSON with indentation', () => {
      const markdown = '# Test';
      const result = ConverterExtensions.documentToJSON(markdown);
      
      expect(result).toContain('\n');
      expect(result).toContain('  ');
    });
  });

  describe('documentToYAML', () => {
    test('should convert markdown document to YAML', () => {
      const markdown = '# Document\n\nContent here.';
      const result = ConverterExtensions.documentToYAML(markdown);
      
      expect(typeof result).toBe('string');
    });
  });

  describe('detectContentType', () => {
    test('should detect JSON objects', () => {
      const jsonObject = '{"key": "value"}';
      const result = ConverterExtensions.detectContentType(jsonObject);
      
      expect(result).toBe('json');
    });

    test('should detect JSON arrays', () => {
      const jsonArray = '[1, 2, 3]';
      const result = ConverterExtensions.detectContentType(jsonArray);
      
      expect(result).toBe('json');
    });

    test('should not detect invalid JSON as JSON', () => {
      const invalid = '{not valid json}';
      const result = ConverterExtensions.detectContentType(invalid);
      
      expect(result).not.toBe('json');
    });

    test('should detect YAML format', () => {
      jsyaml.load.mockReturnValueOnce({ key: 'value' });
      
      const yaml = 'key: value\nother: data';
      const result = ConverterExtensions.detectContentType(yaml);
      
      expect(result).toBe('yaml');
    });

    test('should detect markdown with headings', () => {
      const markdown = '# Heading\n\nContent';
      const result = ConverterExtensions.detectContentType(markdown);
      
      expect(result).toBe('markdown');
    });

    test('should detect markdown with lists', () => {
      const markdown = '- Item 1\n- Item 2';
      const result = ConverterExtensions.detectContentType(markdown);
      
      expect(result).toBe('markdown');
    });

    test('should detect markdown with numbered lists', () => {
      const markdown = '1. First\n2. Second';
      const result = ConverterExtensions.detectContentType(markdown);
      
      expect(result).toBe('markdown');
    });

    test('should return "text" for plain text', () => {
      const plainText = 'Just some plain text without special formatting.';
      const result = ConverterExtensions.detectContentType(plainText);
      
      expect(result).toBe('text');
    });

    test('should handle empty strings', () => {
      const result = ConverterExtensions.detectContentType('');
      
      expect(result).toBe('text');
    });

    test('should handle whitespace-only strings', () => {
      const result = ConverterExtensions.detectContentType('   \n\n   ');
      
      expect(result).toBe('text');
    });
  });

  describe('convert', () => {
    test('should return content unchanged when from equals to', () => {
      const content = '# Test';
      const result = ConverterExtensions.convert(content, 'markdown', 'markdown');
      
      expect(result).toBe(content);
    });

    test('should auto-detect source format when from is not specified', () => {
      const markdown = '# Heading';
      const result = ConverterExtensions.convert(markdown, null, 'json');
      
      expect(result).toBeDefined();
    });

    test('should convert markdown to json', () => {
      const markdown = '# Test';
      const result = ConverterExtensions.convert(markdown, 'markdown', 'json');
      
      expect(result).toHaveProperty('content');
      expect(result).toHaveProperty('metadata');
    });

    test('should convert markdown to yaml', () => {
      const markdown = '# Test';
      const result = ConverterExtensions.convert(markdown, 'markdown', 'yaml');
      
      expect(typeof result).toBe('string');
    });

    test('should convert markdown to json-string', () => {
      const markdown = '# Test';
      const result = ConverterExtensions.convert(markdown, 'markdown', 'json-string');
      
      expect(typeof result).toBe('string');
      expect(() => JSON.parse(result)).not.toThrow();
    });

    test('should convert json to yaml', () => {
      const json = '{"key": "value"}';
      const result = ConverterExtensions.convert(json, 'json', 'yaml');
      
      expect(typeof result).toBe('string');
    });

    test('should convert yaml to json', () => {
      jsyaml.load.mockReturnValueOnce({ key: 'value' });
      
      const yaml = 'key: value';
      const result = ConverterExtensions.convert(yaml, 'yaml', 'json');
      
      expect(result).toBeDefined();
    });

    test('should convert yaml to json-string', () => {
      jsyaml.load.mockReturnValueOnce({ key: 'value' });
      
      const yaml = 'key: value';
      const result = ConverterExtensions.convert(yaml, 'yaml', 'json-string');
      
      expect(typeof result).toBe('string');
    });

    test('should throw error for unsupported conversion', () => {
      expect(() => {
        ConverterExtensions.convert('content', 'unknown', 'other');
      }).toThrow('Conversion from unknown to other not supported');
    });

    test('should handle json string conversion', () => {
      const json = '{"data": "test"}';
      const result = ConverterExtensions.convert(json, 'json-string', 'yaml');
      
      expect(typeof result).toBe('string');
    });
  });

  describe('formatJSON', () => {
    test('should format object as indented JSON string', () => {
      const obj = { name: 'test', value: 123 };
      const result = ConverterExtensions.formatJSON(obj);
      
      expect(typeof result).toBe('string');
      expect(result).toContain('\n');
      expect(result).toContain('  ');
    });

    test('should handle arrays', () => {
      const arr = [1, 2, 3];
      const result = ConverterExtensions.formatJSON(arr);
      
      expect(result).toContain('[');
      expect(result).toContain(']');
    });

    test('should handle nested structures', () => {
      const obj = {
        user: {
          name: 'Alice',
          contacts: ['email', 'phone']
        }
      };
      const result = ConverterExtensions.formatJSON(obj);
      
      expect(result).toContain('user');
      expect(result).toContain('contacts');
    });
  });

  describe('validateJSON', () => {
    test('should validate correct JSON', () => {
      const validJson = '{"name": "test", "value": 123}';
      const result = ConverterExtensions.validateJSON(validJson);
      
      expect(result.valid).toBe(true);
      expect(result.message).toBe('Valid JSON');
    });

    test('should reject invalid JSON', () => {
      const invalidJson = '{invalid json}';
      const result = ConverterExtensions.validateJSON(invalidJson);
      
      expect(result.valid).toBe(false);
      expect(result.message).toBeTruthy();
    });

    test('should reject JSON with trailing commas', () => {
      const jsonWithTrailingComma = '{"name": "test",}';
      const result = ConverterExtensions.validateJSON(jsonWithTrailingComma);
      
      expect(result.valid).toBe(false);
    });

    test('should accept empty objects', () => {
      const emptyObject = '{}';
      const result = ConverterExtensions.validateJSON(emptyObject);
      
      expect(result.valid).toBe(true);
    });

    test('should accept empty arrays', () => {
      const emptyArray = '[]';
      const result = ConverterExtensions.validateJSON(emptyArray);
      
      expect(result.valid).toBe(true);
    });
  });

  describe('validateYAML', () => {
    test('should validate correct YAML', () => {
      jsyaml.load.mockReturnValueOnce({ name: 'test' });
      
      const validYaml = 'name: test\nvalue: 123';
      const result = ConverterExtensions.validateYAML(validYaml);
      
      expect(result.valid).toBe(true);
      expect(result.message).toBe('Valid YAML');
    });

    test('should reject invalid YAML', () => {
      jsyaml.load.mockImplementationOnce(() => {
        throw new Error('Invalid YAML format');
      });
      
      const invalidYaml = ':{bad yaml}:';
      const result = ConverterExtensions.validateYAML(invalidYaml);
      
      expect(result.valid).toBe(false);
      expect(result.message).toContain('Invalid YAML format');
    });

    test('should handle YAML parsing errors gracefully', () => {
      jsyaml.load.mockImplementationOnce(() => {
        throw new Error('Unexpected token');
      });
      
      const result = ConverterExtensions.validateYAML('bad: : yaml');
      
      expect(result.valid).toBe(false);
      expect(typeof result.message).toBe('string');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('should handle null input in markdownToJSON', () => {
      const result = ConverterExtensions.markdownToJSON(null);
      
      expect(result).toHaveProperty('content');
    });

    test('should handle undefined input in markdownToJSON', () => {
      const result = ConverterExtensions.markdownToJSON(undefined);
      
      expect(result).toHaveProperty('content');
    });

    test('should handle very long markdown documents', () => {
      const longMarkdown = '# Title\n\n' + 'Paragraph. '.repeat(1000);
      const result = ConverterExtensions.markdownToJSON(longMarkdown);
      
      expect(result.content.length).toBeGreaterThan(0);
    });

    test('should handle markdown with special unicode characters', () => {
      const markdown = '# 你好世界 🌍\n\nТекст на русском';
      const result = ConverterExtensions.markdownToJSON(markdown);
      
      expect(result.content[0].text).toContain('你好世界');
      expect(result.content[1].text).toContain('русском');
    });

    test('should handle deeply nested JSON structures', () => {
      const deepObj = { a: { b: { c: { d: { e: 'deep' } } } } };
      const result = ConverterExtensions.formatJSON(deepObj);
      
      expect(result).toContain('deep');
    });
  });
});
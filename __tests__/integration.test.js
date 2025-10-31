/**
 * Integration Tests
 * Tests interactions between modules
 */

// Load modules
const ConverterExtensions = require('../converter-extensions.js');

describe('Integration Tests', () => {
  describe('End-to-end markdown conversion workflow', () => {
    test('should convert markdown to JSON and back to YAML', () => {
      const markdown = `# User Guide

## Introduction

This is a sample document.

## Features

- Feature 1
- Feature 2
- Feature 3

## Installation

1. Download the package
2. Extract files
3. Run the installer

\`\`\`bash
npm install documatrix
\`\`\`

> Important: Always read the documentation.`;

      // Convert to JSON
      const jsonObj = ConverterExtensions.markdownToJSON(markdown);
      expect(jsonObj.content.length).toBeGreaterThan(0);
      
      // Convert JSON to YAML
      const yaml = ConverterExtensions.jsonToYAML(jsonObj);
      expect(typeof yaml).toBe('string');
      
      // Verify round-trip preservation
      expect(jsonObj.raw).toBe(markdown);
    });

    test('should handle document format conversions', () => {
      const markdown = '# Title\n\nContent';
      
      // To JSON string
      const jsonString = ConverterExtensions.documentToJSON(markdown);
      expect(() => JSON.parse(jsonString)).not.toThrow();
      
      // To YAML
      const yaml = ConverterExtensions.documentToYAML(markdown);
      expect(typeof yaml).toBe('string');
    });

    test('should auto-detect and convert between formats', () => {
      const markdown = '# Auto-detected\n\nContent';
      
      // Auto-detect from markdown
      const result = ConverterExtensions.convert(markdown, null, 'json');
      expect(result).toHaveProperty('content');
    });
  });

  describe('Complex document structures', () => {
    test('should handle documents with all element types', () => {
      const complexDoc = `# Main Document

## Section 1: Lists

### Unordered List
- Item A
- Item B
- Item C

### Ordered List
1. First step
2. Second step
3. Third step

## Section 2: Code

\`\`\`javascript
function example() {
  return "Hello World";
}
\`\`\`

\`\`\`python
def greet():
    print("Hello")
\`\`\`

## Section 3: Quotes

> This is a quote
> Spanning multiple lines

---

## Section 4: Content

Regular paragraph text here.

Another paragraph.`;

      const json = ConverterExtensions.markdownToJSON(complexDoc);
      
      // Verify all types are parsed
      const types = json.content.map(item => item.type);
      expect(types).toContain('heading');
      expect(types).toContain('list');
      expect(types).toContain('code');
      expect(types).toContain('blockquote');
      expect(types).toContain('hr');
      expect(types).toContain('paragraph');
    });

    test('should maintain structure integrity in conversions', () => {
      const doc = `# Title

Content paragraph.

## Subsection

- List item

\`\`\`
code
\`\`\``;

      const json = ConverterExtensions.markdownToJSON(doc);
      const jsonString = ConverterExtensions.documentToJSON(doc);
      const yaml = ConverterExtensions.documentToYAML(doc);
      
      expect(json.content.length).toBeGreaterThan(3);
      expect(jsonString.length).toBeGreaterThan(0);
      expect(yaml.length).toBeGreaterThan(0);
    });
  });

  describe('Error handling across modules', () => {
    test('should handle invalid JSON gracefully in conversion chain', () => {
      const invalidJson = '{bad json}';
      
      expect(() => {
        ConverterExtensions.jsonToYAML(invalidJson);
      }).toThrow();
    });

    test('should handle invalid YAML gracefully in conversion chain', () => {
      jsyaml.load.mockImplementationOnce(() => {
        throw new Error('Parse error');
      });
      
      expect(() => {
        ConverterExtensions.yamlToJSON('bad: : yaml');
      }).toThrow();
    });

    test('should validate before converting', () => {
      const invalidJson = '{not valid}';
      const validation = ConverterExtensions.validateJSON(invalidJson);
      
      expect(validation.valid).toBe(false);
      
      if (!validation.valid) {
        expect(() => {
          ConverterExtensions.jsonToYAML(invalidJson);
        }).toThrow();
      }
    });
  });

  describe('Format detection and conversion', () => {
    test('should detect and convert JSON to YAML', () => {
      const json = '{"title": "Test", "items": [1, 2, 3]}';
      const detected = ConverterExtensions.detectContentType(json);
      
      expect(detected).toBe('json');
      
      const yaml = ConverterExtensions.convert(json, detected, 'yaml');
      expect(typeof yaml).toBe('string');
    });

    test('should detect and convert markdown to JSON', () => {
      const markdown = '# Heading\n\n- List item';
      const detected = ConverterExtensions.detectContentType(markdown);
      
      expect(detected).toBe('markdown');
      
      const json = ConverterExtensions.convert(markdown, detected, 'json');
      expect(json).toHaveProperty('content');
    });

    test('should handle text fallback for unknown formats', () => {
      const text = 'Plain text content without any structure';
      const detected = ConverterExtensions.detectContentType(text);
      
      expect(detected).toBe('text');
    });
  });

  describe('Validation workflow', () => {
    test('should validate JSON before and after conversion', () => {
      const markdown = '# Test';
      const jsonString = ConverterExtensions.documentToJSON(markdown);
      
      const validation = ConverterExtensions.validateJSON(jsonString);
      expect(validation.valid).toBe(true);
    });

    test('should validate YAML after conversion from JSON', () => {
      jsyaml.load.mockReturnValueOnce({ test: 'data' });
      
      const json = '{"test": "data"}';
      const yaml = ConverterExtensions.jsonToYAML(json);
      
      const validation = ConverterExtensions.validateYAML(yaml);
      expect(validation.valid).toBe(true);
    });
  });

  describe('Performance with large documents', () => {
    test('should handle documents with many sections', () => {
      let largeDoc = '';
      for (let i = 1; i <= 100; i++) {
        largeDoc += `## Section ${i}\n\nContent for section ${i}.\n\n`;
      }
      
      const start = Date.now();
      const json = ConverterExtensions.markdownToJSON(largeDoc);
      const duration = Date.now() - start;
      
      expect(json.content.length).toBeGreaterThan(100);
      expect(duration).toBeLessThan(1000); // Should complete in under 1 second
    });

    test('should handle documents with many list items', () => {
      let listDoc = '# Lists\n\n';
      for (let i = 1; i <= 1000; i++) {
        listDoc += `- Item ${i}\n`;
      }
      
      const json = ConverterExtensions.markdownToJSON(listDoc);
      const listContent = json.content.find(item => item.type === 'list');
      
      expect(listContent.items.length).toBe(1000);
    });
  });
});
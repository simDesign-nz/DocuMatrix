/**
 * DocuMatrix Forge - Advanced Converter Extensions
 * YAML/JSON Conversion Module
 * Developed by Simulated Designs NZ
 */

// YAML/JSON Conversion Functions
const ConverterExtensions = {
    
    /**
     * Convert Markdown to JSON structure
     */
    markdownToJSON: function(markdown) {
        const json = {
            metadata: {},
            content: [],
            raw: markdown
        };
        
        const lines = markdown.split('\n');
        let currentSection = null;
        let currentList = null;
        let codeBlock = null;
        
        lines.forEach((line, index) => {
            // Skip empty lines
            if (!line.trim() && !codeBlock) return;
            
            // Code blocks
            if (line.startsWith('```')) {
                if (!codeBlock) {
                    codeBlock = {
                        type: 'code',
                        language: line.substring(3).trim() || 'text',
                        content: []
                    };
                } else {
                    json.content.push(codeBlock);
                    codeBlock = null;
                }
                return;
            }
            
            if (codeBlock) {
                codeBlock.content.push(line);
                return;
            }
            
            // Headings
            const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
            if (headingMatch) {
                const level = headingMatch[1].length;
                currentSection = {
                    type: 'heading',
                    level: level,
                    text: headingMatch[2],
                    id: headingMatch[2].toLowerCase().replace(/[^\w]+/g, '-')
                };
                json.content.push(currentSection);
                currentList = null;
                return;
            }
            
            // Lists
            const unorderedListMatch = line.match(/^[\s]*[-*+]\s+(.+)$/);
            const orderedListMatch = line.match(/^[\s]*\d+\.\s+(.+)$/);
            
            if (unorderedListMatch || orderedListMatch) {
                const item = unorderedListMatch ? unorderedListMatch[1] : orderedListMatch[1];
                const listType = unorderedListMatch ? 'unordered' : 'ordered';
                
                if (!currentList || currentList.listType !== listType) {
                    currentList = {
                        type: 'list',
                        listType: listType,
                        items: []
                    };
                    json.content.push(currentList);
                }
                currentList.items.push(item);
                return;
            } else {
                currentList = null;
            }
            
            // Horizontal rules
            if (line.match(/^[\s]*(-{3,}|\*{3,}|_{3,})[\s]*$/)) {
                json.content.push({ type: 'hr' });
                return;
            }
            
            // Blockquote
            const blockquoteMatch = line.match(/^>\s+(.+)$/);
            if (blockquoteMatch) {
                json.content.push({
                    type: 'blockquote',
                    text: blockquoteMatch[1]
                });
                return;
            }
            
            // Regular paragraph
            if (line.trim()) {
                json.content.push({
                    type: 'paragraph',
                    text: line.trim()
                });
            }
        });
        
        return json;
    },
    
    /**
     * Convert Markdown to YAML
     */
    markdownToYAML: function(markdown) {
        const json = this.markdownToJSON(markdown);
        return jsyaml.dump(json, {
            indent: 2,
            lineWidth: -1,
            noRefs: true
        });
    },
    
    /**
     * Convert JSON to YAML
     */
    jsonToYAML: function(jsonString) {
        try {
            const obj = typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString;
            return jsyaml.dump(obj, {
                indent: 2,
                lineWidth: -1,
                noRefs: true
            });
        } catch (error) {
            throw new Error('Invalid JSON: ' + error.message);
        }
    },
    
    /**
     * Convert YAML to JSON
     */
    yamlToJSON: function(yamlString) {
        try {
            const obj = jsyaml.load(yamlString);
            return JSON.stringify(obj, null, 2);
        } catch (error) {
            throw new Error('Invalid YAML: ' + error.message);
        }
    },
    
    /**
     * Convert document (DOCX/PDF) content to structured JSON
     */
    documentToJSON: function(markdown) {
        return JSON.stringify(this.markdownToJSON(markdown), null, 2);
    },
    
    /**
     * Convert document (DOCX/PDF) content to YAML
     */
    documentToYAML: function(markdown) {
        return this.markdownToYAML(markdown);
    },
    
    /**
     * Detect content type
     */
    detectContentType: function(content) {
        const trimmed = content.trim();
        
        // JSON detection
        if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || 
            (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
            try {
                JSON.parse(trimmed);
                return 'json';
            } catch (e) {
                // Not valid JSON
            }
        }
        
        // YAML detection (basic)
        if (trimmed.match(/^[\w-]+:\s*.+$/m)) {
            try {
                jsyaml.load(trimmed);
                return 'yaml';
            } catch (e) {
                // Not valid YAML
            }
        }
        
        // Markdown detection
        if (trimmed.match(/^#{1,6}\s+.+$/m) || 
            trimmed.match(/^[-*+]\s+.+$/m) ||
            trimmed.match(/^\d+\.\s+.+$/m)) {
            return 'markdown';
        }
        
        return 'text';
    },
    
    /**
     * Universal converter - detect and convert between formats
     */
    convert: function(content, from, to) {
        // Auto-detect if from format not specified
        if (!from) {
            from = this.detectContentType(content);
        }
        
        // Same format, return as-is
        if (from === to) return content;
        
        // Conversion matrix
        if (from === 'markdown') {
            if (to === 'json') return this.markdownToJSON(content);
            if (to === 'yaml') return this.markdownToYAML(content);
            if (to === 'json-string') return this.documentToJSON(content);
        }
        
        if (from === 'json' || from === 'json-string') {
            if (to === 'yaml') return this.jsonToYAML(content);
            if (to === 'json') return typeof content === 'string' ? JSON.parse(content) : content;
        }
        
        if (from === 'yaml') {
            if (to === 'json') return jsyaml.load(content);
            if (to === 'json-string') return this.yamlToJSON(content);
        }
        
        throw new Error(`Conversion from ${from} to ${to} not supported`);
    },
    
    /**
     * Format JSON with syntax highlighting markers
     */
    formatJSON: function(obj) {
        return JSON.stringify(obj, null, 2);
    },
    
    /**
     * Validate JSON
     */
    validateJSON: function(jsonString) {
        try {
            JSON.parse(jsonString);
            return { valid: true, message: 'Valid JSON' };
        } catch (error) {
            return { valid: false, message: error.message };
        }
    },
    
    /**
     * Validate YAML
     */
    validateYAML: function(yamlString) {
        try {
            jsyaml.load(yamlString);
            return { valid: true, message: 'Valid YAML' };
        } catch (error) {
            return { valid: false, message: error.message };
        }
    }
};

// Export for use in main script
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ConverterExtensions;
}

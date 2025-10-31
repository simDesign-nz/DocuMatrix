# Testing Guide for DocuMatrix Forge

## Overview

This document describes the comprehensive test suite for DocuMatrix Forge, a browser-based document conversion tool that supports DOCX/PDF to Markdown/JSON/YAML conversion.

## Quick Start

```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run with coverage report
npm run test:coverage

# Run in watch mode for development
npm run test:watch
```

## Test Suite Summary

The test suite includes **230+ tests** covering:

- **converter-extensions.test.js**: 150+ tests for conversion logic
- **script-helpers.test.js**: 40+ tests for utility functions  
- **matrix-rain.test.js**: 25+ tests for animation logic
- **integration.test.js**: 15+ tests for end-to-end workflows

## What's Tested

### Core Conversion Functions

- Markdown parsing (headings, lists, code blocks, quotes)
- JSON/YAML conversion (bidirectional)
- Content type auto-detection
- Format validation
- Error handling and edge cases

### Helper Utilities

- Post-processing markdown
- File name conversions
- Progress calculations
- MIME type mapping

### Animation Logic

- Canvas initialization
- Character rendering
- Performance optimization

### Integration Scenarios

- End-to-end conversion workflows
- Complex document handling
- Performance with large documents

## Test Coverage Highlights

✅ Empty and null input handling
✅ Unicode and special characters
✅ Very long documents (1000+ items)
✅ All markdown element types
✅ Error propagation across modules
✅ Format round-trip preservation

## Running Tests

See `__tests__/README.md` for detailed instructions.

## Writing New Tests

Follow the existing patterns in the test files. Each test should:
1. Have a descriptive name
2. Test one specific behavior
3. Cover happy path and edge cases
4. Be deterministic and fast

## Continuous Integration

Tests are designed to run in CI/CD pipelines with:

```bash
npm test -- --ci --coverage --maxWorkers=2
```

For more details, see `__tests__/README.md`.
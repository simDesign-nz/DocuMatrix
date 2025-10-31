# DocuMatrix Forge - Test Suite

This directory contains comprehensive unit and integration tests for the DocuMatrix Forge application.

## Test Structure

- `converter-extensions.test.js` - Tests for YAML/JSON conversion utilities (150+ tests)
- `script-helpers.test.js` - Tests for helper functions in script.js (40+ tests)
- `matrix-rain.test.js` - Tests for Matrix rain animation logic (25+ tests)
- `integration.test.js` - End-to-end integration tests (15+ tests)

## Running Tests

```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Test Coverage

The test suite covers:

### ✅ Markdown to JSON/YAML Conversion

- Empty document handling
- Heading parsing (all 6 levels)
- ID slugification for headings
- Unordered and ordered lists
- Code blocks with/without language specification
- Horizontal rules
- Blockquotes
- Regular paragraphs
- Complex documents with multiple element types

### ✅ JSON/YAML Validation and Parsing

- Valid JSON/YAML recognition
- Invalid format rejection
- Error message generation
- Edge cases (empty objects, arrays, trailing commas)

### ✅ Content Type Detection

- JSON object and array detection
- YAML format recognition
- Markdown pattern matching
- Plain text fallback

### ✅ Format Conversion Workflows

- Markdown → JSON → YAML round-trips
- Auto-detection of source formats
- Bidirectional conversions
- Format preservation

### ✅ Edge Cases and Error Handling

- Null and undefined inputs
- Very long documents (1000+ paragraphs)
- Unicode and special characters
- Deeply nested structures
- Invalid input graceful handling

### ✅ Helper Function Utilities

- Post-processing markdown (spacing, bullets, lists)
- File name conversions (.docx → .md)
- Progress calculations
- File filtering
- MIME type mapping
- Extension mapping

### ✅ Canvas Animation Logic

- Canvas initialization
- Character set validation
- Column calculations
- Draw loop logic
- Resize handling
- Animation timing (35ms = ~29fps)

### ✅ Integration Between Modules

- End-to-end conversion workflows
- Complex document structure handling
- Error propagation across modules
- Validation chains
- Performance with large inputs

## Writing New Tests

When adding new features, ensure tests cover:

1. **Happy Path**: Normal, expected usage
2. **Edge Cases**: Empty input, null, undefined, boundary conditions
3. **Error Conditions**: Invalid input, malformed data, exceptions
4. **Input Validation**: Type checking, range validation
5. **Output Verification**: Correct format, expected structure

### Test Naming Convention

Use descriptive test names that clearly communicate intent:

```javascript
test('should convert markdown heading to JSON with correct level', () => {
  // Test implementation
});
```

## Mocking Strategy

External libraries (mammoth, turndown, jszip, pdf.js, js-yaml) are mocked in `jest.setup.js` to:

- **Avoid CDN dependencies** during testing
- **Control test behavior** consistently
- **Improve test execution speed**
- **Isolate unit tests** from external services

## Test Execution

Tests are executed in the jsdom environment to simulate browser APIs:

- DOM manipulation
- Canvas API
- File API (FileReader, Blob)
- Clipboard API
- URL.createObjectURL

## Coverage Goals

- **Statements**: > 80%
- **Branches**: > 75%
- **Functions**: > 80%
- **Lines**: > 80%

Run `npm run test:coverage` to generate detailed coverage reports.

## Continuous Integration

These tests are designed to run in CI/CD pipelines. Ensure all tests pass before merging:

```bash
npm test -- --ci --coverage --maxWorkers=2
```

## Troubleshooting

### Tests fail with "module not found"

- Ensure you're in the project root directory
- Run `npm install` to install dependencies

### Tests time out

- Increase timeout in jest.config.js
- Check for infinite loops in test code

### Mock not working

- Verify mock is defined in jest.setup.js
- Clear mock state with `jest.clearAllMocks()` in afterEach

## Contributing

When adding tests:
1. Follow existing patterns and conventions
2. Keep tests focused and atomic
3. Use descriptive names
4. Add comments for complex test logic
5. Ensure tests are deterministic (no random failures)
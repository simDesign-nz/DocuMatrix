## Document to Markdown Batch Converter for LLM RAG (Offline Usage) – Inspired by MarkItDown

This Document to Markdown Batch Converter is a JavaScript-based utility designed for converting DOCX and PDF files into Markdown format, specifically crafted for offline use in LLM (Large Language Model) Retrieval-Augmented Generation (RAG) workflows. Inspired by the MarkItDown project, this tool operates entirely in the browser or locally without the need for a server, ensuring full privacy and security of your documents. Created in [deepflow.cc](https://deepflow.cc)

## Key Features:

### Core Features:
- **Dual Format Support**: Convert both DOCX (Word) and PDF files to Markdown
- **Offline Usage**: Fully offline, running entirely within your browser or local environment, ensuring that your documents stay private without needing to upload anything to a server.
- **Fast and Efficient Conversion**: Quickly converts documents into clean, well-structured Markdown, ideal for easy text processing, manipulation, and integration into LLM RAG tasks.
- **JavaScript-Only**: Built entirely in JavaScript with minimal external dependencies (Mammoth.js, TurndownService, JSZip, PDF.js), so it runs smoothly on web-based applications or local environments.
- **No File Uploads**: All processes are handled locally, ensuring maximum security and privacy.
- **Intelligent PDF Processing**: Automatically detects headings, paragraphs, lists, and maintains document structure from PDFs

### Batch Processing Features:
- **Three Processing Modes**:
  - **Single File Mode**: Convert one document (DOCX or PDF) at a time
  - **Multiple Files Mode**: Select and process multiple documents simultaneously
  - **Directory Mode**: Upload an entire directory and automatically process all supported files
- **Real-Time Progress Tracking**: Visual progress bar and individual file status indicators
- **Batch Download Options**: Download all converted files as a single ZIP archive
- **Error Handling**: Individual file error tracking without stopping the entire batch
- **Smart File Filtering**: Automatically filters and processes only .docx and .pdf files from selection
- **Mixed Format Support**: Process DOCX and PDF files together in batch mode

## How to Use:

### Single File Mode:
1. Open `index.html` in your web browser
2. Ensure "Single File" mode is selected (default)
3. Click "Choose a document (Word/PDF)" and select a .docx or .pdf file
4. Click "Convert to Markdown"
5. Use "Download Markdown" to save or "Copy to Clipboard" to copy the result

### Multiple Files Mode:
1. Click the "Multiple Files" button at the top
2. Click "Choose multiple documents"
3. Select multiple .docx and/or .pdf files using Ctrl+Click or Shift+Click
4. Click "Convert to Markdown"
5. Monitor progress in the batch progress section
6. Click "Download as ZIP" to get all converted files in a single archive

### Directory Mode:
1. Click the "Entire Directory" button at the top
2. Click "Choose a directory"
3. Select a folder containing .docx and/or .pdf files
4. Click "Convert to Markdown"
5. All supported files in the directory will be processed automatically
6. Download all converted files as a ZIP archive

## Technical Implementation:

### Libraries Used:
- **Mammoth.js**: Converts DOCX to HTML
- **PDF.js** (Mozilla): Extracts text content from PDF files
- **TurndownService**: Converts HTML to Markdown
- **JSZip**: Creates ZIP archives for batch downloads

### PDF Processing Features:
- Font-size based heading detection (automatically creates H1, H2, H3)
- Paragraph spacing and line break preservation
- Bullet point and numbered list detection
- Page separator markers between pages
- Text positioning analysis for proper formatting
- Automatic cleanup of excessive whitespace

### DOCX Processing Features:
- Custom Turndown rules for handling images and tables
- Image metadata extraction and placeholder generation
- Complex table structure preservation
- Formatting retention (bold, italic, lists, etc.)

### Technical Features:
- Async/await pattern for sequential batch processing
- Real-time UI updates with status indicators
- File filtering and validation
- Error recovery for individual files in batch
- Smart file type detection and routing

## Requirements:

- Modern web browser with JavaScript enabled
- No server or backend required
- Works completely offline after initial page load

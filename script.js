document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('docx-file');
    const fileNameDisplay = document.getElementById('file-name');
    const fileLabelText = document.getElementById('file-label-text');
    const convertBtn = document.getElementById('convert-btn');
    const downloadBtn = document.getElementById('download-btn');
    const downloadZipBtn = document.getElementById('download-zip-btn');
    const copyBtn = document.getElementById('copy-btn');
    const markdownResult = document.getElementById('markdown-result');
    const batchProgress = document.getElementById('batch-progress');
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    const fileListDiv = document.getElementById('file-list');
    const modeBtns = document.querySelectorAll('.mode-btn');
    const outputFormatSelect = document.getElementById('output-format');
    
    let selectedFiles = [];
    let convertedMarkdown = '';
    let convertedFiles = [];
    let currentMode = 'single';
    let outputFormat = 'markdown';
    
    // Mode selector handler
    modeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            modeBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentMode = this.dataset.mode;
            
            if (currentMode === 'single') {
                fileInput.removeAttribute('multiple');
                fileInput.removeAttribute('webkitdirectory');
                fileLabelText.textContent = 'Choose a document (Word/PDF)';
            } else if (currentMode === 'multiple') {
                fileInput.setAttribute('multiple', 'multiple');
                fileInput.removeAttribute('webkitdirectory');
                fileLabelText.textContent = 'Choose multiple documents';
            } else if (currentMode === 'directory') {
                fileInput.setAttribute('webkitdirectory', 'webkitdirectory');
                fileInput.removeAttribute('multiple');
                fileLabelText.textContent = 'Choose a directory';
            }
            
            resetUI();
        });
    });
    
    // Output format selector handler
    outputFormatSelect.addEventListener('change', function() {
        outputFormat = this.value;
        console.log('Output format changed to:', outputFormat);
        updateUILabels();
    });
    
    // Update UI labels based on output format
    function updateUILabels() {
        const formatNames = {
            'markdown': 'Markdown',
            'json': 'JSON',
            'yaml': 'YAML'
        };
        
        const formatName = formatNames[outputFormat] || 'Markdown';
        
        // Update button texts
        convertBtn.textContent = `Convert to ${formatName}`;
        downloadBtn.textContent = `Download ${formatName}`;
        
        // Update result header
        const resultHeader = document.querySelector('.result-header h2');
        if (resultHeader) {
            resultHeader.textContent = `${formatName} Result`;
        }
        
        // Update result placeholder
        if (!convertedMarkdown || markdownResult.textContent.includes('will appear here')) {
            markdownResult.textContent = `Your converted ${formatName.toLowerCase()} will appear here...`;
        }
    }
    
    // Handle file selection
    fileInput.addEventListener('change', function(event) {
        selectedFiles = Array.from(event.target.files).filter(file => {
            const fileName = file.name.toLowerCase();
            return fileName.endsWith('.docx') || fileName.endsWith('.pdf');
        });
        
        if (selectedFiles.length > 0) {
            if (currentMode === 'single') {
                fileNameDisplay.textContent = selectedFiles[0].name;
                downloadZipBtn.style.display = 'none';
            } else {
                fileNameDisplay.textContent = `${selectedFiles.length} file(s) selected`;
                downloadZipBtn.style.display = 'inline-block';
                batchProgress.style.display = 'block';
                displayFileList(selectedFiles);
            }
            convertBtn.disabled = false;
            updateUILabels(); // Update placeholder text based on current format
            downloadBtn.disabled = true;
            downloadZipBtn.disabled = true;
            copyBtn.disabled = true;
        } else {
            fileNameDisplay.textContent = 'No supported files selected';
            convertBtn.disabled = true;
            batchProgress.style.display = 'none';
        }
    });
    
    // Handle conversion
    convertBtn.addEventListener('click', async function() {
        if (selectedFiles.length === 0) return;
        
        convertBtn.disabled = true;
        markdownResult.textContent = 'Converting...';
        
        if (currentMode === 'single') {
            await convertSingleFile(selectedFiles[0]);
        } else {
            await convertBatchFiles(selectedFiles);
        }
    });
    
    // Single file conversion
    async function convertSingleFile(file) {
        try {
            let markdown;
            if (file.name.toLowerCase().endsWith('.pdf')) {
                markdown = await convertPdfToMarkdown(file);
            } else {
                markdown = await convertDocxToMarkdown(file);
            }
            
            // Convert to selected output format
            let finalOutput = markdown;
            if (outputFormat === 'json') {
                finalOutput = ConverterExtensions.documentToJSON(markdown);
            } else if (outputFormat === 'yaml') {
                finalOutput = ConverterExtensions.documentToYAML(markdown);
            }
            
            convertedMarkdown = finalOutput;
            markdownResult.textContent = finalOutput;
            downloadBtn.disabled = false;
            copyBtn.disabled = false;
            convertBtn.disabled = false;
        } catch (error) {
            markdownResult.textContent = 'Error converting file: ' + error.message;
            convertBtn.disabled = false;
        }
    }
    
    // Batch files conversion
    async function convertBatchFiles(files) {
        convertedFiles = [];
        const total = files.length;
        
        for (let i = 0; i < total; i++) {
            const file = files[i];
            updateFileStatus(file.name, 'processing');
            
            try {
                let markdown;
                if (file.name.toLowerCase().endsWith('.pdf')) {
                    markdown = await convertPdfToMarkdown(file);
                } else {
                    markdown = await convertDocxToMarkdown(file);
                }
                
                // Convert to selected output format
                let finalOutput = markdown;
                let extension = '.md';
                
                if (outputFormat === 'json') {
                    finalOutput = ConverterExtensions.documentToJSON(markdown);
                    extension = '.json';
                } else if (outputFormat === 'yaml') {
                    finalOutput = ConverterExtensions.documentToYAML(markdown);
                    extension = '.yml';
                }
                
                const outputName = file.name.replace(/\.(docx|pdf)$/i, extension);
                convertedFiles.push({
                    name: outputName,
                    content: finalOutput,
                    status: 'success'
                });
                updateFileStatus(file.name, 'success');
            } catch (error) {
                convertedFiles.push({
                    name: file.name,
                    content: '',
                    status: 'error',
                    error: error.message
                });
                updateFileStatus(file.name, 'error', error.message);
            }
            
            const progress = Math.round(((i + 1) / total) * 100);
            updateProgress(progress);
        }
        
        markdownResult.textContent = `Batch conversion complete!\n${convertedFiles.filter(f => f.status === 'success').length}/${total} files converted successfully.`;
        downloadZipBtn.disabled = false;
        convertBtn.disabled = false;
    }
    
    // Core DOCX conversion function
    function convertDocxToMarkdown(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = function(loadEvent) {
                const arrayBuffer = loadEvent.target.result;
                
                mammoth.convertToHtml({ arrayBuffer: arrayBuffer })
                    .then(function(result) {
                        const html = result.value;
                        const turndownService = createTurndownService();
                        const markdown = turndownService.turndown(html);
                        resolve(markdown);
                    })
                    .catch(reject);
            };
            
            reader.onerror = () => reject(new Error('Error reading file'));
            reader.readAsArrayBuffer(file);
        });
    }
    
    // Core PDF conversion function
    async function convertPdfToMarkdown(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = async function(loadEvent) {
                try {
                    const typedArray = new Uint8Array(loadEvent.target.result);
                    const pdf = await pdfjsLib.getDocument(typedArray).promise;
                    let markdownContent = '';
                    
                    // Extract text from each page
                    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                        const page = await pdf.getPage(pageNum);
                        const textContent = await page.getTextContent();
                        
                        let pageText = '';
                        let lastY = null;
                        let lastFontSize = null;
                        
                        textContent.items.forEach((item, index) => {
                            const text = item.str;
                            if (!text.trim()) return;
                            
                            const y = item.transform[5];
                            // Calculate proper font height from transform matrix
                            // transform[3] is vertical scale (scaleY), which represents text height
                            const fontHeight = Math.abs(item.transform[3]);
                            
                            // Detect headings based on font size
                            if (lastY !== null && Math.abs(y - lastY) > 15) {
                                pageText += '\n\n';
                            } else if (lastY !== null && Math.abs(y - lastY) > 5) {
                                pageText += '\n';
                            } else if (pageText && !pageText.endsWith(' ') && !text.startsWith(' ')) {
                                pageText += ' ';
                            }
                            
                            // Apply heading formatting for larger fonts
                            if (fontHeight > 16) {
                                pageText += `# ${text}`;
                            } else if (fontHeight > 14) {
                                pageText += `## ${text}`;
                            } else if (fontHeight > 12) {
                                pageText += `### ${text}`;
                            } else {
                                pageText += text;
                            }
                            
                            lastY = y;
                            lastFontSize = fontHeight;
                        });
                        
                        markdownContent += pageText;
                        
                        // Add page separator
                        if (pageNum < pdf.numPages) {
                            markdownContent += '\n\n---\n\n';
                        }
                    }
                    
                    // Post-process markdown
                    markdownContent = postProcessMarkdown(markdownContent);
                    resolve(markdownContent);
                } catch (error) {
                    reject(new Error('Error processing PDF: ' + error.message));
                }
            };
            
            reader.onerror = () => reject(new Error('Error reading PDF file'));
            reader.readAsArrayBuffer(file);
        });
    }
    
    // Post-process markdown to clean up formatting
    function postProcessMarkdown(markdown) {
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
    }
    
    // Create configured TurndownService
    function createTurndownService() {
        const turndownService = new TurndownService({
            headingStyle: 'atx',
            codeBlockStyle: 'fenced',
            emDelimiter: '*'
        });
        
        turndownService.addRule('images', {
            filter: 'img',
            replacement: function(content, node) {
                const src = node.getAttribute('src') || '';
                const alt = node.getAttribute('alt') || '';
                const title = node.getAttribute('title') || '';
                
                if (src.startsWith('data:image/')) {
                    const imageType = src.split(';')[0].split('/')[1];
                    return `![${alt}](Image: ${imageType} image${title ? ` "${title}"` : ''})`;
                }
                
                return `![${alt}](${src}${title ? ` "${title}"` : ''})`;
            }
        });
        
        turndownService.addRule('tables', {
            filter: 'table',
            replacement: function(content, node) {
                const rows = node.querySelectorAll('tr');
                if (rows.length === 0) return '';
                
                let markdownTable = '\n\n';
                
                rows.forEach((row, rowIndex) => {
                    const cells = row.querySelectorAll('th, td');
                    let rowContent = '| ';
                    
                    cells.forEach(cell => {
                        let cellContent = cell.textContent.trim();
                        cellContent = cellContent.replace(/\|/g, '\\|');
                        rowContent += cellContent + ' | ';
                    });
                    
                    markdownTable += rowContent + '\n';
                    
                    if (rowIndex === 0) {
                        let separator = '| ';
                        cells.forEach(() => {
                            separator += '--- | ';
                        });
                        markdownTable += separator + '\n';
                    }
                });
                
                return markdownTable + '\n';
            }
        });
        
        return turndownService;
    }
    
    // Handle single file download
    downloadBtn.addEventListener('click', function() {
        if (!convertedMarkdown) return;
        
        // Determine MIME type and extension based on output format
        let mimeType = 'text/markdown';
        let extension = '.md';
        
        if (outputFormat === 'json') {
            mimeType = 'application/json';
            extension = '.json';
        } else if (outputFormat === 'yaml') {
            mimeType = 'application/x-yaml';
            extension = '.yml';
        }
        
        const blob = new Blob([convertedMarkdown], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        
        const originalName = selectedFiles[0].name;
        const outputName = originalName.replace(/\.(docx|pdf)$/i, extension);
        
        a.href = url;
        a.download = outputName;
        document.body.appendChild(a);
        a.click();
        
        setTimeout(function() {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 0);
    });
    
    // Handle ZIP download for batch
    downloadZipBtn.addEventListener('click', async function() {
        if (convertedFiles.length === 0) return;
        
        downloadZipBtn.disabled = true;
        downloadZipBtn.textContent = 'Creating ZIP...';
        
        try {
            const zip = new JSZip();
            
            convertedFiles.forEach(file => {
                if (file.status === 'success') {
                    zip.file(file.name, file.content);
                }
            });
            
            const content = await zip.generateAsync({ type: 'blob' });
            const url = URL.createObjectURL(content);
            const a = document.createElement('a');
            
            a.href = url;
            a.download = 'converted_markdown_files.zip';
            document.body.appendChild(a);
            a.click();
            
            setTimeout(function() {
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
                downloadZipBtn.textContent = 'Download as ZIP';
                downloadZipBtn.disabled = false;
            }, 0);
        } catch (error) {
            markdownResult.textContent = 'Error creating ZIP file: ' + error.message;
            downloadZipBtn.textContent = 'Download as ZIP';
            downloadZipBtn.disabled = false;
        }
    });
    
    // Handle copy to clipboard
    copyBtn.addEventListener('click', function() {
        if (!convertedMarkdown) return;
        
        navigator.clipboard.writeText(convertedMarkdown)
            .then(function() {
                const originalText = copyBtn.textContent;
                copyBtn.textContent = 'Copied!';
                
                setTimeout(function() {
                    copyBtn.textContent = originalText;
                }, 2000);
            })
            .catch(function(err) {
                console.error('Failed to copy text: ', err);
            });
    });
    
    // Helper: Display file list for batch processing
    function displayFileList(files) {
        fileListDiv.innerHTML = '';
        files.forEach(file => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            fileItem.dataset.filename = file.name;
            fileItem.innerHTML = `
                <span class="file-status-icon">⏳</span>
                <span class="file-item-name">${file.name}</span>
                <span class="file-item-status">Queued</span>
            `;
            fileListDiv.appendChild(fileItem);
        });
    }
    
    // Helper: Update progress bar
    function updateProgress(percent) {
        progressBar.style.width = percent + '%';
        progressText.textContent = percent + '%';
    }
    
    // Helper: Update file status in the list
    function updateFileStatus(filename, status, errorMsg = '') {
        const fileItem = fileListDiv.querySelector(`[data-filename="${filename}"]`);
        if (!fileItem) return;
        
        const statusIcon = fileItem.querySelector('.file-status-icon');
        const statusText = fileItem.querySelector('.file-item-status');
        
        if (status === 'processing') {
            statusIcon.textContent = '⚙️';
            statusText.textContent = 'Processing...';
            fileItem.classList.add('processing');
        } else if (status === 'success') {
            statusIcon.textContent = '✅';
            statusText.textContent = 'Success';
            fileItem.classList.remove('processing');
            fileItem.classList.add('success');
        } else if (status === 'error') {
            statusIcon.textContent = '❌';
            statusText.textContent = 'Error' + (errorMsg ? `: ${errorMsg}` : '');
            fileItem.classList.remove('processing');
            fileItem.classList.add('error');
        }
    }
    
    // Helper: Reset UI
    function resetUI() {
        fileNameDisplay.textContent = 'No file selected';
        convertBtn.disabled = true;
        downloadBtn.disabled = true;
        downloadZipBtn.disabled = true;
        copyBtn.disabled = true;
        markdownResult.textContent = 'Your converted markdown will appear here...';
        batchProgress.style.display = 'none';
        downloadZipBtn.style.display = 'none';
        selectedFiles = [];
        convertedFiles = [];
        convertedMarkdown = '';
        fileListDiv.innerHTML = '';
        progressBar.style.width = '0%';
        progressText.textContent = '0%';
    }
}); 
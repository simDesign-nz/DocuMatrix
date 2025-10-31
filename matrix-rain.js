/**
 * DocuMatrix Forge - Matrix Digital Rain Effect
 * Creates the iconic Matrix falling code background
 * Developed by Simulated Designs NZ
 */

(function() {
    const canvas = document.getElementById('matrix-canvas');
    const ctx = canvas.getContext('2d');

    // Set canvas to full screen
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Matrix characters - katakana, latin, numbers, symbols
    const matrixChars = 'ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()_+-=[]{}|;:,.<>?/~';
    const chars = matrixChars.split('');

    const fontSize = 14;
    const columns = canvas.width / fontSize;

    // Create drops - one per column
    const drops = [];
    for (let i = 0; i < columns; i++) {
        drops[i] = Math.floor(Math.random() * canvas.height / fontSize);
    }

    // Draw the matrix rain
    function draw() {
        // Semi-transparent black to create fade effect
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Matrix green text
        ctx.fillStyle = '#00ff41';
        ctx.font = fontSize + 'px monospace';

        // Loop through drops
        for (let i = 0; i < drops.length; i++) {
            // Random character
            const text = chars[Math.floor(Math.random() * chars.length)];
            const x = i * fontSize;
            const y = drops[i] * fontSize;

            // Brighter color for the leading character
            if (Math.random() > 0.975) {
                ctx.fillStyle = '#ffffff';
            } else {
                ctx.fillStyle = '#00ff41';
            }

            ctx.fillText(text, x, y);

            // Reset drop to top randomly after it crosses the screen
            if (y > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }

            // Move drop down
            drops[i]++;
        }
    }

    // Animation loop
    setInterval(draw, 35);
})();

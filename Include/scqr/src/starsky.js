function drawStars(canvas, w, h) {
    for(let i=0; i<1000; i++) {
        canvas.beginPath();
        canvas.fillStyle = `rgb(${Math.floor(Math.random() * 32 + 224)}, ${Math.floor(Math.random() * 32 + 224)}, ${Math.floor(Math.random() * 16 + 240)})`;
        canvas.arc(Math.floor(Math.random() * w), Math.floor(Math.random() * h), Math.random() * 2, 0, Math.PI * 2);
        canvas.fill();
    }
}

module.exports.drawStars = drawStars;
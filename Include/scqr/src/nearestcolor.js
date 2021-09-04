function findNearestColor(color, colorList) {
    let scores = [];
    colorList.forEach((c,i) => {
        scores.push([i, (c[0] - color[0]) ** 2 + (c[1] - color[1]) ** 2 + (c[2] - color[2]) ** 2]);
    });
    scores = scores.sort((a,b) => a[1]-b[1]);
    return colorList[scores[0][0]];
}

function findNearestColorIndex(color, colorList) {
    let scores = [];
    colorList.forEach((c,i) => {
        scores.push([i, (c[0] - color[0]) ** 2 + (c[1] - color[1]) ** 2 + (c[2] - color[2]) ** 2]);
    });
    scores = scores.sort((a,b) => a[1]-b[1]);
    return scores[0][0];
}

exports.findNearestColor = findNearestColor;
exports.findNearestColorIndex = findNearestColorIndex;
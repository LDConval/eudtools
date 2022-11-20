const ColorJs = require("./color");

function toColorJs(rgbArray) {
    return new ColorJs("srgb", rgbArray.map(x => x / 255));
}

function findNearestColor(color, colorList) {
    let scores = [];
    const colorComp = toColorJs(color);
    colorList.map(toColorJs).forEach((c,i) => {
        scores.push([i, c.deltaE2000(colorComp)]);
    });
    scores = scores.sort((a,b) => a[1]-b[1]);
    return colorList[scores[0][0]];
}

function findNearestColorIndex(color, colorList) {
    let scores = [];
    const colorComp = toColorJs(color);
    colorList.map(toColorJs).forEach((c,i) => {
        scores.push([i, c.deltaE2000(colorComp)]);
    });
    scores = scores.sort((a,b) => a[1]-b[1]);
    return scores[0][0];
}

exports.findNearestColor = findNearestColor;
exports.findNearestColorIndex = findNearestColorIndex;
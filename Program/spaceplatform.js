'use strict';

(function(exports) {

function getPlatformImageSrc() {
    return `Include/bg_assets/platform${1 + Math.floor(Math.random() * 16)}.png`;
}

function initSpacePlatform() {
    const squaredDist = 0.20;
    const platforms = [];
    const container = $Q(".space_platforms_container");
    let k = 0;
    for(let i = 0; i < 3; i++) {
        let x, y;
        do {
            x = Math.random();
            y = Math.random();
            k++;
            if(k > 100) {
                return;
            }
        } while(!platforms.every(c => (c.x - x) ** 2 + (c.y - y) ** 2 >= squaredDist));
        const elem = $C("img");
        elem.classList.add("space_platform");
        elem.style.left = `${100 * x}vw`;
        elem.style.top = `${100 * y}vh`;
        elem.src = getPlatformImageSrc();
        platforms.push({
            x : x,
            y : y
        });
        container.appendChild(elem);
    }

    // randomize body background
    $Q("body").style.backgroundPositionX = `${100 * Math.random()}%`;
    $Q("body").style.backgroundPositionY = `${100 * Math.random()}%`;
}

exports.initSpacePlatform = initSpacePlatform;

})(window);
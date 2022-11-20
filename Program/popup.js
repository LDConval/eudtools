'use strict';

(function(exports) {

/**
 * Create a div element popup in the popup container with fixed size.
 * @param {number} width 
 * @param {number} height 
 */
function createPopup(width, height) {
    const popupContainer = $Q(".gr_popups");
    const elem = $C("div");
    const state = {
        x : Math.floor((popupContainer.offsetWidth - width) / 2),
        y : Math.floor((popupContainer.offsetHeight - height) / 2),
        prevMouseX : 0,
        prevMouseY : 0,
        width : width,
        height : height,
        dragging : false,
        elem : elem
    };
    elem.style.width = `${width}px`;
    elem.style.height = `${height}px`;
    elem.style.left = `${state.x}px`;
    elem.style.top = `${state.y}px`;
    elem.classList.add("popup_container");
    elem.addEventListener("mousedown", evtStartDrag.bind(null, state));
    elem.addEventListener("mousemove", evtUpdatePosition.bind(null, state));
    elem.addEventListener("mouseup", evtEndDrag.bind(null, state));
    createPopupCloseButton(elem, true);
    popupContainer.appendChild(elem);
}

/**
 * Make an HTML element popup (draggable). Element needs to be in popup container already.
 * @param {HTMLElement} elem 
 */
function makePopup(elem) {
    const popupContainer = $Q(".gr_popups");
    const state = {
        x : elem.offsetLeft,
        y : elem.offsetTop,
        prevMouseX : 0,
        prevMouseY : 0,
        width : elem.offsetWidth,
        height : elem.offsetHeight,
        dragging : false,
        elem : elem
    };
    elem.style.position = `absolute`;
    elem.style.width = `${state.width}px`;
    elem.style.height = `${state.height}px`;
    elem.style.left = `${state.x}px`;
    elem.style.top = `${state.y}px`;
    elem.classList.add("popup_container");
    elem.addEventListener("mousedown", evtStartDrag.bind(null, state));
    elem.addEventListener("mousemove", evtUpdatePosition.bind(null, state));
    elem.addEventListener("mouseup", evtEndDrag.bind(null, state));
    if(!elem.querySelector || !elem.querySelector(".popup_close")) {
        createPopupCloseButton(elem, false);
    }
}

function createPopupCloseButton(elem, removeElement) {
    const elemClose = $C("div");
    elemClose.classList.add("popup_close");
    if(removeElement) {
        elemClose.addEventListener("click", evt => {
            elem.parentNode.removeChild(elem);
        });
    }
    else {
        elemClose.addEventListener("click", evt => {
            elem.classList.add("popup_hidden");
        });
    }
    elem.appendChild(elemClose);
}

/*
 * Event listeners
 */

function evtStartDrag(state, evt) {
    if(evt.clientX) {
        state.prevMouseX = evt.clientX;
        state.prevMouseY = evt.clientY;
        state.dragging = true;
        state.elem.classList.add("popup_drag");
    }
}

function evtUpdatePosition(state, evt) {
    if(evt.clientX && state.dragging) {
        const deltaX = evt.clientX - state.prevMouseX;
        const deltaY = evt.clientY - state.prevMouseY;
        state.x += deltaX;
        state.y += deltaY;
        state.prevMouseX = evt.clientX;
        state.prevMouseY = evt.clientY;
        state.elem.style.left = `${state.x}px`;
        state.elem.style.top = `${state.y}px`;
        evt.preventDefault();
    }
}

function evtEndDrag(state, evt) {
    state.elem.classList.remove("popup_drag");
    state.dragging = false;
}

exports.createPopup = createPopup;
exports.makePopup = makePopup;

})(window);
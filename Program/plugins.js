'use strict';

var allPlugins = [];

var pluginCategory = [];
var pluginInListOffset = -1;

function Plugin(memory, length, title, paramObj) {
    // paramObj => init, act, html, css, offset
    this.memory = memory;
    this.length = length;
    this.title = title;
    this.type = paramObj.type || 17;
    if(paramObj.name) {
        this.name = paramObj.name;
    }
    else {
        this.name = "pl" + Math.floor(Math.random() * 42356103).toString(16);
    }
    if(paramObj.html) {
        this.html = paramObj.html;
    }
    if(paramObj.css) {
        this.css = paramObj.css;
    }
    if(paramObj.init) {
        this.init = paramObj.init;
    }
    if(paramObj.act) {
        this.act = paramObj.act;
    }
    if(paramObj.defaultDisplay) {
        this.defaultDisplay = paramObj.defaultDisplay;
    }
    if(paramObj.unlisted) {
        this.unlisted = paramObj.unlisted;
    }
    if(typeof paramObj.offset != "undefined") {
        this.resetOffset = paramObj.offset;
    }
}

function registerPlugin(plugin) {
    if(plugin.html) {
        var elem = document.createElement("div");
        elem.innerHTML = plugin.html;
        elem.id = "plugin_" + plugin.name + "_area";
        elem.classList.add("plugin_grid");
        if(!plugin.defaultDisplay) {
            elem.classList.add("plugin_grid_hidden");
        }
        else {
            addEventListener("load", function(evt) {
                elem.classList.remove("plugin_grid_hidden");
            });
        }
        plugin.area = elem;
    }
    if(plugin.css) {
        var elem = document.createElement("style");
        elem.innerHTML = plugin.css;
        elem.id = "plugin_" + plugin.name + "_css";
        document.head.appendChild(elem);
        plugin.cssElement = elem;
    }
    allPlugins[plugin.memory] = plugin;

    if(plugin.unlisted) {
        return;
    }
    if(pluginInListOffset == -1) {
        pluginCategory = categorylist[categorylist.length-1];
    }
    pluginInListOffset = memorylist.push([plugin.memory, plugin.length, plugin.type, plugin.title]) - 1;
    categorylist[0][1]++;
    pluginCategory[1]++;
}

function pluginInvoke(offset) {
    $A("#plugin_area > .plugin_grid").forEach(elem => elem.classList.add("plugin_grid_hidden"));
    if(typeof allPlugins == "object" && allPlugins[offset]) {
        if(typeof allPlugins[offset].resetOffset != "undefined") {
            MemData.offset = allPlugins[offset].resetOffset;
            calculateMemory();
            updateMemoryBaseFields();
        }
        if(allPlugins[offset].act) {
            allPlugins[offset].act();
        }
        if(allPlugins[offset].area) {
            allPlugins[offset].area.classList.remove("plugin_grid_hidden");
        }
    }
}

function pluginLoaderInit() {
    if(typeof allPlugins == "object") {
        for(let i in allPlugins) {
            if(allPlugins[i].area) {
                document.getElementById("plugin_area").appendChild(allPlugins[i].area);
            }
            if(allPlugins[i].init) {
                allPlugins[i].init();
            }
        }
    }
}
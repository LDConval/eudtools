const fs = require("fs");

let contents = [];
fs.readFileSync("listfile.txt", {encoding: "utf-8"}).split(/\r?\n/).filter(f => f.substr(f.length-4) == ".txt").forEach(function(fn) {
    let cont = fs.readFileSync(fn, {encoding: "utf-8"});
    contents.push({
        "name" : fn,
        "content" : cont.replace(/\r/g, "")
    });
});

let jsonp = "var packedTextData = " + JSON.stringify(contents) + ";"; // jsonpData
fs.writeFileSync("packedTextData.js", jsonp);
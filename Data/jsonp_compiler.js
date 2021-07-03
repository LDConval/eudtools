const fs = require("fs");

let contents = {};
fs.readdirSync(".").filter(f => f.substr(f.length-4) == ".txt").forEach(function(fn) {
    let cont = fs.readFileSync(fn, {encoding: "utf-8"});
    contents[fn] = cont.replace(/\r/g, "");
});

let jsonp = "var packedTextData = " + JSON.stringify(contents) + ";"; // jsonpData
fs.writeFileSync("packedTextData.js", jsonp);
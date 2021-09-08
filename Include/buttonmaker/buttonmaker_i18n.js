let availableTranslations = [{
    "key": "en",
    "text": "English"
}, /*{
    "key": "kr",
    "text": "\ud55c\uad6d\uc5b4"
},*/ {
    "key": "zh-CN",
    "text": "\u4e2d\u6587"
}];

var i18nButtonMakerData = {
    "zh-CN" : [
        ["title", 0, "按钮制作器"],
        ["#title_text", 0, "按钮制作器"],
        ["#trait-position-label", 0, "位置："],
        ["#trait-icon-label a", 0, "图标"],
        ["#trait-icon-label", 0, "："],
        ["#trait-reqfun-label", 0, "需求函数："],
        ["#trait-actfun-label", 0, "作用函数："],
        ["#trait-reqvar-label", 0, "需求变量："],
        ["#trait-actvar-label", 0, "作用变量："],
        ["#trait-actstr-label", 0, "可用标签："],
        ["#trait-reqstr-label", 0, "不可用"],
        ["#trait-reqstr-label a", 0, "标签"],
        ["#trait-reqstr-label", 1, "："],
        ["#input-player-label", 0, "玩家："],
        ["#input-cond-label", 0, "条件："],
        ["#input-act-label", 0, "动作："],
        ["#input-offset-label", 0, "偏移："],
        ["#generate-json-action", 0, "生成JSON"],
        ["#generate-trigger-action", 0, "生成触发"],
        ["#button-add-action", 0, "添加"],
        ["#button-sort-action", 0, "排序"],
        ["#button-delete-action", 0, "删除"],
        ["#button-reset-action", 0, "重置"],
        ["#redirect-action", 0, "重定向"],
        ["#redirect-cancel", 0, "取消"],
    ]
};

function translateOthers(key) {
    switch(key) {
        case "zh-CN":
        addButtonTypes = ["默认", "复制当前显示", "建造单位", "人族建筑", "星灵建筑", "虫族建筑", "使用技能", "升级科技", "研究技能", "基础按钮组", "从单位复制"];
        break;
    }
}

function translateElements(key) {
    if(key == "en") {
        return;
    }
    i18nButtonMakerData[key].forEach(args => {
        let [selectors, textNodeID, text] = args;
        Array.from(document.querySelectorAll(selectors))
             .map(a => Array.from(a.childNodes).filter(cn => cn.nodeType == document.TEXT_NODE))
             .forEach(a => {
                if(a[textNodeID]) {
                    a[textNodeID].textContent = text;
                }
             });
    });
}

function translateButtonMaker(evt) {
    let item;
    if(item = localStorage.getItem("eudscr_translate")) {
        let key = availableTranslations[item].key;
        translateElements(key);
        translateOthers(key);
    }
}

addEventListener("load", translateButtonMaker);
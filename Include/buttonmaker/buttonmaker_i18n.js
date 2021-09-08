let availableTranslations = [{
    "key": "en",
    "text": "English"
}, {
    "key": "ko",
    "text": "\ud55c\uad6d\uc5b4"
}, {
    "key": "zh-CN",
    "text": "\u4e2d\u6587"
}];

var i18nButtonMakerData = {
    "ko" : [
        ["title", 0, "버튼 작성자"],
        ["#title_text", 0, "버튼 작성자"],
        ["#trait-position-label", 0, "위치"],
        ["#trait-icon-label a", 0, "아이콘"],
        ["#trait-icon-label", 0, ""],
        ["#trait-reqfun-label", 0, "요구 기능"],
        ["#trait-actfun-label", 0, "행동 기능"],
        ["#trait-reqvar-label", 0, "요구 변수"],
        ["#trait-actvar-label", 0, "행동 변수"],
        ["#trait-actstr-label", 0, "액티브 라벨"],
        ["#trait-reqstr-label", 0, "비활성"],
        ["#trait-reqstr-label a", 0, "라벨"],
        ["#trait-reqstr-label", 1, ""],
        ["#input-player-label", 0, "선수"],
        ["#input-cond-label", 0, "조건"],
        ["#input-act-label", 0, "행동"],
        ["#input-offset-label", 0, "오프셋"],
        ["#generate-json-action", 0, "JSON 생성"],
        ["#generate-trigger-action", 0, "트리거 생성"],
        ["#button-add-action", 0, "더하다"],
        ["#button-sort-action", 0, "종류"],
        ["#button-delete-action", 0, "삭제"],
        ["#button-reset-action", 0, "재설정"],
        ["#redirect-action", 0, "리디렉션할"],
        ["#redirect-cancel", 0, "취소"],
    ],
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
        case "ko":
        addButtonTypes = ["기본", "현재 복사", "빌드 유닛", "테란 건물", "프로토스 빌딩", "저그 빌딩", "기술 사용", "업그레이드", "기술 개발", "기본 버튼", "복사 단위"];
        break;
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
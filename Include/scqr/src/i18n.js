var elementsData = {
    "en" : [
    ],
    "ko" : [
        ["title", 0, "스타크래프트 QR 코드 도구"],
        [".page-title", 0, "스타크래프트 맵 QR 코드/미니맵 드로잉 도구"],
        [".map-inputs", 0, "입력 맵:"],
        [".map-info", 0, "크기:"],
        ["#map-input-status-text", 0, "지도 업로드"],
        ["#mmdraw-image-status-text", 0, "이미지 업로드"],
        ["#tab-unitqr", 0, "단위QR"],
        ["#tab-tileqr", 0, "타일QR"],
        ["#tab-mmdraw", 0, "미니맵 그리기"],
        ["label[for*='qr-input-text']", 0, "데이터:"],
        ["label[for='tileqr-size']", 0, "크기:"],
        ["#label-unitqr-player", 0, "단위 소유자:"],
        ["#label-unitqr-pos", 0, "위치:"],
        ["#label-unitqr-ecl", 0, "오류 수정 수준:"],
        ["#label-tileqr-tiles", 0, "타일:"],
        ["#label-tileqr-pos", 0, "위치:"],
        ["#label-tileqr-ecl", 0, "오류 수정 수준:"],
        ["label[for*='qr-ecl-l']", 0, "낮다"],
        ["label[for*='qr-ecl-m']", 0, "보통"],
        ["label[for*='qr-ecl-h']", 0, "높다"],
        ["#label-unitqr-layerdown", 0, "레이어 다운"],
        ["#label-mmdraw-layerdown", 0, "레이어 다운"],
        ["#label-mmdraw-image", 0, "이미지:"],
        ["#label-mmdraw-size", 0, "크기:"],
        ["#label-mmdraw-pos", 0, "위치:"],
        ["#label-mmdraw-usegas", 0, "가스 사용"],
        ["#download-map", 0, "지도 저장"],
        ["#download-chk", 0, "CHK 저장"],
        ["#bubble-hint-unitqr-pos", 0, "픽셀단위로 측정됩니다. QR 코드를 중앙에 두려면 공백을 둡니다."],
        ["#bubble-hint-tileqr-pos", 0, "32x32 그리드로 측정됩니다. QR 코드를 중앙에 두려면 공백을 둡니다."],
        ["#bubble-hint-mmdraw-pos", 0, "픽셀단위로 측정됩니다. 이미지를 중앙에 두려면 공간을 둡니다."],
        ["#bubble-hint-unitqr-layer-down", 0, "QR 코드 뒤에 다른 플레이어의 시작 위치를 이동합니다."],
        ["#bubble-hint-mmdraw-layerdown", 0, "이미지 뒤에 있는 모든 시작 위치를 이동합니다. 이렇게 하면 플레이어의 시작 보기가 변경됩니다."],
        ["#bubble-hint-mmdraw-usegas", 0, "청록색을 위해 플레이어 11용 간헐천을 만듭니다. 게임이 시작될 때 트리거를 사용하여 제거해야 합니다."],
        ["#bubble-hint-tileqr-tiles", 0, "SCMDraft 타일 인덱스 도구(예: 0100.01)에서 번호를 사용할 수 있습니다."],
        ["#bubble-hint-mmdraw-image", 0, "블랙은 투명합니다."],
        ["#bubble-hint-mmdraw-size", 0, "단위 수입니다."],
        ["#palette-details", 0, "팔레트: f40404,0c49cc,2cb494,87409c,f88e14,703014,cce0d0,fcfc38,088008,fcfc7c,ebc4b0,4067d4,000000[,00e3fc]"],
    ],
    "zh" : [
        ["title", 0, "星际重制版二维码工具"],
        [".page-title", 0, "星际重制版二维码&小地图绘制工具"],
        [".map-inputs", 0, "地图："],
        [".map-info", 0, "大小："],
        ["#map-input-status-text", 0, "点击上传地图"],
        ["#mmdraw-image-status-text", 0, "点击上传图片"],
        ["#tab-unitqr", 0, "单位码"],
        ["#tab-tileqr", 0, "地形码"],
        ["#tab-mmdraw", 0, "小地图绘制"],
        ["label[for*='qr-input-text']", 0, "文本："],
        ["label[for='tileqr-size']", 0, "倍率："],
        ["#label-unitqr-player", 0, "玩家："],
        ["#label-unitqr-pos", 0, "位置："],
        ["#label-unitqr-ecl", 0, "除错码："],
        ["#label-tileqr-tiles", 0, "地形："],
        ["#label-tileqr-pos", 0, "位置："],
        ["#label-tileqr-ecl", 0, "除错码："],
        ["label[for*='qr-ecl-l']", 0, "低"],
        ["label[for*='qr-ecl-m']", 0, "中"],
        ["label[for*='qr-ecl-h']", 0, "高"],
        ["#label-unitqr-layerdown", 0, "图层下移："],
        ["#label-mmdraw-layerdown", 0, "图层下移："],
        ["#label-mmdraw-image", 0, "图像："],
        ["#label-mmdraw-size", 0, "大小："],
        ["#label-mmdraw-pos", 0, "位置："],
        ["#label-mmdraw-usegas", 0, "使用气矿："],
        ["#download-map", 0, "生成地图"],
        ["#download-chk", 0, "生成CHK"],
        ["#bubble-hint-unitqr-pos", 0, "单位为像素。留空会生成在中间"],
        ["#bubble-hint-tileqr-pos", 0, "单位为格子。留空会生成在中间"],
        ["#bubble-hint-mmdraw-pos", 0, "单位为像素。留空会生成在中间"],
        ["#bubble-hint-unitqr-layer-down", 0, "把其他玩家的起始地点移到二维码下层"],
        ["#bubble-hint-mmdraw-layerdown", 0, "把所有玩家的起始点移到图像下层。会导致起始点变化"],
        ["#bubble-hint-mmdraw-usegas", 0, "生成玩家11的气矿来表示青色。建议开始游戏后用触发删掉"],
        ["#bubble-hint-tileqr-tiles", 0, "可以填SCMDraft的地形工具标题栏上的数字（如0100.01）"],
        ["#bubble-hint-mmdraw-image", 0, "黑色是透明"],
        ["#bubble-hint-mmdraw-size", 0, "单位的数量"],
        ["#palette-details", 0, "调色板：f40404,0c49cc,2cb494,87409c,f88e14,703014,cce0d0,fcfc38,088008,fcfc7c,ebc4b0,4067d4,000000[,00e3fc]"],
    ]
};

var elementAttribsData = {
    "en" : [
    ],
    "ko" : [
        ["#unitqr-input-text, #tileqr-input-text", "placeholder", "QR 코드로 변환하려면 여기에 텍스트를 입력하십시오"],
        ["#mmdraw-size-width", "placeholder", "너비"],
        ["#mmdraw-size-height", "placeholder", "높이"],
    ],
    "zh" : [
        ["#unitqr-input-text, #tileqr-input-text", "placeholder", "输入想要转换为二维码的文字或链接"],
        ["#mmdraw-size-width", "placeholder", "宽度"],
        ["#mmdraw-size-height", "placeholder", "高度"],
    ]
};

var textData = {
    "en" : {},
    "ko" : {
        "No input map!" : "입력맵이 없습니다!",
        "No map data! load map from input first" : "지도 데이터가 없습니다! 먼저 입력에서 지도 업로드",
        "No function selected!" : "기능을 선택하지 않았습니다.",
        "Cannot apply function!" : "기능을 적용할 수 없습니다!",
        "Unknown error! cannot convert map" : "알 수없는 오류! 맵을 변환할 수 없습니다.",
        "Cannot save file!" : "파일을 저장할 수 없습니다!",
        "Error! cannot pack map as MPQ (try saving as CHK)" : "오류! 맵을 MPQ로 포장할 수 없습니다(CHK로 저장해 보십시오)",
        "Failed to read map data!" : "지도 데이터를 읽지 못했습니다!",
        "No input text!" : "텍스트를 입력하십시오!",
        "Please upload image file!" : "이미지를 업로드해 주세요!"
    },
    "zh" : {
        "No input map!": "没有输入图！",
        "No map data! load map from input first": "没有地图数据！首先加载地图",
        "No function selected!": "没有选择任何功能！",
        "Cannot apply function!": "不能应用功能！",
        "Unknown error! cannot convert map": "未知错误！无法转换地图",
        "Cannot save file!": "无法保存文件！",
        "Error! cannot pack map as MPQ (try saving as CHK)": "错误！不能将地图打包为 MPQ（尝试将地图保存为 CHK）",
        "Failed to read map data!" : "无法读取地图数据！",
        "No input text!" : "没有输入文本！",
        "Please upload image file!" : "请上传图像文件！"
    }
}

let currentLocale = "en";
const availableTranslations = ["ko", "zh"];

function detectLocale() {
    for(let i=0; i<availableTranslations.length; i++) {
        let key = availableTranslations[i];
        if(navigator.language.toString().indexOf(key) == 0) {
            currentLocale = key;
            return key;
        }
    }
    return currentLocale;
}

function autoSetLocale() {
    let loc = detectLocale();
    if(availableTranslations.indexOf(loc) != -1) {
        translateElements(elementsData[loc], elementAttribsData[loc]);
    }
    return loc;
}

function changeLocale() {
    if(currentLocale == "en") {
        currentLocale = "ko";
    }
    else if(currentLocale == "ko") {
        currentLocale = "zh";
    }
    else if(currentLocale == "zh") {
        currentLocale = "en";
    }
    else {
        currentLocale = "ko";
    }
    translateElements(elementsData[currentLocale], elementAttribsData[currentLocale]);
    return currentLocale;
}

function translateElements(elemsData, elemsAttribsData) {
    var fillBackEn = false;
    if(elementsData["en"].length == 0) {
        fillBackEn = true;
    }
	elemsData.forEach(args => {
		let [selectors, textNodeID, text] = args;
        let fbe = fillBackEn;
		Array.from(document.querySelectorAll(selectors))
		     .map(a => Array.from(a.childNodes).filter(cn => cn.nodeType == document.TEXT_NODE))
		     .forEach(a => {
		     	if(a[textNodeID]) {
                    if(fbe) {
                        elementsData["en"].push([selectors, textNodeID, a[textNodeID].textContent]);
                        fbe = false;
                    }
		     		a[textNodeID].textContent = text;
		     	}
		     });
	});
    elemsAttribsData.forEach(args => {
        let fbe = fillBackEn;
        let [selectors, attribID, text] = args;
        Array.from(document.querySelectorAll(selectors))
             .forEach(a => {
                if(fbe) {
                    elementAttribsData["en"].push([selectors, attribID, a[attribID]]);
                    fbe = false;
                }
                a[attribID] = text;
             });
    });
}

function getI18n(key) {
    return (textData[currentLocale] && textData[currentLocale][key]) || key;
}

module.exports = {
    detectLocale : detectLocale,
    autoSetLocale : autoSetLocale,
    changeLocale : changeLocale,
    translateElements : translateElements,
    getI18n : getI18n
};
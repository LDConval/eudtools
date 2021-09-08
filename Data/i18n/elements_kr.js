// must be "var"!! "const" will make the object unreachable with window.objectname

var i18nElementsData = [
    ["title",0,"EUD 도구 상자 v1.25"],
	["#title_text",0,"EUD 도구 상자 v1.25"],
	["#label_offset",0,"시작："],
	["#label_length",0,"길이："],
	["#label_object",0,"물체："],
	["#label_memory",0,"기억："],
	["#label_hex",0,"마녀："],
	["#label_value",0,"가치："],
	["#label_origvalue",0,"원래："],
	["#settings_div1",0,"설정"],
	["#settings_label_offset",0,"증가 또는 감소 사용："],
	["#settings_label_triggerstyle",0,"트리거 형식："],
	["#settings_label_hexoutput",0,"숫자 형식： 메모리"],
	["#settings_label_hexoutput",1," | 가치"],
	["#settings_label_hexoutput",2," | 마스크"],
	["#settings_label_hexoutput > select > option:first-child",0,"소수"],
	["#settings_label_hexoutput > select > option:nth-child(2)",0,"16진수"],
	["#settings_label_translate",0,"언어："],
	["#label_trigdupl_count",0,"복사량："],
	["#label_trigdupl_area",0," 방아쇠："],
	["#parse_trigdupl",0,"생성하다"],
	["#toollinks_label",0,"다른 도구"],
	["#toollinks_links",1," - 코드 웨어하우스(영어 버전)"],
	["#toollinks_links",3," - 튜토리얼 및 일부 EUD 튜토리얼 사용"],
	["#toollinks_links",5," - 버튼 수정 도구"],
	["#toollinks_links",7," - SC 1.16.1 메모리 테이블"],
	["#toollinks_links",9," - SC 1.16.1 메모리 테이블(백업)"],
	["#toollinks_links",11," - Iscript 코드 정보"],
	["#toollinks_links",13," - 버튼 아이콘 목록"],
	["#toollinks_links",15," - 버튼 문자열 목록"],
	["#toollinks_links",17," - 지도 문자열 읽기/수정"],
	["#toollinks_links",19," - QR코드와 미니맵 그리기"],
	["#label_etg_base",0,"트리거 템플릿："],
	["#label_etg_ofs",0,"메모리 시작："],
	["#label_etg_cont",0,"16진수："],
	["#parse_etg",0,"생성하다"],
	["#label_trigconv_buttonoffset",0,"버튼 주소："],
	["#label_trigconv_area",0,"방아쇠："],
	["#parse_trigconv",0,"생성하다"],
	["#label_stattbl_player",0,"CPT 플레이어："],
	["#label_stattbl_cond",0,"상태："],
	["#label_stattbl_offset",0,"오프셋："],
	["#label_stattbl_str1",0,"번호 1："],
	["#label_stattbl_str2",0,"2 번："],
	["#label_stattbl_content1",0,"문자열 1："],
	["#label_stattbl_content2",0,"문자열 2："],
	["#parse_stattbl",0,"생성하다"],
	["#label_trigslice_player",0,"플레이어："],
	["#label_trigslice_cond",0,"상태："],
	["#label_trigslice_act",0,"동작："],
	["#parse_trigslice",0,"생성하다"],
	["#label_playercolor_id",0,"플레이어："],
	["#label_playercolor_colors",0,"색상："],
	["#label_playercolor_colors2",0,"작은 지도："],
	["#label_icecc",0,"트리거 템플릿："],
	["#label_icecc2",0,"IceCC 코드："],
	["#parse_icecc",0,"생성하다"],
	["#label_textstack_text",0,"단어："],
	["#label_textstack_unit",0,"단위："],
	["#label_textstack_disp",0,"보여 주다："],
	["#label_textstack_objs",0,"일："],
	["#label_textstack_desc",0,"요약 보고："],
	["#label_buttonfunction",0,"기능："],
	["#label_flags_table",0,"옵션："],
	["#label_flags_value",0,"값："],
	["#label_flags_mode",0,"모델："],
	["#select_flags_mode_0",0,"모든 설정"],
	["#select_flags_mode_1",0,"선택한 세트만"],
	["#select_flags_mode_2",0,"선택 취소"],
	["#select_flags_mode_3",0,"선택 취소"],
	["#parse_flags",0,"생성하다"],
	["#label_reqwrite_type",0,"유형："],
	["#label_reqwrite_uid",0,"개체 ID："],
	["#label_reqwrite_offset",0,"수요 편차："],
	["#label_reqwrite_add",0,"지침 추가："]
];

var i18nPluginData = {
    "category" : "플러그인",
    "separator" : "-----플러그인-----"
};

var i18nExtraData = {
    "converterText" : "이 도구는 SC v1.08b 트리거를 SC:R로 변환하기 위한 것입니다."
}
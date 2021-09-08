// must be "var"!! "const" will make the object unreachable with window.objectname

var i18nElementsData = [
    ["title", 0, "EUD工具箱 v1.28"],
    ["#title_text", 0, "EUD工具箱 v1.28"],
    ["#label_offset", 0, "起始："],
    ["#label_length", 0, "长度："],
    ["#label_object", 0, "物体："],
    ["#label_memory", 0, "内存："],
    ["#label_hex", 0, "HEX："],
    ["#label_value", 0, "数值："],
    ["#label_origvalue", 0, "原始："],
    ["#settings_div1", 0, "设置"],
    ["#settings_label_offset", 0, "使用增减："],
    ["#settings_label_triggerstyle", 0, "触发格式："],
    ["#settings_label_hexoutput", 0, "数字格式：内存 "],
    ["#settings_label_hexoutput", 1, " | 数值 "],
    ["#settings_label_hexoutput", 2, " | 掩码 "],
    ["#settings_label_hexoutput > select > option:first-child", 0, "十进制"],
    ["#settings_label_hexoutput > select > option:nth-child(2)", 0, "十六进制"],
    ["#settings_label_translate", 0, "语言："],
    ["#label_trigdupl_count", 0, "复制量："],
    ["#label_trigdupl_area", 0, "　触发："],
    ["#parse_trigdupl", 0, "生成"],
    ["#toollinks_label", 0, "其他工具链接"],
    ["#toollinks_links", 1, " - 代码仓库（英文版）"],
    ["#toollinks_links", 3, " - 使用教程和一些EUD教程"],
    ["#toollinks_links", 5, " - 按钮修改工具"],
    ["#toollinks_links", 7, " - SC 1.16.1 内存表"],
    ["#toollinks_links", 9, " - SC 1.16.1 内存表（备份）"],
    ["#toollinks_links", 11, " - Iscript代码资料"],
    ["#toollinks_links", 13, " - 按钮图标列表"],
    ["#toollinks_links", 15, " - 按钮字符串列表"],
    ["#toollinks_links", 17, " - 读取/修改chk格式地图的字符串"],
    ["#toollinks_links", 19, " - 绘制二维码和小地图"],
    ["#label_etg_base", 0, "触发模板："],
    ["#label_etg_ofs", 0, "内存起始："],
    ["#label_etg_cont", 0, "十六进制："],
    ["#parse_etg", 0, "生成"],
    ["#label_trigconv_buttonoffset", 0, "按钮地址："],
    ["#label_trigconv_area", 0, "触发："],
    ["#parse_trigconv", 0, "生成"],
    ["#label_stattbl_player", 0, "CPT玩家："],
    ["#label_stattbl_cond", 0, "条件："],
    ["#label_stattbl_offset", 0, "偏移量："],
    ["#label_stattbl_str1", 0, "编号1："],
    ["#label_stattbl_str2", 0, "编号2："],
    ["#label_stattbl_content1", 0, "字符串1："],
    ["#label_stattbl_content2", 0, "字符串2："],
    ["#parse_stattbl", 0, "生成"],
    ["#label_trigslice_player", 0, "玩家："],
    ["#label_trigslice_cond", 0, "条件："],
    ["#label_trigslice_act", 0, "动作："],
    ["#parse_trigslice", 0, "生成"],
    ["#label_playercolor_id", 0, "玩家："],
    ["#label_playercolor_colors", 0, "颜色："],
    ["#label_playercolor_colors2", 0, "小地图："],
    ["#label_icecc", 0, "触发模板："],
    ["#label_icecc2", 0, "IceCC代码："],
    ["#parse_icecc", 0, "生成"],
    ["#label_textstack_text", 0, "文字："],
    ["#label_textstack_unit", 0, "单位："],
    ["#label_textstack_disp", 0, "显示："],
    ["#label_textstack_objs", 0, "任务："],
    ["#label_textstack_desc", 0, "简报："],
    ["#label_buttonfunction", 0, "函数："],
    ["#label_flags_table", 0, "选项："],
    ["#label_flags_value", 0, "数值："],
    ["#label_flags_mode", 0, "模式："],
    ["#select_flags_mode_0", 0, "全部设置"],
    ["#select_flags_mode_1", 0, "仅设置已选"],
    ["#select_flags_mode_2", 0, "清除已选"],
    ["#select_flags_mode_3", 0, "清除未选"],
    ["#parse_flags", 0, "生成"],
    ["#label_reqwrite_type", 0, "类型："],
    ["#label_reqwrite_uid", 0, "物体ID："],
    ["#label_reqwrite_offset", 0, "需求偏移："],
    ["#label_reqwrite_add", 0, "添加指令："],
];

var i18nPluginData = {
    "category" : "插件",
    "separator" : "-----插件-----"
};

var i18nExtraData = {
    "converterText" : "将星际1.08的EUD转换为重制版EUD。\n\n支持DAT修改，按钮，需求，升级；插件编号需要与SMC默认编号一致。\n\n在此处粘贴SMC触发并点生成即可转换为重制版SCMD触发。"
}
"use strict";

// 随机返回一个答案
function getRandomItemOfArray (arr) {
	return arr[Math.floor(Math.random() * arr.length)];
}

module.exports = {
	// 按网站后台信息填写性别相关问题
	性别: student => +student.sex ? "男" : "女",
	// 随机给出答案示例
	你的学校属于什么位置: getRandomItemOfArray(["城市", "农村"]),
	// 随机给出答案示例
	和谁在一起生活: getRandomItemOfArray(["父母外出", "在父母所在", "本地生活"]),
	// 单项选择示例
	你家是否有灭火器: "没有",
	// 多项选择示例
	电视机着火: ["切断电源", "干粉灭火器"],
};

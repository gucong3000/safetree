"use strict";
const dialogs = require("./dialogs");

function getRandomItemOfArray (arr) {
	return arr[Math.floor(Math.random() * arr.length)];
}

const specials = {
	"性别": student => +student.sex ? "男" : "女",
	"你的学校属于什么位置": getRandomItemOfArray(["城市", "农村"]),
	"和谁在一起生活": getRandomItemOfArray(["父母外出", "在父母所在", "本地生活"]),
	"你家是否有灭火器": "没有",
	"你家是否制定了家庭火灾逃生路线图": "没有",
	"你家是否定期进行消防疏散演练": "没有",
	"你家如果油锅起火了": ["锅盖盖住", "干毛巾覆盖"],
	"你家是否存放了汽油": "没有",
	"你家的防盗窗上是否留有逃生出口": "没有",
	"会正确拨打119报警电话": "都会",
	"是否堆放了杂物": "没有",
	"沙发上抽烟": "没有",
	"炉灶有火时": "有",
	"抽油烟机是否会定期清洗": "会",
	"你家会定期检查线路": "会",
	"出门关闭电源": "有",
	"是否放在了安全的地方": "是",
	"是否摆放在了安全的位置": "是",
	"长期不拔的现象": "没有",
	"常年不拔电源插头的现象": "否",
	"电器着火": ["切断电源", "干粉灭火器"],
	"电视机着火": ["切断电源", "干粉灭火器"],
	"检查燃气是否有泄漏": "肥皂水",
	"是否有在消防通道停放车辆": "没有",
	"防火门": "关闭",
	"火灾报警电话": "119",
	"油锅着火": ["将锅端下", "锅盖"],
	"入住宾馆酒店时": "逃生路线图",
	"闻到煤气气味时": "打开门窗通风",
	"求救方法错误的是": "大声哭泣",
	"儿童燃放烟花爆竹时": "由大人看护",
	"被困室内无法逃生时": ["堵塞门缝", "把水泼在门上降温", "发出求救信"],
	"消防违法行为": ["封闭消防安全出口", "遮挡消防设施", "损坏公共消防设施"],
	"用电时要注意防火安全": ["不乱接乱拉电线，不超负荷用电", "及时更换老化电器设施和线路", "外出时要关闭电源开关"],
	"家庭应该采取的消防安全措施": ["配备必要的消防器材", "绘制家庭逃生疏散路线", "消除家庭火灾隐患"],
	"为做到防患于未然": "制定家庭疏散预案并进行演练",
	"正确的逃生方法是": "迅速逃生",
	"高层建筑失火时": "从疏散通道逃离",
	"你是否有闯红灯的行为": "没有",
	"当你看到红灯，但路上没有车时，你会过马路吗": "不会",
	"你过马路时是否一直都走斑马线": "是",
	"你家人开车时，有下列哪些行为": "以上行为都没有",
	"你从哪里学习交通安全知识": "学校安全教育",
	"你认为你们学校开展的交通安全教育效果怎么样": "很好",
	"你认为有必要对交通安全知识进行宣传教育吗": "有",
	"你认为在提升学生交通安全意识问题上，谁的作用最重要": "自身的意识",
	"交通事故的报警电话是": "122",
	"才能上路骑自行车": "12",
	"你是否有过翻越道路中央安全护栏的行为": "没有",
	"在车辆没有停稳之前": "不准开车门和上下人",
	"放学路上，小明准备过马路时红灯亮了，这时他应该": "不管有无车辆，都等交通灯变为绿灯时再通过",
	"在没有施划人行横道的公路上，乘车人从公共汽车下车后横过公路时，您认为下列做法正确的是": "车开走且确认安全后再通过",
	"亮亮要去马路对面的超市买东西，可是路口没有红绿灯也没有斑马线，这时你认为他怎么做才是最安全的": "在路口左看右看，反复确认安全后快速通过",
	"乘坐大巴车时，如果遇到事故被困车内，我们可以利用哪些方法逃出车外": "以上都可以"
};

window.open = url => {
	location.href = url;
};

window.alert = msg => {
	if (/已/.test(msg)) {
		callback();
	} else {
		dialogs.alert(msg);
	}
};

function callback (val) {
	if (window.callPhantom) {
		window.callPhantom(val);
	} else if (window.require) {
		const {ipcRenderer} = require("electron");
		ipcRenderer.sendToHost("close", val);
	}
}

function requestData () {
	return new Promise(resolve => {
		const {ipcRenderer} = require("electron");
		ipcRenderer.once("data", (e, data) => {
			resolve(data);
		});
		ipcRenderer.sendToHost("request-data");
	});
}

function getHomeWorkUrls () {
	let links = document.querySelectorAll("table tr a[name^=workToUrl]");
	if (links && links.length) {
		const urls = {
			specials: {}
		};
		links = Array.from(links).map(a => {
			// eslint-disable-next-line no-eval
			const args = eval(a.getAttribute("onclick").trim().replace(/^\s*\w+\s*\((.+)\).*$/, "[$1]"));
			if (args[5]) {
				const title = a.parentNode.parentNode.children[1].innerText.trim().replace(/^第(\d+)期[：:]\s*/, "");
				const id = RegExp.$1;
				urls.specials[id] = {
					expired: /不记录数据/.test(a.parentNode.parentNode.children[4].innerText),
					title: title,
					url: args[5]
				};
			} else {
				urls[String(args[0])] = `/JiaTing/EscapeSkill/SeeVideo.aspx?gid=${args[3]}&li=${args[0]}`;
			}
		});
		callback(urls);
	} else {
		setTimeout(getHomeWorkUrls, 800);
	}
}

function ready (callback) {
	const time = process.env.CI ? 1000 : 200;
	if (document.readyState === "complete") {
		setTimeout(callback, time);
	} else {
		window.addEventListener("load", () => {
			setTimeout(callback, time);
		});
	}
}

ready(() => {
	const $ = window.$;

	function whaitResult () {
		if ($("#yes:visible,#resultScore:visible").length) {
			callback();
		} else {
			setTimeout(whaitResult, 200);
		}
	}
	if (location.pathname === "/JiaTing/JtMyHomeWork.html") {
		getHomeWorkUrls();
	} else if (window.ShowTestPaper) {
		window.getAnswers = function (answers) {
			setTimeout(function () {
				$(".bto_testbox input[type=radio]").prop("checked", function (i) {
					return !!+answers.Rows[i].istrue;
				});
				$(".bto_testbox .btn_submit").click();
				whaitResult();
			}, 600);
		};

		// eslint-disable-next-line no-eval
		window.eval(window.ShowTestPaper.toString().replace(/TestPaperThreelistGet2.*?\n?.*?if\s+\(.*?\b(\w+)\.Rows\.length.*?\)\s*\{/, function (s, dataVarName) {
			return s + "getAnswers(" + dataVarName + ");";
		}));
		window.ShowTestPaper();
	} else if (window.loadQuestion) {
		window.loadQuestion(0, 99, 1, false);
		// $("label:visible").filter((i, label) => (
		// 	document.getElementById(label.htmlFor).type === "radio"
		// )).click();
		requestData().then(student => {
			[
				"在规定的地点等候校车，排队上下不拥挤",
				"儿童安全座椅",
				"从不在车上饮食",
				"从不骑电动车",
				"一直都系安全带",
				"系好安全带",
				"没有电动车",
				"没有私家车",
				student.grade <= 6 && "小学",
				student.grade >= 7 && "中学",
				student.grade >= 7 && student.grade <= 9 && "初中",
				student.grade >= 10 && student.grade <= 12 && "高中",
				"步行"
			].filter(Boolean).forEach(label => {
				$(`label:contains('${label}'):visible`).click();
			});

			for (const q in specials) {
				let a = specials[q];
				if (typeof a === "function") {
					a = a(student);
				}
				const dl = $(`dt:contains('${q}'):visible`).first().parent("dl");
				if (Array.isArray(a)) {
					a.forEach(a => {
						dl.find(`label:contains('${a}'):visible`).click();
					});
				} else {
					dl.find(`label:contains('${a}'):visible`).first().click();
				}
			}

			setTimeout(() => {
				$("a:contains('提交')").click();
				whaitResult();
			}, 1000);
		});
	} else {
		const timer1 = setInterval(() => {
			$("a:contains('马上去'), a:contains('请签'), a:contains('请点')").filter(":visible").first().click();
		}, 200);
		const timer2 = setTimeout(() => {
			location.href = location.pathname.replace(/(?:_vr|\d*)(\.\w+)$/, "2$1");
		}, process.env.CI ? 3000 : 800);
		window.onbeforeunload = () => {
			clearInterval(timer1);
			clearTimeout(timer2);
		};
	}
});

if (process.env.CI_TEACHER_ACCOUNT) {
	setTimeout(callback, 90000);
}

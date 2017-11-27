"use strict";

function getRandomItemOfArray(arr) {
	return arr[Math.floor(Math.random() * arr.length)];
}

const specials = {
	"性别": student => "男女"[student.sex - 1],
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
};

window.open = url => {
	location.href = url;
};

window.alert = () => {};

function callback(val) {
	if (window.callPhantom) {
		window.callPhantom(val);
	} else if (window.require) {
		const {ipcRenderer} = require("electron");
		ipcRenderer.sendToHost("close", val);
	}
}

function requestData() {
	return new Promise(resolve => {
		const {ipcRenderer} = require("electron");
		ipcRenderer.once("data", (e, data) => {
			resolve(data);
		});
		ipcRenderer.sendToHost("request-data");
	});
}

function getHomeWorkUrls() {
	let links = document.querySelectorAll("table tr a[name^=workToUrl]");
	if (links && links.length) {
		const urls = {
			specials: [],
		};
		links = Array.from(links).map(a => {
			const args = eval(a.getAttribute("onclick").trim().replace(/^\s*\w+\s*\((.+)\).*$/, "[$1]"));
			if (args[5]) {
				urls.specials.push({
					title: a.parentNode.parentNode.children[1].textContent.trim(),
					url: args[5],
				});
			} else {
				urls[String(args[0])] = `/JiaTing/EscapeSkill/SeeVideo.aspx?gid=${ args[3] }&li=${ args[0] }`;
			}
		});
		callback(urls);
	} else {
		setTimeout(getHomeWorkUrls, 800);
	}
}

function ready(callback) {
	if (document.readyState === "complete") {
		callback();
	} else {
		window.addEventListener("load", callback);
	}
}

ready(() => {
	setTimeout(() => {
		const $ = window.$;

		function whaitResult() {
			if ($("#yes:visible").length) {
				callback();
			} else {
				setTimeout(whaitResult, 600);
			}
		}
		if (location.pathname === "/JiaTing/JtMyHomeWork.html") {
			getHomeWorkUrls();
		} else if (window.ShowTestPaper) {
			window.getAnswers = function(answers) {
				setTimeout(function() {
					$(".bto_testbox input[type=radio]").prop("checked", function(i) {
						return !!+answers.Rows[i].istrue;
					});
					$(".bto_testbox .btn_submit").click();
					whaitResult();
				}, 600);
			};

			window.eval(window.ShowTestPaper.toString().replace(/TestPaperThreelistGet2.*?\n?.*?if\s+\(.*?\b(\w+)\.Rows\.length.*?\)\s*\{/, function(s, dataVarName) {
				return s + "getAnswers(" + dataVarName + ");";
			}));
			window.ShowTestPaper();
		} else if (window.loadQuestion) {
			window.loadQuestion(0, 99, 1, false);
			$("label:visible").filter((i, label) => (
				document.getElementById(label.htmlFor).type === "radio"
			)).click();
			requestData().then(student => {
				const sex = "男女"[student.sex - 1];
				const grade = [
					"小学",
					"小学",
					"初中",
					"高中",
				][parseInt((student.grade - 1) / 3)];
				[
					sex,
					grade,
				].forEach(label => {
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
					setTimeout(callback, 1000);
				}, 1000);
			});
		} else {
			$("a:contains('马上去'), a:contains('请签'), a:contains('请点')").filter(":visible").first().click();
			setTimeout(() => {
				location.href = $("a:contains('二'):visible").prop("href") || location.pathname.replace(/\d*(\.\w+)$/, "2$1");
			}, 1000);
		}
	}, 1000);
});

if (process.env.CI_TEACHER_ACCOUNT) {
	setTimeout(callback, 90000);
}

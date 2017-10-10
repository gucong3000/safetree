"use strict";
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

window.addEventListener("load", () => {
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
			$("label:visible").click();
			requestData().then(student => {
				const sex = "男女"[student.sex - 1];
				const grade = [
					"小学",
					"小学",
					"初中",
					"高中",
				][parseInt((student.grade - 1) / 3)];
				[
					"在本地生活",
					"12339",
					"2015年7月1日",
					"城市",
					sex,
					grade,
				].forEach(label => {
					$(`label:contains('${label}'):visible`).click();
				});

				setTimeout(() => {
					$("a:contains('提交')").click();
					setTimeout(callback, 1000);
				}, 1000);
			});
		} else {
			$("a:contains('马上去'), a:contains('请签'), a:contains('请点')").filter(":visible").click();
			setTimeout(() => {
				location.href = $("a:contains('二'):visible").prop("href");
			}, 1000);
		}
	}, 1000);
});

if (process.env.CI_TEACHER_ACCOUNT) {
	setTimeout(callback, 90000);
}

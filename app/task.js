"use strict";
const dialogs = require("./dialogs");
const request = require("./request");
const path = require("path");

if (!window.$) {
	window.$ = require("jquery");
}

function sleep (timeout) {
	return new Promise((resolve) => {
		setTimeout(resolve, timeout);
	});
}

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
	"乘坐大巴车时，如果遇到事故被困车内，我们可以利用哪些方法逃出车外": "以上都可以",
	"回执签字": "已经",
	"有没有": "有",
	"学校有开设游泳课吗": "没有",
	"禁止自己的孩子去池塘": "有",
	"反间谍工作": "国家安全",
	"举报间谍": "12339",
	"哪些信息属于个人信息": "以上都是",
	"不良信息": "关闭",
	"安全教育日为每年的什么时候": "4月15日",
	"需要我们协助时": "配合",
	"文明上网的行为": "上网查阅学习资料",
	"可以随便从互联网上下载": "指导下下载",
	"《国家安全法》出台时间为": "2015年7月1日",
	"哪种方式设置的密码相对安全": "综合性",
	"属于网络欺凌的是": "以上都是",
	"总体国家安全观以什么为根本": "政治安全",
	"拥有属于自己的手机或电脑吗": "没有",
	"平时上网吗": "从不",
};

try {
	Object.assign(specials, require(path.join(process.cwd(), "specials")));
} catch (ex) {
	console.error(ex);
}

window.open = url => {
	location.href = url;
};

window.alert = msg => {
	if (/(已|重复)/.test(msg)) {
		callback();
	} else {
		dialogs.alert(msg);
	}
};

function callback (val) {
	if (window.callPhantom) {
		window.callPhantom(val);
	} else if (window.require) {
		const { ipcRenderer } = require("electron");
		ipcRenderer.sendToHost("close", val);
	}
}

function requestData () {
	return new Promise(resolve => {
		const { ipcRenderer } = require("electron");
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
			specials: {},
		};
		links = Array.from(links).map(a => {
			const title = a.parentNode.parentNode.children[1].innerText.trim().replace(/^第(\d+)期[：:]\s*/, "");

			// eslint-disable-next-line no-eval
			const args = eval(a.getAttribute("onclick").trim().replace(/^\s*\w+\s*\((.+)\).*$/, "[$1]"));
			if (args[5]) {
				urls.specials[args[5]] = {
					expired: /不记录数据/.test(a.parentNode.parentNode.children[4].innerText),
					title: title,
					url: args[5],
				};
			} else {
				urls[String(args[0])] = urls[title] = `/JiaTing/EscapeSkill/SeeVideo.aspx?gid=${args[3]}&li=${args[0]}`;
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

ready(async () => {
	if (location.pathname === "/JiaTing/JtMyHomeWork.html") {
		getHomeWorkUrls();
		return;
	}

	const $ = window.$;

	async function whaitResult (i) {
		i = i || 0;
		await sleep(200);
		if ($("#yes:visible,#resultScore:visible,#questionsuccess:visible").length || i > 30) {
			return;
		}
		++i;
		return whaitResult(i);
	}

	if (window.ShowTestPaper) {
		// 常规作业
		window.getAnswers = async function (answers) {
			await sleep(600);
			$(".bto_testbox input[type=radio]").prop("checked", function (i) {
				return !!+answers.Rows[i].istrue;
			});
			$(".bto_testbox .btn_submit").click();
			await whaitResult(0);
			callback();
		};

		// eslint-disable-next-line no-eval
		window.eval(window.ShowTestPaper.toString().replace(/TestPaperThreelistGet2.*?\n?.*?if\s+\(.*?\b(\w+)\.Rows\.length.*?\)\s*\{/, function (s, dataVarName) {
			return s + "getAnswers(" + dataVarName + ");";
		}));
		window.ShowTestPaper();
		return;
	}

	const student = await requestData();

	if (window.SpecialSign) {
		[1, 2, 3].forEach(workStep => {
			window.SpecialSign(workStep);
		});
	}

	if (window.gotest && window.tijiao) {
		window.tijiao(0);
		await sleep(800);
		window.gotest();
	} else if (window.SPECIALID) {
		await Promise.all([
			request.post(
				"https://huodong.xueanquan.com/Topic/topic/main/api/v1/safetyday/survey", {
					prvId: student.prvid,
					cityId: student.cityid,
					countyId: student.coutryid,
					schoolId: student.schoolid,
					grade: student.grade,
					classRoom: student.classroom,
					trueName: student.truename,
					specialId: window.SPECIALID,
					answer: "1A,2C,3B,4C,5B,6C,7C,8A,9A,10C,",
				}
			),
			request.getJSON(
				student.baseurl + "/Topic/topic/platformapi/api/v2/records/sign?callback=?", {
					specialId: window.SPECIALID,
					step: 1,
				}
			),
			request.post(
				student.baseurl + "/Topic/topic/platformapi/api/v1/records/sign", {
					specialId: window.SPECIALID,
					step: 2,
				}
			),
		]);
		callback();
	} else if (window.loadQuestion) {
		window.loadQuestion(0, 99, 1, false);
		window.questionMust = () => true;
		// $("label:visible").filter((i, label) => (
		// 	document.getElementById(label.htmlFor).type === "radio"
		// )).click();
		await sleep(800);
		const student = await requestData();

		[
			"在规定的地点等候校车，排队上下不拥挤",
			"儿童安全座椅",
			"从不在车上饮食",
			"从不骑电动车",
			"一直都系安全带",
			"系好安全带",
			"没有电动车",
			"没有私家车",
			"会，已经熟练掌握",
			"正规的游泳馆",
			"没有开设游泳课",
			"非常好",
			"步行",
			"在国家安全局向你了解情况时积极配合",
			"及时提醒并制止",
			student.grade <= 6 && "小学",
			student.grade >= 7 && "中学",
			student.grade >= 7 && student.grade <= 9 && "初中",
			student.grade >= 10 && student.grade <= 12 && "高中",
		].filter(Boolean).forEach(label => {
			$(`label:contains('${label}'):visible`).click();
		});

		for (const q in specials) {
			let a = specials[q];
			if (typeof a === "function") {
				a = a(student);
			}
			$(`dt:contains('${q}'):visible`).toArray().forEach(dl => {
				if (Array.isArray(a)) {
					a.forEach(a => {
						$(dl).find(`label:contains('${a}'):visible`).click();
					});
				} else {
					$(dl).find(`label:contains('${a}'):visible`).first().click();
				}
			});
		}
		document.addEventListener("click", () => {
			console.log(showRst());
		});

		await sleep(800);

		$("a:contains('提交'), #tijiao").click();
		await whaitResult(0);
		callback();
	} else if (document.body.children.length === 1) {
		document.body.children[0].click();
	} else if ($("p:contains('学校安全教育平台移动版下载方式')").length) {
		await sleep(800);
		callback();
	} else {
		const timer1 = setInterval(() => {
			$("a:contains('马上去'), a:contains('请签'), a:contains('请点')").filter(":visible").first().click();
		}, 200);
		const timer2 = setTimeout(() => {
			const urls = {
				"_family.html": /_school.html$/,
				"_two$1": /_one(\.\w+)$/,
				"2$1": /(?:_vr|\d+)(\.\w+)$/,
				"_three$1": /_two(\.\w+)$/,
			};

			let newUrl = $(".nav a:contains('二'), .nav a:contains('家庭版')").prop("href");

			if (!newUrl) {
				const rule = Object.keys(urls).find(key => urls[key].test(location.pathname));
				newUrl = rule && location.pathname.replace(urls[rule], rule);
			}
			if (newUrl) {
				request.get(newUrl).then(() => {
					location.href = newUrl;
				});
			}
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

function showRst () {
	const rst = {};
	Array.from(document.querySelectorAll("dt")).forEach(dt => {
		let q = dt.childNodes;
		q = q[q.length - 1].wholeText.trim().replace(/\s*？$/, "");
		const a = Array.from(dt.parentNode.querySelectorAll("dd input"))
			.filter(input => input.checked)
			.map(input => input.parentNode.querySelector("label").innerText.trim().replace(/^[A-Z]、?/, ""));

		if (a.length) {
			rst[q] = a.length > 1 ? a : a[0];
		}
	});
	return JSON.stringify(rst, 0, "\t");
}

"use strict";
window.open = url => {
	location.href = url;
};

window.alert = () => {};
let student;

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

// 在浏览器页面内运行的函数，用于答题
function browserDoWork() {
	const $ = window.$;
	$("a[onclick^='tijiao'], a.qdbtn, a:contains('请签名'), a:contains('请点击'), a:contains('已完成'), #student_qdbtn").filter(":visible").click();
	if (student) {
		console.log(student);
	}
	if (window.location.pathname === "/Fire2017/201707Fire.html") {
		requestData().then(student => {
			window.location.href = `/Fire2017/201707Fire_PrvTestTwo.html?r1=${ student.sex - 0 ? 1 : 2}&r2=1&r3=2`;
		});
	} else if (window.location.pathname === "/JiaTing/JtMyHomeWork.html") {
		let url;
		$("a:contains('马上去')").toArray().some(a => {
			if (/(['"])(http\s?:\/\/.+?)\1/.test(a.getAttribute("onclick"))) {
				url = RegExp.$2;
				return true;
			}
		});
		if (url) {
			window.location.href = url;
		}
	} else if (window.location.pathname === "/TrafficSafety/2016122TrafficSafety_family2.html") {
		// $("input").map((i, input)=>input.checked)
		const answer = [false, true, false, false, false, true, true, false, false, false, false, true, false, true, false, false, false, true, true, false, false, false, false, true, false, true, false, false, true, false];
		$("input:checkbox").each((i, input) => input.checked = answer[i]);
	} else if (location.pathname === "/TrafficSafety/2016122TrafficSafety_family2.html") {
		// $(":radio,:checkbox").map((i, c)=>c.checked)
		const ans = [false, true, false, false, false, true, true, false, false, false, false, true, false, true, false, false, false, true, true, false, false, false, false, true, false, true, false, false, true, false];
		$(":radio,:checkbox").each((i, c) => {
			if (ans[i]) {
				$(c).click().parent().css("border", "1px solid red");
			}
		});
	}
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
		} else if (window.location.pathname === "/Fire2017/201707Fire_PrvTestTwo.html") {
			window.loadQuestion(0, 99, 1, false);
			$("#questionlist label").click();
			const answer = {
				"无论哪一楼层发生火灾，逃生时都不可乘坐电梯": "正确",
				"灭火器材设置点附近不能堆放物品, 以免影响灭火器的取用": "正确",
				"火灾发生时，在室内或走廊水平开口状态下，烟气在下层流动，空气在上层流动": "错误",
				"谎报火警是违法行为": "正确",
				"可以拨打火险报警电话“119”演练报火警": "错误",
				"宾馆、饭店、商场、歌舞厅等人员密集场所营业期间，安全出口的安全门禁止锁闭": "正确",
				"参加消防志愿者只需要满足14周岁即可，不需要监护人同意": "错误",
				"火灾是最经常、最普遍的威胁公众安全和社会发展的灾害之一": "正确",
				"当室内火势猛烈且无法扑灭时，应尽快躲到卫生间自救": "正确",
				"高温、光辐射虽然在某些时候也能引发燃烧现象，但它们不属于引火源": "正确",
				"灶具和抽油烟机上的油污和油质灰尘，也是火灾隐患，需要及时清理": "正确",
				"电视机着火用湿毛毯、棉被覆盖时，人要站在电视机的侧面或后方": "正确",
				"被困火场时，下列求救方法正确的是": "白天可挥动鲜艳布条发出求救信号，晚上可挥动手电筒",
				"关于家庭火灾逃生演练，下列说法正确的是": "每个家庭每年都应该进行至少1-2次的逃生演练",
				"公共性建筑和通廊式居住点建筑安全出口的数目不应少于": "两个",
				"电器着火时，不能用（ ）来灭火": "水",
				"夜晚被困火场，相对有效的求救方法是": "用手电筒向外发光求救",
				"参加学校的逃生演练时，下列做法正确的是": "听从老师指挥，不拥挤，有序往外跑",
				"关于学校举办消防逃生演练的目的，下列说法正确的是": "使我们真正遇到危险时，能够临危不乱采取措施自救",
				"预防宿舍火灾，下列做法正确的是": "到正规超市购买合格的接线板",
				"高层楼发生火灾时，下列做法正确的是": "快速从楼梯逃生",
				"客车、公交车着火时，正确的做法是": "车门无法正常打开时，可旋转安全阀门开启安全门",
				"公安消防队扑救火灾（ ）": "不收取任何费用",
				"使用灭火器时，下列说法、做法错误的是": "站在火焰的下风方向",
				"我国消防宣传活动日是每年的": "11月9日",
				"电器着火时，首先应该做的是": "切断电源",
				"燃放烟花爆竹时，做法正确的是": "选择空旷的场地",
				"火灾中引起人员大量伤亡的主要原因是": "吸入烟气窒息而死",
				"用水泥代替木材建造房屋可以减少火灾事故，采用的基本原理": "控制可燃物",
				"家中（ ）等日用品不能靠近热源与火源": "发胶、空气清新剂",
				"任何物质发生燃烧，必须具备三个基本条件": "可燃物、助燃物、引火源",
				"使用灭火器灭火时，喷管要对准": "火焰根部",
				"火场逃生的原则是": "安全撤离、救助结合",
				"消防车和消火栓的颜色是": "红色",
				"最常见的灭火剂是": "水",
				"下列哪个属于窒息灭火法": "往着火物上喷射干粉灭火剂等",
				"火灾发生时，一定要逃出火场，固守待援不可取": "错误",
				"物质的燃点越低、越不容易引起火灾": "错误",
				"要做到及时控制和消灭初起火灾，主要是依靠公安消防队": "错误",
				"二氧化碳灭火器使用不当，可能会冻伤手指，是因为二氧化碳液化吸收热量，起到冷却的作用": "正确",
				"火灾发生时烟雾太浓可大声呼叫或晃动鲜艳的衣物以引起救援者的注意": "正确",
				"下列哪种电器可以在宿舍内使用": "台灯",
				"假如你家着火了，在逃生撤离前应注意": "关闭水、电、气的总阀门",
				"一名初一的学生，在放学途中，看到十几辆消防车、上百名消防员正在扑救一处大楼的火灾。他立刻冲了上去，想尽自己一份微薄之力。针对这名学生的做法，你的看法是": "不赞同，未成年人不能参与救援",
				"在宿舍使用蚊香时，下列说法正确的是": "蚊香的中心温度很高，所以要把蚊香远离易燃物品",
				"据统计，火灾中死亡的人有80%以上属于": "烟气窒息或中毒致死",
				"家庭中白炽灯、射灯等要与可燃物保持( )以上的距离": "0.5米",
				"灭火器是最常见的灭火剂": "错误",
				"不同的火灾要采用不同的灭火方法，不然很容易造成更大的伤害": "正确",
				"家用电器没有期限，只要不坏就可以使用": "错误",
				"用二氧化碳扑救室内火灾后，应先打开门窗通风，然后人再进入，这是为了预防发生窒息": "正确",
				"商住楼内的公共娱乐场所与居民住宅可以共用一个安全出口": "错误",
				"做实验时，可以用正在燃烧的酒精灯去点燃另一个酒精灯": "错误",
				"手动报警器不可随便按动": "正确",
				"中华人民共和国消防法》第四十四条规定：任何人发现火灾都应当立即报警并参与救援": "错误",
				"小亮的妈妈在做饭时，发现一只蟑螂，顺手拿起杀虫剂就喷了过去": "错误",
				"干粉灭火器比较常见常用，其正确的操作顺序为：①一手握住压把，一手握住喷管 ②拔掉保险销 ③取出灭火器，并检查灭火器状态是否正常 ④对谁火焰根部喷射": "③ ② ① ④",
				"为了确保燃气使用时的安全，下列做法正确的是": "不在燃气灶具周围堆放易燃、易爆物品",
				"学生宿舍不能乱拉电线、乱接电源、违章使用电器、生火做饭、乱扔烟头，主要目的是切断着火的": "引火源",
				"发生火灾时无论发生什么情况都不能跳楼": "正确",
				"可燃物能够与空气中的氧发生燃烧反应，所以可燃物都是气体": "错误",
				"燃烧要具备可燃物、被燃物、引火源三个必要条件": "错误",
				"把（ ）摆放在燃气灶旁边是非常危险的": "花露水",
				"阻拦报火警或者谎报火警的，给予( )处罚": "警告、罚款或处十日以下拘留",
				"衣服着火时，下列做法正确的是": "将着火的衣服迅速脱下",
				"假如你家住在2楼，发生火灾时逃生通道被熊熊大火切断，你可以": "找床单，打成绳结，从窗户逃生",
				"以下物品中，属于引火源的是": "点燃的香烟",
				"珍贵图书起火最好选用下列哪种灭火器": "二氧化碳灭火器",
				"家庭火灾是指在家中由于不慎行为而引起的火灾，下列行为正确的是：": "电器着火时先切断电源再灭火",
				"如果因电器引起火灾，在情况许可的条件下，你必须首先": "关闭电源",
				"用灭火器进行灭火的最佳位置是": "距离起火点3-5米的上风或侧风位置",
				"进入公共场所时，应该": "注意观察安全出口和疏散通道，记住疏散方向",
				"我国的火警电话是：": "119",
				"当身上着火时，下列做法正确的是": "就地打滚压灭身上的火苗",
				"消防应急灯、安全标志灯不应昼夜24小时不间断通电，没这个必要": "错误",
				"高楼发生着火时，位于上部楼层的居民要乘坐电梯快速逃生": "错误",
				"火灾中丧生的人80%以上是被大火烧伤致死": "错误",
				"灭火器材设置点附近不能堆放物品,以免影响灭火器的取用": "错误",
				"下列说法正确的是": "衣服着火之后，要立刻倒地快速翻滚",
				"油锅起火了，用锅盖盖住油锅，火就会熄灭。这采取的是": "窒息法",
				"以下灭火剂中，( )破坏大气的臭氧层，要逐步淘汰": "1211灭火剂",
				"做实验结束时，用灯帽一盖，酒精灯就会熄灭。这采取的是": "窒息法",
				"灭火器的压力表指针指在( )位置时，压力为正常": "绿色区域",
				"遇到消防车执行灭火或抢险救援任务时，社会车辆及行人应当": "靠边让行",
				"《中华人民共和国消防法》规定，任何( )都有维护消防安全、保护消防设施、预防火灾、报告火警的义务": "单位和个人",
				"任何单位、（ ）都有参加有组织的灭火工作的义务": "个人",
				"以下属于C类火灾的是": "煤气、天然气着火",
				"长时间外出或旅游时，应该做到拉闸断电，使家用电器处于断电状态": "正确",
				"发现火灾隐患或消防安全违法行为，可以拨打（ ）电话举报": "96119",
				"如果邻居家着火，楼道已被大火封锁，下列做法正确的是": "退回室内，用湿毛巾、湿床单封堵门缝，拨打119同时到未着火一面的窗户发信号求救",
				"现行消防法律是（ ），自（ ）起开始实施": "《中华人民共和国消防法》，2009年5月1日",
				"当遇到火灾时，要迅速向（ ）逃生": "安全出口的方向",
				"家庭火灾多数可以预防，以下行为错误的是": "为节省空间，家里的电器尽量接到一个接线板上",
				"发现室外起火，下列做法正确的是": "先触碰门板温度，再选择是否开门逃跑",
				"检查燃气用具是否漏气，我们可以采用（　　）来寻找漏气点。": "肥皂水",
				"任何单位和个人都不能组织未成年人参与救火": "正确",
				"我国消防标志的颜色主要有红色、黄色、蓝色和绿色，是我国独有的颜色": "错误",
				"谎报火警是违法行为，千万不要随便拨打火警电话119，只能在有火情的情况下拨打": "正确",


				"客车、公交车着火时，可以利用的逃生工具或出口有": [
					"安全阀门",
					"天窗",
					"车载安全锤",
				],
				"制定家庭火灾逃生计划时，需要包含的内容有": [
					"标明各个房间门窗的位置以及通往室外最近的路线",
					"家里如果有灭火、逃生器材，也要标注出来",
					"要标明家庭成员逃生后的户外集合地点",
				],
				"遭遇火灾脱险的不正确的方法是": [
					"身处低楼层，必须跳楼时也要尽量缩小高度，做到双脚先落地",
					"使用电梯快速脱离火场",
				],
				"家庭日用品中，靠近热源和火源可能引发火灾的有": [
					"发胶、摩丝",
					"空气清新剂",
					"指甲油、花露水",
				],
				"以下行为，可能引发宿舍火灾的有": [
					"在床上吸烟",
					"把点燃的蚊香放在蚊帐里",
					"使用热得快烧开水",
					"充电器一直插在接线板上",
				],
				"造成火灾的三个条件是": [
					"助燃物",
					"可燃物",
					"引火源",
				],
				"电热毯是用电热线和普通棉纺织布做成的，如果使用不当很容易发生火灾，使用中应注意以下哪几个环节？": [
					"不可用水洗",
					"不可折叠使用",
					"不可在弹性大的床上使用",
					"不可长期通电使用",
				],
				"学校教学楼发生火灾时，正确的逃生方法有": [
					"沿着疏散通道向楼下跑",
					"不带任何东西迅速逃生",
				],
				"引发火灾的常见原因有": [
					"电气管理不当",
					"用火不慎",
					"人为放火",
					"违规违章操作",
				],
				"下列( )着火不能用水扑灭": [
					"电视机",
					"金属钠、钾",
				],
				"客车、公交车着火时，正确的做法有": [
				],
				"以下属于B类火灾的有": [
					"沥青着火",
					"煤油着火",
				],
				"根据可燃物的类型和燃烧特性，火灾可以分为以下几类": [
					"固体燃烧物火灾",
					"气体燃烧物火灾",
					"金属燃烧物火灾",
					"液体燃烧物火灾",
				],
				"干粉灭火剂主要适用于扑救下列哪种情况的火灾": [
					"A、电气火灾",
					"易燃液体着火",
					"金属燃烧",
				],
				"去到公共场所，我们要做到": [
					"要有逃生意识，熟记疏散通道和安全出口的位置",
					"在影剧院遭遇火灾应听从工作人员指挥，切忌互相拥挤",
					"烟气较大时，要弯腰行走或匍匐前进",
				],
				"报火警时要保持冷静，电话接通后说清楚": [
					"火势大小",
					"着火物质",
					"伤亡情况",
					"起火地址",
				],
				"居住在高层居民楼，发生火灾时，我们不应该": [
					"立刻跳楼逃生",
					"乘坐电梯逃生",
				],
				"发生火灾是不能乘坐电梯逃生的原因有": [
					"火灾中电梯运行时易产生烟囱效应，威胁乘坐人员安全",
					"电梯不具有防高温性能",
					"火灾可能导致断电，电梯会停在两个楼层中间，不利于电梯内人员逃生",
					"人员被困电梯里时，密闭的电梯会给消防员的营救造成困难",
				],
				"正规厂家生产的合格烟花爆竹，外包装上会包含（ ）等信息": [
					"生产厂家的信息",
					"防伪商标",
					"警告语",
					"燃放说明",
				],
				"电器设备引起火灾的原因可能是": [
					"线路老化",
					"短路",
					"超负荷",
				]
			};
			Object.keys(answer).forEach(topic => {
				if (Array.isArray(answer[topic])) {
					const dl = $(`dl:contains('${ topic }')`);
					answer[topic].forEach(answer => {
						dl.find(`label:contains('${ answer }')`).click();
					});
				} else {
					$(`dl:contains('${ topic }') label:contains('${ answer[topic] }')`).click();
				}
			});

			setTimeout(() => {
				$("#tijiao1").click();
				setTimeout(callback, 1000);
			}, 1000);
			// window.loadQuestion(0, 1, 1, false);
		} else {
			$("a:contains('马上去'):visible").click();
			setInterval(browserDoWork, 1000);
		}
	}, 1000);
});

if (process.env.CI_TEACHER_ACCOUNT) {
	setTimeout(callback, 90000);
}

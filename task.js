window.open = url => {
	location.href = url;
};

window.alert = ()=>{};

function callback(val) {
	if (window.callPhantom) {
		window.callPhantom(val);
	} else if (window.require) {
		const {ipcRenderer} = require("electron");
		ipcRenderer.sendToHost("close");
	}
}

// 在浏览器页面内运行的函数，用于答题
function browserDoWork() {
	const $ = window.$;
	if (window.ShowTestPaper) {
		window.getAnswers = function(answers) {
			setTimeout(function() {
				$(".bto_testbox input[type=radio]").prop("checked", function(i) {
					return !!+answers.Rows[i].istrue;
				});
				$(".bto_testbox .btn_submit").click();
				callback();
			}, 0);
		};

		window.eval(window.ShowTestPaper.toString().replace(/TestPaperThreelistGet2.*?\n?.*?if\s+\(.*?\b(\w+)\.Rows\.length.*?\)\s*\{/, function(s, dataVarName) {
			return s + "getAnswers(" + dataVarName + ");";
		}));
		window.ShowTestPaper();
	} else {
		$("a[onclick^='tijiao'], a.qdbtn, a:contains('请签名'), a:contains('请点击'), a:contains('已完成观看'), #student_qdbtn").filter(":visible").click();
		if (window.location.pathname ==="/JiaTing/JtMyHomeWork.html") {
			var url;
			$("a:contains('马上去完成')").toArray().some(a => {
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
		} else if(location.pathname === "/TrafficSafety/2016122TrafficSafety_family2.html") {
			// $(":radio,:checkbox").map((i, c)=>c.checked)
			let ans = [false, true, false, false, false, true, true, false, false, false, false, true, false, true, false, false, false, true, true, false, false, false, false, true, false, true, false, false, true, false];
			$(":radio,:checkbox").each((i, c)=> {
				if(ans[i]) {
					$(c).click().parent().css("border", "1px solid red");
				}
			});
			// console.log($(":radio,:checkbox").map((i, c)=>c.checked));
		}
	}
}

setInterval(browserDoWork,1000);

window.addEventListener("load", ()=>{
	setTimeout(()=>{
		window.$("a:contains('马上去完成'):visible").click();
	}, 1000);
	const link = document.createElement("a");
	link.href = "#";
	link.innerHTML = "X";
	link.onclick = callback;
	link.style.color = "red";
	link.style.position = "fixed";
	link.style.right = 0;
	link.style.top = 0;
	link.style.zIndex = 0xff;
	document.body.appendChild(link);
});

const {ipcRenderer} = require("electron");
const $ = window.$;
function close() {
	ipcRenderer.sendToHost("close");
}

$("a[onclick^='tijiao'], a.qdbtn, a:contains('请签名'), a:contains('已完成观看'), #student_qdbtn").click();
if (window.ShowTestPaper) {
	window.getAnswers = function(answers) {
		setTimeout(function() {
			$(".bto_testbox input[type=radio]").prop("checked", function(i) {
				return !!+answers.Rows[i].istrue;
			});
			$(".bto_testbox .btn_submit").click();
			close();
		}, 0);
	};

	window.eval(window.ShowTestPaper.toString().replace(/TestPaperThreelistGet2.*?\n?.*?if\s+\(.*?\b(\w+)\.Rows\.length.*?\)\s*\{/, function(s, dataVarName) {
		return s + "getAnswers(" + dataVarName + ");";
	}));
	window.ShowTestPaper();
} else if (window.location.pathname ==="/JiaTing/JtMyHomeWork.html") {
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
}

const link = document.createElement("a");
link.innerHTML = window.location.pathname + "<br>X";
link.href = "#";
link.style.color = "red";
link.style.position = "fixed";
link.style.zIndex = 0xff;
link.style.right = 0;
link.style.top = 0;
link.onclick = close;
document.body.appendChild(link);

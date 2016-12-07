window.open = url => {
	location.href = url;
};

window.alert = ()=>{};

function callback(val) {
	if (window.callPhantom) {
		window.callPhantom(val);
	} else if (window.require) {
		var ipcRenderer = require('electron').ipcRenderer;
		ipcRenderer.sendToHost('close');
	}
}

// 在浏览器页面内运行的函数，用于答题
function browserDoWork(userData) {
	if (window.ShowTestPaper) {
		window.getAnswers = function(answers) {
			setTimeout(function() {
				$(".bto_testbox input[type=radio]").prop("checked", function(i) {
					return !!+answers.Rows[i].istrue;
				});
				$(".bto_testbox .btn_submit").click();
				callback("ok");
			}, 0);
		};

		eval(ShowTestPaper.toString().replace(/TestPaperThreelistGet2.*?\n?.*?if\s+\(.*?\b(\w+)\.Rows\.length.*?\)\s*\{/, function(s, dataVarName) {
			return s + "getAnswers(" + dataVarName + ");";
		}));
		ShowTestPaper();
	} else {
		window.$ && $("a[onclick^='tijiao'], a.qdbtn, a:contains('请签名'), a:contains('请点击'), #student_qdbtn").filter(":visible").click();
		if(location.pathname === "/TrafficSafety/2016122TrafficSafety_family2.html") {
			// $(":radio,:checkbox").map((i, c)=>c.checked)
			let ans = [false, true, false, false, false, true, true, false, false, false, false, true, false, true, false, false, false, true, true, false, false, false, false, true, false, true, false, false, true, false]
			$(":radio,:checkbox").each((i, c)=> {
				if(ans[i]){
					$(c).click().parent().css("border", "1px solid red")
				}
			});
			// console.log($(":radio,:checkbox").map((i, c)=>c.checked));
		}
	}
}

setInterval(browserDoWork,1000);

window.addEventListener("load", ()=>{
	setTimeout(()=>{
		$("a:contains('马上去完成'):visible").click();
	}, 1000);
	var link = document.createElement("a");
	link.innerHTML = "X";
	link.href = "#";
	link.onclick = callback;
	link.style.position = "fixed";
	link.style.color = "red";
	link.style.zIndex = 0xff;
	link.style.top = 0;
	link.style.right = 0;
	document.body.appendChild(link);
});

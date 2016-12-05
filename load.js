module.exports = function(src) {
	return new Promise((resolve, reject)=>{
		let ifr = document.createElement("iframe");
		ifr.onload = function() {
			resolve(function(selector){
				return Array.from(ifr.contentDocument.querySelectorAll(selector));
			});
			process.nextTick(()=>{
				document.body.removeChild(ifr);
			})
		};
		ifr.onerror = reject;
		ifr.src = src;
		document.body.appendChild(ifr);
	});
}
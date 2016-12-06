module.exports = function(src, callback) {
	return new Promise((resolve, reject)=>{
		let ifr = document.createElement("iframe");
		ifr.onload = function() {
			ifr.contentWindow.onclose = function(e) {
				setTimeout(() => {
					resolve(e);
					setTimeout(() => {
						document.body.removeChild(ifr);
					}, 5000);
				}, 1000);
			}
			callback(ifr.contentWindow);
		};
		ifr.onerror = reject;
		ifr.src = src;
		document.body.appendChild(ifr);
	});
}

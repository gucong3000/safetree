const path = require("path");
const electron = require("electron");
const BrowserWindow = electron.BrowserWindow;
const app = electron.app;

var mainWindow = null;

function worker (webContents) {
	webContents.executeJavaScript(`require(${ JSON.stringify(path.join(__dirname, "worker.js")) })`);
}

function initializeContents(webContents) {

	webContents.on("did-finish-load", e => worker(e.sender));
	webContents.on("new-window", e => initializeContents(e.sender));
}

function initialize () {
	function createWindow () {
		var windowOptions = {
			width: 1080,
			minWidth: 680,
			height: 840,
			title: app.getName()
		};

		mainWindow = new BrowserWindow(windowOptions);

		mainWindow.webContents.openDevTools();

		mainWindow.on("closed", function () {
			mainWindow = null;
		});

		initializeContents(mainWindow.webContents);

		mainWindow.loadURL("http://chengdu.safetree.com.cn/ ");
	}

	app.on("ready", function () {
		createWindow();
	});

	app.on("window-all-closed", function () {
		if (process.platform !== "darwin") {
			app.quit();
		}
	});

	app.on("activate", function () {
		if (mainWindow === null) {
			createWindow();
		}
	});
}

initialize();

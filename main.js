"use strict";
const path = require("path");
const electron = require("electron");
const BrowserWindow = electron.BrowserWindow;
const app = electron.app;

let mainWindow = null;

function atob(str) {
	return new Buffer(str, "base64").toString("binary");
}

function worker (webContents) {
	webContents.executeJavaScript(`require(${ JSON.stringify(path.join(__dirname, "worker.js")) })`);
}

function initializeContents(webContents) {
	webContents.on("did-finish-load", e => worker(e.sender));
	webContents.on("new-window", e => initializeContents(e.sender));
}

function initialize () {
	function createWindow () {
		const windowOptions = {
			width: 1080,
			minWidth: 680,
			height: 840,
			title: app.getName(),
			show: !process.env.CI_TEACHER_ACCOUNT,
		};

		mainWindow = new BrowserWindow(windowOptions);

		let city;
		let dev = false;

		process.argv.slice(1).forEach(arg => {
			if (/^\w+$/.test(arg)) {
				city = arg;
			} else if (/^--dev$/.test(arg)) {
				dev = true;
			}
		});

		if (process.env.CI_TEACHER_ACCOUNT) {
			const ipcMain = electron.ipcMain;
			ipcMain.on("dialogs.alert", (event, arg) => {
				console.log.apply(console, arg);
			});
			ipcMain.on("worker.finish", () => {
				app.exit();
			});
			const account = atob(process.env.CI_TEACHER_ACCOUNT).split(/\s+/g);
			if (!city && !/\d/.test(account[0])) {
				city = account[0];
			}
			dev = false;
			setTimeout(() => {
				console.log("长时间无响应，自动退出。");
				app.exit(1);
			}, 0xFFFFF);
		}

		if (!city) {
			city = "chengdu";
		}

		if (dev) {
			mainWindow.webContents.openDevTools();
		}

		mainWindow.on("closed", function () {
			mainWindow = null;
		});

		initializeContents(mainWindow.webContents);

		mainWindow.loadURL(`http://${ city }.safetree.com.cn/MainPage.html`);
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

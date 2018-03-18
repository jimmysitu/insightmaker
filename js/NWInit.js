// Check if we are running inside of node webkit. If so rename nw's require to nw_require to avoid conflicts with require.js
if (typeof require === "undefined") {
	// We are not running in nw
	window["nw_require"] = null;
} else {
	// We name the old require to nw_require
	window["nw_require"] = require
	require = undefined;
}

// Maximize nw window
function nw_maximize() {
	var nw_gui = nw_require("nw.gui");
	var nw_win = nw_gui.Window.get();
	nw_win.show();
	nw_win.maximize();
}

// Check if we can maximize nw window. If so maximize the window
function nw_try_maximize() {
		// Make it work without nw.js
		if(nw_require==null) {
			return;

		}
		// Do nw window maximization
		nw_maximize();
}

nw_try_maximize();

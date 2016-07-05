
document.addEventListener('DOMContentLoaded', function() {
	var div1 = document.getElementById("popout-div1");
	var bgp = chrome.extension.getBackgroundPage();
	div1.innerHTML = "current URL = " + bgp.currentTabUrl;
	
	
	//var tbl_cells = document.getElementsByClass("tbldrop");
	//for (var i=0; i<tbl_cells.length; i++) {
		
	
	document.querySelector("#r1c2").addEventListener('dragenter', function(e) {
		e.preventDefault();
		console.log("drag enter");
		return true;
	});
	
	document.querySelector("#r1c2").addEventListener('dragover', function(e) {
		e.preventDefault();
		e.dataTransfer.dropEffect = 'copy';  // may be required to drop on DIV
		console.log("drag over");
		return false;
	});
	
	document.querySelector("#r1c2").addEventListener('drop', function(e) {
		e.preventDefault();
		//e.stopPropogation();
		var src = e.dataTransfer.getData("Text");
		console.log("drop drop drop");
		console.log(src);
		this.notes += "\n" + src;
		document.querySelector("#notesarea").value=this.notes;
		return false;
	});
	
	console.log("before");
	document.getElementById("r1c1").addEventListener('click', function(e) {
		console.log("tbl cell clicked");
	});
	console.log('after');
	
});


function updatePopout() {
	
	chrome.tabs.query({active: true, lastFocusedWindow: true}, function(tabs) {
		var div1 = document.getElementById("popout-div1");
		var bgp = chrome.extension.getBackgroundPage();

		if (tabs[0].url.indexOf("popout.html") < 0) {
			currentTabUrl = tabs[0].url;
			bgp.currentTabUrl = tabs[0].url;
			console.log("0 id = " + tabs[0].id);
			console.log("0 url = " + tabs[0].url);
			console.log("popout cur url = " + currentTabUrl);
			div1.innerHTML = "current URL = " + currentTabUrl;
		}
	});
	
};


chrome.tabs.onActivated.addListener(updatePopout);
chrome.tabs.onUpdated.addListener(updatePopout);
chrome.windows.onFocusChanged.addListener(updatePopout);
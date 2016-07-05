
document.addEventListener('DOMContentLoaded', function() {
	var div1 = document.getElementById("popup-div1");
	var bgp = chrome.extension.getBackgroundPage();
	div1.innerHTML = "current URL = " + bgp.currentTabUrl;
	//div1.innerHTML = "<b>ZZZ</b>";
});
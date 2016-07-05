// document.body.style.border = "5px solid red";
// console.log("border added");
// console.log("yyy");

// Adding page load listener
document.addEventListener("DOMContentLoaded", function() {
	console.log("Entering page load listener...");
	var pageLoadMap = {"action_type": "page_load", "url": window.location.href, "timestamp": Date.now()};
	console.log(pageLoadMap);
	// Insert post here
});

// Adding link event click listeners
var linkArray = document.getElementsByTagName("a");
for (i=0; i < linkArray.length; i++) {
	linkArray[i].addEventListener("click", function(e) {
		console.log("link clicked...");
		console.log(this.href);
		var linkMap = {"action_type": "link_click", "link": this.href, "timestamp": Date.now()};
		console.log(linkMap);
		// Insert post here
	});
};
console.log(linkArray);

// Adding scroll listener
document.addEventListener("scroll", function() {
	var h = document.documentElement,
		b = document.body,
		st = "scrollTop",
		sh = "scrollHeight";
	var scrollPct = h[st] || b[st] / ((h[sh] || b[sh]) - h.clientHeight) * 100;
	var scrollMap = {"action_type": "scroll", "scroll_pct": scrollPct, "url": window.location.href, "timestamp": Date.now()};
	console.log(scrollMap);
	// Insert post here
}, false);

function updatePopout() {
    
    chrome.tabs.query({active: true, lastFocusedWindow: true}, function(tabs) {
        var div1 = document.getElementById("popout-div1");
        var bgp = chrome.extension.getBackgroundPage();

        if (tabs[0].url.indexOf("popout.html") < 0) {
            var currentTabUrl = tabs[0].url;
            bgp.currentTabUrl = tabs[0].url;
            console.log("0 id = " + tabs[0].id);
            console.log("0 url = " + tabs[0].url);
            console.log("popout cur url = " + currentTabUrl);
            div1.innerHTML = "current URL = " + currentTabUrl;
        }
    });
    
};
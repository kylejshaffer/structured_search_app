
var currentTabUrl;


function updateTab(tabId, changeInfo, tab) {
    console.log("in updateTab");
    console.log("aaa");

    chrome.tabs.query({active: true, lastFocusedWindow: true}, function(tabs) {

        if (tabs[0].url.indexOf("popout.html") < 0) {
            console.log("0 id = " + tabs[0].id);
            console.log("0 url = " + tabs[0].url);
            currentTabUrl = tabs[0].url;
            console.log("cur url = " + currentTabUrl);
        }
    });
}

function handleClick() {
    console.log("click handled");
    updateTab();
    console.log("click handled");
    chrome.windows.create({'url': 'popout.html', 'type': 'popup', width: 800, height:800}, function(window) {
    });
    console.log("did a window open");
}


chrome.browserAction.onClicked.addListener(handleClick);

chrome.windows.onFocusChanged.addListener(updateTab);

chrome.tabs.onActivated.addListener(updateTab);



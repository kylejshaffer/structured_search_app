/* NOTES

To Do:
1. More coloring prototyping

Bugs:
1. Right-click event doesn't work until 2nd or 3rd try. After it does work, the pop-up is also
associated with normal clicks. No idea why.
2. Double-check flag highlighting (rogue flag highlighting)
3. Remove text from notes area on ANY deselect of note flag

Other Ideas (not immediately necessary):
1. Prep for tracking all behavior from search results to content page where text is snipped from
2. Wikipedia mock page with draggable/segmented DIV's

*/ 

/*** Loop through all cell elements in the table and add event listeners ***/
/*** This code deals with elements that will be added dynamically to the page ***/
document.addEventListener('DOMContentLoaded', function() {

    var div1 = document.getElementById("popout-div1");
    var bgp = chrome.extension.getBackgroundPage();
    var currentUrl = bgp.currentTabUrl;
    var urlBase = currentUrl.split("/")[2];
    div1.innerHTML = "current URL = " + bgp.currentTabUrl;

    // Variables for event PHP url and flag save PHP url
    var eventPHPUrl = "https://idl.ils.unc.edu/rsearch2/v21_matrix1/log_event.php";
    var bookmarkPHPUrl = "https://idl.ils.unc.edu/rsearch2/v21_matrix1/save_bookmark.php";

    // Grab all individual table cells
    var tbl_cells = document.getElementsByClassName("tbldrop");
    // Add event listeners to DOM, focusing on table elements
    for (var i=0; i < tbl_cells.length; i++) {
        // Setting data tooltip attribute in loop
        // tbl_cells[i].setAttribute("title", "Drag text here");

        /*** EVENT LISTENERS FOR MATRIX CELLS ***/
        // Add mouseover listener for each matrix cell
        tbl_cells[i].addEventListener("mouseover", function(e) {
            var eventData = logEvent("mouseover", this.id);
            console.log(eventData);
            // Post to PHP
            $.post(eventPHPUrl, eventData, function(data) {
                console.log("ZZZ got back " + data);
            });
            console.log("got here");
        });
        // Add mouseout listener for each matrix cell
        tbl_cells[i].addEventListener("mouseout", function(e) {
            var eventData = logEvent("mouseout", this.id);
            console.log(eventData);
            // Post data to PHP
            $.post(eventPHPUrl, eventData, function(data) {
                console.log("got back " + data);
            });
            console.log("executed post...");
        });
        // Add click listener for each matrix cell
        tbl_cells[i].addEventListener("click", function(e) {
            var eventData = logEvent("click", this.id);
            // Post code to PHP
            $.post(eventPHPUrl, eventData, function(data) {
                console.log("ZZZ got back " + data);
            });
            console.log("got here");
        })

        // Add drag over event listener to each table cell
        tbl_cells[i].addEventListener("dragover", function(e) {
            e.preventDefault();
            this.parentElement.className += " dragpulse";
            e.dataTransfer.dropEffect = "copy";  // may be required to drop on DIV
            console.log("drag over");
            // Add event logger
            var eventData = logEvent("dragover", this.id);
            // Post code to PHP
            $.post(bookmarkPHPUrl, eventData, function(data) {
                console.log("ZZZ got back " + data);
            });
            console.log("got here");
            return false;
        });

        // Add drag leave event listener to each table cell
        tbl_cells[i].addEventListener("dragleave", function(e) {
            e.preventDefault();
            this.parentElement.className = "";
            console.log("drag leave");
            // Add event logger
            var eventData = logEvent("dragleave", this.id);
            // Post code to PHP
            $.post(eventPHPUrl, eventData, function(data) {
                console.log("ZZZ got back " + data);
            });
            console.log("got here");
            return false;
        });
        
        // Add drop event listener to each table cell
        tbl_cells[i].addEventListener("drop", function(e) {
            e.preventDefault();
            this.parentElement.className = "";
            //e.stopPropogation();
            var src = e.dataTransfer.getData("Text");
            console.log("drop drop drop");
            console.log(src);
            this.notes += "\n" + src;

            // Initialize an array and push flag ID ints to this
            var flagIds = [];

            // Grab all flag elements and push to `flagIds` array above
            var flags = document.getElementsByClassName("textflag");
            console.log("Flag elements:");
            console.log(flags);
            for (var i=0; i < flags.length; i++) {
                // Push just the int of the ID to the array
                flagIds.push(parseInt(flags[i].id.split("-")[1]));
            }

            // Dynamically assign ID's to flag icons
            if (flagIds.length > 0) {
                // Sort flag ID's to look up max
                var sortedFlagIds = flagIds.sort()
                var maxId = sortedFlagIds.pop()

                // Set new ID when flag is added to DOM
                // Need to figure out CSS for flag spacing....
                this.innerHTML += "&nbsp;<a href='#' id='flaglink-" + String(maxId + 1) + "'" + "data-toggle='popover' class='flag-link'><img class='textflag' id='flag-" + String(maxId + 1) + "'" + "src='icons/flag25.png' /></a>";
            } else {
                var maxId = -1;
                // Initialize ID's at 0 if there are no flags present on page
                this.innerHTML += "&nbsp;<a href='#' id='flaglink-0' data-toggle='popover' class='flag-link'><img class='textflag' id='flag-0' src='icons/flag25.png' /></a>";
            }

            var currentFlagId = 'flag-' + String(maxId + 1);
            var currentLinkId = 'flaglink-' + String(maxId + 1);
            console.log(currentFlagId);
            console.log(currentLinkId);

            // Call attribute assignment function below on flags
            assignNewAttribute("noteText", src.trim(), currentFlagId);
            assignNewAttribute("column", this.id.split("c")[1], currentFlagId);
            assignNewAttribute("source_url", bgp.currentTabUrl, currentFlagId);

            // Calling function to tab number of elements in cell
            console.log(this.id);
            var cellChildren = tabulateCellChildren(this.id);
            console.log("number of cell children:");
            console.log(cellChildren);

            // Add event logger
            var eventData = logEvent("flag_drop", this.id);
            eventData["source_url"] = bgp.currentTabUrl;
            // Mock post code
            // $.post("url", eventData, function(data) {
            //     console.log("data");
            // });
            console.log(eventData);

            // document.querySelector("#notesdiv").value = this.notes;
            return false;
        });

        // Add click event listener to each table cell - displays cell text in notes area
        // tbl_cells[i].addEventListener("click", function(e) {
        //     console.log("tbl cell clicked");
        //     document.querySelector("#notesdiv").value="";
        // });

    }
    // Keyboard delete function
    $(document).keyup(".circle-div", function(e) {
        // Count number of highlighted flags
        var highlightFlags = document.getElementsByClassName("circle-div");
        if (highlightFlags.length > 0) {
            // Empty block to allow code below to execute if number of highlightFlags is > 0
            // This looks a little weird, but prevents lots of nested if-statements
        } else {
            // There are no highlighted flags - break out of function
            return;
        };
        // Check that delete key has been pressed
        if (e.keyCode == 8) {
            // Check that user has confirmed deletion, then delete
            var confirmation = confirm("Are you sure you want to remove this note?");
            // User has confirmed deletion - delete flag
            if (confirmation == true) {
                var element = document.getElementsByClassName("circle-div")[0];
                var parentElement = element.parentNode;
                console.log(parentElement);
                // Grab flag element to be removed
                var flagElement = parentElement.getElementsByClassName("textflag")[0];
                console.log(flagElement);
                // Remove flag element
                $("#" + flagElement.id).remove();
                // Remove link element
                $("#" + parentElement.id).remove();
                // Remove displayed notes area text
                document.querySelector("#notesdiv").innerHTML = "";
            };  
        };
        var eventData = logEvent("flag_delete", this.id);
        // Post code to PHP
        $.post(eventPHPUrl, eventData, function(data) {
            console.log("ZZZ got back " + data);
        });
    });

    // JQuery function to get nice hover tooltips
    $("body").ready(function() {
        $('[data-toggle="tooltip"]').tooltip();
    });

    /*** Flag functions ***/
    // Add click-delete functionality to link of flag pop-up
    $("body").on("click", "#deleteLink", function() {
        console.log("clicked delete link...");
        var element = document.getElementById(this.id);
        var parentElement = element.parentNode.parentNode.parentNode;
        // Grab flag element to be removed
        var flagElement = parentElement.getElementsByClassName("textflag")[0];
        console.log(flagElement);
        // Grab link element to be removed
        var linkElement = parentElement.getElementsByClassName("flag-link")[0];
        // Remove flag element
        $("#" + flagElement.id).remove();
        // Remove link element
        $("#" + linkElement.id).remove();
        // Remove displayed notes area text
        document.querySelector("#notesdiv").innerHTML = "";
    });
    // Add alert for deletion
    
    // Test link wrapping for flag elements
    $(document).on("contextmenu", ".textflag", function(e) {
        e.preventDefault();
        $('[data-toggle="popover"]').popover({html: true,
                                        title: "",
                                        content: "<a href='#' id='deleteLink'>Delete Flag</a>",
                                        trigger: "focus",
                                        placement: "top"});
        console.log("Popover function clicked...");
        return true;
    });
    // Flag click function
    $(document).on("click", ".textflag", function() {
        // Log data from click
        var eventData = logEvent("flag_click", this.id);
        var parentElement = this.parentNode;
        eventData["note_text"] = this.getAttribute("noteText");
        eventData["source_url"] = this.getAttribute("source_url");
        console.log(eventData);
        // Display notes in appropriate area
        document.querySelector("#notesdiv").innerHTML = this.getAttribute("noteText");
        // Indicate selected flag on click
        var flags = document.getElementsByClassName("textflag");
        $("#" + this.id).toggleClass("circle-div");
        // Loop through and remove other background highlight
        for (var i=0; i < flags.length; i++) {
            if (flags[i].id !== this.id) {
                flags[i].className = "textflag";
            };
        };
        return true;
    });
    // Flag double-click function
    $(document).on("dblclick", ".textflag", function() {
        var url = this.getAttribute("source_url");
        var win = window.open(url, "_blank");
        var eventData = logEvent("double_click", this.id);
    });
    // Column click function
    $(document).on("click", ".col-link", function() {
        // Log column click event
        var eventData = logEvent("column_click", this.id);
        console.log("COLUMN FUNCTION CLICKED...");
        var colColor = this.getAttribute("color");
        // Remove individual flag outline
        $(".textflag").removeClass("circle-div");
        // Set text for notes summary area
        document.querySelector("#notesdiv").innerHTML = "";
        var tbl = document.getElementById("texttable");
        var numRows = tbl.rows.length - 1;
        var columnId = this.id.substr(this.id.length - 1);
        // Loop through number of rows in the table
        for (var i=0; i < numRows; i++) {
            // Loop through and display stuff in text area
            console.log("column function clicked...");
            var itemName = tbl.rows[i + 1].getElementsByClassName("row-link")[0].innerText; // Figuring out how to get item names
            var columnElements = tbl.rows[i + 1].getElementsByTagName("td")[columnId].getElementsByClassName("textflag");
            //var colColor = tbl.rows[i + 1].getElementsByClassName("col-link").getAttribute("color");
            //console.log(colColor);
            // Check the number of flags
            if (columnElements.length > 0) {
                // Loop through the column elements and display items in text area
                for (var j=0; j < columnElements.length; j++) {
                    console.log(columnElements[j]);
                    var elementText = columnElements[j].getAttribute("noteText");
                    var notesArea = document.querySelector("#notesdiv");
                    notesArea.innerHTML += "<div>";
                    //notesArea.style.opacity = 0;
                    notesArea.innerHTML += "<b>Item: " + itemName + "</b>";
                    notesArea.innerHTML += "<div id='textholder' style='background-color:" + colColor + "'>" + elementText + "</div>";
                    //notesArea.style.opacity = 1;
                    notesArea.innerHTML += "</div>"
                };
            };
            // columnText.push(columnElements);
        };
    });

    // Row click function
    $(document).on("click", ".row-link", function() {
        // Log column click event
        var eventData = logEvent("row_click", this.id);
        console.log("ROW FUNCTION CLICKED...");
        // Remove individual flag outline
        $(".textflag").removeClass("circle-div");
        // Set text for notes summary area
        document.querySelector("#notesdiv").innerHTML = "";
        var tbl = document.getElementById("texttable");
        var numCols = tbl.rows[0].getElementsByTagName("th").length - 1;
        var rowId = this.id.substr(this.id.length - 1);
        var colHeaders = document.getElementsByClassName("col-link");
        console.log(colHeaders.length);
        // Associate columns with column colors
        var colMap = {};
        for (i=0; i < colHeaders.length; i++) {
            colMap[i+1] = [colHeaders[i].innerText, colHeaders[i].getAttribute("color")];
        };
        console.log(colMap);
        console.log(this);
        var rowId = this.id.substr(this.id.length - 1);
        console.log(tbl.rows[parseInt(rowId)]);
        var rowFlags = tbl.rows[parseInt(rowId)].getElementsByClassName("textflag");
        console.log(rowFlags);
        var colName = this.innerText;
        for (var i=0; i < rowFlags.length; i++) {
            var elementText = rowFlags[i].getAttribute("noteText");
            var notesArea = document.querySelector("#notesdiv");
            var colId = parseInt(rowFlags[i].getAttribute("column"));
            console.log(colId);
            notesArea.innerHTML += "<div>";
            //notesArea.style.opacity = 0;
            notesArea.innerHTML += "<b>Dimension: " + colMap[colId][0] + "</b>";
            notesArea.innerHTML += "<div id='textholder' style='background-color:" + colMap[colId][1] + "'>" + elementText + "</div>";
            //notesArea.style.opacity = 1;
            notesArea.innerHTML += "</div>"
        };
    });

    /*** Notes area functions ***/
    // Notes area mouseover/mouseout/click/scroll functions
    $(document).on("mouseover", "#notesdiv", function(e) {
        // Log data
        var eventData = logEvent("mouseover", this.id);
        // Post data to PHP
        $.post(eventPHPUrl, eventData, function(data) {
            console.log("ZZZ got back " + data);
        });
        console.log("got here");
    });
    $(document).on("mouseout", "#notesdiv", function(e) {
        // Log data
        var eventData = logEvent("mouseout", this.id);
        // Post data to PHP
        $.post(eventPHPUrl, eventData, function(data) {
            console.log("ZZZ got back " + data);
        });
        console.log("got here");
    });
    $(document).on("click", "#notesdiv", function(e) {
        // Log data
        var eventData = logEvent("click", this.id);
        // Post data to PHP
        $.post(eventPHPUrl, eventData, function(data) {
            console.log("ZZZ got back " + data);
        });
        console.log("got here");
    });
    // Needs to be modified so we're measuring only scroll in this div, not entire document
    $(document).on("scroll", "#notesdiv", function(e) {
        var h = document.documentElement,
            b = document.body,
            st = "scrollTop",
            sh = "scrollHeight";
        var scrollPct = h[st] || b[st] / ((h[sh] || b[sh]) - h.clientHeight) * 100;
        var eventData = logEvent("scroll", this.id);
        eventData["scroll_pct"] = scrollPct;
        console.log(eventData);
    });
    
});

// Update popout depending on current tab address
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
    return currentTabUrl;
    });
    
};

// Helper function for adding simple eventListeners
function logEvent(eventType, elementId) {
    var data = {"event_type": eventType, 
                //"element_id": elementId, 
                "event_target": elementId,
                "timestamp": Date.now()};
    console.log(data);
    return data;
};

// Helper function for quickly tabbing up element children
function tabulateCellChildren(elementId) {
    var el = document.getElementById(elementId);
    var numChildren = el.childNodes.length;
    return numChildren;
};

// Helper function for creating new flag attributes and assigning them
function assignNewAttribute(attributeName, attributeValue, currentFlagId) {
    console.log("Executing new attribute function...");
    // Simple type-check for attributeName
    if (typeof attributeName === "string") {

    } else {
        console.log("You must pass a string for attributeName");
    }
    var newAttribute = document.createAttribute(attributeName);
    newAttribute.value = attributeValue;
    document.getElementById(currentFlagId).setAttributeNode(newAttribute);
};


chrome.tabs.onActivated.addListener(updatePopout);
chrome.tabs.onUpdated.addListener(updatePopout);
chrome.windows.onFocusChanged.addListener(updatePopout);





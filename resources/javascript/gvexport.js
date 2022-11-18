const ERROR_CHAR = "E:";
const appendPidTo = function (sourceId, targetId) {
    const ids = [];
    document.getElementById(targetId).value.split(",").forEach(function (id) {
        id = id.trim();
        if (id !== "") {
            ids.push(id);
        }
    });
    const newId = document.getElementById(sourceId).value.trim();
    if (ids.indexOf(newId) === -1) {
        ids.push(newId);
    }
    document.getElementById(targetId).value = ids.join(",");
};


function hideSidebar(e) {
    document.querySelector(".sidebar").hidden = true;
    document.querySelector(".sidebar__toggler").hidden = false;
    e.preventDefault();
}

function showSidebar(e) {
    document.querySelector(".sidebar__toggler").hidden = true;
    document.querySelector(".sidebar").hidden = false;
    e.preventDefault();
}

// Enable or disable the option to add photos.
// This is used when selecting diagram type, as only
// some types support photos.
function togglePhotos(enable) {
    document.getElementById("vars[with_photos]").disabled = !enable;
}

// Add or remove the % sign from the text input
function togglePercent(element, add) {
    // Clicked out of input field, add % sign
    let startval;
    if (add) {
        // Keep just numbers
        let boxVal = element.value.replace(/\D/g, "");
        // If result is blank, set to default
        if (boxVal === "") {
            boxVal = "100";
        }
        element.value =  boxVal + "%";
    } else {
        // Clicked in input box, remove % and select text,
        // but only select text the first time, let user move cursor if they want
        startval = element.value;
        element.value = element.value.replace("%", "");
        if (startval !== element.value) {
            element.select();
        }
    }
}

// Update provided element with provided value when element blank
function defaultValueWhenBlank(element, value) {
    if (element.value === "") {
        element.value = value;
    }
}

function checkIndiBlank() {
    let el = document.getElementsByClassName("item");
    let list = document.getElementById('vars[other_pids]');
    return el.length === 0 && list.value.toString().length === 0;
}

// This function ensures that if certain options are checked in regard to which relations to include,
// then other required options are selected. e.g. if "Anyone" is selected, all other options must
// all be selected
function updateRelationOption(field) {
    // If user clicked "All relatives"
    if (field === "indicous") {
        // If function triggered by checking "All relatives" field, ensure "Siblings" is checked
        if (document.getElementById("vars[indicous]").checked) {
            document.getElementById("vars[indisibl]").checked = true;
        }
        // If "All relatives" unchecked, uncheck "Anyone"
        if (!document.getElementById("vars[indicous]").checked) {
            document.getElementById("vars[indiany]").checked = false;
        }
    }
    // If user clicked "Siblings"
    if (field === "indisibl") {
        // If function triggered by unchecking "Siblings" field, ensure "All relatives" is unchecked
        if (!document.getElementById("vars[indisibl]").checked) {
            document.getElementById("vars[indicous]").checked = false;
        }
        // If "Siblings" unchecked, uncheck "Anyone"
        if (!document.getElementById("vars[indisibl]").checked) {
            document.getElementById("vars[indiany]").checked = false;
        }
    }
    // If user clicked "Spouses"
    if (field === "indispou") {
        // If function triggered by checking "All relatives" field, ensure "Siblings" is checked
        if (!document.getElementById("vars[indisibl]").checked) {
            document.getElementById("vars[indicous]").checked = false;
        }
        // If "Spouses" unchecked, uncheck "Anyone"
        if (!document.getElementById("vars[indispou]").checked) {
            document.getElementById("vars[indiany]").checked = false;
        }
    }
    // If function triggered by checking "All relatives" field, ensure everything else is checked
    if (field === "indiany") {
        if (document.getElementById("vars[indiany]").checked) {
            document.getElementById("vars[indicous]").checked = true;
            document.getElementById("vars[indisibl]").checked = true;
            document.getElementById("vars[indispou]").checked = true;

        }
    }

}




// Gets position of element relative to another
// From https://stackoverflow.com/questions/1769584/get-position-of-element-by-javascript
function getPos(el, rel)
{
    let x = 0, y = 0;

    do {
        x += el.offsetLeft;
        y += el.offsetTop;
        el = el.offsetParent;
    }
    while (el !== rel)
    return {x:x, y:y};
}


// Toggle items based on if the items in the cart should be used or not
// enable - if set to true, use cart. Update form to disable options. Set to "false" to reverse.
function toggleCart(enable) {
    const el = document.getElementsByClassName("cart_toggle");
    for (let i = 0; i < el.length; i++) {
        el.item(i).disabled = enable;
    }
    showHideClass("cart_toggle_hide", !enable);
    showHideClass("cart_toggle_show", enable);
}

// This function is used in toggleCart to show or hide all elements with a certain class,
// by adding or removing "display: none"
// css_class - the class to search for
// show - true to show the elements and false to hide them
function showHideClass(css_class, show) {
    let el = document.getElementsByClassName(css_class);
    for (let i = 0; i < el.length; i++) {
        showHide(el.item(i), show)
    }
}

// Show or hide an element on the page
// element - the element to affect
// show - whether to show (true) or hide (false) the element
function showHide(element, show) {
    if (show) {
        element.style.removeProperty("display");
    } else {
        element.style.display = "none";
    }
}

// Hide a displayed element or show a hidden one
function toggleShowID(css_id) {
    const element = document.getElementById(css_id);
    const visible = element.style.display !== "none";
    showHide(element, !visible);
}

// Show a toast message
// message - the message to show
function showToast(message) {
    const toastParent = document.getElementById("toast-container");
    if (toastParent !== null) {
        const toast = document.createElement("div");
        toast.setAttribute("id", "toast");
        if (message.substring(0, ERROR_CHAR.length) === ERROR_CHAR) {
            toast.className += "error";
            message = message.substring(ERROR_CHAR.length);
        }
        toast.innerText = message;
        setTimeout(function () {
            toast.remove();
        }, 5500);
        toastParent.appendChild(toast);
        toast.setAttribute("style", " margin-left: -"+toast.clientWidth/2 + "px; width:" + toast.clientWidth + "px");
        toast.className += " show";
    }
}

// Download SVG file
function downloadSVGAsText() {
    const svg = document.getElementById('rendering').getElementsByTagName('svg')[0].cloneNode(true);
    svg.removeAttribute("style");
    let svgData = svg.outerHTML.replace(/&nbsp;/g, '');
    // Replace image URLs with embedded data  for SVG also triggers download
    replaceImageURLs(svgData, "svg", null);
}

function downloadSVGAsPDF() {
    downloadSVGAsImage("pdf");
}

function downloadSVGAsPNG() {
    downloadSVGAsImage("png");
}

function downloadSVGAsJPEG() {
    downloadSVGAsImage("jpeg");
}

// Download PNG from SVG file
function downloadSVGAsImage(type) {
    const svg = document.getElementById('rendering').getElementsByTagName('svg')[0].cloneNode(true);
    // Style attribute used for the draggable browser view, remove this to reset to standard SVG
    svg.removeAttribute("style");

    const canvas = document.createElement("canvas");
    const img = document.createElement("img");
    // get svg data and remove line breaks
    let xml = new XMLSerializer().serializeToString(svg);
    // Fix the + symbol (any # breaks everything)
    xml = xml.replace(/&#45;/g,"+");
    // Replace # colours with rgb equivalent
    // From https://stackoverflow.com/questions/13875974/search-and-replace-hexadecimal-color-codes-with-rgb-values-in-a-string
    const rgbHex = /#([0-9A-F][0-9A-F])([0-9A-F][0-9A-F])([0-9A-F][0-9A-F])/gi;
    xml = xml.replace(rgbHex, function (m, r, g, b) {
        return 'rgb(' + parseInt(r,16) + ','
            + parseInt(g,16) + ','
            + parseInt(b,16) + ')';
    });
    // Replace image URLs with embedded images
    replaceImageURLs(xml, type, img);
    // Once image loaded, draw to canvas then download it
    img.onload = function() {
        canvas.setAttribute('width', img.width.toString());
        canvas.setAttribute('height', img.height.toString());
        // draw the image onto the canvas
        let context = canvas.getContext('2d');
        context.drawImage(img, 0, 0, img.width, img.height);
        // Download it
        const dataURL = canvas.toDataURL('image/'+type);
        if (dataURL.length < 10) {
            showToast("E:"+CLIENT_ERRORS[0]); // Canvas too big
        } else if (type === "pdf") {
            createPdfFromImage(dataURL, img.width, img.height);
        } else {
            downloadLink(dataURL, "gvexport." + type);
        }
    }

}

// Convert image URL to base64 data - we use for embedding images in SVG
// From https://stackoverflow.com/questions/22172604/convert-image-from-url-to-base64
function getBase64Image(img) {
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    return canvas.toDataURL("image/png");
}

// Find image URLs and replace with embedded versions
function replaceImageURLs(svg, type, img) {
    let startPos, len, url;
    let match = /<image.*xlink:href="http/.exec(svg);
    if (match != null) {
        startPos = match.index+match[0].length-4;
        len = svg.substring(startPos).indexOf("\"");
        url = svg.substring(startPos,startPos+len);
        const img2 = document.createElement("img");
        img2.onload = function() {
            let base64 = getBase64Image(img2);
            svg = svg.replace(url,base64);
            replaceImageURLs(svg, type, img);
            img2.remove();
        }
        img2.src = url.replace(/&amp;/g,"&");
    } else {
        if (type === "svg") {
            const svgBlob = new Blob([svg], {type: "image/svg+xml;charset=utf-8"});
            const svgUrl = URL.createObjectURL(svgBlob);
            downloadLink(svgUrl, "gvexport."+type);
        } else {
            img.src = "data:image/svg+xml;utf8," + svg;
        }
    }
}

// Trigger a download via javascript
function downloadLink(URL, filename) {
    const downloadLink = document.createElement("a");
    downloadLink.href = URL;
    downloadLink.download = filename;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
}

// Toggle the showing of an advanced settings section
// id - the id of the element we are toggling
function toggleAdvanced(caller, id) {
    const el = document.getElementById(id);
    const visible = el.style.display !== "none";
    showHide(el, !visible);
    if (visible) {
        caller.innerHTML = caller.innerHTML.replaceAll("↑","↓");
        // Update our hidden field for saving the state
        const hidden = document.getElementById(id+"-hidden");
        hidden.value = "";
    } else {
        caller.innerHTML = caller.innerHTML.replaceAll("↓","↑");
        const hidden = document.getElementById(id+"-hidden");
        hidden.value = "show";
    }
}

function setStateFastRelationCheck() {
    document.getElementById("vars[fastnr]").disabled = ((!cartempty && document.getElementById("vars[usecart]_yes").checked) || !document.getElementById("vars[marknr]").checked);
}

function removeURLParameter(parameter) {
    updateURLParameter(parameter, "", "remove");
}

function changeURLXref(xref) {
    if (xref !== "") {
        updateURLParameter("xref",xref,"update");
    }
}
function updateURLParameter(parameter, value, action) {
    let url=document.location.href.split("?")[0];
    let args=document.location.href.split("?")[1];
    let params = new URLSearchParams(args);
    if (params.toString().search(parameter) !== -1) {
        if (action === "remove") {
            params.delete(parameter);
        } else if (action === "update") {
            params.set(parameter, value);
        } else {
            return params.get(parameter);
        }
        history.pushState(null, '', url + "?" + params.toString());
    }
}

function getURLParameter(parameter) {
    return updateURLParameter(parameter, "", "get").replace("#","");
}

function loadURLXref() {
    const xref = getURLParameter("xref");
    const el = document.getElementById('vars[other_pids]');
    if (el.value.replace(",","").trim() === "") {
        el.value = xref;
    } else {
        const xrefs = el.value.split(",");
        if (xrefs.length === 1) {
            el.value = "";
        }
        addIndiToList(xref);
    }
}
function formChanged(autoUpdate) {
    let xref = document.getElementById('pid').value.trim();
    if (xref !== "") {
        addIndiToList(xref);
        changeURLXref(xref);
    }
    let stopXref = document.getElementById('vars[stop_pid]').value.trim();
    if (stopXref !== "") {
        addIndiToStopList(stopXref);
    }
    if (autoUpdate) {
        updateRender();
    }
}

function loadXrefList(url, xrefListId, indiListId) {
    let xref_list = document.getElementById(xrefListId).value.trim();
    let xrefs = xref_list.split(",");
    for (let i=0; i<xrefs.length; i++) {
        if (xrefs[i].trim() !== "") {
            loadIndividualDetails(url, xrefs[i], indiListId);
        }
    }
    updateClearAll();
}

function loadIndividualDetails(url, xref, list) {
    fetch(url + xref.trim()).then(async (response) => {
            const data = await response.json();
            let contents;
            if (data["data"].length !== 0) {
                contents = data["data"][0]["text"];
            } else {
                contents = xref;
            }
            const listElement = document.getElementById(list);
            const newListItem = document.createElement("div");
            newListItem.className = "indi_list_item";
            newListItem.setAttribute("data-xref", xref);
            newListItem.setAttribute("onclick", "scrollToRecord('"+xref+"')");
            let otherXrefId;
            if (list === "indi_list") {
                otherXrefId = "vars[other_pids]";
            } else {
                otherXrefId = "vars[other_stop_pids]";
            }
            newListItem.innerHTML = contents + "<div class=\"remove-item\" onclick=\"removeItem(event, this.parentElement, '" + otherXrefId + "')\"><a href='#'>×</a></div>";
            // Multiple promises can be for the same xref - don't add if a duplicate
            let item = document.querySelector(`[data-xref="${xref}"]`);
            if (item == null) {
                listElement.appendChild(newListItem);
            } else {
                newListItem.remove();
            }
        updateClearAll();
    })
}

function addIndiToList(xref) {
    let list = document.getElementById('vars[other_pids]');
    const regex = new RegExp(`(?<=,|^)(${xref})(?=,|$)`);
    if (!regex.test(list.value.replaceAll(" ",""))) {
        appendXrefToList(xref, 'vars[other_pids]');
        loadIndividualDetails(TOMSELECT_URL, xref, 'indi_list');

    }
    clearIndiSelect('pid');
}

function addIndiToStopList(xref) {
    let list = document.getElementById('vars[other_stop_pids]');
    const regex = new RegExp(`(?<=,|^)(${xref})(?=,|$)`);
    if (!regex.test(list.value.replaceAll(" ",""))) {
        appendXrefToList(xref, 'vars[other_stop_pids]');
        loadIndividualDetails(TOMSELECT_URL, xref, 'stop_indi_list');
    }
    clearIndiSelect('vars[stop_pid]');
}

function appendXrefToList(xref, elementId) {
    const list = document.getElementById(elementId);
    if (list.value.replace(",","").trim() === "") {
        list.value = xref;
    } else {
        list.value += "," + xref;
        list.value = list.value.replaceAll(",,",",");
    }
}

function clearIndiSelect(selectId) {
    let dropdown = document.getElementById(selectId);
    if (typeof dropdown.tomselect !== 'undefined') {
        dropdown.tomselect.clear();
    } else {
        setTimeout(function () {
            clearIndiSelect(selectId);
        }, 100);
    }
}
function toggleUpdateButton(css_id) {
    const element = document.getElementById(css_id);
    const visible = element.style.display !== "none";
    showHide(element, !visible);
    autoUpdate = visible;
    updateRender();
}

function removeItem(e, element, xrefListId) {
    e.stopPropagation();
    let xref = element.getAttribute("data-xref").trim();
    let list = document.getElementById(xrefListId);
    const regex = new RegExp(`(?<=,|^)(${xref})(?=,|$)`);
    list.value = list.value.replaceAll(" ","").replace(regex, "");
    list.value = list.value.replace(",,", ",");
    if (list.value.substring(0,1) === ",") {
        list.value = list.value.substring(1);
    }
    if (list.value.substring(list.value.length-1) === ",") {
        list.value = list.value.substring(0, list.value.length-1);
    }
    element.remove();
    changeURLXref(list.value.split(",")[0].trim());
    updateClearAll();
    if (autoUpdate) {
        updateRender();
    }
}

// clear options from the dropdown if they are already in our list
function removeSelectedOptions() {
    document.getElementById('vars[other_pids]').value.split(",").forEach(function (id) {
        id = id.trim();
        if (id !== "") {
            let dropdown = document.getElementById('pid');
            if (typeof dropdown.tomselect !== 'undefined') {
                dropdown.tomselect.removeOption(id);
            }
        }
    });
}

// Clear the list of starting individuals
function clearIndiList() {
    document.getElementById('vars[other_pids]').value = "";
    document.getElementById('indi_list').innerHTML = "";
    updateClearAll();
    updateRender();
}
// Clear the list of starting individuals
function clearStopIndiList() {
    document.getElementById('vars[other_stop_pids]').value = "";
    document.getElementById('stop_indi_list').innerHTML = "";
    updateClearAll();
    updateRender();
}

// Refresh the list of starting and stopping individuals
function refreshIndisFromXREFS(onchange) {
    // If triggered from onchange event, only proceed if auto-update enabled
    if (!onchange || autoUpdate) {
        document.getElementById('indi_list').innerHTML = "";
        loadXrefList(TOMSELECT_URL, 'vars[other_pids]', 'indi_list');
        document.getElementById('stop_indi_list').innerHTML = "";
        loadXrefList(TOMSELECT_URL, 'vars[other_stop_pids]', 'stop_indi_list');
    }
}

// Trigger clearAll update for each instance
function updateClearAll() {
    updateClearAllElements('clear_list', 'indi_list');
    updateClearAllElements('clear_stop_list', 'stop_indi_list');
}

// Show or hide Clear All options based on check
function updateClearAllElements(clearElementId, listItemElementId) {
    let clearElement = document.getElementById(clearElementId);
    let listItemElement = document.getElementById(listItemElementId);
    let listItems = listItemElement.getElementsByClassName('indi_list_item');
    if (listItems.length > 1) {
        showHide(clearElement, true);
    } else {
        showHide(clearElement, false);
    }
}

// Toggle full screen for element
// Modified from https://stackoverflow.com/questions/7130397/how-do-i-make-a-div-full-screen
function toggleFullscreen() {
    // If already fullscreen, exit fullscreen
    if (
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
    ) {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    } else { // Not full screen, so go fullscreen
        const element = document.getElementById('render-container');
        if (element.requestFullscreen) {
            element.requestFullscreen();
        } else if (element.mozRequestFullScreen) {
            element.mozRequestFullScreen();
        } else if (element.webkitRequestFullscreen) {
            element.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
        } else if (element.msRequestFullscreen) {
            element.msRequestFullscreen();
        }
    }
}

// Add a listener to trigger when the user goes fullscreen or exits fullscreen
function handleFullscreen() {
    if (document.addEventListener)
    {
        document.addEventListener('fullscreenchange', handleFullscreenExit, false);
        document.addEventListener('mozfullscreenchange', handleFullscreenExit, false);
        document.addEventListener('MSFullscreenChange', handleFullscreenExit, false);
        document.addEventListener('webkitfullscreenchange', handleFullscreenExit, false);
    }
}

// This function is run when the fullscreen state is changed
function handleFullscreenExit()
{
    if (!document.webkitIsFullScreen && !document.mozFullScreen && !document.msFullscreenElement)
    {
        showHide(document.getElementById("fullscreenButton"), true);
        showHide(document.getElementById("fullscreenClose"), false);
    } else {
        showHide(document.getElementById("fullscreenButton"), false);
        showHide(document.getElementById("fullscreenClose"), true);
    }
}

// Get the computed property of an element
function getComputedProperty(element, property) {
    const style = getComputedStyle(element);
    return (parseFloat(style.getPropertyValue(property)));
}

// Create and download a PDF version of the provided image
function createPdfFromImage(imgData, width, height) {
    const orientation = width >= height ? 'landscape' : 'portrait';
    const dpi = document.getElementById('vars[dpi]').value;
    const widthInches = width/dpi;
    const heightInches = height/dpi;
    const doc = new jsPDF({orientation: orientation, format: [widthInches, heightInches], unit: 'in'});
    doc.addImage(imgData, "PNG", 0, 0, widthInches, heightInches);
    doc.save("gvexport.pdf");
}

// If the browser render is available, scroll to the xref provided (if it exists)
function scrollToRecord(xref) {
    const rendering = document.getElementById('rendering');
    const svg = rendering.getElementsByTagName('svg')[0].cloneNode(true);
    let titles = svg.getElementsByTagName('title');
    for (let i=0; i<titles.length; i++) {
        let xrefs = titles[i].innerHTML.split("_");
        for (let j=0; j<xrefs.length; j++) {
            if (xrefs[j] === xref) {
                let minX = null;
                let minY = null;
                let maxX = null;
                let maxY = null;
                const group = titles[i].parentElement;
                // We need to locate the element within the SVG. We use "polygon" here because it is the
                // only element that will always exist and that also has position information
                // (other elements like text, image, etc. can be disabled by the user)
                const points = group.getElementsByTagName('polygon')[0].getAttribute('points').split(" ");
                // Find largest and smallest X and Y value out of all the points of the polygon
                for (j = 0; j < points.length; j++) {
                    const x = parseFloat(points[j].split(",")[0]);
                    const y = parseFloat(points[j].split(",")[1]);
                    if (minX === null || x < minX) {
                        minX = x;
                    }
                    if (minY === null || y < minY) {
                        minY = y;
                    }
                    if (maxX === null || x > maxX) {
                        maxX = x;
                    }
                    if (maxY === null || y > maxY) {
                        maxY = y;
                    }
                }
                // Get the average of the largest and smallest, so we can position the element in the middle
                let x = (minX + maxX) / 2;
                let y = (minY + maxY) / 2;
                // Why do we multiply the scale by 1 and 1/3?
                let zoombase = panzoomInst.getTransform().scale * (1 + 1 / 3);
                let zoom = zoombase * parseFloat(document.getElementById("vars[dpi]").value)/72;
                panzoomInst.smoothMoveTo((rendering.offsetWidth / 2) - x * zoom, (rendering.offsetHeight / 2) - parseFloat(svg.getAttribute('height')) * zoombase - y * zoom);
                return true;
            }
        }
    }
    return false;
}

// Return distance between two points
function getDistance(x1, y1, x2, y2){
    let x = x2 - x1;
    let y = y2 - y1;
    return Math.sqrt(x * x + y * y);
}

function handleTileClick() {
    const MIN_DRAG = 100;
    let startx;
    let starty;

    let linkElements = document.querySelectorAll("svg a");
    for (let i = 0; i < linkElements.length; i++) {
        linkElements[i].addEventListener("mousedown", function(e) {
            startx = e.clientX;
            starty = e.clientY;
        });
        // Only trigger links if not dragging
        linkElements[i].addEventListener("click", function(e) {
            if (getDistance(startx, starty, e.clientX, e.clientY) >= MIN_DRAG) {
                e.preventDefault();
            }
        });
    }
}

// This function is run when the page is loaded
function pageLoaded() {
    jsPDFInst = window.jspdf.jsPDF;
    TOMSELECT_URL = document.getElementById('pid').getAttribute("data-url") + "&query=";
    loadURLXref();
    loadXrefList(TOMSELECT_URL, 'vars[other_pids]', 'indi_list');
    loadXrefList(TOMSELECT_URL, 'vars[other_stop_pids]', 'stop_indi_list');
    // Remove reset parameter from URL when page loaded, to prevent
    // further resets when page reloaded
    removeURLParameter("reset");
    // Remove options from selection list if already selected
    setInterval(function () {removeSelectedOptions()}, 100);
    // Listen for fullscreen change
    handleFullscreen();
    // Load browser render when page has loaded
    updateRender();

    document.querySelector(".hide-form").addEventListener("click", hideSidebar);

    document.querySelector(".sidebar__toggler a").addEventListener("click", showSidebar);

    document.addEventListener("keydown", function(e) {
        if (e.key === "Esc" || e.key === "Escape") {
            document.querySelector(".sidebar").hidden ? showSidebar(e) : hideSidebar(e);
        }
    });
}

// Function to show a help message
// item - the help item identifier
function showHelp(item) {
    let helpText = getHelpText(item);
    const modal = document.createElement("div");
    modal.className = "modal";
    modal.innerHTML = "<div class=\"modal-content\">\n" +
        "<span class='close' onclick='this.parentElement.parentElement.remove()'>&times;</span>\n" +
        "<p>" + helpText + "</p>\n" +
        "</div>"
    document.body.appendChild(modal);
    // When the user clicks anywhere outside the modal, close it
    window.onclick = function(event) {
        if (event.target === modal) {
            modal.remove();
        }
    }
    return false;
}
const ERROR_CHAR = "E:";
const ID_MAIN_SETTINGS = "_MAIN_";
const ID_ALL_SETTINGS = "_ALL_";
const SETTINGS_ID_LIST_NAME = 'GVE_settings_id_list';
const REQUEST_TYPE_GET_TREE_NAME = "get_tree_name";
const REQUEST_TYPE_DELETE_SETTINGS = "delete_settings";
const REQUEST_TYPE_SAVE_SETTINGS = "save_settings";
const REQUEST_TYPE_GET_SETTINGS = "get_settings";
const REQUEST_TYPE_IS_LOGGED_IN = "is_logged_in";
const REQUEST_TYPE_GET_SAVED_SETTINGS_LINK = "get_saved_settings_link";
const REQUEST_TYPE_REVOKE_SAVED_SETTINGS_LINK = "revoke_saved_settings_link";
const REQUEST_TYPE_LOAD_SETTINGS_TOKEN = "load_settings_token";
const REQUEST_TYPE_ADD_MY_FAVORITE = "add_my_favorite";
const REQUEST_TYPE_ADD_TREE_FAVORITE = "add_tree_favorite";
let treeName = null;
let loggedIn = null;
let xrefList = [];

function hideSidebar() {
    document.querySelector(".sidebar").hidden = true;
    document.querySelector(".sidebar__toggler").hidden = false;
    }

function showSidebar() {
    document.querySelector(".sidebar__toggler").hidden = true;
    document.querySelector(".sidebar").hidden = false;
}

// Enable or disable the option to add photos.
// This is used when selecting diagram type, as only
// some types support photos.
function togglePhotos(enable) {
    document.getElementById("show_photos").disabled = !enable;
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
    let list = document.getElementById('xref_list');
    return el.length === 0 && list.value.toString().length === 0;
}

// This function ensures that if certain options are checked in regard to which relations to include,
// then other required options are selected. e.g. if "Anyone" is selected, all other options must
// all be selected
function updateRelationOption(field) {
    // If user clicked "All relatives"
    if (field === "include_all_relatives") {
        // If function triggered by checking "All relatives" field, ensure "Siblings" is checked
        if (document.getElementById("include_all_relatives").checked) {
            document.getElementById("include_siblings").checked = true;
        }
        // If "All relatives" unchecked, uncheck "Anyone"
        if (!document.getElementById("include_all_relatives").checked) {
            document.getElementById("include_all").checked = false;
        }
    }
    // If user clicked "Siblings"
    if (field === "include_siblings") {
        // If function triggered by unchecking "Siblings" field, ensure "All relatives" is unchecked
        if (!document.getElementById("include_siblings").checked) {
            document.getElementById("include_all_relatives").checked = false;
        }
        // If "Siblings" unchecked, uncheck "Anyone"
        if (!document.getElementById("include_siblings").checked) {
            document.getElementById("include_all").checked = false;
        }
    }
    // If user clicked "Spouses"
    if (field === "include_spouses") {
        // If function triggered by checking "All relatives" field, ensure "Siblings" is checked
        if (!document.getElementById("include_siblings").checked) {
            document.getElementById("include_all_relatives").checked = false;
        }
        // If "Spouses" unchecked, uncheck "Anyone"
        if (!document.getElementById("include_spouses").checked) {
            document.getElementById("include_all").checked = false;
        }
    }
    // If function triggered by checking "All relatives" field, ensure everything else is checked
    if (field === "include_all") {
        if (document.getElementById("include_all").checked) {
            document.getElementById("include_all_relatives").checked = true;
            document.getElementById("include_siblings").checked = true;
            document.getElementById("include_spouses").checked = true;

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
            showToast(ERROR_CHAR+CLIENT_ERRORS[0]); // Canvas too big
        } else if (type === "pdf") {
            createPdfFromImage(dataURL, img.width, img.height);
        } else {
            downloadLink(dataURL, download_file_name + "." + type);
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
            downloadLink(svgUrl, download_file_name + "."+type);
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
    // If running test suite, don't actually trigger download of data
    // We have generated it so know it works
    if (!window.Cypress) {
        downloadLink.click();
    }
    document.body.removeChild(downloadLink);
}

// Toggle the showing of an advanced settings section
// button - the button element calling the script
// id - the id of the element we are toggling
// visible - whether to make element visible or hidden. Null to toggle current state.
function toggleAdvanced(button, id, visible = null) {
    const el = document.getElementById(id);
    // If toggling, set to the opposite of current state
    if (visible === null) {
        visible = el.style.display === "none";
    }
    showHide(el, visible);
    if (visible) {
        button.innerHTML = button.innerHTML.replaceAll('↓','↑');
        const hidden = document.getElementById(id+"-hidden");
        hidden.value = "show";
    } else {
        button.innerHTML = button.innerHTML.replaceAll('↑','↓');
        // Update our hidden field for saving the state
        const hidden = document.getElementById(id+"-hidden");
        hidden.value = "";
    }
}

function setStateFastRelationCheck() {
    document.getElementById("faster_relation_check").disabled = ((!cartempty && document.getElementById("usecart_yes").checked) || !document.getElementById("mark_not_related").checked);
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
    let split = document.location.href.split("?");
    let url = split[0];
    if (split.length > 1) {
        let args = split[1];
        let params = new URLSearchParams(args);
        if (params.toString().search(parameter) !== -1) {
            if (action === "remove") {
                params.delete(parameter);
            } else if (action === "update") {
                params.set(parameter, value);
            } else {
                return params.get(parameter);
            }
        }
        history.pushState(null, '', url + "?" + params.toString());
    } else if (action === "update") {
        history.pushState(null, '', url + "?" +  parameter + "=" + value);
    }
    return "";
}

function getURLParameter(parameter) {
    let result = updateURLParameter(parameter, "", "get");
    if (result !== null && result !== '') {
        return result.replace("#','");
    } else {
        return null;
    }
}

function loadURLXref() {
    const xref = getURLParameter("xref");
    if (xref !== null) {
        const el = document.getElementById('xref_list');
        if (el.value.replace(',', "").trim() === "") {
            el.value = xref;
        } else {
            const xrefs = el.value.split(',');
            if (url_xref_treatment === 'default' && xrefs.length === 1 || url_xref_treatment === 'overwrite') {
                el.value = "";
            }
            if (url_xref_treatment !== 'nothing') {
                let startValue = el.value;
                addIndiToList(xref);
                if (startValue !== el.value && (url_xref_treatment === 'default' || url_xref_treatment === 'add')) {
                    setTimeout(function () {showToast(TRANSLATE['One new source person added to %s existing persons'].replace('%s', xrefs.length.toString()))}, 100);
                }
            }
        }
    }
}

function indiSelectChanged() {
    let xref = document.getElementById('pid').value.trim();
    if (xref !== "") {
        addIndiToList(xref);
        changeURLXref(xref);
        if (autoUpdate) {
            updateRender();
        }
    }
}
function stopIndiSelectChanged() {
    let stopXref = document.getElementById('stop_pid').value.trim();
    if (stopXref !== "") {
        addIndiToStopList(stopXref);
    }
    if (autoUpdate) {
        updateRender();
    }
}

function loadXrefList(url, xrefListId, indiListId) {
    let xrefListEl = document.getElementById(xrefListId);
    let xref_list = xrefListEl.value.trim();
    xrefListEl.value = xref_list;

    let promises = [];
    let xrefs = xref_list.split(',');
    for (let i=0; i<xrefs.length; i++) {
        if (xrefs[i].trim() !== "") {
            promises.push(loadIndividualDetails(url, xrefs[i], indiListId));
        }
    }
    Promise.all(promises).then(function () {
        updateClearAll();
        toggleHighlightStartPersons(document.getElementById('highlight_start_indis').checked);
    }).catch(function(error) {
        showToast("Error");
        console.log(error);
    });
}

function loadIndividualDetails(url, xref, list) {
    return fetch(url + xref.trim()).then(async (response) => {
            const data = await response.json();
            let contents;
            let otherXrefId;
            if (list === "indi_list") {
                otherXrefId = "xref_list";
            } else {
                otherXrefId = "stop_xref_list";
            }
            if (data["data"].length !== 0) {
                for (let i=0; i< data['data'].length; i++) {
                    if (xref.toUpperCase() === data['data'][i].value.toUpperCase()) {
                        contents = data["data"][i]["text"];
                        // Fix case if mismatched
                        if (xref !== data['data'][i].value) {
                            let listEl = document.getElementById(otherXrefId);
                            let indiList = listEl.value.split(',');
                            for (let j = indiList.length-1; j>=0; j--) {
                                if (indiList[j].trim() === xref.trim()) {
                                    indiList[j] = data["data"][i].value;
                                    break;
                                }
                            }
                            listEl.value = indiList.join(',');
                            setTimeout(()=>{refreshIndisFromXREFS(false)}, 100);
                            handleFormChange();
                        }
                    }
                }
            } else {
                contents = xref;
            }
            const listElement = document.getElementById(list);
            const newListItem = document.createElement("div");
            newListItem.className = "indi_list_item";
            newListItem.setAttribute("data-xref", xref);
            newListItem.setAttribute("onclick", "scrollToRecord('"+xref+"')");
            newListItem.innerHTML = contents + "<div class=\"saved-settings-ellipsis\" onclick=\"removeItem(event, this.parentElement, '" + otherXrefId + "')\"><a href='#'>×</a></div>";
            // Multiple promises can be for the same xref - don't add if a duplicate
            let item = listElement.querySelector(`[data-xref="${xref}"]`);
            if (item == null) {
                listElement.appendChild(newListItem);
            } else {
                newListItem.remove();
            }
        updateClearAll();
    })
}

function addIndiToList(xref) {
    let list = document.getElementById('xref_list');
    const regex = new RegExp(`(?<=,|^)(${xref})(?=,|$)`);
    if (!regex.test(list.value.replaceAll(" ','"))) {
        appendXrefToList(xref, 'xref_list');
        loadIndividualDetails(TOMSELECT_URL, xref, 'indi_list').then(() => {
            toggleHighlightStartPersons(document.getElementById('highlight_start_indis').checked);
        })

    }
    clearIndiSelect('pid');
}

function addIndiToStopList(xref) {
    let list = document.getElementById('stop_xref_list');
    const regex = new RegExp(`(?<=,|^)(${xref})(?=,|$)`);
    if (!regex.test(list.value.replaceAll(" ','"))) {
        appendXrefToList(xref, 'stop_xref_list');
        loadIndividualDetails(TOMSELECT_URL, xref, 'stop_indi_list');
    }
    clearIndiSelect('stop_pid');
}

function appendXrefToList(xref, elementId) {
    const list = document.getElementById(elementId);
    if (list.value.replace(',',"").trim() === "") {
        list.value = xref;
    } else {
        list.value += ',' + xref;
        list.value = list.value.replaceAll(",,',',");
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
function toggleUpdateButton() {
    const updateBtn = document.getElementById('update-browser');
    const autoSettingBox = document.getElementById('auto_update');

    const visible = autoSettingBox.checked;
    showHide(updateBtn, !visible);
    autoUpdate = visible;
    if (autoUpdate) updateRender();
}

function removeItem(e, element, xrefListId) {
    e.stopPropagation();
    let xref = element.getAttribute("data-xref").trim();
    let list = document.getElementById(xrefListId);
    const regex = new RegExp(`(?<=,|^)(${xref})(?=,|$)`);
    list.value = list.value.replaceAll(" ','").replace(regex, "");
    list.value = list.value.replace(",,", ',');
    if (list.value.substring(0,1) === ',') {
        list.value = list.value.substring(1);
    }
    if (list.value.substring(list.value.length-1) === ',') {
        list.value = list.value.substring(0, list.value.length-1);
    }
    element.remove();
    changeURLXref(list.value.split(',')[0].trim());
    updateClearAll();
    removeFromXrefList(xref, 'no_highlight_xref_list');
    toggleHighlightStartPersons(document.getElementById('highlight_start_indis').checked);
    if (autoUpdate) {
        updateRender();
    }
}

// clear options from the dropdown if they are already in our list
function removeSearchOptions() {
    // Remove option when searching for starting indi if already in list
    document.getElementById('xref_list').value.split(',').forEach(function (xref) {
        removeSearchOptionFromList(xref, 'pid')
    });
    // Remove option when searching for stopping indi if already in list
    document.getElementById('stop_xref_list').value.split(',').forEach(function (xref) {
        removeSearchOptionFromList(xref, 'stop_pid')
    });
    // Remove option when searching diagram if indi not in diagram
    let dropdown = document.getElementById('diagram_search_box');
    Object.keys(dropdown.tomselect.options).forEach(function (option) {
        if (!xrefList.includes(option)) {
            removeSearchOptionFromList(option, 'diagram_search_box');
        }
    });
}
// clear options from the dropdown if they are already in our list
function removeSearchOptionFromList(xref, listId) {
    xref = xref.trim();
    if (xref !== "") {
        let dropdown = document.getElementById(listId);
        if (typeof dropdown.tomselect !== 'undefined') {
            dropdown.tomselect.removeOption(xref);
        }
    }
}

// Clear the list of starting individuals
function clearIndiList() {
    document.getElementById('xref_list').value = "";
    document.getElementById('indi_list').innerHTML = "";
    updateClearAll();
    if (autoUpdate) updateRender();
}
// Clear the list of starting individuals
function clearStopIndiList() {
    document.getElementById('stop_xref_list').value = "";
    document.getElementById('stop_indi_list').innerHTML = "";
    updateClearAll();
    if (autoUpdate) updateRender();
}

// Refresh the list of starting and stopping individuals
function refreshIndisFromXREFS(onchange) {
    // If triggered from onchange event, only proceed if auto-update enabled
    if (!onchange || autoUpdate) {
        document.getElementById('indi_list').innerHTML = "";
        loadXrefList(TOMSELECT_URL, 'xref_list', 'indi_list');
        document.getElementById('stop_indi_list').innerHTML = "";
        loadXrefList(TOMSELECT_URL, 'stop_xref_list', 'stop_indi_list');
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
    const dpi = document.getElementById('dpi').value;
    const widthInches = width / dpi;
    const heightInches = height / dpi;
    const doc = new window.jspdf.jsPDF({orientation: orientation, format: [widthInches, heightInches], unit: 'in'});
    doc.addImage(imgData, "PNG", 0, 0, widthInches, heightInches);
    // If running test suite, don't actually trigger download of data
    // We have generated it so know it works
    if (!window.Cypress) {
        doc.save(download_file_name + ".pdf");
    }
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
                let x = null;
                let y = null;
                const group = titles[i].parentElement;
                // We need to locate the element within the SVG. We use "polygon" here because it is the
                // only element that will always exist and that also has position information
                // (other elements like text, image, etc. can be disabled by the user)
                const polygonList = group.getElementsByTagName('polygon');
                let points;
                if (polygonList.length !== 0) {
                    points = polygonList[0].getAttribute('points').split(" ");
                    // Find largest and smallest X and Y value out of all the points of the polygon
                    for (let k = 0; k < points.length; k++) {
                        // If path instructions, ignore
                        if (points[k].replace(/[a-z]/gi, '') !== points[k]) break;
                        const x = parseFloat(points[k].split(',')[0]);
                        const y = parseFloat(points[k].split(',')[1]);
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
                    x = (minX + maxX) / 2;
                    y = (minY + maxY) / 2;
                } else {
                    x = group.getElementsByTagName('text')[0].getAttribute('x');
                    y = group.getElementsByTagName('text')[0].getAttribute('y')
                }

                // Why do we multiply the scale by 1 and 1/3?
                let zoombase = panzoomInst.getTransform().scale * (1 + 1 / 3);
                let zoom = zoombase * parseFloat(document.getElementById("dpi").value)/72;
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

function handleFormChange() {
    if (autoUpdate) updateRender();
}

function removeSettingsEllipsisMenu(menuElement) {
    document.querySelectorAll('.settings_ellipsis_menu').forEach(e => {
        if (e !== menuElement) e.remove();
    });
}

// This function is run when the page is loaded
function pageLoaded() {
    TOMSELECT_URL = document.getElementById('pid').getAttribute("data-url") + "&query=";
    loadURLXref();
    loadUrlToken();
    loadXrefList(TOMSELECT_URL, 'xref_list', 'indi_list');
    loadXrefList(TOMSELECT_URL, 'stop_xref_list', 'stop_indi_list');
    loadSettingsDetails();
    // Remove reset parameter from URL when page loaded, to prevent
    // further resets when page reloaded
    removeURLParameter("reset");
    // Remove options from selection list if already selected
    setInterval(function () {removeSearchOptions()}, 100);
    // Listen for fullscreen change
    handleFullscreen();
    // Load browser render when page has loaded
    if (autoUpdate) updateRender();
    // Handle sidebar
    document.querySelector(".hide-form").addEventListener("click", hideSidebar);
    document.querySelector(".sidebar__toggler a").addEventListener("click", showSidebar);

    // Form change events
    const form = document.getElementById('gvexport');
    let checkboxElems = form.querySelectorAll("input:not([type='file']):not(#save_settings_name):not(#stop_pid):not(.highlight_check), select:not(#simple_settings_list):not(#pid)");
    for (let i = 0; i < checkboxElems.length; i++) {
        checkboxElems[i].addEventListener("change", handleFormChange);
    }
    let indiSelectEl = form.querySelector("#pid");
    indiSelectEl.addEventListener('change', indiSelectChanged);

    let stopIndiSelectEl = form.querySelector("#stop_pid");
    stopIndiSelectEl.addEventListener('change', stopIndiSelectChanged);

    let simpleSettingsEl = form.querySelector("#simple_settings_list");
    simpleSettingsEl.addEventListener('change', function(e) {
        let element = document.querySelector('.settings_list_item[data-id="' + e.target.value + '"]');
        if (element !== null) {
            loadSettings(element.getAttribute('data-settings'));
        } else if (e.target.value !== '-') {
            showToast(ERROR_CHAR + 'Settings not found')
        }
    })
    document.addEventListener("keydown", function(e) {
        if (e.key === "Esc" || e.key === "Escape") {
            document.querySelector(".sidebar").hidden ? showSidebar(e) : hideSidebar(e);
        }
    });
    document.addEventListener("click", function(event) {
        removeSettingsEllipsisMenu(event.target);
        if (!document.getElementById('searchButton').contains(event.target) && !document.getElementById('diagram_search_box_container').contains(event.target)) {
            showHideSearchBox(event, false);
        }
    });
    document.querySelector("#diagram_search_box_container").addEventListener('change', diagramSearchBoxChange);
    document.querySelector('#searchButton').addEventListener('click', showHideSearchBox);
}

// Function to show a help message
// item - the help item identifier
function showModal(content) {
    const modal = document.createElement("div");
    modal.className = "modal";
    modal.id = "modal";
    modal.innerHTML = "<div class=\"modal-content\">\n" +
        '<span class="close" onclick="document.getElementById(' + "'modal'" + ').remove()">&times;</span>\n' +
        content + "\n" +
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
// Function to show a help message
// item - the help item identifier
function showHelp(item) {
    let helpText = getHelpText(item);
    let content = "<p>" + helpText + "</p>";
    showModal(content);
    return false;
}

/**
 * Downloads settings as JSON file
 */
function downloadSettingsFileMenuAction(event) {
    let parent = event.target.parentElement;
    while (!parent.dataset.settings) {
        parent = parent.parentElement;
    }
    let settings_json_string = parent.dataset.settings;
    let settings;
    try {
        settings = JSON.parse(settings_json_string);
    } catch (e) {
        showToast("Failed to load settings: " + e);
        return false;
    }
    let file = new Blob([settings_json_string], {type: "text/plain"});
    let url = URL.createObjectURL(file);
    downloadLink(url, TREE_NAME + " - " + settings['save_settings_name'] + ".json")
}

/**
 * Loads settings from uploaded file
 */
function uploadSettingsFile(input) {
    if (input.files.length === 0) {
        return;
    }
    const file = input.files[0];
    let reader = new FileReader();
    reader.onload = (e) => {
        loadSettings(e.target.result);
    };
    reader.onerror = (e) => showToast(e.target.error.name);
    reader.readAsText(file);
}

function toBool(value) {
    if (typeof value === 'string') {
        return (value === 'true');
    } else {
        return value;
    }
}
function loadSettings(data) {
    let settings;
    try {
        settings = JSON.parse(data);
    } catch (e) {
        showToast("Failed to load settings: " + e);
        return false;
    }
    Object.keys(settings).forEach(function(key){
        let el = document.getElementById(key);
        if (el == null) {
            switch (key) {
                case 'diagram_type':
                    setCheckStatus(document.getElementById('diagtype_simple'), settings[key] === 'simple');
                    setCheckStatus(document.getElementById('diagtype_decorated'), settings[key] === 'decorated');
                    setCheckStatus(document.getElementById('diagtype_combined'), settings[key] === 'combined');
                    break;
                case 'birthdate_year_only':
                    setCheckStatus(document.getElementById('bd_type_y'), toBool(settings[key]));
                    setCheckStatus(document.getElementById('bd_type_gedcom'), !toBool(settings[key]));
                    break;
                case 'death_date_year_only':
                    setCheckStatus(document.getElementById('dd_type_y'), toBool(settings[key]));
                    setCheckStatus(document.getElementById('dd_type_gedcom'), !toBool(settings[key]));
                    break;
                case 'marr_date_year_only':
                    setCheckStatus(document.getElementById('md_type_y'), toBool(settings[key]));
                    setCheckStatus(document.getElementById('md_type_gedcom'), !toBool(settings[key]));
                    break;
                case 'show_adv_people':
                    toggleAdvanced(document.getElementById('people-advanced-button'), 'people-advanced', toBool(settings[key]));
                    break;
                case 'show_adv_appear':
                    toggleAdvanced(document.getElementById('appearance-advanced-button'), 'appearance-advanced', toBool(settings[key]));
                    break;
                case 'show_adv_files':
                    toggleAdvanced(document.getElementById('files-advanced-button'), 'files-advanced', toBool(settings[key]));
                    break;
                // If option to use cart is not showing, don't load, but also don't show error
                case 'use_cart':
                // These options only exist if debug panel active - don't show error if not found
                case 'enable_debug_mode':
                case 'enable_graphviz':
                // Token is not loaded as an option
                case 'token':
                    break;
                default:
                    showToast(ERROR_CHAR + CLIENT_ERRORS[1] + " " + key); // Unable to load setting
            }
        } else {
            if (el.type === 'checkbox' || el.type === 'radio') {
                setCheckStatus(el, toBool(settings[key]));
            } else {
                el.value = settings[key];
            }
        }
    });
    setStateFastRelationCheck();
    setSavedDiagramsPanel();
    showHide(document.getElementById('arrow_group'),document.getElementById('colour_arrow_related').checked)
    showHide(document.getElementById('startcol_option'),document.getElementById('highlight_start_indis').checked)

    if (autoUpdate) {
        updateRender();
    }
    refreshIndisFromXREFS(false);
}

function setCheckStatus(el, checked) {
        el.checked = checked;
}

function setGraphvizAvailable(available) {
    graphvizAvailable = available;
}

function saveSettingsServer(main = true, id = null) {
    let request = {
        "type": REQUEST_TYPE_SAVE_SETTINGS,
        "main": main,
        "settings_id": id
    };
    let json = JSON.stringify(request);
    return sendRequest(json);
}

function getSettingsServer(id = ID_ALL_SETTINGS) {
    let request = {
        "type": REQUEST_TYPE_GET_SETTINGS,
        "settings_id": id
    };
    let json = JSON.stringify(request);
    return sendRequest(json).then((response) => {
        try {
            let json = JSON.parse(response);
            if (json.success) {
                return json.settings;
            } else {
                return ERROR_CHAR + json.errorMessage;
            }
        } catch(e) {
            showToast(ERROR_CHAR + e);
        }
        return false;
    });
}


function getSettingsClient(id = ID_ALL_SETTINGS) {
    return getTreeName().then(async (treeName) => {
        try {
            if (id === ID_ALL_SETTINGS) {
                if (localStorage.getItem(SETTINGS_ID_LIST_NAME + "_" + treeName)) {
                    let settings_list = localStorage.getItem(SETTINGS_ID_LIST_NAME + "_" + treeName);
                    let ids = settings_list.split(',');
                    let promises = ids.map(id_value => getSettingsClient(id_value))
                    let results = await Promise.all(promises);
                    let settings = {};
                    for (let i = 0; i < ids.length; i++) {
                        let id_value = ids[i];
                        let userSettings = results[i];
                        if (userSettings === null) {
                            return Promise.reject('User settings null');
                        } else {
                        settings[id_value] = {};
                        settings[id_value]['name'] = userSettings['save_settings_name'];
                        settings[id_value]['id'] = id_value;
                        settings[id_value]['settings'] = JSON.stringify(userSettings);}
                    }
                    return settings;
                } else {
                    return {};
                }
            } else {
                let settings_id = id === ID_MAIN_SETTINGS ? "" : id;
                try {
                    return JSON.parse(localStorage.getItem("GVE_Settings_" + treeName + "_" + settings_id));
                } catch(e) {
                    return Promise.reject(e);
                }
            }

        } catch(e) {
            return Promise.reject(e);
        }
    }).catch((e) => {
        showToast(ERROR_CHAR + e);
    });
}

function getSettings(id = ID_ALL_SETTINGS) {
    return isUserLoggedIn().then((loggedIn) => {
        if (loggedIn || id === ID_MAIN_SETTINGS) {
            return getSettingsServer(id);
        } else {
            return getSettingsClient(id).then((obj) => {
                return JSON.stringify(obj);
            });
        }
    }).catch((error) => {
        showToast(ERROR_CHAR + error);
    });
}
function sendRequest(json) {
    return new Promise((resolve, reject) => {
        const form = document.getElementById('gvexport');
        const el = document.createElement("input");
        el.name = "json_data";
        el.value = json;
        form.appendChild(el);
        document.getElementById("browser").value = "true";
        let data = jQuery(form).serialize();
        document.getElementById("browser").value = "false";
        el.remove();
        window.fetch(form.getAttribute('action'), {
            method: form.getAttribute('method'),
            credentials: 'same-origin', // include, *same-origin, omit
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: data
        }).then(function (response) {
            if (!response.ok) {
                return response.text().then(function (errorText) {
                    return reject(errorText)
                });
            }
            resolve(response.text());
        }).catch((e) => {
            reject(e);
        });
    });
}

function loadSettingsDetails() {
    getSettings(ID_ALL_SETTINGS).then((settings) => {
        let settingsList;
        try {
            settingsList = JSON.parse(settings);
        } catch (e) {
            return CLIENT_ERRORS['2'] + e;
        }
        const listElement = document.getElementById('settings_list');
        const simpleSettingsListEl = document.getElementById('simple_settings_list');
        if (simpleSettingsListEl !== null) {
            simpleSettingsListEl.innerHTML = "<option value=\"-\">-</option>";
        }
        listElement.innerHTML = "";
        Object.keys(settingsList).forEach (function(key) {
            const newLinkWrapper = document.createElement("a");
            newLinkWrapper.setAttribute("href", "#");
            const newListItem = document.createElement("div");
            newListItem.className = "settings_list_item";
            newListItem.setAttribute("data-settings", settingsList[key]['settings']);
            newListItem.setAttribute("data-id", settingsList[key]['id']);
            newListItem.setAttribute("data-token", settingsList[key]['token'] || "");
            newListItem.setAttribute("data-name", settingsList[key]['name']);
            newListItem.setAttribute("onclick", "loadSettings(this.getAttribute('data-settings'))");
            newListItem.innerHTML = "<a href=\"#\">" + settingsList[key]['name'] + "<div class=\"saved-settings-ellipsis\" onclick='showSavedSettingsItemMenu(event)'><a href='#'>…</a></div></a>";
            newLinkWrapper.appendChild(newListItem);
            listElement.appendChild(newLinkWrapper);

            if (simpleSettingsListEl !== null) {
                let option = document.createElement("option");
                option.value = settingsList[key]['id'];
                option.text = settingsList[key]['name'];
                simpleSettingsListEl.appendChild(option);
            }
        });
    }).catch(
        error => showToast(error)
    );
}

function addSettingsMenuOption(id, div, emoji, text, callback, token = '') {
    let el = document.createElement('a');
    el.setAttribute('class', 'settings_ellipsis_menu_item');
    el.setAttribute('href', '#');
    el.innerHTML = '<span class="settings_ellipsis_menu_icon">' + emoji + '</span><span>' + TRANSLATE[text] + '</span>';
    el.id = id;
    el.token = token;
    el.addEventListener("click", (e) => {
        callback(e);
    });
    div.appendChild(el);
}

function showSavedSettingsItemMenu(event) {
    event.stopImmediatePropagation();
    let id = event.target.parentElement.parentElement.getAttribute('data-id');
    let token = event.target.parentElement.parentElement.getAttribute('data-token');
    removeSettingsEllipsisMenu(event.target);
    isUserLoggedIn().then((loggedIn) => {
        if (id != null) {
            id = id.trim();
            let div = document.createElement('div');
            div.setAttribute('class', 'settings_ellipsis_menu');
            addSettingsMenuOption(id, div, '❌', 'Delete', deleteSettingsMenuAction);
            addSettingsMenuOption(id, div, '💻', 'Download', downloadSettingsFileMenuAction);
            if (loggedIn) {
                addSettingsMenuOption(id, div, '🔗', 'Copy link', copySavedSettingsLinkMenuAction);
                if (token !== '') {
                    addSettingsMenuOption(id, div, '🚫', 'Revoke link', revokeSavedSettingsLinkMenuAction, token);
                }
                if (MY_FAVORITES_MODULE_ACTIVE) {
                    addSettingsMenuOption(id, div, '🌟', 'Add to My favorites', addUrlToMyFavouritesMenuAction);
                }
                if (TREE_FAVORITES_MODULE_ACTIVE) {
                    addSettingsMenuOption(id, div, '🌲', 'Add to Tree favorites', addUrlToTreeFavourites);
                }
            }
            event.target.appendChild(div);
        }
    });
}

function saveSettingsAdvanced(userPrompted = false) {
    let settingsList = document.getElementsByClassName('settings_list_item');
    let settingsName = document.getElementById('save_settings_name').value;
    if (settingsName === '') settingsName = "Settings";
    let id = null;
    for (let i=0; i<settingsList.length; i++) {
        if (settingsList[i].getAttribute('data-name') === settingsName) {
            id = settingsList[i].getAttribute('data-id');
        }
    }
    if (id !== null) {
        if (userPrompted) {
            document.getElementById('modal').remove();
        } else {
            let message = TRANSLATE["Overwrite settings '%s'?"].replace('%s', settingsName);
            let buttons = '<div class="modal-button-container"><button class="btn btn-secondary modal-button" onclick="document.getElementById(' + "'modal'" + ').remove()">' + TRANSLATE['Cancel'] + '</button><button class="btn btn-primary modal-button" onclick="saveSettingsAdvanced(true)">' + TRANSLATE['Overwrite'] + '</button></div>';
            showModal('<div class="modal-container">' + message + '<br>' + buttons + '</div>');
            return false;
        }
    }

    isUserLoggedIn().then((loggedIn) => {
        if (loggedIn) {
            return saveSettingsServer(false, id).then((response)=>{
                try {
                    let json = JSON.parse(response);
                    if (json.success) {
                        return response;
                    } else {
                        return Promise.reject(ERROR_CHAR + json.errorMessage);
                    }
                } catch (e) {
                    return Promise.reject("Failed to load response: " + e);
                }
            });
        } else {
            if (id === null) {
                return getIdLocal().then((newId) => {
                    return saveSettingsClient(newId);
                });
            } else {
                return saveSettingsClient(id);
            }
        }
    }).then(() => {
        loadSettingsDetails();
        document.getElementById('save_settings_name').value = "";
    }).catch(
        error => showToast(error)
    );

}

function deleteSettingsClient(id) {
    getTreeName().then((treeName) => {
        try {
            localStorage.removeItem("GVE_Settings_" + treeName + "_" + id);
            deleteIdLocal(id);
        } catch (e) {
            showToast(e);
        }
    });
}

function deleteSettingsMenuAction(e) {
    e.stopPropagation();
    let id = e.currentTarget.id;
    isUserLoggedIn().then((loggedIn) => {
        if (loggedIn) {
            let request = {
                "type": REQUEST_TYPE_DELETE_SETTINGS,
                "settings_id": id
            };
            let json = JSON.stringify(request);
            sendRequest(json).then((response) => {
                try {
                    let json = JSON.parse(response);
                    if (json.success) {
                        loadSettingsDetails();
                    } else {
                        showToast(ERROR_CHAR + json.errorMessage);
                    }
                } catch (e) {
                    showToast("Failed to load response: " + e);
                    return false;
                }
            });
        } else {
            deleteSettingsClient(id);
            loadSettingsDetails();
        }
    });
}

function copySavedSettingsLinkMenuAction(e) {
    let id = e.currentTarget.id;
    e.stopPropagation();
    getSavedSettingsLink(id).then((url)=>{
        copyToClipboard(url)
            .then(() => {
                showToast(TRANSLATE['Copied link to clipboard']);
            })
            .catch(() => {
                showToast(TRANSLATE['Failed to copy link to clipboard']);
                showModal('<p>' + TRANSLATE['Failed to copy link to clipboard'] + '. ' + TRANSLATE['Copy manually below'] + ':</p><textarea style="width: 100%">' + json.url + "</textarea>")
            });
    })
}
function getSavedSettingsLink(id) {
    return isUserLoggedIn().then((loggedIn) => {
        if (loggedIn) {
            let request = {
                "type": REQUEST_TYPE_GET_SAVED_SETTINGS_LINK,
                "settings_id": id
            };
            let json = JSON.stringify(request);
            return sendRequest(json).then((response) => {
                loadSettingsDetails();
                try {
                    let json = JSON.parse(response);
                    if (json.success) {
                        return json.url;
                    } else {
                        showToast(ERROR_CHAR + json.errorMessage);
                    }
                } catch (e) {
                    showToast("Failed to load response: " + e);
                    return false;
                }
            });
        }
    });
}

function revokeSavedSettingsLinkMenuAction(e) {
    e.stopPropagation();
    let token = e.currentTarget.token;
    isUserLoggedIn().then((loggedIn) => {
        if (loggedIn) {
            let request = {
                "type": REQUEST_TYPE_REVOKE_SAVED_SETTINGS_LINK,
                "token": token
            };
            let json = JSON.stringify(request);
            sendRequest(json).then((response) => {
                loadSettingsDetails();
                try {
                    let json = JSON.parse(response);
                    if (json.success) {
                        showToast(TRANSLATE['Revoked access to shared link']);
                    } else {
                        showToast(ERROR_CHAR + json.errorMessage);
                    }
                } catch (e) {
                    showToast("Failed to load response: " + e);
                    return false;
                }
            });
        }
    });
}
function addUrlToMyFavouritesMenuAction(e) {
    e.stopPropagation();
    let id = e.currentTarget.id;
    isUserLoggedIn().then((loggedIn) => {
        if (loggedIn) {
            let request = {
                "type": REQUEST_TYPE_ADD_MY_FAVORITE,
                "settings_id": id
            };
            let json = JSON.stringify(request);
            sendRequest(json).then((response) => {
                try {
                    let json = JSON.parse(response);
                    if (json.success) {
                        showToast(TRANSLATE['Added to My favourites']);
                    } else {
                        showToast(ERROR_CHAR + json.errorMessage);
                    }
                } catch (e) {
                    showToast("Failed to load response: " + e);
                    return false;
                }
            });
        }
    });
}
function addUrlToTreeFavourites(e) {
    e.stopPropagation();
    let parent = event.target.parentElement;
    while (!parent.dataset.id) {
        parent = parent.parentElement;
    }
    let id = parent.getAttribute('data-id');
    isUserLoggedIn().then((loggedIn) => {
        if (loggedIn) {
            let request = {
                "type": REQUEST_TYPE_ADD_TREE_FAVORITE,
                "settings_id": id
            };
            let json = JSON.stringify(request);
            sendRequest(json).then((response) => {
                try {
                    let json = JSON.parse(response);
                    if (json.success) {
                        showToast(TRANSLATE['Added to Tree favourites']);
                    } else {
                        showToast(ERROR_CHAR + json.errorMessage);
                    }
                } catch (e) {
                    showToast("Failed to load response: " + e);
                    return false;
                }
            });
        }
    });
}

function loadUrlToken() {
    const token = getURLParameter("t");
    if (token !== null) {
        let request = {
            "type": REQUEST_TYPE_LOAD_SETTINGS_TOKEN,
            "token": token
        };
        let json = JSON.stringify(request);
        sendRequest(json).then((response) => {
            try {
                let json = JSON.parse(response);
                if (json.success) {
                    let settingsString = JSON.stringify(json.settings);
                    loadSettings(settingsString);
                    if(json.settings['auto_update']) {
                        hideSidebar();
                    }
                } else {
                    showToast(ERROR_CHAR + json.errorMessage);
                }
            } catch (e) {
                showToast("Failed to load response: " + e);
                return false;
            }
        });
    }
}

function isUserLoggedIn() {
    if (loggedIn != null)  {
        return Promise.resolve(loggedIn);
    } else {
        let request = {
            "type": REQUEST_TYPE_IS_LOGGED_IN
        };
        let json = JSON.stringify(request);
        return sendRequest(json).then((response) => {
            try {
                let json = JSON.parse(response);
                if (json.success) {
                    loggedIn = json.loggedIn;
                    return json.loggedIn;
                } else {
                    return Promise.reject(ERROR_CHAR + json.errorMessage);
                }
            } catch (e) {
                return Promise.reject("Failed to load response: " + e);
            }
        });
    }
}

function getTreeName() {
    if (treeName != null)  {
        return Promise.resolve(treeName);
    } else {
        let request = {
            "type": REQUEST_TYPE_GET_TREE_NAME
        };
        let json = JSON.stringify(request);
        return sendRequest(json).then((response) => {
            try {
                let json = JSON.parse(response);
                if (json.success) {
                    treeName = json.treeName.replace(/[^a-zA-Z0-9_]/g, ""); // Only allow characters that play nice
                    return treeName;
                } else {
                    return Promise.reject(ERROR_CHAR + json.errorMessage);
                }
            } catch (e) {
                return Promise.reject("Failed to load response: " + e);
            }
        });
    }
}

function saveSettingsClient(id) {
    return Promise.all([saveSettingsServer(true), getTreeName()])
        .then(([, treeNameLocal]) => {
            return getSettings(ID_MAIN_SETTINGS).then((settings_json_string) => [settings_json_string,treeNameLocal]);
        })
        .then(([settings_json_string, treeNameLocal]) => {
            try {
                JSON.parse(settings_json_string);
            } catch (e) {
                return Promise.reject("Invalid JSON 2");
            }
            localStorage.setItem("GVE_Settings_" + treeNameLocal + "_" + id, settings_json_string);
            return Promise.resolve();
        });
}

function getIdLocal() {
    return getTreeName().then((treeName) => {
        let next_id;
        let settings_list = localStorage.getItem(SETTINGS_ID_LIST_NAME + "_" + treeName);
        if (settings_list) {
            settings_list = localStorage.getItem(SETTINGS_ID_LIST_NAME + "_" + treeName);
            let ids = settings_list.split(',');
            let last_id = ids[ids.length - 1];
            next_id = (parseInt(last_id, 36) + 1).toString(36);
            settings_list = ids.join(',') + ',' + next_id;
        } else {
            next_id = "0";
            settings_list = next_id;
        }

        localStorage.setItem(SETTINGS_ID_LIST_NAME + "_" + treeName, settings_list);
        return next_id;
    });
}

function deleteIdLocal(id) {
    getTreeName().then((treeName) => {
        let settings_list;
        if (localStorage.getItem(SETTINGS_ID_LIST_NAME + "_" + treeName) != null) {
            settings_list = localStorage.getItem(SETTINGS_ID_LIST_NAME + "_" + treeName);
            settings_list = settings_list.split(',').filter(item => item !== id).join(',')
            localStorage.setItem(SETTINGS_ID_LIST_NAME + "_" + treeName, settings_list);
        }
    });
}

function setSavedDiagramsPanel() {
    const checkbox = document.getElementById('show_diagram_panel');
    const el = document.getElementById('saved_diagrams_panel');
    showHide(el, checkbox.checked);
}

// From https://stackoverflow.com/questions/51805395/navigator-clipboard-is-undefined
function copyToClipboard(textToCopy) {
    // navigator clipboard api needs a secure context (https)
    if (navigator.clipboard && window.isSecureContext) {
        // navigator clipboard api method'
        return navigator.clipboard.writeText(textToCopy);
    } else {
        // text area method
        let textArea = document.createElement("textarea");
        textArea.value = textToCopy;
        // make the textarea out of viewport
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        return new Promise((res, rej) => {
            // here the magic happens
            document.execCommand('copy') ? res() : rej();
            textArea.remove();
        });
    }
}

function toggleHighlightCheckbox(e) {
    let xref = e.target.getAttribute('data-xref');
    if (e.target.checked) {
        removeFromXrefList(xref, 'no_highlight_xref_list');
    } else {
        addToXrefList(xref, 'no_highlight_xref_list');
    }
    handleFormChange();
}

function addToXrefList(value, listElName) {
    let xrefExcludeEl = document.getElementById(listElName);
    let xrefExcludeList = xrefExcludeEl.value;
    if (xrefExcludeList === "") {
        xrefExcludeEl.value = value;
    } else {
        let xrefExcludeArray = xrefExcludeEl.value.split(',');
        if (!xrefExcludeArray.includes(value)) {
            xrefExcludeArray[xrefExcludeArray.length] = value;
            xrefExcludeEl.value = xrefExcludeArray.join(',');
        }
    }
}
function removeFromXrefList(value, listElName) {
    let xrefExcludeEl = document.getElementById(listElName);
    let xrefExcludeArray = xrefExcludeEl.value.split(',');
    if (xrefExcludeArray.includes(value)) {
        const index = xrefExcludeArray.indexOf(value);
        xrefExcludeArray.splice(index, 1);
        xrefExcludeEl.value = xrefExcludeArray.join(',');
    }
}


function toggleHighlightStartPersons(enable) {
    if (enable) {
        let list = document.getElementById('highlight_list');
        let xrefList = document.getElementById('xref_list');
        let xrefExcludeArray = document.getElementById('no_highlight_xref_list').value.split(',');
        list.innerHTML = '';
        let xrefs = xrefList.value.split(',');
        for (let i=0; i<xrefs.length; i++) {
            if (xrefs[i].trim() !== "") {
                const xrefItem = document.createElement('div');
                const checkboxEl = document.createElement('input');
                checkboxEl.setAttribute('id', 'highlight_check' + i);
                checkboxEl.setAttribute('class', 'highlight_check');
                checkboxEl.setAttribute('type', 'checkbox');
                checkboxEl.setAttribute('data-xref', xrefs[i]);
                if (!xrefExcludeArray.includes(xrefs[i])) {
                    checkboxEl.checked = true;
                }
                checkboxEl.addEventListener("click", toggleHighlightCheckbox);
                xrefItem.appendChild(checkboxEl);
                const indiItem = document.getElementById('indi_list')
                    .querySelector('.indi_list_item[data-xref="' + xrefs[i] + '"]');
                let indiName = "";
                if (indiItem != null) {
                    indiName = indiItem.getElementsByClassName("NAME")[0].innerText;
                }
                const labelEl = document.createElement('label');
                labelEl.setAttribute('class', 'highlight_check_label');
                labelEl.setAttribute('for', 'highlight_check' + i);
                labelEl.innerHTML = indiName + " (" + xrefs[i] + ")";
                xrefItem.appendChild(labelEl);
                list.appendChild(xrefItem);
            }
        }
    }
    showHide(document.getElementById('startcol_option'),enable);
}

function setSvgImageClipPath(element, clipPath) {
    // Circle photo
    const imageElements = element.getElementsByTagName("image");
    for (let i = 0; i < imageElements.length; i++) {
        imageElements[i].setAttribute("clip-path", clipPath);
        imageElements[i].removeAttribute("width");
    }
}

// Tidies SVG before embedding in page
function cleanSVG(element) {
    const SHAPE_OVAL = '10';
    const SHAPE_CIRCLE = '20';
    const SHAPE_SQUARE = '30';
    const SHAPE_ROUNDED_RECT = '40';
    const SHAPE_ROUNDED_SQUARE = '50';
    switch(document.getElementById('photo_shape').value) {
        case SHAPE_OVAL:
            setSvgImageClipPath(element, "inset(0% round 50%)");
            break;
        case SHAPE_CIRCLE:
            setSvgImageClipPath(element, "circle(50%)");
            break;
        case SHAPE_SQUARE:
            setSvgImageClipPath(element, "inset(5%)");
            break;
        case SHAPE_ROUNDED_RECT:
            setSvgImageClipPath(element, "inset(0% round 25%)");
            break;
        case SHAPE_ROUNDED_SQUARE:
            setSvgImageClipPath(element, "inset(0% round 25%)");
            break;
    }

    // remove title tags, so we don't get weird data on hover,
    // instead this defaults to the XREF of the record
    const a = element.getElementsByTagName("a");
    for (let i = 0; i < a.length; i++) {
        a[i].removeAttribute("xlink:title");
    }
    //half of bug fix for photos not showing in browser - we change & to %26 in functions_dot.php
    element.innerHTML = element.innerHTML.replaceAll("%26", "&amp;");
    // Don't show anything when hovering on blank space
    element.innerHTML = element.innerHTML.replaceAll("<title>WT_Graph</title>", "");
    // Set SVG viewBox to height/width so image is not cut off
    element.setAttribute("viewBox", "0 0 " + element.getAttribute("width").replace("pt", "") + " " + element.getAttribute("height").replace("pt", ""));
}

function diagramSearchBoxChange(e) {
    let xref = document.getElementById('diagram_search_box').value.trim();
    // Skip the first trigger, only fire for the follow-up trigger when the XREF is set
    if (xref !== ""){
        if (!scrollToRecord(xref)) {
            showToast(TRANSLATE['Individual not found']);
        }
        clearIndiSelect('diagram_search_box');
        showHideSearchBox(e, false);
    }
}

function createXrefListFromSvg() {
    xrefList = [];
    const rendering = document.getElementById('rendering');
    const svg = rendering.getElementsByTagName('svg')[0].cloneNode(true);
    let titles = svg.getElementsByTagName('title');
    for (let i=0; i<titles.length; i++) {
        let xrefs = titles[i].innerHTML.split("_");
        for (let j = 0; j < xrefs.length; j++) {
            // Ignore the arrows that go between records
            if (!xrefs[j].includes("&gt;")) {
                xrefList.push(xrefs[j]);
            }
        }
    }
}

//
function showHideSearchBox(event, visible = null) {
    const el = document.getElementById('diagram_search_box_container');
    // If toggling, set to the opposite of current state
    if (visible === null) {
        visible = el.style.display === "none";
    }
    showHide(el, visible);
    if (visible) {
        // Remove blank section from search box
        tidyTomSelect();
        // Give search box focus
        let dropdown = document.getElementById('diagram_search_box');
        if (typeof dropdown.tomselect !== 'undefined') {
            dropdown.tomselect.focus();
        }
    }
}

// In a tomselect, the option chosen goes into a box that is initially blank. For the search box,
// this blank space is never used (as the selected option is not filled to the box). This function
// removes this to give a cleaner search box.
function tidyTomSelect() {
    let searchContainer = document.getElementById('diagram_search_box_container');
    let control = document.getElementById('diagram_search_box-ts-control');

    if (control !== null) {
        control.remove();
    }
    let tomWrappers = searchContainer.getElementsByClassName('ts-wrapper');
    if (tomWrappers.length > 0) {
        Array.from(tomWrappers).forEach((wrapper) => {
            wrapper.className = "";
        })
    }
}
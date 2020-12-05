(function () {
    function addLink(el) {
        el.innerHTML = "<a href=\"#" + el.id + "\">" + el.innerText + "</a>";
    }

    function searchForHeaders(header) {
        document.querySelectorAll(header).forEach(addLink);
    }

    ["h2", "h3", "h4", "h5"].forEach(searchForHeaders);
})();
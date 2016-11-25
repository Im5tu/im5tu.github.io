(function (_site) {

    _site.log = function (text) {
        if (!text || text.length === 0)
            return;

        console.log(text);
    }

    _site.listenFor = function (eventName, callback, target) {
        if (!eventName || eventName.length == 0)
            return;

        if (!callback)
            return;

        if(!target)
            target = window;

        if (target.addEventListener)
            target.addEventListener(eventName, callback, false);
        else if (target.attachEvent) {
            var en = eventName;
            if (en.indexOf("on") !== 0)
                en = "on" + en;

            target.attachEvent(en, callback);
        }
        else
            _site.log("Cannot attach onto event: " + eventName);
    };

    _site.onNextAnimation = function (callback) {
        if (window.requestAnimationFrame)
            window.requestAnimationFrame(callback);
        else
            callback();
    };

    _site.init = function (callback) {
        _site.listenFor("load", function () {
            if (callback)
                callback();
        });
    };

    if(window.location.hash && window.location.hash.indexOf("#debug") === 0)
        _site.debug = true;
})(window.site || (window.site = {}));

window.site.init(function () {
    window.site.listenFor("click", function(e) {
        window.onNextAnimation(function () {
            window.scroll(0, 0);
        });
        e.preventDefault();
    }, document.getElementById("#pageFooter-scroll-link"));

    var renderableTimeElements = [], timePortions = document.getElementsByClassName("article-header-time");
    for (var i = 0; i < timePortions.length; i++) {
        var timeElement = timePortions[i];
        if (timeElement.attributes && timeElement.attributes.datetime)
            renderableTimeElements.push(timeElement);
    }

    function updateRenderableTimes() {
        for (var i = 0; i < renderableTimeElements.length; i++) {
            var time = renderableTimeElements[i],
                newTime = window.site.time.humanize(time.attributes.datetime.value);
            if (time.innerHtml !== newTime)
                time.innerHTML = newTime;
        }
    }
    var timeUpdateFunction = (window.site.debug ? window.site.every.second : window.site.every.minute),
        timeUpdater = timeUpdateFunction(updateRenderableTimes);

    updateRenderableTimes();
});
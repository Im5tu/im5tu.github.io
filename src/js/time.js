(function (_site) {
    (function (_time) {
        function humanizer(date) {
            if(!date)
                return;
                
            // TODO :: Localise etc
            if (typeof date !== 'object') {
                date = new Date(date);
            }

            var seconds = Math.floor((new Date() - date) / 1000),
                intervalType,
                interval = Math.floor(seconds / 31536000);

            if (interval >= 1) {
                intervalType = 'year';
            } else {
                interval = Math.floor(seconds / 2592000);
                if (interval >= 1) {
                    intervalType = 'month';
                } else {
                    interval = Math.floor(seconds / 86400);
                    if (interval >= 1) {
                        intervalType = 'day';
                    } else {
                        interval = Math.floor(seconds / 3600);
                        if (interval >= 1) {
                            intervalType = "hour";
                        } else {
                            interval = Math.floor(seconds / 60);
                            if (interval >= 1) {
                                intervalType = "minute";
                            } else {
                                return "Less than a minute ago";
                            }
                        }
                    }
                }
            }

            if (interval > 1 || interval === 0) {
                intervalType += 's';
            }

            return interval + ' ' + intervalType + " ago";
        }

        _time.humanize = humanizer;
    })(_site.time || (_site.time = {}));

    (function (_every) {
        _every.registeredIntervals = [];

        function interval(duration, callback) {
            if (!duration || duration <= 0 || !callback)
                return;

            var intervalId = window.setInterval(callback, duration);
            _every.registeredIntervals.push({
                id: intervalId,
                duration: duration,
                callback: callback
            });
            return intervalId;
        }

        _every.second = function (callback) {
            return interval(1000, callback);
        };
        _every.seconds = function (callback, duration) {
            return interval(duration * 1000, callback);
        };
        _every.minute = function (callback) {
            return interval(60000, callback);
        };
        _every.minutes = function (callback, duration) {
            return interval(duration * 60000, callback);
        };

        _every.clear = function (intervalId) {
            for (var i = 0; i < _every.registeredIntervals.length; i++) {
                var interval = _every.registeredIntervals[i];
                if (interval.id === intervalId) {
                    _every.registeredIntervals.splice(i, 1)
                    window.clearInterval(intervalId);
                    return;
                }
            }
        };
        _every.clearAll = function () {
            while(_every.registeredIntervals.length > 0)
                window.clearInterval(_every.registeredIntervals.pop().id);
        }

        _every.interval = interval;
    })(_site.every || (_site.every = {}));
})(window.site || (window.site = {})); 
// Inspired by https://www.dannyguo.com/blog/how-to-add-copy-to-clipboard-buttons-to-code-blocks-in-hugo/
(function() {
    function addCopyButtons(clipboard) {
        document.querySelectorAll("code").forEach(function (el) {
            if (el.className.indexOf('language-') >= 0)
            {
                var button = document.createElement('button');
                button.className = 'copy-code-button';
                button.type = 'button';
                button.innerText = 'Copy';

                button.addEventListener('click', function () {
                    clipboard.writeText(el.innerText).then(function () {
                        /* Chrome doesn't seem to blur automatically,
                           leaving the button in a focused state. */
                        button.blur();
                        button.innerText = 'Copied!';      
                        setTimeout(function () {
                            button.innerText = 'Copy';
                        }, 2000);
                    }, function (error) {
                        button.innerText = 'Error';
                    });
                });

                var pre = el.parentNode;
                pre.insertBefore(button, el);
            }
        });
    }

    if (navigator.clipboard) {
        addCopyButtons(navigator.clipboard);
    } else {
        var script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/clipboard-polyfill/2.7.0/clipboard-polyfill.promise.js';
        script.integrity = 'sha256-waClS2re9NUbXRsryKoof+F9qc1gjjIhc2eT7ZbIv94=';
        script.crossOrigin = 'anonymous';
        script.onload = function() {
            addCopyButtons(clipboard);
        };
    
        document.body.appendChild(script);
    }
})();
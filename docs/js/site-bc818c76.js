!function(){function n(t){document.querySelectorAll("code").forEach(function(n){var e;0<=n.className.indexOf("language-")&&((e=document.createElement("button")).className="copy-code-button",e.type="button",e.innerText="Copy",e.addEventListener("click",function(){t.writeText(n.innerText).then(function(){e.blur(),e.innerText="Copied!",setTimeout(function(){e.innerText="Copy"},2e3)},function(n){e.innerText="Error"})}),n.parentNode.insertBefore(e,n))})}var e;navigator.clipboard?n(navigator.clipboard):((e=document.createElement("script")).src="https://cdnjs.cloudflare.com/ajax/libs/clipboard-polyfill/2.7.0/clipboard-polyfill.promise.js",e.integrity="sha256-waClS2re9NUbXRsryKoof+F9qc1gjjIhc2eT7ZbIv94=",e.crossOrigin="anonymous",e.onload=function(){n(clipboard)},document.body.appendChild(e))}(),function(){function e(n){n.innerHTML='<a href="#'+n.id+'">'+n.innerText+"</a>"}["h2","h3","h4","h5"].forEach(function(n){document.querySelectorAll(n).forEach(e)})}(),function(i){i.log=function(n){n&&0!==n.length&&console.log(n)},i.listenFor=function(n,e,t){var o;n&&0!=n.length&&e&&((t=t||window).addEventListener?t.addEventListener(n,e,!1):t.attachEvent?(0!==(o=n).indexOf("on")&&(o="on"+o),t.attachEvent(o,e)):i.log("Cannot attach onto event: "+n))},i.onNextAnimation=function(n){window.requestAnimationFrame?window.requestAnimationFrame(n):n()},i.init=function(n){i.listenFor("load",function(){n&&n()})},window.location.hash&&0===window.location.hash.indexOf("#debug")&&(i.debug=!0)}(window.site||(window.site={})),window.site.init(),function(){var i=document.getElementById("sponsorMessage"),a=document.getElementById("sponsorLink");void 0!==a&&null!=i&&fetch("/data/sponsors.json").then(n=>n.json()).then(n=>{currentDate=new Date,startDate=new Date(currentDate.getFullYear(),0,1);var e=Math.floor((currentDate-startDate)/864e5),t=Math.ceil(e/7),e='This page is available to sponsor. <a href="/sponsorship">Click Here</a> for more details!',o="/sponsorship",n=n.find(n=>n.week==t);void 0!==n&&(e="<b>Sponsored by: </b>"+n.name+". "+n.message,o=n.url),a.href=o,i.innerHTML=e,i.classList.remove("hidden")})}();
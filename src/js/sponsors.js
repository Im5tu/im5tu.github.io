(function() {
    var sponsorMessageElement = document.getElementById("sponsorMessage");
    var sponsorLinkElement = document.getElementById("sponsorLink");

    if (sponsorLinkElement === undefined || sponsorMessageElement == undefined) {
        return;
    }

    // Fetch the sponsorship data
    fetch('/data/sponsors.json')
        .then((response) => response.json())
        .then((json) =>
        {
            // Current week number
            currentDate = new Date();
            startDate = new Date(currentDate.getFullYear(), 0, 1);
            var days = Math.floor((currentDate - startDate) / (24 * 60 * 60 * 1000));
            var weekNumber = Math.ceil(days / 7);

            //window.testJson = json;
            //console.log(json);

            var sponsorText = "This page is available to sponsor. <a href=\"/sponsorship\">Click Here</a> for more details!";
            var sponsorLink = "/sponsorship";

            var sponsor = json.find(x => x.week == weekNumber);
            if (sponsor !== undefined) {
                sponsorText = "<b>Sponsored by: </b>" + sponsor.name + ". " + sponsor.message;
                sponsorLink = sponsor.url;
                sponsorLinkElement.onclick = function() {
                    gtag('event', 'sponsor_view', {
                        "company": sponsor.name,
                        "url": sponsor.url
                    });
                    return true;
                }
            } else {
                sponsorLinkElement.onclick = function() {
                    gtag('event', 'sponsorship_view', {});
                    return true;
                }
            }

            sponsorLinkElement.href = sponsorLink;
            sponsorMessageElement.innerHTML = sponsorText;
            sponsorMessageElement.classList.remove("hidden");
        })
})();
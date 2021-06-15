// modules installed from npm -> request, xlsx, cheerio 
let req = require("request");
let ch = require("cheerio");
let obj = require("./match.js");
let Allmatch = require("./AllMatch");
let url = 'https://www.espncricinfo.com/series/ipl-2020-21-1210595';

req(url, cb);

function cb(error, response, data) {
    if (response.statusCode == 404) {
        console.log("Page not found");
    } else if (response.statusCode == 200) {
        parseHTML(data);
    } else {
        console.log(err);
    }
}

function parseHTML(data) {
    let fTool = ch.load(data);
    let AllMatchPageUrlElem = fTool('a[data-hover="View All Results"]');
    let url = AllMatchPageUrlElem.attr("href");
    let fullUrl = "https://www.espncricinfo.com" + url;
    Allmatch.getScoreCardUrl(fullUrl);
}
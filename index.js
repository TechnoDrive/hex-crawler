const Crawler = require("crawler");
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

const adapter = new FileSync('pages.json')
const db = low(adapter)

var c = new Crawler({
    maxConnections: 10,
    // This will be called for each crawled page
    callback: function (error, res, done) {
        if (error) {
            console.log(error);
        } else {
            var $ = res.$;
            // $ is Cheerio by default
            // a lean implementation of core jQuery designed specifically for the server

            var links = $("a");
            links.each((i, link) => {
                if ($(link).attr("href") && $(link).attr("href").indexOf('#') < 0) {
                    db.get('links')
                        .push({
                            title: $("title").text(),
                            link: $(link).attr("href")
                        })
                        .write();
                    console.log("Anchor: " + $(link).attr("href"));
                } else {
                    console.log("ID Anchor: " + $(link).attr("href"));
                }

            });


        }
        done();
    }
});

var pages = require('./pages.json');

function refreshPages() {
    pages = require('./pages.json');
}

setInterval(() => {
    let links = db.get('links').map('link').value();
    c.queue(links);
    refreshPages();
}, pages.links.length);


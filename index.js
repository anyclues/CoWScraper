const { Scraper } = require("./lib/core");
let scraper = new Scraper(process.env.NICKNAME, process.env.PASSWORD);
const express = require("express");
const app = express();
const queue = require("fastq")(worker, 5);
const NodeCache = require("node-cache");
const cache = new NodeCache( { stdTTL: 100, checkperiod: 120 } );

async function worker(username, cb) {
    try {
        let stats = await scraper.getStatsByNickname(username)
        cb(null, stats)
    } catch (error) {
        cb(null, error.toString())
    }
}

(async () => {
    await scraper.connect();
    app.get("/v1/getstats/:username", async (req, res) => {
        let username = req.params.username

        let cacheInfo = await cache.get(username)
        if(cacheInfo) {
            res.send(cacheInfo)
        } else {
            queue.push(username, (err, result) => {
                cache.set(username, result)
                res.send(result)
            })
        }

    })
})();

app.listen(3005)
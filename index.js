const express = require('express');
const request = require('request');
const app = express();
const fs = require('fs');

const gistbase = "https://prod-api-cached-2.viewlift.com/content/pages?site=aha-tv&includeContent=true&moduleOffset=0&moduleLimit=5&languageCode=default&countryCode=IN&path=";
const moviebase = "https://prod-api.viewlift.com/entitlement/video/status?deviceType=web_browser&contentConsumption=web&id=";

app.get('/', (req, res) => {
    res.send(`Server is Running`)
})

app.get('/movie', (req, res) => {
    let query = req.query.query;
    var moviepath = query.replace("https://www.aha.video", "");
    var options = {
        'method': 'GET',
        'url': gistbase + moviepath
    };
    request(options, function(error, response) {
        if (error) {
            console.log("Something error happened")
        } else {
            fs.readFile('token.tuhin', (err, data) => {
                if (err) {
                    console.log("Error to import Token")
                } else {
                    var token = data;
                    var gistr = JSON.parse(response.body);
                    var gistid = gistr.modules[1].contentData[0].gist.id;

                    var request = require('request');
                    var options = {
                        'method': 'GET',
                        'url': moviebase + gistid,
                        'headers': {
                            'authorization': token
                        }
                    };
                    request(options, function(error, response) {
                        if (error) {
                            console.log("Something error happened")
                        } else {
                            var movied = JSON.parse(response.body);
                            var movietitle = movied.video.gist.title;
                            var imageurl = movied.video.gist.posterImageUrl;
                            var qone = movied.video.streamingInfo.videoAssets.mpeg[0].renditionValue;
                            var qonelink = movied.video.streamingInfo.videoAssets.mpeg[0].url;
                            var qtwo = movied.video.streamingInfo.videoAssets.mpeg[1].renditionValue;
                            var qtwolink = movied.video.streamingInfo.videoAssets.mpeg[1].url;
                            var qthree = movied.video.streamingInfo.videoAssets.mpeg[2].renditionValue;
                            var qthreelink = movied.video.streamingInfo.videoAssets.mpeg[2].url;
                            var slinks = movied.video.streamingInfo.videoAssets.hlsDetail.url;
                            res.send(`{"title":"` + movietitle + `","poster":"` + imageurl + `","download` + qone + `":"` + qonelink + `","download` + qtwo + `":"` + qtwolink + `","download` + qthree + `":"` + qthreelink + `","streaming_link":"` + slinks + `"}`)
                        };
                    });
                };
            });
        };
    });

    res.status(200);
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Content-Type', 'application/json');
    res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
})

app.listen(process.env.PORT || 3000, () => {
    console.log('Listening')
})

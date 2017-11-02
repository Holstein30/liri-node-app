var inquire = require("inquirer");
var request = require("request");
var fs = require("fs");
var Twitter = require("twitter");
var Spotify = require('node-spotify-api');
var twitData = require("./keys");
var consKey = twitData.consumer_key;
var consSecret = twitData.consumer_secret;
var accessToken = twitData.access_token_key;
var accessSecret = twitData.access_token_secret;

inquire.prompt([{
    type: "list",
    message: "Choose An Action",
    choices: ["my-tweets", "spotify-this-song", "movie-this", "do-what-it-says"],
    name: "action"
}]).then(function (answers) {
    var action = answers.action;
    chooseAction(action);
});


function chooseAction(action, variable) {
    console.log(action);
    console.log(variable);
    switch (action) {
        case "my-tweets":
            console.log("twitter");
            //twitter
            twitterFunc();
            break;

        case "spotify-this-song":
            console.log("spotify");
            //spotify
            if (variable === undefined) {
                inquire.prompt([{
                    type: "input",
                    message: "Enter a song: ",
                    name: "track"
                }]).then(function (answers) {
                    if (answers.track === "") {
                        var track = "The Sign";
                    } else {
                        var track = answers.track;
                    }
                    console.log(track);
                    spotifyFunc(track);
                });
            } else {
                spotifyFunc(variable);
            }
            break;

        case "movie-this":
            console.log("OMDB");
            //omdb
            if (variable === undefined) {
                inquire.prompt([{
                    type: "input",
                    message: "Enter a movie: ",
                    name: "movie"
                }]).then(function (answers) {
                    console.log(answers);
                    if (answers.movie === "") {
                        var movie = "Mr. Nobody";
                    } else {
                        var movie = answers.movie;
                    }
                    omdbFunc(movie);
                });
            } else {
                omdbFunc(variable);
            }
            break;

        case "do-what-it-says":
            console.log("fs");
            fsFunc();
            break;
    }
}

function twitterFunc() {
    var client = new Twitter({
        consumer_key: consKey,
        consumer_secret: consSecret,
        access_token_key: accessToken,
        access_token_secret: accessSecret
    });

    var params = {
        screen_name: 'Node_You_Dont'
    };
    client.get('statuses/user_timeline', params, function (error, tweets, response) {
        if (!error) {
            for (var i in tweets) {
                console.log("Tweet: " + tweets[i].text + " | " + "Time: " + tweets[i].created_at);
                logResults(tweets[i].text, tweets[i].created_at);

            }
        } else {
            console.log(error);
        }
    });
}

function spotifyFunc(track) {
    var spotify = new Spotify({
        id: '89edad3950ef4c02baa944c070fd296a',
        secret: 'cdb95663536c4814a8dcc8a9ff993d28'
    });

    spotify.search({
        type: 'track',
        query: track,
        limit: 1
    }, function (err, data) {
        if (err) {
            return console.log('Error occurred: ' + err);
        }
        console.log("Artist: " + data.tracks.items[0].album.artists[0].name);
        console.log("Album: " + data.tracks.items[0].album.name);
        console.log("Track: " + data.tracks.items[0].name);
        console.log("Preview URL: " + data.tracks.items[0].external_urls.spotify);
        logResults(data.tracks.items[0].album.artists[0].name, data.tracks.items[0].name);
    });
}

function omdbFunc(movie) {

    var queryUrl = "http://www.omdbapi.com/?t=" + movie + "&y=&plot=short&apikey=40e9cece";

    request(queryUrl, function (error, response, body) {

        if (!error && response.statusCode === 200) {

            console.log("Title: " + JSON.parse(body).Title);
            console.log("Release Year: " + JSON.parse(body).Year);
            console.log("IMDB Rating: " + JSON.parse(body).imdbRating);
            console.log("Rotten Tomatoes Rating: " + JSON.parse(body).Ratings[1].Value);
            console.log("Language: " + JSON.parse(body).Language);
            console.log("Plot: " + JSON.parse(body).Plot);
            console.log("Actors: " + JSON.parse(body).Actors);

            logResults(JSON.parse(body).Title, JSON.parse(body).Actors);
        }
    });

}

function fsFunc() {

    var dataArr = [];

    fs.readFile("random.txt", "utf8", function (error, data) {

        if (error) {
            return console.log(error);
        }



        var dataArr = data.split(",");

        var action = dataArr[0];
        var variable = dataArr[1];

        chooseAction(action, variable);

    });
}

function logResults(result1, result2) {
    fs.appendFile("log.txt", "\n" + result1 + " | " + result2, function (err) {

        if (err) {
            return console.log(err);
        }


        console.log("log.txt was updated!");

    });
}

// -----Known Bugs -----
// When user doesn't input a song name it sets track to The Sign but it returns the wrong song
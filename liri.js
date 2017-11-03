// Node require modules

var inquire = require("inquirer");
var request = require("request");
var fs = require("fs");
var Twitter = require("twitter");
var Spotify = require('node-spotify-api');
var twitData = require("./keys");

// Import twitter keys 

var consKey = twitData.consumer_key;
var consSecret = twitData.consumer_secret;
var accessToken = twitData.access_token_key;
var accessSecret = twitData.access_token_secret;

// Prompt user to choose action & pass to chooseAction function

inquire.prompt([{
    type: "list",
    message: "Choose An Action",
    choices: ["my-tweets", "spotify-this-song", "movie-this", "do-what-it-says"],
    name: "action"
}]).then(function (answers) {
    var action = answers.action;
    chooseAction(action);
});

// Decide action to take

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
            // Check if a track was already passed in - if not prompt for one and pass to spotify function
            if (variable === undefined) {
                inquire.prompt([{
                    type: "input",
                    message: "Enter a song: ",
                    name: "track"
                }]).then(function (answers) {
                    // Assign a song if user doesn't enter one
                    if (answers.track === "") {
                        var track = "The Sign";
                    } else {
                        var track = answers.track;
                    }
                    console.log(track);
                    spotifyFunc(track);
                });
            } else {
                // If track already passed in then pass it to spotify function
                spotifyFunc(variable);
            }
            break;

        case "movie-this":
            console.log("OMDB");
            //omdb
            // Check if a movie was already passed in - if not prompt for one and pass to omdb function
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
                // If movie already passed in then pass it to omdb function
                omdbFunc(variable);
            }
            break;

        case "do-what-it-says":
            console.log("fs");
            fsFunc();
            break;
    }
}

// Twitter function

function twitterFunc() {

    // Twitter keys

    var client = new Twitter({
        consumer_key: consKey,
        consumer_secret: consSecret,
        access_token_key: accessToken,
        access_token_secret: accessSecret
    });

    // Twitter account name

    var params = {
        screen_name: 'Node_You_Dont'
    };
    // Grab users tweets - log them - display them in console
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

// Spotify function

function spotifyFunc(track) {

    // Spotify keys

    var spotify = new Spotify({
        id: '89edad3950ef4c02baa944c070fd296a',
        secret: 'cdb95663536c4814a8dcc8a9ff993d28'
    });

    // Search spotify for track - display info - log info

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

// OMDB function

function omdbFunc(movie) {

    // Search URL

    var queryUrl = "http://www.omdbapi.com/?t=" + movie + "&y=&plot=short&apikey=40e9cece";

    // Search movie title - display info - log info 

    request(queryUrl, function (error, response, body) {

        if (!error && response.statusCode === 200) {

            console.log("Title: " + JSON.parse(body).Title);
            console.log("Release Year: " + JSON.parse(body).Year);
            console.log("IMDB Rating: " + JSON.parse(body).imdbRating);
            console.log("Rotten Tomatoes Rating: " + JSON.parse(body).Ratings[1].Value);
            console.log("Country: " + JSON.parse(body).Country);
            console.log("Language: " + JSON.parse(body).Language);
            console.log("Plot: " + JSON.parse(body).Plot);
            console.log("Actors: " + JSON.parse(body).Actors);

            logResults(JSON.parse(body).Title, JSON.parse(body).Actors);
        }
    });

}

// Do What it Says Function 

function fsFunc() {

    // Create empty array

    var dataArr = [];

    // Read data in random.txt

    fs.readFile("random.txt", "utf8", function (error, data) {

        if (error) {
            return console.log(error);
        }

        var dataArr = data.split(",");

        // Set variables to pass into chooseAction function

        var action = dataArr[0];
        var variable = dataArr[1];

        chooseAction(action, variable);

    });
}

// Log results function

function logResults(result1, result2) {
    // Append variables passed into function onto log.txt file
    fs.appendFile("log.txt", "\n" + result1 + " | " + result2, function (err) {

        if (err) {
            return console.log(err);
        }

        // Log that file was updated
        console.log("log.txt was updated!");

    });
}

// -----Known Bugs -----
// When user doesn't input a song name it sets track to The Sign but it returns the wrong song
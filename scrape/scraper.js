#!/usr/bin/env node

var request = require('request');
var fs = require('fs');
//var sqlite  = require('sqlite');

var page_template = "http://people.southwestern.edu/~prevots/songs/?p=";
var main_page = page_template + "62";

var song_pages = [];

request(main_page, function(error, response, body) {
    var re = /\n<p><a href="http:\/\/www.southwestern.edu\/~prevots\/songs\/\?p=(\d+)">/g;
    var match;
    while (null !== (match = re.exec(body))) {
        //var num = parseInt(match[1]);
        var num = match[1];
        if (num === "62") {
            continue;
        }
        song_pages.push(num);
    }
    console.log(song_pages.sort());

    process.nextTick(get_next_page);
});

var song_names = [];

var counter = 0;
//var song_template = "http://lux.llc.southwestern.edu/~prevots/Songs/baleine.mp3"
var song_re = /FlashVars=u=ap&#038;f=([^\s>]+)/g;
function get_next_page() {
    if (song_pages.length === 0) {
        process.nextTick(download_song);
    }
    var page_num = song_pages.shift();
    var num_matches = 0;
    request(page_template + page_num, function(error, response, body) {
        var match;
        while (null !== (match = song_re.exec(body))) {
            song_names.push(match[1]);
            num_matches++;
        }
        if (num_matches === 0) {
            console.log('COULD NOT FIND A SONG ON PAGE "' + page_template + page_num + '"');
        }
        console.log(song_names);
        process.nextTick(get_next_page);
    });
};

var song_template = "http://lux.llc.southwestern.edu/~prevots/Songs/";
function download_song() {
    if (song_names.length === 0) {
        return;
    }
    var song_name = song_names.shift() + '.mp3';
    var song_url  = song_template + song_name;

    console.log("DOWNLOADING " + song_name + ", " + song_names.length + " songs remaining.");
    request(song_url).pipe(fs.createWriteStream("mp3/" + song_name));
}

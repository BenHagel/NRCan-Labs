var request = require('request');
var cheerio = require('cheerio');
const fs = require('fs');

var terms = '' + fs.readFileSync('../productnames.txt');
terms = terms.split('\n');

//Part 1
var firstLinks = [];
//Part 2
var imgLinks = [];

//Part 1
var url = 'https://www.bing.com/search?q=' + terms[0];

function saveImagesOnWebsite(url){
    console.log('LOADING IMAGES ON WEBSITE FOR: ' + url);
    request(url, function(err, resp, body){
        $ = cheerio.load(body);
        imgs = $('img'); //jquery get all images
        $(imgs).each(function(i, img){
            //if((''+$(img).attr('src')).substring(0,4)){
                if(imgLinks.length < 200){ imgLinks.push($(img).attr('src'));}
                else{console.log(JSON.stringify(imgLinks));process.exit(0);}
                //console.log($(img).attr('src'));
            //}
        });
    });
}

function loadStuff(){
    console.log('loading stuff.....');
    request(url, function(err, resp, body){
        $ = cheerio.load(body);
        links = $('a'); //jquery get all hyperlinks
        $(links).each(function(i, link){
            if((''+$(link).attr('href')).substring(0,4) === 'http'){
                //console.log($(link).attr('href'));
                console.log('---LINK SAVED');
                firstLinks.push($(link).attr('href'));
            }
        });

        for(var i = 0;i < firstLinks.length;i++){
            if(imgLinks.length < 200) saveImagesOnWebsite(firstLinks[i]);
            else process.exit(0);
        }

    });
}

loadStuff();

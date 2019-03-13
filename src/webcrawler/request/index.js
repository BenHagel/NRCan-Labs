var request = require('request');
var cheerio = require('cheerio');
const fs = require('fs');

var terms = '' + fs.readFileSync('../productnames.txt');
terms = terms.split('\n');

//Part 1
var firstLinks = [];
//Part 2
var imgLinks = [];

var startTime = Date.now();

//Part 1
var url = 'https://www.bing.com/search?q=' + terms[0];

//41.417 seconds

function saveImagesOnWebsite(linkIndex){
    if(linkIndex < firstLinks.length){
        console.log('LINK CHECK: ' + linkIndex + ' ' + firstLinks[linkIndex]);
        request(url, function(err, resp, body){
            $ = cheerio.load(body);
            imgs = $('img'); //jquery get all images
            $(imgs).each(function(i, img){
                imgLinks.push($(img).attr('src'));
            });
            linkIndex++;
            saveImagesOnWebsite(linkIndex);
        });
    }
    else{
        console.log('All DOne:--- ' + imgLinks.length);
        var endTime = Date.now() - startTime;
        endTime /= 1000;

        console.log('Time took: ' + endTime);

    }
}

function loadStuff(){
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
        saveImagesOnWebsite(0);
    });

    
    console.log('\tLOAD STUFF');
}

loadStuff();

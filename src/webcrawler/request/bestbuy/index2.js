/*
NRCAN - BEST BUY 2
search the text for ENERGY STAR HITS, from the URLS  oF w.e. 'TERMS' variabl eis.
*/

var request = require('request');
var cheerio = require('cheerio');
const fs = require('fs');
const csv = require('csv-parser');
var results = [];

var terms = '' + fs.readFileSync('../../output/bestbuy_deh_productlinks.txt');
terms = terms.split('\n');



var linkIndex = 0;
function loadStuff(url){
    request(url, function(err, resp, body){


        $ = cheerio.load(body);
        var links = $('#ctl00_CP_ctl00_PD_lblModelNumber');//'.tab-overview-item'); //jquery get all hyperlinks
        var overallText = '';
        $(links).each(function(i, link){
            overallText += ('' + $(link).text());
        });
        //console.log(overallText);

        var hit = false;
        for(var j = 0;j < results.length;j++){
            if(results[j]['Model Number'] === overallText){
                hit = true;
            }
        }
        console.log('hiiiit');


        linkIndex++;
        if(linkIndex < terms.length-1){
            loadStuff(terms[linkIndex]);
        }
        
        
    });

    
    //console.log('\tLOADed');
}







fs.createReadStream('../../../../ENERGY_STAR_Certified_Dehumidifiers.csv')
    .pipe(csv())
    .on('headers', (headers) => {
        //console.log('First header: ' + headers);
    })
    .on('data', (data) => results.push(data))
    .on('end', () => {
        //console.log('results: ' + results.length);
        //console.log(results[0]['Model Number']);



        loadStuff(terms[linkIndex]);



    });






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
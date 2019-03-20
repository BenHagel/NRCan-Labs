/*
NRCAN - BEST BUY 2
search the text for ENERGY STAR HITS, from the URLS 
*/

var request = require('request');
var cheerio = require('cheerio');
const fs = require('fs');

var terms = '' + fs.readFileSync('../output/bestbuy_productlinks.txt');
terms = terms.split('\n');

var linkIndex = 0;


function loadStuff(url){
    request(url, function(err, resp, body){
        /*
        if((''+body).includes('energy')){
            console.log('Energy seen');
        }
        */

        $ = cheerio.load(body);
        links = $('.tab-overview-item'); //jquery get all hyperlinks
        var overallText = '';
        $(links).each(function(i, link){
            overallText += ('' + $(link).text()).toLowerCase() + ' ';
        });

        if(overallText.includes('energy star') || overallText.includes('star certified') || overallText.includes('star qualified')){
            console.log('ernergu found @ ' + linkIndex);
            fs.appendFile('../output/bestbuy_products_w_hits.txt', url + '\n', function (err) {
                if (err) throw err;
                    console.log('Saved!');
                //console.log(overallText);
            });
        }
        else{
            console.log('negative at: ' + linkIndex);
        }

        //console.log(overallText);

        linkIndex++;
        if(linkIndex < terms.length-1){
            loadStuff(terms[linkIndex]);
        }
        
        
    });

    
    //console.log('\tLOADed');
}

loadStuff(terms[linkIndex]);









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
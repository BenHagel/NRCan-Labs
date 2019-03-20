/*
NRCAN
save all the img urls on a page, starting from product names searches into bing.
*/

var request = require('request');
var cheerio = require('cheerio');
const fs = require('fs');

var csvRaw = ''+ fs.readFileSync('../../../certified-light-bulbs-2019-03-14.csv');
csvRaw = csvRaw.split('\n');

var formatted = [];
for(var i = 0;i < csvRaw.length;i++){
    if(csvRaw[i].length > 20){
        formatted.push(csvRaw[i].split(','));
    }
}
console.log('formatted lines: ' + formatted.length);

//Set all to lower case
for(var i = 0;i < formatted.length;i++){
    for(var j = 0;j < formatted[i].length;j++){
        formatted[i][j] = formatted[i][j].toLowerCase();
    }
}

var terms = '' + fs.readFileSync('../output/bestbuy_products_w_hits.txt');
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
        links = $('.product-title');
        var overallText = '';
        $(links).each(function(i, link){
            overallText = ('' + $(link).text()).toLowerCase();
        });

        var hitFound = 0;

        for(var i = 0;i < formatted.length;i++){
            for(var j = 0;j < formatted[i].length;j++){
                if(formatted[i][j] === overallText){hitFound++;}//console.log('HIT at: ' + url); break;}
            }
        }

        /*
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
        */
        console.log(hitFound + ': ' + overallText);

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
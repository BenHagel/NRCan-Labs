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
//Just "dryer" search
//https://www.bestbuy.ca/en-ca/product/insignia-6-7-cu-ft-electric-dryer-ns-fdre67wh8a-c-white/10754269.aspx?icmp=Recos_3across_tp_sllng_prdcts

//Just energy star dryer
//https://www.bestbuy.ca/en-ca/product/samsung-samsung-7-5-cu-ft-electric-steam-dryer-dve45m5500p-platinum-dve45m5500p/10574455.aspx?
var url = 'https://www.bestbuy.ca/en-ca/product/insignia-6-7-cu-ft-electric-dryer-ns-fdre67wh8a-c-white/10754269.aspx?icmp=Recos_3across_tp_sllng_prdcts';

function loadStuff(){
    request(url, function(err, resp, body){

        if((''+body).includes('energy')){
            console.log('Energy seen');
        }
        /*
        $ = cheerio.load(body);
        links = $('a'); //jquery get all hyperlinks
        $(links).each(function(i, link){
            var targetLink = ('' + $(links).attr('href'));
            if(targetLink.includes('energy')){
                console.log('ernergu found @ ' + targetLink);
            }
            //if((''+$(link).attr('href')).substring(0,4) === 'http'){
                //console.log($(link).attr('href'));
                //console.log('---LINK SAVED\n' + (''+$(link).attr('href')));
                //firstLinks.push($(link).attr('href'));
            //}
        });
        //saveImagesOnWebsite(0);
        */
    });

    
    console.log('\tLOADed');
}

loadStuff();









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
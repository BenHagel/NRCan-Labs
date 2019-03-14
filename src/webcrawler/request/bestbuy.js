var request = require('request');
var cheerio = require('cheerio');
const fs = require('fs');

var terms = '' + fs.readFileSync('../productnames.txt');
terms = terms.split('\n');

//1. Look at the file name first, if they even contain 'energy' 'star' 'certified'
//2. alt tags on the images 

//Scale down the image to illegable format and then use that as the max

//Careful for going too fast - will be detected from 
//2. Look out for slower   queires

//TWITTER, FACEBOOK, use the api's to look at API's for 
//All less fluffy and low-fidelity 
//Look to book off time w Douglas


//Part 1
var productLinks = [];

//Part 1
var currentPage = 1;
const maxPages = 170;

var startTime = Date.now();

//Just search for first term
var baseURL = 'https://www.bestbuy.ca';
var pageURL = baseURL + '/en-CA/Search/SearchResults.aspx?type=product&page=1&sortBy=relevance&sortDir=desc&query=' + terms[1];
 //'https://www.bestbuy.ca/en-CA/Search/SearchResults.aspx?query=energy%20star%20dryer';

function grabLinksFrom(pageURL){
    request(pageURL, function(err, resp, body){
        //Gets all energy words
        if((''+body).includes('energy')){
            //console.log('Energy Seen');
        }
        //console.log(body);
        
        //Body 
        $ = cheerio.load(body);
        links = $('a'); //jquery get all hyperlinks
        $(links).each(function(i, link){
            var targetLink = ('' + $(link).attr('href'));
            var targetLinkParsed = targetLink.split('/', 4);  //  /en-ca/product/
            //console.log(targetLink);
            if(targetLinkParsed.length > 2){
                if(targetLinkParsed[1] === 'en-ca' && targetLinkParsed[2] === 'product'){
                    targetLink = baseURL + targetLink;
                    addLink(targetLink);
                }
            }
            if(targetLink.includes('energy')){
                //console.log('ernergu found @ ' + targetLink);
            }
            //if((''+$(link).attr('href')).substring(0,4) === 'http'){
                //console.log($(link).attr('href'));
                //console.log('---LINK SAVED\n' + (''+$(link).attr('href')));
                //firstLinks.push($(link).attr('href'));
            //}
        });
        console.log('Found: ' + productLinks.length + ' links\n');

        //Iterate pages
        if(currentPage < maxPages){
            var oldPageNum = '&page=' + currentPage;
            currentPage++;
            var newPageNum = '&page=' + currentPage;
            //Call new page
            var nextPageURL = pageURL.replace(oldPageNum, newPageNum);
            console.log(nextPageURL);
            grabLinksFrom(nextPageURL);
        }
        else{
            console.log('---FINISHED with:');
            console.log('\t' + productLinks.length + ' links');
            for(var j = 0;j < productLinks.length;j++){
                fs.appendFileSync('../output/bestbuy_productlinks.txt', productLinks[j] + '\n');

            }
        }
    });
    console.log('start');
}

grabLinksFrom(pageURL);

function addLink(newURL){
    for(var t = 0; t < productLinks.length;t++){
        if(newURL === productLinks[t]) return false;
    }
    productLinks.push(newURL);
    return true;
}






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
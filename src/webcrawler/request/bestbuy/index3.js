/*
NRCAN
save all the img urls on a page, starting from product names searches into bing.
*/

var request = require('request');
var cheerio = require('cheerio');
var levenshtein = require('fast-levenshtein');
const fs = require('fs');

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

function repAll(word, target, desired){
    //console.log(word);
    if(word.includes(target)){
        //console.log('before: ' + word);
        word = word.replace(target, desired);
        return repAll(word, target, desired);
    }
    else{
        return word;
    }
}

var csvRaw = ''+ fs.readFileSync('../../../../certified-light-bulbs-2019-03-14.csv');
csvRaw = csvRaw.split('\n');

var formatted = [];
for(var i = 0;i < csvRaw.length;i++){
    if(csvRaw[i].length > 20){
        csvRaw[i] = csvRaw[i].toLocaleLowerCase();
        csvRaw[i] = csvRaw[i].replaceAll(',', ' ');
        csvRaw[i] = csvRaw[i].replaceAll('"', ' ');
        csvRaw[i] = csvRaw[i].replaceAll('\t', '');
        csvRaw[i] = csvRaw[i].replaceAll('\n', '');
        csvRaw[i] = csvRaw[i].replaceAll('\r', '');
        csvRaw[i] = csvRaw[i].replace(/\s\s+/g, ' ');
        csvRaw[i] = csvRaw[i].trim();
        formatted.push(csvRaw[i].split(' '));
    }
}
//console.log('formatted lines: ' + formatted.length);
//console.log(formatted[1]);

//Set all to lower case
for(var i = 0;i < formatted.length;i++){
    for(var j = 0;j < formatted[i].length;j++){
        //formatted[i][j] = formatted[i][j].toLowerCase();
    }
}

var terms = '' + fs.readFileSync('../../output/bestbuy_products_w_hits.txt');
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

        //Useuless characters
        overallText = overallText.replaceAll(',', '');
        overallText = overallText.replaceAll('"', ' ');
        overallText = overallText.replaceAll('\t', '');
        overallText = overallText.replaceAll('\n', '');
        overallText = overallText.replaceAll('\r', '');
        overallText = overallText.replace(/\s\s+/g, ' ');
        overallText = overallText.trim();
        
        //Characters that taint the results
        overallText = repAll(overallText, '-', ' ');
        overallText = repAll(overallText, 'new!', ' ');
        overallText = repAll(overallText, '!', ' ');
        overallText = repAll(overallText, '(', ' ');
        overallText = repAll(overallText, ')', ' ');
        overallText = repAll(overallText, '/', ' ');
        overallText = overallText.replace(/\s\s+/g, ' ');
        overallText = overallText.trim();

        //console.log(overallText);
        var titleComponents = overallText.split(' ');
        var hitValues = [];

        for(var i = 0;i < formatted.length;i++){
            var hitFound = 0;
            for(var j = 0;j < formatted[i].length;j++){
                for(var x = 0;x < titleComponents.length;x++){
                    if(levenshtein.get(formatted[i][j], titleComponents[x]) < 2){hitFound++;}
                }
            }
            var perc = (0.0+hitFound) / (0.0+formatted[i].length);
            hitValues.push({'ind': i, 'match': perc});
        }

        hitValues.sort(function(a, b){return b.match-a.match});
        console.log('------------' + hitValues.length);
        if(linkIndex === 0) console.log(hitValues);

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
        //console.log(hitFound + ': ' + overallText);

        linkIndex++;
        if(linkIndex < terms.length-1){
            loadStuff(terms[linkIndex]);
        }
    });
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
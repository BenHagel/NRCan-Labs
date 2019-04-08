/*
NRCAN
save all the img urls on a page, starting from product names searches into bing.
*/

var request = require('request');
var cheerio = require('cheerio');
var levenshtein = require('fast-levenshtein');
const csv = require('csv-parser');
const fs = require('fs');

//Case Study URL
var productURL = 
    'https://www.homedepot.ca/product/philips-hue-white-and-colour-ambiance-a19-60w-equivalent-dimmable-led-smart-bulb-energy-star-/1001027903';



var db = [];
fs.createReadStream('../../../../product_databases/certified-light-bulbs-2019-03-14.csv')
    .pipe(csv())
    .on('headers', (headers) => {
        //console.log('First header: ' + headers);
    })
    .on('data', (data) => db.push(data))
    .on('end', () => {
        //console.log('db: ' + db.length);
        //console.log(db[0]);
        loadStuff(productURL);
    });




var extractES = function(body){
    var ind = body.indexOf('energy star');
    if(ind > -1){
        console.log(body.substring(ind, ind+35));
        body = body.replace('energy star', '');
        extractES(body);
    }
    else{
        console.log('Finished-----------');
    }
};



var linkIndex = 0;
function loadStuff(url){
    request({"url": url, "timeout": 2200}, function(err, resp, body){

        //Body loaded successfufully
        if(body){
            body = (''+body).toLowerCase();
            console.log('success extracting...')
            extractES(body);
            /*
            if((''+body).includes('energy')){
                console.log('Energy Seen!');
            }
            */
        }
        else{
            console.log('error trying again');
            loadStuff(productURL);
        }
        
        


        /*
        $ = cheerio.load(body);
        links = $('.product-title');
        var overallText = '';
        $(links).each(function(i, link){
            overallText = ('' + $(link).text()).toLowerCase();
        });
        */




        
        /*
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
        */



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
    });
}

/*
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
*/







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
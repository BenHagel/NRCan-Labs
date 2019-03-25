/*
NRCAN - BESTBUY 1
Scrape all the pages after a search
*/
//1. Look at the file name first, if they even contain 'energy' 'star' 'certified'
//2. alt tags on the images 

//Scale down the image to illegable format and then use that as the max

//Careful for going too fast - will be detected from 
//2. Look out for slower   queires

//TWITTER, FACEBOOK, use the api's to look at API's for 
//All less fluffy and low-fidelity 
//Look to book off time w Douglas


var BestBuy = {};

//Part 1
BestBuy.currentPage = 1;
BestBuy.maxPages = 50;

//Just search for first term
BestBuy.baseURL = 'https://www.bestbuy.ca';
BestBuy.pageURL = BestBuy.baseURL + '/en-CA/Search/SearchResults.aspx?type=product&page=1&sortBy=relevance&sortDir=desc&query=';

BestBuy.startSearching = function(searchTerm){
    var urlStart = BestBuy.pageURL + searchTerm;
    processInProgress = true;
    BestBuy.currentPage = 1;
    BestBuy.maxPages = 150;
    linksToProducts = [];
    //console.log(urlStart);
    BestBuy.grabLinksFrom(urlStart);
};

BestBuy.grabLinksFrom = function(pageURL){
    request(pageURL, function(err, resp, body){
        //Body 
        $ = cheerio.load(body);
        links = $('a');
        $(links).each(function(i, link){
            var targetLink = ('' + $(link).attr('href'));
            var targetLinkParsed = targetLink.split('/', 4);  //  /en-ca/product/
            //console.log(targetLink);
            if(targetLinkParsed.length > 2){
                if(targetLinkParsed[1] === 'en-ca' && targetLinkParsed[2] === 'product'){
                    targetLink = BestBuy.baseURL + targetLink;
                    BestBuy.addLink(targetLink);
                }
            }
            //if((''+$(link).attr('href')).substring(0,4) === 'http'){
                //console.log($(link).attr('href'));
                //console.log('---LINK SAVED\n' + (''+$(link).attr('href')));
                //firstLinks.push($(link).attr('href'));
            //}
        });

        //Iterate pages
        if(BestBuy.currentPage < BestBuy.maxPages && processInProgress === true){
            var oldPageNum = '&page=' + BestBuy.currentPage;
            BestBuy.currentPage++;
            var newPageNum = '&page=' + BestBuy.currentPage;
            //Call new page
            var nextPageURL = pageURL.replace(oldPageNum, newPageNum);
            //console.log(nextPageURL);
            //console.log(nextPageURL);
            BestBuy.grabLinksFrom(nextPageURL);
        }
        else{
            //console.log('---FINISHED with:');
            //console.log('\t' + productLinks.length + ' links');
            for(var j = 0;j < linksToProducts.length;j++){
                fs.appendFileSync('../output/bestbuy_productlinks.txt', linksToProducts[j] + '\n');
            }
            processInProgress = false;
        }
    });
};

BestBuy.addLink = function(newURL){
    for(var t = 0; t < linksToProducts.length;t++){
        if(newURL === linksToProducts[t]) return false;
    }
    linksToProducts.push(newURL);
    return true;
};

BestBuy.compareToDatabase = function(url, res){
    request(url, function(err, resp, body){
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

        //console.log(hitValues[0]);
        for(var u = 0;u < hitValues.length;u++){
            hitValues[u].words = formatted[hitValues[u].ind];
        }
        
        var returnVal = {};
        returnVal.url = url;
        returnVal.title = overallText;
        returnVal.hits = hitValues.slice(0, 15);

        res.json(returnVal);
    });
};



//extractAllDescFromProducts(productsLeft);
function extractAllDescFromProducts(linkIndex){
    request(terms[linkIndex], function(err, resp, body){
        $ = cheerio.load(body);
        descs = $('.tab-overview-item');
        console.log('descs length: ' + descs.length);

        var internalDesc = '';
        $(descs).each(function(i, desc){
            internalDesc += '' + descs.text() + '\n';
        });

        internalDesc = internalDesc.toLowerCase();

        if(internalDesc.includes('star') && internalDesc.includes('certified')){
            productsWithHits.push(terms[linkIndex]);
            console.log('hit found');
        }

        //Base case
        if(linkIndex > 0){
            linkIndex--;
            extractAllDescFromProducts(linkIndex);
        }else{
            //END
            console.log('---FINISHED with:');
            console.log('\t' + productsWithHits.length + ' links hit');
            for(var j = 0;j < productsWithHits.length;j++){
                fs.appendFileSync('../output/bestbuy_products_w_hits.txt', productsWithHits[j] + '\n');

            }
        }
        
    });
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
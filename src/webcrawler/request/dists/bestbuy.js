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

//Just search for first term
BestBuy.baseURL = 'https://www.bestbuy.ca';
BestBuy.pageURL = BestBuy.baseURL + '/en-CA/Search/SearchResults.aspx?type=product&page=1&sortBy=relevance&sortDir=desc&query=';

BestBuy.startSearching = function(searchTerm, ps, pe){
    var urlStart = BestBuy.pageURL + searchTerm;
    processInProgress = true;

    BestBuy.currentPage = ps;
    BestBuy.maxPages = pe;

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
                fs.appendFileSync('../output/' + folderNameOfOutput + '/productlinks.txt', linksToProducts[j] + '\n');
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

//extractAllDescFromProducts(productsLeft);
BestBuy.extractAllDescFromProducts = function(linkIndex, res){
    request(linksToProducts[linkIndex], function(err, resp, body){
        $ = cheerio.load(body);
        descs = $('.tab-overview-item');

        var internalDesc = '';
        $(descs).each(function(i, desc){
            internalDesc += '' + descs.text() + '\n';
        });

        internalDesc = internalDesc.toLowerCase();

        if(internalDesc.includes('star') && internalDesc.includes('certified')){
            productsWithHits.push(linksToProducts[linkIndex]);
        }

        //Base case
        if(linkIndex > 0 && processInProgress){
            linkIndex--;
            BestBuy.extractAllDescFromProducts(linkIndex);
        }else{
            //END
            //console.log('---FINISHED with:');
            //console.log('\t' + productsWithHits.length + ' links hit');
            for(var j = 0;j < productsWithHits.length;j++){
                fs.appendFileSync('../output/' + folderNameOfOutput + '/eStarHits.txt', productsWithHits[j] + '\n');
            }
            processInProgress = false;
        }
        
    });
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

        var returnVal = {};
        returnVal.url = url;
        returnVal.title = overallText;
        returnVal.hits = hitValues.slice(0, 15);

        res.json(returnVal);
    });
};

BestBuy.compareAllModelNumberToDatabase = function(indOfESMatch, res, dbIndex){
    //console.log("here: " + productsWithHits[indOfESMatch]);
    request(productsWithHits[indOfESMatch], function(err, resp, body){
        $ = cheerio.load(body);
        var links = $('#ctl00_CP_ctl00_PD_lblModelNumber');//'.tab-overview-item'); //jquery get all hyperlinks
        var overallText = '';
        $(links).each(function(i, link){
            overallText += ('' + $(link).text());
        });

        var hit = false;
        for(var j = 0;j < CONFIG.databases[dbIndex].records.length;j++){
            var mNumber = '' + CONFIG.databases[dbIndex].records[j]['Model Number'];
            var allMatch = true;
            for(var f = 0;f < mNumber.length;f++){
                if(f < overallText.length){
                    if(mNumber.charAt(f).toLowerCase() === overallText.charAt(f).toLowerCase() || mNumber.charAt(f) === '*'){

                    }
                    else{
                        allMatch = false;
                    }
                }
            }
            if(allMatch === true){
                hit = true;
            }
        }

        //No match - 
        if(!hit){
            linksOfInfractions.push(productsWithHits[indOfESMatch]);
        }




        if(indOfESMatch > 0 && processInProgress){
            indOfESMatch--;
            BestBuy.compareAllModelNumberToDatabase(indOfESMatch, res, dbIndex);
        }
        else{
            var returnVal = {};
            returnVal.all = JSON.stringify(linksOfInfractions);
            for(var j = 0;j < linksOfInfractions.length;j++){
                fs.appendFileSync('../output/' + folderNameOfOutput + '/eStarHits_infractions.txt', linksOfInfractions[j] + '\n');
            }
            processInProgress = false;
            res.json(returnVal);
        }
    });
};











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
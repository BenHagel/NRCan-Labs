/*
NRCAN - HomeDepot 1
Scrape all the pages after a search
*/


var HomeDepot = {};

//Part 1


//Just search for first term
HomeDepot.baseURL = 'https://www.homedepot.ca';
HomeDepot.pageURL = HomeDepot.baseURL + '/en/home/search.html?page=0&q=';

HomeDepot.startSearching = function(searchTerm, ps, pe){
    HomeDepot.currentPage = ps;//sjhpould be 0
    HomeDepot.maxPages = pe;//15 or w.e.
    console.log(('Pages:: ' + HomeDepot.currentPage + ' ' + HomeDepot.maxPages).green);
    var urlStart = HomeDepot.pageURL + searchTerm;
    processInProgress = true;
    linksToProducts = [];
    console.log((''+urlStart).red);
    HomeDepot.grabLinksFrom(urlStart);
};

HomeDepot.grabLinksFrom = function(pageURL){
    request({"url": pageURL, "timeout": 3200}, function(err, resp, body){
        console.log(('IN:\t\t'+pageURL).yellow);
        
        //Body is loaded
        if(body){
            console.log(body.length);
            $ = cheerio.load(body);
            links = $('a');
            $(links).each(function(i, link){
                var targetLink = ('' + $(link).attr('href'));
                var targetLinkParsed = targetLink.split('/', 4);  //  /product/
                if(targetLinkParsed.length > 2){
                    if(targetLinkParsed[1] === 'product'){
                        targetLink = HomeDepot.baseURL + targetLink;
                        HomeDepot.addProductLink(targetLink);
                    }
                }
            });
        }
        //ERROR loading body take a step back and re-do this one
        else{
            HomeDepot.currentPage--;
        }


        //Iterate pages
        if(HomeDepot.currentPage < HomeDepot.maxPages && processInProgress === true){
            var oldPageNum = '?page=' + HomeDepot.currentPage;
            HomeDepot.currentPage++;
            var newPageNum = '?page=' + HomeDepot.currentPage;
            var nextPageURL = pageURL.replace(oldPageNum, newPageNum);
            setTimeout(function(){HomeDepot.grabLinksFrom(nextPageURL)}, 840);//HomeDepot.grabLinksFrom(nextPageURL);
        }
        else{
            for(var j = 0;j < linksToProducts.length;j++){
                fs.appendFileSync('../output/' + folderNameOfOutput + '/productlinks.txt', linksToProducts[j] + '\n');
            }
            processInProgress = false;
        }
    });
};

HomeDepot.addProductLink = function(newURL){
    for(var t = 0; t < linksToProducts.length;t++){
        if(newURL === linksToProducts[t] || 
            newURL === linksToProducts[t]+'#review' ||
            newURL + '#review   ' === linksToProducts[t]) 
                return false;
    }
    linksToProducts.push(newURL);
    //console.log(newURL);
    return true;
};

HomeDepot.extractAllDescFromProducts = function(linkIndex, res){
    request({"url": linksToProducts[linkIndex], "timeout": 2700}, function(err, resp, body){
        //disect
        if(body){
            //Get title of product
            var $ = cheerio.load(body);
            var titleOfProduct =''+ $('title').text();
            titleOfProduct = titleOfProduct.toLowerCase();
            //Helper function to gather instances of energy star - combs the specification area
            body = (''+body).toLowerCase();
            var energyStarHitsInTheBody = [];
            var tracjer = 0;
            var extractES = function(bb){
                tracjer++;
                var ind = bb.indexOf('energy star');
                if(ind > -1){
                    energyStarHitsInTheBody.push(''+ bb.substring(ind, ind+35));
                    bb = bb.replace('energy star', '');
                    extractES(bb);
                }
                else{
                    body = ''+bb;
                }
            };
            extractES(body);
            var esHitInSpecificationsSheet = false;
            for(var q = 0;q < energyStarHitsInTheBody.length;q++){
                if(energyStarHitsInTheBody[q].indexOf('</dt><dd>') > -1 && energyStarHitsInTheBody[q].indexOf('yes') > -1) esHitInSpecificationsSheet = true;
            }

            //Add a hit if includes
            if(titleOfProduct.includes('energy star') || titleOfProduct.includes('star certified') || esHitInSpecificationsSheet){
                //productsWithHits.push(linksToProducts[linkIndex]);
                HomeDepot.addES_HitLink(linksToProducts[linkIndex]);
            }
        }
        //Try again if no response
        else{
            linkIndex++;
            if(body) console.log(body.length + ': ' + "length");
            //console.log(error);
        }

        


        //Base case
        if(linkIndex > 0 && processInProgress){
            linkIndex--;
            setTimeout(function(){HomeDepot.extractAllDescFromProducts(linkIndex);}, 840);
        }
        else{
            //END
            for(var j = 0;j < productsWithHits.length;j++){
                fs.appendFileSync('../output/' + folderNameOfOutput + '/eStarHits.txt', productsWithHits[j] + '\n');
            }
            processInProgress = false;
        }

        
    });
};

HomeDepot.addES_HitLink = function(newURL){
    for(var t = 0; t < productsWithHits.length;t++){
        if(newURL === productsWithHits[t] || 
            newURL === productsWithHits[t]+'#review' ||
            newURL + '#review' === productsWithHits[t]) 
                return false;
    }
    productsWithHits.push(newURL);
    //console.log(newURL);
    return true;
};



HomeDepot.compareAllModelNumberToDatabase = function(indOfESMatch, res, dbIndex){
    //console.log("here: " + productsWithHits[indOfESMatch]);
    request({"url": productsWithHits[indOfESMatch], "timeout": 2700}, function(err, resp, body){
        //Successful loading
        if(body){
            $ = cheerio.load(body);
            var links = $('.hdca-product__description-product-detail-model');//'.tab-overview-item'); //jquery get all hyperlinks
            var overallText = '';
            $(links).each(function(i, link){
                overallText += (' ' + $(link).text());
            });
            overallText = overallText.replace('Model # ', '');
            overallText = overallText.trim();
    
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
    
    
    
    
            
        }
        //Error
        else{
            indOfESMatch++;
        }


        //Move to next stop
        if(indOfESMatch > 0 && processInProgress){
            indOfESMatch--;
            HomeDepot.compareAllModelNumberToDatabase(indOfESMatch, res, dbIndex);
        }
        else{
            var returnVal = {};
            returnVal.all = JSON.stringify(linksOfInfractions);
            for(var j = 0;j < linksOfInfractions.length;j++){
                fs.appendFileSync('../output/' + folderNameOfOutput + '/eStarHits_infractions.txt', linksOfInfractions[j] + '\n');
            }
            processInProgress = false;
        }
        
    });
};



HomeDepot.addES_InfractionLink = function(newURL){
    for(var t = 0; t < linksOfInfractions.length;t++){
        if(newURL === linksOfInfractions[t]) 
            return false;
    }
    linksOfInfractions.push(newURL);
    return true;
};


HomeDepot.compareToDatabase = function(url, res){
    request({"url": url, "timeout": 2700}, function(err, resp, body){
        //Success in querrtyinh
        if(body){

        }
        //DId not get through
        else{

        }
        $ = cheerio.load(body);
        links = $('.hdca-product__description-product-detail-model');
        var overallText = '';
        $(links).each(function(i, link){
            overallText = (' ' + $(link).text()).toLowerCase();
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
        /*

        for(var i = 0;i < formatted.length;i++){
            var hitFound = 0;
            for(var j = 0;j < formatted[i].length;j++){
                for(var x = 0;x < titleComponents.length;x++){
                    if(levenshtein.get(formatted[i][j], titleComponents[x]) < 1){hitFound++;}
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
        */
        var returnVal = {};
        returnVal.url = url;
        returnVal.title = overallText;
        returnVal.hits = hitValues.slice(0, 15);

        res.json(returnVal);
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
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
    //console.log(urlStart);
    HomeDepot.grabLinksFrom(urlStart);
};

HomeDepot.grabLinksFrom = function(pageURL){
    request(pageURL, function(err, resp, body){
        //Body 
        $ = cheerio.load(body);
        links = $('a');
        $(links).each(function(i, link){
            var targetLink = ('' + $(link).attr('href'));
            var targetLinkParsed = targetLink.split('/', 4);  //  /product/weifasdkj3asdkj 
            //console.log(targetLink);
            if(targetLinkParsed.length > 2){
                if(targetLinkParsed[1] === 'product'){
                    targetLink = HomeDepot.baseURL + targetLink;
                    HomeDepot.addLink(targetLink);
                }
            }
            //if((''+$(link).attr('href')).substring(0,4) === 'http'){
                //console.log($(link).attr('href'));
                //console.log('---LINK SAVED\n' + (''+$(link).attr('href')));
                //firstLinks.push($(link).attr('href'));
            //}
        });

        //Iterate pages
        if(HomeDepot.currentPage < HomeDepot.maxPages && processInProgress === true){
            var oldPageNum = '?page=' + HomeDepot.currentPage;
            HomeDepot.currentPage++;
            var newPageNum = '?page=' + HomeDepot.currentPage;
            //Call new page
            var nextPageURL = pageURL.replace(oldPageNum, newPageNum);
            //console.log(nextPageURL);
            //console.log(nextPageURL);
            HomeDepot.grabLinksFrom(nextPageURL);
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

HomeDepot.addLink = function(newURL){
    for(var t = 0; t < linksToProducts.length;t++){
        if(newURL === linksToProducts[t]) return false;
    }
    linksToProducts.push(newURL);
    console.log(newURL);
    return true;
};

//extractAllDescFromProducts(productsLeft);
HomeDepot.extractAllDescFromProducts = function(linkIndex, res){
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
            HomeDepot.extractAllDescFromProducts(linkIndex);
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

HomeDepot.compareToDatabase = function(url, res){
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

HomeDepot.compareAllModelNumberToDatabase = function(indOfESMatch, res){
    //console.log("here: " + productsWithHits[indOfESMatch]);
    request(productsWithHits[indOfESMatch], function(err, resp, body){
        $ = cheerio.load(body);
        var links = $('#ctl00_CP_ctl00_PD_lblModelNumber');//'.tab-overview-item'); //jquery get all hyperlinks
        var overallText = '';
        $(links).each(function(i, link){
            overallText += ('' + $(link).text());
        });

        var hit = false;
        for(var j = 0;j < db.length;j++){
            var mNumber = '' + db[j]['Model Number'];
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
            HomeDepot.compareAllModelNumberToDatabase(indOfESMatch, res);
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
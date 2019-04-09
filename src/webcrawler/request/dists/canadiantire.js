/*
NRCAN - CanTire 1
Scrape all the pages after a search
*/
var CanTire = {};

//Just search for first term
CanTire.baseURL = 'https://www.canadiantire.ca/en/search-results.html?q=';
CanTire.pageURL = CanTire.baseURL + '/en/home/search.html?page=0&q=';

CanTire.startSearching = function(searchTerm, ps, pe){
    const sleep = theUtil.promisify(setTimeout);
    var imgLinks = [];
    processInProgress = true;
    linksToProducts = [];

    (async () => {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        //Go to the first page to seed the rest
        await page.goto(CanTire.baseURL + searchTerm, {
            'waitUntil': 'networkidle2',
            'timeout': 10000
        }).then(() => {
            console.log('success');
        }).catch((res) => {
            console.log('fail ' + res);
        });
        page.setViewport({
            width: 1200,
            height: 800
        });

        //do{

        //}while();
        
        const html = await page.evaluate('new XMLSerializer().serializeToString(document.doctype) + document.documentElement.outerHTML');
        var tempLinks = [];
        $ = cheerio.load(html);
        links = $('a');
        $(links).each(function(i, link){
            var targetLink = ('' + $(link).attr('href'));
            tempLinks.push(targetLink);
        });

        for(var t = 0;t < tempLinks.length;t++){
            var parts = tempLinks[t].split('/');
            if(parts[2] === 'pdp') CanTire.addProductLink('https://www.canadiantire.ca'+tempLinks[t]);//console.log(tempLinks[t]);
            //console.log(tempLinks[t]);
        }
        //.search-results-grid__load-more-results

        var loadMore = $('.search-results-grid__load-more-results');
        console.log('===========');
        console.log(loadMore.attr('style'));


        /*
        const hrefs = await page.evaluate(() => {
            const anchors = document.querySelectorAll('a');
            return [].map.call(anchors, a => a.href);
        });

        console.log('hrefs: ' + hrefs.length);

        for(var k = 0;k < hrefs.length;k++){
            var parts = hrefs[k].split('/');
            //if(parts[2] === 'pdp') console.log(hrefs[k]);
            console.log(parts[0] + '[]' + parts[1] + '[]' + parts[2]);
        }
        */


        /*for(var t = 0;t < hrefs.length;t++){
            console.log(t + '/' + hrefs.length);
            var succc = false;
            await page.goto(hrefs[t], {
                'waitUntil': 'networkidle2',
                'timeout': 10000
            }).then(() => {
                console.log('success');
                succc = true;
                
            }).catch((res) => {
                console.log('fail ' + res);
            });
            if(succc){
                const links = await page.$$eval('a', as => as.map(img => img.href));
                console.log('found ' + links.length + ' links');
            }
        }*/
        await page.screenshot({path: 'example3.png'});
        await sleep(1000);
        //page.keyboard.press('Enter');
        processInProgress = false;
        await browser.close();
    })();

    console.log('start pupper');




    
    //CanTire.grabLinksFrom(urlStart);
};

CanTire.grabLinksFrom = function(pageURL){
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
                        targetLink = CanTire.baseURL + targetLink;
                        CanTire.addProductLink(targetLink);
                    }
                }
            });
        }
        //ERROR loading body take a step back and re-do this one
        else{
            CanTire.currentPage--;
        }


        //Iterate pages
        if(CanTire.currentPage < CanTire.maxPages && processInProgress === true){
            var oldPageNum = '?page=' + CanTire.currentPage;
            CanTire.currentPage++;
            var newPageNum = '?page=' + CanTire.currentPage;
            var nextPageURL = pageURL.replace(oldPageNum, newPageNum);
            setTimeout(function(){CanTire.grabLinksFrom(nextPageURL)}, 840);//CanTire.grabLinksFrom(nextPageURL);
        }
        else{
            for(var j = 0;j < linksToProducts.length;j++){
                fs.appendFileSync('../output/' + folderNameOfOutput + '/productlinks.txt', linksToProducts[j] + '\n');
            }
            processInProgress = false;
        }
    });
};

CanTire.addProductLink = function(newURL){
    for(var t = 0; t < linksToProducts.length;t++){
        if(newURL === linksToProducts[t]) return false;
    }
    linksToProducts.push(newURL);
    return true;
};

CanTire.extractAllDescFromProducts = function(linkIndex, res){
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
                CanTire.addES_HitLink(linksToProducts[linkIndex]);
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
            setTimeout(function(){CanTire.extractAllDescFromProducts(linkIndex);}, 840);
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

CanTire.addES_HitLink = function(newURL){
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



CanTire.compareAllModelNumberToDatabase = function(indOfESMatch, res, dbIndex){
    //console.log("here: " + productsWithHits[indOfESMatch]);
    request({"url": productsWithHits[indOfESMatch], "timeout": 2700}, function(err, resp, body){
        //Successful loading
        if(body){
            $ = cheerio.load(body);
            var links = $('.js-product-title-id');//'.tab-overview-item'); //jquery get all hyperlinks
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
            CanTire.compareAllModelNumberToDatabase(indOfESMatch, res, dbIndex);
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



CanTire.addES_InfractionLink = function(newURL){
    for(var t = 0; t < linksOfInfractions.length;t++){
        if(newURL === linksOfInfractions[t]) 
            return false;
    }
    linksOfInfractions.push(newURL);
    return true;
};


CanTire.compareToDatabase = function(url, res){
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
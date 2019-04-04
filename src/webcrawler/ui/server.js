const express = require('express');
const app = express();
const port = 80;
const fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var levenshtein = require('fast-levenshtein');
const csv = require('csv-parser');





function repAll(word, target, desired){
    if(word.includes(target)){
        word = word.replace(target, desired);
        return repAll(word, target, desired);
    }
    else{
        return word;
    }
}





//Open jobs that are currently taking time to run
//var openJobs = [];
var processInProgress = false;

//DISTRIBUTORS
var radioButtons = [];//which shop selectged
var linksToProducts = [];//current links to products
var productsWithHits = [];
var linksOfInfractions = [];

//WWW
var goodStartingSeedURLS = '';

eval('' + fs.readFileSync('../request/bestbuy/bestbuy.js'));
//eval('' + fs.readFileSync('../request/homedepot/homedepot.js'));
//eval('' + fs.readFileSync('../request/cantire/cantire.js'));
eval('' + fs.readFileSync('../request/www/www.js'));

goodStartingSeedURLS = '' + fs.readFileSync('user_data/goodStartingSeeds.txt');
WWW.startingSeeds = goodStartingSeedURLS.split('\n');
WWW.initTree();


//Helper funcs
String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

function repAll(word, target, desired){//recursive replace all
    if(word.includes(target)){
        word = word.replace(target, desired);
        return repAll(word, target, desired);
    }
    else{
        return word;
    }
}

var folderNameOfOutput = 'dehumidifiers';//fridges, lightbulbs, dehumidifiers
BestBuy.currentPage = 1;
BestBuy.maxPages = 11;
var db = [];
//fs.createReadStream('../../../certified-residential-refrigerators-2019-03-28.csv')
//fs.createReadStream('../../../certified-residential-freezers-2019-04-03.csv')
//fs.createReadStream('../../../certified-light-bulbs-2019-03-14.csv')
fs.createReadStream('../../../ENERGY_STAR_Certified_Dehumidifiers.csv')
    .pipe(csv())
    .on('headers', (headers) => {//console.log('First header: ' + headers);
    })
    .on('data', (data) => db.push(data))
    .on('end', () => {
        console.log('loaded ' + db.length);
    });






//Load FRIDGE hits for ENERGY STAR
productsWithHits = '' + fs.readFileSync('../output/' + folderNameOfOutput + '/eStarHits.txt');
//productsWithHits = '' + fs.readFileSync('../output/' + folderNameOfOutput + '/eStarHits.txt');
productsWithHits = productsWithHits.split('\n');

//Load FRIDGE infractions for ENERGY STAR
linksOfInfractions = '' + fs.readFileSync('../output/' + folderNameOfOutput + '/eStarHits_infractions.txt');
//linksOfInfractions = '' + fs.readFileSync('../output/' + folderNameOfOutput + '/eStarHits_infractions.txt');
linksOfInfractions = linksOfInfractions.split('\n');







//Server stuff
app.use(express.static('public'));

app.get('/', (req, res) => res.sendFile('./index.html'));

app.post('/api', function(req, res){
    //Top command to halt process in progress
    if(req.query.cmd === 'stop'){
        processInProgress = false;
    }
    //Once on startup to load in information
    else if(req.query.cmd === 'confirm_database'){
        res.json({'entries': db.length, 'goodStartingSeeds': goodStartingSeedURLS});
    }
    //Once every second called
    else if(req.query.cmd === 'check_jobs'){
        if(linksToProducts.length > 0){
            res.json({'busy': processInProgress, 'links': linksToProducts.length, 'lbEstarHits': productsWithHits.length,
                'firstLink': linksToProducts[0], 'lastLink': linksToProducts[linksToProducts.length-1],
                'nodes': JSON.stringify(WWW.nodes)});
        }else{
            res.json({'busy': processInProgress, 'links': linksToProducts.length,  'lbEstarHits': productsWithHits.length,
                'firstLink': '---', 'lastLink': '---',
                'nodes': JSON.stringify(WWW.nodes)});
        }
        
    }

    //DISTRIBUTOR
    else if(req.query.cmd === 'DIS_start_job_search'){
        if(!processInProgress && (''+req.query.search).length > 2){
            radioButtons = (''+req.query.shop).split('1');
            if(radioButtons[0] === 'true'){
                BestBuy.startSearching((''+req.query.search).replace(/ /g, '+').trim());
            }
            else if(radioButtons[1] === 'true'){

            }
            else if(radioButtons[2] === 'true'){

            }
        }
        res.json({});
    }
    else if(req.query.cmd === 'DIS_get_product_with_es_hit'){
        if(!processInProgress){

            radioButtons = (''+req.query.shop).split('1');
            if(req.query.index === 'all'){
                
                res.json({'all': productsWithHits});
            }
            else{
                if(radioButtons[0] === 'true'){
                    //BestBuy.compareToDatabase(productsWithHits[Number(req.query.index)], res);
                    productsWithHits = [];
                    res.json({});
                    processInProgress = true;
                    BestBuy.extractAllDescFromProducts(linksToProducts.length-1, res);
                }
                else if(radioButtons[1] === 'true'){
                    res.json({});
                }
                else if(radioButtons[2] === 'true'){
                    res.json({});
                }
                
            }
        }
    }
    else if(req.query.cmd === 'DIS_get_hit_product_link'){
        if(!processInProgress){
            radioButtons = (''+req.query.shop).split('1');
            if(req.query.index === 'all'){
                /*for(var p = 0;p < 75;p++){
                    BestBuy.compareToDatabase(p, res);
                }
                res.json({'all': productsWithHits});*/
                linksOfInfractions = [];
                processInProgress = true;
                BestBuy.compareAllModelNumberToDatabase(productsWithHits.length-1, res);
                //res.json({'all': productsWithHits});
            }
            else{
                if(radioButtons[0] === 'true'){
                    BestBuy.compareToDatabase(productsWithHits[Number(req.query.index)], res);
                }
                else if(radioButtons[1] === 'true'){
                    res.json({});
                }
                else if(radioButtons[2] === 'true'){
                    res.json({});
                }
                
            }
            
        }
    }
    
    

    //WWW
    else if(req.query.cmd === 'WWW_start_seed'){
        if(!processInProgress){

        }
        res.json({});
    }

    else if(req.query.cmd === 'get_product_link'){
        //not yet
    }
});

app.listen(port, function(){console.log('on ' + port)});
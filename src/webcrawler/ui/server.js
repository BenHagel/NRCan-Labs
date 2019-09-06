const express = require('express');
const app = express();
const port = 80;
const fs = require('fs');
var path = require('path');
var request = require('request');
var cheerio = require('cheerio');
var levenshtein = require('fast-levenshtein');
const csv = require('csv-parser');
const colour = require('colour');
//const puppeteer = require('puppeteer');
const theUtil = require('util');

console.log('START'.green);
//Load config file, 
var CONFIG = JSON.parse(fs.readFileSync('../../../config.json', 'utf8'));
CONFIG.total_record_count = 0;
var db_filenames = [];
fs.readdirSync('../../../' + CONFIG.database_dir_name).forEach(file => {
    db_filenames.push('' + file);
});
console.log('Loading databases...');
var dbLoader = function(dbInd){
    var tempdb = [];
    fs.createReadStream('../../../' + CONFIG.database_dir_name + '/' + db_filenames[dbInd])
    .pipe(csv())
    .on('headers', (headers) => {
    })
    .on('data', (data) => tempdb.push(data))
    .on('end', () => {
        var toAdd = {};
        toAdd.name = '' + db_filenames[dbInd].split('.')[0];
        toAdd.size = tempdb.length;
        toAdd.records = tempdb;
        console.log('loaded:\t' + toAdd.size + '\t' + toAdd.name);

        CONFIG.databases.push(toAdd);
        if(dbInd > 0){
            dbLoader(dbInd-1);
        }
        else{
            console.log('DONE! Loaded: ' + CONFIG.databases.length + ' databases');
            app.listen(port, function(){console.log('hosting server on port ' + port)});
        }
    });
};
dbLoader(db_filenames.length-1);





//Open jobs that are currently taking time to run
//var openJobs = [];
var processInProgress = false;

//DISTRIBUTORS
var radioButtons = [];//which shop selectged
var linksToProducts = [];
var productsWithHits = [];
var linksOfInfractions = [];

//WWW
var goodStartingSeedURLS = '';

eval('' + fs.readFileSync('../request/dists/bestbuy.js'));
eval('' + fs.readFileSync('../request/dists/homedepot.js'));
eval('' + fs.readFileSync('../request/dists/canadiantire.js'));
eval('' + fs.readFileSync('../request/www/www.js'));

goodStartingSeedURLS = '' + fs.readFileSync('user_data/goodStartingSeeds.txt');
WWW.startingSeeds = goodStartingSeedURLS.split('\n');
WWW.initTree();

var folderNameOfOutput = 'temp';//fridges, lightbulbs, dehumidifiers, :::temp:::





//Load prouct LINKS for energy star
linksToProducts = '' + fs.readFileSync('../output/' + folderNameOfOutput + '/productlinks.txt');
linksToProducts = linksToProducts.split('\n');
for(var g = 0;g < linksToProducts.length;g++){
    if(linksToProducts[g].length < 3) linksToProducts.splice(g, 1);
}

//Load hits for ENERGY STAR
productsWithHits = '' + fs.readFileSync('../output/' + folderNameOfOutput + '/eStarHits.txt');
productsWithHits = productsWithHits.split('\n');
for(var g = 0;g < productsWithHits.length;g++){
    if(productsWithHits[g].length < 3) productsWithHits.splice(g, 1);
}

//Load infractions for ENERGY STAR
linksOfInfractions = '' + fs.readFileSync('../output/' + folderNameOfOutput + '/eStarHits_infractions.txt');
linksOfInfractions = linksOfInfractions.split('\n');
for(var g = 0;g < linksOfInfractions.length;g++){
    if(linksOfInfractions[g].length < 3) linksOfInfractions.splice(g, 1);
}






//Server stuff
app.use(express.static('public'));

app.get('/', (req, res) => res.sendFile(path.basename('can.html')));

app.post('/api', function(req, res){
    //Top command to halt process in progress
    if(req.query.cmd === 'stop'){
        processInProgress = false;
    }
    //Once on startup to load in information
    else if(req.query.cmd === 'confirm_database'){
        var sendOver = [];
        for(var h = 0;h < CONFIG.databases.length;h++){
            sendOver.push({"name": CONFIG.databases[h].name, "size": CONFIG.databases[h].size});
        }
        res.json({'entries': JSON.stringify(CONFIG.databases), 'goodStartingSeeds': goodStartingSeedURLS});
    }
    //Once every second called
    else if(req.query.cmd === 'check_jobs'){
        res.json({'busy': processInProgress, 'linksToProducts': linksToProducts.length,
            'productsWithHits': productsWithHits.length, 'linksOfInfractions': linksOfInfractions.length,
            'nodes': JSON.stringify(WWW.nodes)});
        
    }

    //DISTRIBUTOR
    else if(req.query.cmd === 'DIS_start_job_search'){
        if(!processInProgress && (''+req.query.search).length > 2){
            radioButtons = (''+req.query.shop).split('1');
            var ps = Math.round(Number((''+req.query.ps)));
            var pe = Math.round(Number((''+req.query.pe)));
            if(radioButtons[0] === 'true'){
                BestBuy.startSearching((''+req.query.search).replace(/ /g, '+').trim(), ps, pe);
            }
            else if(radioButtons[1] === 'true'){
                HomeDepot.startSearching((''+req.query.search).replace(/ /g, '+').trim(), ps, pe);
            }
            else if(radioButtons[2] === 'true'){
                CanTire.startSearching((''+req.query.search).replace(/ /g, '+').trim(), ps, pe);
            }
        }
        res.json({});
    }
    else if(req.query.cmd === 'DIS_get_product_with_es_hit'){
        if(!processInProgress){

            radioButtons = (''+req.query.shop).split('1');

            if(radioButtons[0] === 'true'){
                productsWithHits = [];
                res.json({});
                processInProgress = true;
                BestBuy.extractAllDescFromProducts(linksToProducts.length-1, res);
            }
            else if(radioButtons[1] === 'true'){
                productsWithHits = [];
                res.json({});
                processInProgress = true;
                HomeDepot.extractAllDescFromProducts(linksToProducts.length-1, res);
            }
            else if(radioButtons[2] === 'true'){
                res.json({});

                
            }
        }
    }
    else if(req.query.cmd === 'DIS_get_hit_product_link'){
        if(!processInProgress){
            radioButtons = (''+req.query.shop).split('1');
            var dbIndex = -1;
            var requestedDB = (''+req.query.db);
            for(var k = 0;k < CONFIG.databases.length;k++){
                if(requestedDB === CONFIG.databases[k].name){
                    dbIndex = k;
                    break;
                }
            }
            //Bestbuy
            if(radioButtons[0] === 'true'){
                linksOfInfractions = [];
                processInProgress = true;
                res.json({});
                BestBuy.compareAllModelNumberToDatabase(productsWithHits.length-1, res, dbIndex);
            }
            //Home depot
            else if(radioButtons[1] === 'true'){
                linksOfInfractions = [];
                processInProgress = true;
                res.json({});
                HomeDepot.compareAllModelNumberToDatabase(productsWithHits.length-1, res, dbIndex);
            }
            else if(radioButtons[2] === 'true'){
                res.json({});
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


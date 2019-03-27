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
var radioButtons = [];//which shop selectged
var linksToProducts = [];//current links to products

var processInProgress = false;

eval('' + fs.readFileSync('../request/bestbuy/bestbuy.js'));
//eval('' + fs.readFileSync('../request/homedepot/homedepot.js'));
//eval('' + fs.readFileSync('../request/cantire/cantire.js'));

eval('' + fs.readFileSync('../request/LightBulbHelper.js'));




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






//Load LIGHT BULB database
/*
var csvRaw = '' + fs.readFileSync('../../../certified-light-bulbs-2019-03-14.csv');
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
//console.log(csvRaw[4]);
*/

var db = [];

fs.createReadStream('../../../certified-light-bulbs-2019-03-14.csv')
    .pipe(csv())
    .on('headers', (headers) => {
        console.log('First header: ' + headers);
    })
    .on('data', (data) => db.push(data))
    .on('end', () => {
        //console.log('db: ' + db.length);
        console.log('loaded: ' + db[0]);
    });






//Load LIGHT BULB hits for ENERGY STAR
var csvRawEnergyStarHits = '' + fs.readFileSync('../output/bestbuy_products_w_hits.txt');
csvRawEnergyStarHits = csvRawEnergyStarHits.split('\n');




//Server stuff
app.use(express.static('public'));

app.get('/', (req, res) => res.sendFile('./index.html'));

app.post('/api', function(req, res){
    if(req.query.cmd === 'stop'){
        processInProgress = false;
    }
    else if(req.query.cmd === 'check_jobs'){
        /*if(processInProgress){
            res.json({'busy': processInProgress, 'links': linksToProducts});
        }
        else{
            res.json({'busy': processInProgress, 'links': });
        }*/
        if(linksToProducts.length > 0){
            res.json({'busy': processInProgress, 'links': linksToProducts.length, 'lbEstarHits': csvRawEnergyStarHits.length,
                'firstLink': linksToProducts[0], 'lastLink': linksToProducts[linksToProducts.length-1]});
        }else{
            res.json({'busy': processInProgress, 'links': linksToProducts.length,  'lbEstarHits': csvRawEnergyStarHits.length,
                'firstLink': '---', 'lastLink': '---'});
        }
        
    }
    else if(req.query.cmd === 'get_product_link'){
        //not yet
    }
    else if(req.query.cmd === 'get_hit_product_link'){
        if(!processInProgress){
            radioButtons = (''+req.query.shop).split('1');
            if(req.query.index === 'all'){
                res.json({'all': csvRawEnergyStarHits});
            }
            else{
                if(radioButtons[0] === 'true'){
                    BestBuy.compareToDatabase(csvRawEnergyStarHits[Number(req.query.index)], res);
                }
                else if(radioButtons[1] === 'true'){
    
                }
                else if(radioButtons[2] === 'true'){
    
                }
                
            }
            
        }
    }
    else if(req.query.cmd === 'confirm_database'){
        res.json({'entries': formatted.length});
    }
    else if(req.query.cmd === 'start_job_search'){
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
});

app.listen(port, function(){console.log('on ' + port)});
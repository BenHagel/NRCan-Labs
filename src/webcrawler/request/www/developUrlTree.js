var request = require('request');
var cheerio = require('cheerio');
const fs = require('fs');


var seeds = '' + fs.readFileSync('../../ui/user_data/goodStartingSeeds.txt');
seeds = seeds.split('\n');

console.log(seeds);


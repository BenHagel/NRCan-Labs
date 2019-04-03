/*
Starting from: 
"energy star" partner -energystar.gov -nrcan.gc.ca -canada.ca site:*.ca
"energy star" partnership -energystar.gov -nrcan.gc.ca -canada.ca site:*.ca
"energy star" participant -energystar.gov -nrcan.gc.ca -canada.ca site:*.ca
"energy star" participate -energystar.gov -nrcan.gc.ca -canada.ca site:*.ca
*/
var WWW = {};

WWW.startingSeeds = [];
WWW.nodes = [];

WWW.initTree = function(){
    for(var i = 0;i < WWW.startingSeeds.length;i++){
        WWW.nodes.push({
            "depth": 0,
            "url": WWW.startingSeeds[i]
        });
    }
};

WWW.developTree = function(){

};
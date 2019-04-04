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
WWW.idNum = 1;

WWW.initTree = function(){
    for(var i = 0;i < WWW.startingSeeds.length;i++){
        WWW.nodes.push({
            "id": WWW.idNum,
            "parent": -1,
            "depth": 0,
            "url": WWW.startingSeeds[i]
        });
        WWW.idNum++;
    }
};

WWW.stepTree = function(){
    var currDepth = WWW.nodes[WWW.nodes.length-1].depth;
    //WWW.developTree
};

WWW.developTree = function(){
    request(productsWithHits[indOfNode], function(err, resp, body){
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
                    //BestBuy.addLink(targetLink);
                }
            }
        });

    });
};
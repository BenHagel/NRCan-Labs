var Menu = {};

Menu.signature = 'ben1';
Menu.divs = ['productSites', 'www', 'singleSite'];

Menu.productLinksLastIndex = 0;

Menu.onload = function(){
    var coll = document.getElementsByClassName("collapsible");
    var i;

    for (i = 0; i < coll.length; i++) {
        coll[i].addEventListener("click", function() {
            this.classList.toggle("active");
            var content = this.nextElementSibling;
            if (content.style.display === "block") {
                content.style.display = "none";
            }
            else {
                content.style.display = "block";
            }
        });
    }


    ServerAPI.initialQuery();
    ServerAPI.checkOnJobs();
};

Menu.hideAllDivs = function(){
    for(var t = 0;t < Menu.divs.length;t++){
        document.getElementById(Menu.divs[t]).classList.add('hidden');
        document.getElementById(Menu.divs[t]+'_tab').classList.remove('tab-active');// = document.getElementById(Menu.divs[t]).className.replace(" active", "");
    }
};

Menu.openTab = function(num) {
    Menu.hideAllDivs();
    if(num === 0){
        document.getElementById(Menu.divs[num]).classList.remove('hidden');
        document.getElementById(Menu.divs[num]+'_tab').classList.add('tab-active');
    }
    else if(num === 1){
        document.getElementById(Menu.divs[num]).classList.remove('hidden');
        document.getElementById(Menu.divs[num]+'_tab').classList.add('tab-active');
    }
    else if(num === 2){
        document.getElementById(Menu.divs[num]).classList.remove('hidden');
        document.getElementById(Menu.divs[num]+'_tab').classList.add('tab-active');
    }
};

Menu.renderCurrentJobs = function(data){
    if(data.busy){
        document.getElementById('loadingSpinner').classList.remove('hidden');
        var outputArea = document.getElementById('mainTextOutput');
        outputArea.value = '';
        outputArea.value += data.firstLink + '\n';
        outputArea.value += '...' + '\n';
        outputArea.value += data.links + '\n';
        outputArea.value += '...' + '\n';
        outputArea.value += data.lastLink + '\n';
    }
    else{
        document.getElementById('loadingSpinner').classList.add('hidden');
    }
    console.log(data.linksToProducts + ' ' + data.productsWithHits + ' ' + data.linksOfInfractions);
    document.getElementById('numLinksInMemory').innerText = data.lbEstarHits;
};

Menu.renderHighestHits = function(data){
    if(data){
        var outputArea = document.getElementById('mainTextOutput');
        outputArea.value = data.url;
        outputArea.value += '\n' + data.title;
        outputArea.value += '\n======================';
        for(var k = 0;k < data.hits.length;k++){
            outputArea.value += '\n' + data.hits[k].match + ' match';
            outputArea.value += '\n@ index ' + data.hits[k].ind + ', w/ phrases:';
            outputArea.value += '\n' + JSON.stringify(data.hits[k].words);
            outputArea.value += '\n-------------------------------------------';
        }
        
    }
};

Menu.renderAllHits = function(data){
    if(data){
        var outputArea = document.getElementById('mainTextOutput');
        outputArea.value = '';
        for(var k = 0;k < data.all.length;k++){
            outputArea.value += data.all[k] + '\n\n';
        }
    }
};
//^\s*([0-9a-zA-Z]+)\s*$
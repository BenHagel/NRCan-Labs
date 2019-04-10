var Menu = {};

Menu.signature = 'ben1';
Menu.divs = ['productSites', 'www', 'singleSite'];

Menu.productLinksLastIndex = 0;
Menu.show = 'a';

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

    document.getElementById('claimSearchTerms').value = 'energy star\nstar certified'

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
    if(data.busy) document.getElementById('loadingSpinner').classList.remove('hidden');
    else document.getElementById('loadingSpinner').classList.add('hidden');
    
    if(Menu.show === 'a'){
        document.getElementById('mainTextOutput').value = '';
        for(var i = 0;i < data.links.length;i++){
            document.getElementById('mainTextOutput').value += data.links[i] + '\n';
        }
    }
    else if(Menu.show === 'b'){
        document.getElementById('mainTextOutput').value = '';
        for(var i = 0;i < data.esclaims.length;i++){
            document.getElementById('mainTextOutput').value += data.esclaims[i] + '\n';
        }
    }
    else if(Menu.show === 'c'){
        document.getElementById('mainTextOutput').value = '';
        for(var i = 0;i < data.misuses.length;i++){
            document.getElementById('mainTextOutput').value += data.misuses[i] + '\n';
        }
    }

    document.getElementById('countProductLinks').innerText = 'Links:\t' + data.linksToProducts;
    document.getElementById('countESHits').innerText = 'E-Star Claims:\t' + data.productsWithHits;
    document.getElementById('countMisuses').innerText = 'Misuses:\t' + data.linksOfInfractions;
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

Menu.showA = function(){
    Menu.show = 'a';
};
Menu.showB = function(){
    Menu.show = 'b';
};
Menu.showC = function(){
    Menu.show = 'c';
};
//^\s*([0-9a-zA-Z]+)\s*$
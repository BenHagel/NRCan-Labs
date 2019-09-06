var ServerAPI = {};
ServerAPI.baseURL = 'http://localhost:8080/api';
//ServerAPI.baseURL_game = 'http://localhost:80/gres';

ServerAPI.xmlRequest = function(type, req, to){
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function(){
		if(this.readyState === 4 && this.status === 200){
			to(JSON.parse(this.response));
		}
	};

	xhr.open(type, ServerAPI.baseURL + req, true);
	xhr.send(null);
};

//Once ever 1.5 seconds to see if server busy
ServerAPI.checkOnJobs = function(){
	var confirmJobs = function(data){
        localNodes = JSON.parse(data.nodes);
        Menu.renderCurrentJobs(data);
        //console.log(Menu.show);
        setTimeout(ServerAPI.checkOnJobs, 1500);
	};
    var command = '?sig=' + Menu.signature;
    command += '&cmd=check_jobs';
    ServerAPI.xmlRequest('POST', command, confirmJobs);
};

//For DISTRIBUTOR searching
ServerAPI.dis_productSearch = function(){
    var confirmJobs = function(data){
        //Menu.renderCurrentJobs(data);
        //setTimeout(ServerAPI.checkOnJobs, 3500);
    };
    
    //var dbselect = document.getElementById('databaseSelector');
    //var dbval = '' + dbselect.options[dbselect.selectedIndex].value;
    var command = '?sig=' + Menu.signature;
    command += '&cmd=DIS_start_job_search';
    command += '&shop=' + document.getElementById('shopTypeBB').checked + 
        '1' + document.getElementById('shopTypeHD').checked + 
            '1' + document.getElementById('shopTypeCT').checked;
    command += '&search=' + document.getElementById('searchForProductInput').value;
    command += '&ps=' + document.getElementById('pageFrom').value;
    command += '&pe=' + document.getElementById('pageTo').value;
    ServerAPI.xmlRequest('POST', command, confirmJobs);
};

ServerAPI.dis_findWhichLinksHaveESHits = function(){
    var confirmReceive = function(data){
        //Menu.renderCurrentJobs(data);
        //setTimeout(ServerAPI.checkOnJobs, 3500);
	};
    var command = '?sig=' + Menu.signature;
    command += '&cmd=DIS_get_product_with_es_hit';
    command += '&shop=' + document.getElementById('shopTypeBB').checked + 
        '1' + document.getElementById('shopTypeHD').checked + 
            '1' + document.getElementById('shopTypeCT').checked;
    ServerAPI.xmlRequest('POST', command, confirmReceive);
};

ServerAPI.dis_getHotProductLink = function(){
    var gggg = function(data){
        
    };
    
    var dbselect = document.getElementById('databaseSelector');
    var dbval = '' + dbselect.options[dbselect.selectedIndex].value;

    var command = '?sig=' + Menu.signature;
    command += '&cmd=DIS_get_hit_product_link';
    command += '&index=' + 'all';//document.getElementById('searchForProductInputIndex').value;
    command += '&shop=' + document.getElementById('shopTypeBB').checked + 
        '1' + document.getElementById('shopTypeHD').checked + 
            '1' + document.getElementById('shopTypeCT').checked;
    command += '&db=' + dbval;
    //console.log(command);
    ServerAPI.xmlRequest('POST', command, gggg);
};








ServerAPI.getProductLink = function(f, l){
    var confirmJobs = function(data){


	};
    var command = '?sig=' + Menu.signature;
    command += '&cmd=get_product_link';
    command += '&first=' + f;
    command += '&last=' + l;
    //console.log(command);
    ServerAPI.xmlRequest('POST', command, confirmJobs);
};




//For WWW Searching.
ServerAPI.www_seedStart = function(){
    var confirmSeed = function(data){
        //Menu.renderCurrentJobs(data);
        //setTimeout(ServerAPI.checkOnJobs, 3500);
    };
    var command = '?sig=' + Menu.signature;
    command += '&cmd=WWW_start_seed';
    ServerAPI.xmlRequest('POST', command, confirmSeed);
};

ServerAPI.stop = function(){
    var confirmStop = function(data){
        //Menu.renderCurrentJobs(data);
        //setTimeout(ServerAPI.checkOnJobs, 3500);
	};
    var command = '?sig=' + Menu.signature;
    command += '&cmd=stop';
    ServerAPI.xmlRequest('POST', command, confirmStop);
};

ServerAPI.initialQuery = function(){
	var confirmDatabaseLoaded = function(data){
        var dbsParsed = JSON.parse(data.entries);
        document.getElementById('currentDatabaseInfo').innerHTML = dbsParsed.length + ' Databases Loaded';
        document.getElementById('goodStartingSeeds').value = data.goodStartingSeeds;
        var dSelector = document.getElementById('databaseSelector');
        for(var k = 0;k < dbsParsed.length;k++){
            var newVal = document.createElement('option');
            newVal.setAttribute('value', dbsParsed[k].name);
            newVal.innerHTML = dbsParsed[k].name;
            dSelector.appendChild(newVal);
        }
	};
    var command = '?sig=' + Menu.signature;
    command += '&cmd=confirm_database';
    //command += '&address=' + add;
    ServerAPI.xmlRequest('POST', command, confirmDatabaseLoaded);
};


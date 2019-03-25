var ServerAPI = {};
ServerAPI.baseURL = 'http://localhost:80/api';
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

ServerAPI.checkOnJobs = function(){
	var confirmJobs = function(data){
        Menu.renderCurrentJobs(data);
        setTimeout(ServerAPI.checkOnJobs, 1500);
	};
    var command = '?sig=' + Menu.signature;
    command += '&cmd=check_jobs';
    //command += '&address=' + add;
    ServerAPI.xmlRequest('POST', command, confirmJobs);
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

ServerAPI.getHotProductLink = function(){
    var gggg = function(data){
        Menu.renderHighestHits(data);
	};
    var command = '?sig=' + Menu.signature;
    command += '&cmd=get_hit_product_link';
    command += '&index=' + document.getElementById('searchForProductInputIndex').value;
    //console.log(command);
    ServerAPI.xmlRequest('POST', command, gggg);
};

ServerAPI.productSearch = function(){
    var confirmJobs = function(data){
        Menu.renderCurrentJobs(data);
        setTimeout(ServerAPI.checkOnJobs, 3500);
	};
    var command = '?sig=' + Menu.signature;
    command += '&cmd=start_job_search';
    command += '&shop=' + document.getElementById('shopTypeBB').checked + 
        '1' + document.getElementById('shopTypeHD').checked + 
            '1' + document.getElementById('shopTypeCT').checked;
    command += '&search=' + document.getElementById('searchForProductInput').value;
    //console.log(command);
    ServerAPI.xmlRequest('POST', command, confirmJobs);
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

ServerAPI.howManyLightBulbEntries = function(){
	var confirmDatabaseLoaded = function(data){
		document.getElementById('currentDatabaseInfo').innerHTML = data.entries + ' Energy Star certified light bulbs loaded';
	};
    var command = '?sig=' + Menu.signature;
    command += '&cmd=confirm_database';
    //command += '&address=' + add;
    ServerAPI.xmlRequest('POST', command, confirmDatabaseLoaded);
};


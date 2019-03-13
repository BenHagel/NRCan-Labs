const puppeteer = require('puppeteer');
const theUtil = require('util');
const fs = require('fs');

var terms = '' + fs.readFileSync('../productnames.txt');
terms = terms.split('\n');

const sleep = theUtil.promisify(setTimeout);

var imgLinks = [];

var startTime = 0;

//515 seconds

(async () => {
	const browser = await puppeteer.launch();
	const page = await browser.newPage();
	startTime = Date.now();
	//Go to the first page to seed the rest
	await page.goto('https://www.bing.com/search?q=' + terms[0], {  //('https://www.energystar.gov/products', {
		'waitUntil': 'networkidle2',
		'timeout': 10000
	}).then(() => {
		console.log('success');
	}).catch((res) => {
		console.log('fail ' + res);
	});
	page.setViewport({
		width: 1200,
		height: 800
	});

	//console.log('first screen');

	const hrefs = await page.$$eval('a', as => as.map(a => a.href));

	console.log('hrefs: ' + hrefs.length);
	for(var t = 0;t < hrefs.length;t++){
		console.log(t + '/' + hrefs.length);
		var succc = false;
		await page.goto(hrefs[t], {
			'waitUntil': 'networkidle2',
			'timeout': 10000
		}).then(() => {
			console.log('success');
			succc = true;
			
		}).catch((res) => {
			console.log('fail ' + res);
		});
		if(succc){
			const imgs = await page.$$eval('img', as => as.map(img => img.src));
			console.log('found ' + imgs.length + ' links');
		}
		
	}
	
	var endTime = Date.now() - startTime;
	console.log('end time: ' + endTime);
	await page.screenshot({path: 'example3.png'});
	await sleep(1000);
	//page.keyboard.press('Enter');
	await browser.close();
})();

console.log('start pupper');

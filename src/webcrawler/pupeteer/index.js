const puppeteer = require('puppeteer');
const theUtil = require('util');
const fs = require('fs');

var terms = '' + fs.readFileSync('../productnames.txt');
terms = terms.split('\n');

const sleep = theUtil.promisify(setTimeout);

(async () => {
	const browser = await puppeteer.launch();
	const page = await browser.newPage();
	await page.goto('https://www.bing.com/search?q=' + terms[0], {  //('https://www.energystar.gov/products', {
		'waitUntil': 'networkidle2',
		'timeout': 10000
	}).then(() => {
		console.log('succ');
	}).catch((res) => {
		console.log('failed ' + res);
	});
	page.setViewport({
		width: 1200,
		height: 800
	});

	//console.log('first screen');

	const hrefs = await page.$$eval('a', as => as.map(a => a.href));

	for(var t = 0;t < hrefs.length;t++){
		console.log(hrefs[t]);
	}
	

	await page.screenshot({path: 'example3.png'});
	await sleep(1000);
	//page.keyboard.press('Enter');
	await browser.close();
})();

console.log('start pupper');

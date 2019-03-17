const express = require('express');
const app = express();
const port = 80;

app.use(express.static('public'));

app.get('/', (req, res) => res.sendFile('./index.html'));

app.listen(port, function(){console.log('on ' + port)});
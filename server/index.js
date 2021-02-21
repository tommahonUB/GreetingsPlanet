const express = require('express');
const ejs = require('ejs');
const path = require('path');
const bodyParser = require('body-parser');

//Navigation

const clientPath = path.join(__dirname,'../client/')
const staticPath = path.join(clientPath,'/static/');
const viewsPath = path.join(clientPath,'/views/')

//basic server

const app = express();

app.use(express.static(staticPath));
app.use(bodyParser.urlencoded({extended: true}));
app.listen(2000);

//setting views

app.set('view engine', 'ejs');
app.set('views', viewsPath);

//visitor counter

var x = 0;

const counter = function(req, res, next) {
	x++;
	console.log(x);
	next();

}

app.use(counter);

var username = '';

app.get('/', function(req, res) {
	res.render('index', {nomen: username});
});

app.get('/Ryu', counter, function(req, res) {
	res.render('Ryu',{counter: x});
});

app.get('/ChunLi', function(req, res) {
	res.render('ChunLi');
});

app.post('/welcome', (req, res) => {
	console.log(req.body.vistorname);
	username=req.body.visitorname;
	res.redirect('/');
});

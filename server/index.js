const express = require('express');
const ejs = require('ejs');
const path = require('path');
const { response } = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const mongoose = require('mongoose');
const {BlogPost} = require('./models.js')

//Navigation

const clientPath = path.join(__dirname,'../client/')
const staticPath = path.join(clientPath,'/static/');
const viewsPath = path.join(clientPath,'/views/')

//basic server

const app = express();
app.use(express.static(staticPath));
app.use(bodyParser.urlencoded({extended: true}));
app.use(session({
	name: 'Tom',
	secret: 'eachcathad7kittens',
	saveUninitialized: true,
	resave: true,
	cookie: {
		maxage: 1000*60*60*24*3,
	}
}));

mongoose.connect('mongodb://localhost:27017/StreetFighter', {useNewUrlParser: true});
app.listen(2000);

//setting views
app.set('view engine','ejs');
app.set('views',viewsPath);

app.use((req, res, next)=>{
    console.log(req.originalUrl);
    next();
})



//routes

app.get('/', function(req, res) {
	res.render('index', {data: req.session});
});

app.get('/Ryu', function(req, res) {
	res.render('Ryu', {data: req.session});
});

app.get('/ChunLi', function(req, res) {
	res.render('ChunLi', {data: req.session});
});

app.get('/Guile', function(req, res) {
	res.render('Guile', {data: req.session});
});

app.get('/Zangief', function(req, res) {
	res.render('Zangief', {data: req.session});
});

app.get('/Dhalsim', function(req, res) {
	res.render('Dhalsim', {data: req.session});
});

app.get('/Ken', function(req, res) {
	res.render('Ken', {data: req.session});
});

app.get('/Blanka', function(req, res) {
	res.render('Blanka', {data: req.session});
});

app.get('/EHonda', function(req, res) {
	res.render('EHonda', {data: req.session});
});

//new requests since tutorial 4

app.get('/blog', (req, res)=>{
    res.render('blog', {data: req.session});
});

app.get('/writing', (req, res)=>{
    res.render('writing', {data: req.session});
});

app.get('/blog/entry', (req, res)=>{
    res.render('entry', {data: req.session, entry: {}});
});

app.post('/welcome', (req, res) => {
    req.session.username=req.body.nombre;
    res.send('SUCCESS');
});

//tutorial 4 post requests

app.post('/blog/writepost', async (req, res)=>{
	console.log(req.body);
	let newPost = new BlogPost(req.body);
	await newPost.save();
	res.redirect('/');
});

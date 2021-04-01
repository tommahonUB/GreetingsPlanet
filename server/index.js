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

//new get requests since tutorial 4

app.get('/blog/', async (req, res)=>{
		var posts = await BlogPost.find({}, (error, result) =>{
			if(error) {
				console.log(error);
				res.sendStatus(500);
			}
			console.log(result);
    	res.render('blog', {data: req.session, postset: result});
		});
	});

app.get('/writing', (req, res)=>{
    res.render('writing', {data: req.session, draft: {}});
});

app.get('/blog/entry/', (req, res)=>{
    res.render('entry', {data: req.session, entry: {}});
});

app.get('/blog/:id/', (req, res) => {
		var searchID = req.params.id;
		BlogPost.findById(searchID, (error, result) => {
			if(error) {
				console.log(error);
				res.redirect('/blog/');
			}
			else if(!result) {
				res.status(404);
			}
			else {
				res.render('entry',{data: req.session, entry: result});
			}
		})
});

app.get('/blog/:id/edit', (req,res)=>{
    BlogPost.findById(req.params.id, (error, result)=>{
        if(error) res.redirect('/blog/');
        else if(!result) res.redirect('/blog/');
        else res.render('writing', {data: req.session, draft: result} );
    });
});

app.get('/blog/:id/delete', (req, res)=>{
    BlogPost.deleteOne({_id: req.params.id}, (error, result)=>{
        if(error) {
            console.log(error);
        }
        res.redirect('/blog/');
    });
});

app.post('/welcome', (req, res) => {
    req.session.username=req.body.nombre;
    res.send('SUCCESS');
});

//tutorial 4 post requests {title: req.body.title, body: req.body.entrytext}

app.post('/blog/writepost', async (req, res)=>{
	console.log(req.body);
	try {
		let newPost = new BlogPost(req.body);
		await newPost.save();
		res.redirect('/blog/');
	}
	catch(e) {
		res.redirect('/blog/writing/')
	}
});

app.post('/blog/:id/edit', (req, res)=>{
    BlogPost.findById(req.params.id, (error, result)=>{
        if(error) {
            console.log(error);
            res.status(500);
        }
        else if (result) {
            result.title = req.body.title;
            result.body = req.body.body;
            result.save();
            res.redirect(path.join('/blog/', req.params.id));
        }
        else res.redirect('/blog/');
    });
});

//tutorial 4 other put and delete requests

app.put('/blog/:id/update', (req, res)=> {
	console.log(req);
	res.redirect('/blog/');
});

app.delete('/blog/:id/update', (req, res) => {
	console.log(req);
	res.redirect('/blog/');
});

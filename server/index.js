const express = require('express');
const ejs = require('ejs');
const path = require('path');
const session = require('express-session');
const mongoose = require('mongoose');
const {BlogPost, User} = require('./models.js')
const bcrypt = require('bcrypt');

//Navigation

const clientPath = path.join(__dirname,'../client/')
const staticPath = path.join(clientPath,'/static/');
const viewsPath = path.join(clientPath,'/views/')

//basic server

const app = express();
app.use(express.static(staticPath));
app.use(express.urlencoded({extended: true}));
app.use(session({
	name: 'Tom',
	secret: 'eachcathad7kittens',
	saveUninitialized: true,
	resave: true,
	cookie: {
		maxage: 1000*60*60*24*3,
	}
}));

//BLOG Routes lol

const authenticated = function(req, res, next) {
    if(req.session.authenticated) next();
    else res.redirect('/login');
}

const hadouken = function(req, res, next) {
    if(req.session.isHadouken) next();
    else res.send('YOU HAVE TO GET AN ACCOUNT TO STAND A CHANCE.');
}

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

app.get('/register', (req, res) => {
    res.render('register', {data: req.session});
});

app.get('/login', (req, res) => {
    res.render('login', {data: req.session});
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

app.get('/writing', authenticated, hadouken, (req, res)=>{
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
				console.log(result);
				let parsedText = result.body.replace(/\r\n|\r|\n/g,"<br />")
				result.parsedText = parsedText;
				res.render('entry',{data: req.session, entry: result});
			}
		})
});

app.get('/blog/:id/edit', hadouken, (req,res)=>{
    BlogPost.findById(req.params.id, (error, result)=> {
      if(error) res.redirect('/blog/');
      else if(!result) res.redirect('/blog/');
      else res.render('writing', {data: req.session, draft: result} );
  });
});

app.get('/blog/:id/delete', hadouken, (req, res)=>{
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

app.post('/blog/writepost', authenticated, hadouken, async (req, res)=>{
	console.log(req.body);
	try {
		let newPost = new BlogPost(req.body);
		newPost.author = req.session.username;
		await newPost.save();
		res.redirect('/blog/');
	}
	catch(e) {
		res.redirect('/blog/writing/', {data: req.session});
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
            res.redirect('/blog/');
        }
        else res.redirect('/blog/');
    });
});

//tutorial 4 other put and delete requests

app.put('/blog/:id/update', (req, res)=> {
	console.log(req);
	res.redirect('/blog/');
});

app.delete('/blog/:id/update', hadouken, (req, res) => {
	BlogPost.deleteOne({id: req.params.id}, (error, result)=> {
		if(error) {
			console.log(error);
		}
		res.redirect('/blog/');
	});
	console.log(req);
});

app.post('/register', async (req, res)=>{
    try {
        let rawpass = req.body.password;
        var hashedpass = await bcrypt.hash(rawpass, 10);
        var user = new User(req.body);
        user.password = hashedpass;
        await user.save();
        res.redirect('/login');
    }
    catch(e) {
        console.log(e);
        res.send("Unable to register!");
    }
})

app.post('/login', (req, res)=>{
    User.findOne({username: req.body.username}, async (error, result)=>{
        if(error) {
            console.log(error);
            res.send("!");
        }
        else if(!result) res.send("User not found.");
        else {
            try {
                let match = await bcrypt.compare(req.body.password, result.password);
                if(match) {
                    req.session.username = result.username;
                    req.session.authenticated = true;
                    req.session.isHadouken = result.isHadouken;
                    res.redirect('/blog/');
                }
                else res.send('Incorrect password');
            }
            catch(e) {
                console.log(e);
                res.send('Error');
            }

        }
    })

})

//comments

app.post('/blog/:id/comment', hadouken, (req, res)=>{
	BlogPost.findById(req.params.id, (error, result)=>{
        if(error) {
            console.log(error);
            res.send('Error');
        }
        else if(!result) {
            res.redirect('/blog/');
        }
        else {
            result.comments.push({author: req.session.username, text: req.body.comment});
            result.save();
            res.redirect(path.join('/blog/', req.params.id+'/'));
        }
    });
});

app.post('/blog/:id/deletecomment/:comment', hadouken, (req, res)=>{
	console.log(req.body);
	res.send('Deleting comment');
});

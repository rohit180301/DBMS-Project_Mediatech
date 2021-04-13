//Load modules
const express = require('express');
const Handlebars = require('handlebars');
const exphbs = require('express-handlebars');
const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access');

const mongoose = require('mongoose');
const passport = require('passport');
const session = require("express-session");
const bodyParser = require("body-parser"); 
const cookieParser = require('cookie-parser');
const methodOverride = require('method-override');
//Connect to MongoURI exported from external file
const keys = require('./config/keys');
//Load models
const User = require('./models/user');
const Post = require('./models/post');
const Mentor = require('./models/mentor');
//Link passports to the server
require('./passport/google.passport');
require('./passport/facebook-passport');
require('./passport/Linkedin-passport');
//Link helpers
const {
    ensureAuthentication,
    ensureGuest
} = require('./helpers/auth'); 
const user = require('./models/user');
//initialize application
const app = express();
//Express config
app.use(cookieParser());
app.use(bodyParser.urlencoded({ 
    extended: false
}));
app.use(bodyParser.json());
app.use(session({ 
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true
}));
app.use(methodOverride('_method'));
app.use(passport.initialize());
app.use(passport.session());
//set gobal vars for user
app.use((req,res,next)=> {
    res.locals.user = req.user || null;
    next();
});
//setup template engine
app.engine('handlebars',exphbs({
    // defaultLayout:'main'
    handlebars: allowInsecurePrototypeAccess(Handlebars)
}));

app.set('view engine','handlebars');
//setup static file to serve css,javascript and images
app.use(express.static('public'));
//connect to remote database
mongoose.Promise =global.Promise;
mongoose.connect(keys.MongoURI,{
    useNewUrlParser:true
})
.then(() =>{
    console.log('Connected to Remote Database.....');
}).catch((err) =>{
    console.log(err);
});
//set environment variable for port
const port = process.env.PORT || 3000;

//Handle routes
app.get('/', ensureGuest, (req, res)=>{
    res.render('home');
});

app.get('/about',(req,res)=>{
    res.render('about');
});

// GOOGLE AUTH ROUTE
app.get('/auth/google',
    passport.authenticate('google', { 
    scope: ['profile','email'] 
    }));       

app.get('/auth/google/callback', 
    passport.authenticate('google', { 
        failureRedirect: '/'
    }),
    (req, res) =>{
    // Successful authentication, redirect home.
        res.redirect('/profile');
    });
//FACEBOOK AUTH ROUTE
app.get('/auth/facebook',
    passport.authenticate('facebook',{
        scope: 'email'
    }));

app.get('/auth/facebook/callback',
    passport.authenticate('facebook', {      
        failureRedirect: '/' 
    }),
    (req, res) => {
    // Successful authentication, redirect home.
        res.redirect('/profile');
});  
//HANDLE LINKEDIN AUTH ROUTE
app.get('/auth/linkedin',
    passport.authenticate('linkedin',{
        scope: ['r_emailaddress', 'r_liteprofile']
    }));

app.get('/auth/linkedin/callback', 
    passport.authenticate('linkedin', {
        failureRedirect: '/' 
    }),
    (req, res) => {
        // Successful authentication, redirect home.
        res.redirect('/profile');
    });
//Handle profile route 
app.get('/profile',ensureAuthentication, (req,res) => {
    Post.find({user: req.user._id})
    .populate('user')
    .sort({date:'desc'})
    .then((posts) => {
        res.render('profile',{
            posts:posts
        });
    });
});
/*
//Handle route for all users
app.get('/users', ensureAuthentication, (req,res) => {
    User.find({})
    .then((users)=> {
        res.render('users',{
            users:users
        });    
    });
});
*/
//Display one mentor profile
app.get('/mentor/:id', (req,res) => {
    Mentor.findById({_id: req.params.id})
    .then((mentor) => {
        res.render('mentor', {
            mentor: mentor
        });
    });
});
//Handle route for all mentors
app.get('/mentors', ensureAuthentication, (req,res) => {
    Mentor.find({})
    .then((mentors)=> {
        res.render('mentors',{
            mentors:mentors
        });    
    });
});

//Display one user profile
/*
app.get('/user/:id', (req,res) => {
    User.findById({_id: req.params.id})
    .then((user) => {
        res.render('user', {
            user: user
        });
    });
});
*/
//Handle phone post route
app.post('/addPhone', (req, res) => {
    const phone = req.body.phone;
    User.findById({_id: req.user._id})
    .then((user) => {
        user.phone = phone;
        user.save()
        .then(() => {
            res.redirect('/profile');
        });
    });
});
//Handle Location post route
app.post('/addLocation',(req,res) => {
    const location = req.body.location;
    User.findById({_id: req.user._id})
    .then((user) => {
        user.location = location;
        user.save()
        .then(() => {
            res.redirect('/profile');
        });
    });
});
//Handle College post route
app.post('/addcollege',(req,res) => {
    const college = req.body.college;
    User.findById({_id: req.user._id})
    .then((user) => {
        user.college = college;
        user.save()
        .then(() => {
            res.redirect('/profile');
        });
    });
});
//Handle get routes for posts
app.get('/addPost', (req,res) => {
    res.render('addPost');
});
//Handle post route
app.post('/savePost', (req,res) => {
    var allowComments;
    if(req.body.allowComments){
        allowComments = true;
    }else{
        allowComments = false;
    }
    const newPost = {
        title: req.body.title,
        body: req.body.body,
        status: req.body.status,
        allowComments: allowComments,
        user: req.user._id
    }
    new Post(newPost).save()
    .then(() => {
        res.redirect('/posts');
    });
});
//Handle edit post route
app.get('/editPost/:id', (req,res) => {
    Post.findOne({_id: req.params.id})
    .then((post) => {
        res.render('editingPost', {
            post:post
        });
    });
});
//Handle PUT route to save edited post
app.put('/editingPost/:id', (req, res) => {
    Post.findOne({_id: req.params.id})
    .then((post) => {
        var allowComments;
        if(req.body.allowComments){
            allowComments = true;
        }else{
            allowComments = false;
        }
        post.title = req.body.title;
        post.body = req.body.body;
        post.status = req.body.status;
        post.allowComments = allowComments;
        post.save()
        .then(() => {
            res.redirect('/profile');
        });
    });
});
//Handle delete route
app.delete('/:id', (req, res) => {
    Post.remove({_id: req.params.id})
    .then(() => {
        res.redirect('/profile');
    });
});
//Handle posts route
app.get('/posts', ensureAuthentication, (req,res) => {
    Post.find({status:'public'})
    .populate('user')
    .populate('comments.commentUser')
    .sort({date:'desc'})
    .then((posts) => {
        res.render('publicPosts',{
            posts:posts
        });
    });
});
//Display single user all public posts
app.get('/showposts/:id', (req,res) => {
    Post.find({user: req.params.id, status: 'public'})
    .populate('user')
    .sort({date: 'desc'})
    .then((posts) => {
        res.render('showUserPosts', {
            posts:posts
        });
    });
});
//Save comments to database
app.post('/addComment/:id', (req,res) => {
    Post.findOne({_id: req.params.id})
    .then((post) => {
        const newComment = {
            commentBody: req.body.commentBody,
            commentUser: req.user._id
        }
        post.comments.push(newComment)
        post.save()
        .then(() => {
            res.redirect('/posts')
        });
    });
});
//Handle User logout route
app.get('/logout',(req, res) =>{
    req.logout();
    res.redirect('/');
});  
app.listen(port, () =>{
    console.log(`server is running on port ${port}`);
});


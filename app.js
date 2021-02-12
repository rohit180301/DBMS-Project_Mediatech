//Load modules
const express = require('express');
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');
 
//Connect to MongoURI exported from external file
const keys = require('./config/keys');
//initialize application
const app = express();
//setup template engine
app.engine('handlebars',exphbs({
    defaultLayout:'main'
}));

app.set('view engine','handlebars');
//sertup static file to serve css,javascript and images
app.use(express.static('public'));
//connect to remote database
mongoose.connect(keys.MongoURI,{
    useNewUrlParser:true
})
.then(()=>{
    console.log('Connected to Remote Database.....');
}).catch((err)=>{
    console.log(err);
});
//set environment variable for port
const port = process.env.PORT || 3000;

//Handle routes
app.get('/',(req, res)=>
{
    res.render('home');
});

app.get('/about',(req,res)=>{
    res.render('about');
});


app.listen(port, () =>
{
    console.log('Server is running on port 3000');
});

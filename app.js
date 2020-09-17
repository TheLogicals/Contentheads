//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const lodash = require('lodash');
const mongoose = require('mongoose');
const request = require('request');
const https = require('https');
require('dotenv').config();

mongoose.connect("mongodb://localhost:27017/blogDB",{useNewUrlParser:true,useUnifiedTopology:true},function(err){
  if(err){
    console.log(err);
  }else{
    console.log("Datbase connected successfully!");
  }
})

const blogSchema={
  title : String,
  content : String
}
const Blog = mongoose.model("Blog",blogSchema);

const articleSchema = {
  title : String,
  description : String,
  url : String,
  urlToImage : String
}

const Article = mongoose.model("Article",articleSchema);


const homeStartingContent = "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Odio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie a iaculis at erat pellentesque adipiscing.";
const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const url = 'http://newsapi.org/v2/top-headlines?' +
          'country=us&' +
          'apiKey='+ process.env.API_KEY;

app.get('/',function(req,res){
  request(url, { json: true }, (err, response, body) => {
    if (err) { return console.log(err); }
    var articles = body.articles;
    //console.log(articles);
    res.render("home",{blogs : articles});
  });
  
})

app.get('/about',function(req,res){
  Article.find(function(err,articles){
    if(err){
      console.log(err);
    }else{
      res.render("about",{
        blogs : articles
      });
    }
  })
})

app.get('/contact',function(req,res){
  res.render("contact",{contactContent:contactContent});
})

app.get('/compose',function(req,res){
  res.render("compose");
})

app.get('/posts/:topic',function(req,res){
  let topic=req.params.topic;
  let find=false;

  Blog.find(function(err,blogs){
    if(err){
      console.log(err);
    }else{
      blogs.forEach(function(blog){
        if(lodash.lowerCase(blog.title)===lodash.lowerCase(topic)){
          res.render("post",{
            post:blog
          });
        };
      });
    }
  })

})

app.post('/compose',function(req,res){
  const blog =new Blog({
    title : req.body.postTitle,
    content : req.body.postBody
  })
  blog.save();
  res.redirect("/");
})

app.post('/Save',function(req,res){
   console.log(req.body);
   const aricle =new Article({
    title : req.body.title,
    description : req.body.description,
    url : req.body.url,
    urlToImage : req.body.urlToImage
  });
  aricle.save();
   res.redirect("/");
})
app.post('/delete',function(req,res){
  Article.findByIdAndRemove(req.body.articleId,function(err){
    if(!err){
      console.log("Succesfully deleted.");
      res.redirect('/about');
    }
  })
})
app.listen(3000, function() {
  console.log("Server started on port 3000");
});

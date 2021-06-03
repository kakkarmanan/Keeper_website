const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const mongoose = require("mongoose");
const autoIncrement = require("mongoose-auto-increment");
const { eachRight } = require("lodash");
const encrypt = require("mongoose-encryption");

  mongoose.connect("mongodb://localhost:27017/UserDB",{ useUnifiedTopology: true, useNewUrlParser: true, useFindAndModify: false });


  const noteSchema = new mongoose.Schema({
    username: String,
   n_title: String,
   n_content: String
   });

  const reminderSchema = new mongoose.Schema({
    username: String,
  r_title: String,   
  r_time: Date
});

  const userSchema = new mongoose.Schema({
   username: String,
   email: String,
   password: String,
  });

  const secret = "Thisisthekeeperwebsite.";
  userSchema.plugin(encrypt, { secret: secret, encryptedFields: ["password"] });


 const User = mongoose.model("User", userSchema);
 const Note = mongoose.model("Note",noteSchema);
 const Reminder = mongoose.model("Reminder",reminderSchema);

  
const app = express();

app.use(express.static("public"));
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({ extended: true}));

var notes=[];
var reminders=[];

app.get("/", function(req, res){
  res.render("home");
});

app.get("/login", function(req, res){
  res.render("login");
});

app.get("/register", function(req, res){
  res.render("register");
});

app.post("/register", function(req, res){
  const newUser= new User({
      username: req.body.username,
      email: req.body.mail,
      password: req.body.password
  });

  newUser.save(function(err){
    if(err){
      console.log(err);
    } else{
      res.render("note",{user:req.body.username, notes: notes});
    }
  });
});

app.post("/login", function(req, res){

  const email= req.body.mail;
  const password = req.body.password;

  User.findOne({email: email}, function(err, foundUser){
    if(err){
      console.log(err);
    } else{
      if(foundUser){
        if(foundUser.password === password) {
          let username = foundUser.username;
          console.log(username);
          Note.find({username : username},function(err, foundNotes){
              console.log(foundNotes);
              res.render("note", {user: username, notes: foundNotes});
          });
        } 
      }
    }
  });
});

app.get("/note",function(req, res){

  let username = req.body.username;

  Note.find({username : username},function(err, foundNotes){
    if(foundNotes.length===0){
      res.render("note", {user: username, notes: foundNotes});
    } else{
      res.render("note", {user: username, notes: foundNotes});
    }
  });
});

app.get("/reminder",function(req, res){

  let username = req.body.username;

  Reminder.find({username : username},function(err, foundReminders){
    if(foundNotes.length===0){
      res.render("reminder", {user: username, reminders: foundReminders});
    } else{
      res.render("reminder", {user: username, notes: foundReminders});
    }
  });
});

app.post("/note", function(req,res)
{

  let username = req.body.username;
  let title = req.body.noteTitle;
  let content= req.body.noteContent;
  
  // console.log(username);
  // console.log(title);
  // console.log(content);

  const newNote = new Note(
    {
    username:username,
    n_title: title,
    n_content: content
  });

  newNote.save(function(err)
  {
    if(err)
    {
      console.log(err);
    } else
    {
      Note.find({username : username},function(err, foundNotes){
      res.render("note", {user: username, notes: foundNotes});
    });
  }
  });

});



app.post("/reminder",function(req, res){

  let username = req.body.username;
  let title = req.body.reminderTitle;
  let time = req.body.reminderTime;

  // console.log(username);
  // console.log(title);
  // console.log(time);


  const newReminder = new Reminder({
    username: username,
    r_title: title,
    r_time: time
  });

  newReminder.save(function(err){
    if(err){
      console.log(err);
    } else{
      Reminder.find({username: username}, function(err,foundReminders){
        res.render("reminder",{user: username, reminders: foundReminders});
      });
      
    }
  });
  
});

app.post("/reminderPage", function(req, res){
  let username = req.body.username;
  Reminder.find({username: username}, function(err,foundReminders){
    res.render("reminder",{user: username, reminders: foundReminders});
  });
});

app.post("/notePage", function(req, res){
  let username = req.body.username;

  Note.find({username: username}, function(err,foundNotes){
    res.render("note",{user: username, notes: foundNotes});
  });
});

app.post("/deleteNote", function(req, res){
  let CheckedNoteId = req.body.noteId;
  let username = req.body.username;

  Note.findByIdAndRemove(CheckedNoteId, function(err){
    if (!err) {
      Note.find({username: username}, function(err,foundNotes){
        res.render("note",{user: username, notes: foundNotes});
      });
    }
  });
});

app.post("/deleteReminder", function(req, res){
  let CheckedReminderId = req.body.reminderId;
  let username = req.body.username;


  Reminder.findByIdAndRemove(CheckedReminderId, function(err){
    if (!err) {
      Reminder.find({username: username}, function(err,foundReminders){
        res.render("reminder",{user: username, reminders: foundReminders});
      });
    }
  });
});


app.listen(3000, function(){
  console.log("Server started on port 3000.");
});

var express = require("express");
var app     = express();
var path    = require("path");
var mysql = require('mysql');
var router = express.Router();
var session = require('express-session')
var bodyParser = require('body-parser');
var nunjucks = require('nunjucks');
var pug = require('pug');
app.set('views',path.join(__dirname,'views'));

app.set('view engine','hbs')



app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'static')));
router.get('/',function(req,res){
  res.sendFile(path.join(__dirname+'/home.html'));

});
router.get('/home',function(req,res){
  res.sendFile(path.join(__dirname+'/home.html'));

});
router.get('/register',function(req,res){
  res.sendFile(path.join(__dirname + '/register.html'));
});
router.get('/login',function(req,res){
  res.sendFile(path.join(__dirname + '/login.html'));
});
router.get('/regUser',function(req,res){
  res.sendFile(path.join(__dirname+'/regUser.html'));

});
app.use("/",router);
var con = mysql.createConnection({multipleStatements: true,
  host: "craignatoli.chsku6cdeo0o.us-east-2.rds.amazonaws.com",
  user: "cs336",
  password: "craignatoli",
  database : 'login'
});
;
con.connect(function(err) {
	if (err) throw err

});

app.post('/submitform',function(req,res){

  var username=req.body.username;
  var password=req.body.password;



  var sql = "INSERT INTO register (username, password) VALUES ('"+username+"', '"+password+"')";
  con.query(sql, function (err, result) {
           res.redirect('/login');
      });

 })
 app.post('/regform',function(req,res){

   var username=req.body.username;
   var password=req.body.password;



   var sql = "INSERT INTO register (username, password) VALUES ('"+username+"', '"+password+"')";
   con.query(sql, function (err, result) {
            res.redirect('/admin');
       });

  })
app.post('/Login',function(req,res){

     var username=req.body.username;
     var password=req.body.password;

      con.query('SELECT * FROM register WHERE username =?', [username], function (err, result) {

      if (result.length > 0) {
  				req.session.loggedin = true;
  				req.session.username = username;
					req.session.password = password;
					res.redirect('/loginhome');

					console.log('User'+username +' Exists');
			}
      else
			{
				res.send('Incorrect Username and/or Password!');
      }

      });


})

app.post('/Admin',function(req,res){
	var username=req.body.username;
	var password=req.body.password;


	 con.query('SELECT * FROM admin WHERE usernamead =? and passwordad =?', [username,password], function (err, result) {

	 if (result.length > 0) {
			 req.session.loggedin = true;
			 req.session.username = username;
			 req.session.password = password;
			 res.redirect('/admin');


			 console.log('User'+username +' Exists');
	 }
	 else
	 {
		 res.send('Incorrect Username and/or Password!');
	 }

	 });


 })
app.post('/edit',function(req,res){
 	  var username=req.body.edit;
	  console.log(username);
		con.query('SELECT username, password FROM register where username =?',[username], function (err, result) {
			 //response.render('Edit',{username: request.session.edit});
			  res.render('Edit',{result: result});
				});

  })

app.get('/loginhome', function(request, response) {

	response.render('loginhome', { username: request.session.username, password:request.session.password });

});
app.get('/admin', function(request, response) {
	con.query('SELECT username,password FROM register', function (err, result) {
		 response.render('admin',{result: result});
	});
});


app.get('/h',function(req,res) {

	username = req.session.username;
	con.query('SELECT symbol, price, mkp FROM watch_list WHERE username =?', [username], function (err, result) {
		 res.render('watchlist2',{result: result, username:username});

	});

});



app.get('/logout', function(request, response) {
	// Destroy session data
	request.session.destroy();
	// Redirect to login page
	response.redirect('/');
});

app.get('/delete', function(request, response) {
		con.query('DELETE FROM watch_list', function (err, result) {
			//response.render('/admin');
			console.log("Number of records deleted: " + result.affectedRows);

	});
	con.query('DELETE FROM register', function (err, result) {
			//response.render('/admin');
			console.log("Number of records deleted: " + result.affectedRows);
		  response.redirect('/admin');
	});

});

app.post('/newusername',function(req,res){
	var username=req.body.oldusername;
	var newusername=req.body.newUsername;
	console.log(username);
	console.log(newusername);
	con.query('UPDATE register SET username =? where username =? ', [newusername,username], function (err, result) {
			//res.render('/Edit');
	 });
	 con.query('UPDATE watch_list SET username =? where username =? ', [newusername,username], function (err, result) {
 			res.redirect('/admin');
 	 });
 })

 app.post('/newpassword',function(req,res){
 	var password=req.body.oldpassword;
 	var newpassword=req.body.newPassword;
 	console.log(password);
 	console.log(newpassword);
 	con.query('UPDATE register SET password =? where password =? ', [newpassword,password], function (err, result) {
 			res.redirect('/admin');
 	 });
  })

	app.get('/profileedit', function(request, response) {

		response.render('editlogin',{username:request.session.username,password:request.session.password});
	});

	app.post('/newusername1',function(req,res){
		var username=req.body.oldusername;
		var newusername=req.body.newUsername;
		console.log(username);
		console.log(newusername);
		con.query('UPDATE register SET username =? where username =? ', [newusername,username], function (err, result) {
				//res.render('/Edit');
		 });
		 con.query('UPDATE watch_list SET username =? where username =? ', [newusername,username], function (err, result) {
	 			res.redirect('/login');
	 	 });
	 })

	 app.post('/newpassword1',function(req,res){
	 	var password=req.body.oldpassword;
	 	var newpassword=req.body.newPassword;
	 	console.log(password);
	 	console.log(newpassword);
	 	con.query('UPDATE register SET password =? where password =? ', [newpassword,password], function (err, result) {
	 			res.redirect('/login');
	 	 });
	  })
	app.post('/deleteuser',function(req,res){
  	var username=req.body.dusername;
  	var password=req.body.dpassword;
  	console.log(username);
  	console.log(password);
  	con.query('DELETE FROM register WHERE username =? AND password =?', [username,password], function (err, result) {
  	 });
		 con.query('DELETE FROM watch_list WHERE username =?', [username], function (err, result) {
   			res.redirect('/admin');
   	 });
   })

	 app.post('/deleteuser1',function(req,res){
   	var username=req.body.dusername;
   	var password=req.body.dpassword;
   	console.log(username);
   	console.log(password);
   	con.query('DELETE FROM register WHERE username =? AND password =?', [username,password], function (err, result) {
   	 });
 		 con.query('DELETE FROM watch_list WHERE username =?', [username], function (err, result) {
    			res.redirect('/');
    	 });
    })
app.post('/deletesym',function(req,res){
	var username=req.session.username;
	var symbol=req.body.symbol1;
	console.log(username);
	console.log(symbol);
	con.query('DELETE FROM watch_list WHERE username =? AND symbol =?', [username,symbol], function (err, result) {
		res.redirect('/h')
	 });
})

app.post('/watchlist',function(req,res){

     var username=req.session.username;
		 var symbol = req.body.symbol;
		 var price = req.body.price;
		 var mprice = req.body.mprice;
   	 var sql = "INSERT INTO watch_list(username,symbol,price,mkp) VALUES ('"+username+"','"+symbol+"','"+price+"','"+mprice+"')ON DUPLICATE KEY UPDATE symbol=symbol";
		con.query(sql, function (err, result) {
						 res.redirect('/loginhome');
			});
})

  app.listen(8080);
  console.log("Running at Port 8080");

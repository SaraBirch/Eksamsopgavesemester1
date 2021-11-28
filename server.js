var express = require('express');
var session = require('express-session');
var formidable = require('formidable');


const path = require('path');
const { writeproductdata } = require('./database');
const database = require('./database');

var app = express();
var PORT = 4000;
var productlist = [];
// We now need to let Express know we'll be using some of its packages:

function saveproduct(request) {
	const bSuccess = false
	var productpicture = request.query.productpicture;
	var index = request.query.index;
	var productname = request.query.productname
	var productcategory = request.query.productcategory;
	if (productcategory && productname && productpicture) {
		let productobj = new Object();
		productobj.productname = productname;
		productobj.productpicture = productpicture;
		productobj.productcategory = productcategory;
		productlist.push(productobj);
		database.writeproductdata(productlist);
		bSuccess = true;
	}
	return bSuccess
}
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.engine('.html', require('ejs').renderFile);

//serving public file
app.use(express.static(__dirname));


app.listen(PORT, function(err){
	if (err) console.log(err);
	console.log("Server listening on PORT", PORT);
});

//the sessions package is what we'll use to determine if the user is logged-in, the bodyParser package will extract the form data from our login.html file.
// We now need to display our login.html file to the client:
// forside 
app.get('/', function(request, response) {
	response.sendFile(path.join(__dirname + '/views/index.html')); //path.join method joins the specified path segments into one path.
});

app.get('/createuser', function(request, response) {
	response.sendFile(path.join(__dirname + '/views/createuser.html')); //når vi trykker på knappe i main.html, kalder den createuser entry point, og redirkter til create.html
});

// når vi klikker på knappen er det denne funktion som "virker", og for at logge ind sender den os til login.html" 
app.get('/login', function(request, response) {
	response.sendFile(path.join(__dirname + '/views/login.html'));
});

app.get('/updateuser', function(request, response) {
	let userobj = database.readuserdata();

	response.render(path.join(__dirname + '/views/updateuser.html'), {name : userobj.name, username: userobj.username, password : userobj.password})
});

app.get('/deleteuser', function(request, response) {
	if (request.session.loggedin) {
		database.deleteuser();
		response.sendFile(path.join(__dirname + '/views/index.html'));
	} else {
		response.send('Please login to view this page!');
	}	
});

app.get('/login', function(request, response) {
	response.sendFile(path.join(__dirname + '/views/login.html'));
});

app.get('/updateuser', function(request, response) {
	if (request.session.loggedin) {
		let userobj = database.readuserdata();
		response.render(path.join(__dirname + '/views/updateuser.html'), {name : userobj.name, username: userobj.username, password : userobj.password})
	} else {
		response.send('Please login to view this page!');
	}	
});


app.get('/createproduct', function(request, response) {
	if (request.session.loggedin) {
		response.sendFile(path.join(__dirname + '/views/createproduct.html'));
	} else {
		response.send('Please login to view this page!');
	}	
});


app.get('/getallproducts', function(request, response) {
	productlist = database.readproducts();
	response.send(productlist);
});


app.get('/deleteproductnumber', function(request, response) {
	let number = request.query.value;
	productlist.splice(parseInt(number)-1,1);
	writeproductdata(productlist);
	response.sendFile(path.join(__dirname + '/views/deleteproduct.html'));
});

app.get('/updateproductdetail', function(request, response) {
	let number = request.query.value;
	response.send(productlist[parseInt(number-1)])
});

app.get('/showcategory', function(request, response) {
	let category = request.query.value;
	if (productlist.length == 0) { productlist = database.readproducts()}
	
	let filterlist = productlist.filter( x => //x = værdi
		x.productcategory == category
	);
	response.send(filterlist);
});

// 

//When the client connects to the server the login page will be displayed, the server will send the login.html file. 
//We need to now handle the POST request, basically what happens here is when the 
//client enters their details in the login form and clicks the submit button, the 
//form data will be sent to the server, and with that data our login script will 
//check in our file to see if the details are correct.

app.post('/authenticate', function(request, response) { //trykker på html knappen sender den data til auth
	var username = request.body.username;
	var password = request.body.password;
	if (username && password) 
	{
		if (database.checkuserandpassword(username, password)) 
		{
			request.session.loggedin = true;
			request.session.username = username;
			response.redirect('/views/main.html'); //hvis det er rigtig login, bliver vi sendt til main html siden
		} 
		else 
		{
			response.send('Incorrect Username and/or Password!'); 
		}			
		response.end();
	} 
	else 
	{
		response.send('Please enter Username and Password!'); //hvis ikke intagstet noget 
		response.end();
	}
});

app.post('/updateproductwithid', function(request, response) {
	if (request.session.loggedin) {
		if (saveproduct(request)) {
			var index = request.query.index;
			productlist.splice(nIndex - 1, 1)
			response.sendFile(path.join(__dirname + '/views/updateproduct.html'));
		} else {
			response.send('Please enter Procduct Name, Product Category and Picture!');
			response.end();
		}
	} else {
		response.sendFile(path.join(__dirname + '/views/login.html'));
	}
});

app.post('/saveuser', function(request, response) {
	if (request.session.loggedin) {
		var name = request.body.name
		var username = request.body.username;
		var password = request.body.password;
		
		if (username && password && name) 
		{
			let userobj = new Object()
			userobj.name = name;
			userobj.username = username;
			userobj.password = password;
			database.writeuserdata(userobj); //konventere objekt intil en .json for at serven gennem 
			response.send('User created!!');
			response.end();
		} 
		else 
		{
			response.send('Please enter Name, Username and Password!');
			response.end();
		} 
	} else {
			response.send('Please login to view this page!');
		}
});

app.get('/logoutuser', function(request, response) {
	request.session.destroy();
	response.sendFile(path.join(__dirname + '/views/index.html'));
});

app.post('/saveproduct', function(request, response) {
	if (request.session.loggedin) {
		if (saveproduct(request)) {
			response.send('Product created!!');
			response.end();
		} else {
			response.send('Please enter Procduct Name, Product Category and Picture!');
			response.end();
		}
	} else {
		response.sendFile(path.join(__dirname + '/views/login.html'));
	}
});	

app.get('/home', function(request, response) {
	if (request.session.loggedin) {
		response.send('Welcome back, ' + request.session.username + '!');
	} else {
		response.send('Please login to view this page!');
	}
	response.end();
});


// update user, deleteuser, 

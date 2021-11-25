// Opret serveren, programmet køre på
express = require('express')
var session = require('express-session');
const app = express();

const PORT = 4000
app.listen(PORT, () => {
    console.log('the server is running')
})

const path = require('path') // bruger vi denne funktion path
const database = require('./database'); // importere alle funktioner fra database.js


app.use(session({ // ønsker at køre session, (google) 
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true })); //hvis vi bruger æøå, bliver det konveteret til ikke dansk
app.set('view engine', 'ejs');
app.engine('.html', require('ejs').renderFile); // henter ejs, funktioner stillet til rådighed 

//serving public file - fortælle foller hirakiret kommer fra denne standarden 
app.use(express.static(__dirname)); 

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

app.get('/home', function(request, response) {
	if (request.session.loggedin) {
		response.send('Welcome back, ' + request.session.username + '!');
	} else {
		response.send('Please login to view this page!');
	}
	response.end();
});

// update user, deleteuser, 

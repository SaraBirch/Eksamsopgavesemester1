// Opret serveren, programmet køre på
express = require('express')
var session = require('express-session');
const app = express();

const PORT = 4000
app.listen(PORT, () => {
    console.log('the server is running')
})

const path = require('path') // 
const database = require('./database'); // 


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

// forside 
app.get('/', function(request, response) {
	response.sendFile(path.join(__dirname + '/views/index.html')); //path.join method joins the specified path segments into one path.
});

app.get('/createuser', function(request, response) {
	response.sendFile(path.join(__dirname + '/views/createuser.html'));
});

// når vi klikker på knappen er det denne funktion som "virker", og for at logge ind sender den os til login.html" 
app.get('/login', function(request, response) {
	response.sendFile(path.join(__dirname + '/views/login.html'));
});


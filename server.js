var express = require('express');
var session = require('express-session');


const path = require('path');
const { writeproductdata } = require('./database');
const database = require('./database');
const formData = require('express-form-data');

var app = express();
var PORT = 3000;
var productlist = [];
// We now need to let Express know we'll be using some of its packages:

app.use(session({
	secret: 'de!"hh87€#!"787654',
	resave: true,
	saveUninitialized: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.engine('.html', require('ejs').renderFile);

//serving public file
app.use(express.static(__dirname));
app.use('/product_pictures', express.static('product_pictures'))

const options = { uploadDir: './product_pictures' }

app.use(formData.parse(options));

server = app.listen(PORT, function (err) {
	if (err) console.log(err);
	console.log("Server listening on PORT", PORT);
});

module.exports = server;

//the sessions package is what we'll use to determine if the user is logged-in, the bodyParser package will extract the form data from our login.html file.
// We now need to display our login.html file to the client:

function saveproduct(request) {
	let { productname, productcategory, productprice } = request.body;
	var bSuccess = false
	var productpicture = request.files.productpicture.path;


	if (productcategory && productname && productpicture && productprice) {
		let productobj = new Object();
		productobj.productname = productname;
		productobj.productpicture = productpicture;
		productobj.productcategory = productcategory;
		productobj.productprice = productprice;
		productlist.push(productobj);
		bSuccess = true;
	}
	return bSuccess
}



app.get('/', function (request, response) {
	if (productlist.length == 0) { // read all the products
		productlist = database.readproducts()
	}
	response.sendFile(path.join(__dirname + '/views/index.html')); // frontpage 
});
// code from server.js

app.get('/deleteuser', function (request, response) {
	if (request.session.loggedin) {
		database.deleteuser();
		response.status(404).send('/views/login.html');
	} else {
		response.status(404).send('/views/login.html');
	}
});

app.get('/updateuser', function (request, response) {
	if (request.session.loggedin) {
		let userobj = database.readuserdata();
		if (userobj.length != 0)
			response.render(path.join(__dirname + '/views/updateuser.html'), { name: userobj.name, username: userobj.username, password: userobj.password })
		else
			response.redirect('/views/updateuser.html');
	} else {
		response.redirect('/views/login.html');
	}
});


app.get('/createproduct', function (request, response) {
	if (request.session.loggedin) {
		response.sendFile(path.join(__dirname + '/views/createproduct.html'));
	} else {
		response.status(404).send('/views/login.html');
	}
});
// code from server.js

app.get('/getallproducts', function (request, response) {
	if (request.session.loggedin) {
		productlist = database.readproducts();
		response.send(productlist);
	} else {
		response.status(404).send('/views/login.html');
	}
});

app.get('/deleteproductnumber', function (request, response) {
	if (request.session.loggedin) {
		let number = request.query.value;
		productlist.splice(parseInt(number) - 1, 1);
		writeproductdata(productlist);
		response.sendFile(path.join(__dirname + '/views/deleteproduct.html'));
	} else {
		response.status(404).send('/views/login.html');
	}
});
// code from server.js

app.get('/updateproductdetail', function (request, response) {
	if (request.session.loggedin) {
		let number = request.query.value;
		response.send(productlist[parseInt(number - 1)])
	} else {
		response.status(404).send('/views/login.html');
	}
});
// code from server.js

app.get('/getcategorylist', function (request, response) {
	if (request.session.loggedin) {

		var categorylist = productlist.map(function (a) { return a.productcategory; });
		uniqList = [...new Set(categorylist)];

		response.send(uniqList);
	} else {
		response.status(404).send('/views/login.html');
	}
})

// code from server.js

app.get('/showcategory', function (request, response) {
	if (request.session.loggedin) {
		let category = request.query.value;
		let filterlist = productlist.filter(x => //x = værdi
			x.productcategory == category
		);
		response.send(filterlist);
	} else {
		response.status(404).send('/views/login.html');
	}
});
// code from server.js

app.get('/logoutuser', function (request, response) {
	request.session.destroy();
	response.sendFile(__dirname + '/views/login.html');
});

//When the client connects to the server the login page will be displayed, the server will send the login.html file. 
//We need to now handle the POST request, basically what happens here is when the 
//client enters their details in the login form and clicks the submit button, the 
//form data will be sent to the server, and with that data our login script will 
//check in our file to see if the details are correct.

app.post('/authenticate', function (request, response) {
	let { username, password } = request.body;

	if (username && password) {
		if (database.checkuserandpassword(username, password)) {
			request.session.loggedin = true;
			request.session.username = username;
			response.redirect('/views/main.html');
		}
		else {
			response.status(404).send('Incorrect Username and/or Password!');
		}
		response.end();
	}
	else {
		response.status(404).send('/views/login.html');
	}
});

app.post('/updateproductwithid', function (request, response) {
	console.log(request.body)

	if (request.session.loggedin) {
		if (saveproduct(request)) {
			var index = request.query.index;
			productlist.splice(parseInt(index) - 1, 1)
			database.writeproductdata(productlist);
			response.sendFile(path.join(__dirname + '/views/updateproduct.html'));
		} else {
			response.send('Please enter Procduct Name, Product Category and Picture!');
			response.end();
		}
	} else {
		response.status(404).send('/views/login.html');
	}
});
// code from server.js

app.post('/saveuser', function (request, response) {
	let { name, username, password } = request.body; //entry point called

	if (username && password && name) { // checks if all cubes are filled
		let userobj = new Object()
		userobj.name = name;
		userobj.username = username;
		userobj.password = password;
		database.writeuserdata(userobj); // saves in JSON 
		response.sendFile('/views/login.html');
		response.end();
	}
	else {
		response.send('Please enter Name, Username and Password!');
		response.end();
	}
});


app.post('/saveproduct', function (request, response) {
	if (request.session.loggedin) {
		if (saveproduct(request)) {
			database.writeproductdata(productlist);
			response.redirect('/views/main.html');
			response.end();
		} else {
			response.send('Please enter Procduct Name, Product Category, Picture and Picture!');
			response.end();
		}
	} else {
	response.status(404).send('/views/login.html');
	}
});
// code from server.js



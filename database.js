'use strict';

const fs = require('fs') // file stream  
const path = require('path') // en standard funktion 

//krearet en funktion, sætter en varibale til at pege på bibliotek dataen,  
function _readuserdata() {
    let filename = path.join(__dirname + '/data/users.json') 
    let data =  fs.readFileSync(filename) // læser filen, .json (normalt ville man køre database)
    let userobj = JSON.parse(data); //konvetere file format til json format (google dette)
    console.log(userobj) //userobj er blevet knovetere fra .json dataen
    return userobj; // return, stopper funktion 
}
// når man vil bruge dataen til at logge ind konventere man det fra en .json til en objekt
// ligeledes når man vil gemme dataen, koventere man det tilbage til et .json format
// denne process udarbejder vi fordi vi ikke bruger en database
function _writeuserdata(userobj) { // denne funktion konventere et objekt til .json format 
    let data = JSON.stringify(userobj, null, 2); 
    fs.writeFile(path.join(__dirname + '/data/users.json'), data, (err) => {
        if (err) throw err;
        console.log('Data written to file');
    });
}
// jeg ekportere disse funktioner, til andre js filer brug
module.exports = {
    checkuserandpassword: function checkuserandpassword(username, password){
        let userobj = _readuserdata()
        if (userobj.username == username && userobj.password == password)
            return true;
        else    
            return false;
    },

    writeuserdata : function writeuserdata(userobj) {
        _writeuserdata(userobj);
    },

    readuserdata : function readuserdata(userobj) {
        return _readuserdata(userobj);
    }    

};
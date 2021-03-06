'use strict';

const fs = require('fs')
const path = require('path')
const product_path = path.join(__dirname + '/data/products.json')
const user_path = path.join(__dirname + '/data/users.json');

function _readuserdata() {
    let userobj = [];
    try {
        let data = fs.readFileSync(user_path)
        userobj = JSON.parse(data);
    } catch (err) {
        console.log(err)
    }
    return userobj;
}

function _writeuserdata(userobj) {
    let data = JSON.stringify(userobj, null, 2);
    fs.writeFileSync(user_path, data, (err) => {
        if (err) throw err;
        console.log('Data written to file');
    });
}

function _writeproductdata(productlist) {
    var ts = JSON.stringify(productlist, null, 4);
    fs.writeFileSync(product_path, ts, function (err) {
        if (err) throw err;
    }
    );
}

function _readproductlist() {
    var fileString = fs.readFileSync(product_path).toString();
    var content = JSON.parse(fileString);
    console.log(content)
    return content;
}

module.exports = {
    checkuserandpassword: function checkuserandpassword(username, password) {
        let userobj = _readuserdata()
        if (userobj.username == username && userobj.password == password)
            return true;
        else
            return false;
    },

    writeuserdata: function writeuserdata(userobj) {
        _writeuserdata(userobj);
    },

    writeproductdata: function writeproducts(productlist) {
        _writeproductdata(productlist);
    },

    readproducts: function readproducts() {
        return _readproductlist()
    },

    readuserdata: function readuserdata() {
        return _readuserdata();
    },

    deleteuser: function deleteuser() {
        try {
            fs.unlinkSync(user_path)
            //file removed
        } catch (err) {
            console.error(err)
        }
    }
};
/**
 * Created by Frederick BALDO on 26/09/2016.
 */

const path = require('path');
const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const exphbs = require('express-handlebars');

// App config
app.use(bodyParser.urlencoded({
    extended: true
}));

// Database setup
var nosql = require('nosql').load('nosql/database.nosql');

var insertCallback = function(err, count) {
    // Do stuff here before insert
    console.log('Insert ', err, count);
};
var displayCallback = function(err, selected) {
    // Do stuff here before display
    console.log('Got', selected);
    return selected;
};
var mapAll = function(doc) {
    // Add sort, filter results ...
    return doc;
};

const todoList = nosql.all(mapAll, displayCallback);
var all = function () {
    var items = [];
    nosql.each(function success(value) {
        items.push(value);
    }), function error(err) {
        console.error('Error', err);
    };
    return items;
};


var map = function(doc) {
    if (doc)
        return doc;
};

var countAll = function() {
    var i = 0;
    displayAll().forEach(function (value, key) {
        i++;
    });
    return i;
};
var displayAll = function() {
    var items = [];
    nosql.each(function (value, key) {
        items.push(value);
    });
    return items;
};
// Routes handler
var newItem = [];
app.post('/', function (req, res) {
    if (req.body.message === '') {
        return;
    } // Database insert
    // retrieve user posted data from the body
    newItem.push({
        id: countAll(),
        body: req.body.message
    });
    nosql.insert(newItem, insertCallback);
    req.body.message = '';
    setTimeout(function () {
        res.render('home', {
            title: 'Todo List',
            todoList: displayAll()
        });
    }, 1000)
    console.log('post', req.body);
});
app.get('/', (request, response) => {
    response.render('home', {
        title: 'Todo List',
        todoList: displayAll()
    });
});
// Views settings
app.engine('.hbs', exphbs({
    defaultLayout: 'layout',
    extname: '.hbs',
    layoutsDir: path.join(__dirname, 'views')
}));

app.set('view engine', '.hbs');
app.set('views', path.join(__dirname, 'views'));

console.log('Browser listening on port 3000....');

app.listen(3000);
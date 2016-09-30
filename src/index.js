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

var callback = function(err, selected) {
    // console.log('Got', selected);
    
    return selected;
};
var displayAll = function() {
    var items = [];
    nosql.each(function (value, key) {
        if (value.body)
            items.push(value);
    });
    return items;
};
// Routes handler
app.post('/', function (req, res) {
    var newItem = [];
    if (req.body.delete) {
        // Remove item
        nosql.update(function(doc) {
            if (doc.body === req.body.delete)
                doc = {};
                console.log('remove', doc);
                return doc;
        }, callback);
    }
    if (req.body.done) {  // Done action
        nosql.update(function(doc) {
            if (doc.body === req.body.done)
                doc = {body: req.body.done, done:1};
            console.log('update', doc);
            return doc;
        }, callback);
    }
    if (req.body.todo) { // Remove done flag
        nosql.update(function(doc) {
            if (doc.body === req.body.todo)
                doc = {body: req.body.todo};
            console.log('update', doc);
            return doc;
        }, callback);
    }
    if (req.body.message !== undefined && req.body.message !== '') {
        // Insert new item
        newItem.push({
            body: req.body.message
        });
        nosql.insert(newItem, callback);
    }
    // reload page
    setTimeout(function () {
        res.render('home', {
            title: 'Todo List',
            todoList: displayAll()
        });
    }, 500);
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
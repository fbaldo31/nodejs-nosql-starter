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
var list = require('nosql').load('nosql/list.nosql');
var nosql = require('nosql').load('nosql/todo.nosql');

var callback = function(err, selected) {
    // console.log('Got', selected);
    return selected;
};

var displayTodos = function() {
    var items = [];
    nosql.each(function (value, key) {
        if (value.body)
            items.push(value);
    });
    return items;
};
var displayTodosByList = function(listName) {
    var items = [];
    nosql.each(function (value, key) {
        if (value.list == listName)
            items.push(value);
    });
    return items;
};
var displayLists = function() {
    var items = [];
    list.each(function (value, key) {
        if (value.name)
            items.push(value);
    });
    return items;
};
var isListExists = function (name) {
    var listExist = false;
    list.each(function (value) {
        if (value.name === name)
            listExist = true;
    });
    return listExist;
};
var getListNameById = function (id) {
    return lists[id].name;
};
const lists = displayLists();
// Routes handler
app.post('/', function (req, res) {
    var newItem = [];
    if (req.body.deleteList) {
        // Remove list
        list.update(function(doc) {
            if (doc.name === req.body.deleteList)
                doc = {};
        
            console.log('remove', doc);
            return doc;
        }, callback);
    }
    if (req.body.list !== undefined && req.body.list !== '') {
        if (isListExists(req.body.list) === true)
            return;
        // Insert new list
        newItem.push({
            name: req.body.list
        });
        list.insert(newItem, callback);
    }
    // reload page
    setTimeout(function () {
        res.render('home', {
            title: 'Todo List',
            subtitle: 'Start by creating a list',
            list: displayLists()
            // todo: displayTodos()
        });
    }, 500);
    console.log('post', req.body);
});
app.post('/list/:id', function (req, res) {
    var newItem = [];
    // New todoListItem
    if (req.body.message !== undefined && req.body.message !== '') {
        // Insert new item
        newItem.push({
            list: req.body.listName,
            body: req.body.message
        });
        nosql.insert(newItem, callback);
    }
    // New list
    if (req.body.list !== undefined && req.body.list !== '') {
        // Insert new list
        newItem.push({
            name: req.body.list
        });
        list.insert(newItem, callback);
    }
    if (req.body.done) {  // Done action
        nosql.update(function(doc) {
            if (doc.body === req.body.done)
                doc = {list: req.body.parentName, body: req.body.done, done:1};
            console.log('update', doc);
            return doc;
        }, callback);
    }
    if (req.body.todo) { // Remove done flag
        nosql.update(function(doc) {
            if (doc.body === req.body.todo)
                doc = {list: req.body.parentName, body: req.body.todo};
            console.log('update', doc);
            return doc;
        }, callback);
    }
    if (req.body.deleteItem) {
        // Remove item
        nosql.update(function(doc) {
            if (doc.body === req.body.deleteItem)
                doc = {};
            console.log('remove', doc);
            return doc;
        }, callback);
    }
    if (req.body.deleteList) {
        // Remove item
        list.update(function(doc) {
            if (doc.name === req.body.deleteList)
                doc = {};
            console.log('remove', doc);
            return doc;
        }, callback);
    }
    // reload page
    setTimeout(function () {
        var todo = lists[req.params.id] === undefined ? {} : displayTodosByList(lists[req.params.id].name);
        res.render('list', {
            title: 'Todo List',
            listId: getListNameById(req.params.id),// lists[req.param('id')].name,
            list: displayLists(),
            todo: todo
        });
    }, 500);
    console.log('post', req.body);
    console.log('name', getListNameById(req.params.id));
});
app.get('/', (request, response) => {
    response.render('home', {
        title: 'Todo List',
        subtitle: 'Start by creating a list',
        list: displayLists()
        // todo: displayTodos()
    });
});
app.get('/list/:id', (request, response) => {
    response.render('list', {
        title: 'Todo List',
        listId: getListNameById(request.params.id),
        list: displayLists(),
        todo: lists[request.params.id] === undefined ? {} : displayTodosByList(lists[request.params.id].name)
    });
console.log('route: list ', getListNameById(request.params.id));
});
// Views settings
app.engine('.hbs', exphbs({
    defaultLayout: 'layout',
    extname: '.hbs',
    layoutsDir: path.join(__dirname, 'views')
}));

app.set('view engine', '.hbs');
app.set('views', path.join(__dirname, 'views'));

console.log('Browser listening on port 80....');

app.listen(80);
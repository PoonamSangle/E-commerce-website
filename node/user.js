var express = require('express');
var bodyParser = require('body-parser');
var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;

var prop = require('./properties');

module.exports = {
	userGet: function (req, res) {
		getUserById(req.params.userId, function(err, user){
			if(err){
				console.log(err);
				res.end("Unable to load user" + req.params.userId);
			} 
			else {
				delete user.pass;
				res.end(JSON.stringify(user));
			}
		});
	},
	getUserById : getUserById,
	customerlogin : function(req, res){
		var email = req.body.email;
		var password = req.body.login_password;
		
		MongoClient.connect(prop.dburl, function(err, db) {
			db.collection(prop.userCollection, function(err, collection){
				if(err){
					callback(err, collection);
					return null;
				}else {
					var filter = { "$and" : [
				                               	{"email" : email} ,
				                               	{"pass": password},
				                               	{"type": "customer"}
				                            ]};
				    console.log("Filter user: " + JSON.stringify(filter));
				    
					collection.findOne( filter, function(err, user) {
					    console.log("Authen user: " + JSON.stringify(user));
					    if (user == null) {
						    req.session.customer = null;
							res.end("FALSE");
						}else {
						    req.session.customer = user._id;
							res.end("TRUE");
						}
					});
				}
			});
		});
	},
	customerlogout : function(req, res){
	    req.session.customer = null;
	    res.redirect('/');
	},
	sellerlogin : function(req, res){
		var email = req.body.email;
		var password = req.body.login_password;
		
		MongoClient.connect(prop.dburl, function(err, db) {
			db.collection(prop.userCollection, function(err, collection){
				if(err){
					callback(err, collection);
					return null;
				}else {
					var filter = { "$and" : [
				                               	{"email" : email} ,
				                               	{"pass": password},
				                               	{"type": "seller"}
				                            ]};
				    console.log("Filter user: " + JSON.stringify(filter));
				    
					collection.findOne( filter, function(err, user) {
					    console.log("Authen user: " + JSON.stringify(user));
					    if (user == null) {
						    req.session.seller = null;
							res.end("FALSE");
						}else {
						    req.session.seller = user._id;
							res.end("TRUE");
						}
					});
				}
			});
		});
	},
	sellerlogout : function(req, res){
	    req.session.seller = null;
	    res.redirect('/');
	}
};

function getUserById(id, callback){
	MongoClient.connect(prop.dburl, function(err, db) {
		db.collection(prop.userCollection, function(err, collection){
			if(err){
				callback(err, collection);
				return null;
			}else {
				collection.findOne({ "_id" : ObjectID(id)}, function(err, item) {
					callback(err, item);
					return item;
				});
			}
		});
	});
}
var express = require('express');
var bodyParser = require('body-parser');
var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;

var prop = require('./properties');

module.exports = {
	itemPost: function (req, res) {
		console.log("item post");
		// Prepare output in JSON format
		item = req.body;
		item.sellerid = ObjectID(req.session.seller);
		item.ordercount = 0;
		
		if (req.session.seller == null) {
			res.end("LOGOUT");
			return;
		}
		
		console.log("adding item for seller :" + item.sellerid);
		
		MongoClient.connect(prop.dburl, function(err, db) {
		db.collection(prop.itemCollection).insert(item, function(err, result){
			if(err)
				console.log(err);
			else{
				console.log("item posted");
				res.end(JSON.stringify(result));
			}
		});
		});
	},
	itemUpdate: function (req, res) {
		console.log("item update");
		// Prepare output in JSON format
		item = req.body;
		
		item.sellerid = ObjectID(req.session.seller);
		if (req.session.seller == null) {
			res.end("LOGOUT");
			return;
		}
		
		console.log("updating item for seller :" + item.sellerid);
		
		MongoClient.connect(prop.dburl, function(err, db) {
			var updateFilter = { "$and": [
         	    				           { "sellerid" : item.sellerid},
        	    				           { "_id" : ObjectID(item._id)}
        	    				           ]
        	    				};
			
			var setVal = {
				"name" : item.name,
				"description" : item.description,
				"cost" : item.cost,
				"shippingcost" : item.shippingcost,
				"quantity" : item.quantity
			};
			
			console.log("Update filter :" + JSON.stringify(updateFilter) + " set:" + JSON.stringify(setVal));
			db.collection(prop.itemCollection).updateOne(updateFilter,{ "$set" : setVal}, 
					function(err, result){
						if(err)
							console.log(err);
						else{
							console.log("item updated");
							res.end(JSON.stringify(result));
						}
			});
		});
	},
	itemGet: function (req, res) {
		console.log("itemid:" + req.params.itemId);
		getItemById(req.params.itemId, function(err, item){
			if(err){
				console.log(err);
				res.end("Unable to load user" + req.params.itemId);
			} 
			else {
				res.end(JSON.stringify(item));
			}
		});
	},
	selectedItemGet: function (req, res) {
		console.log("session:" + req.session.itemId);
		
		if (req.session.itemId == null) {
			res.end("NULLITEM");
			return;
		}
		
		getItemById(req.session.itemId, function(err, item){
			if(err){
				console.log(err);
				res.end("Unable to load user" + req.params.itemId);
			} 
			else {
				res.writeHead(200, {"Content-Type": "application/json"});
				res.end(JSON.stringify(item));
			}
		});
	},
	siblings : function(req, res) {
		console.log("session:" + req.session.itemId);
		
		if (req.session.itemId == null) {
			res.end("NULLITEM");
			return;
		}
		
		MongoClient.connect(prop.dburl, function(err, db) {
			db.collection("frequentsets", function(err, collection){
				if(err){
					console.log(err);
					return null;
				}else {
					collection.findOne({ "itemid" : req.session.itemId}, function(err, item) {
						console.log("found frequent item:" + JSON.stringify(item));
						
						if(item == null || item.siblings == null){
							res.writeHead(200, {"Content-Type": "application/json"});
							res.end("");
							return;
						}
						
						getItemByIds(item.siblings, function(err, siblings){
								if(err){
									console.log(err);
								} 
								else {
									res.writeHead(200, {"Content-Type": "application/json"});
									res.end(JSON.stringify(siblings));
								}
							});
						
					});
				}
			});
		});
	},
	getItemById : getItemById,
	updateItemQuantityOrder : updateItemQuantityOrder,
	search: function(req, res){
		var customerId = req.session.customer;
		if (customerId == null){
			res.end("LOGOUT");
			return;
		}
		
		if (req.params.term == null)
			req.params.term = "";
				
		searchItem(req.params.term, parseInt(req.params.start), parseInt(req.params.count), req.params.category, req.params.subcat, function(err, items){
			if(err){
				console.log(err);
				res.end("Unable to load search items" + req.params.term);
			} else {
				res.writeHead(200, {"Content-Type": "application/json"});
				res.end(JSON.stringify(items));
			}
		});
	}
};

function searchItem (term, start, count ,category, subcat, callback){
	
	console.log("start:" + start + " count:" + count);

	
	if (term == undefined || term == null || term == "undefined")
		term = "";
	if (category == undefined || category == null || category == "undefined")
		category = "";
	if (subcat == undefined || subcat == null || subcat == "undefined")
		subcat = "";

	console.log("cat:" + category + " subcat:" + subcat)
	
	MongoClient.connect(prop.dburl, function(err, db) {
		db.collection(prop.itemCollection, function(err, collection){
			if(err){
				callback(err, collection);
				return null;
			} else {
				var filter = { 
						$and : [
								{$or: [{ "name" : {$regex : ".*"+ term +".*"}},
					                     {"description" : {$regex : ".*"+ term +".*"}}]
								},
								{ "category" : {$regex : ".*"+ category +".*"}},
								{ "subcategory" : {$regex : ".*"+ subcat +".*"}}
						        ]
				};
				
				console.log("Search filter: " + JSON.stringify(filter));
				
				collection.find(filter).skip(start).limit(count)
					.toArray( function(err, items) {
					callback(err, items);
					return items;
				});
			}
		});
	});
}

function getItemById(id, callback){
	console.log("getItemById:" + id);
	MongoClient.connect(prop.dburl, function(err, db) {
		db.collection(prop.itemCollection, function(err, collection){
			if(err){
				callback(err, collection);
				return null;
			}else {
				collection.findOne({ "_id" : ObjectID(id)}, function(err, item) {
					console.log("found item:" + JSON.stringify(item));					
					callback(err, item);
					return item;
				});
			}
		});
	});
}

function getItemByIds(ids, callback){
	MongoClient.connect(prop.dburl, function(err, db) {
		db.collection(prop.itemCollection, function(err, collection){
			if(err){
				callback(err, collection);
				return null;
			}else {
				
				var idArray = [];
				
				for (var i = 0; i < ids.length; i++) {
					idArray.push({ "_id" : ObjectID(ids[i]) });
				}
				
				var orFilter = {
						"$or" : idArray
				};
				
				console.log("item by ids filter: " + JSON.stringify(orFilter))
				
				collection.find(orFilter).toArray (function(err, item) {
					console.log("found item:" + JSON.stringify(item));					
					callback(err, item);
					return item;
				});
			}
		});
	});
}

function updateItemQuantityOrder(id, quantity, callback){
	console.log("getItemById:" + id);
	MongoClient.connect(prop.dburl, function(err, db) {
		db.collection(prop.itemCollection, function(err, collection){
			if(err){
				callback(err, collection);
				return null;
			}else {
				collection.update(
						   { "_id": ObjectID(id) },
						       	{ "$set": { "quantity": quantity}  });
				collection.update(
						   { "_id": ObjectID(id) },
						   { "$inc": { "ordercount": 1 }  });
				}
			});
	});
}
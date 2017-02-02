var express = require('express');
var bodyParser = require('body-parser');
var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;

var prop = require('./properties');


module.exports = {
  sellerPost: function (req, res) {
	console.log("seller post");
   // Prepare output in JSON format
	seller = req.body;
	seller.type = "seller";
	seller.address = {
		streetaddress: seller.streetaddress,
		city: seller.city,
		state: seller.state
	};
	delete seller.streetaddress,
	delete seller.city,
	delete seller.state
	delete seller.confirmpass;

	MongoClient.connect(prop.dburl, function(err, db) {
      db.collection(prop.userCollection).insert(seller, function(err, result){
		if(err){
			console.log(err);
			res.end("FALSE");
		} else{
			console.log("seller account created" + JSON.stringify(result));
			req.session.seller = result._id;
			res.end("TRUE");
		}
	  });
   });
  },
  itemsBySellerId: itemsBySellerId,
  getItemsBySellerId : function (req, res) {
	var id = req.params.sellerId;
	if (id == "-1")
		id = req.session.seller;
	
	if (id == null){
		res.end("LOGOUT");
		return;
	}
	
	console.log("seller: " + id + " GET ITEMS");
	
	itemsBySellerId(id, parseInt(req.params.start), parseInt(req.params.count), function(err, items){
		if(err){
			console.log(err);
			res.end("Unable to load items for seller:" + req.params.sellerId);
		} 
		else {
			res.writeHead(200, {"Content-Type": "application/json"});
			res.end(JSON.stringify(items));
		}
	});
  },
  ordersInFulfillment: function(req, res){
	  var id = req.params.sellerId;
	  if (id == "-1")
		  id = req.session.seller;
	  
	  if (id == null){
			res.end("LOGOUT");
			return;
	  }

	  ordersInFulfillment(id, parseInt(req.params.start), parseInt(req.params.count), function(err, items){
				if(err){
					console.log(err);
					res.end("Unable to load fulfillment Items: " + sellerId);
				} else {
					res.writeHead(200, {"Content-Type": "application/json"});
					res.end(JSON.stringify(items));
				}
			});
  }
};

function ordersInFulfillment(sellerid, start, count, callback){
	MongoClient.connect(prop.dburl, function(err, db) {
		db.collection(prop.orderCollection, function(err, collection){
			if(err){
				callback(err, collection);
				return null;
			}else {
				var filter = [{ $match : { 
									$and: [
											{sellerId : ObjectID(sellerid)},
											{ $or : [
											         {orderStatus : "PLACED"},
											         {orderStatus : "DELIVERED"}
											         ]
											}
									   ]
									} 
								},
				              {
				                  $lookup:
				                    {
				                      from: prop.itemCollection,
				                      localField: "itemId",
				                      foreignField: "_id",
				                      as: "item"
				                    }
				               }
				            ];
				
				collection.aggregate(filter).skip(start).limit(count).toArray( function(err, items) {
					callback(err, items);
					return items;
				});
			}
		});
	});
};


function itemsBySellerId(id, start, count, callback){
	MongoClient.connect(prop.dburl, function(err, db) {
		if(err){
			console.log("Err:" + err);
			callback(err, collection);
			return null;
		}else {
		db.collection(prop.itemCollection, function(err, collection){
			if(err){
				callback(err, collection);
				return null;
			}else {
				collection.find({ "sellerid" : ObjectID(id)}).skip(start).limit(count).toArray( function(err, items) {
					callback(err, items);
					return items;
				});
			}
		});
		}
	});
};

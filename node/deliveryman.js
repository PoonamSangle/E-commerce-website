var express = require('express');
var bodyParser = require('body-parser');
var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;

var prop = require('./properties');


module.exports = {
  ordersInFulfillmentDM: function(req, res){
	  ordersInFulfillmentDM( parseInt(req.params.start), parseInt(req.params.count), function(err, items){
				if(err){
					console.log(err);
					res.end("Unable to load fulfillment Items: " + sellerId);
				} else {
					res.writeHead(200, {"Content-Type": "application/json"});
					res.end(JSON.stringify(items));
				}
			});
  },
  delivered: function (req, res) {
	MongoClient.connect(prop.dburl, function(err, db) {
		db.collection(prop.orderCollection).update(
				{ "_id" : ObjectID(req.params.orderid)},
				{$set: {
						orderStatus: "DELIVERED"
					}
				}, { multi: true}, 
				function(err, result) {
					if(err)
						console.log(err);
					else{
						console.log("Order Delivered: " + req.params.orderid);
						res.writeHead(200, {"Content-Type": "application/json"});
						res.end(JSON.stringify(result));
					}
		});
	});

  }
};

function ordersInFulfillmentDM(start, count, callback){
	MongoClient.connect(prop.dburl, function(err, db) {
		db.collection(prop.orderCollection, function(err, collection){
			if(err){
				callback(err, collection);
				return null;
			}else {
				var filter = [{ $match : {orderStatus : "PLACED"}
								},
				              {
				                  $lookup:
				                    {
				                      from: prop.itemCollection,
				                      localField: "itemId",
				                      foreignField: "_id",
				                      as: "item"
				                    }
				               },
				               { $sort : { sequence : 1 } }
				            ];
				
				collection.aggregate(filter).skip(start).limit(count).toArray( function(err, items) {
					callback(err, items);
					return items;
				});
			}
		});
	});
};

var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;
const https = require('https');

var prop = require('./properties');
var user = require('./user');
var item = require('./item');

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
};

module.exports = {
  customerPost: function (req, res) {
	console.log("customer post");
	
	// Prepare output in JSON format
	customer = req.body;
	customer.type = "customer";
	customer.address = {
		streetaddress: customer.streetaddress,
		city: customer.city,
		state: customer.state
	};
	
	delete customer.streetaddress,
	delete customer.city,
	delete customer.state
	delete customer.confirmpass;

	MongoClient.connect(prop.dburl, function(err, db) {
      db.collection(prop.userCollection).insert(customer, function(err, result){
		if(err){
			console.log(err);
			res.end("FALSE");
		} else {
			console.log("customer account created: " + JSON.stringify(result));
		    req.session.customer = result._id;
			res.end("TRUE");
		}
	  });
   });
  },
  addToCart : function (req, res) {
	var customerId = req.session.customer;
	var itemId = req.params.itemId;
	if (customerId == null){
		res.end("LOGOUT");
		return;
	}
	
	item.getItemById(itemId, function(err,data){
		var itemObj = data;
		
		console.log("add to cart itemObj: " + JSON.stringify(itemObj) + " itemId:" + itemId)
		
		if (itemObj.quantity > 0) {
			item.updateItemQuantityOrder(itemObj._id, itemObj.quantity - 1, function(){});
		}
		
		var order = {
			customerId : ObjectID(customerId),
			itemId : ObjectID(itemId),
			sellerId : ObjectID(itemObj.sellerid),
			addedDate : Date.now(),
			orderStatus : "CART",
		};

		console.log("add to cart order: " + JSON.stringify(order))

		MongoClient.connect(prop.dburl, function(err, db) {
		      db.collection(prop.orderCollection).insert(order, function(err, result){
				if(err)
					console.log(err);
				else{
					console.log("Order created");
					res.writeHead(200, {"Content-Type": "application/json"});
					res.end(JSON.stringify(result));
				}
			  });
		   });
	});
  },
  
  checkout: function (req, res) {
	var customerId = req.session.customer;
	if (customerId == null){
		res.end("LOGOUT");
		return;
	}
	 
	MongoClient.connect(prop.dburl, function(err, db) {

		var addr = ('https://maps.googleapis.com/maps/api/geocode/json?address=' + req.body.street_address + ',' + req.body.city + ',' + req.body.state + ',' + req.body.zip + '').replaceAll(" ", "%20");
		
		https.get(addr, function(response) {
	        // Continuously update stream with data
	        var body = '';
	        response.on('data', function(d) {
	            body += d;
	        });
	        response.on('end', function() {
	        	
	        	var parsed = JSON.parse(body);
	            
	    		db.collection(prop.orderCollection).update(
	    				{ "$and": [
	    				           { "customerId" : ObjectID(customerId)},
	    				           { "orderStatus" : "CART"}
	    				           ],
	    				},
	    				{$set: {
	    					orderStatus: "PLACED",
	    					shipping_address : req.body,
	    					location: parsed.results[0].geometry.location
	    					}
	    				}, { multi: true}, 
	    				function(err, result) {
	    					if(err)
	    						console.log(err);
	    					else{
	    						console.log("Order placed");
	    						res.writeHead(200, {"Content-Type": "application/json"});
	    						res.end(JSON.stringify(result));
	    					}
	    		});
	        })
	    });

	});
	
  },
  itemsInCart: function(req, res){
	var customerId = req.session.customer;
	if (customerId == null){
		res.end("LOGOUT");
		return;
	}
	 
	itemsInCart(customerId, function(err, items){
		if(err){
			console.log(err);
			res.end("Unable to load cartItems: " + customerId);
		} else {
			res.writeHead(200, {"Content-Type": "application/json"});
			res.end(JSON.stringify(items));
		}
		});
  },
  itemsInFulfillment: function(req, res){
		var customerId = req.session.customer;
		if (customerId == null){
			res.end("LOGOUT");
			return;
		}
		 
			itemsInFulfillment(customerId, function(err, items){
				if(err){
					console.log(err);
					res.end("Unable to load fulfillment Items: " + customerId);
				} else {
					res.writeHead(200, {"Content-Type": "application/json"});
					res.end(JSON.stringify(items));
				}
			});
  }
};

function itemsInFulfillment(customerid, callback){
	MongoClient.connect(prop.dburl, function(err, db) {
		db.collection(prop.orderCollection, function(err, collection){
			if(err){
				callback(err, collection);
				return null;
			}else {
				var filter = [{ $match : { 
									$and: [
											{customerId : ObjectID(customerid)},
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
				
//				console.log("order in fullfillment: " + JSON.stringify(filter));
				collection.aggregate(filter).toArray( function(err, items) {
					callback(err, items);
					return items;
				});
			}
		});
	});
};

function itemsInCart(customerid, callback){
	MongoClient.connect(prop.dburl, function(err, db) {
		db.collection(prop.orderCollection, function(err, collection){
			if(err){
				callback(err, collection);
				return null;
			}else {
				var filter = [{ $match : { 
									$and: [
									       {customerId : ObjectID(customerid)},
									       {orderStatus : "CART"}
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
//				console.log("order in cart: " + JSON.stringify(filter));
				collection.aggregate(filter).toArray( function(err, items) {
					callback(err, items);
					return items;
				});
			}
		});
	});
};

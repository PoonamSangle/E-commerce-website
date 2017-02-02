var customer = require('./customer');
var seller = require('./seller');
var user = require('./user');
var item = require('./item');
var deliveryman = require('./deliveryman');

var express = require('express');
var session = require('express-session');

var bodyParser = require('body-parser');
var MongoClient = require('mongodb').MongoClient;

var app = express();
var ObjectID = require('mongodb').ObjectID;

// Create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })

// Parse application/json
var jsonParser = app.use(bodyParser.json())

app.use(session({secret: 'somerandomchar'}));

app.get('/', function (req, res) {
	console.log("sellerid:" + req.session.seller);
	console.log("customerid:" + req.session.customer);

	res.sendFile( __dirname + "/public/" + "index.html" );
});


app.get('/testsession', function(req, resp){
	console.log(req.session.seller);
	console.log(req.session.customer);
});

app.get('/search/:start/:count', item.search)
app.get('/search/:start/:count/:term/:category/:subcat', item.search)

app.post('/item', urlencodedParser, item.itemPost);
app.post('/updateItem', urlencodedParser, item.itemUpdate);
app.get('/item/:itemId', item.itemGet);
app.get('/viewItem/:itemId', function (req, res){
	req.session.itemId = req.params.itemId
	res.sendFile( __dirname + "/public/" + "itempage.html" );
});

app.get('/selectedItem', item.selectedItemGet);
app.get('/siblings', item.siblings);

app.get('/user/:userId', user.userGet);

app.post('/seller', urlencodedParser, seller.sellerPost);
app.get('/items_by_seller/:sellerId/:start/:count', seller.getItemsBySellerId);

app.post('/customer', urlencodedParser, customer.customerPost);
app.get('/items_in_cart', customer.itemsInCart);
app.get('/add_to_cart/:itemId', customer.addToCart);
app.post('/checkout', urlencodedParser, customer.checkout);
app.get('/orders_in_fulfillment', customer.itemsInFulfillment);

app.get('/orders_by_seller/:sellerId/:start/:count', seller.ordersInFulfillment);

app.get('/orders_in_fulfillment_dm/:start/:count' , deliveryman.ordersInFulfillmentDM)
app.get('/delivered/:orderid' , deliveryman.delivered);

app.post('/customerlogin', urlencodedParser, user.customerlogin );
app.get('/customerlogout', urlencodedParser, user.customerlogout );

app.post('/sellerlogin', urlencodedParser, user.sellerlogin );
app.get('/sellerlogout', urlencodedParser, user.sellerlogout );


var server = app.listen(8081, function () {

  var host = server.address().address
  var port = server.address().port

  console.log("Example app listening at http://%s:%s", host, port)
});

app.use(express.static('public'));


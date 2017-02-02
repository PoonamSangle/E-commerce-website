/**
 * 
 */

var app = angular.module("customer", []);

app.directive('ngHitenter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if(event.which === 13) {
                scope.$apply(function (){
                    scope.$eval(attrs.ngHitenter);
                });
                event.preventDefault();
            }
        });
    };
});

app.controller("customerController", function($scope) {
	
	$scope.categories = [
		                   {
		                	   name: "Technology",
		                	   subcategories: [
		                	                   {name:"Computer Peripherals"},
		                	                   {name:"Copiers and Fax"},
		                	                   {name:"Mobile"},
		                	                   {name:"Telephones and Communication"},
		                	                   {name:"Office Machines"}]
		                   },
		                   {
		                	   name: "Office Supplies",
		                	   subcategories: [
		                	                   {name:"Appliances"},
		                	                   {name:"Binders and Binder Accessories"},
		                	                   {name:"Paper"},
		                	                   {name:"Rubber Bands"},
		                	                   {name:"Envelopes"},
		                	                   {name:"Labels"},
		                	                   {name:"Pens & Art Supplies"},
		                	                   {name:"Scissors, Rulers and Trimmers"},
		                	                   {name:"Storage & Organization"}
		                	                   ]
		                   },
		                   {
		                	   name: "Furniture",
		                	   subcategories: [{name:"Office Furnishings"},{name:"Bookcases"},{name:"Chairs & Chairmats"},{name:"Tables"}]
		                   },
		                  ];
	
	$scope.loadItems = function() {
		$.get( 'items_by_seller/-1', {}, function(data) {
			$scope.myitems = data;
			$scope.$apply();
		});
	};

	$.get( 'search/0/20/', {}, function(data) {
		if (data == "LOGOUT") {
			window.location = "/";
		} else {
			$scope.searchitems = data;
			$scope.$apply();
			Materialize.showStaggeredList('#staggered-result',1000);
		}
	});

	$.get( 'BidWins	', {}, function(data) {
		$scope.bidwins = data;
		$scope.$apply();
	});
	
	$scope.publish = function() {
    	$.post( 'item', $("#postItemForm").serialize(), function(data) {
    		console.log(data);
			Materialize.toast($scope.new_item.name + " Published.", 5000 );
//        	alert($scope.new_item.name + " Published.");
        	$scope.new_item = {};
    		$scope.$apply();
    	});
    	
    	if($scope.myitems == null)
    		$scope.myitems = [];
    	
    	$scope.myitems.push($scope.new_item);
	}
	
	$scope.search = function() {
		if ($scope.searchStr == "") $scope.searchStr = undefined;
		
		$.get( 'search/0/20/' + $scope.searchStr + "/" + $scope.selectedCat + "/" + $scope.selectedSubCat, {}, function(data) {
			$scope.searchitems = data;
			$scope.$apply();
			Materialize.showStaggeredList('#staggered-result',1000);
		});
	}
	
	$scope.addCategoryfilter = function(category){
		$scope.selectedCat = category.name;
		$scope.search();
	}
	
	$scope.addSubCategoryfilter = function(subcategory){
		$scope.selectedSubCat = subcategory.name;
		$scope.search();
	}
	
	$scope.removeSubCategoryFilter = function(){
		$scope.selectedSubCat = undefined;
		$scope.search();
	}
	
	$scope.removeCategoryFilter = function(){
		$scope.selectedCat = undefined;
		$scope.search();
	}
	
	$scope.addToCart = function(item) {
		$.get( 'add_to_cart/' + item._id, {}, function(data) {
			if (data == "LOGOUT") {
				window.location = "/";
			} else {
				Materialize.toast(item.name + " added to Cart", 5000 );
			}
		});
	}

	$scope.loadCart = function() {
		$.get( 'items_in_cart', {},function(data) {
			if (data == "LOGOUT") {
				window.location = "/";
			} else {
				$scope.cartOrders = data;
				$scope.$apply();
			}
		});
	}

	$scope.checkout = function(){
		$.get( 'checkout', {}, function(data) {
			if (data == "LOGOUT") {
				window.location = "/";
			} else {
				Materialize.toast("Order placed", 5000);
			}
		});
	}

	$scope.loadOrdersInFulfillment = function() {
		$.get( 'orders_in_fulfillment', {},
    			function(data) {
					$scope.fulfillmentOrders = data;
					$scope.$apply();
    			});
	}

	$scope.showSearchPage = true;
	$scope.showSP = function(fl) {
		$scope.showSearchPage = fl;
		$scope.$apply();
	}
	
	$scope.save = function(item){
		item.editItem = false;
	    $.post( 'UpdateItem', $("#updateItemForm").serialize(), function(data) {
	    	console.log(data);
			Materialize.toast(item.name + " Updated.", 5000 );
//	        alert($scope.new_item.name + " Published.");
	    });
	};
	
	$scope.sell = function(item){
	    $.post( 'Sold', {item_id: item.id}, function(data) {
	    	console.log(data);
	    	item.sold = 'Y';
			$scope.$apply();
			Materialize.toast(item.name + " Sold.", 5000 );
//	        alert($scope.new_item.name + " Published.");
	    });
	};
	
	$scope.createAccount = function() {
    	$.post( 'CreateAccount', $("#createAccountForm").serialize(), function(data) {
    		console.log(data);
    		if (data > 0)
    			window.location = "clienthome.jsp";
    		else{
    			Materialize.toast("User id already taken, please try another Login id.", 3000 );
//    			alert("User id already taken, please try another Login id.");
    		}
    	});
	};
	
	$scope.login = function() {
    	$.post( 'Login', $("#loginForm").serialize(), function(data) {
    		console.log(data);
    		if (data > 0)
    			window.location = "clienthome.jsp";
    		else{
    			Materialize.toast("Invalid Username or Password.", 5000 );
//    			alert("Invalid Username or Password.");
    		}
    	});
	}
});

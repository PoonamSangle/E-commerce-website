/**
 * 
 */

var app = angular.module("seller", []);

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

app.controller("sellerController", function($scope) {
	
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
	
	$('ul.tabs').tabs();
	
	$scope.selectCategory = function(category){
		$scope.selectedCat = category;
	}
	
	$scope.selectSubCategory = function(subcategory){
		$scope.selectedSubCat = subcategory;
	}
		
	$scope.loadItems = function() {
		$.get( 'items_by_seller/-1/0/20', {}, function(data) {
			if (data == "LOGOUT") {
				window.location = "/";
			} else {
				$scope.myitems = data;
				$scope.$apply();
			}
		});
	};
	
	$scope.loadOrders = function() {
		$.get( 'orders_by_seller/-1/0/20' , {}, function(data){
			if (data == "LOGOUT") {
				window.location = "/";
			} else {
				$scope.orders = data;
				$scope.$apply();
			}
		});
	}
	
	$scope.publish = function() {
    	$.post( 'item', $("#postItemForm").serialize(), function(data) {
			if (data == "LOGOUT") {
				window.location = "/";
			} else {
				console.log(data);
    			Materialize.toast($scope.new_item.name + " Published.", 5000 );
//        		alert($scope.new_item.name + " Published.");
				$scope.new_item = {};
				
		    	if($scope.myitems == null)
		    		$scope.myitems = [];
		    	
		    	$scope.myitems.push($scope.new_item);
				$scope.$apply();
			}
    	});
    	
	}
		
	$scope.save = function(item){
		item.editItem = false;
	    $.post( 'UpdateItem', $("#updateItemForm").serialize(), function(data) {
	    	console.log(data);
			Materialize.toast(item.name + " Updated.", 5000 );
//	        alert($scope.new_item.name + " Published.");
	    });
	};
	
	$scope.updateItem = function(item){
		$.post( 'updateItem', $.param(item), function(data) {
			if (data == "LOGOUT") {
				window.location = "/";
			} else {
				item.edit = false;
				console.log(data);
				Materialize.toast(item.name + " Updated.", 5000 );
				$scope.$apply();
			}
	    });
		
	}
	
});

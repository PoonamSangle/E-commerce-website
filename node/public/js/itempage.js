/**
 * 
 */

var app = angular.module("item", []);

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

app.controller("itemController", function($scope) {
	$('.carousel.carousel-slider').carousel({full_width: true});
	$('.collapsible').collapsible();
	
	$.get( '/selectedItem', {}, function(data) {
		if (data == "NULLITEM"){
			window.location = "/customerhome.html";
		}else {
			$scope.item = data;
			
			if ($scope.item != null) {
				$scope.item.totalcost = (parseFloat($scope.item.cost) + parseFloat($scope.item.shippingcost));
			}

			$scope.$apply();
		}
	});
	
	$.get('/siblings', {}, function(data){
		if (data == "NULLITEM"){
			window.location = "/customerhome.html";
		}else {
			if (data == "") {
				$scope.siblings = null
			} else {
				$scope.siblings = data;
			}
			$scope.$apply();
		}
	});
	
	$scope.addToCart = function(item) {
		$.get( '/add_to_cart/' + item._id, {},
    			function(data) {
					if (parseInt(data.insertedCount) > 0 ) {
						window.location = "/cart.html";
						Materialize.toast(item.name + " added to Cart", 5000 );
					} else {
						Materialize.toast("Error adding to cart", 5000 );
					}
    			});
	}

});

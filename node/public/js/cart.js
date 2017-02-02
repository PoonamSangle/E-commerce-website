/**
 * 
 */

var app = angular.module("cart", []);

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

app.controller("cartController", function($scope) {

	$.get( 'items_in_cart', {},
			function(data) {
		if (data == "LOGOUT") {
			window.location = "/";
		} else {
			$scope.cartOrders = data;
			$scope.$apply();
		}
	});
	
	$scope.cartSum = function() {
		if ($scope.cartOrders == null)
			return -1
		
		var total = 0;
		for (var i = 0; i < $scope.cartOrders.length; i++)
			total += parseFloat($scope.cartOrders[i].item[0].cost) + parseFloat($scope.cartOrders[i].item[0].shippingcost);
		
		return total;
	}

	$scope.checkout = function(){
		$.post( 'checkout', $("#checkForm").serialize(), function(data) {
			if (data == "LOGOUT") {
				window.location = "/";
			} else if (parseInt(data.nModified) > 0 ) {
				Materialize.toast("Order placed", 5000);
				window.location = "/customerorder.html";
			} else {
				Materialize.toast("Error Checking out", 5000 );
			}
		});
	}

});

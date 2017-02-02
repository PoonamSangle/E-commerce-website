/**
 * 
 */

var app = angular.module("order", []);

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

app.controller("orderController", function($scope) {
	
	$.get( 'orders_in_fulfillment', {},
			function(data) {
		if (data == "LOGOUT") {
			window.location = "/";
		} else {
				$scope.orders = data;
				$scope.$apply();
		}
			});
	
	
});

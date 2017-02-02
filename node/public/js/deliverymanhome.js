/**
 * 
 */

var app = angular.module("deliveryman", []);

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

app.controller("deliverymanController", function($scope) {
	
	$.get( 'orders_in_fulfillment_dm/0/20' , {}, function(data){
		$scope.orders = data;
		$scope.$apply();
	});
	
	$scope.delivered = function(order){
		$.get( 'delivered/' + order._id , {}, function(data){
			
			if (data.nModified > 0) {
				Materialize.toast(" Order marked as delivered", 5000 );
				order.delivered = true;
			} else {
				Materialize.toast(" Some error occured while marking the delivery", 5000 );
			}
			$scope.$apply();
		});
	};
	
});

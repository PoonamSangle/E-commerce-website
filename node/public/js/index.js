var app = angular.module("instashop", []);

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

app.controller("instashopController", function($scope) {

	$('ul.tabs').tabs();

	$scope.createAccount = function() {
    	$.post( 'customer', $("#createAccountForm").serialize(), function(data) {
    		console.log(data);
    		if (data == "TRUE")
    			window.location = "customerhome.html";
    		else{
    			Materialize.toast("User id already taken, please try another Login id.", 3000 );
    		}
    	});
	};
	
	$scope.login = function() {
    	$.post( 'customerlogin', $("#loginForm").serialize(), function(data) {
    		console.log(data);
    		if (data == "TRUE")
    			window.location = "customerhome.html";
    		else{
    			Materialize.toast("Invalid Username or Password.", 5000 );
    		}
    	});
	}
});
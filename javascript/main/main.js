/**
* QuizzMain Module
*
* Description
*/
angular.module('QuizzMain', ['QuizzServices']).
controller('MainCtrl', ['$scope', '$rootScope', '$location','WebSocketFactory', 'ModelFactory',  
	function($scope, $rootScope , $location,wsFactory, model){

		wsFactory.getConfig();

		var unregisterReadyEvt = $rootScope.$on('readyEvt', function(evt, data){
		$scope.$apply(function(){
				$scope.logo = model.config().logo;
			});
		});
	
		$scope.addPlayer = function(){
			$scope.player.id = 'idPlayer'+new Date().getTime();
			model.setPlayer($scope.player);
			wsFactory.registerPlayer($scope.player);
			$location.path('/player/'+$scope.player.id);
		};

		$scope.$on('$routeChangeSuccess', function(next, current) { 
			if (current.$$route.controller != 'MainCtrl'){
				unregisterReadyEvt(); 
			}
	 	});

}]);
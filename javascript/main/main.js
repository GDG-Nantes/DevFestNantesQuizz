/**
* QuizzMain Module
*
* Description
*/
angular.module('QuizzMain', ['QuizzServices']).
controller('MainCtrl', ['$scope', '$location','WebSocketFactory', 'ModelFactory',  
	function($scope, $location,wsFactory, model){
	
		$scope.addPlayer = function(){
			$scope.player.id = 'idPlayer'+new Date().getTime();
			model.setPlayer($scope.player);
			wsFactory.registerPlayer($scope.player);
			$location.path('/player/'+$scope.player.id);
		};

}]);
'use strict';

/**
* AppQuizz Module
*
* Description
*/
angular.module('AppQuizz', ['QuizzAdmin','QuizzGame', 'QuizzPlayer', 'QuizzMain', 'QuizzDirectives','ngRoute', 'ngSanitize'])
.config(['$routeProvider',function($routeProvider) {
	$routeProvider
	.when('/main', {
		controller : 'MainCtrl', templateUrl : 'partials/main.html'
	})
	.when('/game', {
		controller : 'GameCtrl', templateUrl : 'partials/game.html'
	})
	.when('/control', {
		controller : 'ControlCtrl', templateUrl : 'partials/admin_control.html'
	})
	.when('/admin',{
		controller : 'AdminCtrl', templateUrl: 'partials/admin_game.html'
	})
	.when('/player/:playerId',{
		controller : 'PlayerCtrl', templateUrl: 'partials/player.html'
	})
	.otherwise({redirectTo : '/main'});
}]);
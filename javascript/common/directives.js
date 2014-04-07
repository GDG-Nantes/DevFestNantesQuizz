var components = angular.module('QuizzDirectives',['QuizzServices'])
.directive('pushProximity', ['$rootScope', 'WebSocketFactory', function ($rootScope, socket) {
   var directiveDefinitionObject = {
    restrict: 'A',
    scope: {        
      player: '='
    },    
    link: function postLink(scope, iElement, iAttrs) { 

      // We get the html element
      var pushButton = iElement[0];

      // We manage the push state
      function pushTheButton(){        
        if (!pushButton.classList.contains('active')){
          pushButton.classList.add('active');
          socket.sendData('response',{
            id: scope.player.id,
            data : scope.player.pseudo
          });
        }
      }

      // We manage the unpush state
      function unPushTheButton(){
        pushButton.classList.remove('active');
      }
     

      // According to the value of proximity, we define if we push or unpush the button
      function manageProximityValue(value){
        if (value < 2){
          pushTheButton();
        }else{
          unPushTheButton();
        }        
      }

      /*
      * Your Code ! 
      */

      // The listener
      var deviceProximityHandler = function(event) {
        var value = Math.round(event.value);            
        manageProximityValue(value);
      }

      function register(){
        window.addEventListener('deviceproximity', deviceProximityHandler, false);
      }
      
      function unregister(){
        window.removeEventListener('deviceproximity', deviceProximityHandler, false);
      }

      register();

        
    }
  };
  return directiveDefinitionObject;
}]);

 
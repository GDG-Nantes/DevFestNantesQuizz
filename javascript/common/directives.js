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
}])
.directive('pdfPresentation', ['$rootScope', function ($rootScope) {
   var directiveDefinitionObject = {
    templateUrl: 'partials/components/pdf-presentation.html',
    replace: true,
    restrict: 'EA',
    scope: {     
      curentPage:'='  ,
      nbPages :'=',
      raz: '&'
    },        
    link: function postLink(scope, iElement, iAttrs) { 

      //PDF Configuration 
        
      var url = 'assets/files/KeyNote.pdf';
      scope.nbPages = 0;
      
      //
      // Disable workers to avoid yet another cross-origin issue (workers need the URL of
      // the script to be loaded, and currently do not allow cross-origin scripts)
      //
      PDFJS.disableWorker = true;
        
      var pdfDoc = null,
        pageNum = 1,
        scale = 0.9,
        canvas = iElement.find('#the-canvas')[0],
        ctx = canvas.getContext('2d');

    //
    // Get page info from document, resize canvas accordingly, and render page
    //
    function renderPage() {
      scope.raz();

      if (!pdfDoc)
        return;

      
      // Using promise to fetch the page
      pdfDoc
        .getPage(scope.curentPage)
        .then(function(page) {
          var viewport = page.getViewport(scale);
          canvas.height = viewport.height;
          canvas.width = viewport.width;

          // Render PDF page into canvas context
          var renderContext = {
            canvasContext: ctx,
            viewport: viewport
          };
          page.render(renderContext);
        });
    }

    scope.$watch('curentPage', function(newValue, oldValue){
      renderPage();
    });

    
    //
    // Asynchronously download PDF as an ArrayBuffer
    //
    PDFJS.getDocument(url).then(function getPdfHelloWorld(_pdfDoc) {
      pdfDoc = _pdfDoc;
      scope.nbPages = pdfDoc.numPages;
      scope.curentPage = 1;
      renderPage();
    });
        
    }
  };
  return directiveDefinitionObject;
}]);



 
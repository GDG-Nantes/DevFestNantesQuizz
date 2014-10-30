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
        
      var url = 'assets/files/QuizzBreizhcamp2014.pdf';
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
}])
components.directive('qrcodes', function () {
   var directiveDefinitionObject = {
    templateUrl: 'partials/components/qrcode.html',
    replace: true,
    restrict: 'EA',
    scope: {        
      path: '@'
    },    
    link: function postLink($scope, iElement, iAttrs) { 


      setTimeout(function() {
        // We get the json with ip of network in order to create the associate QrCode
          $.getJSON('./assets/json/ips.json', function(data) {
              var qrCode = new QRCode("qrCode", {
                  text: "",
                  width: 256,
                  height: 256,
                  colorDark : "#000000",
                  colorLight : "#ffffff",
                  correctLevel : QRCode.CorrectLevel.H
              });
              var list = "<ul>";
              var datas = data;
              for (var i = 0; i < data.length; i++){
                  list+= "<li><a id='"+data[i].id+"'>"+data[i].name+"</a></li>";                
              }
              list += "</ul>";
              $('#listIp').html(list);
              
               for (var i = 0; i < data.length; i++){
                  $('#'+data[i].id).on('click',function(event){
                      qrCode.clear();
                      var url = "http://"+datas[event.target.id].ip+":"+(window.location.port ? window.location.port : "80")+"/"+($scope.path ? "#/"+$scope.path : "");
                      qrCode.makeCode(url);
                      $('#url').html(url);
                  });
              }
              qrCode.clear();
              var url = "http://"+datas[0].ip+":"+(window.location.port ? window.location.port : "80")+"/"+($scope.path ? "#/"+$scope.path : "");
              qrCode.makeCode(url);
              $('#url').html(url);
          
          })
          .error(function() { 
              console.log('Error getting json')
          });

      }, 500);
        
    }
  };
  return directiveDefinitionObject;
});

 


 
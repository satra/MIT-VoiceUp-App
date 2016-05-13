angular.module('passcodehandler', [])
.service('pinModalService', function($ionicModal, $rootScope) {
    var init = function(tpl, $scope) {
    var promise;
    $scope = $scope || $rootScope.$new();
    promise = $ionicModal.fromTemplateUrl(tpl, {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.pin = modal;
      return modal;
    });

    $scope.openModal = function() {
       $scope.modal.show();
     };
     $scope.closeModal = function() {
       $scope.modal.hide();
     };
     $scope.$on('$destroy', function() {
       $scope.modal.remove();
     });

    return promise;
  }

  return {
    init: init
  }
})

.controller('DocumentCtrl', function(irkConsentDocument,
   $scope, $cordovaInAppBrowser,$ionicModal) {

     $ionicModal.fromTemplateUrl('templates/consent_demo.html', {
       scope: $scope,
       animation: 'slide-in-up'
     }).then(function(modal) {
       $scope.modal = modal;
       $scope.modal.show();
     });

     $scope.closeModal = function() {
       $scope.consentDocument = irkConsentDocument.getDocument();
       if ($scope.consentDocument) {
       $scope.consentDocument.getDataUrl(function(dataURL) {
       console.log(dataURL);
       window.open(dataURL, '_blank', 'location=yes,closebuttoncaption=Close,enableViewportScale=yes');
       $scope.dataURL = dataURL;
       $scope.viewPDF();
           });
        }
     }

    $scope.viewPDF = function($cordovaInAppBrowser) {
    window.open($scope.dataURL, '_blank', 'location=no');
    }
 });

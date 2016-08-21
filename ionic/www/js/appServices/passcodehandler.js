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
      $scope.$on('$destroy', function() {});

      return promise;
    }

    return {
      init: init
    }
  })

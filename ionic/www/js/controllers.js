angular.module('starter.controllers', [])

//=========Configuration to bring up the loader on hive when there is a web service call
.config(function($httpProvider) {
  $httpProvider.interceptors.push(function($rootScope) {
    return {
      request: function(config) {
        $rootScope.$broadcast('loading:show')
        return config
      },
      response: function(response) {
        $rootScope.$broadcast('loading:hide')
        return response
      }
     }
   })
})

//======Show loader and hide on $scope Done
.run(function($rootScope, $ionicLoading) {
  $rootScope.$on('loading:show', function() {
    $ionicLoading.show({template: 'Loading data..'})
  })
  $rootScope.$on('loading:hide', function() {
    $ionicLoading.hide()
  })
})

// ==== Dummy contorller need to be removed later before production  ========
.controller('ActiveTasksCtrl', function($scope, $ionicModal) {
  $scope.openModalFingerTapActiveTask = function() {
    $ionicModal.fromTemplateUrl('templates/modal-activetasks-fingertap.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modal = modal;
      $scope.modal.show();
    });
  };

  $scope.openModalVoiceActiveTask = function() {
    $ionicModal.fromTemplateUrl('templates/modal-activetasks-voice.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modal = modal;
      $scope.modal.show();
    });
  };

  $scope.closeModal = function() {
    $scope.modal.remove();
  };

  // Cleanup the modal when we're done with it!
  $scope.$on('$destroy', function() {
    $scope.modal.remove();
  });

  // Execute action on hide modal
  $scope.$on('modal.hidden', function() {
    // Execute action
  });

  // Execute action on remove modal
  $scope.$on('modal.removed', function() {
    // Execute action
  });
})

angular.module('passcode',[])
//============profile controlller =====================================
.controller('passcodeValidation', function($scope,userService, $state,$location,$ionicModal,profileDataManager) {
  //get IP like email ids
  userService.getEmailList().then(function(response){
                  $scope.emails = response.emailList;
  });

//  OpenVerification
$scope.OpenVerification = function() {
  $ionicModal.fromTemplateUrl('templates/verification.html', {
    scope: $scope,
    animation: 'slide-in-up'
   }).then(function(modal) {
    $scope.modal = modal;
    $scope.modal.show();
   });
 };

 $scope.OpenPermisssions = function() {
  $ionicModal.fromTemplateUrl('templates/locationservice.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modal.remove();
    $scope.modal = modal;
    $scope.modal.show();
    });
  };

  $scope.AllDone = function() {
    $ionicModal.fromTemplateUrl('templates/alldone.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modal.remove();
      $scope.modal = modal;
      $scope.modal.show();
    });
  };

  $scope.consentReview= function(){
    $scope.modal.remove();
    $state.transitionTo('tab.Activities');
  }

});

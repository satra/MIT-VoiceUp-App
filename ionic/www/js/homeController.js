angular.module('homeController',[])
//=======Home screen controller======================
.controller('HomeCtrl', function($scope,$cordovaSQLite,$ionicHistory,$controller,$ionicModal,$http,$ionicLoading,userService,databaseService,eligiblityDataManager,irkResults,$state,$location,$window) {
 //get IP like email ids
/* $scope.$on('$ionicView.enter', function() {
     // Code you want executed every time view is opened
     console.log('Opened!')
  });
*/

 databaseService.createLocalDatabaseSchema();

  //openOnlineResource
  $scope.openOnlineResource = function() {
    $ionicModal.fromTemplateUrl('templates/modal-online-resource.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modal = modal;
      $scope.modal.show();
    });
};

$scope.go = function () {
  $scope.modal.remove();
};

$scope.joinStudy = function () {
  $ionicHistory.clearCache().then(function(){
      $state.transitionTo('eligiblityTest');
  });
};

$scope.GoBack = function () {
  $scope.modal.remove();
};

$scope.signInSubmit = function () {
  $scope.modal.remove();
};

//==================================Select email view ==========
     $scope.openSignInChooseEmail = function() {
    //get IP like email ids
     userService.getEmailList().then(function(response){
      $scope.emails = response.emailList;
    });

    $ionicModal.fromTemplateUrl('templates/signin-choose-email.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modal = modal;
      $scope.modal.show();
       });
  };

   $scope.showEligibilityTestView = function() {
     $scope.modal.remove();
     $state.transitionTo('eligiblityTest');
   };

   // ==== Close the existing modal and open Sign in html in new modal========
     $scope.openSignIn = function() {
       $ionicModal.fromTemplateUrl('templates/Login-IRK.html', {
         scope: $scope,
         animation: 'slide-in-up'
       }).then(function(modal) {
         $scope.modal.remove();
         $scope.modal = modal;
         $scope.modal.show();
       });
     };

});

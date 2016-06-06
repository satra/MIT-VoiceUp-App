angular.module('consent',[])
//=======Home screen controller======================
.controller('consentCtrl', function($scope,$stateParams,$ionicHistory,$cordovaSQLite,$controller,
  $ionicModal,$http,$compile,$ionicLoading,userService,$rootScope,databaseManager,consentDataManager,irkResults,irkConsentDocument,$state,$location,$window) {

    consentDataManager.getAllConsentScreens().then(function(response){
    $scope.enable_review = response.enable_review;
    $scope.consent_array = response.sections;

    var taskListData =  userService.parseConsent($scope.consent_array,$scope.enable_review);
    var taskList =   '<ion-modal-view class="irk-modal">'+
    '<irk-ordered-tasks>'+
    taskListData +
    '</irk-ordered-tasks>'+
    '</ion-modal-view>';
    var dynamicContent = angular.element(document.querySelector('#orderTasks'));
    dynamicContent.append(taskList);
    $compile(dynamicContent)($scope);

   });


$scope.closeModal = function() {
  if (irkResults.getResults().canceled) {
     $ionicHistory.clearCache().then(function(){
          $state.transitionTo('home');
          });
     }else if (irkResults.getResults()) { // launch sign up
          var childresult = irkResults.getResults().childResults ;
          childresult.every(function(value, key){
          if (value.type == "IRK-CONSENT-REVIEW-STEP") {
          if (value.answer) {
          $rootScope.consentResult = irkConsentDocument.getDocument();
          $state.transitionTo('loadSignUp');
          }else {
          $state.transitionTo('home');
          }
          return false;
          }
          return true ;
       });
    }
}



});

angular.module('consent',[])
//=======Home screen controller======================
.controller('consentCtrl', function($scope,$cordovaSQLite,$controller,$ionicModal,$http,$ionicLoading,userService,databaseService,consentDataManager,irkResults,$state,$location,$window) {

    consentDataManager.getAllConsentScreens().then(function(response){
    $scope.enable_review = response.enable_review;
    $scope.consent_array = response.sections;

    var taskList =  userService.parseConsent($scope.consent_array,$scope.enable_review);
    $scope.learnmore = $ionicModal.fromTemplate(
                              '<ion-modal-view class="irk-modal">'+
                              '<irk-ordered-tasks>'+
                               taskList +
                              '</irk-ordered-tasks>'+
                              '</ion-modal-view>'
                          ,{
                              scope: $scope,
                              animation: 'slide-in-up'
                          });

         $scope.modal = $scope.learnmore;
         $scope.learnmore.show();
   });


$scope.closeModal = function() {
    $scope.modal.remove();
 };

 // Cleanup the modal when we're done with it!
 $scope.$on('$destroy', function() {
   $scope.modal.remove();
   console.log('destroy modal hit');
 });

 // Execute action on hide modal
 $scope.$on('modal.hidden', function() {
   console.log('hidden modal hit');
 });

 // Execute action on remove modal
 $scope.$on('modal.removed', function() {
   console.log(irkResults.getResults());
  if(irkResults.getResults().childResults.length === $scope.consent_array.length){
    $state.transitionTo('tab.Activities');
   }else {
    $state.transitionTo('home');
   }
});

});

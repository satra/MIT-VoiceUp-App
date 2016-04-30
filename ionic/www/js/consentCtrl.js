angular.module('consent',[])
//=======Home screen controller======================
.controller('consentCtrl', function($scope,$stateParams,$cordovaSQLite,$controller,$ionicModal,$http,$compile,$ionicLoading,userService,databaseService,consentDataManager,irkResults,$state,$location,$window) {

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

  /*  var templateUrl = $sce.getTrustedResourceUrl('templates/consent.html');
       $templateRequest(templateUrl).then(function(template) {
       $compile(template)($scope);
       }, function() {
           // An error has occurred here
       });
       */
/*
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
*/
      //   $scope.modal = $scope.learnmore;
      //   $scope.learnmore.show();
   });


$scope.closeModal = function() {
    // $scope.modal.remove();
    console.log('move to next screen');
  //  $state.transitionTo('loadSignUp');
 };

$scope.cancelClicked = function(){
 console.log('cancel the stuff ');
 // $stateProvider.state('home', { url: '/' });
 $state.transitionTo('home', $stateParams, { reload: true, inherit: false, notify: true });
// $state.transitionTo('home', null, {'reload':true});
};

$scope.doneClicked = function(){
//  $state.current, $stateParams, { reload: true, inherit: false, notify: true });
 $state.transitionTo('loadSignUp');
};

 // Cleanup the modal when we're done with it!
 $scope.$on('$destroy', function() {
   //$scope.modal.remove();
   console.log('destroy modal hit');
 });

 // Execute action on hide modal
 $scope.$on('modal.hidden', function() {
    console.log('hidden modal hit');
    $state.transitionTo('loadSignUp');
 });

  // Execute action on remove modal
  $scope.$on('modal.removed', function() {

  });

});

angular.module('eligibility',[])
//=======Home screen controller======================
.controller('eligibilityCtrl', function($scope,$stateParams,$ionicHistory,$compile,$cordovaSQLite,$controller,$ionicModal,$http,$ionicLoading,userService,databaseService,eligiblityDataManager,consentDataManager,irkResults,$state,$location,$window) {
//========================select eligiblity test view

eligiblityDataManager.getEligibilityQuestions().then(function(eligiblityData){
    $scope.eligiblityData =  eligiblityData ;
    $scope.isDisabled = true;
    $scope.results = new Array();
    $scope.roundClass = 'roundDisabled';
    //generate the view data and launch
    var optionList = '';
    angular.forEach($scope.eligiblityData, function(value, key){
        var id =  value.id;
        var question = value.title;
        var trueText = value['true-text'];
        var falseText = value['false-text'];
        var normalImage = 'irk-btn-round-outline';//value.normal-state-image;
        var selectedImage = 'irk-btn-round';//value.selected-state-image ;

        optionList = optionList + '<btc-image-choice-question-step id="'+id+'" title="'+question+'" optional="false" >'+
                       '<btc-image-choice value="'+trueText+'" normal-state-image="'+normalImage+'" selected-state-image="'+selectedImage+'" optiontext="'+trueText+'" >'+
                       '</btc-image-choice>'+
                        '<btc-image-choice value="'+falseText+'" normal-state-image="'+normalImage+'" selected-state-image="'+selectedImage+'" optiontext="'+falseText+'">'+
                       '</btc-image-choice>'+
                      '</btc-image-choice-question-step>'+
                      '<div class="irk-spacer"></div>';
         });

         var dynamicContent = angular.element(document.querySelector('#questionList'));
         dynamicContent.append(optionList);
         $compile(dynamicContent)($scope);
  });

$scope.checkEligibilitySubmitEnable = function(id,answer) {
$scope.results[id] = answer;
if(Object.keys($scope.results).length === $scope.eligiblityData.length ){
       $scope.isDisabled = false;
       $scope.roundClass = 'round1';
 }else{
     $scope.isDisabled = true;
  }
};

$scope.compareEligiblity = function() {
  var check = true ;
  angular.forEach($scope.eligiblityData, function(value, key){
        var questionID = value.id;
        var answerexpected = value.expected_answer;
       // Visit non-inherited enumerable keys
       Object.keys($scope.results).forEach(function(key) {
         if(key == questionID && check){
           var answerbyUser = $scope.results[key] ;
              if(answerbyUser.toLowerCase() != answerexpected.toLowerCase()){
               check = false ;
              }
          }
       });
   });

// if all set load sign up page
if(check){
   $ionicHistory.clearCache().then(function(){
      $state.go('eligibleUser');
   });
 }
else{
  $ionicHistory.clearCache().then(function(){
     $state.go('not-eligibleUser');
    });
  }
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

// ==== on click of back from sign in screen ========
  $scope.sectionBack = function() {
    $state.transitionTo('home', null, {'reload':false});
  };


 $scope.ChoosePassode = function() {
    $ionicModal.fromTemplateUrl('templates/choosepassode.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modal.remove();
      $scope.modal = modal;
      $scope.modal.show();
    });
  };

  $scope.OpenVerification = function() {
    $ionicModal.fromTemplateUrl('templates/verification.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modal.remove();
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

  $scope.closeModal = function() {
     $scope.modal.remove();
   };

   // Cleanup the modal when we're done with it!
   $scope.$on('$destroy', function() {
    // $scope.modal.remove();
   });

   // Execute action on hide modal
   $scope.$on('modal.hidden', function() {

   });

   // Execute action on remove modal
   $scope.$on('modal.removed', function() {

   });

});

angular.module('homeController',[])
//=======Home screen controller======================
.controller('HomeCtrl', function($scope,$ionicModal,$http,$ionicLoading,userService,irkResults,$state,$location,$window) {
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

//==================================Select email view ==========
  $scope.openSignInChooseEmail = function() {
    $ionicModal.fromTemplateUrl('templates/signIn-choose-email.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modal = modal;
      $scope.modal.show();
    });
  };

//========================select eligiblity test view   
$scope.showEligibilityTestView = function() {      
        /* 
        $ionicModal.fromTemplateUrl('<ion-modal-view class="irk-modal">'+
                            '<irk-ordered-tasks>'+
                            '</irk-ordered-tasks>'+
                            '</ion-modal-view>', {
          scope: $scope,
          animation: 'slide-in-up'
        }).then(function(modal) {
          $scope.modal.remove(); 
          $scope.modal = modal;
          $scope.modal.show();
        });
        */
 
   userService.getEligibilityQuestions().then(function(response){
   $scope.eligiblityData = response;
   $scope.isDisabled = true;
   $scope.results = new Array(); 
   //generate the view data and launch 
   var optionList = '';
   angular.forEach($scope.eligiblityData, function(value, key){
       var id =  value.id;
       var question = value.question;
       var normalImage = 'ion-happy-outline';//value.normal-state-image;
       var selectedImage = 'ion-happy';//value.selected-state-image ;

       optionList = optionList + '<btc-image-choice-question-step id="'+id+'" title="'+question+'" optional="false" >'+
                       '<btc-image-choice value="'+value.option1+'" normal-state-image="'+normalImage+'" selected-state-image="'+selectedImage+'">'+
                       '</btc-image-choice>'+
                        '<btc-image-choice value="'+value.option2+'" normal-state-image="'+normalImage+'" selected-state-image="'+selectedImage+'">'+
                       '</btc-image-choice>'+
                      '</btc-image-choice-question-step>'+
                      '<div class="irk-spacer"></div>';
        });

      $scope.moreview = $ionicModal.fromTemplate(
                                  '<ion-modal-view>'+
                                  '<ion-header-bar>'+
                                  '<i class="icon ion-ios-arrow-thin-left icon-font1" ng-click="SignInback()"></i>'+
                                  '<h1 class="title"></h1>'+
                                  '<div class="buttons">'+
                                  '<button class="button button-clear" ng-click="closeLogin()">Cancel</button>'+
                                  '</div>'+
                                  '</ion-header-bar>'+
                                  '<ion-content >'+
                                  '<form name="myForm">'+
                                 '<div class="irk-spacer"></div>'+
                                  optionList+
                                  '</form>'+
                                  '</ion-content>'+
                                  '<ion-footer-bar class="irk-bottom-bar" keyboard-attach irk-survey-bar>'+
                                  '<div>'+
                                  '<a class="button button-block button-outline  button-positive" ng-disabled="isDisabled" ng-click="compareEligiblity()"><i class="icon ion-arrow-right-c icon-font1"></i></a>'+
                                  '</div>'+
                                  '</ion-footer-bar>'+
                                  '</ion-modal-view>'
                              ,{
                                  scope: $scope,
                                  animation: 'slide-in-up'
                              });
        
         $scope.modal.remove(); 
         $scope.modal = $scope.moreview;
         $scope.moreview.show();   
  });

};

$scope.checkEligibilitySubmitEnable = function(id,answer) {
$scope.results[id] = answer;
if(Object.keys($scope.results).length === $scope.eligiblityData.length ){
       $scope.isDisabled = false;
 }else{
     $scope.isDisabled = true;
  }
};

 $scope.compareEligiblity = function() {
  var check = true ;
  angular.forEach($scope.eligiblityData, function(value, key){
        var questionID = value.id;
        var answerexpected = value.answer;
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

console.log('final status = ' +check);
// if all set load sign up page 
 if(check){
   $scope.openvalidform();
  }
};

// ==== Close the existing modal and open openSignUp in html in new modal========
  $scope.openSignUp = function() {
    $ionicModal.fromTemplateUrl('templates/signUp.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modal.remove(); 
      $scope.modal = modal;
      $scope.modal.show();
    });
  };


// ==== Close the existing modal and open Sign in html in new modal========
  $scope.openSignIn = function() {
    $ionicModal.fromTemplateUrl('templates/signIn.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modal.remove(); 
      $scope.modal = modal;
      $scope.modal.show();
    });
  };

// ==== on clcik of back from sign in screen ========
  $scope.SignInback = function() {
    $scope.modal.remove(); 
    $ionicModal.fromTemplateUrl('templates/signIn-choose-email.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modal = modal;
      $scope.modal.show();
    });
  };

//close button action
 $scope.closeLogin = function() {
    $scope.modal.remove();
  };

  //consent view 
  $scope.square = function() {
   var _this = this
        $ionicLoading.show({
          template: 'loading'
   })
 }

// ====Load user consent view from dynamic data ========
$scope.openModalConsent = function() {

 // release the $scope variables cache 
 delete $scope.consent_array;
 delete $scope.enable_review;

  userService.getUsers().then(function(response){
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
     
  });

  // Execute action on remove modal
  $scope.$on('modal.removed', function() {
     
  });
});
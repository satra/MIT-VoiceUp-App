angular.module('homeController',[])
//=======Home screen controller======================
.controller('HomeCtrl', function($scope,$compile,$rootScope,$cordovaSQLite,$ionicPopup,$ionicHistory,$controller,$ionicModal,$http,$ionicLoading,userService,databaseService,
  apiDataManagerService,profileDataManager,eligiblityDataManager,irkResults,$base64,$state,$location,$window) {
 //get IP like email ids
 $scope.$on('$ionicView.enter', function() {
     // Code you want executed every time view is opened
     console.log('Opened!')
     //ionic.Platform.exitApp();
  });

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

//==================================Select email view ==========
     $scope.openSignInChooseEmail = function() {
    //get IP like email ids
     profileDataManager.getEmailList().then(function(response){

       var griderArray = new Array() ;
       angular.forEach(response, function(value, key){
         griderArray.push({'emailId':value.emailId});
        })
       $scope.emails = griderArray;
    });

    $ionicModal.fromTemplateUrl('templates/signin-choose-email.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modal = modal;
      $scope.modal.show();
    });

  };

  $scope.resetInput = function() {
      var dynamicContent = angular.element(document.querySelectorAll('#passcode'));
      $scope.passcode = '';
      $compile(dynamicContent)($scope);
  };

  $scope.passcodeChanged = function (){
      var inputValue = angular.element(document.querySelectorAll('#passcode'));
      var passcode = inputValue.prop('value') ;
      if(passcode.length == 4){
        var emailDiv = angular.element(document.querySelectorAll('.passcode-dropdown'));
        var email = emailDiv.prop('selectedOptions')[0].value ;
        if (email && passcode) {
          var popupShow = false;
          //get IP like email ids
           profileDataManager.getUserIDByEmail(email).then(function(userId){
                if (userId) {
                  profileDataManager.logInViaPasscode(userId,passcode).then(function(response){
                       if (!response) {
                          if(!popupShow){
                             $ionicPopup.alert({
                              title: 'Validation Error',
                              template: 'Passcode not found try later !!!'
                             })
                              popupShow = true;
                            }
                          }else {
                              // All set go to next page
                              $ionicHistory.clearCache().then(function(){
                               $rootScope.emailId = email ; // save it to access in update profile
                               $scope.modal.remove();
                               console.log('inside transitionTo ....');
                               $state.transitionTo('tab.Activities');
                             });
                         }
                    });
                }else {
                    $ionicPopup.alert({
                     title: 'Validation Error',
                     template: 'EmailId not found try later !!!'
                    });
                }
            });
         }
      }
  }

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

  $scope.signInSubmit = function () {
    var inputValue = angular.element(document.querySelectorAll('.form-item'));
    var keepGoing = true; var formValid = true;
    var gradleArray = new Array();
      for (var i = 0; i < inputValue.length; i++) {
           var value = inputValue[i].value;
           var placeholder = inputValue[i].placeholder;
             if(value == ''){
                 if(keepGoing){
                    keepGoing = false;  formValid = false;
                    $scope.callAlertDailog('Please enter '+placeholder);
                  }
               }else {
                 var type = inputValue[i].type;
                  console.log(type);
                  if (type == 'email') {
                  gradleArray.push({'email':value});
                  }
                  if (type == 'password') {
                  gradleArray.push({'password':value});
                  }
               }
         }

    if (formValid) {
        var beforeEncode = gradleArray[0].email+':'+gradleArray[1].password;
        var encoded = 'Basic '+ $base64.encode(unescape(encodeURIComponent(beforeEncode)));
        apiDataManagerService.signInGradleUser(encoded).then(function(res){
            if (res.status == 200) {
              var token = res.data.authToken['token'] ;
              var email = res.data.user['email'] ;
              console.log('user data to db profile created auth token ' + token);
               profileDataManager.updateUserAuthToken(email,token).then(function(insertId){
                   console.log('inside update controller id updated ....'+insertId);
                   $ionicHistory.clearCache().then(function(){
                     $rootScope.emailId = email ; // save it to access in update profile
                     console.log($rootScope.emailId);
                     $scope.modal.remove();
                     console.log('inside transitionTo ....');
                     $state.transitionTo('tab.Activities');
                 });
              });
            }
         });
      }
   }

 $scope.skipSignIn = function (){
   $ionicHistory.clearCache().then(function(){
     $scope.modal.remove();
     console.log('inside transitionTo ....');
     $state.transitionTo('eligiblityTest');
   });
 }

$scope.callAlertDailog =  function (message){
        $ionicPopup.alert({
         title: 'Sign In Validation',
         template: message
        });
   }

});

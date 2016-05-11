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
       for (var i = 0; i < response.length; i++) {
         griderArray.push({'emailId':response.item(i).emailId});
       }
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

//sign in via email and passcode on change of passcode call this function
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
                              title: 'Error',
                              template: 'Invalid passcode!!!'
                             })
                              popupShow = true;
                            }
                          }else {
                              // All set go to next page
                              $ionicHistory.clearCache().then(function(){
                               $rootScope.emailId = email ; // save it to access in update profile
                               $scope.modal.remove();
                               console.log('inside transitionTo ....');
                               $rootScope.activeUser = email;
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

//from Sign in screen to  eligiblityTest
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


  //=========================================== from sign in screen to forgot passcode ===================
  $scope.forgotPasscodeDialog = function() {
    var emailDiv = angular.element(document.querySelectorAll('.passcode-dropdown'));
    var email = emailDiv.prop('selectedOptions')[0].value ;
    $scope.emailId = email.trim(); //capture the email id selected
    $ionicModal.fromTemplateUrl('templates/signin-enter-passcode.html', {
       scope: $scope,
       animation: 'slide-in-up'
     }).then(function(modal) {
       $scope.modal.remove();
       $scope.modal = modal;
       $scope.modal.show();
     });
  };

//====================================================Sign in for both forgot passcode and sign in screen ========
$scope.signInSubmit = function (statePassed) { // recive the state to determine the UI Input and the call is coming from
    var keepGoing = true; var formValid = true;
    // validate input fields
    var inputValue = angular.element(document.querySelectorAll('.form-item'));
    for (var i = 0; i < inputValue.length; i++) {
           var value = inputValue[i].value;
           var placeholder = inputValue[i].placeholder;
             if(value == ''){
                 if(keepGoing){
                    keepGoing = false;  formValid = false;
                    $scope.callAlertDailog('Please enter '+placeholder);
                  }
               }
    }

    if (formValid) {
        var password  = angular.element(document.querySelector('#password')).prop('value');
        var email  = angular.element(document.querySelector('#email')).prop('value');
        if (email && password ) {
          var beforeEncode = email.trim()+':'+password.trim();
          console.log("encoded value "+ beforeEncode);
          var encoded = 'Basic '+ $base64.encode(unescape(encodeURIComponent(beforeEncode)));
          apiDataManagerService.signInGradleUser(encoded).then(function(res){
              if (res.status == 200) {
                      var token = res.data.authToken['token'] ;
                      var email = res.data.user['email'] ;
                       profileDataManager.updateUserAuthToken(email,token).then(function(insertId){
                       $rootScope.emailId = email ; // save it to access in update profile
                       $scope.modal.remove();
                       if (statePassed == 'signin') {  // if the user coming from sign in page
                        $scope.transition('tab.Activities');
                      }else if (statePassed == 'passcode') { // if the user coming from forgot passcode
                       $scope.emailId = email ;
                       $scope.launchpinScreen();
                      }
                  });
               }
           });
         } // validate
      } // form valid
} // submit

//on forgot passcode launch pin screen and reset the passcode
$scope.launchpinScreen = function(){
     $ionicModal.fromTemplateUrl('templates/choosepassode.html', {
       scope: $scope,
       animation: 'slide-in-up',
     }).then(function(modal) {
         $scope.modal = modal;
         $scope.passcodeLabel = "Enter Passcode";
         $scope.managePasscode = false ;
         $scope.managePasscodeConfirm = true ;
         $scope.confirmLoop = 0;
         $scope.emailId = $rootScope.emailId ;
         $scope.modal.show();
      });
  }

//===================================================passcode handler ============================
  $scope.checkConfirmPasscodeDigits = function(){
      var confirm_passcode_div = angular.element(document.querySelector('#confirm_passcode'));
      var confirm_passcode = confirm_passcode_div.prop('value');
         if(confirm_passcode.length == 4){
          //check is both are equal
          if($scope.passcode == confirm_passcode){
              var email = $scope.emailId ;
              if (email) {
                profileDataManager.getUserIDByEmail(email).then(function(res){
                       profileDataManager.addPasscodeToUserID(res,$scope.passcode).then(function(res){
                            $scope.transition('tab.Activities');
                          });
                    });
                }
            }else {
            //reset div
            $scope.confirm_passcode = '';
            $compile(confirm_passcode_div)($scope);
            $scope.callAlertDailog("Passcode should match with confirm");
            $scope.confirmLoop = $scope.confirmLoop +1;
             if($scope.confirmLoop >= 3){
               $scope.passcodeLabel = "Enter Passcode";
               $scope.managePasscode = false ;
               $scope.managePasscodeConfirm = true ;
               $scope.confirmLoop = 0;
               //clear div
               var passcode_div = angular.element(document.querySelector('#passcode'));
               $scope.passcode = '';
               $compile(passcode_div)($scope);
             }
           }
          }else if(confirm_passcode.length > 4) {
          $scope.callAlertDailog("Passcode length should be max 4.");
         }
  }

  $scope.checkPasscodeDigits = function(){
       var passcode = angular.element(document.querySelector('#passcode')).prop('value') ;
       if(passcode.length == 4){
         $scope.passcode = passcode ;
         $scope.managePasscode = true ;
         $scope.passcodeLabel = "Confirm Passcode";
         $scope.managePasscodeConfirm = false ;
       }else if(passcode.length > 4) {
        $scope.callAlertDailog("Passcode length should be max 4.");
       }
   }

//==================forgot password login via email ================
$scope.forgotPassword = function (){
  var myPopup = $ionicPopup.show({
    template: '<input style="text-align: center" type="Email" id="email_recover" placeholder="Email" focus-me>',
    title: 'Forgot Password',
    subTitle: 'Please enter your email',
    scope: $scope,
    buttons: [
       { text: 'Cancel' },
       {
        text: '<b>Done</b>',
        type: 'button-positive',
        onTap: function(e) {
          var emailId = angular.element(document.querySelector('#email_recover')).prop('value') ;
          if (emailId.length != 0) {
              // process the request
              apiDataManagerService.userForgotPassword(emailId).then(function(res){
                  if (res.status == 200) {
                         $scope.callAlertDailog(res.message);
                       }else if (res.status == 400){
                         e.preventDefault();
                         $scope.callAlertDailog(res.message);
                       }
                  return $scope ;
                 });
               } else {
               e.preventDefault();
            }
          }
        }
      ]
    });
 }

//skip sign in from home->signIn->signIn->skip
$scope.skipSignIn = function (){
   $ionicHistory.clearCache().then(function(){
     $scope.modal.remove();
     $state.transitionTo('eligiblityTest');
   });
 }

//error handler dailog
$scope.callAlertDailog =  function (message){
        $ionicPopup.alert({
         title: 'Error',
         template: message
        });
  }

//on done clear states and travel to next screen
$scope.transition =  function (state){
     $ionicHistory.clearCache().then(function(){
     console.log('inside transitionTo ....'+ state);
     $state.transitionTo(state);
     });
  }

});

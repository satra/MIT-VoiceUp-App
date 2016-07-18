angular.module('signUp',[])
//=======Home screen controller======================
.controller('signUpCtrl', function($scope,$rootScope,$cordovaSQLite,$ionicHistory,$ionicPopup,$q,$compile,$ionicModal,$http,$ionicLoading
  ,profileDataManager,databaseManager,dataStoreManager,syncDataFactory,$base64,surveyDataManager,$state,userService,$window,$cordovaDeviceMotion,$cordovaMedia,$cordovaGeolocation) {

      profileDataManager.getUserProfileFields().then(function(response){
      var userProfile = response;
      var thisUser = userProfile.profiles[userProfile.default];
      var items = thisUser.items;
      //$scope.text = thisUser.text ;
      $scope.title = thisUser.title ;
      $scope.profileDiv = '';
      for (var i = 0; i < items.length; i++) {
      $scope.profileDiv += generateProfileDiv(items[i]);
      }

      var dynamicContent = angular.element(document.querySelector('#dynamicContent'));
      dynamicContent.append($scope.profileDiv);
      $compile(dynamicContent)($scope);


       var result = $rootScope.consentFullJson ;
          for (var i = 0; i < result.length; i++) {
            var type = result[i].type;
              if (type == "IRK-CONSENT-REVIEW-STEP") {
                 if (result[i].participantFamilyName) {
                    $scope.firstName_firstName = result[i].participantGivenName;
                    $scope.lastName_lastName  = result[i].participantFamilyName ;
                 }
            }
       }

     });

     $scope.passcodeValidation= function(){
       // to get all the items
      var steps = angular.element(document.querySelectorAll('.item-input'));
      var formValid = true;
      var keepGoing = true;
      var password = null ;
      var password_confirm = null;
      var emailId = null;
      var dataCache = [];
      var girderArray = new Array();

 //iterate the form and validate the form
  for (var i = 0; i < steps.length; i++) {
  var lableId = steps[i].id;
  var spanTag = angular.element(document.querySelectorAll('.item-input')[i].querySelector('span'));
  var text = spanTag[0].textContent ;
  if(keepGoing){
     var inputValue = angular.element(document.querySelectorAll('.item-input')[i].querySelector('input'));
     var type = inputValue.prop('type');
     var placeholder = inputValue.prop('placeholder');
     var value = inputValue.prop('value') ;
     switch (lableId.toLowerCase()) {
      case 'firstname':
              if(value ==''){
                formValid = false;
                keepGoing = false;
                //clear the array
                $scope.callAlertDailog('Please enter your '+lableId);
              }else {
                obj = {"id": lableId,  "placeholder": placeholder,"text":text,"type": type,"value":value};
                dataCache.push(obj);
                girderArray.push({'firstName':value});
              }
           break;
       case 'lastname':
               if(value ==''){
                   formValid = false ; keepGoing = false;
                   $scope.callAlertDailog('Please enter your '+lableId);
               }else {
                 obj = {"id": lableId,  "placeholder": placeholder,"text":text,"type": type,"value":value};
                 dataCache.push(obj);
                 girderArray.push({'lastName':value});
               }
           break;
       case 'email':
               if(value ==''){
                   formValid = false ; keepGoing = false;
                   $scope.callAlertDailog('Please enter your '+lableId);
               }else {
                 //is email valid
                 if(inputValue.hasClass('ng-invalid-email') || inputValue.hasClass('ng-invalid')){
                   formValid = false ; keepGoing = false;
                   $scope.callAlertDailog('Email '+value+' is invalid.');
                 }else {
                   emailId = value;
                   obj = {"id": lableId,  "placeholder": placeholder,"text":text,"type": type,"value":value};
                   dataCache.push(obj);
                   girderArray.push({'email':value});
                 }
               }
           break;
       case 'password':
             password = value ;
               if(password ==''){
                   formValid = false ; keepGoing = false;
                   $scope.callAlertDailog('Please enter your '+lableId);
               }else {
                     if(password.length < 6){
                       formValid = false ; keepGoing = false;
                       $scope.callAlertDailog('Password must be at least 6 characters.');
                     }else {
                       girderArray.push({'password':value});
                     }
               }
           break;
       case 'password_confirm':
               password_confirm = value ;
               if(password_confirm ==''){
                   formValid = false ; keepGoing = false;
                   $scope.callAlertDailog('Please enter your '+lableId);
               }else {
                 if(password_confirm.length < 6){
                   formValid = false ; keepGoing = false;
                   $scope.callAlertDailog('Confirm Password must be at least 6 characters.');
                 }
               }
             break;

        case 'gender':
                        var select = angular.element(document.querySelectorAll('.item-input')[i].querySelector('select'));
                        var value = select.prop('value');
                        var options = select.prop('options');
                        var placeholder = select.prop('placeholder');
                        var choices = new Array();
                        for (var k = 0; k < options.length; k++) {
                        choices.push(options[k].value);
                        }
                       obj = {"id": lableId,  "placeholder": placeholder,"text":text,"type": 'radio',"value":value,"choices":choices};
                       dataCache.push(obj);
        break;

        case 'dateofbirth':
                       obj = {"id": lableId,  "placeholder": placeholder,"text":text,"type": type,"value":value};
                       dataCache.push(obj);
          break;

        case 'weight':
                        obj = {"id": lableId,  "placeholder": placeholder,"text":text,"type": type,"value":value};
                        dataCache.push(obj);
           break;

        case 'height':
                         obj = {"id": lableId,  "placeholder": placeholder,"text":text,"type": type,"value":value};
                         dataCache.push(obj);
         break;
       default: break ;
       }
     }
  }

if (formValid) {
        //check password equal to confirm password
        if(password == password_confirm){
          $scope.emailId = emailId ;
          //clear the sign up form
          $scope.clearSignUpDiv();
          profileDataManager.checkUserExistsByEmail(emailId).then(function(res){
             if(res){ //user email id already exits
              $scope.callAlertDailog('User already exists ');
             }else { // insert this user to db
               $scope.password = password ;
               $ionicLoading.show();
               var today = new Date() ;
               var dateFormatted = today.getFullYear();
               dateFormatted += today.getMonth();
               dateFormatted +=today.getDay();
               var login = girderArray[0].firstName+girderArray[1].lastName+dateFormatted ;
               girderArray.push({'login':login});

               dataStoreManager.createGlobalUser(girderArray).then(function(res){
                      if (res.status == 200) {
                          var resultData = res.data ;
                          var userId = resultData._id;
                          if (userId) {
                            var userVerified = "no";
                            var consentResult = $rootScope.consentResult;
                            var profileJsonString = JSON.stringify(dataCache) ;
                            var docDefinition = "";
                            if (consentResult) {
                              docDefinition = JSON.stringify(consentResult.docDefinition);
                            }
                            profileDataManager.getAppJSON().then(function(appJson){
                            if (appJson) {
                            var appJson = JSON.stringify(appJson) ;
                            profileDataManager.createNewUser(dataCache,$scope.emailId,userId,"",userVerified).then(function(localUserId){
                                if (localUserId) {
                                  $scope.localUserId = localUserId ;
                                  $rootScope.emailId =  $scope.emailId ; // save it to access in update profile
                                  $rootScope.activeUser =  $scope.emailId ;
                                  var folderId = ""; var itemId = "";
                                  var  addToSyncQueue = [];
                                  addToSyncQueue.push(syncDataFactory.addToSyncQueue("",localUserId,"app_json",appJson,folderId,itemId));
                                  addToSyncQueue.push(syncDataFactory.addToSyncQueue("",localUserId,"consent_json",docDefinition,folderId,itemId));
                                  addToSyncQueue.push(syncDataFactory.addToSyncQueue("",localUserId,"profile_json",profileJsonString,folderId,itemId));
                                  $q.all(addToSyncQueue).then(function(createLocalData){
                                    var consent = "";
                                    if (consentResult) {
                                      consent = consentResult.docDefinition ;
                                    }
                                  surveyDataManager.addResultToDb(localUserId,consent,'consent').then(function(response){
                                        $ionicLoading.hide();
                                        $scope.removeSignUpDiv();
                                        $scope.launchpinScreen();
                                       });
                                  });
                                 }
                              });
                            }
                          });
                         }
                      }
                   },function(error){
                     if (!error.statusText) {
                       $scope.callAlertDailog("couldn't able to create user "+error.statusText);
                     }
                 });
             }
          });
        }else {
          formValid = false ; keepGoing = false;
          $scope.callAlertDailog('Password should match with confirm password');
          }
       }else {
          // redefine the array make sure to clear the array
         dataCache = [];
       }
  }

$scope.callAlertDailog =  function (message){
         document.activeElement.blur(); // remove the keypad
         $ionicLoading.hide();
         $ionicPopup.alert({
          title: 'Sign Up Validation',
          template: message
         });
    }

$scope.skipSignUp = function(){
      $ionicHistory.clearCache().then(function(){
        $state.transitionTo('tab.Activities');
      });
    }

$scope.launchpinScreen = function(){
      $ionicHistory.clearCache().then(function(){
        $ionicModal.fromTemplateUrl('templates/choosepassode.html', {
          scope: $scope,
          animation: 'slide-in-up',
        }).then(function(modal) {
          $scope.modal = modal;
          $scope.modal.show();
        });
      });
  }


//=====sign up cancel ====================================
$scope.backtohome = function(){
   $scope.clearSignUpDiv();
   $ionicHistory.clearCache().then(function(){
      $state.go('home', {cache: false});
   });
}

$scope.clearSignUpDiv = function(){
  var steps = angular.element(document.querySelectorAll('input'));
  for (var i = 0; i < steps.length; i++) {
  var lableId = steps[i].id;
  $scope.labelId = "";
  }
}

$scope.removeSignUpDiv = function(){
  angular.element(document.querySelectorAll('.item-input')).remove();
  angular.element(document.querySelectorAll('#signUpDiv')).remove();
  //var select = angular.element(document.querySelectorAll('.item-input')[i].querySelector('select'));
//  removeSignUpDiv.remove();
}
//=================================================== forgot passcode handler ============================

    $scope.checkPasscodeDigits = function(){
         var passcode = angular.element(document.querySelector('#passcode')).prop('value') ;
         if(passcode.length == 4){
           $scope.passcode = passcode ;
           $scope.managePasscode = true ;
           document.activeElement.blur(); // remove the keypad
           $scope.passcodeLabel = "Confirm Passcode";
           $scope.managePasscodeConfirm = false ;
         }else if(passcode.length > 4) {
          $scope.callAlertDailog("Passcode length should be max 4.");
         }
     }

     //=================================================== confirm  passcode handler ============================

    $scope.passcodeLabel = "Create passcode";
    $scope.managePasscode = false ;
    $scope.managePasscodeConfirm = true ;
    $scope.confirmLoop = 0;

    $scope.checkConfirmPasscodeDigits = function(){
        var confirm_passcode_div = angular.element(document.querySelector('#confirm_passcode'));
        var confirm_passcode = angular.element(document.querySelector('#confirm_passcode')).prop('value');
           if(confirm_passcode.length == 4){
            //check is both are equal
            if($scope.passcode == confirm_passcode){
                var email = $scope.emailId ;
                var girderToken = $scope.girderToken;
                if (email) {
                  profileDataManager.getUserIDByEmail(email).then(function(res){
                         profileDataManager.addPasscodeToUserID(res,$scope.passcode,email,girderToken).then(function(res){
                                    $scope.openVerification();
                              });
                    });
                }
            }else {
              //reset div
              $scope.confirm_passcode = '';
            //  $compile(confirm_passcode_div)($scope);
              confirm_passcode_div.val("");
              $scope.callAlertDailog("Passcode should match with confirm Passcode ");
              $scope.confirmLoop = $scope.confirmLoop +1;
               if($scope.confirmLoop >= 3){
                 document.activeElement.blur(); // remove the keypad
                 $scope.passcodeLabel = "Create passcode";
                 $scope.managePasscode = false ;
                 $scope.managePasscodeConfirm = true ;
                 $scope.confirmLoop = 0;
                 //clear div
                 var passcode_div = angular.element(document.querySelector('#passcode'));
                 $scope.passcode = '';
                // $compile(passcode_div)($scope);
                 passcode_div.val("");
               }
            }
           }else if(confirm_passcode.length > 4) {
            $scope.callAlertDailog("Passcode length should be max 4.");
           }
    }



//=================== verify user later ======
$scope.verifyLater = function(){

  $ionicModal.fromTemplateUrl('templates/locationservice.html', {
    scope: $scope,
    animation: 'slide-in-up'
   }).then(function(modal) {
     $scope.modal.remove();
     $scope.modal = modal;
     $scope.modal.show();
     $scope.accelerationLabel='Allow';
     $scope.microPhoneLabel = 'Allow';
     $scope.geoLabel = 'Allow';
     $scope.allowGeoLocation();
      $scope.allowMicroPhone ();
     $scope.allowAccelerometer();
     $scope.Disable = false;
   });
}


//========================All set go to next screen ===========================
    $scope.openVerification = function() {
      $ionicModal.fromTemplateUrl('templates/verification.html', {
        scope: $scope,
        animation: 'slide-in-up'
       }).then(function(modal) {
        $scope.modal.remove();
        $scope.modal = modal;
        $scope.modal.show();
       });
     };

$scope.openPermisssions = function() {
       var email = $scope.emailId ;
       var password = $scope.password ;
       if (email && password && !$scope.userSyncStatus) {
         var beforeEncode = email.trim()+':'+password.trim();
         var encoded = 'Basic '+ $base64.encode(unescape(encodeURIComponent(beforeEncode)));
         $ionicLoading.show();
         syncDataFactory.verifyUserToFetchToken(encoded).then(function(res){
             $ionicLoading.hide();
             if (res.status == 200 || !res.data) {
               $scope.userSyncStatus = true ;
               $scope.startSyncServices();
             }else {
               $scope.failureMessage(res.data.message);
             }
         },function(error){
            $scope.failureMessage(error.statusText);
         });

      }else if ($scope.userSyncStatus) {
          $scope.verifyLater();
      }
};

$scope.startSyncServices = function(){
  // start sync services to upload the data
  syncDataFactory.checkDataAvailableToSync().then(function(res){
       if (res.length > 0 ) {
          syncDataFactory.startSyncServiesTouploadData(res).then(function(res){
            $ionicLoading.hide();
            $scope.verifyLater();
          },function(error){
             $scope.failureMessage(error.statusText);
          });
       }else {
         $scope.verifyLater();
         $ionicLoading.hide();
       }
     });
}

$scope.failureMessage = function(message){
      $ionicLoading.hide();
      $ionicPopup.alert({
       title: "Error",
       template: message
      });
}

$scope.allowGeoLocation = function(){

          $scope.Disable = true;
            console.log($scope.Disable);
        // cordova.plugins.diagnostic.isLocationEnabled(function(enabled){
        // $scope.geoLabel = 'Granted';
        // }, function(error){
        // $scope.geoLabel = 'Allow';
        // });
        var posOptions = {timeout: 10000, enableHighAccuracy: false};

           $cordovaGeolocation
           .getCurrentPosition(posOptions)

           .then(function (position) {

              var lat  = position.coords.latitude
              var long = position.coords.longitude
              $scope.geoLabel = 'Granted';

              console.log(lat + '   ' + long)
           }, function(err) {
                    $scope.geoLabel = 'Allow';
                    $scope.Disable = false;
                  console.log($scope.Disable);
              console.log(err);
      });
    };
    // FOr LAter use//
  //   $scope.allowMicroPhone = function(){
  //           var myEl = angular.element( document.querySelector( '#microID' ) );
  //   cordova.plugins.diagnostic.requestMicrophoneAuthorization(function(status){
  //      if(status === cordova.plugins.diagnostic.permissionStatus.GRANTED){
  //           $scope.microPhoneLabel = 'Granted';
  //          console.log("Microphone use is authorized");
  //      }
  //   }, function(error){
  //
  //        $scope.microPhoneLabel = 'Allow';
  //       console.error(error);
  //   });
  // }
// for later use

//   $scope.haslocation = function(){
//     cordova.plugins.diagnostic.isLocationAuthorized(function(enabled){
//                     $scope.geoLabel = 'Allow';
//     console.log("Location authorization is " + (enabled ? "enabled" : "disabled"));
// }, function(error){
//                 $scope.geoLabel = 'Allow';
//     console.error("The following error occurred: "+error);
// });
// // cordova.plugins.diagnostic.isLocationEnabled(function(Success){
// //                        $scope.geoLabel = 'Granted';
// //     console.log("Location setting is " + (enabled ? "enabled" : "disabled"));
// // }, function(error){
// //             $scope.geoLabel = 'Allow';
// //     console.error("The following error occurred: "+error);
// // });
//   }
      $scope.allowAccelerometer = function(){

        //  var watchID = navigator.accelerometer.watchAcceleration(accelerometerSuccess, accelerometerError, {frequency: 3000});
        //  function accelerometerSuccess(acceleration) {
        //     $scope.accelerationLabel = 'Granted';
        //  };
        //  function accelerometerError() {
        //     $scope.accelerationLabel = 'Allow';
        //  };
        // $scope.watch = $cordovaDeviceMotion.watchAcceleration($scope.options);
        // // Device motion initilaization
        // var options = { frequency:1000 };  // Update every 3 seconds
        // $scope.watch.then(null, function(error) {
        //        $scope.accelerationLabel='Allow';
        //          $scope.Disable = false;
        //       console.log($scope.accelerationLabel);
        //                     console.log($scope.Disable);
        //   },
        //
        //   function(accelerometerSuccess,options) {
        //   // Set current data
        //        $scope.accelerationLabel='Granted';
        //             $scope.Disable = true;
        //        console.log($scope.accelerationLabel);
        //           console.log($scope.Disable);
        //   // Detecta shake
        // //  $scope.detectShake(result);
        //
        // });


        $scope.options = {
          frequency: 50, // Measure every 100ms
              deviation : 25  // We'll use deviation to determine the shake event, best values in the range between 25 and 30
        };
        $scope.watch = $cordovaDeviceMotion.watchAcceleration($scope.options);

        // Device motion initilaization
        $scope.watch.then(null, function(error) {

           $scope.accelerationLabel='Allow';
          console.log('Error');
          console.log( $scope.accelerationLabel)
          },function(result) {
          // Set current data
              $scope.accelerationLabel='Granted';

          $scope.measurements.x = result.x;
          $scope.measurements.y = result.y;
          $scope.measurements.z = result.z;
          $scope.measurements.timestamp = result.timestamp;
          $scope.detectShake(result);
            console.log( $scope.accelerationLabel)

        });
      };

      $scope.allDone = function() {
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
        $ionicHistory.clearCache().then(function(){
          $scope.modal.remove();
          $state.transitionTo('tab.Activities');
        });
      }

     $scope.closeModal = function() {
       $scope.modal.remove();
     };

     // Cleanup the modal when we're done with it!
     $scope.$on('$destroy', function() {
      // $scope.modal.remove();
     });

     // Execute action on hide modal
     $scope.$on('modal.hidden', function() {
       // Execute action
     });

     // Execute action on remove modal
     $scope.$on('modal.removed', function() {
       // Execute action
     });

});

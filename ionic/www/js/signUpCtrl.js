angular.module('signUp',[])
//=======Home screen controller======================
.controller('signUpCtrl', function($scope,$rootScope,$cordovaSQLite,$ionicHistory,$ionicPopup,$q,$compile,$ionicModal,$http,$ionicLoading
  ,profileDataManager,databaseManager,dataStoreManager,syncDataFactory,surveyDataManager,$state,userService,$window,$cordovaDeviceMotion,$cordovaMedia,$cordovaGeolocation) {

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
                            var girderToken = resultData.authToken['token'];
                            $scope.girderToken = girderToken ;
                            var folderName = 'user';
                            profileDataManager.getAppJSON().then(function(appJson){
                                if (appJson) {
                                  var appJson = JSON.stringify(appJson) ;

                                  dataStoreManager.createUserFolderInServer(girderToken,resultData._id,folderName).then(function(folderInfo){
                                     if (folderInfo.status==200) {
                                       var folderDetails = folderInfo.data ;
                                       var folderId = folderDetails._id ;
                                       var consentResult = $rootScope.consentResult;
                                       var profileJsonString = JSON.stringify(dataCache) ;
                                       var docDefinition = JSON.stringify(consentResult.docDefinition);

                                       profileDataManager.createNewUser(dataCache,$scope.emailId,userId,folderId).then(function(localUserId){
                                          if (localUserId) {
                                              surveyDataManager.addResultToDb(localUserId,consentResult.docDefinition,'consent').then(function(response){
                                              $rootScope.emailId =  $scope.emailId ; // save it to access in update profile
                                              $rootScope.activeUser =  $scope.emailId ;

                                              $scope.removeSignUpDiv();
                                              $scope.launchpinScreen();

                                             // failed to upload the profile data make an entry into sync table
                                             syncDataFactory.addToSyncQueue(girderToken,localUserId,"profile",profileJsonString).then(function(profileUpload){
                                                    if (profileUpload) {
                                                      var itemName = "profile";
                                                      var fileName = "profile_json";
                                                      $scope.uploadProfileData(girderToken,folderId,profileJsonString,localUserId,itemName,fileName);
                                                     }
                                              });

                                              syncDataFactory.addToSyncQueue(girderToken,localUserId,"consent",docDefinition).then(function(consentUpload){
                                                      if (consentUpload) {
                                                        var itemName = "consent";
                                                        var fileName = "consent_json";
                                                        $scope.uploadConsentData(girderToken,folderId,docDefinition,localUserId,itemName,fileName);
                                                      }
                                              });

                                              syncDataFactory.addToSyncQueue(girderToken,localUserId,"app",appJson).then(function(consentUpload){
                                                      if (consentUpload) {
                                                        var itemName = "app";
                                                        var fileName = "app_json";
                                                        $scope.uploadAppData(girderToken,folderId,appJson,localUserId,itemName,fileName);
                                                      }
                                              });

                                              $scope.createFolderItem(girderToken,folderId,'results');
                                              $scope.createFolderItem(girderToken,folderId,'settings');

                                             });
                                          }
                                      });
                                    }
                                 },function(error){
                                   console.log(error);
                                   if (!error.statusText) {
                                      $scope.callAlertDailog("couldn't able to create user folder "+error.statusText);
                                   }
                                 });

                                }
                              });
                          }
                      }
                   },function(error){
                     console.log(error);
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

$scope.uploadProfileData = function(girderToken,folderId,profileJsonString,localUserId,itemName,fileName){
    var createDataItem = syncDataFactory.createItemForFolder(girderToken,folderId,itemName).then(function(createDataItem){
        if (createDataItem.status==200) {
        var itemCreateDetails = createDataItem.data ;
        var itemCreateId = itemCreateDetails._id ;
        var dataString = LZString.compressToEncodedURIComponent(profileJsonString);
        var fileSize = dataString.length;
        var deferred = $q.defer();
        var createFileForItem = syncDataFactory.createFileForItem(girderToken,itemCreateId,fileName,fileSize).then(function(createFileForItem){
            if (createFileForItem.status==200) {
                   var fileCreateDetails = createFileForItem.data ;
                   var fileCreateId = fileCreateDetails._id ;
                   var dataString = LZString.compressToEncodedURIComponent(profileJsonString);
                   var deferred = $q.defer();
                   var chunkInfo = syncDataFactory.uploadChunkForFile(girderToken,fileCreateId,dataString).then(function(chunkInfo){
                     if (chunkInfo.status==200) {
                     var chunkDetails = chunkInfo.data ;
                     //clear the sync table for profile
                     var deferred = $q.defer();
                     syncDataFactory.removeProfileData(localUserId,itemName).then(function(syncItemRemove){
                         if (syncItemRemove) {
                           console.log("sync profile "+itemName+" removed ");
                         }
                      });
                    }
                 },function(eror){
                    console.log(error);
                  });
               }
           },function(eror){
              console.log(error);
            });
        }
      },function(eror){
          console.log(error);
       });
}

//=================create an item for the folder
$scope.createFolderItem = function (girderToken,folderId,itemName){
              try {
                var deferred = $q.defer();
                var createFolderItem = dataStoreManager.createItemForFolder(girderToken,folderId,itemName).then(function(createItem){
                    if (createItem.status==200) {
                    }
                    deferred.resolve(createFolderItem);
                  });
                }
                catch(err) {
                  console.log('error'+err);
                }
    }

//=== upload consent json for the file ===========================================
$scope.uploadConsentData = function(girderToken,folderId,consentJsonString,localUserId,itemName,fileName){
    var createDataItem = syncDataFactory.createItemForFolder(girderToken,folderId,itemName).then(function(createDataItem){
        if (createDataItem.status==200) {
        var itemCreateDetails = createDataItem.data ;
        var itemCreateId = itemCreateDetails._id ;
        var dataString = LZString.compressToEncodedURIComponent(consentJsonString);
        var fileSize = dataString.length;
        var deferred = $q.defer();
        var createFileForItem = syncDataFactory.createFileForItem(girderToken,itemCreateId,fileName,fileSize).then(function(createFileForItem){
            if (createFileForItem.status==200) {
                   var fileCreateDetails = createFileForItem.data ;
                   var fileCreateId = fileCreateDetails._id ;
                   var dataString = LZString.compressToEncodedURIComponent(consentJsonString);
                   var deferred = $q.defer();
                   var chunkInfo = syncDataFactory.uploadChunkForFile(girderToken,fileCreateId,dataString).then(function(chunkInfo){
                     if (chunkInfo.status==200) {
                     var chunkDetails = chunkInfo.data ;
                     //clear the sync table for profile
                     var deferred = $q.defer();
                     syncDataFactory.removeProfileData(localUserId,itemName).then(function(syncItemRemove){
                         if (syncItemRemove) {
                           console.log("sync profile "+itemName+" removed ");
                         }
                      });
                    }
                 },function(eror){
                    console.log(error);
                  });
               }
           },function(eror){
              console.log(error);
            });
        }
      },function(eror){
          console.log(error);
       });
}

//=== upload app json for the file ===========================================
$scope.uploadAppData = function(girderToken,folderId,appJsonString,localUserId,itemName,fileName){
    var createDataItem = syncDataFactory.createItemForFolder(girderToken,folderId,itemName).then(function(createDataItem){
        if (createDataItem.status==200) {
        var itemCreateDetails = createDataItem.data ;
        var itemCreateId = itemCreateDetails._id ;
        var dataString = LZString.compressToEncodedURIComponent(appJsonString);
        var fileSize = dataString.length;
        var deferred = $q.defer();
        var createFileForItem = syncDataFactory.createFileForItem(girderToken,itemCreateId,fileName,fileSize).then(function(createFileForItem){
            if (createFileForItem.status==200) {
                   var fileCreateDetails = createFileForItem.data ;
                   var fileCreateId = fileCreateDetails._id ;
                   var dataString = LZString.compressToEncodedURIComponent(appJsonString);
                   var deferred = $q.defer();
                   var chunkInfo = syncDataFactory.uploadChunkForFile(girderToken,fileCreateId,dataString).then(function(chunkInfo){
                     if (chunkInfo.status==200) {
                     var chunkDetails = chunkInfo.data ;
                     //clear the sync table for profile
                     var deferred = $q.defer();
                     syncDataFactory.removeProfileData(localUserId,itemName).then(function(syncItemRemove){
                         if (syncItemRemove) {
                           console.log("sync profile "+itemName+" removed ");
                         }
                      });
                    }
                 },function(eror){
                    console.log(error);
                  });
               }
           },function(eror){
              console.log(error);
            });
        }
      },function(eror){
          console.log(error);
       });
}

$scope.callAlertDailog =  function (message){
         document.activeElement.blur(); // remove the keypad
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
           $scope.allowAccelerometer();
          $scope.Disable = false;

      });
    };

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

      $scope.allowAccelerometer = function(){

        //  var watchID = navigator.accelerometer.watchAcceleration(accelerometerSuccess, accelerometerError, {frequency: 3000});
        //  function accelerometerSuccess(acceleration) {
        //     $scope.accelerationLabel = 'Granted';
        //  };
        //  function accelerometerError() {
        //     $scope.accelerationLabel = 'Allow';
        //  };
        $scope.watch = $cordovaDeviceMotion.watchAcceleration($scope.options);
        // Device motion initilaization
        $scope.watch.then(null, function(error) {
               $scope.accelerationLabel='Allow';
                 $scope.Disable = false;
              console.log($scope.accelerationLabel);
                            console.log($scope.Disable);
          },

          function(accelerometerSuccess) {
          // Set current data
               $scope.accelerationLabel='Granted';
                    $scope.Disable = true;
               console.log($scope.accelerationLabel);
                  console.log($scope.Disable);
          // Detecta shake
          $scope.detectShake(result);

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

angular.module('signInCtrl',[])
//=======Home screen controller======================
.controller('signInCtrl', function($scope,$compile,$timeout,$rootScope,$cordovaSQLite,$ionicPopup,$ionicHistory,$controller,$ionicModal,$http,$ionicLoading,userService,databaseManager,
  dataStoreManager,consentDataManager,profileDataManager,surveyDataManager,$cordovaEmailComposer,syncDataFactory,pinModalService,eligiblityDataManager,irkConsentDocument,irkResults,$base64,$state,$location,$window,$q) {

//==================================Select email view ==========
profileDataManager.getEmailList().then(function(response){
       var griderArray = new Array() ;
       if (response) {
         for (var i = 0; i < response.length; i++) {
           griderArray.push({'emailId':response.item(i).emailId});
         }
       }
        $scope.emails = griderArray;
    });

    $ionicModal.fromTemplateUrl('templates/signin-choose-email.html', {
      scope: $scope,
      animation: 'slide-in-left',
      hardwareBackButtonClose: false,
    }).then(function(modal) {
      $scope.modal = modal;
      $scope.modal.show();
      $scope.hidePasscodeDiv = true ;
      $scope.hideImageDiv = false ;
    });

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
      $ionicHistory.clearCache().then(function(){
          $state.transitionTo('home');
      });
    };

  $scope.resetInput = function() {
    if(ionic.Platform.isIOS()){
    $scope.ShowIos = true;
    console.log("its iOs");
  }else if(ionic.Platform.isAndroid()){
    $scope.ShowAndroid = true;
    console.log("its android");
  }
       $scope.hidePasscodeDiv = false;
       $scope.hideImageDiv = true ;
       var passcode_div = angular.element(document.querySelector('#passcode'));
       $scope.passcodeDiv = '';
       passcode_div.val('');
  };

//sign in via email and passcode on change of passcode call this function
  $scope.loginViaPasscode = function (){
    if (event.keyCode===32 && event.keyCode===13 )
    {
      $event.preventDefault();
    }
      var inputValue = angular.element(document.querySelectorAll('#passcode'));
      var passcode = inputValue.prop('value') ;
      if(passcode.length == 4){
        var emailDiv = angular.element(document.querySelectorAll('.passcode-dropdown'));
        var email = emailDiv.prop('selectedOptions')[0].value ;
        if (email && passcode) {
          //get IP like email ids
          profileDataManager.logInViaPasscode(email,passcode).then(function(res){
                       if (res) {
                          // All set go to next page
                          $ionicHistory.clearCache().then(function(){
                          $rootScope.emailId = email ; // save it to access in update profile
                          $scope.modal.remove();
                          $rootScope.activeUser = email;
                          $state.transitionTo('tab.Activities');
                          });
                       }else {
                           $scope.resetInput();
                           $scope.callAlertDailog('Invalid passcode!!!');
                        }
                    });
           }
      }
  };

//from Sign in screen to  eligiblityTest
  $scope.showEligibilityTestView = function() {
     $scope.modal.remove();
     $ionicHistory.clearCache().then(function(){
     $state.transitionTo('eligiblityTest');
   });
};

   // ==== Close the existing modal and open Sign in html in new modal========
  $scope.openSignIn = function() {
       $ionicModal.fromTemplateUrl('templates/Login-IRK.html', {
         scope: $scope,
         animation: 'slide-in-left',
           hardwareBackButtonClose: false,
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
       animation: 'slide-in-left',
         hardwareBackButtonClose: false,
     }).then(function(modal) {
       $scope.modal.remove();
       $scope.modal = modal;
       $scope.modal.show();
     });
  };

//====================================================Sign in for both forgot passcode and sign in screen ========
$scope.signInSubmit = function (statePassed) { // recive the state to determine the UI Input and the call is coming from
    var formValid = false;
    formValid = $scope.validateSignInForm();
    if (formValid) {
        var password  = angular.element(document.querySelector('#password')).prop('value');
        var email  = angular.element(document.querySelector('#email')).prop('value');
        if (email && password ) {
          var beforeEncode = email.trim()+':'+password.trim();
          var encoded = 'Basic '+ $base64.encode(unescape(encodeURIComponent(beforeEncode)));
          $ionicLoading.show();
          dataStoreManager.signInGlobalUser(encoded).then(function(res){
               if (res.data) {
                        var resultData = res.data ;
                        var token = resultData.authToken['token'] ;
                        var email = resultData.user['email'] ;
                        var parentId = resultData.user['_id'];
                        $scope.emailId = email ;
                        $rootScope.emailId = email ;
                        $scope.authToken = token;
                        // check if the email id exists locally else launch the set pin screen
                      profileDataManager.checkUserExistsByEmailOnly(email).then(function(userExistsId){
                        $scope.emailId = email ;
                          if (userExistsId) {
                                  profileDataManager.updateUserAuthToken(email,token).then(function(insertId){
                                    $ionicLoading.hide();
                                    $scope.modal.remove();
                                    if (statePassed == 'signin') {  // if the user coming from sign in page
                                     $scope.transition('tab.Activities');
                                    }else if (statePassed == 'passcode') { // if the user coming from forgot passcode
                                    $scope.launchpinScreen();
                                   }
                                });
                          }else {
                            $scope.remoteLoginSuccess(parentId);
                          }
                      });
                 }else {
                     if (res.status !=0) {
                       $scope.failureMessage(res.data.message);
                     }else {
                         $scope.failureMessage("Failed to Sign in.");
                     }
                 }
           },function(error){
               if (error.status !=0) {
                 $scope.failureMessage(error.data.message);
               }else {
                   $scope.failureMessage("Failed to Sign in.");
               }
           });
         }
      }
};

$scope.remoteLoginSuccess = function(parentId){
  // valid user doesn't exists locally so get the profile data and set the pin
  dataStoreManager.getRemoteFolderId(parentId,$scope.authToken).then(function(folder){
        if (folder.data.length > 0) {
          var folderDetails = folder.data ;
          var folderId = folderDetails[0]._id;
          $scope.folderId = folderId ;
          dataStoreManager.getItemListByFolderId(folderId,$scope.authToken).then(function(itemSet){
              if (itemSet.data) {
                 var itemList = itemSet.data ;
                 var downloadableConsent = []; var downloadableProfile = []; var downloadableSettings = [];
                 for (var i = 0; i < itemList.length; i++) {
                   var itemName = itemList[i].name;
                   var item_id = itemList[i]._id;
                       if (itemName == 'profile') {
                          downloadableProfile.push(dataStoreManager.downloadFilesListForItem(item_id,$scope.authToken));
                        }
                        else  if (itemName == 'consent') {
                           $scope.consentItemId = item_id ;
                           downloadableConsent.push(dataStoreManager.downloadFilesListForItem(item_id,$scope.authToken));
                        }
                        else if (itemName.toLowerCase() == 'settings'){
                          $scope.settingsItemId = item_id ;
                          downloadableSettings.push(dataStoreManager.downloadFilesListForItem(item_id,$scope.authToken));
                        }
                   }

                 $q.all(downloadableProfile).then(function(filesToDownload){
                         if (filesToDownload[0].status==200){
                               var data = filesToDownload[0].data;
                               if (data.length > 0) {
                               var file_id = data[0]._id;
                               dataStoreManager.downloadFileById(file_id,$scope.authToken).then(function(userProfile){
                                  var profileJson = LZString.decompressFromEncodedURIComponent(userProfile.data); //  fetch this once girder intigrated
                                  var userVerified = "yes";
                                  profileDataManager.createNewUser(JSON.parse(profileJson),$scope.emailId,parentId,folderId,userVerified).then(function(insertId){
                                        if (insertId) {
                                          $scope.userId = insertId ;
                                          var localUserId = insertId ;
                                          var cacheItemIdLocally = [] ;
                                          for (var k = 0; k < itemList.length; k++) {
                                            var itemName = itemList[k].name;
                                            var item_id = itemList[k]._id;
                                            cacheItemIdLocally.push(syncDataFactory.addTouserItemMappingTable($scope.authToken,localUserId,itemName,item_id)); // caceh item if locally
                                          }
                                           $q.all(cacheItemIdLocally).then(function(cache){
                                               $q.all(downloadableConsent).then(function(consentToDownload){
                                                  if (consentToDownload.length > 0){
                                                     var data = consentToDownload[0].data;
                                                     var file_id = data[0]._id;
                                                     dataStoreManager.downloadFileById(file_id,$scope.authToken).then(function(consentData){
                                                         var fileJson = LZString.decompressFromEncodedURIComponent(consentData.data);
                                                         surveyDataManager.addResultToDb($scope.userId,JSON.parse(fileJson),'consent').then(function(response){
                                                           $q.all(downloadableSettings).then(function(settingsToDownload){
                                                              if (settingsToDownload[0].data.length > 0){
                                                                 var data = settingsToDownload[0].data;
                                                                 var file_id = data[0]._id;
                                                                 var file_name = data[0].name;
                                                                 if (file_name.toLowerCase()=="config_json") {
                                                                   dataStoreManager.downloadFileById(file_id,$scope.authToken).then(function(settingsData){
                                                                    var settingsJson = LZString.decompressFromEncodedURIComponent(settingsData.data);
                                                                    var leftStatus = JSON.parse(settingsJson).left_study;
                                                                    $ionicLoading.hide();
                                                                    $scope.modal.remove();
                                                                     if (leftStatus) {
                                                                     //go to consent process
                                                                     $scope.leftStatus = true;
                                                                     }
                                                                     $scope.launchpinScreen();
                                                                    });
                                                                   }
                                                                 }else {
                                                                  $ionicLoading.hide();
                                                                  $scope.modal.remove();
                                                                  $scope.launchpinScreen();
                                                                }
                                                             });
                                                         });
                                                     });
                                                   }
                                               });
                                           });
                                        }
                                    });
                               });
                           }else {
                               $scope.failureMessage("Failed to get the profile data.");
                           }
                        }else {
                              $scope.failureMessage("Failed to get the data from server.");
                        }
                    });
               }else {
                $scope.failureMessage("Failed to get the server items.");
            }
         },function(error){
                 if (error.status !=0) {
                   $scope.failureMessage(error.data.message);
                 }else {
                     $scope.failureMessage("Failed to get the server items.");
                 }
         });
      }else {
         $scope.failureMessage("Please verify to sync the profile from the sign up device.");
         $ionicHistory.clearCache().then(function(){
           $scope.modal.remove();
           $state.transitionTo('home');
         });
     }
  },function(error){
          if (error.status !=0) {
            $scope.failureMessage(error.data.message);
          }else {
              $scope.failureMessage("Failed to get the server folder Id.");
          }
  });
}

$scope.failureMessage = function(message){
  $ionicLoading.hide();
  $ionicPopup.alert({
   title: 'Error',
   template: message
  });
}

$scope.launchConsentProcess = function(){
  consentDataManager.getAllConsentScreens().then(function(response){
  $scope.enable_review = response.enable_review_questions;
  $scope.consent_array = response.sections;
  var taskListData =  userService.parseConsent($scope.consent_array,$scope.enable_review);
   if (taskListData) {
          var taskList =   '<ion-modal-view class="irk-modal">'+
          '<irk-ordered-tasks>'+
          taskListData +
          '</irk-ordered-tasks>'+
          '</ion-modal-view>';
          $scope.modal = $ionicModal.fromTemplate(taskList, {
              scope: $scope,
              animation: 'slide-in-left',
              hardwareBackButtonClose: false,
          });
          $scope.modal.show();
    }else {
       $ionicHistory.clearCache().then(function(){
       $state.transitionTo('home');
       });
    }
  });
}

$scope.closeModal = function() {
  var localUserId = $scope.localUserId;
  var email = $scope.emailId ;
  if (irkResults.getResults().canceled) {
      $scope.homePage();
     }else if (irkResults.getResults()) {
        // all set
        var childresult = irkResults.getResults().childResults ;
        var processFlag = false;
          for (var j = 0; j < childresult.length; j++) {
                if (childresult[j].type) {
                  if(childresult[j].type.toLowerCase() == "IRK-CONSENT-REVIEW-STEP".toLowerCase()){
                    if (childresult[j].answer) {
                      processFlag = true;
                    }
                 }
             }
          }
         if (processFlag) {
             var enable_review = $scope.enable_review ;
             $rootScope.consentResult = irkConsentDocument.getDocument();
             if ( enable_review.toLowerCase()== "true") {
             var consentArray = $scope.consent_array ;
             var validateFalg = true ;
             angular.forEach(consentArray, function(value, key){
                                   var type  = value.type;
                                   angular.forEach(value, function(value, key){
                                          var 	main_typeNext = value.main_type;
                                             if(main_typeNext.toLowerCase() == "review-questions"){
                                                       var qtype = value.type
                                                       if (qtype.toLowerCase() =="boolean" ) {
                                                         var id = value.id ;
                                                         var splitId = id.replace(/\./g,'_');
                                                         var expected_answer = value["expected_answer"];
                                                         for (var i = 0; i < childresult.length; i++) {
                                                            var localId = childresult[i].id;
                                                            if (localId == splitId) {
                                                               var customAnswer  ;
                                                               if (expected_answer.toLowerCase() == 'yes') {
                                                               customAnswer = "true" ;
                                                               }else {customAnswer = "false" ;}
                                                               if (childresult[i].answer != customAnswer ) {
                                                                 validateFalg = false ;
                                                               }
                                                            }
                                                         }
                                                 }
                                         }
                                 });
               })
             // check the user flag accoding to end user answer
               if (validateFalg) {
                 $scope.launchUserActivity();
               }else {
                     console.log("go to ineligible screen ");
                     $scope.modal.remove();
                     $ionicHistory.clearCache().then(function(){
                      $state.transitionTo('not-eligibleUser');
                     });
               }
           }else{
             $scope.launchUserActivity();
           }
         }else {
             $scope.homePage();
         }
     }
}

$scope.homePage = function(){
  // clear all the user data and come to home page
  var promiseA = profileDataManager.removeUser($scope.localUserId);
  var promiseB = profileDataManager.removeUserSession($scope.localUserId);
  var promiseC = surveyDataManager.removeUserSurveyResults($scope.localUserId);
  var promiseD = surveyDataManager.removeUserSurveyFromTempTable($scope.localUserId);
  var promiseE = surveyDataManager.removeUserSurveyQuestionExpiry($scope.localUserId);
  var promiseF = syncDataFactory.removeUserCacheResults($scope.localUserId);
  var promiseG = syncDataFactory.removeUserCacheServerResults($scope.localUserId);
  var promiseH = syncDataFactory.removeUserCacheItemIds($scope.localUserId);
  $q.all([promiseA, promiseB, promiseC,promiseD,promiseE,promiseF,promiseG,promiseH])
        .then(function(promiseResult) {

  });
  $scope.modal.remove();
  $ionicHistory.clearCache().then(function(){
  $ionicLoading.hide();
  $rootScope.emailId = null;
  $rootScope.loggedInStatus = false;
  $state.transitionTo('home');
  });
}

$scope.launchUserActivity = function(){
      // update the leave study status in the server  then launch activity
      var leaveData = '{"left_study": false}';
      var folderId = $scope.folderId;
      var authToken = $scope.authToken;
      var localUserId = $scope.localUserId;
      var email = $scope.emailId ;
      var settingsItemId = $scope.settingsItemId;
      var consentItemId = $scope.consentItemId;
      var configFileName = "config_json" ;
      var consentFileName = "consent_json" ;
      var updateQueue = [];

      var docDefinition = $rootScope.consentResult;
      if (docDefinition) {
         docDefinition = JSON.stringify($rootScope.consentResult.docDefinition);
      }

    // update consent json in result table
    updateQueue.push(syncDataFactory.addToSyncQueue($scope.authToken,localUserId,configFileName,leaveData,folderId,settingsItemId,true));
    updateQueue.push(syncDataFactory.addToSyncQueue($scope.authToken,localUserId,consentFileName,docDefinition,folderId,consentItemId,true));
    $ionicLoading.show();
    $q.all(updateQueue).then(function(filesToDownload){
      surveyDataManager.updateConsentFromResultTable(localUserId,docDefinition,'consent').then(function(response){
        // start sync and upload services
        $scope.syncServiceToUpdate();
      });
    });

      // check data available in update table
     /*    syncDataFactory.checkProfileJsonForUerID(localUserId,configFileName).then(function(rows){
          if (rows.length >0) {
            syncDataFactory.updateToSyncQueueData(localUserId,configFileName,leaveData,true).then(function(consentUpload){
              if (consentUpload && $scope.authToken) {
                  // start sync and upload services
                   $scope.syncServiceToUpdate();
                 }
             });
          }else {
             syncDataFactory.addToSyncQueue($scope.authToken,localUserId,configFileName,leaveData,folderId,settingsItemId,true).then(function(consentUpload){
               if (consentUpload && $scope.authToken)  {
                  // start sync and upload services
                   $scope.syncServiceToUpdate();
                 }
             });
          }
       });
    */
}

$scope.syncServiceToUpdate = function () {
    if(window.Connection) {
              if(navigator.connection.type == Connection.NONE) {
              $scope.launchActivityScreen();
              }else {
              syncDataFactory.queryDataNeedToSyncUpdate("config_json").then(function(syncData){
                 if (syncData.rows.length > 0)  {
                         $ionicLoading.show({template: 'Updating..'});
                         syncDataFactory.startSyncServiesToUpdateData(syncData.rows).then(function(res){
                         $scope.launchActivityScreen();
                      },function(error){
                      $scope.launchActivityScreen();
                      });
                   }
                });
              }
          }else{
          $scope.launchActivityScreen();
      }
}


$scope.launchActivityScreen = function (){
  $ionicHistory.clearCache().then(function(){
    $scope.modal.remove();
    $ionicLoading.hide();
    $state.transitionTo('tab.Activities');
   });
}

// =====================validate sign in form ============
$scope.validateSignInForm = function (){
  var keepGoing = true; var formValid = true;
  // validate input fields
  var inputValue = angular.element(document.getElementById("signIn").querySelectorAll(".item-input"));
  for (var i = 0; i < inputValue.length; i++) {
        var inputTag = angular.element(inputValue[i].querySelector('input'));
        var value = inputTag.prop('value');
        var placeholder = inputTag.prop('placeholder');
        if(keepGoing){
          switch (placeholder.toLowerCase()) {
           case 'email':
                     if(value ==''){
                       formValid = false; keepGoing = false;
                       $scope.callAlertDailog('Please enter your '+placeholder);
                     }else {
                       //is email valid
                       if(inputTag.hasClass('ng-invalid-email') || inputTag.hasClass('ng-invalid')){
                         formValid = false ; keepGoing = false;
                         $scope.callAlertDailog('Email '+value+' is invalid.');
                        }
                     }
                 break;
            case 'password':  if(value ==''){
                              formValid = false; keepGoing = false;
                              $scope.callAlertDailog('Please enter your '+placeholder);
                              }
                              break ;
             default: break ;
               }
        }
  }
  return formValid ;
};

//on forgot passcode launch pin screen and reset the passcode
$scope.launchpinScreen = function(){

  if(ionic.Platform.isIOS()){
  $scope.ShowIos = true;
  }else if(ionic.Platform.isAndroid()){
  $scope.ShowAndroid = true;
  }

  $ionicModal.fromTemplateUrl('templates/choosepassode.html', {
       scope: $scope,
       animation: 'slide-in-left',
         hardwareBackButtonClose: false,
     }).then(function(modal) {
         $scope.modal = modal;
         $scope.passcodeLabel = "Create passcode";
         $scope.managePasscode = false ;
         $scope.managePasscodeConfirm = true ;
         $scope.confirmLoop = 0;
         $scope.emailId = $rootScope.emailId ;
         $scope.modal.show();
      });
  };



$scope.createUserPin = function(localUserId,email){

  profileDataManager.addPasscodeToUserID(localUserId,$scope.passcode,email,$scope.authToken).then(function(res){
       $scope.modal.remove();
       if ($scope.leftStatus) {
         $scope.localUserId = localUserId;
         $scope.emailId = email ;
         $scope.launchConsentProcess();
       }else {
         $scope.transition('tab.Activities');
       }
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
                    // run delete query for the userId before add new passcode doesn't matter from which screen user come from
                    var localUserId  = res ;
                    profileDataManager.deletePasscodeOfUserID(localUserId).then(function(removeToken){
                      $scope.createUserPin(localUserId,email);
                      },function(error){
                      $scope.createUserPin(localUserId,email);
                        });
                    });
                 }
            }else {
            //reset div
            $scope.confirm_passcode = '';
            $scope.passcodeDiv = '';
            confirm_passcode_div.val(''); // clear the div

            $scope.callAlertDailog("Passcode should match with confirm");
            $scope.confirmLoop = $scope.confirmLoop +1;
             if($scope.confirmLoop >= 3){
               $scope.passcodeLabel = "Create passcode";
               $scope.managePasscode = false ;
               $scope.managePasscodeConfirm = true ;
               $scope.confirmLoop = 0;
               //clear div
               var passcode_div = angular.element(document.querySelector('#passcode'));
               $scope.passcode = '';
               passcode_div.val(''); // clear the div
             }
           }
          }else if(confirm_passcode.length > 4) {
          $scope.callAlertDailog("Passcode length should be max 4.");
         }
  };

  $scope.checkPasscodeDigits = function(){
    if (event.keyCode===32 && event.keyCode===13 )
    {
      $event.preventDefault();
    }
       var passcode = angular.element(document.querySelector('#passcode')).prop('value') ;
       if(passcode.length == 4){
        document.activeElement.blur(); // remove the keypad
         $scope.passcode = passcode ;
         $scope.managePasscode = true ;
         $scope.passcodeLabel = "Confirm Passcode";
         $scope.managePasscodeConfirm = false ;
       }else if(passcode.length > 4) {
        $scope.callAlertDailog("Passcode length should be max 4.");
       }
   };

//==================forgot password login via email ================
$scope.forgotPassword = function (){
  var myPopup = $ionicPopup.show({
    template: '<input style="text-align: center" type="Email" id="email_recover" placeholder="Email" >',
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
              dataStoreManager.userForgotPassword(emailId).then(function(res){
                  $ionicLoading.hide();
                   var data = res.data;
                  if (res.status == 200) {
                         $scope.callAlertDailog(data.message);
                       }else if (res.status == 400){
                         $scope.callAlertDailog(data.message);
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
 };

//skip sign in from home->signIn->signIn->skip
$scope.skipSignIn = function (){
   $ionicHistory.clearCache().then(function(){
     $scope.modal.remove();
     $state.transitionTo('eligiblityTest');
   });
 };

//error handler dailog
$scope.callAlertDailog =  function (message){
        document.activeElement.blur(); // remove the keypad
        $ionicPopup.alert({
         title: 'Alert',
         template: message
        });
  };

//on done clear states and travel to next screen
$scope.transition =  function (state){
     $ionicHistory.clearCache().then(function(){
     $state.transitionTo(state);
     });
  };

});

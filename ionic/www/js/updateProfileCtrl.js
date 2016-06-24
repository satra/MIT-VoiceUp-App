angular.module('updateProfileCtrl',[])
//=======Home screen controller======================
.controller('updateProfileCtrl', function($scope,$rootScope,$ionicHistory,$state,
   $ionicHistory,$cordovaSQLite,$ionicPopup,$q,$compile,$ionicModal,$http,$cordovaEmailComposer,
   $ionicLoading,profileDataManager,databaseManager,surveyDataManager,$state,dataStoreManager,$cordovaFileTransfer,$location,$window,$cordovaDeviceMotion,$cordovaMedia,$cordovaGeolocation) {
      var email = $rootScope.emailId ;
      $rootScope.emailId = email ;
      if ($rootScope.emailId ) {
        // get girder-token from local db for the user logout and further WS calls
        profileDataManager.getAuthTokenForUser(email).then(function(response){
          if (response) {
            $scope.authToken = response.token;
            $scope.userId = response.userId;
          }
        });
      }
//=============================get user fields saved locally ===============================
      profileDataManager.getUserUpdateProfile(email).then(function(response){
          if (response) {
            var items = response;
            $scope.profileFields = response;
            $scope.updateDiv = '';
            if ($scope.profileFields!='') {
            $scope.items = items ;
            for (var i = 0; i < items.length; i++) {
                if(items[i].type != 'password'){
                  if (items[i].id != '') {  // should be removed later after testing
                    $scope.updateDiv += $scope.generateUpdateProfileDiv(items[i]);
                  }
                }
              }
            }

            $scope.pM = 'Edit';
            $scope.isDisabled = true;
            $scope.settings=true ;
            if (!$rootScope.emailId) {
                $scope.settings=false ;
            }

            var updateProfile = angular.element(document.querySelector('#updateProfile'));
            updateProfile.append($scope.updateDiv);
            $compile(updateProfile)($scope);
          }else {
              $scope.updateDiv = '<div class="irk-centered  marT5p marB20 irk.font IRK-FONT3 irk-font-helvetica padB2p">User is not registered</div></br> <button class="round1 irk-centered  marB20 irk.font IRK-FONT3 irk-font-helvetica padB2p " ng-click="beginSignUp()">Sign Up</button>';
              var updateProfile = angular.element(document.querySelector('#updateProfile'));
              updateProfile.append($scope.updateDiv);
              $compile(updateProfile)($scope);
          }
     });

     // by defalut
     $scope.notification = false;
     $scope.daily = false;
     $scope.week = false ;

     $scope.userSettings = function() {
      // get the settings from database
      profileDataManager.getUserSettingsJson($rootScope.emailId).then(function(response){
          if (response) {
             if (response!='') {
               for (var i = 0; i < response.length; i++) {
                 $scope.notification = response[i].notification;
                 $scope.daily = response[i].dailyNotification ;
                 $scope.week = response[i].weeklyNotification ;
                 }
               }
             }
        });

       $ionicModal.fromTemplateUrl('templates/settings.html', {
         scope: $scope,
         animation: 'slide-in-up'
       }).then(function(modal) {
         $scope.modal = modal;
         $scope.modal.show();
       });
     };

     $scope.settingsBack = function (){
       $scope.modal.remove();
     }

     $scope.backtotab = function () {
       $scope.modal.remove();
       $ionicHistory.clearCache().then(function(){
          // $state.transitionTo('tab');
       });
     };

 //====================userLogout
     $scope.logOut = function(){
       var logoutToken = $scope.authToken;
       if (logoutToken) {
         var confirmPopup = $ionicPopup.confirm({
                             title: 'Leave Study Confirm',
                             template: 'Are you sure you want to Leave Study?'
                           });
                           confirmPopup.then(function(res) {
                             if(res) {
                               dataStoreManager.userLogout(logoutToken).then(function(res){
                                if (res.status == 200) {
                                 var promiseA = profileDataManager.removeUser($scope.userId);
                                 var promiseB = profileDataManager.removeUserSession($scope.userId);
                                 var promiseC = surveyDataManager.removeUserSurveyResults($scope.userId);
                                 var promiseD = surveyDataManager.removeUserSurveyFromTempTable($scope.userId);
                                 var promiseE = surveyDataManager.removeUserSurveyQuestionExpiry($scope.userId);
                                 $q.all([promiseA, promiseB, promiseC,promiseD,promiseE])
                                     .then(function(promiseResult) {
                                     console.log(promiseResult[0], promiseResult[1], promiseResult[2],promiseResult[3],
                                                 promiseResult[4] );

                               });

                               $ionicHistory.clearCache().then(function(){
                               $rootScope.emailId = null;
                               $scope.modal.remove();
                               $state.transitionTo('home');
                               });
                              }
                           });
                        } else {
                          $scope.logout = false ;
                      }
           });
       }
    }

    $scope.emailConsent = function (){
      var userId = $scope.userId;
      // get consent data saved locally
      profileDataManager.getUserConsentJson(userId).then(function(res){
           if (res) {
            pdfMake.createPdf(res).getBase64(function(dataURL) {
              var email = {
                     attachments: [
                       "base64:consent.pdf//"+dataURL
                     ],
                     subject: 'Consent doc',
                     isHtml: true
                  };
            $cordovaEmailComposer.isAvailable().then(function() {
                    $cordovaEmailComposer.open(email).then(null, function () {
                      console.log('email ');
                    });
            }, function () {
                    console.log('email not available' );
                  });
            });

             }
        });
    }

     $scope.toggleNotification = function(){
      if ($scope.notification == false) {
          $scope.notification = true;
        }else {
          $scope.notification = false;
          $scope.daily =false ;
          $scope.week =false ;
        }
       $scope.updateToggleValue();
     }

     $scope.toggleDailyNotification = function(){
            if ($scope.daily == false) {
                $scope.notification = true;
                $scope.daily =true ;
              }else {
                $scope.daily =false ;
              }
          $scope.updateToggleValue();
     }

     $scope.toggleBiweekNotification = function(){
            if ($scope.week == false) {
                  $scope.notification = true;
                  $scope.week = true;
              }else {
                  $scope.week = false;
              }
        $scope.updateToggleValue();
    }

    $scope.updateToggleValue = function(){
      var emailId = $rootScope.emailId ;
      var settingsJson = new Array({"notification": $scope.notification,  "dailyNotification":$scope.daily ,"weeklyNotification":$scope.week});
      profileDataManager.updateSettingsJsonToUserID(emailId,settingsJson).then(function(response){
           if (response) {
             console.log(response);
           }
        });
    }

    $scope.viewPermissions = function(){
         $ionicModal.fromTemplateUrl('templates/locationservice.html', {
           scope: $scope,
           animation: 'slide-in-up'
         }).then(function(modal) {
           $scope.permission = modal;
           $scope.permission.show();
    $scope.microPhoneLabel="Allow";

           var watchID = navigator.geolocation.watchPosition(onSuccess, onError, {timeout: 3000});
          function onSuccess(position) {
                $scope.geoLabel = 'Granted';
           };
           function onError(error) {
                $scope.geoLabel = 'Allow';
          };

         });
         var watchID = navigator.accelerometer.watchAcceleration(accelerometerSuccess, accelerometerError, {frequency: 3000});
         function accelerometerSuccess(acceleration) {
            $scope.accelerationLabel = 'Granted';
         };
         function accelerometerError() {
            $scope.accelerationLabel = 'Allow';
        };
       }


    $scope.allowAccelerometer = function(){
       $scope.accelerationLabel="Granted";
     }

    $scope.allowGeoLocation = function(){
        $scope.geoLabel="Granted";
    }

    $scope.allowMicroPhone = function(){
         $scope.microPhoneLabel="Granted";
    }

    $scope.openVerification = function() {
        $scope.permission.remove();
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
       // Execute action
     });

     // Execute action on remove modal
     $scope.$on('modal.removed', function() {
       // Execute action
     });

     $scope.generateUpdateProfileDiv = function (obj){
        var value = obj.value;
        var type = obj.type;
        var id = obj.id ;
        if(value){
        $scope[id] = [value];
        }
        var div = '';
             switch(type){
                case 'text' :
                              div += '<label class="item item-input IRK-FONT2" type="text" id="'+obj.id+'" text="'+obj.text+'" placeholder="'+obj.placeholder+'">'+
                                      '<span class="input-label irk-form-input-label IRK-FONT2" aria-label="'+obj.text+'" >'+obj.text+'</span>'+
                                      '<input type="text" ng-disabled="isDisabled"   ng-model="'+id+'" placeholder="'+obj.placeholder+'" ng-required="false" ng-model="$parent.formData.dynamicContent.'+obj.id+'" style="" ></label>';
                              break;

                case 'email':
                              div += '<label class="item item-input IRK-FONT2" type="email" id="'+obj.id+'" text="'+obj.text+'" placeholder="'+obj.placeholder+'">'+
                                      '<span class="input-label irk-form-input-label IRK-FONT2" aria-label="'+obj.text+'" >'+obj.text+'</span>'+
                                      '<input type="email"  ng-model="'+id+'" ng-disabled="true" placeholder="'+obj.placeholder+'" ng-required="false" ng-model="$parent.formData.dynamicContent.'+obj.id+'" style=""></label>';
                              break;

                case 'date':   var id = obj.id ;
                               $scope[id] = new Date(value);
                               div += '<label class="item item-input IRK-FONT2" type="date" id="'+obj.id+'" text="'+obj.text+'" placeholder="'+obj.placeholder+'">'+
                                      '<span class="input-label irk-form-input-label IRK-FONT2" aria-label="'+obj.text+'" >'+obj.text+'</span>'+
                                      '<input type="date" ng-model="'+id+'" ng-disabled="isDisabled" placeholder="'+obj.placeholder+'" ng-required="false" ng-model="$parent.formData.dynamicContent.'+obj.id+'" style=""></label>';
                              break;

                case 'radio':  var optionDiv = '';
                                for (i = 0; i < obj.choices.length; i++) {
                                if (obj.value.toLowerCase() == obj.choices[i].toLowerCase() ) {
                                    optionDiv += '<option value="'+obj.choices[i]+'" selected >'+obj.choices[i]+'</option>';
                                   }else {
                                     optionDiv += '<option value="'+obj.choices[i]+'">'+obj.choices[i]+'</option>';
                                   }
                                }
                                div += '<label class="item item-input item-select IRK-FONT2" type="radio" id="'+obj.id+'" text="'+obj.text+'" placeholder="'+obj.placeholder+'">'+
                                '<span class="input-label irk-form-input-label IRK-FONT2" aria-label="'+obj.text+'" >'+obj.text+'</span>'+
                                '<select type="radio" ng-disabled="isDisabled" placeholder="'+obj.placeholder+'" ng-required="false">'+
                                optionDiv+
                                '</select>  </label>';
                                break;

                case 'number':  var int = parseInt(value, 10);
                                $scope[id] = int;
                                div += '<label class="item item-input IRK-FONT2" type="number" id="'+obj.id+'" text="'+obj.text+'" placeholder="'+obj.placeholder+'">'+
                                      '<span class="input-label irk-form-input-label IRK-FONT2" aria-label="'+obj.text+'" >'+obj.text+'</span>'+
                                      '<input type="number" ng-model="'+id+'" ng-disabled="isDisabled" placeholder="'+obj.placeholder+'" ng-required="false" ng-model="$parent.formData.dynamicContent.'+obj.id+'" style=""></label>';
                              break;

                default :  break ;
             }
         return div ;
     }


     $scope.switchProfileModeOnOff = function(){
           if ($scope.pM == 'Save') {
              $scope.updateProfile();
              $scope.pM = 'Edit';
              $scope.isDisabled = true;
            }else {
              $scope.pM = 'Save';
              $scope.isDisabled = false;
            }
     }


      $scope.updateProfile = function(){
       // to get all the items
      var steps = angular.element(document.getElementById("updateProfile").querySelectorAll(".item-input"));
      var formValid = true;
      var keepGoing = true;
      var password = null ;
      var password_confirm = null;
      var emailId = null;
      var dataCache = new Array();

      //iterate the form and validate the form
      for (var i = 0; i < steps.length; i++) {
       var lableId = steps[i].id;
       var spanTag = angular.element(document.getElementById("updateProfile").querySelectorAll(".item-input")[i].querySelector('span'));
       var text = spanTag[0].textContent ;
      if(keepGoing){
          var inputValue = angular.element(document.getElementById("updateProfile").querySelectorAll(".item-input")[i].querySelector('input'));
          var type = inputValue.prop('type');
          var placeholder = inputValue.prop('placeholder');
          var value = inputValue.prop('value') ;
          switch (lableId) {
           case 'firstName':
                 if(value ==''){
                   formValid = false;
                   keepGoing = false;
                   $scope.callAlertDailog('Please enter your '+lableId);
                 }else {
                   obj = {"id": lableId,  "placeholder": placeholder,"text":text,"type": type,"value":value};
                   dataCache.push(obj);
                 }
                break;
            case 'lastName':
                  if(value ==''){
                      formValid = false ; keepGoing = false;
                      $scope.callAlertDailog('Please enter your '+lableId);
                  }else {
                    obj = {"id": lableId,  "placeholder": placeholder,"text":text,"type": type,"value":value};
                    dataCache.push(obj);
                  }
                break;

            case 'email':
                          emailId = value;
                          obj = {"id": lableId,  "placeholder": placeholder,"text":text,"type": type,"value":value};
                          dataCache.push(obj);
                          break;

          case 'gender':
                            var select = angular.element(document.getElementById("updateProfile").querySelectorAll("select"));
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

              default:
              obj = {"id": lableId,  "placeholder": placeholder,"text":text,"type": type,"value":value};
              dataCache.push(obj);
            }
        }
      }

    if (formValid) {
          $scope.emailId = emailId ;
          profileDataManager.updateUserByEmailId(dataCache,$scope.emailId).then(function(res){
            if(res){
               $scope.successAlertMsg('Profile Data Updated');
            }
          });
       }
    }
  $scope.beginSignUp = function(){
        $ionicHistory.clearCache().then(function(){
            $state.transitionTo('loadSignUp');
        });
}

      //===================================================passcode handler ============================
      $scope.changePasscode = function(){
        $scope.passcodeLabel = "Enter Current Passcode";
        $scope.managePasscode = false ;
        $scope.managePasscodeNew = true;
        $scope.managePasscodeConfirm = true ;
        $scope.confirmLoop = 0;
        $scope.passcode = '';
        $scope.new_passcode = '';
        $scope.confirm_passcode = '';

        $ionicModal.fromTemplateUrl('templates/updatePasscode.html', {
          scope: $scope,
          animation: 'slide-in-up',
        }).then(function(modal) {
          $scope.passcodeModal = modal;
          $scope.passcodeModal.show();
        });
    }

//check existing passcode valid or not if yes launch to enter new passcode
      $scope.checkPasscodeDigits = function(){
           var passcode = angular.element(document.querySelector('#passcode')).prop('value') ;
           if(passcode.length == 4){
            //check current passcode is valid
             $scope.passcode = passcode ;
             var email = $scope.emailId ;

             profileDataManager.getUserIDByEmail(email.trim()).then(function(userId){
                   profileDataManager.checkPasscodeExistsForUserID(userId.trim(),passcode.trim()).then(function(res){
                              if (res) {
                                document.activeElement.blur(); // remove the keypad
                                $scope.passcodeLabel = "Enter New Passcode";
                                $scope.managePasscodeNew = false;
                                $scope.managePasscode = true ;
                              }else{
                              //  cordova.plugins.Keyboard.close();
                                //clear div
                                var passcode = angular.element(document.querySelector('#passcode'));
                                $scope.passcode = '';
                                passcode.val('');
                                // $compile(passcode)($scope);
                                $scope.callAlertDailog("Passcode doesn't match with the existing passcode.");
                              }
                  });
             });
           }else if(passcode.length > 4) {
            $scope.callAlertDailog("Passcode length should be max 4.");
           }
       }
//enter new passcode if size ? then launch to connfirm new passcode
$scope.checkNewPasscodeDigits = function(){
     var passcode = angular.element(document.querySelector('#new_passcode')).prop('value') ;
     if(passcode.length == 4){
      //check current passcode is valid
       $scope.passcode = passcode.trim() ;
       var email = $scope.emailId ;
       document.activeElement.blur(); // remove the keypad
       $scope.passcodeLabel = "Confirm Passcode";
       $scope.managePasscode = true ;
       $scope.managePasscodeNew = true;
       $scope.managePasscodeConfirm = false ;

     }else if(passcode.length > 4) {
      $scope.callAlertDailog("Passcode length should be max 4.");
     }
 }

 $scope.checkConfirmPasscodeDigits = function(){
           var confirm_passcode_div = angular.element(document.querySelector('#confirm_passcode'));
           var confirm_passcode = angular.element(document.querySelector('#confirm_passcode')).prop('value');
              if(confirm_passcode.length == 4){
               //check is both are equal
               if($scope.passcode == confirm_passcode){
                   var email = $scope.emailId ;
                   if (email) {
                     profileDataManager.getUserIDByEmail(email).then(function(res){
                            profileDataManager.updatePasscodeToUserID(res.trim(),$scope.passcode).then(function(res){
                                         if (res) {
                                           $scope.successAlertMsg("Passcode updated.");
                                           $scope.closePasscodeModal();
                                         }
                                     });
                       });
                   }
               }else {
                 //clear div for confirm password
                 $scope.confirm_passcode = '';
                // $compile(confirm_passcode_div)($scope);
                 confirm_passcode_div.val('');
                 $scope.callAlertDailog("Passcode should match with confirm");
                 $scope.confirmLoop = $scope.confirmLoop +1;
                  if($scope.confirmLoop >= 3){
                    document.activeElement.blur(); // remove the keypad
                    $scope.passcodeLabel = "Enter New Passcode";
                    $scope.confirmLoop = 0;
                    $scope.managePasscode = true ;
                    $scope.managePasscodeNew = false;
                    $scope.managePasscodeConfirm = true ;
                    //clear div
                    var passcode_div = angular.element(document.querySelector('#new_passcode'));
                    $scope.new_passcode = '';
                    $compile(passcode_div)($scope);
                  }
               }
              }else if(confirm_passcode.length > 4) {
               $scope.callAlertDailog("Passcode length should be max 4.");
              }
       }

      $scope.closePasscodeModal =  function (){
          $scope.passcodeModal.remove();
       }

     $scope.callAlertDailog =  function (message){
          document.activeElement.blur(); // remove the keypad
          $ionicPopup.alert({
           title: 'Data Invalid',
           template: message
          });
     }

     $scope.successAlertMsg = function (message) {
         $ionicPopup.alert({
          title: 'Success',
          template: message
         });
     }

     $scope.viewCopyrightInfo = function(){
          $ionicModal.fromTemplateUrl('templates/copyRightInfo.html', {
            scope: $scope,
            animation: 'slide-in-up'
          }).then(function(modal) {
            $scope.permission = modal;
            $scope.permission.show();
        });
    }

    $scope.closeCopyRightInfo = function(){
      $scope.permission.remove();
    }

});

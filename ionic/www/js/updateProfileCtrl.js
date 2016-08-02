angular.module('updateProfileCtrl',[])
//=======Home screen controller======================
.controller('updateProfileCtrl', function($scope,$rootScope,$ionicHistory,$state,
   $ionicHistory,$cordovaSQLite,$ionicPopup,$q,$compile,$base64,$ionicModal,$http,$cordovaEmailComposer,$cordovaDatePicker,
   $ionicLoading,profileDataManager,databaseManager,syncDataFactory,surveyDataManager,$state,dataStoreManager,$cordovaFileTransfer,$cordovaFile,$location,$window,$cordovaDeviceMotion,$cordovaMedia,$cordovaGeolocation) {
      var email = $rootScope.emailId ;

      $rootScope.emailId = email ;
      if ($rootScope.emailId ) {
      $scope.hideDownloadButton = false ;
      $rootScope.hideDownloadButton = false ;

        // get girder-token from local db for the user logout and further WS calls
        profileDataManager.getAuthTokenForUser(email).then(function(response){
          if (response) {
            $scope.authToken = response.token;
            $scope.userId = response.userId;
              if ($scope.authToken === undefined || $scope.authToken === null || $scope.authToken === "undefined" || !$scope.authToken ) {
                $rootScope.hideVerifyButton = false ;
                $scope.hideVerifyButton = false ;
              }else {
                $rootScope.hideVerifyButton = true ;
                $scope.hideVerifyButton = true ;
              }
              // get consent data saved locally
              profileDataManager.getUserConsentJson($scope.userId).then(function(res){
                   if (!res) {
                     $scope.hideDownloadButton = true ;
                     $rootScope.hideDownloadButton = true ;
                   }
              });

              profileDataManager.getFolderIDByEmail($rootScope.emailId).then(function (folderId){
                     $scope.folderId = folderId ;
                     if (folderId === undefined || folderId === null || folderId === "undefined" ) {
                       $scope.folderId = "" ;
                     }else {
                       $scope.folderId = folderId ;
                     }
                   });

              profileDataManager.getAuthTokenForUser($rootScope.emailId).then(function (authToken){
                      $scope.authToken = authToken.token ;
                      if ($scope.authToken === undefined || $scope.authToken === null || $scope.authToken === "undefined" ) {
                       $scope.authToken = "" ;
                      }else {
                        $scope.authToken = authToken.token ;
                      }
                   });

              profileDataManager.getItemIdForUserIdAndItem($scope.userId,"profile").then(function (profileItemId){
                       $scope.profileItemId = profileItemId ;
                       if (profileItemId === undefined || profileItemId === null || profileItemId === "undefined" ) {
                         $scope.profileItemId = "" ;
                       }else {
                         $scope.profileItemId = profileItemId ;
                       }
              });
           }
        });

    }


  // == take user to home screeen
  $scope.switchUser = function (){
          $rootScope.modal.remove();
          $ionicHistory.clearCache().then(function(){
          $rootScope.emailId = null;
          $rootScope.loggedInStatus = false;
          $state.transitionTo('home');
          });
  }

  $scope.verifyUser = function() {
    $rootScope.AllowedToDisplayNextPopUp = true ;
    var emailId = $rootScope.emailId.trim() ;
      if (emailId) {
      $rootScope.popupAny = $ionicPopup.show({
          template: '<input style="text-align: center" type="password" id="password_recover" >',
          title: 'Enter Password',
          subTitle: 'Please enter your account password',
          scope: $scope,
          buttons: [
             { text: 'Cancel' },
             {
              text: '<b>Done</b>',
              type: 'button-positive',
              onTap: function(e) {
                if ($rootScope.AllowedToDisplayNextPopUp) {
                var password = angular.element(document.querySelector('#password_recover')).prop('value') ;
                if (password.length != 0) {
                    var beforeEncode = emailId.trim()+':'+password.trim();
                    var encoded = 'Basic '+ $base64.encode(unescape(encodeURIComponent(beforeEncode)));
                    $ionicLoading.show();
                    syncDataFactory.verifyUserToFetchToken(encoded).then(function(res){
                        $ionicLoading.hide();
                        if (res.status == 200 || !res.data) {
                          $rootScope.hideVerifyButton = true ;
                          $scope.hideVerifyButton = true ;
                          $scope.startSyncServices();
                        }else {
                          $scope.failureMessage(res.data.message);
                        }
                    },function(error){
                       $scope.failureMessage(error.statusText);
                    });
                  } else {
                     e.preventDefault();
                  }
                 }
                }
              }
            ]
          });
      }
  }

$scope.failureMessage = function(message){
    $ionicLoading.hide();
    $ionicPopup.alert({
     title: 'Error',
     template: message
    });
  }

  $scope.startSyncServices = function(){
    // start sync services to upload the data
    $ionicLoading.show({template: 'Data Sync..'});
    syncDataFactory.checkDataAvailableToSync().then(function(res){
         if (res.length > 0 ) {
            syncDataFactory.startSyncServiesTouploadData(res).then(function(res){
              $ionicLoading.hide();
              if (!$scope.authToken) {
                $scope.getDataOnSync();
              }
            },function(error){
               $scope.failureMessage(error.statusText);
            });
         }else {
           $ionicLoading.hide();
         }
       });
  }


  // label for email(ios)/download(android)
      if (ionic.Platform.isAndroid()) {
        $scope.emailOrDownloadConsentLabel  = "Download Consent";
      }else{
        $scope.emailOrDownloadConsentLabel  = "Email Consent";
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

     $scope.settingsBack = function (){
       $rootScope.modal.remove();
     }

     $scope.backtotab = function () {
       $rootScope.modal.remove();
       $ionicHistory.clearCache().then(function(){
          // $state.transitionTo('tab');
       });
     };


$scope.getDataOnSync = function(){
  // get girder-token from local db for the user logout and further WS calls
  profileDataManager.getAuthTokenForUser(email).then(function(response){
    if (response) {
      $scope.authToken = response.token;
      $scope.userId = response.userId;
        if ($scope.authToken === undefined || $scope.authToken === null || $scope.authToken === "undefined" || !$scope.authToken ) {
          $rootScope.hideVerifyButton = false ;
          $scope.hideVerifyButton = false ;
        }else {
          $rootScope.hideVerifyButton = true ;
          $scope.hideVerifyButton = true ;
        }
        // get consent data saved locally
        profileDataManager.getUserConsentJson($scope.userId).then(function(res){
             if (!res) {
               $scope.hideDownloadButton = true ;
               $rootScope.hideDownloadButton = true ;
             }
        });

        profileDataManager.getFolderIDByEmail($rootScope.emailId).then(function (folderId){
               $scope.folderId = folderId ;
               if (folderId === undefined || folderId === null || folderId === "undefined" ) {
                 $scope.folderId = "" ;
               }else {
                 $scope.folderId = folderId ;
               }
             });

        profileDataManager.getAuthTokenForUser($rootScope.emailId).then(function (authToken){
                $scope.authToken = authToken.token ;
                if ($scope.authToken === undefined || $scope.authToken === null || $scope.authToken === "undefined" ) {
                 $scope.authToken = "" ;
                }else {
                  $scope.authToken = authToken.token ;
                }
             });

        profileDataManager.getItemIdForUserIdAndItem($scope.userId,"profile").then(function (profileItemId){
                 $scope.profileItemId = profileItemId ;
                 if (profileItemId === undefined || profileItemId === null || profileItemId === "undefined" ) {
                   $scope.profileItemId = "" ;
                 }else {
                   $scope.profileItemId = profileItemId ;
                 }
        });
     }
  });
}

 //====================userLogout
     $scope.logOut = function(){
       var logoutToken = $scope.authToken;
       $rootScope.AllowedToDisplayNextPopUp = true ;
       if (logoutToken) {
         var confirmPopup = $ionicPopup.confirm({
                             title: 'Leave Study Confirm',
                             template: 'Are you sure you want to Leave Study?'
                           });
         $rootScope.popupAny = confirmPopup ;
         confirmPopup.then(function(res) {
                             if(res && $rootScope.AllowedToDisplayNextPopUp) {
                               dataStoreManager.userLogout(logoutToken).then(function(res){
                                if (res.status == 200) {
                                 var promiseA = profileDataManager.removeUser($scope.userId);
                                 var promiseB = profileDataManager.removeUserSession($scope.userId);
                                 var promiseC = surveyDataManager.removeUserSurveyResults($scope.userId);
                                 var promiseD = surveyDataManager.removeUserSurveyFromTempTable($scope.userId);
                                 var promiseE = surveyDataManager.removeUserSurveyQuestionExpiry($scope.userId);
                                 var promiseF = syncDataFactory.removeUserCacheResults($scope.userId);
                                 var promiseG = syncDataFactory.removeUserCacheServerResults($scope.userId);
                                 var promiseH = syncDataFactory.removeUserCacheItemIds($scope.userId);

                                 $q.all([promiseA, promiseB, promiseC,promiseD,promiseE,promiseF,promiseG,promiseH])
                                     .then(function(promiseResult) {
                                     console.log(promiseResult[0], promiseResult[1], promiseResult[2],promiseResult[3],
                                                 promiseResult[4] );

                               });

                               $ionicHistory.clearCache().then(function(){
                               $rootScope.emailId = null;
                               $rootScope.modal.remove();
                               $state.transitionTo('home');
                               });
                              }
                           },function(error){
                               $scope.checkErrorAsyncCall(error);
                           });
                        } else {
                          $scope.logout = false ;
                      }
           });
       }else {
         $ionicPopup.alert({
             title: "Alert",
             template: "Please verify the account to leave the study."
         });
       }
    }

  $scope.checkErrorAsyncCall = function(error){
      $ionicLoading.hide();
      if(window.Connection) {
              if(navigator.connection.type == Connection.NONE) {
                  $ionicPopup.alert({
                      title: "Internet Disconnected",
                      template: "The Internet connection appears to be offline."
                  });
              }
        }
    }

    $scope.emailConsent = function (){
      var userId = $scope.userId;
      // get consent data saved locally
      profileDataManager.getUserConsentJson(userId).then(function(res){
           if (res) {
            if (ionic.Platform.isAndroid()) {
             $ionicLoading.show();
            pdfMake.createPdf(res).getBase64(function(b64Data) {
             var contentType = 'application/pdf' ;
             contentType = contentType || '';
             sliceSize =  512;
             var byteCharacters = atob(b64Data);
             var byteArrays = [];
             for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
             var slice = byteCharacters.slice(offset, offset + sliceSize);
             var byteNumbers = new Array(slice.length);
             for (var i = 0; i < slice.length; i++) {
              byteNumbers[i] = slice.charCodeAt(i);
             }
             var byteArray = new Uint8Array(byteNumbers);
             byteArrays.push(byteArray);
             }
            var blob = new Blob(byteArrays, {
            type: contentType
           });
          if (blob) {
            window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
            window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem) {
               var entry = fileSystem.root;
               entry.getDirectory("VoiceUp", {
                 create: true,
                 exclusive: false
               },onSuccess, onFail);
             },null);
                  function onSuccess(parent) {
                          dirPath = parent.nativeURL;
                          $cordovaFile.writeFile(dirPath, $rootScope.emailId.trim()+".pdf", blob, true)
                           .then(function(success) {
                             $ionicLoading.hide();
                             $ionicPopup.alert({
                              title: 'Download',
                              template: "Consent document downloaded to VoiceUp folder."
                             });
                           }, function(error) {
                               $ionicLoading.hide();
                               console.log(error);
                           });
                        }
                   function onFail(error) {
                      $ionicLoading.hide();
                     console.log(error);
                    }
           } else {
             $ionicLoading.hide();
             console.log("could not create the blob");
          }
      },function(error){
         $ionicLoading.hide();
      });
  }else {
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

             }
        });
    }

// by defalut
$scope.daily = false;
$scope.userSettings = function() {
     profileDataManager.getUserSettingsJson($rootScope.emailId).then(function(response){
         if (response) {
            if (response!='') {
              for (var i = 0; i < response.length; i++) {
                $scope.daily = response[i].dailyNotification ;
                }
              }
            }
       });
      $ionicModal.fromTemplateUrl('templates/settings.html', {
        scope: $scope,
        animation: 'slide-in-up',
          hardwareBackButtonClose: false,
      }).then(function(modal) {
        $rootScope.modal = modal;
        $rootScope.modal.show();
      });
};

$scope.toggleDailyNotification = function(){
           if ($scope.daily == false) {
              $scope.daily =true ;
              // enable notification and set the timer
              $scope.enableLocalNotification();
          }else {
              $scope.daily =false ;
              // disable all the notification and clear
              $scope.disableLocalNotification();
          }
        //  $scope.updateToggleValue();
}

 $scope.updateToggleValue = function(){
      var emailId = $rootScope.emailId ;
      var settingsJson = new Array({ "dailyNotification":$scope.daily});
      profileDataManager.updateSettingsJsonToUserID(emailId,settingsJson).then(function(response){
           if (response) {
             console.log(response);
           }
        });
}

$scope.enableLocalNotification = function(){
  cordova.plugins.notification.local.hasPermission(function (granted) {
    if(granted){
      console.log('permissions given');
      $scope.chooseTime();
    }else{
      cordova.plugins.notification.local.registerPermission(function (granted) {
     console.log('Permission has been granted: ' + granted);
       if (granted) {
             $scope.chooseTime();
             }
        else {
            console.log('Enable notifications from Device Settings');
          }
      });
    }
  });
}

$scope.chooseTime = function () {
var minDate = new Date();
minDate.setHours(0);
minDate.setMinutes(0);
minDate.setSeconds(1);
var maxDate = new Date();
maxDate.setHours(23);
maxDate.setMinutes(59);
maxDate.setSeconds(1);
var options = {
    date: new Date(),
    mode: 'time', // or 'time'
    minDate: minDate,
		maxDate: maxDate,
    allowOldDates: true,
    allowFutureDates: true,
    doneButtonLabel: 'DONE',
    doneButtonColor: '#000000',
    cancelButtonLabel: 'CANCEL',
    cancelButtonColor: '#000000',
		minuteInterval: 15
  };
$cordovaDatePicker.show(options).then(function(date){
			console.log(date);
      if (date) {
       $scope.scheduleNotification(date);
      }else {
        $scope.daily = false ;
        // update local Db
        $scope.updateToggleValue();
      }
	});
}

$scope.scheduleNotification = function (notifDate) {
  cordova.plugins.notification.local.schedule({
    id: 1332,
    title: "VoiceUp",
    text: "Survey Reminder",
    at: notifDate,
    every: "day"
  });
  $scope.updateToggleValue();
}

$scope.disableLocalNotification = function(){
  cordova.plugins.notification.local.cancelAll(function(res) {
  $scope.updateToggleValue();
  }, this);
}


$scope.viewPermissions = function(){

         $ionicModal.fromTemplateUrl('templates/locationservice.html', {
           scope: $scope,
           animation: 'slide-in-up',
             hardwareBackButtonClose: false,
         }).then(function(modal) {
           $rootScope.permission = modal;
           $rootScope.loggedInStatus = false ;
           $rootScope.permission.show();
           $scope.accelerationLabel='ALLOW';
           $scope.microPhoneLabel = 'ALLOW';
           $scope.geoLabel = 'ALLOW';

           var iEl = angular.element( document.querySelector( '#btn1' ) );
                  iEl.remove();

              //  var watchID = navigator.geolocation.watchPosition(onSuccess, onError, {timeout: 3000});
              // function onSuccess(position) {
              //       $scope.geoLabel = 'Granted';
              //  };
              //  function onError(error) {
              //
              // };
              $scope.geoloc = window.localStorage.getItem('Geo');

                    if(window.localStorage.getItem('Geo') == 'YES')
                    {
                      $scope.geoLabel='GRANTED'

                       var myEl = angular.element( document.querySelector( '#geo' ) );
                       myEl.removeClass('irk-btnloc');
                          myEl.addClass('irk-btnlocG');
                    }else {
                      $scope.geoLabel = 'ALLOW'

                    }

                                        $scope.allowGeoLocation = function(){
                                                  $scope.Disable = true;

                                                // cordova.plugins.diagnostic.isLocationEnabled(function(enabled){
                                                // $scope.geoLabel = 'Granted';
                                                // }, function(error){
                                                // $scope.geoLabel = 'Allow';
                                                // });
                                                var posOptions = {timeout: 10000, enableHighAccuracy: false};


                                                   $cordovaGeolocation
                                                   .getCurrentPosition(posOptions)

                                                   .then(function (position) {
                                                     if(position){
                                                       var myEl = angular.element( document.querySelector( '#geo' ) );
                                                       myEl.removeClass('irk-btnloc');
                                                          myEl.addClass('irk-btnlocG');
                                                    window.localStorage.setItem('Geo', 'YES');
                                                     }

                                                      var lat  = position.coords.latitude
                                                      var long = position.coords.longitude
                                                      $scope.geoLabel = 'GRANTED';
                                                      console.log(lat + '   ' + long)
                                                   },function(err) {
                                                       window.localStorage.setItem('Geo','NO');
                                                            $scope.geoLabel = 'ALLOW';
                                                            $scope.Disable = false;


                                                      console.log(err);
                                              });
                                            };


             var watchID = navigator.accelerometer.watchAcceleration(accelerometerSuccess, accelerometerError, {frequency: 3000});
             function accelerometerSuccess(acceleration) {
               var myEl = angular.element( document.querySelector( '#acc' ) );
               myEl.removeClass('irk-btnloc');
                  myEl.addClass('irk-btnlocG');
               $scope.accelerationLabel='GRANTED';
             };
             function accelerometerError() {

            };
 })
}

    $scope.openVerification = function() {
        $rootScope.loggedInStatus = true;
        $rootScope.permission.remove();
    };

     $scope.closeModal = function() {
       $rootScope.modal.remove();
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
                              div += '<label class="item item-input IRK-FONT2 inlineht" type="text" id="'+obj.id+'" text="'+obj.text+'" placeholder="'+obj.placeholder+'">'+
                                      '<span class="input-label irk-form-input-label IRK-FONT2" aria-label="'+obj.text+'" >'+obj.text+'</span>'+
                                      '<input type="text" ng-disabled="isDisabled"   ng-model="'+id+'" placeholder="'+obj.placeholder+'" ng-required="false" ng-model="$parent.formData.dynamicContent.'+obj.id+'" style="" ></label>';
                              break;

                case 'email':
                              div += '<label class="item item-input IRK-FONT2 inlineht" type="email" id="'+obj.id+'" text="'+obj.text+'" placeholder="'+obj.placeholder+'">'+
                                      '<span class="input-label irk-form-input-label IRK-FONT2" aria-label="'+obj.text+'" >'+obj.text+'</span>'+
                                      '<input type="email"  ng-model="'+id+'" ng-disabled="true" placeholder="'+obj.placeholder+'" ng-required="false" ng-model="$parent.formData.dynamicContent.'+obj.id+'" style=""></label>';
                              break;

                case 'date':   var id = obj.id ;
                               $scope[id] = new Date(value);
                               div += '<label class="item item-input IRK-FONT2 inlineht" type="date" id="'+obj.id+'" text="'+obj.text+'" placeholder="'+obj.placeholder+'">'+
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
                                div += '<label class="item item-input item-select IRK-FONT2 inlineht" type="radio" id="'+obj.id+'" text="'+obj.text+'" placeholder="'+obj.placeholder+'">'+
                                '<span class="input-label irk-form-input-label IRK-FONT2" aria-label="'+obj.text+'" >'+obj.text+'</span>'+
                                '<select type="radio" ng-disabled="isDisabled" placeholder="'+obj.placeholder+'" ng-required="false">'+
                                optionDiv+
                                '</select>  </label>';
                                break;

                case 'number':  var int = parseInt(value, 10);
                                $scope[id] = int;
                                div += '<label class="item item-input IRK-FONT2 inlineht" type="number" id="'+obj.id+'" text="'+obj.text+'" placeholder="'+obj.placeholder+'">'+
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
               var profileJson = JSON.stringify(dataCache);
                // check data available in update table
                syncDataFactory.checkProfileJsonForUerID($scope.userId,"profile_json").then(function(rows){
                   if (rows.length >0) {
                     //call update service
                     syncDataFactory.updateToSyncQueueData($scope.userId,"profile_json",profileJson,true).then(function(consentUpload){
                       if (consentUpload && $scope.authToken) {
                          // start sync and upload services
                            $scope.syncServiceToUpdate();
                          }else {
                            $ionicPopup.alert({
                                title: "Alert",
                                template:"Profile data will be synced once the user account is verified."
                            });
                          }
                      });
                   }else {
                      // call insert service
                      syncDataFactory.addToSyncQueue($scope.authToken,$scope.userId,"profile_json",profileJson,$scope.folderId,$scope.profileItemId,true).then(function(consentUpload){
                        if (consentUpload && $scope.authToken)  {
                           // start sync and upload services
                            $scope.syncServiceToUpdate();
                          }else {
                            $ionicPopup.alert({
                                title: "Alert",
                                template:"Profile data will be synced once the user account is verified."
                            });
                          }
                      });
                   }

                });
              }
          });
       }
}


$scope.syncServiceToUpdate = function () {
  // user autherized or not
  profileDataManager.checkIsUserValid($rootScope.emailId).then(function(res){
    if (res.toLowerCase() == "yes".toLowerCase()) {
    // query for the update data
    if(window.Connection) {
              if(navigator.connection.type == Connection.NONE) {
              $scope.uploadFailure();
              }else {
              syncDataFactory.queryDataNeedToSyncUpdate("profile_json").then(function(syncData){
                 if (syncData.rows.length > 0)  {
                        $ionicLoading.show({template: 'Data Sync..'});
                         syncDataFactory.startSyncServiesToUpdateData(syncData.rows).then(function(res){
                          $ionicLoading.hide();
                            var message = res.statusText ;
                            var title = "Data update success";
                              if (!message) {
                                message = "Data added for later update.";
                                title = "Data update failed";
                              }
                            $ionicPopup.alert({
                                title: title,
                                template:message
                            });
                      },function(error){
                      $scope.uploadFailure();
                      });
                   }
                });
              }
          }else{
            $ionicLoading.hide();
          }
       }else {
         $ionicPopup.alert({
             title: "Alert",
             template:"Profile data will be synced once the user account is verified."
         });
       }
   });
}



$scope.uploadFailure = function() {
    $ionicLoading.hide();
    $ionicPopup.alert({
       title: "Data upload failure",
       template: "Failed to sync the data, will be synced later."
    });
}

$scope.beginSignUp = function(){
        $ionicHistory.clearCache().then(function(){
            $state.transitionTo('loadSignUp');
        });
  }

      //===================================================passcode handler ============================
      $scope.changePasscode = function(){
        if(ionic.Platform.isIOS()){
        $scope.ShowIos = true;

      }else if(ionic.Platform.isAndroid()){
        $scope.ShowAndroid = true;

      }
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
            hardwareBackButtonClose: false,
        }).then(function(modal) {
          $rootScope.passcodeModal = modal;
          $rootScope.passcodeModal.show();
        });
    }

//check existing passcode valid or not if yes launch to enter new passcode
      $scope.checkPasscodeDigits = function(){
        if (event.keyCode===32  )
        {
          $event.preventDefault();
        }
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
           }else if(passcode.length > 4 ) {
            $scope.callAlertDailog("Passcode length should be max 4.");
           }
       }
//enter new passcode if size ? then launch to connfirm new passcode
$scope.checkNewPasscodeDigits = function(){
  if (event.keyCode===32  )
  {
    $event.preventDefault();
  }
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
   if (event.keyCode===32 )
   {
     $event.preventDefault();
   }
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
          $rootScope.passcodeModal.remove();
       }

     $scope.callAlertDailog =  function (message){
          document.activeElement.blur(); // remove the keypad
        $rootScope.alertDialog = $ionicPopup.alert({
           title: 'Data Invalid',
           template: message
          });
     }

     $scope.successAlertMsg = function (message) {
      $rootScope.alertDialog =    $ionicPopup.alert({
          title: 'Success',
          template: message
         });
     }

     $scope.viewCopyrightInfo = function(){
          $ionicModal.fromTemplateUrl('templates/copyRightInfo.html', {
            scope: $scope,
            animation: 'slide-in-up',
              hardwareBackButtonClose: false,
          }).then(function(modal) {
            $rootScope.permission = modal;
            $rootScope.permission.show();
        });
    }

    $scope.closeCopyRightInfo = function(){
      $rootScope.permission.remove();
    }

});

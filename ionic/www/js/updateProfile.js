angular.module('updateProfile',[])
//=======Home screen controller======================
.controller('updateProfileController', function($scope,$rootScope,$ionicHistory,$state, $ionicHistory,$cordovaSQLite,$ionicPopup,$q,$compile,$ionicModal,$http,$ionicLoading,profileDataManager,databaseService,$state) {

      var email = $rootScope.emailId ;
      $rootScope.emailId = email ;
//=============================get user fields saved locally ===============================
      console.log('update profile controller email ID passed to get the profile json '+email);
      profileDataManager.getUserUpdateProfile(email).then(function(response){
        console.log(response);
          if (response) {
            var items = response;
            $scope.profileFields = response;
            $scope.updateDiv = '';
            if ($scope.profileFields!='') {
            $scope.items = items ;
            // usage example:
            for (var i = 0; i < items.length; i++) {
                if(items[i].type != 'password'){
                  if (items[i].id != '') {  // should be removed later after testing
                    $scope.updateDiv += $scope.generateUpdateProfileDiv(items[i]);
                  }
                }
              }
            }

            $scope.profileModeLabel = 'Edit';
            $scope.isDisabled = true;

            var updateProfile = angular.element(document.querySelector('#updateProfile'));
            updateProfile.append($scope.updateDiv);
            $compile(updateProfile)($scope);
          }else {
              $scope.updateDiv = '<button class="round1 irk-centered  marT5p marB20 irk.font IRK-FONT3 irk-font-helvetica padB2p " ng-click="beginSignUp()">Sign Up</button>';
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
      console.log($rootScope.emailId);
      profileDataManager.getUserSettingsJson($rootScope.emailId).then(function(response){
        console.log('settings screen' + response);
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

     $scope.toggleNotification = function(){
      if ($scope.notification == false) {
          $scope.notification = true;
          console.log('inside first if ');
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
        });
      }

    $scope.OpenVerification = function() {
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
                              div += '<label class="item item-input" type="text" id="'+obj.id+'" text="'+obj.text+'" placeholder="'+obj.placeholder+'">'+
                                      '<span class="input-label irk-form-input-label" aria-label="'+obj.text+'" >'+obj.text+'</span>'+
                                      '<input type="text" ng-disabled="isDisabled"   ng-model="'+id+'" placeholder="'+obj.placeholder+'" ng-required="false" ng-model="$parent.formData.dynamicContent.'+obj.id+'" style="" ></label>';
                              break;

                case 'email':
                              div += '<label class="item item-input" type="email" id="'+obj.id+'" text="'+obj.text+'" placeholder="'+obj.placeholder+'">'+
                                      '<span class="input-label irk-form-input-label" aria-label="'+obj.text+'" >'+obj.text+'</span>'+
                                      '<input type="email"  ng-model="'+id+'" ng-disabled="true" placeholder="'+obj.placeholder+'" ng-required="false" ng-model="$parent.formData.dynamicContent.'+obj.id+'" style=""></label>';
                              break;

                case 'date':   var id = obj.id ;
                               $scope[id] = new Date(value);
                               div += '<label class="item item-input" type="date" id="'+obj.id+'" text="'+obj.text+'" placeholder="'+obj.placeholder+'">'+
                                      '<span class="input-label irk-form-input-label" aria-label="'+obj.text+'" >'+obj.text+'</span>'+
                                      '<input type="date" ng-model="'+id+'" ng-disabled="isDisabled" placeholder="'+obj.placeholder+'" ng-required="false" ng-model="$parent.formData.dynamicContent.'+obj.id+'" style=""></label>';
                              break;

             /*   case 'radio': div +='<irk-form-item type="radio" id="'+obj.id+'" text="'+obj.text+'" placeholder="'+obj.placeholder+'"></irk-form-item>';
                              break;
               */

                case 'number':  var int = parseInt(value, 10);
                                $scope[id] = int;
                                div += '<label class="item item-input" type="number" id="'+obj.id+'" text="'+obj.text+'" placeholder="'+obj.placeholder+'">'+
                                      '<span class="input-label irk-form-input-label" aria-label="'+obj.text+'" >'+obj.text+'</span>'+
                                      '<input type="number" ng-model="'+id+'" ng-disabled="isDisabled" placeholder="'+obj.placeholder+'" ng-required="false" ng-model="$parent.formData.dynamicContent.'+obj.id+'" style=""></label>';
                              break;

                default :  break ;
             }
         return div ;
     }


     $scope.switchProfileModeOnOff = function(){
           if ($scope.profileModeLabel == 'Save') {
              $scope.updateProfile();
              $scope.profileModeLabel = 'Edit';
              $scope.isDisabled = true;
            }else {
              $scope.profileModeLabel = 'Save';
              $scope.isDisabled = false;
            }
     }

      $scope.updateProfile = function(){
       // to get all the items
      var steps = angular.element(document.querySelectorAll('.item-input'));
      var formValid = true;
      var keepGoing = true;
      var password = null ;
      var password_confirm = null;
      var emailId = null;
      var dataCache = new Array();

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
           console.log(res);
           console.log('All Done ');
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
             console.log(email+ ' ' +passcode);
             profileDataManager.getUserIDByEmail(email.trim()).then(function(userId){
                   profileDataManager.checkPasscodeExistsForUserID(userId.trim(),passcode.trim()).then(function(res){
                              console.log('user exists and valid '+ res );
                              if (res) {
                                $scope.passcodeLabel = "Enter New Passcode";
                                $scope.managePasscodeNew = false;
                                $scope.managePasscode = true ;

                              }else{
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
                                         console.log('passcode updated '+res);
                                         $scope.closePasscodeModal();
                                     });
                       });
                   }
               }else {
                 //clear div for confirm password
                 $scope.confirm_passcode = '';
                 $compile(confirm_passcode_div)($scope);

                 $scope.callAlertDailog("Passcode should match with confirm");
                 $scope.confirmLoop = $scope.confirmLoop +1;
                 console.log($scope.confirmLoop);
                  if($scope.confirmLoop >= 3){
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

});

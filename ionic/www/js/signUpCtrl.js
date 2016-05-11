angular.module('signUp',[])
//=======Home screen controller======================
.controller('signUpCtrl', function($scope,$rootScope,$cordovaSQLite,$ionicHistory,$ionicPopup,$q,$compile,$ionicModal,$http,$ionicLoading
  ,profileDataManager,databaseService,apiDataManagerService,$state) {

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
      var gradleArray = new Array();
 //get the data by id

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
              gradleArray.push({'firstName':value});
            }
           break;
       case 'lastname':
             if(value ==''){
                 formValid = false ; keepGoing = false;
                 $scope.callAlertDailog('Please enter your '+lableId);
             }else {
               obj = {"id": lableId,  "placeholder": placeholder,"text":text,"type": type,"value":value};
               dataCache.push(obj);
               gradleArray.push({'lastName':value});
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
                 gradleArray.push({'email':value});
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
                     gradleArray.push({'password':value});
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
          profileDataManager.checkUserExistsByEmail(emailId).then(function(res){
            if(res){ //user email id already exits
              $scope.callAlertDailog('User already exists ');
            }else { // insert this user to db
               var today = new Date() ;
               var dateFormatted = today.getFullYear();
               dateFormatted += today.getMonth();
               dateFormatted +=today.getDay();
               var login = gradleArray[0].firstName+gradleArray[1].lastName+dateFormatted ;
               gradleArray.push({'login':login});
                 apiDataManagerService.createGradleUser(gradleArray).then(function(res){
                      if (res.status == 200) {
                      var resultData = res.data ;
                           profileDataManager.createNewUser(dataCache,$scope.emailId,resultData.authToken['token']).then(function(insertId){
                            $rootScope.emailId =  $scope.emailId ; // save it to access in update profile
                            $rootScope.activeUser =  $scope.emailId ;
                            $scope.launchpinScreen();
                          });
                      }
                   });
             }
          });
        }else {
          formValid = false ; keepGoing = false;
          $scope.callAlertDailog('Password should match with confirm password');
          }
       }else {
         console.log(dataCache);
          // redefine the array make sure to clear the array
         dataCache = [];
       }
    }

    $scope.callAlertDailog =  function (message){
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
       $ionicModal.fromTemplateUrl('templates/choosepassode.html', {
         scope: $scope,
         animation: 'slide-in-up',
         //backdropClickToClose: true,
         //hardwareBackButtonClose: true,
         //focusFirstInput: true
       }).then(function(modal) {
         $scope.modal = modal;
         $scope.modal.show();
       });
    }


//=================================================== forgot passcode handler ============================

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

     //=================================================== confirm  passcode handler ============================

    $scope.passcodeLabel = "Enter Passcode";
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
                console.log('insert passcode allow '+ email);
                if (email) {
                  profileDataManager.getUserIDByEmail(email).then(function(res){

                         profileDataManager.addPasscodeToUserID(res,$scope.passcode,email).then(function(res){
                                    console.log(res);
                                    $scope.OpenVerification();
                                  });
                    });
                }
            }else {
              console.log('not equal clear div and run loop ');
              //reset div
              $scope.confirm_passcode = '';
              $compile(confirm_passcode_div)($scope);
              $scope.callAlertDailog("Passcode should match with confirm");
              $scope.confirmLoop = $scope.confirmLoop +1;
              console.log($scope.confirmLoop);
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


//========================All set go to next screen ===========================
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

angular.module('signUp',[])
//=======Home screen controller======================
.controller('signUpCtrl', function($scope,$cordovaSQLite,$ionicPopup,$q,$compile,$ionicModal,$http,$ionicLoading,profileDataManager,databaseService,$state) {

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
      var dataCache = new Array();
      //iterate the form and validate the form
      for (var i = 0; i < steps.length; i++) {
      var lableId = steps[i].id;
      if(keepGoing){
          var inputValue = angular.element(document.querySelectorAll('.item-input')[i].querySelector('input'));
          var type = inputValue.prop('type');
          var placeholder = inputValue.prop('placeholder');
          var text = inputValue.prop('text');
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
                  if(value ==''){
                      formValid = false ; keepGoing = false;
                      $scope.callAlertDailog('Please enter your '+lableId);
                  }else {
                    //is email valid
                    if(inputValue.hasClass('ng-invalid-email') || inputValue.hasClass('ng-invalid')){
                      formValid = false ; keepGoing = false;
                      $scope.callAlertDailog('Email is invalid '+value);
                    }else {
                      emailId = value;
                      obj = {"id": lableId,  "placeholder": placeholder,"text":text,"type": type,"value":value};
                      dataCache.push(obj);
                    }
                  }
                break;
            case 'password':
                  password = value ;
                  if(password ==''){
                      formValid = false ; keepGoing = false;
                      $scope.callAlertDailog('Please enter your '+lableId);
                  }else {
                    obj = {"id": lableId,  "placeholder": placeholder,"text":text,"type": type,"value":value};
                    dataCache.push(obj);
                  }
                break;
            case 'password_confirm':
                    password_confirm = value ;
                    if(password_confirm ==''){
                        formValid = false ; keepGoing = false;
                        $scope.callAlertDailog('Please enter your '+lableId);
                    }else {
                      obj = {"id": lableId,  "placeholder": placeholder,"text":text,"type": type,"value":value};
                      dataCache.push(obj);
                    }
                  break;
              default:
              obj = {"id": lableId,  "placeholder": placeholder,"text":text,"type": type,"value":value};
              dataCache.push(obj);
            }
        }
      }
    if (formValid) {
        //check password equal to confirm password
        if(password == password_confirm){
          $scope.emailId = emailId ;
          $scope.launchpinScreen();
          profileDataManager.createUserProfile(dataCache,emailId).then(function(res){
            console.log('oncreate and check '+res);
            if(res==false){
            $scope.callAlertDailog('User already exists ');
            }else {
            $scope.emailId = emailId ;
            $scope.launchpinScreen();
            }
          });
        }else {
          formValid = false ; keepGoing = false;
          $scope.callAlertDailog('Password should match with confirm password');
          }
       }
    }

    $scope.callAlertDailog =  function (message){
         $ionicPopup.alert({
          title: 'Data Invalid',
          template: message
         });
    }


    $scope.skipSignUp = function(){
       $state.transitionTo('tab.Activities');
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

    $scope.checkFourDigits = function(){
           var passcode = angular.element(document.querySelector('#passcode')).prop('value') ;
           var confirm_passcode = angular.element(document.querySelector('#confirm_passcode')).prop('value') ;
           if(passcode.length == 4 && confirm_passcode.length == 4){
           if(passcode == confirm_passcode){
             var email = $scope.emailId ;
             profileDataManager.addPasscodeToUserID(emailId,passcode).then(function(res){
                 $scope.OpenVerification();
               });
            }else {
             $scope.callAlertDailog("passcode should match with confirm passcode ");
             }
           }else if(passcode.length > 4 || confirm_passcode.length > 4 ) {
            $scope.callAlertDailog("both passcode length should be 4 max ");
           }
     }

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
        $scope.modal.remove();
        $state.transitionTo('tab.Activities');
      }

     $scope.closeModal = function() {
       $scope.modal.remove();
     };

     // Cleanup the modal when we're done with it!
     $scope.$on('$destroy', function() {
       $scope.modal.remove();
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

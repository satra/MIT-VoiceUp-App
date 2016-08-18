angular.module('eventManagerCtrl', [])
  //=======Home screen controller======================
  .controller('eventManagerCtrl', function($scope, $rootScope, $state, $ionicPopup, $ionicHistory, $compile, profileDataManager, passcodehandler, $ionicModal) {

    if ($rootScope.activeUser) {
      var emailArray = new Array();
      profileDataManager.getEmailList().then(function(response) {
        for (var i = 0; i < response.length; i++) {
          emailArray.push({
            'emailId': response.item(i).emailId.trim()
          });
        }
        $scope.emails = emailArray;
      });

      $scope.selectedEmail = $rootScope.activeUser;
      $scope.email = true; //  show the other div having passcode by default
      $ionicModal.fromTemplateUrl('templates/pinScreen.html', {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function(modal) {
        $scope.pin = modal;
        $scope.pin.show();
        $scope.selectedEmail = $rootScope.activeUser;
      });
    }

    //sign in via email and passcode on change of passcode call this function
    $scope.passcodeChanged = function() {
      var inputValue = angular.element(document.querySelectorAll('#passcode'));
      var passcode = inputValue.prop('value');
      if (passcode.length == 4) {
        var emailDiv = angular.element(document.querySelectorAll('.passcode-dropdown'));
        var email = emailDiv.prop('selectedOptions')[0].value;
        if (email && passcode) {
          console.log(email);
          profileDataManager.checkUserExistsByEmailAndPasscode(email, passcode).then(function(Id) {
            if (Id) {
              $rootScope.emailId = email;
              $rootScope.activeUser = email;
              $scope.pin.remove();
              console.log($rootScope.lastState + ' last state');
              $state.transitionTo($rootScope.lastState);
            } else {
              $ionicPopup.alert({
                title: 'Error',
                template: 'Invalid Passcode!!!'
              })
            }
          });
        }
      }
    }

    $scope.resetInput = function() {
      var dynamicContent = angular.element(document.querySelectorAll('#passcode'));
      $scope.passcode = '';
      $compile(dynamicContent)($scope);
    };

  });

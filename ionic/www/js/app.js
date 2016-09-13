// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'userService', 'signInCtrl', 'surveyCtrl', 'databaseManager', 'surveyDataManager', 'eligiblityDataManager',
    'profileDataManager', 'consentDataManager', 'dataStoreManager', 'homeCtrl', 'dashboard', 'eligibility', 'signUp', 'consent',
    'updateProfileCtrl', 'customDirectives', 'ionicResearchKit', 'syncDataService', 'checklist-model', 'angular-svg-round-progressbar', 'base64', 'learnModule', 'ngCordova', 'chart.js', 'flexcalendar', 'pascalprecht.translate'
  ])
  .run(function($ionicPlatform, $ionicPopup, $ionicTabsDelegate, $rootScope, $ionicHistory, $state, profileDataManager, $ionicLoading, $ionicPopup) {
    $ionicPlatform.ready(function() {

      if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);
        cordova.plugins.Keyboard.disableScroll(true);
      }
      if (window.StatusBar) {
        // org.apache.cordova.statusbar required
        StatusBar.styleDefault();
      }


      document.addEventListener("resume", function() {
        if ($rootScope.emailId) {
          if ($rootScope.pinDalog) {
            $rootScope.pinDalog.close();
          }
          if ($rootScope.loggedInStatus && !$rootScope.requestFileSystem) {
            $rootScope.promptToPinScreen($rootScope.emailId);
          }
        }
      }, false);

      $rootScope.promptToPinScreen = function(email) {
        var template = '<input style="text-align: center" type="password" id="passcodepin" placeholder="passcode" maxlength="4" pattern="[0-9]*"ng-cut="$event.preventDefault()" ng-copy="$event.preventDefault()" ng-paste="$event.preventDefault()" ng-pattern="/^(0|[1-9][0-9]*)$/"  >';
        if (ionic.Platform.isAndroid()) {
          template = '<input class = "CirclePasscode1" style="text-align: center;color: transparent;text-shadow: 0 0 0 black;" type="number" id="passcodepin" placeholder="passcode"  oninput="maxLengthCheck(this)" maxlength="4" pattern="[0-9]*" ng-cut="$event.preventDefault()" ng-copy="$event.preventDefault()" ng-paste="$event.preventDefault()" ng-pattern="/^(0|[1-9][0-9]*)$/" >';
        }
        $rootScope.pinDalog = $ionicPopup.show({
          template: template,
          title: 'Enter Passcode',
          subTitle: email,
          scope: $rootScope,
          buttons: [{
            text: 'Switch User',
            onTap: function(e) {
              if ($rootScope.modal) {
                $rootScope.modal.remove();
              }
              if ($rootScope.permission) {
                $rootScope.permission.remove();
              }
              if ($rootScope.passcodeModal) {
                $rootScope.passcodeModal.remove();
              }
              if ($rootScope.popupAny) {
                $rootScope.popupAny.close();
                $rootScope.AllowedToDisplayNextPopUp = false;
              }
              if ($rootScope.alertDialog) {
                $rootScope.alertDialog.close();
              }
              $ionicHistory.clearCache().then(function() {
                $rootScope.emailId = null;
                $rootScope.LoggedInStatus = false;
                $state.transitionTo('home');
              });
            }
          }, {
            text: '<b>Done</b>',
            type: 'button-positive',
            onTap: function(e) {
              var password = angular.element(document.querySelector('#passcodepin')).prop('value');
              if (password.length != 0) {
                $ionicLoading.show();
                $rootScope.loginViaPasscodeForPin(email.trim(), password.trim());
              } else {
                e.preventDefault();
              }
            }
          }]
        });

        $rootScope.pinDalog.then(function(res) {
          return;
        });


      }


      $rootScope.loginViaPasscodeForPin = function(email, passcode) {
        profileDataManager.logInViaPasscode(email, passcode).then(function(res) {
          if (res) {
            $ionicLoading.hide();
            if ($rootScope.surveyDate) {
              var today = new Date();
              var nowDate = today.getDate() + '-' + (today.getMonth() + 1) + '-' + today.getFullYear();
              if ($rootScope.surveyDate != nowDate) {
                //$ionicTabsDelegate.select(0, true);
                $rootScope.surveyListForToday();
              }
            }
          } else {
            $ionicLoading.hide();
            $ionicPopup.alert({
              title: 'Error',
              template: "Invalid User"
            }).then(function() {
              $rootScope.promptToPinScreen($rootScope.emailId);
            });
          }
        });
      }

    });


    $ionicPlatform.registerBackButtonAction(function(event) {
      event.preventDefault();
    }, 100);
  })

.config(function($stateProvider, $httpProvider, $urlRouterProvider, $ionicConfigProvider) {

  $ionicConfigProvider.views.swipeBackEnabled(false);

  $httpProvider.defaults.useXDomain = true;
  $httpProvider.defaults.withCredentials = true;
  delete $httpProvider.defaults.headers.common["X-Requested-With"];
  $httpProvider.defaults.headers.common["Accept"] = "application/json";
  $httpProvider.defaults.headers.common["Content-Type"] = "application/json";

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  // setup an abstract state for the tabs directive
    .state('home', {
    url: '/home',
    templateUrl: 'templates/home.html',
    controller: 'homeCtrl'
      // controller: 'SurveyCtrl'
  })

  .state('signIn', {
    url: '/signIn',
    controller: 'signInCtrl'
  })

  .state('eligiblityTest', {
    //  templateUrl: 'templates/checkEligiblity.html',
    url: '/eligiblityTest',
    controller: 'eligibilityCtrl'
  })

  .state('not-eligibleUser', {
    templateUrl: 'templates/not-eligible.html',
    url: '/not-eligibleUser',
    // controller: 'eligibilityCtrl'
  })

  .state('beginConsent', {
    url: '/beginConsent',
    //templateUrl: 'templates/consent.html',
    controller: 'consentCtrl'
  })

  .state('DocumentCtrl', {
    url: '/documentCtrl',
    controller: 'DocumentCtrl'
  })

  .state('loadSignUp', {
    templateUrl: 'templates/signUp.html',
    url: '/loadSignUp',
    controller: 'signUpCtrl'
  })

  .state('passcodeValidation', {
    templateUrl: 'templates/choosepassode.html',
    url: '/passcodeValidation',
    controller: 'passcodeValidation'
  })

  .state('signupverification', {
    templateUrl: 'templates/verification.html',
    url: '/signupverification',
    controller: 'verificationCtrl'
  })

  // setup an abstract state for the tabs directive
  .state('tab', {
    url: '/tab',
    abstract: true,
    templateUrl: 'templates/tabs.html'
  })

  // Each tab has its own nav history stack:
  .state('tab.Activities', {
    url: '/Activities',
    views: {
      'tab-Activities': {
        templateUrl: 'templates/surveyActivities.html',
        controller: 'surveyCtrl'
      }
    }
  })

  // Each tab has its own nav history stack:
  .state('tab.dashboard', {
    url: '/dashboard',
    views: {
      'tab-dashboard': {
        templateUrl: 'templates/tab-activetasks.html',
        controller: 'dashboardCtrl'
      }
    }
  })

  // Each tab has its own nav history stack:
  .state('tab.Profile', {
    url: '/profile',
    views: {
      'tab-profile': {
        templateUrl: 'templates/tab-profile-update.html',
        controller: 'updateProfileCtrl'
      }
    }
  })

  .state('tab.learn', {
    url: '/learn',
    views: {
      'tab-learn': {
        templateUrl: 'templates/modal-online-resource.html',
        controller: 'LearnCtrl'
      }
    }
  });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('home');
  //$urlRouterProvider.otherwise('home');
})

//.constant('base_url', 'http://23.89.199.27:8180/api/v1/')
//.constant('base_url', 'https://rig.mit.edu/girder/api/v1/')
.constant('appConstants', {
  'base_url': 'https://rig.mit.edu/girder/api/v1/',

  //home controller messages
  'syncNewDataMessage': 'Data Sync..',
  'syncUpdateDataMessage': 'Update Sync..',
  'checkInternetConnectionMessage': 'Please check network connection.',
  'checkInternetConnectionMessageTitle': 'Network',
  'downloadConsentMessageTitle': 'Download',
  'downloadConsentMessage': 'Consent document downloaded to VoiceUp folder.',
  'localConsentFilePath': 'file://assets/consent_mobile_20150528.pdf',
  'consentEmailSubjectName': 'Consent doc',
  'consentFileName': 'consent_mobile_20150528.pdf',
  'appFolderName': 'VoiceUp',
  'consentFileURL': 'http://voicesurvey.mit.edu/sites/default/files/documents/consent_mobile_20150528.pdf',

  //sign up controller messages
  'missingFieldInGeneral': 'Please enter your ',
  'signUpValidationMessageTitle': 'Validation',
  'passwordLengthOfSixCharacter': 'Password must be at least 6 characters.',
  'confirmPasswordLengthOfSixCharacter': 'Confirm Password must be at least 6 characters.',
  'failedToCreateUserWithEmptyStatus': "Failed to create the user try later.",
  'passcodeMissMatchWithExistingPasscode': 'Passcode doesn\'t match with the existing passcode.',

  // sign up with passcode creation
  'passcodeOfFourDigitLength': 'Passcode length should be max 4.',
  'passcodeMissMatchWithConfirmPasscode': "Passcode should match with confirm Passcode",
  'passcodeMissMatchWithConfirmPasscode': "Passcode should match with confirm Passcode",


  // geo location screen messages
  'infoMessageToAllowLocationServiceLater': "Go to settings and allow location service for the app.",

  // survey controller messages
  'checkForServerUpdates': 'Updating..',
  'errorDailogTitle': 'Error',
  'displayOnlySkippedQuestionTitle': 'Only Skipped Question',
  'displayOnlySkippedQuestionMessage': 'Do you want to display only skipped questions?',
  'dataUploadSuccessTitle': 'Data upload success',
  'dataUploadFailedTitle': 'Data upload failed',
  'dataUploadFailedMessage': 'Data added for later upload.',
  'syncOnceAccountVerifiedMessage': 'Responses will be uploaded once the account is verified.',
  'syncOnceAccountVerifiedTitle': 'Alert',
  'syncDataUploadFailedTitle': 'Data upload failure',

  'syncOnceAccountVerifiedFailedTitle': 'Verify Account',
  'syncOnceAccountVerifiedFailedMessage': 'Please verify account to upload the responses.',

  'syncDataUploadFailedMessage': 'Failed to sync the data, will be synced later.',

  // update profile and settings messages
  'enterAccountPasswordTitle': 'Enter Password',
  'enterAccountPasswordSubTitle': 'Please enter your account password',
  'syncProfileDataOnAccountVerification': "Profile data will be synced once the user account is verified.",
  'leaveStudyMessageTitle': 'Confirm',
  'leaveStudyMessage': 'Are you sure, you want to leave the study?',
  'leaveStudyServerData': '{"left_study": true}',
  'verifyAccountBeforeLeaveStudy': "Please verify the account to leave the study.",
  'updateDataSuccessTitle': 'Data update succes',
  'profileDataCachedForLaterUpload': "Data added for later update.",
  'profileDataCachedForLaterUploadMessage': "Data update failed",
  'updatePasscodeSuccessMessage': 'Passcode updated',
  'updatePasscodeSuccessTitle': 'Success',

  // notification message configuration
  'scheduleNotificationTitle': "VoiceUp",
  'scheduleNotificationText': "Survey Reminder",
  'scheduleNotificationEvery': "day",

  // sign in controller
  'invalidPasscode': 'Invalid passcode',
  'signInFailed': "Failed to Sign in.",
  'leaveStudyFalseStatus': '{"left_study": false}',

  //forgot password
  'forgotPasswordTitle': 'Forgot Password',
  'forgotPasswordSubTitle': 'Please enter your email',
  'verifyTosyncFormSignUpDevice': "Please verify to sync the profile from the sign up device.",

  // general
  'failedToGetServerItems': 'Failed to get the server items.',
  'failedToGetDataFromServer': 'Failed to get the data from server.',
  'failedToGetProfile': 'Failed to get the profile data.',
  'failedToGetFolderId': "Failed to get the server folder Id.",
})


.config(function($ionicConfigProvider) {
  $ionicConfigProvider.tabs.style('standard');
  $ionicConfigProvider.tabs.position('bottom');
})

// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers','userService','signInCtrl','surveyCtrl','databaseManager','surveyDataManager','eligiblityDataManager',
'profileDataManager','consentDataManager','dataStoreManager','homeCtrl','dashboard','eligibility','signUp','consent',
'updateProfileCtrl','customDirectives','ionicResearchKit','syncDataService', 'checklist-model','angular-svg-round-progressbar','base64','learnModule','eventManagerCtrl', 'passcodehandler','ngCordova','chart.js','flexcalendar','pascalprecht.translate'])
.run(function($ionicPlatform,$ionicPopup,$rootScope,$ionicHistory,$state,profileDataManager,$ionicLoading,$ionicPopup) {
  $ionicPlatform.ready(function() {

    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }


    document.addEventListener("resume", function() {
      if ($rootScope.emailId) {
         $rootScope.promptToPinScreen($rootScope.emailId);
       }
      }, false);

    $rootScope.promptToPinScreen = function (email) {
        $ionicPopup.show({
        template: '<input style="text-align: center" type="password" id="passcodepin" placeholder="passcode" maxlength="4" pattern="[0-9]*"  >',
        title: 'Enter Passcode',
        subTitle: email,
        scope: $rootScope,
        buttons: [
                   { text: 'Switch User',  onTap: function(e) {
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
                        $rootScope.AllowedToDisplayNextPopUp = false ;
                     }
                     if ($rootScope.alertDialog) {
                        $rootScope.alertDialog.close();
                     }
                     $ionicHistory.clearCache().then(function(){
                        $rootScope.emailId = null;
                        $state.transitionTo('home');
                     });
                   }
               },
             {
            text: '<b>Done</b>',
            type: 'button-positive',
            onTap: function(e) {
              var password = angular.element(document.querySelector('#passcodepin')).prop('value') ;
               if (password.length != 0) {
                   $ionicLoading.show();
                   $rootScope.loginViaPasscodeForPin(email.trim(),password.trim());
                }else{
                e.preventDefault();
                }
              }
            }
          ]
        });
      }

    $rootScope.loginViaPasscodeForPin = function (email,passcode) {
        profileDataManager.logInViaPasscode(email,passcode).then(function(res){
                     if (res) {
                      $ionicLoading.hide();
                     }else {
                       $ionicLoading.hide();
                       $ionicPopup.alert({
                        title: 'Error',
                        template: "Invalid User"
                      }).then(function(){
                         $rootScope.promptToPinScreen($rootScope.emailId);
                       });
                     }
                  });
      }

  });


$ionicPlatform.registerBackButtonAction(function (event) {
                 event.preventDefault();
   }, 100);
})

.config(function($stateProvider, $httpProvider,$urlRouterProvider,$ionicConfigProvider) {

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
    templateUrl: 'templates/checkEligiblity.html',
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
    templateUrl: 'templates/consent.html',
    controller: 'consentCtrl'
  })

  .state('DocumentCtrl', {
    url: '/documentCtrl',
    controller: 'DocumentCtrl'
  })

  .state('loadSignUp', {
    templateUrl: 'templates/SIGNUP-IRK.html',
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

    .state('onResumehandler', {
      url: '/onresumehandler',
      controller: 'eventManagerCtrl'
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
        templateUrl: 'templates/Activities.html',
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

.constant('base_url', 'http://23.89.199.27:8180/api/v1/')
//.constant('base_url', 'https://rig.mit.edu/girder/api/v1/')



.config(function($ionicConfigProvider) {
  $ionicConfigProvider.tabs.style('standard');
  $ionicConfigProvider.tabs.position('bottom');

})

// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers','starter.services','surveyController','databaseService','consentDataManager','myProfileUpdate','homeController','customDirectives','ionicResearchKit', 'checklist-model', 'angular-dialgauge', 'ngCordova'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleLightContent();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

// setup an abstract state for the tabs directive
  .state('home', {
    url: '/home',
    templateUrl: 'templates/home.html',
    controller: 'HomeCtrl'
   // controller: 'SurveyCtrl'
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
        controller: 'SurveyCtrl'
      }
    }
  })

  // Each tab has its own nav history stack:
  .state('tab.dashboard', {
    url: '/dashboard',
    views: {
      'tab-dashboard': {
        templateUrl: 'templates/tab-activetasks.html',
        controller: 'ActiveTasksCtrl'
      }
    }
  })

  // Each tab has its own nav history stack:
  .state('tab.Profile', {
    url: '/profile',
    views: {
      'tab-profile': {
        templateUrl: 'templates/tab-profile-update.html',
        controller: 'ProfileCtrl'
      }
    }
  })

  .state('tab.learn', {
    url: '/learn',
    views: {
      'tab-learn': {
        templateUrl: 'templates/modal-online-resource.html',
        controller: 'ActiveTasksCtrl'
      }
    }
  });
  // if none of the above states are matched, use this as the fallback
  // $urlRouterProvider.otherwise('/tab/Activities');
   $urlRouterProvider.otherwise('/home');

})

.config(function($ionicConfigProvider) {
  $ionicConfigProvider.tabs.style('standard');
  $ionicConfigProvider.tabs.position('bottom');
});

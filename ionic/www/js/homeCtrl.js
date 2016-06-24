angular.module('homeCtrl',[])
//=======Home screen controller======================
.controller('homeCtrl', function($scope,$compile,$timeout,$rootScope,$cordovaSQLite,$ionicPopup,$ionicHistory,$controller,$ionicModal,$http,$ionicLoading,userService,databaseManager,
  dataStoreManager,profileDataManager,$cordovaEmailComposer,pinModalService,eligiblityDataManager,irkResults,$base64,$state,$location,$window) {


/*    userService.getSeverJson().then(function(obj2){
           //call a method and read from local json and create schema
           userService.getLocalJson().then(function(obj1){
             var delta = jsondiffpatch.diff(obj1,  obj2);
             jsondiffpatch.patch(obj1, delta);
             console.log(obj1);
           });
        });
*/

//   if (window.cordova) {
//       if (cordova.platformId == "browser") {
//           var exec = require("cordova/exec");
//           console.log('browser');
//       }else
//       {
//           console.log('device');
//           cordova.plugins.diagnostic.isLocationEnabled(function(enabled){
//               console.log("Location is " + (enabled ? "enabled" : "disabled"));
//           }, function(error){
//               console.error("The following error occurred: "+error);
//           });
//       }
//     }
//
//     // geo location ===========================
//     $scope.geoLabel = 'Allow';
//     var watchID = navigator.geolocation.watchPosition(onSuccess, onError, {timeout: 3000});
//     function onSuccess(position) {
//      $scope.geoLabel = 'Granted';
//     };
//     function onError(error) {
//      $scope.geoLabel = 'Allow';
//     };
// //    var audioFileName = "irk-permission" + (new Date().getTime()) + (ionic.Platform.isAndroid() ? ".amr" : ".wav");
// //    var audioSample = $cordovaMedia.newMedia(audioFileName);
//
//   $scope.allowGeoLocation = function(){
//      var watchID = navigator.geolocation.watchPosition(onSuccess, onError, {timeout: 3000});
//      function onSuccess(position) {
//       $scope.geoLabel = 'Granted';
//      };
//      function onError(error) {
//       $scope.geoLabel = 'Allow';
//     };
// }
//
//
// $scope.allowAccelerometer = function(){
//   var watchID = navigator.accelerometer.watchAcceleration(accelerometerSuccess, accelerometerError, {frequency: 3000});
//   function accelerometerSuccess(acceleration) {
//    $scope.accelerationLabel = 'Granted';
//   };
//   function accelerometerError() {
//    $scope.accelerationLabel = 'Allow';
//   };
// }

databaseManager.checkDatabaseExists().then(function(res){
       if (res == 5 ) {
            //call a method and read from local json and create schema
            userService.getConfigJson().then(function(response){

            var eligibility = JSON.stringify(response.eligibility);
            var profile = JSON.stringify(response.profile);
            var consent_screens = JSON.stringify(response.consent);
            var completeJson = JSON.stringify(response);
            var surveyJson =  response.surveys;
            var tasksJson =  response.tasks;
            var today = new Date() ;

        databaseManager.createAppContentTable(response.version, response.URL,eligibility,profile,consent_screens,completeJson).then(function(resp){
              for (var survey in surveyJson) {
                if (surveyJson.hasOwnProperty(survey)) {
                var obj = surveyJson[survey];
                var date = '';
                var title = survey;
                var id = survey;
                var skippable = '';
                var tasks = '' ;
                 for (var prop in obj) {
                   switch (prop) {
                     case "date": date = obj[prop];
                         break;
                     case "skippable": skippable = JSON.stringify(obj[prop]);
                         break;
                     case "tasks": tasks = JSON.stringify(obj[prop]);
                         break;
                     default:
                   }
                 if (date && title && id && tasks) {
                     var dateArray =date.split(" ");
                     var min = dateArray[0];
                     var month = dateArray[1];
                     var day = dateArray[2];
                     //var month = dateArray[3];
                     if(month == "*"){
                       month = today.getMonth()+1;
                     }
                     if(day == "*"){
                      day = today.getDate();
                     }
                     var customDate = day+'-'+month+'-'+today.getFullYear() ;
                     databaseManager.createSurveysTable(customDate,title,id,skippable,tasks).then(function(respw){
                      console.log('insert survey '+respw);
                     });
                   }
                 }
               }
             }
          for (var task in tasksJson) {
               if (tasksJson.hasOwnProperty(task)) {
               var timeLimit = tasksJson[task].timelimit ;
               var steps = JSON.stringify(tasksJson[task].steps) ;
               if (timeLimit === undefined || timeLimit === null) {
               timeLimit = '';
               }
               databaseManager.createTasksTable(task,steps,timeLimit).then(function(resp){
               console.log('createTasksTable  '+ resp);
               });
             }
           }
              databaseManager.createSurveyTempTable().then(function(resp){
                  console.log('createSurveyTempTable  '+ resp);
             });

             databaseManager.createSurveyQuestionExpiryTable().then(function(resp){
                  console.log('createSurveyQuestionTable  '+ resp);
             });

            });

databaseManager.createSurveyTempTable().then(function(resp){
    console.log('createSurveyTempTable  '+ resp);
});

databaseManager.createSurveyQuestionExpiryTable().then(function(resp){
    console.log('createSurveyQuestionTable  '+ resp);
});

/*
          //==============create survey table==========
          for (var i = 0; i < surveyJson.length; i++) {
               var date = surveyJson[i].date;
               var title = surveyJson[i].title;
               var id = surveyJson[i].id;
               var skippable = JSON.stringify(surveyJson[i].skippable);
               var tasks = JSON.stringify(surveyJson[i].tasks) ;
               var dateArray =date.split(" ");
               var min = dateArray[0];
               var month = dateArray[1];
               var day = dateArray[2];
               //var month = dateArray[3];
               if(month == "*"){
                 month = today.getMonth()+1;
               }
               if(day == "*"){
                day = today.getDate();
               }
               var customDate = day+'-'+month+'-'+today.getFullYear() ;
               databaseManager.createSurveysTable(customDate,title,id,skippable,tasks).then(function(respw){
                console.log('insert survey '+respw);
               });
          }

    //==============create Tasks table==========
            for (var task in tasksJson) {
              var timeLimit = tasksJson[task].timelimit ;
              if (timeLimit === undefined || timeLimit === null) {
              timeLimit = '';
              }
              databaseManager.createTasksTable(task,JSON.stringify(tasksJson[task].steps),timeLimit).then(function(resp){
              console.log('createTasksTable  '+ resp);
              });
            }

            databaseManager.createSurveyTempTable().then(function(resp){
                 console.log('createSurveyTempTable  '+ resp);
            });

            databaseManager.createSurveyQuestionExpiryTable().then(function(resp){
                 console.log('createSurveyQuestionTable  '+ resp);
            });

          */

                    });
       }
 });

  //openOnlineResource
  $scope.openOnlineResource = function() {
    $ionicModal.fromTemplateUrl('templates/modal-online-resource.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modal = modal;
      $scope.modal.show();
    });
};

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
};

$scope.sendConsentDoc = function (){
  var email = {
    // to: 'teste@example.com',
    // cc: 'teste@example.com',
    // bcc: ['john@doe.com', 'jane@doe.com'],
     attachments: [
       'file://assets/consent_mobile_20150528.pdf'
     ],
     subject: 'Consent doc',
    // body: 'How are you? Nice greetings from Leipzig',
     isHtml: true
  };

 // $cordovaEmailComposer.open(email).then(null, function () {
 //   // user cancelled email
 //  });

 $cordovaEmailComposer.isAvailable().then(function() {
    // is available
    $cordovaEmailComposer.open(email).then(null, function () {
      console.log('email ');
    });

  }, function () {
    // not available
    console.log('email not available' );

  });


}

//==================================Select email view ==========
     $scope.openSignInChooseEmail = function() {
      $scope.transition('signIn');
  };

  /*
  //get IP like email ids
   profileDataManager.getEmailList().then(function(response){
     var griderArray = new Array() ;
     for (var i = 0; i < response.length; i++) {
       griderArray.push({'emailId':response.item(i).emailId});
     }
     $scope.emails = griderArray;
  });

  $ionicModal.fromTemplateUrl('templates/signin-choose-email.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modal = modal;
    $scope.modal.show();
    $scope.setPasscodeFocus = true ;
    $scope.hidePasscodeDiv = true ;
    $scope.hideImageDiv = false ;
  });

  */

//from Sign in screen to  eligiblityTest
  $scope.showEligibilityTestView = function() {
     $scope.modal.remove();
     $ionicHistory.clearCache().then(function(){
     $state.transitionTo('eligiblityTest');
   });
};

//error handler dailog
$scope.callAlertDailog =  function (message){
        $ionicPopup.alert({
         title: 'Error',
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

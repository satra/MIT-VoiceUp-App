angular.module('surveyController',[])
// ==== Dummy contorller need to be removed later before production  ========
.controller('SurveyCtrl', function($scope,$ionicHistory,$state, $rootScope,$ionicModal,
  pinModalService,userService,$ionicPopup,irkResults,profileDataManager) {

//on resume handler===================================================================
$scope.hideImageDiv = true;
document.addEventListener("resume", function() {
    if ($rootScope.activeUser) {
     // get email list
     var griderArray = new Array() ;
     for (var i = 0; i < response.length; i++) {
       griderArray.push({'emailId':response.item(i).emailId});
       if (response.item(i).emailId == $rootScope.activeUser) {
          $scope.selectedEmail = griderArray[i];
       }
    }
     $scope.emails = griderArray;
     pinModalService.init('templates/pinScreen.html', $scope)
         .then(function(pin) {
          pin.show();
        });
     }
  }, false);


//sign in via email and passcode on change of passcode call this function
  $scope.loginViaPasscode = function (){
      var inputValue = angular.element(document.querySelectorAll('#pinpasscode'));
      var passcode = inputValue.prop('value') ;
      if(passcode.length == 4){
        var emailDiv = angular.element(document.querySelectorAll('.passcode-dropdown'));
        var email = emailDiv.prop('selectedOptions')[0].value ;
        if (email && passcode) {
          console.log(email);
          console.log(passcode);
          //get IP like email ids
          profileDataManager.logInViaPasscode(email,passcode).then(function(res){
                       if (res) {
                          // All set go to next page
                          $ionicHistory.clearCache().then(function(){
                          $rootScope.emailId = email ; // save it to access in update profile
                          $scope.pin.remove();
                          $rootScope.activeUser = email;
                          });
                       }else {
                         $scope.clearPinDiv();
                         $scope.callAlertDailog('Invalid passcode!!!');
                        }
                    });
           }
      }
  };

    $scope.clearPinDiv = function(){
      var passcode_div = angular.element(document.querySelector('#pinpasscode'));
      passcode_div.val('');
    }

  //error handler dailog
  $scope.callAlertDailog =  function (message){
          $ionicPopup.alert({
           title: 'Error',
           template: message
          });
    }
//============== resume handler finished ============================================


    userService.getSurveyMainList().then(function(response){
    $scope.surveyList = response;
    var surveyMainList = response.surveys;
    var list = '';
    var items = [];
    var today = new Date() ;
    for (var i = 0; i < surveyMainList.length; i++) {
            var title = surveyMainList[i].title;
            var id = surveyMainList[i].id;
            var date = surveyMainList[i].date;
            var dateArray =date.split(" ");
            var min = dateArray[0];
            var month = dateArray[1];
            var day = dateArray[2];
            //var month = dateArray[3];
            if(month == "*"){
              month = today.getMonth();
            }
            else {
              month = month-1;
            }
            if(day == "*"){
             day = today.getDate();
            }
            if(today.getMonth() == month && today.getDate() == day){
            items.push(surveyMainList[i]);
            }
     }
       $scope.list= items ;
});


$scope.launchSurvey = function (idSelected){
      $scope.cancelSteps = false ;
      var surveys = $scope.surveyList.surveys;
      var taskList = $scope.surveyList.tasks;
      var surveyHtml = '';
      for (var i = 0; i < surveys.length; i++) {
            var id = surveys[i].id;
            if(id == idSelected){
               //is skippable may needed future to make a screen skippable
              var skippable = surveys[i].skippable;
              var tasksneeded  = surveys[i].tasks;
              for (var k = 0; k < tasksneeded.length; k++) {
                 var taskselected = tasksneeded[k] ;
                 var disableSkip = true ;
                     for (var L = 0; L < skippable.length; L++) {
                       if (taskselected == skippable[L]) {
                         disableSkip = false ;
                         }
                     }
                 var r = Math.floor(Math.random()*(100-1+1)/1);
                 var customId = tasksneeded[k]+r;
                 var steps = taskList[tasksneeded[k]].steps;
                   // timelimit may needed in future to run a scheduler per screen
                  //  var timelimit =taskList[tasksneeded[k]].timelimit;
                    for (var j = 0; j < steps.length; j++) {
                        var type = steps[j].type;
                        surveyHtml += $scope.activitiesDivGenerator(customId,steps[j],disableSkip);
                     }
                     console.log(surveyHtml);
               }
            }
      }

    $scope.learnmore = $ionicModal.fromTemplate( '<ion-modal-view class="irk-modal has-tabs"> '+
                                      '<irk-ordered-tasks>'+
                                      surveyHtml +
                                      '</irk-ordered-tasks>'+
                                      '</ion-modal-view> ', {
                                      scope: $scope,
                                      animation: 'slide-in-up'
                                    });
      $scope.modal = $scope.learnmore;
      $scope.learnmore.show();
  };


  $scope.closeModal = function() {
    $scope.modal.remove();
    if (irkResults.getResults().canceled) {
       $ionicHistory.clearCache().then(function(){
          $state.transitionTo('tab.Activities');
          });
      }else if (irkResults.getResults()) { // launch sign up
        var childresult = irkResults.getResults().childResults ;
            childresult.every(function(value, key){
            if (value.type == "IRK-CONSENT-REVIEW-STEP") {
               if (value.answer) {
                 $state.transitionTo('tab.Activities');
               }else {
                 $state.transitionTo('tab.Activities');
               }
               return false;
            }
            return true ;
         });
      }
};

  // Cleanup the modal when we're done with it!
  $scope.$on('$destroy', function() {
    //$scope.modal.remove();
  });

  // Execute action on hide modal
  $scope.$on('modal.hidden', function() {
    // Execute action
  });

  // Execute action on remove modal
  $scope.$on('modal.removed', function() {
    // Execute action
   });
   $scope.activitiesDivGenerator= function(customId,stepData,disableSkip){
      var type = stepData.type;
      var customDiv = '';
   //2============================generate div using switch looking type ====
         switch(type){

             case 'irk-instruction-step':
                   if(stepData['button-text']){
                   customDiv = '<irk-task><irk-instruction-step optional="'+disableSkip+'" id="'+customId+'" title="'+stepData.title+'" text="'+stepData.text+'" button-text="'+stepData['button-text']+'"/> </irk-task>';
                   }else {
                   customDiv = '<irk-task><irk-instruction-step optional="'+disableSkip+'" id="'+customId+'" title="'+stepData.title+'" text="'+stepData.text+'" /> </irk-task>';
                   }
                   break ;
             case 'irk-scale-question-step':
                   customDiv = '<irk-task><irk-scale-question-step optional="'+disableSkip+'" id="'+customId+'" title="'+stepData.title+'" text="'+stepData.text+'" step="'+stepData.step+'" value="'+stepData.value+'" /> </irk-task>';
                   break;

             case 'irk-boolean-question-step':
                   customDiv = '<irk-task><irk-boolean-question-step optional="'+disableSkip+'" id="'+customId+'" title="'+stepData.title+'" text="'+stepData.text+'" true-text="'+stepData['true-text']+'" false-text="'+stepData['false-text']+'" /> </irk-task>';
                   break;

             case 'irk-text-question-step':
                   if(stepData['multiple-lines']){
                   customDiv = '<irk-task><irk-text-question-step optional="'+disableSkip+'" id="'+customId+'" title="'+stepData.title+'" text="'+stepData.text+'" multiple-lines="'+stepData['multiple-lines']+'" /> </irk-task>';
                   }else {
                   customDiv = '<irk-task><irk-text-question-step optional="'+disableSkip+'" id="'+customId+'" title="'+stepData.title+'" text="'+stepData.text+'" /> </irk-task>';
                   }
                   break;

             case 'irk-text-choice-question-step':
                           var style = '';
                           if (stepData.text.toLowerCase() ==='Select only one'.toLowerCase())
                           style = "single";
                           else
                           style = "multiple";
                           var choice = '';
                           for (var i = 0; i < stepData.choices.length; i++) {
                           if(stepData.choices[i].detail)
                           choice += '<irk-text-choice detail-text="'+stepData.choices[i].detail+'" text="'+stepData.choices[i].text+'" value="'+stepData.choices[i].value+'"></irk-text-choice>';
                           else
                           choice += '<irk-text-choice text="'+stepData.choices[i].text+'" value="'+stepData.choices[i].value+'"></irk-text-choice>';
                           }
                           customDiv = '<irk-task > <irk-text-choice-question-step optional="'+disableSkip+'" id="'+customId+'" title="'+stepData.title+'" style="'+style+'">'+
                           choice+'</irk-text-choice-question-step></irk-task>';
                    break;

              case 'irk-numeric-question-step':
                    customDiv = '<irk-task > <irk-numeric-question-step optional="'+disableSkip+'" id="'+customId+'"  title="'+stepData.title+'" text="'+stepData.text+'" unit="'+stepData['unit']+'"/></irk-task>';
                    break;

              case 'irk-date-question-step':
                    customDiv = '<irk-task > <irk-date-question-step optional="'+disableSkip+'" id="'+customId+'" title="'+stepData.title+'" text="'+stepData.text+'" /></irk-task>';
                    break;

              case 'irk-time-question-step':
                    customDiv = '<irk-task> <irk-time-question-step optional="'+disableSkip+'" id="'+customId+'" title="'+stepData.title+'" text="'+stepData.text+'" /></irk-task>';
                    break;

              case 'irk-value-picker-question-step':
                           var choice = '';
                           for (var i = 0; i < stepData.choices.length; i++) {
                           choice += '<irk-picker-choice text="'+stepData.choices[i].text+'" value="'+stepData.choices[i].value+'"></irk-picker-choice>';
                           }
                           customDiv = '<irk-task> <irk-value-picker-question-step optional="'+disableSkip+'" id="'+customId+'" title="'+stepData.title+'" text="'+stepData.text+'">'+
                           choice+'</irk-value-picker-question-step></irk-task>';
                    break;

              case 'irk-image-choice-question-step':
                           var choice = '';
                           for (var i = 0; i < stepData.choices.length; i++) {
                           choice += '<irk-image-choice text="'+stepData.choices[i].text+'" value="'+stepData.choices[i].value+'" normal-state-image="'+stepData.choices[i]['normal-state-image']+'" selected-state-image="'+stepData.choices[i]['selected-state-image']+'" ></irk-image-choice>';
                           }
                           customDiv = '<irk-task > <irk-image-choice-question-step optional="'+disableSkip+'" id="'+customId+'" title="'+stepData.title+'" text="'+stepData.text+'">'+
                           choice+'</irk-image-choice-question-step></irk-task>';
                    break;

              case 'irk-form-step':
                           var choice = '';
                           for (var i = 0; i < stepData.choices.length; i++) {
                           choice += '<irk-form-item text="'+stepData.choices[i].text+'" type="'+stepData.choices[i].type+'" id="'+stepData.choices[i].id+'" placeholder="'+stepData.choices[i].placeholder+'"  ></irk-form-item>';
                           }
                           customDiv = '<irk-task > <irk-form-step optional="'+disableSkip+'" id="'+customId+'" title="'+stepData.title+'" text="'+stepData.text+'">'+
                           choice+'</irk-form-step></irk-task>';
                    break;

              case 'instruction':
                    customDiv = '<irk-task optional="'+disableSkip+'" > <irk-instruction-step  optional="'+disableSkip+'" id="'+customId+'" title="'+stepData.title+'" text="'+stepData.text+'" button-text="Get Started" image="'+stepData.image+'" footer-attach="'+stepData['footer-attach']+'"/></irk-task>';
                    break;

              case 'irk-audio-task':
                    customDiv = '<irk-task optional="'+disableSkip+'" > <irk-audio-task auto-record="false" auto-complete="false"  optional="'+disableSkip+'" id="'+customId+'_audio" duration="'+stepData.duration+'" text= "'+stepData.text+'"/></irk-task>';
              break;
          }
         return customDiv;
   };

});

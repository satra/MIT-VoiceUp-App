angular.module('surveyController',[])
// ==== Dummy contorller need to be removed later before production  ========
.controller('SurveyCtrl', function($scope,$ionicHistory,$state, $rootScope,$ionicModal,
  pinModalService,userService,surveyDataManager,$ionicLoading,$ionicPopup,irkResults,profileDataManager,$q) {

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

surveyDataManager.getTaskListJson().then(function(response){
    $scope.taskList = response ;
});


surveyDataManager.getSurveyListForToday().then(function(response){
    $scope.surveyList = response;
    var surveyMainList = response;
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
       var formattedDate = today.getDate()+'-'+today.getMonth()+'-'+today.getFullYear() ;
       if (items) {
         profileDataManager.getUserIDByEmail($rootScope.emailId).then(function (userId){
           $scope.userId = userId ;
         });
         // now check any entries for today in surveytmp table
         surveyDataManager.checkSurveyExistsInTempTableForToday(formattedDate).then(function(res){

         $scope.list= items ;// add survey to html modal

         if (!res) {
              $ionicLoading.show();
              // if survey question doesn't exists clear the table for the user
              surveyDataManager.clearExistingTaskListFromTempTable($scope.userId)
              .then(function(res){
                    console.log('expiry entry from controller '+res);
               });

              // then loop through the survey and update history and temp table
              for (var k = 0; k < items.length; k++) {
                for (var M = 0; M < items[k].tasks.length; M++) {
                       var questionId = items[k].tasks[M] ;
                       var surveyId = items[k].id ;
                       var creationDate = formattedDate ;

                       //get question expiry for the Id
                       if ($scope.taskList[questionId].timelimit) {
                       // time limit exists add entry into expiry table
                       expiryDays = today.getDate() + 2 ;
                       var expiryDate = expiryDays +'-'+today.getMonth()+'-'+today.getFullYear() ;

                       surveyDataManager.addThisSurveyToExpiry($scope.userId,surveyId,questionId,creationDate,expiryDate)
                       .then(function(res){
                             console.log('expiry entry from controller '+res);
                           });
                       }
                       // make an entry into temp table
                       surveyDataManager.addSurveyToUserForToday($scope.userId,surveyId,questionId,creationDate)
                       .then(function(res){
                           console.log('log from controller '+res);
                       });

                      }
                 }

            // pull from expiry table and put it in temp table where questions expiry still exists
            surveyDataManager.getUnansweredQuestionsLessThanToDate($scope.userId,formattedDate).then(function(resp){
               console.log('control under fetching un answered questions ');
                         if (resp.rows.length >0 ) {
                           // insert unanswered questions into temp table
                          for (var i = 0; i < resp.rows.length; i++) {
                          surveyDataManager.addSurveyToUserForToday($scope.userId,'',resp.rows[i].questionId,formattedDate)
                            .then(function(res){
                                console.log('log from un answered controller '+res);
                             });
                          }
                          $ionicLoading.hide();
                        }else{
                          $ionicLoading.hide();
                        }
                 });
           }
        });
      }
  });

$scope.launchSurvey = function (idSelected){
      $scope.cancelSteps = false ;
      var deferred = $q.defer();
      // get the survey attached for this user
      var today = new Date() ;
      var formattedDate = today.getDate()+'-'+today.getMonth()+'-'+today.getFullYear();

      surveyDataManager.getTaskListByUserId($scope.userId,formattedDate).then(function(response){
       $scope.tasks = response.rows ;
        if ($scope.tasks) {
         var surveyHtml = ''; var onlySkippedQuestionHtml = '';
         //is skippable may needed future to make a screen skippable
         var surveys = $scope.surveyList;
         var taskList = $scope.taskList;
         for (var i = 0; i < surveys.length; i++) {
               var id = surveys[i].id;
               if(id == idSelected){ // get the selected survey data
               var skippable = surveys[i].skippable;
               var tasksneeded  = $scope.tasks; // get the list of tasks
               var isSkippedQuestions = false ;
               for (var k = 0; k < tasksneeded.length; k++) {

                     var taskselected = tasksneeded[k].questionId ;

                     //find out skippable true or false
                     var disableSkip = false ;
                     for (var L = 0; L < skippable.length; L++) {
                     if (taskselected == skippable[L]) {
                     disableSkip = true ;
                       }
                     }

                     //have a check to find out skipped questions
                     if (tasksneeded[k].isSkipped === "YES") {
                        var isSkippedQuestions = true ;
                     }

                      var questionId = tasksneeded[k].questionId;
                      var steps = taskList[tasksneeded[k].questionId].steps;

                      for (var j = 0; j < steps.length; j++) {
                       var type = steps[j].type;
                       surveyHtml += $scope.activitiesDivGenerator(questionId,steps[j],disableSkip);
                       // compose skipped html as well
                        if (tasksneeded[k].isSkipped === "YES") {
                             console.log(questionId+' '+ tasksneeded[k].isSkipped );
                        onlySkippedQuestionHtml += $scope.activitiesDivGenerator(questionId,steps[j],disableSkip);
                           }
                        }
                 }

                 if (isSkippedQuestions) {
                   var confirmPopup = $ionicPopup.confirm({
                     title: 'Only Skipped Question',
                     template: 'Want to display only skipped question ?. '
                   });
                   confirmPopup.then(function(res) {
                     if(res) {
                      $scope.showTasksForSlectedSurvey(onlySkippedQuestionHtml);
                     } else {
                      $scope.showTasksForSlectedSurvey(surveyHtml);
                     }
                   });
                  }else {
                   $scope.showTasksForSlectedSurvey(surveyHtml);
                 }
             }
          }
        }
   });
};

$scope.showTasksForSlectedSurvey = function(surveyHtml){
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
}

$scope.closeModal = function() {
    $scope.modal.remove();
    $ionicLoading.show();
    if (irkResults.getResults().canceled) {
      $ionicLoading.hide();
    }else{
     var childresult = irkResults.getResults().childResults ;
     for (var i = 0; i < childresult.length; i++) {
       var questionId = childresult[i].id ;
       var answer = childresult[i].answer ;
       var isSkipped = '';
       if (answer) {
       isSkipped = "NO";
             // if answered a question clear form history table so it is answered and no need to add for upcoming survey
             surveyDataManager.updateSurveyResultToTempTable($scope.userId,questionId,isSkipped).then(function(response){
           });
        }else{
          isSkipped = "YES";
           surveyDataManager.updateSurveyResultToTempTable($scope.userId,questionId,isSkipped).then(function(response){
           });
        }
     }
      //result entry into the result table
      surveyDataManager.addSurveyResultToDb($scope.userId,childresult).then(function(response){
        $ionicLoading.hide();
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
   //2============================ generate div using switch looking type ====
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

            /*  case 'irk-audio-task':
                    customDiv = '<irk-task optional="'+disableSkip+'" > <irk-audio-task auto-record="false" auto-complete="false"  optional="'+disableSkip+'" id="'+customId+'_audio" duration="'+stepData.duration+'" text= "'+stepData.text+'"/></irk-task>';
              break;
              */
          }
         return customDiv;
   };

});

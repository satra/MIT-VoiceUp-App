angular.module('surveyController',[])
// ==== Dummy contorller need to be removed later before production  ========
.controller('SurveyCtrl', function($scope,$state, $ionicModal,userService,irkResults) {
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
              month = month+1;
            }
            if(day == "*"){
             day = today.getDay();
            }
            var surveyDate = new Date(today.getFullYear()+'-'+month+'-'+day);
            if(today.getFullYear()===surveyDate.getFullYear() && today.getMonth()===surveyDate.getMonth() && today.getDay()==surveyDate.getDay() ){
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
               // var skippable = response[i].skippable;
              var tasksneeded  = surveys[i].tasks;
              for (var k = 0; k < tasksneeded.length; k++) {
                 var r = Math.floor(Math.random()*(100-1+1)/1);
                 var customId = tasksneeded[k]+r;
                 var steps = taskList[tasksneeded[k]].steps;
                   // timelimit may needed in future to run a scheduler per screen
                  //  var timelimit =taskList[tasksneeded[k]].timelimit;
                    for (var j = 0; j < steps.length; j++) {
                        var type = steps[j].type;
                        surveyHtml += $scope.activitiesDivGenerator(customId,steps[j]);
                     }
               }
            }
      }
   console.log(surveyHtml);
    $scope.learnmore = $ionicModal.fromTemplate( '<ion-modal-view class="irk-modal has-tabs"> '+
                                      '<irk-ordered-tasks>'+
                                      surveyHtml +
                                      '<irk-task>'+
                                      '</irk-ordered-tasks>'+
                                      '</ion-modal-view> ', {
                                      scope: $scope,
                                      animation: 'slide-in-up'
                                    });
      $scope.modal = $scope.learnmore;
      $scope.learnmore.show();
  };

  $scope.cancelClicked = function(){
   console.log('cancel the stuff ');
   $state.transitionTo('tab.Activities');
  };

  $scope.doneClicked = function(){
   $state.transitionTo('tab.Activities');
  };

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
   $scope.activitiesDivGenerator= function(customId,stepData){
      var type = stepData.type;
      var customDiv = '';
      console.log(type);
   //2============================generate div using switch looking type ====
         switch(type){

             case 'irk-instruction-step':
                   if(stepData['button-text']){
                   customDiv = '<irk-task><irk-instruction-step id="'+customId+'" title="'+stepData.title+'" text="'+stepData.text+'" button-text="'+stepData['button-text']+'"/> </irk-task>';
                   }else {
                   customDiv = '<irk-task><irk-instruction-step id="'+customId+'" title="'+stepData.title+'" text="'+stepData.text+'" /> </irk-task>';
                   }
                   break ;
             case 'irk-scale-question-step':
                   customDiv = '<irk-task><irk-scale-question-step id="'+customId+'" title="'+stepData.title+'" text="'+stepData.text+'" step="'+stepData.step+'" value="'+stepData.value+'" /> </irk-task>';
                   break;

             case 'irk-boolean-question-step':
                   customDiv = '<irk-task><irk-boolean-question-step id="'+customId+'" title="'+stepData.title+'" text="'+stepData.text+'" true-text="'+stepData['true-text']+'" false-text="'+stepData['false-text']+'" /> </irk-task>';
                   break;

             case 'irk-text-question-step':
                   if(stepData['multiple-lines']){
                   customDiv = '<irk-task><irk-text-question-step id="'+customId+'" title="'+stepData.title+'" text="'+stepData.text+'" multiple-lines="'+stepData['multiple-lines']+'" /> </irk-task>';
                   }else {
                   customDiv = '<irk-task><irk-text-question-step id="'+customId+'" title="'+stepData.title+'" text="'+stepData.text+'" /> </irk-task>';
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
                           customDiv = '<irk-task> <irk-text-choice-question-step id="'+customId+'" title="'+stepData.title+'" style="'+style+'">'+
                           choice+'</irk-text-choice-question-step></irk-task>';
                    break;

              case 'irk-numeric-question-step':
                    customDiv = '<irk-task> <irk-numeric-question-step id="'+customId+'" title="'+stepData.title+'" text="'+stepData.text+'" unit="'+stepData['unit']+'"/></irk-task>';
                    break;

              case 'irk-date-question-step':
                    customDiv = '<irk-task> <irk-date-question-step id="'+customId+'" title="'+stepData.title+'" text="'+stepData.text+'" /></irk-task>';
                    break;

              case 'irk-time-question-step':
                    customDiv = '<irk-task> <irk-time-question-step id="'+customId+'" title="'+stepData.title+'" text="'+stepData.text+'" /></irk-task>';
                    break;

              case 'irk-value-picker-question-step':
                           var choice = '';
                           for (var i = 0; i < stepData.choices.length; i++) {
                           choice += '<irk-picker-choice text="'+stepData.choices[i].text+'" value="'+stepData.choices[i].value+'"></irk-picker-choice>';
                           }
                           customDiv = '<irk-task> <irk-value-picker-question-step id="'+customId+'" title="'+stepData.title+'" text="'+stepData.text+'">'+
                           choice+'</irk-value-picker-question-step></irk-task>';
                    break;

              case 'irk-image-choice-question-step':
                           var choice = '';
                           for (var i = 0; i < stepData.choices.length; i++) {
                           choice += '<irk-image-choice text="'+stepData.choices[i].text+'" value="'+stepData.choices[i].value+'" normal-state-image="'+stepData.choices[i]['normal-state-image']+'" selected-state-image="'+stepData.choices[i]['selected-state-image']+'" ></irk-image-choice>';
                           }
                           customDiv = '<irk-task> <irk-image-choice-question-step id="'+customId+'" title="'+stepData.title+'" text="'+stepData.text+'">'+
                           choice+'</irk-image-choice-question-step></irk-task>';
                    break;

              case 'irk-form-step':
                           var choice = '';
                           for (var i = 0; i < stepData.choices.length; i++) {
                           choice += '<irk-form-item text="'+stepData.choices[i].text+'" type="'+stepData.choices[i].type+'" id="'+stepData.choices[i].id+'" placeholder="'+stepData.choices[i].placeholder+'"  ></irk-form-item>';
                           }
                           customDiv = '<irk-task> <irk-form-step id="'+customId+'" title="'+stepData.title+'" text="'+stepData.text+'">'+
                           choice+'</irk-form-step></irk-task>';
                    break;

              case 'instruction':
                    customDiv = '<irk-task> <irk-instruction-step id="'+customId+'" title="'+stepData.title+'" text="'+stepData.text+'" button-text="Get Started" image="'+stepData.image+'" footer-attach="'+stepData['footer-attach']+'"/></irk-task>';
                    break;

              case 'irk-audio-task':
                    customDiv = '<irk-task> <irk-audio-task id="'+customId+'_audio" duration="'+stepData.duration+'" text= "'+stepData.text+'"/></irk-task>';
              break;
          }
         return customDiv;
   };

});

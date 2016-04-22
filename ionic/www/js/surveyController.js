angular.module('surveyController',[])
// ==== Dummy contorller need to be removed later before production  ========
.controller('SurveyCtrl', function($scope, $ionicModal,userService,irkResults) {
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
//          var d = hr+':'+min +' '+day+'/'+month+'/'+today.getFullYear();
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
                        //var type = steps[j].type;
                        surveyHtml += activitiesDivGenerator(customId,steps[j]);
                     }    
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
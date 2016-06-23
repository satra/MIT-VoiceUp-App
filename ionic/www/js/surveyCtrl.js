
angular.module('surveyCtrl',[])
// ==== Dummy contorller need to be removed later before production  ========
.controller('surveyCtrl', function($scope,$ionicHistory,$state, $rootScope,$ionicModal,
 surveyDataManager,$ionicLoading,$ionicPopup,irkResults,profileDataManager,dataStoreManager,$q,$cordovaFile) {

//on resume handler===================================================================
$scope.hideImageDiv = true;
/*
document.addEventListener("resume", function() {
    if ($rootScope.activeUser) {
       profileDataManager.getEmailList().then(function(response){
       var emailArray = new Array() ;
       for (var i = 0; i < response.length; i++) {
       emailArray.push({'emailId':response.item(i).emailId});
       if (response.item(i).emailId == $rootScope.activeUser) {
          $scope.selectedEmail = emailArray[i];
          }
        }
       $scope.emails = emailArray;
     });

    if ($scope.pin) {
      $scope.pin.remove();
    }
    $ionicModal.fromTemplateUrl('templates/pinScreen.html', {
              scope: $scope,
              animation: 'slide-in-up'
            }).then(function(modal) {
              $scope.pin = modal;
              $scope.pin.show();
      });

   }
  }, false);

*/

  // ==== Close the existing modal and open Sign in html in new modal======== make these as common function
  $scope.openSignIn = function() {
    $ionicHistory.clearCache().then(function(){
        $scope.pin.remove();
        $state.transitionTo('signIn');
    });
  };

  // ==== Close the existing modal and open Sign in html in new modal========
  $scope.showEligibilityTestView = function() {
    $ionicHistory.clearCache().then(function(){
        $scope.pin.remove();
        $state.transitionTo('eligiblityTest');
    });
  };

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
                          $scope.clearPinDiv();
                          // All set go to next page
                          $ionicHistory.clearCache().then(function(){
                          $rootScope.emailId = email ; // save it to access in update profile
                          $scope.pin.hide();
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
          document.activeElement.blur(); // remove the keypad
          $ionicPopup.alert({
           title: 'Error',
           template: message
          });
    }
//============== resume handler finished ============================================

surveyDataManager.getSurveyListForToday().then(function(response){
    $scope.list = response;
    var surveyMainList = response;
    var today = new Date() ;
    var creationDate = today.getDate()+'-'+(today.getMonth()+1)+'-'+today.getFullYear() ;
    if (surveyMainList && $rootScope.emailId) {
         profileDataManager.getUserIDByEmail($rootScope.emailId).then(function (userId){
           $scope.userId = userId ;
           // now check any entries for today in surveytmp table
           surveyDataManager.checkSurveyExistsInTempTableForToday(creationDate,userId).then(function(res){
           if (!res) {
                $ionicLoading.show();
                // if survey question doesn't exists clear the table for the user
                surveyDataManager.clearExistingTaskListFromTempTable($scope.userId)
                .then(function(res){
                      console.log('expiry entry from controller '+res);
                 });

                var promises = [];
                // then loop through the survey and update history and temp table
                for (var k = 0; k < surveyMainList.length; k++) {
                    var taskList = JSON.parse(surveyMainList[k].tasks) ;
                    var skippableList = JSON.parse(surveyMainList[k].skippable) ;
                    var surveyId = surveyMainList[k].id ;
                    for (var M = 0; M < taskList.length; M++) {
                    var questionId = taskList[M] ;
                    var skippable = false ;
                    for (var L = 0; L < skippableList.length; L++) {
                        if (questionId == skippableList[L]) {
                          skippable = true ;
                        }
                     }
                     promises.push(surveyDataManager.addSurveyToUserForToday($scope.userId,surveyId,questionId,creationDate,skippable));
                    }
                }
            // resolve all the promises
            $q.all(promises).then(function(res){
               for (var i = 0; i < res.length; i++) {
                  surveyDataManager.getSurveyTempRowByInsertId(res[i]).then(function(row){
                      if (row) {
                        var questionId  = row.questionId ;
                        surveyDataManager.getQuestionExpiry(questionId).then(function(limitExists){
                             if (limitExists) {
                                   expiryDays = today.getDate() + 2 ;
                                   var expiryDate = expiryDays +'-'+(today.getMonth()+1)+'-'+today.getFullYear() ;
                                   surveyDataManager.addThisSurveyToExpiry($scope.userId,row.surveyId,row.questionId,creationDate,expiryDate,row.skippable)
                                   .then(function(resp){
                                      console.log('expiry entry from controller '+resp);
                                   });
                             }
                        });
                      }
                  });
                }
            });

        // pull from expiry table and put it in temp table where questions expiry still exists
        surveyDataManager.getUnansweredQuestionsLessThanToDate($scope.userId,creationDate).then(function(resp){
                 console.log('control under fetching un answered questions ');
                           if (resp.length >0 ) {
                             // insert unanswered questions into temp table
                            for (var i = 0; i < resp.length; i++) {
                            surveyDataManager.addSurveyToUserForToday($scope.userId,'',resp[i].questionId,creationDate,resp[i].skippable)
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
         });
      }
  });

$scope.launchSurvey = function (idSelected){
      $scope.cancelSteps = false ;
      // get the survey attached for this user
      var today = new Date() ;
      var formattedDate = today.getDate()+'-'+(today.getMonth()+1)+'-'+today.getFullYear();
      if ($scope.userId) {
       surveyDataManager.getTaskListByUserId($scope.userId,formattedDate).then(function(response){
         var tasks = response.rows;
         if (tasks) {
         var surveyHtml = ''; var isSkippedQuestions ='';
         var onlySkippedQuestionHtml = '';
         var promises = []; // an array of promises
         for (var i = 0; i < tasks.length; i++) {
               var questionId = tasks.item(i).questionId;
               var isSkipped = tasks.item(i).isSkipped;
               //have a check to find out skipped questions
               if (isSkipped === "YES") {
                  isSkippedQuestions = true ;
               }
          promises.push(surveyDataManager.getTaskListByquestionId(questionId));
      }

      $q.all(promises).then(function(stepsData){
        for (var T = 0; T < stepsData.length; T++) {
          var steps = JSON.parse(stepsData[T]);
          var questionId = tasks.item(T).questionId ;
          var disableSkip = tasks.item(T).skippable ;
          console.log(disableSkip);
          for (var k = 0; k < steps.length; k++) {
          surveyHtml += $scope.activitiesDivGenerator(questionId,steps[k],disableSkip);

          // compose skipped html as well
          if (tasks.item(T).isSkipped === "YES") {
           onlySkippedQuestionHtml += $scope.activitiesDivGenerator(questionId,steps[k],disableSkip);
          }
        }
      }

    if (surveyHtml || onlySkippedQuestionHtml) {
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
      });
     }
   });
 }else {
       if ($scope.list) {
             var surveyList = $scope.list;
             for (var i = 0; i < surveyList.length; i++) {
             var skippable = JSON.parse(surveyList[i].skippable);
             var tasks = JSON.parse(surveyList[i].tasks);
             var surveyId = surveyList[i].surveyId;
                  if (surveyId == idSelected) {
                  var promises = []; // an array of promises
                  var surveyHtml = '';
                  for (var j = 0; j < tasks.length; j++) {
                    promises.push(surveyDataManager.getTaskListForquestion(tasks[j]));
                  }

                  $q.all(promises).then(function(data){
                      for (var T = 0; T < data.length; T++) {
                        var steps = JSON.parse(data[T].steps);
                        var questionId = data[T].taskId;
                        var skippable = true;
                        for (var k = 0; k < steps.length; k++) {
                        surveyHtml += $scope.activitiesDivGenerator(questionId,steps[k],skippable);
                      }
                    }
                      if (surveyHtml) {
                            $scope.showTasksForSlectedSurvey(surveyHtml);
                      }
                  });
               }
             }
       }
   }
};

$scope.showTasksForSlectedSurvey = function(surveyHtml){
  console.log(surveyHtml);
if($rootScope.emailId){
  profileDataManager.getFolderIDByEmail($rootScope.emailId).then(function (folderId){
    $scope.folderId = folderId ;
  });

  profileDataManager.getAuthTokenForUser($rootScope.emailId).then(function (authToken){
    $scope.authToken = authToken.token ;
  });
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
    $ionicLoading.show();

    $ionicHistory.clearCache().then(function(){
    });

    if (irkResults.getResults().canceled) {
    $ionicLoading.hide();
    }else{
     var childresult = irkResults.getResults().childResults ;
     if ($scope.userId) {
       for (var i = 0; i < childresult.length; i++) {
       var questionId = childresult[i].id ;
       var answer = childresult[i].answer ;
       var type = childresult[i].type;
       var isSkipped = '';
       if (answer) {
       isSkipped = "NO";
             // if answered a question clear form history table so it is answered and no need to add for upcoming survey
             surveyDataManager.updateSurveyResultToTempTable($scope.userId,questionId,isSkipped).then(function(response){

             });
       }else if (type=="IRK-AUDIO-TASK"){
          var fileURL = childresult[i].fileURL;
          if (fileURL) {
            isSkipped = "NO";
          }else {
            isSkipped = "YES";
          }
            // if answered a question clear form history table so it is answered and no need to add for upcoming survey
            surveyDataManager.updateSurveyResultToTempTable($scope.userId,questionId,isSkipped).then(function(response){

            });
       }
       else{
         isSkipped = "YES";
             // if answered a question clear form history table so it is answered and no need to add for upcoming survey
             surveyDataManager.updateSurveyResultToTempTable($scope.userId,questionId,isSkipped).then(function(response){

             });
        }
     }
     //result entry into the result table
     surveyDataManager.addResultToDb($scope.userId,childresult,'survey').then(function(response){
     //get item list by folderId
     dataStoreManager.getItemListByFolderId($scope.folderId,$scope.authToken).then(function(itemList){
       if (itemList.status==200) {
         var itemListDetails = itemList.data ;
         for (var i = 0; i < itemListDetails.length; i++) {
           var itemName = itemListDetails[i].name;
           var item_id = itemListDetails[i]._id;
            if (itemName == 'results') {
                var today = new Date();
                var fileName = 'results_json_'+today;
                $scope.uploadResults($scope.authToken,item_id,JSON.stringify(childresult),fileName);
                for (var k = 0; k < childresult.length; k++) {
                      var type = childresult[k].type;
                      if (type=="IRK-AUDIO-TASK") {
                       var fileURL = childresult[k].fileURL;
                       var contentType = childresult[k].contentType;
                       if (fileURL) {
                        var fileName = fileURL;
                        var itemId = item_id;
                        var audioFileDirectory = (ionic.Platform.isAndroid() ? cordova.file.dataDirectory : cordova.file.documentsDirectory);
                         $cordovaFile.readAsDataURL(audioFileDirectory,fileName).then(function (base64Data){
                         $scope.uploadAudioData($scope.authToken,itemId,base64Data,fileName);
                        },function(error){
                            console.log(error);
                         });

                       }
                      }
                    }

              }
         }
       }
        });
      });
  }else {
    surveyDataManager.addResultToDb('guest',childresult,'survey').then(function(response){
       console.log(response);
       $ionicLoading.hide();
     });
  }

    }
  };

  //=== upload consent json for the file ===========================================
  $scope.uploadAudioData = function (girderToken,itemId,dataString,fileName){
          try {
                  var deferred = $q.defer();
                  var dataString = LZString.compressToEncodedURIComponent(dataString);
                  var fileSize = dataString.length;
                  dataStoreManager.createFileForItem(girderToken,itemId,fileName,fileSize).then(function(fileCreateInfo){
                     if (fileCreateInfo.status==200) {
                        var fileCreateDetails = fileCreateInfo.data ;
                        var fileCreateId = fileCreateDetails._id ;
                        var chunkInfo = dataStoreManager.uploadAudioFileChunk(girderToken,fileCreateId,dataString).then(function(chunkInfo){
                           if (chunkInfo.status==200) {
                           var chunkDetails = chunkInfo.data ;
                           }
                         });
                       }
                  });
            }
          catch(err) {
            console.log('error'+err);
          }
};

  //=== upload consent json for the file ===========================================
  $scope.uploadResults = function (girderToken,itemId,uploadData,fileName){
          try {
                  var deferred = $q.defer();
                  var dataString = LZString.compressToEncodedURIComponent(uploadData);
                  var fileSize = dataString.length;
                  dataStoreManager.createFileForItem(girderToken,itemId,fileName,fileSize).then(function(fileCreateInfo){
                  if (fileCreateInfo.status==200) {
                        var fileCreateDetails = fileCreateInfo.data ;
                        var fileCreateId = fileCreateDetails._id ;
                        var chunkInfo = dataStoreManager.uploadChunkForFile(girderToken,fileCreateId,dataString).then(function(chunkInfo){
                           if (chunkInfo.status==200) {
                           var chunkDetails = chunkInfo.data ;
                           }
                         });
                       }
                  });
            }
          catch(err) {
            console.log('error'+err);
          }
};

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

              case 'irk-audio-task':
                    customDiv = '<irk-task optional="'+disableSkip+'" > <irk-audio-task auto-record="false" auto-complete="false"  optional="'+disableSkip+'" id="'+customId+'" duration="'+stepData.duration+'" text= "'+stepData.text+'"/></irk-task>';
              break;

          }
         return customDiv;
   };

});

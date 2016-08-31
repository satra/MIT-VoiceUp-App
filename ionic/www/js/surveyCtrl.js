angular.module('surveyCtrl', [])
  // ==== Dummy contorller need to be removed later before production  ========
  .controller('surveyCtrl', function($scope, $ionicHistory, $state, $rootScope, $ionicModal,
    surveyDataManager, $ionicLoading, $ionicPopup, userService, $timeout, appConstants, irkResults, profileDataManager, dataStoreManager, syncDataFactory, $q, $cordovaFile) {

    $rootScope.loggedInStatus = true;

    // =================== if the internet available flush the results and profile data for the user
    if (window.Connection) {
      if (navigator.connection.type == Connection.NONE) {
        $ionicLoading.hide();
      } else {
        if ($rootScope.emailId) {
          $ionicLoading.show({
            template: appConstants.checkForServerUpdates
          });
          syncDataFactory.startSyncServiesToFetchResults($rootScope.emailId).then(function(res) {
            $scope.checkForServerDataUpdates();
            $ionicLoading.hide();
          }, function(error) {
            $ionicLoading.hide();
          });
        }
      }
    }

    //============== On launch activiteis surveys to temp table first time ============================================

    surveyDataManager.getSurveyListForToday().then(function(response) {
      $scope.list = response;
      var surveyMainList = response;
      var today = new Date();
      var creationDate = today.getDate() + '-' + (today.getMonth() + 1) + '-' + today.getFullYear();
      if (surveyMainList && $rootScope.emailId) {
        profileDataManager.getUserIDByEmail($rootScope.emailId).then(function(userId) {
          $scope.userId = userId;
          // now check any entries for today in surveytmp table
          surveyDataManager.checkSurveyExistsInTempTableForToday(creationDate, userId).then(function(res) {
            if (!res) {
              $ionicLoading.show();
              // if survey question doesn't exists clear the table for the user
              surveyDataManager.clearExistingTaskListFromTempTable($scope.userId)
                .then(function(res) {
                  console.log('expiry entry from controller ' + res);
                });

              var promises = [];
              // then loop through the survey and update history and temp table
              for (var k = 0; k < surveyMainList.length; k++) {
                var taskList = JSON.parse(surveyMainList[k].tasks);
                var skippableList = JSON.parse(surveyMainList[k].skippable);
                var surveyId = surveyMainList[k].surveyId;
                for (var M = 0; M < taskList.length; M++) {
                  var questionId = taskList[M];
                  var skippable = false;
                  for (var L = 0; L < skippableList.length; L++) {
                    if (questionId == skippableList[L]) {
                      skippable = true;
                    }
                  }
                  promises.push(surveyDataManager.addSurveyToUserForToday($scope.userId, surveyId, questionId, creationDate, skippable));
                }
              }
              // resolve all the promises
              $q.all(promises).then(function(res) {
                for (var i = 0; i < res.length; i++) {
                  surveyDataManager.getSurveyTempRowByInsertId(res[i]).then(function(row) {
                    if (row) {
                      var questionId = row.questionId;
                      surveyDataManager.getQuestionExpiry(questionId).then(function(limitExists) {
                        if (limitExists) {
                          expiryDays = today.getDate() + parseInt(limitExists.split("-")[0]);
                          var expiryDate = expiryDays + '-' + (today.getMonth() + 1) + '-' + today.getFullYear();
                          surveyDataManager.addThisSurveyToExpiry($scope.userId, row.surveyId, row.questionId, creationDate, expiryDate, row.skippable)
                            .then(function(resp) {
                              console.log('expiry entry from controller ' + resp);
                            });
                        }
                      });
                    }
                  });
                }
              });

              // pull from expiry table and put it in temp table where questions expiry still exists
              surveyDataManager.getUnansweredQuestionsLessThanToDate($scope.userId, creationDate).then(function(resp) {
                if (resp) {
                  for (var i = 0; i < resp.length; i++) {
                    surveyDataManager.addSurveyToUserForToday($scope.userId, '', resp[i].questionId, creationDate, resp[i].skippable)
                      .then(function(res) {
                        console.log('log from un answered controller ' + res);
                      });
                  }
                  $ionicLoading.hide();
                } else {
                  $ionicLoading.hide();
                }
              });
            }
          });
        });
      }
    });

    //check for server updates on next version of data
    $scope.checkForServerDataUpdates = function() {
      var localJSON = '';
      $ionicLoading.show({
        template: appConstants.checkForServerUpdates
      });
      userService.getAppContent().then(function(localData) {
        localJSON = JSON.parse(localData.completeJson);
        $rootScope.savedVersion = localData.version;
        var savedVersion = localData.version;
        var diffURL = localData.diffURL;
        userService.getSeverJson(diffURL).then(function(newJson) {
          var delta = JSON.parse(JSON.stringify(newJson).replace(/\s/g, ""));
          var newVersion = delta.version[1];
          if (savedVersion.trim() != newVersion.trim()) {
            $rootScope.savedVersion = newVersion;
            var diffpatcher = jsondiffpatch.create();
            diffpatcher.patch(localJSON, delta);
            $scope.updateLocalDataBaseWithFreshDiff(localJSON);
          } else {
            $ionicLoading.hide();
          }
        }, function(error) {
          $ionicLoading.hide();
        });
      }, function(error) {
        $ionicLoading.hide();
      });
    }

    $scope.updateLocalDataBaseWithFreshDiff = function(localJSON) {
      $ionicLoading.show({
        template: appConstants.checkForServerUpdates
      });
      var version = localJSON.version;
      var diffURL = localJSON.diffURL;
      var url = localJSON.URL;
      var eligibility = JSON.stringify(localJSON.eligibility);
      var profile = JSON.stringify(localJSON.profile);
      var consent_screens = JSON.stringify(localJSON.consent);
      var completeJson = JSON.stringify(localJSON).replace(/'/g, "`");
      var surveyJson = localJSON.surveys;
      var tasksJson = localJSON.tasks;
      userService.updateAppContent(version, url, diffURL, eligibility, profile, consent_screens, completeJson).then(function(dataUpdate) {
        if (dataUpdate) {
          // an array of promises
          var surveyListPromise = [];
          var taskListPromise = [];
          for (var survey in surveyJson) {
            if (surveyJson.hasOwnProperty(survey)) {
              var obj = surveyJson[survey];
              var date = '';
              var title = survey;
              var id = survey;
              var skippable = '';
              var tasks = '';
              for (var prop in obj) {
                switch (prop) {
                  case "date":
                    date = obj[prop];
                    break;
                  case "skippable":
                    skippable = JSON.stringify(obj[prop]);
                    break;
                  case "tasks":
                    tasks = JSON.stringify(obj[prop]);
                    break;
                  default:
                }
                if (date && title && id && tasks) {
                  var dateArray = date.split(" ");
                  var day = dateArray[2];
                  var month = dateArray[3];
                  surveyListPromise.push(userService.updateSurveysTableById(day, month, title, id, skippable, tasks));
                }
              }
            }
          }
          for (var task in tasksJson) {
            if (tasksJson.hasOwnProperty(task)) {
              var timeLimit = tasksJson[task].timelimit;
              var steps = JSON.stringify(tasksJson[task].steps).replace(/'/g, "`");
              if (timeLimit === undefined || timeLimit === null) {
                timeLimit = '';
              }
              taskListPromise.push(userService.updateTasksTableById(task, steps, timeLimit));
            }
          }
          $scope.flushSurveyTempTable(surveyListPromise, taskListPromise);
        }
      }, function(error) {
        $ionicLoading.hide();
      });

      $timeout(function() {
        $ionicLoading.hide();
      }, 3000);
    }

    $scope.flushSurveyTempTable = function(surveyListPromise, taskListPromise) {
      surveyDataManager.getUsersListFromTempTable().then(function(usersList) {
        if (usersList.length > 0) {
          var usersFromTempTable = usersList;
          surveyDataManager.getSurveyListForToday().then(function(surveyForToday) {
            if (surveyForToday.length > 0) {
              var skippableList = JSON.parse(surveyForToday[0].skippable);
              var tasksForToday = JSON.parse(surveyForToday[0].tasks);
              var title = surveyForToday[0].title;
              var promises = []; // an array of promises
              for (var k = 0; k < tasksForToday.length; k++) {
                var updatedQuestionId = tasksForToday[k];
                promises.push(surveyDataManager.checkQuestionIdExistsFromTempTable(updatedQuestionId));
              }
              $q.all(promises).then(function(verify) {
                var insertQueries = [];
                var updateQueries = [];
                var today = new Date();
                var creationDate = today.getDate() + '-' + (today.getMonth() + 1) + '-' + today.getFullYear();
                if (verify.length > 0) {
                  for (var i = 0; i < verify.length; i++) {
                    if (verify[i][0].status) {
                      for (var j = 0; j < usersFromTempTable.length; j++) {
                        var userId = usersList[j].userId;
                        var questionId = verify[i][0].questionId;
                        var skippable = false;
                        for (var L = 0; L < skippableList.length; L++) {
                          if (questionId == skippableList[L]) {
                            skippable = true;
                          }
                        }
                        insertQueries.push(surveyDataManager.addSurveyToUserForToday(userId, title, questionId, creationDate, skippable));
                      }
                    } else {
                      if (verify[i][0].questionId) {
                        var questionId = verify[i][0].questionId;
                        for (var L = 0; L < skippableList.length; L++) {
                          if (questionId == skippableList[L]) {
                            skippable = true;
                          }
                        }
                        updateQueries.push(surveyDataManager.updateSurveyTempTableForTodayBySurveyId(title, questionId, skippable));
                      }
                    }
                  }
                }
                // run insert queries
                $q.all(insertQueries).then(function(insertRows) {
                  // run update queries
                  $q.all(updateQueries).then(function(updateRows) {
                    $scope.flushFinalListOfSurveyAndTaks(surveyListPromise, taskListPromise);
                  });
                });
              });
            }
          });
        } else {
          $scope.flushFinalListOfSurveyAndTaks(surveyListPromise, taskListPromise);
        }
      });
    }

    $scope.flushFinalListOfSurveyAndTaks = function(surveyListPromise, taskListPromise) {
      // resolve both the promise out of for loop
      $q.all(surveyListPromise).then(function(surevyResolvePromise) {
        $ionicLoading.hide();
      }, function(error) {
        $ionicLoading.hide();
      });

      $q.all(taskListPromise).then(function(tasksResolvePromise) {
        $ionicLoading.hide();
      }, function(error) {
        $ionicLoading.hide();
      });

    }

    //on resume handler===================================================================
    $scope.hideImageDiv = true;
    // == take user to home screeen
    $scope.switchUser = function() {
      $ionicHistory.clearCache().then(function() {
        $rootScope.emailId = null;
        $state.transitionTo('home');
      });
    }

    // ==== Close the existing modal and open Sign in html in new modal======== make these as common function
    $scope.openSignIn = function() {
      $ionicHistory.clearCache().then(function() {
        $scope.pin.remove();
        $state.transitionTo('signIn');
      });
    };

    // ==== Close the existing modal and open Sign in html in new modal========
    $scope.showEligibilityTestView = function() {
      $ionicHistory.clearCache().then(function() {
        $scope.pin.remove();
        $state.transitionTo('eligiblityTest');
      });
    };


    //sign in via email and passcode on change of passcode call this function
    $scope.loginViaPasscode = function() {
      var inputValue = angular.element(document.querySelectorAll('#pinpasscode'));
      var passcode = inputValue.prop('value');
      if (passcode.length == 4) {
        var emailDiv = angular.element(document.querySelectorAll('.passcode-dropdown'));
        var email = emailDiv.prop('selectedOptions')[0].value;
        if (email && passcode) {
          //get IP like email ids
          profileDataManager.logInViaPasscode(email, passcode).then(function(res) {
            if (res) {
              $scope.clearPinDiv();
              // All set go to next page
              $ionicHistory.clearCache().then(function() {
                $rootScope.emailId = email; // save it to access in update profile
                $scope.pin.hide();
                $rootScope.activeUser = email;
              });
            } else {
              $scope.clearPinDiv();
              $scope.callAlertDailog('Invalid passcode!!!');
            }
          });
        }
      }
    };

    $scope.clearPinDiv = function() {
      var passcode_div = angular.element(document.querySelector('#pinpasscode'));
      passcode_div.val('');
    }

    //error handler dailog
    $scope.callAlertDailog = function(message) {
      document.activeElement.blur(); // remove the keypad
      $ionicPopup.alert({
        title: appConstants.errorDailogTitle,
        template: message
      });
    }

    $scope.launchSurvey = function(idSelected) {
      $scope.cancelSteps = false;
      // get the survey attached for this user
      var today = new Date();
      var formattedDate = today.getDate() + '-' + (today.getMonth() + 1) + '-' + today.getFullYear();
      if ($scope.userId) {
        surveyDataManager.getTaskListByUserId($scope.userId, formattedDate).then(function(response) {
          var tasks = response.rows;
          if (tasks) {
            var surveyHtml = '';
            var isSkippedQuestions = '';
            var onlySkippedQuestionHtml = '';
            var promises = []; // an array of promises
            for (var i = 0; i < tasks.length; i++) {
              var questionId = tasks.item(i).questionId;
              var isSkipped = tasks.item(i).isSkipped;
              //have a check to find out skipped questions
              if (isSkipped === "YES") {
                isSkippedQuestions = true;
              }
              promises.push(surveyDataManager.getTaskListByquestionId(questionId));
            }

            $q.all(promises).then(function(stepsData) {
              for (var T = 0; T < stepsData.length; T++) {
                var steps = JSON.parse(stepsData[T]);
                var questionId = tasks.item(T).questionId;
                var disableSkip = tasks.item(T).skippable;
                for (var k = 0; k < steps.length; k++) {
                  surveyHtml += $scope.activitiesDivGenerator(questionId, steps[k], disableSkip);

                  // compose skipped html as well
                  if (tasks.item(T).isSkipped === "YES" || tasks.item(T).isSkipped === "NONE") {
                    onlySkippedQuestionHtml += $scope.activitiesDivGenerator(questionId, steps[k], disableSkip);
                  }
                }
              }

              $rootScope.AllowedToDisplayNextPopUp = true;
              if (surveyHtml || onlySkippedQuestionHtml) {
                if (isSkippedQuestions) {
                  $rootScope.popupAny = $ionicPopup.show({
                    title: appConstants.displayOnlySkippedQuestionTitle,
                    subTitle: appConstants.displayOnlySkippedQuestionMessage,
                    scope: $scope,
                    buttons: [{
                      text: '<b>YES</b>',
                      onTap: function(e) {
                        if ($rootScope.AllowedToDisplayNextPopUp) {
                          $scope.showTasksForSlectedSurvey(onlySkippedQuestionHtml);
                        }
                      }
                    }, {
                      text: 'NO',
                      type: 'button-positive',
                      onTap: function(e) {
                        if ($rootScope.AllowedToDisplayNextPopUp) {
                          $scope.showTasksForSlectedSurvey(surveyHtml);
                        }
                      }
                    }]
                  });

                } else {
                  $scope.showTasksForSlectedSurvey(surveyHtml);
                }
              }
            });
          }
        });
      } else {
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

              $q.all(promises).then(function(data) {
                for (var T = 0; T < data.length; T++) {
                  if (data[T]) {
                    var steps = JSON.parse(data[T].steps);
                    var questionId = data[T].taskId;
                    var skippable = true;
                    for (var k = 0; k < steps.length; k++) {
                      surveyHtml += $scope.activitiesDivGenerator(questionId, steps[k], skippable);
                    }
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

    $scope.showTasksForSlectedSurvey = function(surveyHtml) {
      if ($rootScope.emailId) {
        profileDataManager.getFolderIDByEmail($rootScope.emailId).then(function(folderId) {
          $scope.folderId = folderId;
          if (folderId === undefined || folderId === null || folderId === "undefined") {
            $scope.folderId = "";
          } else {
            $scope.folderId = folderId;
          }
        });

        profileDataManager.getAuthTokenForUser($rootScope.emailId).then(function(authToken) {
          $scope.authToken = authToken.token;
          if ($scope.authToken === undefined || $scope.authToken === null || $scope.authToken === "undefined") {
            $scope.authToken = "";
          } else {
            $scope.authToken = authToken.token;
          }
        });

        profileDataManager.getItemIdForUserIdAndItem($scope.userId, "response").then(function(resultItemId) {
          $scope.resultItemId = resultItemId;
          if (resultItemId === undefined || resultItemId === null || resultItemId === "undefined") {
            $scope.resultItemId = "";
          } else {
            $scope.resultItemId = resultItemId;
          }
        });
      }

      // if any modal already remove
      if ($rootScope.modal) {
        $rootScope.modal.remove();
      }

      $rootScope.loggedInStatus = false;
      $scope.captureDataValue = true;
      $scope.learnmore = $ionicModal.fromTemplate('<ion-modal-view class="irk-modal has-tabs"> ' +
        '<irk-ordered-tasks>' +
        surveyHtml +
        '</irk-ordered-tasks>' +
        '</ion-modal-view> ', {
          scope: $scope,
          animation: 'slide-in-up'
        });
      $rootScope.modal = $scope.learnmore;
      $scope.learnmore.show();
    };

    $scope.closeModal = function() {
      $rootScope.modal.remove();
      $rootScope.loggedInStatus = true;
      $ionicLoading.show();
      $ionicHistory.clearCache().then(function() {});

      if (irkResults.getResults().canceled) {
        $ionicLoading.hide();
      } else {
        var childresult = irkResults.getResults().childResults;
        if ($scope.captureDataValue && childresult) {
          // start data processing
          $scope.captureDataValue = false;
          if ($scope.userId) {
            for (var i = 0; i < childresult.length; i++) {
              var questionId = childresult[i].id;
              var answer = childresult[i].answer;
              var type = childresult[i].type;
              var isSkipped = '';
              if (answer) {
                isSkipped = "NO";
                // if answered a question clear form history table so it is answered and no need to add for upcoming survey
                surveyDataManager.updateSurveyResultToTempTable($scope.userId, questionId, isSkipped).then(function(response) {

                });
              } else if (type == "IRK-AUDIO-TASK") {
                var fileURL = childresult[i].fileURL;
                if (fileURL) {
                  isSkipped = "NO";
                } else {
                  isSkipped = "YES";
                }
                // if answered a question clear form history table so it is answered and no need to add for upcoming survey
                surveyDataManager.updateSurveyResultToTempTable($scope.userId, questionId, isSkipped).then(function(response) {

                });
              } else {
                isSkipped = "YES";
                // if answered a question clear form history table so it is answered and no need to add for upcoming survey
                surveyDataManager.updateSurveyResultToTempTable($scope.userId, questionId, isSkipped).then(function(response) {

                });
              }
            }
            // upload the survey data
            $scope.uploadSurveyResultToLocalDb(childresult);
          } else {
            surveyDataManager.addResultToDb('guest', childresult, 'survey').then(function(response) {
              $ionicLoading.hide();
            });
          }
        } else {
          // start data processing
          $ionicLoading.hide();
        }
      }
    };


    $scope.uploadSurveyResultToLocalDb = function(childresult) {
      var today = new Date();
      var fileName = 'results_json_' + today.getMonth() + '_' + today.getDate() + '_' + today.getFullYear() + '_' + today.getHours() + '_' + today.getMinutes() + '_' + today.getSeconds();

      surveyDataManager.addResultToDb($scope.userId, childresult, 'survey').then(function(response) {
        var resultJson = JSON.stringify(childresult);

        syncDataFactory.addToSyncQueue($scope.authToken, $scope.userId, fileName, resultJson, $scope.folderId, $scope.resultItemId, false).then(function(consentUpload) {
          if (consentUpload) {
            var promises = [];
            var itemNameArray = [];
            for (var k = 0; k < childresult.length; k++) {
              var type = childresult[k].type;
              if (type == "IRK-AUDIO-TASK") {
                var fileURL = childresult[k].fileURL;
                var contentType = childresult[k].contentType;
                if (fileURL) {
                  itemNameArray.push(fileURL);
                  var audioFileDirectory = (ionic.Platform.isAndroid() ? cordova.file.externalRootDirectory : cordova.file.documentsDirectory);
                  promises.push($cordovaFile.readAsDataURL(audioFileDirectory, fileURL));
                }
              }
            }
            if (promises.length > 0 && itemNameArray.length > 0) {
              var baseDataArray = '';
              $q.all(promises).then(function(baseDataArray) {
                var fileItemPromise = [];
                for (var i = 0; i < baseDataArray.length; i++) {
                  fileItemPromise.push(syncDataFactory.addToSyncQueue($scope.authToken, $scope.userId, itemNameArray[i], baseDataArray[i], $scope.folderId, $scope.resultItemId, false));
                }
                $q.all(fileItemPromise).then(function(itemCreateInfo) {
                  $scope.startDataSync();
                });
              }, function(error) {
                $ionicLoading.hide();
              });
            } else {
              $scope.startDataSync();
            }
          }
        });
      });
    }


    $scope.startDataSync = function() {
      // user autherized or not
      profileDataManager.checkIsUserValid($rootScope.emailId).then(function(res) {
        if (res.toLowerCase() == "yes".toLowerCase()) {
          if (window.Connection) {
            if (navigator.connection.type == Connection.NONE) {
              $scope.uploadFailure();
            } else {

              syncDataFactory.checkDataAvailableToSync().then(function(res) {
                if (res.length > 0) {
                  $ionicLoading.show({
                    template: appConstants.syncNewDataMessage
                  });
                  syncDataFactory.startSyncServiesTouploadData(res).then(function(res) {
                    $ionicLoading.hide();
                    var message = res.statusText;
                    var title = appConstants.dataUploadSuccessTitle;
                    if (!message) {
                      message = appConstants.dataUploadFailedMessage;
                      title = appConstants.dataUploadFailedTitle;
                    }
                    $ionicPopup.alert({
                      title: title,
                      template: message
                    });
                  }, function(error) {
                    $scope.uploadFailure();
                  });
                }
              });
            }
          }
        } else {
          $ionicLoading.hide();
          $ionicPopup.alert({
            title: appConstants.syncOnceAccountVerifiedTitle,
            template: appConstants.syncOnceAccountVerifiedMessage
          });
        }
      });
    }

    $scope.uploadFailure = function() {
      $ionicLoading.hide();
      $ionicPopup.alert({
        title: appConstants.syncDataUploadFailedTitle,
        template: appConstants.syncDataUploadFailedMessage
      });
    }


    $scope.activitiesDivGenerator = function(customId, stepData, disableSkip) {
      var type = stepData.type;
      var customDiv = '';
      //2============================ generate div using switch looking type ====
      switch (type) {

        case 'irk-instruction-step':
          if (stepData['button-text']) {
            customDiv = '<irk-task><irk-instruction-step optional="' + disableSkip + '" id="' + customId + '" title="' + stepData.title + '" text="' + stepData.text + '" button-text="' + stepData['button-text'] + '"/> </irk-task>';
          } else {
            customDiv = '<irk-task><irk-instruction-step optional="' + disableSkip + '" id="' + customId + '" title="' + stepData.title + '" text="' + stepData.text + '" /> </irk-task>';
          }
          break;

        case 'irk-scale-question-step':
          customDiv = '<irk-task><irk-scale-question-step optional="' + disableSkip + '" id="' + customId + '" title="' + stepData.title + '" text="' + stepData.text + '" min="' + stepData.min + '" max="' + stepData.max + '" step="' + stepData.step + '" value="' + stepData.value + '" min-text="' + stepData["min-text"] + '" max-text="' + stepData["max-text"] + '" /> </irk-task>';
          break;

        case 'irk-boolean-question-step':
          customDiv = '<irk-task><irk-boolean-question-step optional="' + disableSkip + '" id="' + customId + '" title="' + stepData.title + '" text="' + stepData.text + '" true-text="' + stepData['true-text'] + '" false-text="' + stepData['false-text'] + '" true-value="' + stepData['true-value'] + '" false-value="' + stepData['false-value'] + '" /> </irk-task>';
          break;

        case 'irk-text-question-step':
          if (stepData['multiple-lines']) {
            customDiv = '<irk-task><irk-text-question-step optional="' + disableSkip + '" id="' + customId + '" title="' + stepData.title + '" text="' + stepData.text + '" multiple-lines="' + stepData['multiple-lines'] + '" placeholder="' + stepData.placeholder + '"/> </irk-task>';
          } else {
            customDiv = '<irk-task><irk-text-question-step optional="' + disableSkip + '" id="' + customId + '" title="' + stepData.title + '" text="' + stepData.text + '" placeholder="' + stepData.placeholder + '" /> </irk-task>';
          }
          break;

        case 'irk-text-choice-question-step':
          var style = '';
          if (stepData.text.toLowerCase() === 'Select only one'.toLowerCase())
            style = "single";
          else
            style = "multiple";
          var choice = '';
          for (var i = 0; i < stepData.choices.length; i++) {
            if (stepData.choices[i].detail)
              choice += '<irk-text-choice detail-text="' + stepData.choices[i].detail + '" text="' + stepData.choices[i].text + '" value="' + stepData.choices[i].value + '"></irk-text-choice>';
            else
              choice += '<irk-text-choice text="' + stepData.choices[i].text + '" value="' + stepData.choices[i].value + '"></irk-text-choice>';
          }
          customDiv = '<irk-task > <irk-text-choice-question-step optional="' + disableSkip + '" id="' + customId + '" title="' + stepData.title + '" style="' + style + '">' +
            choice + '</irk-text-choice-question-step></irk-task>';
          break;

        case 'irk-numeric-question-step':
          customDiv = '<irk-task > <irk-numeric-question-step optional="' + disableSkip + '" id="' + customId + '"  title="' + stepData.title + '" text="' + stepData.text + '" unit="' + stepData.unit + '" min="' + stepData.min + '" max="' + stepData.max + '" placeholder="' + stepData.placeholder + '" /></irk-task>';
          break;

        case 'irk-date-question-step':
          customDiv = '<irk-task > <irk-date-question-step optional="' + disableSkip + '" id="' + customId + '" title="' + stepData.title + '" text="' + stepData.text + '" /></irk-task>';
          break;

        case 'irk-time-question-step':
          customDiv = '<irk-task> <irk-time-question-step optional="' + disableSkip + '" id="' + customId + '" title="' + stepData.title + '" text="' + stepData.text + '" /></irk-task>';
          break;

        case 'irk-value-picker-question-step':
          var choice = '';
          for (var i = 0; i < stepData.choices.length; i++) {
            choice += '<irk-picker-choice text="' + stepData.choices[i].text + '" value="' + stepData.choices[i].value + '"></irk-picker-choice>';
          }
          customDiv = '<irk-task> <irk-value-picker-question-step optional="' + disableSkip + '" id="' + customId + '" title="' + stepData.title + '" text="' + stepData.text + '">' +
            choice + '</irk-value-picker-question-step></irk-task>';
          break;

        case 'irk-image-choice-question-step':
          var choice = '';
          for (var i = 0; i < stepData.choices.length; i++) {
            choice += '<irk-image-choice text="" value="' + stepData.choices[i].value + '" normal-state-image="ion-sad" selected-state-image="ion-happy-outline" ></irk-image-choice>';
          }
          customDiv = '<irk-task > <irk-image-choice-question-step optional="' + disableSkip + '" id="' + customId + '" title="' + stepData.title + '" text="' + stepData.text + '">' +
            choice + '</irk-image-choice-question-step></irk-task>';
          break;

          /*  case 'irk-image-choice-question-step':
              var choice = '';
              for (var i = 0; i < stepData.choices.length; i++) {
                var css = "";
                if (stepData.choices[i]["normal-state-image"]) {
                  var normalStateImageURL = stepData.choices[i]["normal-state-image"];
                  css = " width: 50px;height: 50px;display: block;background-image: url('" + normalStateImageURL + "');background-size:contain; background-position:50% 50%; background-repeat: no-repeat;";
                }
                //  choice += " <style type='text/css'>.redBackground{ " + css + "}</style>";
                choice += '<irk-image-choice style="' + css + '" text="" value="' + stepData.choices[i].value + '" normal-state-image="ion-sad" selected-state-image="ion-happy-outline" ></irk-image-choice>';
              }
              customDiv = '<irk-task > <irk-image-choice-question-step optional="' + disableSkip + '" id="' + customId + '" title="' + stepData.title + '" text="' + stepData.text + '">' +
                choice + '</irk-image-choice-question-step></irk-task>';
              break;

              */

        case 'irk-form-step':
          var choice = '';
          for (var i = 0; i < stepData.choices.length; i++) {
            if (stepData.choices[i].title) {
              choice += '<irk-form-item title="' + stepData.choices[i].title + '"  ></irk-form-item>';
            } else {
              choice += '<irk-form-item text="' + stepData.choices[i].text + '" type="' + stepData.choices[i].type + '" id="' + stepData.choices[i].id + '" placeholder="' + stepData.choices[i].placeholder + '"  ></irk-form-item>';
            }
          }
          customDiv = '<irk-task > <irk-form-step optional="' + disableSkip + '" id="' + customId + '" title="' + stepData.title + '" text="' + stepData.text + '">' +
            choice + '</irk-form-step></irk-task>';
          break;

        case 'instruction':
          customDiv = '<irk-task optional="' + disableSkip + '" > <irk-instruction-step  optional="' + disableSkip + '" id="' + customId + '" title="' + stepData.title + '" text="' + stepData.text + '" button-text="Get Started" image="' + stepData.image + '" footer-attach="' + stepData['footer-attach'] + '"/></irk-task>';
          break;

        case 'irk-audio-task':
          customDiv = '<irk-task optional="' + disableSkip + '" > <irk-audio-task auto-record="false" auto-complete="false"  optional="' + disableSkip + '" id="' + customId + '" duration="' + stepData.duration + '" text= "' + stepData.text + '"/></irk-task>';
          break;

      }
      return customDiv;
    };

  });

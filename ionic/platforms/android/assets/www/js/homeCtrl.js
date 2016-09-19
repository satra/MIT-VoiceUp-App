angular.module('homeCtrl', [])
  //=======Home screen controller======================
  .controller('homeCtrl', function($scope, $timeout, $rootScope, $cordovaSQLite, $ionicPopup, $ionicHistory, $controller, $ionicModal, $http, $ionicLoading, userService, databaseManager,
    dataStoreManager, profileDataManager, $cordovaEmailComposer, eligiblityDataManager, irkResults,
    $base64, $state, $location, $window, appConstants, syncDataFactory, consentDataManager, syncDataService, $q, $cordovaFileTransfer, $cordovaFile, $base64) {

    $rootScope.emailId = null;


    //==================================Select email view ==========
    $scope.openSignInChooseEmail = function() {
      $scope.transition('signIn');
    };


    if (window.Connection) {
      if (navigator.connection.type == Connection.NONE) {
        $ionicLoading.hide();
      } else {
        var uploadData = null;
        var updateData = null;
        syncDataFactory.checkDataAvailableToSync().then(function(res) {
          if (res.length > 0) {
            uploadData = res;
          }
          syncDataFactory.queryDataNeedToSyncUpdate("profile_json").then(function(syncData) {
            if (syncData) {
              if (syncData.rows.length > 0) {
                updateData = syncData.rows;
              }
            }
            if (uploadData) {
              $ionicLoading.show({
                template: appConstants.syncNewDataMessage
              });
              syncDataFactory.startSyncServiesTouploadData(res).then(function(res) {
                $ionicLoading.hide();
                if (updateData) {
                  $scope.startUpdateSync(updateData);
                }
              }, function(error) {
                $ionicLoading.hide();
                if (updateData) {
                  $scope.startUpdateSync(updateData);
                }
              });
            } else {
              if (updateData) {
                $scope.startUpdateSync(updateData);
              }
            }
          });
        });
      }
    }

    $scope.startUpdateSync = function(updateData) {
      $ionicLoading.show({
        template: appConstants.syncUpdateDataMessage
      });
      syncDataFactory.startSyncServiesToUpdateData(updateData).then(function(res) {
        $ionicLoading.hide();
      }, function(error) {
        $ionicLoading.hide();
      });
    }


    // learn controller parameters
    $scope.homeCalss = "icon icon ion-close-round";
    $scope.showCloseButton = true;

    // label for email(ios)/download(android)
    if (ionic.Platform.isAndroid()) {
      $scope.emailOrDownloadConsentLabel = "Download Consent Document";
    } else {
      $scope.emailOrDownloadConsentLabel = "Email Consent Document";
    }

    $scope.fileSystemSuccessToAccess = function(fileSystem) {
      var directoryEntry = fileSystem.root; // to get root path of directory
      var rootdir = fileSystem.root;
      $scope.fp = rootdir.toURL(); // Returns Fulpath of local directory
      var deferred = $q.defer();
      directoryEntry.getDirectory('appimages', {
        create: true,
        exclusive: false
      }, $scope.onDirectorySuccess, $scope.onDirectoryFail); // creating folder in sdcard
    }

    $scope.fileSystemFailToAccess = function(error) {
      //Error while creating directory
      console.log("Unable to create new directory: " + error.code);
      $scope.refreshSurveyAndTaskTable();
    }

    $scope.onDirectoryFail = function(error) {
      // Error while creating directory
      console.log("Unable to create new directory: " + error.code);
      $scope.refreshSurveyAndTaskTable();
    }

    $scope.onDirectorySuccess = function(parent) {
      // Directory created successfuly
      $scope.refreshSurveyAndTaskTable();
    }

    databaseManager.checkDatabaseExists().then(function(res) {
      if (res == 5) {
        //call a method and read from local json and create schema
        userService.getConfigJson().then(function(response) {

          var eligibility = JSON.stringify(response.eligibility);
          var profile = JSON.stringify(response.profile);
          var consent_screens = JSON.stringify(response.consent);
          var completeJson = JSON.stringify(response);
          $scope.surveyJson = response.surveys;
          $scope.tasksJson = response.tasks;
          var today = new Date();

          databaseManager.createAppContentTable(response.version, response.URL, response.diffURL, eligibility, profile, consent_screens, completeJson).then(function(resp) {
            window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, $scope.fileSystemSuccessToAccess, $scope.fileSystemFailToAccess);
          });

          databaseManager.createSurveyTempTable().then(function(resp) {
            console.log('createSurveyTempTable  ' + resp);
          });

          databaseManager.createSurveyQuestionExpiryTable().then(function(resp) {
            console.log('createSurveyQuestionTable  ' + resp);
          });

          databaseManager.createSyncServiceTable().then(function(resp) {
            console.log('createSynchTable  ' + resp);
          });

          databaseManager.createUserItemMappingTable().then(function(resp) {
            console.log('createUserItemMappingTable  ' + resp);
          });

          databaseManager.createUserResultTable().then(function(resp) {
            console.log('createUserResultTable  ' + resp);
          });

        });
      }
    });

    $scope.refreshSurveyAndTaskTable = function() {
      var surveyJson = $scope.surveyJson;
      var tasksJson = $scope.tasksJson;
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
              databaseManager.createSurveysTable(day, month, title, id, skippable, tasks).then(function(respw) {
                console.log('insert survey ' + respw);
              });
            }
          }
        }
      }
      for (var task in tasksJson) {
        if (tasksJson.hasOwnProperty(task)) {
          var timeLimit = tasksJson[task].timelimit;
          var steps = JSON.stringify(tasksJson[task].steps);
          if (timeLimit === undefined || timeLimit === null) {
            timeLimit = '';
          }
          databaseManager.createTasksTable(task, steps, timeLimit).then(function(resp) {
            console.log('createTasksTable  ' + resp);
          });
        }
      }
      databaseManager.createSurveyTempTable().then(function(resp) {
        console.log('createSurveyTempTable  ' + resp);
      });

      databaseManager.createSurveyQuestionExpiryTable().then(function(resp) {
        console.log('createSurveyQuestionExpiryTable  ' + resp);
      });

    }

    //openOnlineResource
    $scope.openOnlineResource = function() {
      $ionicModal.fromTemplateUrl('templates/modal-online-resource.html', {
        scope: $scope,
        animation: 'slide-in-up',
        hardwareBackButtonClose: false,
      }).then(function(modal) {
        $scope.modal = modal;
        $scope.modal.show();
      });
    };


    $scope.go = function() {
      $scope.modal.remove();
    };

    $scope.joinStudy = function() {
      $ionicHistory.clearCache().then(function() {
        $state.transitionTo('eligiblityTest');
      });
    };

    $scope.GoBack = function() {
      $scope.modal.remove();
    };

    $scope.sendConsentDoc = function() {
      if (ionic.Platform.isAndroid()) {
        if (window.Connection) {
          if (navigator.connection.type == Connection.NONE) {
            $ionicLoading.hide();
            $ionicPopup.alert({
              title: appConstants.checkInternetConnectionMessageTitle,
              template: appConstants.checkInternetConnectionMessage
            });
          } else {
            $ionicLoading.show();
            var assetURL = encodeURI(appConstants.consentFileURL);
            var DEV_PATH = cordova.file.externalRootDirectory + appConstants.consentFileName;
            window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
            window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem) {
              var entry = fileSystem.root;
              entry.getDirectory(appConstants.appFolderName, { // Give your directory name instead of Directory_Name
                create: true,
                exclusive: false
              }, onSuccess, onFail);
            }, null);
            // onSuccess function for creating directory
            function onSuccess(parent) {
              dirPath = parent.nativeURL;
              var DEV_PATH = parent.nativeURL + appConstants.consentFileName;
              var fileTransfer = new FileTransfer();
              fileTransfer.download(assetURL, DEV_PATH,
                function(entry) {
                  $ionicLoading.hide();
                  $ionicPopup.alert({
                    title: appConstants.downloadConsentMessageTitle,
                    template: appConstants.downloadConsentMessage
                  });
                },
                function(err) {
                  $ionicPopup.alert({
                    title: appConstants.downloadConsentMessageTitle,
                    template: err.exception
                  });
                  $ionicLoading.hide();
                }, true);
            }

            // onFail function for creating directory
            function onFail(error) {
              $ionicLoading.hide();
              console.log(error);
            }
          }
        }
      } else {
        var email = {
          attachments: [
            appConstants.localConsentFilePath
          ],
          subject: appConstants.consentEmailSubjectName,
          isHtml: true
        };
        $cordovaEmailComposer.isAvailable().then(function() {
          $cordovaEmailComposer.open(email).then(null, function() {
            console.log('email ');
          });
        }, function() {
          // not available
          console.log('email not available');
        });
      }
    }



    //from Sign in screen to  eligiblityTest
    $scope.showEligibilityTestView = function() {
      $scope.modal.remove();
      $ionicHistory.clearCache().then(function() {
        $state.transitionTo('eligiblityTest');
      });
    };

    //error handler dailog
    $scope.callAlertDailog = function(message) {
      $ionicPopup.alert({
        title: 'Error',
        template: message
      });
    };

    //on done clear states and travel to next screen
    $scope.transition = function(state) {
      $ionicHistory.clearCache().then(function() {
        $state.transitionTo(state);
      });
    };

  });

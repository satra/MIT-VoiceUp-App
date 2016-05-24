angular.module('surveyDataManager', [])
.factory('surveyDataManager', function($http,$cordovaSQLite,userService,$q,databaseManager) {
  return {
    //====================================Read =======================
  getSurveyListForToday : function(){
      var deferred = $q.defer();
      var db = databaseManager.getConnectionObject();
      var query = "SELECT surveyJson FROM Surveys";
      var consent =  $cordovaSQLite.execute(db, query).then(function(res) {
              var len = res.rows.length;
              for (var i=0; i<len; i++){
                 consent = JSON.parse(res.rows.item(i).surveyJson);
                }
                return consent;
                deferred.resolve(consent);
            }, function (err) {
          });
     deferred.resolve(consent);
     return deferred.promise;
   },

   getTaskListJson : function(){
     var deferred = $q.defer();
     var db = databaseManager.getConnectionObject();
     var query = "SELECT tasksJson FROM Tasks";
     var consent =  $cordovaSQLite.execute(db, query).then(function(res) {
             var len = res.rows.length;
             for (var i=0; i<len; i++){
                consent = JSON.parse(res.rows.item(i).tasksJson);
               }
               return consent;
               //resolve here
               deferred.resolve(consent);
           }, function (err) {
         });
    deferred.resolve(consent);
    return deferred.promise;
    },

    checkSurveyExistsInTempTableForToday : function(date,userId){
      var deferred = $q.defer();
      var db = databaseManager.getConnectionObject();
      var query = "SELECT * FROM SurveyTemp WHERE creationDate = '"+date+"' AND userId = '"+userId+"' ";
      var tempData =  $cordovaSQLite.execute(db, query).then(function(res) {
              if (res.rows.length > 0 ) {
                return res.rows;
              }else {
                return false;
              }
              //resolve here
              deferred.resolve(tempData);
            }, function (err) {
              return err
          });
     deferred.resolve(tempData);
     return deferred.promise;
   },

   getTaskListByUserId : function  (userId,todayDate){
     var deferred = $q.defer();
     var db = databaseManager.getConnectionObject();
     var insert =  $cordovaSQLite.execute(db, "SELECT questionId,isSkipped FROM SurveyTemp WHERE creationDate = '"+todayDate+"' AND userId = '"+userId+"' ")
                      .then(function(res) {
                          return res ;
                      }, function (err) {
                  });
    deferred.resolve(insert);
    return deferred.promise;
  },

  getUnansweredQuestionsLessThanToDate : function  (userId,todayDate){
    var deferred = $q.defer();
    var db = databaseManager.getConnectionObject();
    var insert =  $cordovaSQLite.execute(db, "SELECT questionId FROM SurveyQuestionExpiry WHERE creationDate < '"+todayDate+"' AND expiryDate >= '"+todayDate+"' AND userId = '"+userId+"' ")
                     .then(function(res) {
                         return res ;
                     }, function (err) {
                 });
   deferred.resolve(insert);
   return deferred.promise;
 },

 addSurveyResultToDb : function  (userId,childresult){
     var deferred = $q.defer();
     var resultJson = JSON.stringify(childresult);
     var db = databaseManager.getConnectionObject();
     $cordovaSQLite.execute(db, 'CREATE TABLE IF NOT EXISTS SurveyResult(id INTEGER PRIMARY KEY AUTOINCREMENT, userId TEXT, resultJson TEXT,creationDate DATETIME DEFAULT CURRENT_TIMESTAMP)');
     var insert =  $cordovaSQLite.execute(db, 'INSERT INTO SurveyResult (userId, resultJson,creationDate) VALUES (?,?,?)', [userId,resultJson,new Date()])
                      .then(function(res) {
                          return res.insertId ;
                      }, function (err) {
                  });
    deferred.resolve(insert);
    return deferred.promise;
  },

// ----------------update queries ================================
  updateSurveyResultToTempTable: function  (userId,questionId,isSkipped){
      var deferred = $q.defer();
      var db = databaseManager.getConnectionObject();
      var update = '';
      var query = "UPDATE SurveyTemp SET isSkipped = '"+isSkipped+"' WHERE questionId = ? AND userId = ?";
      $cordovaSQLite.execute(db, query , [questionId,userId] )
                     .then(function(res) {
                          if (isSkipped=='NO') {
                            var query = "DELETE FROM SurveyQuestionExpiry WHERE questionId = ? AND userId = ?";
                            var deleteData =  $cordovaSQLite.execute(db, query , [questionId,userId] )
                                           .then(function(res) {
                                                 return res;
                                             }, function (err) {
                               });
                          }
                      }, function (err) {
                   });
     deferred.resolve(update);
     return deferred.promise;
   },

  addSurveyToUserForToday : function(userId,surveyId,questionId,creationDate){
        var deferred = $q.defer();
        var db = databaseManager.getConnectionObject();
        var insert =  $cordovaSQLite.execute(db, 'INSERT INTO SurveyTemp (userId,surveyId, questionId, isSkipped, creationDate) VALUES (?,?,?,?,?)', [userId,surveyId,questionId,'NONE',creationDate])
                         .then(function(res) {
                             return res.insertId ;
                         }, function (err) {
                     });
       deferred.resolve(insert);
       return deferred.promise;
     },

     addThisSurveyToExpiry : function(userId,surveyId,questionId,creationDate,expiryDate){
       var deferred = $q.defer();
       var db = databaseManager.getConnectionObject();
       var insert =  $cordovaSQLite.execute(db, 'INSERT INTO SurveyQuestionExpiry (userId,surveyId, questionId,creationDate,expiryDate) VALUES (?,?,?,?,?)', [userId,surveyId,questionId,creationDate,expiryDate])
                        .then(function(res) {
                            return res.insertId ;
                        }, function (err) {
                    });
      deferred.resolve(insert);
      return deferred.promise;
      },
// ====================================================Delete queries =============
   clearExistingTaskListFromTempTable : function(userId){
     var deferred = $q.defer();
     var db = databaseManager.getConnectionObject();
     var query = "DELETE FROM SurveyTemp WHERE userId = ? " ;
     var deleteData = $cordovaSQLite.execute(db, query , [userId] )
                      .then(function(res) {
                          return res ;
                      }, function (err) {
                  });
    deferred.resolve(deleteData);
    return deferred.promise;
  },
   removeQuestionFromExpiryTable : function(userId,questionId){
       var deferred = $q.defer();
       var db = databaseManager.getConnectionObject();
       var query = "DELETE FROM SurveyQuestionExpiry WHERE questionId = ? AND userId = ?";
       var deleteData =  $cordovaSQLite.execute(db, query , [questionId,userId] )
                      .then(function(res) {
                            return res;
                        }, function (err) {
                    });
      deferred.resolve(deleteData);
      return deferred.promise;
   }
  }
});

angular.module('surveyDataManager', [])
.factory('surveyDataManager', function($http,$cordovaSQLite,$q,databaseManager) {
  return {
    //====================================Read =======================
  getSurveyListForToday : function(){
      var deferred = $q.defer();
      var db = databaseManager.getConnectionObject();
      var today = new Date() ;
      var day = today.getDate() ;
      var month = today.getMonth()+1 ;
    //  var customDate = (today.getDate())+'-'+(today.getMonth()+1)+'-'+today.getFullYear() ;

      var query = "SELECT * FROM Surveys WHERE (day='"+day+"' AND month='"+month+"') OR (day='"+day+"' AND month='*') OR  (day='*' AND month='"+month+"') OR (day='*' AND month='*') ";
      var consent =  $cordovaSQLite.execute(db, query).then(function(res) {
              var len = res.rows.length;
              var itemsColl = [];
               for (var i=0; i<len; i++){
                  itemsColl[i] = res.rows.item(i);
                 }
                return itemsColl ;
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
     var query = "SELECT questionId,isSkipped,skippable FROM SurveyTemp WHERE creationDate = '"+todayDate+"' AND userId = '"+userId+"' ";
     var insert =  $cordovaSQLite.execute(db,query)
                      .then(function(res) {
                          console.log(res);
                          return res ;
                      }, function (err) {
                  });
    deferred.resolve(insert);
    return deferred.promise;
  },
  getTaskListBySurveyIDAndDate : function  (surveyId,todayDate){
    var deferred = $q.defer();
    var db = databaseManager.getConnectionObject();
    var query = "SELECT tasks,skippable, FROM SurveyTemp WHERE creationDate = '"+todayDate+"' AND userId = '"+userId+"' ";
    var insert =  $cordovaSQLite.execute(db,query)
                     .then(function(res) {
                         console.log(res);
                         return res ;
                     }, function (err) {
                 });
   deferred.resolve(insert);
   return deferred.promise;
 },
 getSurveyDates : function(){
   var deferred = $q.defer();
   var db = databaseManager.getConnectionObject();
  // var query = "SELECT date,surveyId,title FROM Surveys " ;
   var query = "SELECT creationDate FROM Results " ;
   var surveyData = $cordovaSQLite.execute(db, query)
                    .then(function(res) {
                      surveyData = res.rows ;
                      return surveyData;
                    }, function (err) {
                });
   deferred.resolve(surveyData);
   return deferred.promise;
 },
  getSurveyTempRowByInsertId :  function  (insertId){
    var deferred = $q.defer();
    var db = databaseManager.getConnectionObject();
    var query = "SELECT surveyId,questionId,isSkipped,skippable FROM SurveyTemp WHERE id = '"+insertId+"' ";
    console.log(query);
    var insert =  $cordovaSQLite.execute(db,query)
                     .then(function(res) {
                         if(res.rows.length > 0){
                           return res.rows.item(0) ;
                         }
                     }, function (err) {
                 });
   deferred.resolve(insert);
   return deferred.promise;
  },
getTaskListByquestionId : function  (questionId){
    var deferred = $q.defer();
    var db = databaseManager.getConnectionObject();
    var query = "SELECT steps,timeLimit FROM Tasks WHERE taskId = '"+questionId+"' " ;
    var insert =  $cordovaSQLite.execute(db, query)
                     .then(function(res) {
                       if(res.rows.length > 0){
                         return res.rows.item(0).steps ;
                       }
                     }, function (err) {
                 });
   deferred.resolve(insert);
   return deferred.promise;
 },

 getTaskListForquestion : function  (questionId){
     var deferred = $q.defer();
     var db = databaseManager.getConnectionObject();
     var query = "SELECT taskId,steps,timeLimit FROM Tasks WHERE taskId = '"+questionId+"' " ;
     var insert =  $cordovaSQLite.execute(db, query)
                      .then(function(res) {
                        if(res.rows.length > 0){
                          return res.rows.item(0) ;
                        }
                      }, function (err) {
                  });
    deferred.resolve(insert);
    return deferred.promise;
  },


getQuestionExpiry : function  (questionId){
  var deferred = $q.defer();
  var db = databaseManager.getConnectionObject();
  var insert =  $cordovaSQLite.execute(db, "SELECT timeLimit FROM Tasks WHERE taskId = '"+questionId+"' ")
                   .then(function(res) {
                     if(res.rows.length > 0){
                       return res.rows.item(0).timeLimit ;
                     }else {
                       return null ;
                       }
                   }, function (err) {
               });
 deferred.resolve(insert);
 return deferred.promise;
},
  getUnansweredQuestionsLessThanToDate : function  (userId,todayDate){
    var deferred = $q.defer();
    var db = databaseManager.getConnectionObject();
    var insert =  $cordovaSQLite.execute(db, "SELECT questionId,skippable FROM SurveyQuestionExpiry WHERE creationDate < '"+todayDate+"' AND expiryDate >= '"+todayDate+"' AND userId = '"+userId+"' ")
                     .then(function(res) {
                          var len = res.rows.length;
                          var itemsColl = [];
                          for (var i=0; i<len; i++){
                             itemsColl[i] = res.rows.item(i);
                            }
                           return itemsColl ;
                     }, function (err) {
                 });
   deferred.resolve(insert);
   return deferred.promise;
 },

 addResultToDb : function  (userId,childresult,resultType){
     var deferred = $q.defer();
     var resultJson = JSON.stringify(childresult);
     var db = databaseManager.getConnectionObject();
     $cordovaSQLite.execute(db, 'CREATE TABLE IF NOT EXISTS Results(id INTEGER PRIMARY KEY AUTOINCREMENT, userId TEXT,resultType TEXT, resultJson TEXT,creationDate DATETIME DEFAULT CURRENT_TIMESTAMP)');
     var insert =  $cordovaSQLite.execute(db, 'INSERT INTO Results(userId, resultType,resultJson,creationDate) VALUES (?,?,?,?)', [userId,resultType,resultJson,new Date()])
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

  addSurveyToUserForToday : function(userId,surveyId,questionId,creationDate,skippable){
        var deferred = $q.defer();
        var db = databaseManager.getConnectionObject();
        var insert =  $cordovaSQLite.execute(db, 'INSERT INTO SurveyTemp (userId,surveyId, questionId, isSkipped, creationDate,skippable) VALUES (?,?,?,?,?,?)', [userId,surveyId,questionId,'NONE',creationDate,skippable])
                         .then(function(res) {
                             return res.insertId ;
                         }, function (err) {
                     });
       deferred.resolve(insert);
       return deferred.promise;
     },
     addThisSurveyToExpiry : function(userId,surveyId,questionId,creationDate,expiryDate,skippable){
       var deferred = $q.defer();
       var db = databaseManager.getConnectionObject();
       var insert =  $cordovaSQLite.execute(db, 'INSERT INTO SurveyQuestionExpiry (userId,surveyId, questionId,creationDate,expiryDate,skippable) VALUES (?,?,?,?,?,?)', [userId,surveyId,questionId,creationDate,expiryDate,skippable])
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
   },

  removeUserSurveyResults :  function (userId){
       var deferred = $q.defer();
       var db = databaseManager.getConnectionObject();
       var query = "DELETE FROM Results WHERE userId = ? " ;
       var deleteData = $cordovaSQLite.execute(db, query , [userId] )
                        .then(function(res) {
                         deferred.resolve(res);
                        }, function (err) {
                    });
       return deferred.promise;
     },
     removeUserSurveyFromTempTable :  function (userId){
      var deferred = $q.defer();
      var db = databaseManager.getConnectionObject();
      var query = "DELETE FROM SurveyTemp WHERE userId = ? " ;
      var deleteData = $cordovaSQLite.execute(db, query , [userId] )
                       .then(function(res) {
                        deferred.resolve(res);
                       }, function (err) {
                   });
      return deferred.promise;
    },
    removeUserSurveyQuestionExpiry :  function (userId){
     var deferred = $q.defer();
     var db = databaseManager.getConnectionObject();
     var query = "DELETE FROM SurveyQuestionExpiry WHERE userId = ? " ;
     var deleteData = $cordovaSQLite.execute(db, query , [userId] )
                      .then(function(res) {
                       deferred.resolve(res);
                      }, function (err) {
                  });
     return deferred.promise;
   }

  }
});

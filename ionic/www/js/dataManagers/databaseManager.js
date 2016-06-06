angular.module('databaseManager', [])
.factory('databaseManager', function($http,$cordovaSQLite,$q) {
  //open connection
  return {
    getConnectionObject : function(){
    return window.openDatabase("voiceup", "2.0", "Cordova DB", 2000000);
    },
    checkDatabaseExists: function(){
        var deferred = $q.defer();
        var query = "SELECT * FROM AppContent";
        var db = this.getConnectionObject();
        // var query = "DROP TABLE Survey";
        var  dataReturn =  $cordovaSQLite.execute(db, query)
        .then(function(res) {
        dataReturn = res.rows;
        return dataReturn ;
        }, function (err) {
            if(err.code == 5){
                   dataReturn = err.code;
                   return dataReturn ;
            }else {
                     dataReturn = err;
                     deferred.reject(err);
            }
      });
      deferred.resolve(dataReturn);
      return deferred.promise;
    },
     createAppContentTable : function(version,URL,eligibility,profile,consent_screens,completeJson){
       var deferred = $q.defer();
       var db = this.getConnectionObject();
       $cordovaSQLite.execute(db, 'CREATE TABLE IF NOT EXISTS AppContent(id INTEGER PRIMARY KEY AUTOINCREMENT, version TEXT, url TEXT,profile TEXT, eligibility TEXT, consent TEXT,completeJson TEXT)');
       var  dataReturn =  $cordovaSQLite.execute(db, 'INSERT INTO AppContent (version, url, profile, eligibility, consent, completeJson) VALUES (?,?,?,?,?,?)', [version, URL , profile, eligibility,consent_screens,completeJson])
          .then(function(res) {
              return res.insertId;
          });
      deferred.resolve(dataReturn);
      return deferred.promise;
     },
       createSurveysTable : function(date,title,id,skippable,tasks){
         var deferred = $q.defer();
         var db = this.getConnectionObject();
         $cordovaSQLite.execute(db, 'CREATE TABLE IF NOT EXISTS Surveys (id INTEGER PRIMARY KEY AUTOINCREMENT,date TEXT,title TEXT,surveyId TEXT,skippable TEXT,tasks TEXT)');
         var  dataReturn = $cordovaSQLite.execute(db, 'INSERT INTO Surveys (date,title,surveyId,skippable,tasks) VALUES (?,?,?,?,?)', [date,title,id,skippable,tasks])
         .then(function(res) {
             return res.insertId;
         });
         deferred.resolve(dataReturn);
         return deferred.promise;
       },
     createTasksTable : function(taskId,steps){
       var deferred = $q.defer();
       var db = this.getConnectionObject();
       $cordovaSQLite.execute(db, 'CREATE TABLE IF NOT EXISTS Tasks (id INTEGER PRIMARY KEY AUTOINCREMENT,taskId TEXT,steps TEXT)');
       var  dataReturn = $cordovaSQLite.execute(db, 'INSERT INTO Tasks (taskId,steps) VALUES (?,?)', [taskId,steps])
       .then(function(res) {
           return res.insertId;
       });
       deferred.resolve(dataReturn);
       return deferred.promise;
     },
     createSurveyTempTable : function(){
       var deferred = $q.defer();
       var db = this.getConnectionObject();
       var  dataReturn = $cordovaSQLite.execute(db, 'CREATE TABLE IF NOT EXISTS SurveyTemp (id INTEGER PRIMARY KEY AUTOINCREMENT,userId TEXT,surveyId TEXT,questionId TEXT,isSkipped TEXT,creationDate TEXT)');
       deferred.resolve(dataReturn);
       return deferred.promise;
     },
     createSurveyQuestionExpiryTable : function(){
       var deferred = $q.defer();
       var db = this.getConnectionObject();
       var  dataReturn = $cordovaSQLite.execute(db, 'CREATE TABLE IF NOT EXISTS SurveyQuestionExpiry (id INTEGER PRIMARY KEY AUTOINCREMENT,userId TEXT,surveyId TEXT,questionId TEXT,creationDate DATETIME,expiryDate DATETIME)');
       deferred.resolve(dataReturn);
       return deferred.promise;
     }
  }
});

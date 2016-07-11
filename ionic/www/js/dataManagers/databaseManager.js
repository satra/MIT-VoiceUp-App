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
        //var query = "DROP TABLE Surveys";
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
    createSurveysTable : function(day,month,title,id,skippable,tasks){
         var deferred = $q.defer();
         var db = this.getConnectionObject();
         $cordovaSQLite.execute(db, 'CREATE TABLE IF NOT EXISTS Surveys (id INTEGER PRIMARY KEY AUTOINCREMENT,day TEXT,month TEXT,title TEXT,surveyId TEXT,skippable TEXT,tasks TEXT)');
         var  dataReturn = $cordovaSQLite.execute(db, 'INSERT INTO Surveys (day,month,title,surveyId,skippable,tasks) VALUES (?,?,?,?,?,?)', [day,month,title,id,skippable,tasks])
         .then(function(res) {
             return res.insertId;
         });
         deferred.resolve(dataReturn);
         return deferred.promise;
     },
     createTasksTable : function(taskId,steps,timeLimit){
       var deferred = $q.defer();
       var db = this.getConnectionObject();
       $cordovaSQLite.execute(db, 'CREATE TABLE IF NOT EXISTS Tasks (id INTEGER PRIMARY KEY AUTOINCREMENT,taskId TEXT,steps TEXT,timeLimit TEXT)');
       var  dataReturn = $cordovaSQLite.execute(db, 'INSERT INTO Tasks (taskId,steps,timeLimit) VALUES (?,?,?)', [taskId,steps,timeLimit])
       .then(function(res) {
           return res.insertId;
       });
       deferred.resolve(dataReturn);
       return deferred.promise;
     },
     createSurveyTempTable : function(){
       var deferred = $q.defer();
       var db = this.getConnectionObject();
       var  dataReturn = $cordovaSQLite.execute(db, 'CREATE TABLE IF NOT EXISTS SurveyTemp (id INTEGER PRIMARY KEY AUTOINCREMENT,userId TEXT,surveyId TEXT,questionId TEXT,isSkipped TEXT,creationDate TEXT,skippable TEXT)');
       deferred.resolve(dataReturn);
       return deferred.promise;
     },
     createSurveyQuestionExpiryTable : function(){
       var deferred = $q.defer();
       var db = this.getConnectionObject();
       var  dataReturn = $cordovaSQLite.execute(db, 'CREATE TABLE IF NOT EXISTS SurveyQuestionExpiry (id INTEGER PRIMARY KEY AUTOINCREMENT,userId TEXT,surveyId TEXT,questionId TEXT,creationDate DATETIME,expiryDate DATETIME,skippable TEXT)');
       deferred.resolve(dataReturn);
       return deferred.promise;
     },
     createSyncServiceTable : function(){
       var deferred = $q.defer();
       var db = this.getConnectionObject();
       var  dataReturn = $cordovaSQLite.execute(db, 'CREATE TABLE IF NOT EXISTS SyncData (id INTEGER PRIMARY KEY AUTOINCREMENT,globalId TEXT,userId TEXT,syncItem DATETIME,syncData TEXT,folderId TEXT,itemId TEXT,creationDateTime DATETIME)');
       deferred.resolve(dataReturn);
       return deferred.promise;
    },
    createUserItemMappingTable : function(){
      var deferred = $q.defer();
      var db = this.getConnectionObject();
      var  dataReturn = $cordovaSQLite.execute(db, 'CREATE TABLE IF NOT EXISTS userItemMappingTable (id INTEGER PRIMARY KEY AUTOINCREMENT,globalId TEXT,localUserId TEXT,syncItemName TEXT,syncItemId TEXT,creationDateTime DATETIME)');
      deferred.resolve(dataReturn);
      return deferred.promise;
    },
    createUserResultTable : function(){
      var deferred = $q.defer();
      var db = this.getConnectionObject();
      var  dataReturn = $cordovaSQLite.execute(db, 'CREATE TABLE IF NOT EXISTS resultsToDisplay (id INTEGER PRIMARY KEY AUTOINCREMENT,authToken TEXT,localUserId TEXT,resultData TEXT,creationDateTime DATETIME)');
      deferred.resolve(dataReturn);
      return deferred.promise;
    }

  }
});

angular.module('databaseService', [])
.factory('databaseService', function($http,$cordovaSQLite,userService,$q) {
  //open connection
//  var db = window.openDatabase("voiceup", "2.0", "Cardova DB", 1000000);
  return {
    getConnectionObject : function(){
      return window.openDatabase("voiceup", "2.0", "Cardova DB", 1000000);
    },
    createLocalDatabaseSchema: function(){
        var query = "SELECT * FROM AppContent";
        var db = this.getConnectionObject();
        //var query = "DROP TABLE AppContent";
        $cordovaSQLite.execute(db, query)
            .then(function(res) {
            }, function (err) {
                    if(err.code == 5){
                     //call a method and read from local json and create schema
                     userService.getConfigJson().then(function(response){
                       var eligibility = JSON.stringify(response.eligibility);
                       var profile = JSON.stringify(response.profile);
                       var consent_screens = JSON.stringify(response.consent_screens);
                                    $cordovaSQLite.execute(db, 'CREATE TABLE IF NOT EXISTS AppContent(id INTEGER PRIMARY KEY AUTOINCREMENT, version TEXT, url TEXT,profile TEXT, eligibility TEXT, consent TEXT,completeJson TEXT)');
                                    $cordovaSQLite.execute(db, 'INSERT INTO AppContent (version, url, profile, eligibility, consent, completeJson) VALUES (?,?,?,?,?,?)', [response.version, response.URL, profile, eligibility,consent_screens,response])
                                         .then(function(res) {
                                                            console.log("insertId: " + res.insertId);
                                                   }, function (err) {
                                                           console.error(err);
                                                   });
                        });
                    }
          });
       },
       getEligibilityQuestions: function(){
                var deferred = $q.defer();
                var eligiblity = null;
                var db = this.getConnectionObject();
                var query = "SELECT eligibility FROM AppContent";
                var eligiblity =  $cordovaSQLite.execute(db, query).then(function(res) {
                        var len = res.rows.length;
                        for (var i=0; i<len; i++){
                           eligiblity = JSON.parse(res.rows.item(i).eligibility);
                          }
                          return eligiblity;
                          //resolve here
                          deferred.resolve(eligiblity);
                      }, function (err) {
                    });
               deferred.resolve(eligiblity);
               return deferred.promise;
          }
    }
});

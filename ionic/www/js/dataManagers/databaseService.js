angular.module('databaseService', [])
.factory('databaseService', function($http,$cordovaSQLite,userService,$q) {
  //open connection
  return {
    getConnectionObject : function(){
     return window.openDatabase("voiceup", "2.0", "Cardova DB", 1000000);
    // return $cordovaSQLite.openDB({name:"voiceup.db",iosDatabaseLocation:"Library"});//, "2.0", "Cardova DB", 1000000);
    },
    createLocalDatabaseSchema: function(){
        var query = "SELECT * FROM AppContent";
        var db = this.getConnectionObject();
        //var query = "DROP TABLE AppContent";
        $cordovaSQLite.execute(db, query)
            .then(function(res) {
              //on success
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
       }
    }
});

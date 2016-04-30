angular.module('profileDataManager', [])
.factory('profileDataManager', function($http,$cordovaSQLite,$q,databaseService) {

  //open connection
  return {
       getUserProfileFields: function(){
                var deferred = $q.defer();
                var db = databaseService.getConnectionObject();
                var query = "SELECT profile FROM AppContent";
                var profile =  $cordovaSQLite.execute(db, query).then(function(res) {
                        var len = res.rows.length;
                        for (var i=0; i<len; i++){
                           profile = JSON.parse(res.rows.item(i).profile);
                          }
                          return profile;
                          //resolve here
                          deferred.resolve(profile);
                      }, function (err) {
                    });
               deferred.resolve(profile);
               return deferred.promise;
          },

     createUserProfile : function(jsondata,emailId){
           var deferred = $q.defer();
           var db = databaseService.getConnectionObject();
           var profileJson = JSON.stringify(jsondata);
           var create = $cordovaSQLite.execute(db, 'CREATE TABLE IF NOT EXISTS User(id INTEGER PRIMARY KEY AUTOINCREMENT, ceratedDate TEXT, emailId TEXT,profileJson TEXT, updatedDate TEXT, userId TEXT,gardleId TEXT)');
           var insert = $cordovaSQLite.execute(db, 'INSERT INTO User (ceratedDate, emailId, profileJson, updatedDate, userId,gardleId) VALUES (?,?,?,?,?,?)', [new Date(),emailId,profileJson,new Date(),'btc123',''])
                        .then(function(res) {
                                       console.log("insertId: " + res.insertId);
                                       return res.insertId;
                                       deferred.resolve(insert);
                              }, function (err) {
                                      console.error(err);
                    });

          deferred.resolve(insert);
          return deferred.promise;
        }
    }
});

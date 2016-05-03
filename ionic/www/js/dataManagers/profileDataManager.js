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

   getUserUpdateProfile : function(emailId){
          console.log(emailId);
          var deferred = $q.defer();
          var db = databaseService.getConnectionObject();
          var query = "SELECT profileJson FROM user WHERE emailId ='"+emailId+"'";
          var profile =  $cordovaSQLite.execute(db, query).then(function(res) {
                  var len = res.rows.length;
                  for (var i=0; i<len; i++){
                     profile = JSON.parse(res.rows.item(i).profileJson);
                    }
                    return profile;
                    //resolve here
                    deferred.resolve(profile);
                }, function (err) {
              });
         deferred.resolve(profile);
         return deferred.promise;
          },
     checkUserExistsByEmail : function(emailId){
           var deferred = $q.defer();
           var db = databaseService.getConnectionObject();
           var create = $cordovaSQLite.execute(db, 'CREATE TABLE IF NOT EXISTS User(id INTEGER PRIMARY KEY AUTOINCREMENT, ceratedDate TEXT, emailId TEXT,profileJson TEXT, updatedDate TEXT, userId TEXT,gardleId TEXT)');
           //chek the email ID exists
           var query = "SELECT userId FROM User WHERE emailId ='"+emailId+"'";
           var insert =  $cordovaSQLite.execute(db, query).then(function(res) {
                  if(res.rows.length > 0){
                    console.log('user Id already exists ');
                    return true ;
                  }else {
                    // user doesnt exists create new user
                    return false ;
                    }
                 }, function (err) {
               });
           deferred.resolve(insert);
           return deferred.promise;
        },

   createNewUser : function(profileJson,emailId,authToken){
         var deferred = $q.defer();
         var profileJson = JSON.stringify(profileJson);
         console.log(profileJson);
         var db = databaseService.getConnectionObject();
         var create = $cordovaSQLite.execute(db, 'CREATE TABLE IF NOT EXISTS User(id INTEGER PRIMARY KEY AUTOINCREMENT, ceratedDate TEXT, emailId TEXT,profileJson TEXT, updatedDate TEXT, userId TEXT,gardleId TEXT)');
         //chek the email ID exists
         var insert =  $cordovaSQLite.execute(db, 'INSERT INTO User (ceratedDate, emailId, profileJson, updatedDate, userId,gardleId) VALUES (?,?,?,?,?,?)', [new Date(),emailId,profileJson,new Date(),'btc123',authToken])
                          .then(function(res) {
                              return res.insertId ;
                          }, function (err) {
                              console.error(err);
                      });
         deferred.resolve(insert);
         return deferred.promise;
      },

      updateUserByEmailId : function(profileJson,emailId){
            var deferred = $q.defer();
            var profileJson = JSON.stringify(profileJson);
            var db = databaseService.getConnectionObject();
            var query = "UPDATE User SET updatedDate = '"+new Date()+"', profileJson = '"+profileJson+"'  WHERE emailId = ?";
            var update =  $cordovaSQLite.execute(db, query , [emailId] )
                             .then(function(res) {
                                 return res.rowsAffected ;
                             }, function (err) {
                                 console.error(err);
                         });
            deferred.resolve(update);
            return deferred.promise;
         },
      updateUserAuthToken:function(emailId,token){
          var deferred = $q.defer();
          var db = databaseService.getConnectionObject();
          var query = "UPDATE User SET gardleId = '"+token+"' WHERE emailId = ?";
          var update =  $cordovaSQLite.execute(db, query , [emailId] )
                           .then(function(res) {
                               return res.rowsAffected ;
                           }, function (err) {
                               console.error(err);
                       });
          deferred.resolve(update);
          return deferred.promise;
      },
      getUserIDByEmail : function(emailId){
            var deferred = $q.defer();
            var db = databaseService.getConnectionObject();
            //chek the email ID exists
            var query = "SELECT userId FROM User WHERE emailId ='"+emailId+"'";
            var insert =  $cordovaSQLite.execute(db, query).then(function(res) {
                   if(res.rows.length > 0){
                     console.log(res.rows);
                     console.log('insert id in model '+res.rows[0].userId);
                     return res.rows[0].userId ;
                   }else {
                     return null ;
                     }
                  }, function (err) {
                });
            deferred.resolve(insert);
            return deferred.promise;
         },

    addPasscodeToUserID : function (userId,passcode){
          var deferred = $q.defer();
          var db = databaseService.getConnectionObject();
          var create = $cordovaSQLite.execute(db, 'CREATE TABLE IF NOT EXISTS Session(id INTEGER PRIMARY KEY AUTOINCREMENT, passcode TEXT, token TEXT,userId TEXT)');
          //chek the email ID exists
          var insert =  $cordovaSQLite.execute(db, 'INSERT INTO Session (passcode, token, userId) VALUES (?,?,?)', [passcode,'',userId])
                           .then(function(res) {
                               console.log("passcode inserted "+res.insertId);
                               return res.insertId ;
                           }, function (err) {
                              console.error(err);
                          });
          deferred.resolve(insert);
          return deferred.promise;
        }
    }
});

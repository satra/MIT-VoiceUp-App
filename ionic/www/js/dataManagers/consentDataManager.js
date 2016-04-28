angular.module('consentDataManager', [])
.factory('consentDataManager', function($http,$cordovaSQLite,userService,$q,databaseService) {
  //open connection
  return {
       getAllConsentScreens: function(){
                var deferred = $q.defer();
                var db = databaseService.getConnectionObject();
                var query = "SELECT consent FROM AppContent";
                var consent =  $cordovaSQLite.execute(db, query).then(function(res) {
                        var len = res.rows.length;
                        for (var i=0; i<len; i++){
                           consent = JSON.parse(res.rows.item(i).consent);
                          }
                          return consent;
                          //resolve here
                          deferred.resolve(consent);
                      }, function (err) {
                    });
               deferred.resolve(consent);
               return deferred.promise;
          }
    }
});

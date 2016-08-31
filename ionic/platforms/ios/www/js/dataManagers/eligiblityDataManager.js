angular.module('eligiblityDataManager', [])
  .factory('eligiblityDataManager', function($http, $cordovaSQLite, databaseManager, $q) {
    //open connection
    return {
      getEligibilityQuestions: function() {
        var deferred = $q.defer();
        var eligiblity = null;
        var db = databaseManager.getConnectionObject();
        var query = "SELECT eligibility FROM AppContent";
        var eligiblity = $cordovaSQLite.execute(db, query).then(function(res) {
          var len = res.rows.length;
          for (var i = 0; i < len; i++) {
            eligiblity = JSON.parse(res.rows.item(i).eligibility);
          }
          return eligiblity;
          //resolve here
          deferred.resolve(eligiblity);
        }, function(err) {});
        deferred.resolve(eligiblity);
        return deferred.promise;
      }
    }
  });

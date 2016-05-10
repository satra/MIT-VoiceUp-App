angular.module('passcodehandler', [])
.factory('passcodehandler', function($http,$cordovaSQLite,databaseService,$q,$rootScope) {

     var onEventResume = function() {
     var deferred = $q.defer();
     var active = $rootScope.auth ;
     deferred.resolve(active);
     return deferred.promise;
     };

     return {
       onEventResume: onEventResume,
       onEventResume: onEventResume,
     };

});

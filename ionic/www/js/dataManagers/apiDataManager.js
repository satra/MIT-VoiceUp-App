angular.module('apiDataManagerService', [])
.factory('apiDataManagerService', function($http,$q) {
  //open connection
  return {
    getURL: function(type){
       var URL = null ;
      switch (type) {
        case 'user':
          URL = 'http://23.89.199.27:8180/api/v1/user';
          break;
        default:
      }
     return URL;
    },
    createGradleUser: function(postData){

      //  var deferred = $q.defer();
        var URL = this.getURL('user');
        var data =  JSON.stringify(postData);
      /*  data = "{'firstName':'ss'}";
        var config = {
        params: data,
        headers : {'Accept' : 'application/json'}
        };
*/
  /*  var signUp = {  "field": "email",
                        "message": "That email is already registered.",
                        "type": "validation"
                      };
    */

        return $http({
                      method:'POST',
                      url: 'http://23.89.199.27:8180/api/v1/user'
                      }).success(function(data) {
                                 console.log(data);
                                 })
                .error(function(error) {
                console.log(error);
                });
        //    console.log(URL);
      /*  var signUp = $http.post(URL,config).then(function(value) {
                            console.log(value);
                            return value ;
                          }).finally(function() {
                              $scope.example7 += "(Finally called)";
                          });
                  */

      //   deferred.resolve(signUp);
        // return deferred.promise;
       }
    }
});

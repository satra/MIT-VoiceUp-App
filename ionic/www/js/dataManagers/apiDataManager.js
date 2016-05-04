angular.module('apiDataManagerService', [])
.factory('apiDataManagerService', function($http,$q,$ionicPopup,$ionicLoading) {
  var base_url = 'http://23.89.199.27:8180/api/v1/';
  //open connection
  return {

    getURL: function(type){
       var URL = null ;
      switch (type) {
        case 'user':
          URL = 'http://23.89.199.27:8180/api/v1/user?';
          break;
        default:
      }
     return URL;
    },
    createGradleUser: function(postData){
     var deferred = $q.defer();
     var URL = this.getURL('user');
     var stringToken = '';
     angular.forEach(postData, function(value, key){
           if(value.firstName){
             stringToken += 'firstName='+value.firstName ;
             console.log('first name '+ value.firstName);
           }else if (value.lastName){
              stringToken += '&lastName='+value.lastName ;
             console.log('last name '+ value.lastName);
           }
           else if (value.email){
             stringToken += '&email='+value.email ;
             console.log('first email '+ value.email);
           }
           else if (value.password){
             stringToken += '&password='+value.password ;
             console.log('first password '+ value.password);
           }
           else if (value.login){
             stringToken += '&login='+value.login ;
             console.log('first login '+ value.login);
           }
        });

      var signUp =    $http({   method:'POST',
                                url: URL+stringToken,
                                })
                      .success(function(data) {
                                console.log(JSON.stringify(data));
                                return data ;
                                })
                      .error(function(error) {
                                console.log(error);
                                $ionicLoading.hide();
                                if (error) {
                                  $ionicPopup.alert({
                                  title: 'Error',
                                  template: error.message
                                  });
                                }
                          });

         deferred.resolve(signUp);
         return deferred.promise;
       },

     signInGradleUser :  function(headerData){
      var deferred = $q.defer();
      var URL = base_url+'user/authentication';
      var signIn =    $http({    method:'GET',
                                 url: URL,
                                 headers: {
                                'Authorization': headerData
                                    }
                                 }).then(function successCallback(data) {
                                    // when the response is available
                                    console.log(JSON.stringify(data));
                                    return data ;
                                  }, function errorCallback(error) {
                                    // called asynchronously if an error occurs
                                    // or server returns response with an error status.
                                    console.log(error);
                                    if (!error.data) {
                                      message = 'Server error'}
                                    else {
                                      var message = error.data.message ;
                                    }
                                    $ionicLoading.hide();
                                      $ionicPopup.alert({
                                      title: 'Error',
                                      template: message
                                      });
                                      return error ;
                                });

          deferred.resolve(signIn);
          return deferred.promise;
        }
    }
});

angular.module('dataStoreManager', [])
.factory('dataStoreManager', function($http,base_url,$q,$ionicPopup,$ionicLoading) {
  //open connection
  return {

    createGlobalUser: function(postData){
     var deferred = $q.defer();
     var stringToken = '';
     angular.forEach(postData, function(value, key){
           if(value.firstName){
             stringToken += 'firstName='+value.firstName ;
           }else if (value.lastName){
              stringToken += '&lastName='+value.lastName ;
           }
           else if (value.email){
             stringToken += '&email='+value.email ;
           }
           else if (value.password){
             stringToken += '&password='+value.password ;
           }
           else if (value.login){
             stringToken += '&login='+value.login ;
           }
        });

      var signUp =    $http({   method:'POST',
                                url: base_url+'user?'+stringToken,
                                })
                      .success(function(data) {
                                return data ;
                                })
                      .error(function(error) {
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

     signInGlobalUser :  function(headerData){
      var deferred = $q.defer();
      var URL = base_url+'user/authentication';
      var signIn =    $http({    method:'GET',
                                 url: URL,
                                 headers: {
                                'Authorization': headerData
                                    }
                                 }).then(function successCallback(data) {
                                    return data ;
                                  }, function errorCallback(error) {
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
        },

      userForgotPassword:function (emailId){
        var deferred = $q.defer();
        var URL = base_url+'user/password?email='+emailId.trim();
        var forgotPassword =  $http({ method:'DELETE',
                                      url: URL
                                  }).then(function successCallback(data) {
                                    return data ;
                                  }, function errorCallback(error) {
                                       console.log('error');
                                       if (!error.data) {
                                        message = 'Server error'
                                       }
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
        deferred.resolve(forgotPassword);
        return deferred.promise;
      },
      createUserFolderInServer:function (parentId){
        var deferred = $q.defer();
        var URL = base_url+'folder?parentType=user&parentId='+parentId;
        console.log('create folder '+URL);
        var createFolder =    $http({ method:'GET',
                                      url: URL,
                                  })
                        .success(function(res) {
                                  return res;
                                  })
                        .error(function(error) {
                                  $ionicLoading.hide();
                                  if (error) {
                                    $ionicPopup.alert({
                                    title: 'Error',
                                    template: error.message
                                    });
                                  }
                            });
           deferred.resolve(createFolder);
           return deferred.promise;
      },
      // createUserFileInserver(girderToken,folderId,fileName,fileSize)
      createUserFileInServer:function (girderToken,folderId,fileName,fileSize){
        var deferred = $q.defer();
        var URL = base_url+'file?parentType=folder&parentId='+folderId+'&name='+fileName+'&size='+fileSize+'&mimeType=application/text';
        console.log(URL);
        var createFolder =    $http({ method:'POST',
                                      url: URL,
                                      headers: {
                                     'girder-token': girderToken
                                      }
                                  })
                        .success(function(res) {
                                  return res;
                                  })
                        .error(function(error) {
                                  $ionicLoading.hide();
                                  if (error) {
                                    $ionicPopup.alert({
                                    title: 'Error',
                                    template: error.message
                                    });
                                  }
                            });
           deferred.resolve(createFolder);
           return deferred.promise;
      },
      createUserChunkForFileInServer : function (girderToken,fileId,chunk){
        var deferred = $q.defer();
        //offset	=0&uploadId=57483f532f6f7954f951d8a3&chunk=gggggtyhgt ddsfds
        var URL = base_url+'/file/chunk?offset=0&uploadId='+fileId+'&chunk='+chunk ;
        var createFolder =    $http({ method:'POST',
                                      url: URL,
                                      headers: {
                                     'girder-token': girderToken
                                      }
                                  })
                        .success(function(res) {
                                  return res;
                                  })
                        .error(function(error) {
                                  $ionicLoading.hide();
                                  if (error) {
                                    $ionicPopup.alert({
                                    title: 'Error',
                                    template: error.message
                                    });
                                  }
                            });
           deferred.resolve(createFolder);
           return deferred.promise;
      }

    }
});

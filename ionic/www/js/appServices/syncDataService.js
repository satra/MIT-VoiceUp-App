angular.module('syncDataService', [])
.factory('syncDataFactory', function($http,$cordovaSQLite,$q,databaseManager,base_url) {
  return {
    //====================================Read =======================
    addToSyncQueue : function (girderToken,userId,syncItem,syncData){
         var deferred = $q.defer();
         var db = databaseManager.getConnectionObject();
         var dateTime = new Date().toLocaleString() ;
         var syncData = $cordovaSQLite.execute(db, 'INSERT INTO SyncData (globalId, userId,syncItem,syncData,creationDateTime) VALUES (?,?,?,?,?)', [girderToken,userId,syncItem,syncData,dateTime])
                          .then(function(res) {
                              return res ;
                           }, function (err) {
                        });
        deferred.resolve(syncData);
        return deferred.promise;
      },

      queryDataNeededToSync : function (girderToken,userId){
           var deferred = $q.defer();
           var db = databaseManager.getConnectionObject();
           var query = "SELECT * FROM SyncData WHERE globalId ='"+girderToken+"' AND userId ='"+userId+"'";
           var syncData =  $cordovaSQLite.execute(db, query).then(function(res) {
                     var len = res.rows.length;
                     if (res.rows.length > 0) {
                       token = res.rows ;
                     }
                     return token;
                 }, function (err) {
               });
          deferred.resolve(syncData);
          return deferred.promise;
        },

      removeSyncQueueFromLocalDb : function(userId,syncItem){
        var deferred = $q.defer();
        var db = databaseManager.getConnectionObject();
        var query = "DELETE FROM SyncData WHERE userId = ? AND syncItem = ? " ;
        var deleteData = $cordovaSQLite.execute(db, query , [userId,syncItem])
                         .then(function(res) {
                          deferred.resolve(res);
                         }, function (err) {
                     });
        return deferred.promise;
      },

      createItemForFolder : function (girderToken,folderId,itemName){
                var deferred = $q.defer();
                 var URL = base_url+'item?folderId='+folderId+'&name='+itemName ;
                 var getItem =    $http({      method:'POST',
                                               url: URL,
                                               headers: {
                                              'girder-token': girderToken
                                               }
                                           })
                                 .success(function(res) {
                                           return res;
                                           })
                                 .error(function(error) {
                                           if (error) {
                                             $ionicPopup.alert({
                                             title: 'Error',
                                             template: error.message
                                             });
                                           }
                                     });
                    deferred.resolve(getItem);
                    return deferred.promise;
         },

         createFileForItem : function (girderToken,itemCreateId,itemName,fileSize){
           var deferred = $q.defer();
           var URL = base_url+'file?parentType=item&parentId='+itemCreateId+'&name='+itemName+'&size='+fileSize+'&mimeType=application/text' ;
           var getItem =    $http({      method:'POST',
                                         url: URL,
                                         headers: {
                                        'girder-token': girderToken
                                         }
                                     })
                           .success(function(res) {
                                     return res;
                                     })
                           .error(function(error) {
                                     if (error) {
                                       $ionicPopup.alert({
                                       title: 'Error',
                                       template: error.message
                                       });
                                     }
                               });
              deferred.resolve(getItem);
              return deferred.promise;
         },

        uploadChunkForFile : function (girderToken,fileCreateId,chunk){
           var deferred = $q.defer();
           var URL = base_url+'/file/chunk' ;
           var createFolder =    $http({ method:'POST',
                                         url: URL,
                                         headers: {
                                         'girder-token': girderToken,
                                         'Content-Type':'application/x-www-form-urlencoded'
                                          },
                                          data: 'offset=0&uploadId='+fileCreateId+'&chunk='+chunk
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

      removeProfileData : function (userId,syncItem){
           var deferred = $q.defer();
           var db = databaseManager.getConnectionObject();
           var query = "DELETE FROM SyncData WHERE userId = ? AND syncItem = ? " ;
           var deleteData = $cordovaSQLite.execute(db, query , [userId,syncItem] )
                            .then(function(res) {
                             deferred.resolve(res);
                            }, function (err) {
                        });
          return deferred.promise;
        }
   }
});

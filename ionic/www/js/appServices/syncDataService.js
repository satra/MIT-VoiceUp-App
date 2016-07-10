angular.module('syncDataService', [])
.factory('syncDataFactory', function($http,$cordovaSQLite,$q,databaseManager,base_url,dataStoreManager,$ionicPopup,$ionicLoading) {
  return {
    //====================================Read =======================
    addToSyncQueue : function (girderToken,userId,syncItem,syncData,folderId,itemId){
         var deferred = $q.defer();
         var db = databaseManager.getConnectionObject();
         var dateTime = new Date().toLocaleString() ;
         var syncData = $cordovaSQLite.execute(db, 'INSERT INTO SyncData (globalId, userId,syncItem,syncData,folderId,itemId,creationDateTime) VALUES (?,?,?,?,?,?,?)', [girderToken,userId,syncItem,syncData,folderId,itemId,dateTime])
                          .then(function(res) {
                              return res ;
                           }, function (err) {
                        });
        deferred.resolve(syncData);
        return deferred.promise;
      },
     addTouserItemMappingTable  : function (girderToken,localUserId,syncItemName,itemId){
          var deferred = $q.defer();
          var db = databaseManager.getConnectionObject();
        
          var dateTime = new Date().toLocaleString() ;
          var syncData = $cordovaSQLite.execute(db, 'INSERT INTO userItemMappingTable (globalId, localUserId,syncItemName,syncItemId,creationDateTime) VALUES (?,?,?,?,?)', [girderToken,localUserId,syncItemName,itemId,dateTime])
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

      removeUserCacheResults : function (userId){
        var deferred = $q.defer();
        var db = databaseManager.getConnectionObject();
        var query = "DELETE FROM SyncData WHERE userId = ? " ;
        var deleteData = $cordovaSQLite.execute(db, query , [userId])
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
        },

        startSyncServiesTouploadData : function (){
             var deferred = $q.defer();
             var db = databaseManager.getConnectionObject();
             var query = "SELECT * FROM SyncData ";
             var syncData =  $cordovaSQLite.execute(db, query).then(function(res) {
                      var  res = res.rows ;
                      if(res.length > 0 ){
                      var fileItemPromise = [];
                      for (var k = 0; k < res.length; k++) {
                           var fileName = res.item(k).syncItem;
                           var girderToken = res.item(k).globalId;
                           var itemId = res.item(k).itemId ;
                           var syncData = res.item(k).syncData ;
                           var dataString = LZString.compressToEncodedURIComponent(syncData);
                           var fileSize = dataString.length;
                           fileItemPromise.push(dataStoreManager.createFileForItem(girderToken,itemId,fileName,fileSize));
                      }

                      $q.all(fileItemPromise).then(function(fileItemPromiseInfo){
                          var uploadChunk = [];

                          for (var i = 0; i < fileItemPromiseInfo.length; i++) {
                          if (fileItemPromiseInfo[i].status==200) {
                          var fileCreateDetails = fileItemPromiseInfo[i].data ;
                          var fileCreateId = fileCreateDetails._id ;
                          var parentId  = fileCreateDetails.parentId ;
                          var itemName = fileCreateDetails.name ;
                            for (var j = 0; j < res.length; j++) {
                                     var syncItemName = res.item(j).syncItem ;
                                     var itemId =  res.item(j).itemId ;
                                     if (syncItemName.toLocaleLowerCase() == itemName.toLocaleLowerCase() && itemId == parentId ) {
                                       var syncData = res.item(j).syncData
                                       var dataString = LZString.compressToEncodedURIComponent(syncData);
                                       uploadChunk.push(dataStoreManager.uploadAudioFileChunk(girderToken,fileCreateId,dataString));
                                     }
                                }
                             }
                          }

                          $q.all(uploadChunk).then(function(uploadChunkInfo){
                            var removeChunkFromLocalDb = [];
                                for (var L = 0; L < uploadChunkInfo.length; L++) {
                                      if (uploadChunkInfo[L].status==200) {
                                          var chunkDetails = uploadChunkInfo[L].data ;
                                          var syncItem = chunkDetails.name ;
                                          var itemId =  chunkDetails.itemId ;
                                          removeChunkFromLocalDb.push(dataStoreManager.removeSyncQueueFromLocalDb(syncItem,itemId));
                                       }
                                }
                               $q.all(removeChunkFromLocalDb).then(function(removeChunkInfo){
                                            var returnArray = {"status":200,"statusText":"Data was uploaded successfully."};
                                            deferred.resolve(returnArray);
                                         },function(error){
                                           deferred.resolve(error);
                                  });
                              },function(error){
                                deferred.resolve(error);
                             });
                        },function(error){
                          deferred.resolve(error);
                      });
                    }else {
                      deferred.resolve(res);
                    }

                   }, function (error) {
                     deferred.resolve(error);
                   });
            return deferred.promise;
          }
     }
})

.service('syncDataService', function($http,$q) {

  return {
       getWS: function() {
           var path = 'jsonWS/context.json';
           return path;
       }
   };

});
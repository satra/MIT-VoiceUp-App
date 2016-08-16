angular.module('syncDataService', [])
.factory('syncDataFactory', function($http,$cordovaSQLite,$q,profileDataManager,databaseManager,base_url,dataStoreManager,$ionicPopup,$ionicLoading) {
  return {
    //====================================Read =======================
    addToSyncQueue : function (girderToken,userId,syncItem,syncData,folderId,itemId,updateFlag){
         var deferred = $q.defer();
         var db = databaseManager.getConnectionObject();
         var dateTime = new Date().toLocaleString() ;
         var syncData = $cordovaSQLite.execute(db, 'INSERT INTO SyncData (globalId, userId,syncItem,syncData,folderId,itemId,creationDateTime,updateFlag) VALUES (?,?,?,?,?,?,?,?)', [girderToken,userId,syncItem,syncData,folderId,itemId,dateTime,updateFlag])
                          .then(function(res) {
                              return res ;
                           }, function (err) {
                        });
        deferred.resolve(syncData);
        return deferred.promise;
      },

      updateToSyncQueue :  function(token,localUserId,syncItem,folderId,itemId){
        var deferred = $q.defer();
        var db = databaseManager.getConnectionObject();
        var dateTime = new Date().toLocaleString() ;
        var query = "UPDATE SyncData SET globalId ='"+token+"',folderId='"+folderId+"' , itemId='"+itemId+"' WHERE userId="+localUserId+" AND syncItem='"+syncItem+"'  ";
        var syncData = $cordovaSQLite.execute(db, query)
                         .then(function(res) {
                             return res ;
                          }, function (err) {
                       });
       deferred.resolve(syncData);
       return deferred.promise;
      },
      updateToSyncQueueData : function(userId,syncItem,syncData,updateFlag){
           var deferred = $q.defer();
           var db = databaseManager.getConnectionObject();
           var dateTime = new Date().toLocaleString() ;
           var query = "UPDATE SyncData SET  syncData='"+syncData+"' , updateFlag = '"+updateFlag+"'  WHERE userId="+userId+" AND syncItem='"+syncItem+"'  ";
           var syncData = $cordovaSQLite.execute(db, query)
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

      queryDataNeedToSyncUpdate : function(syncItem){
        var deferred = $q.defer();
        var db = databaseManager.getConnectionObject();
        //var query = "SELECT * FROM SyncData WHERE syncItem ='"+syncItem+"' AND globalId != '' AND folderId != '' AND itemId != '' AND updateFlag = 'true'  ";
        var query = "SELECT * FROM SyncData WHERE globalId != '' AND folderId != '' AND itemId != '' AND updateFlag = 'true'  ";

        $cordovaSQLite.execute(db, query).then(function(res) {
                  var token = "";
                  if (res.rows.length > 0) {
                    token = res ;
                  }
                  deferred.resolve(token);
              }, function (err) {
                  deferred.resolve(err);
            });
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
        removeUserCacheServerResults : function (userId){
          var deferred = $q.defer();
          var db = databaseManager.getConnectionObject();
          var query = "DELETE FROM resultsToDisplay WHERE userId = ? " ;
          var deleteData = $cordovaSQLite.execute(db, query , [userId])
                           .then(function(res) {
                            deferred.resolve(res);
                           }, function (err) {
                       });
          return deferred.promise;
        },
        removeUserCacheItemIds : function (userId){
          var deferred = $q.defer();
          var db = databaseManager.getConnectionObject();
          var query = "DELETE FROM userItemMappingTable WHERE localUserId = ? " ;
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
        checkDataAvailableToSync : function(){
          var deferred = $q.defer();
          var db = databaseManager.getConnectionObject();
          var query = "SELECT * FROM SyncData WHERE globalId != '' AND folderId != '' AND itemId != '' AND updateFlag = 'false' ";
          var syncData =  $cordovaSQLite.execute(db, query).then(function(res) {
                   var  res = res.rows ;
                   deferred.resolve(res);
                 },function(error){
                   deferred.resolve(error);
               });
         return deferred.promise;
        },
        checkProfileDataAvailableToSync : function(userId){
          var deferred = $q.defer();
          var db = databaseManager.getConnectionObject();
          var query = "SELECT * FROM SyncData WHERE  userId = '"+userId.trim()+"' AND syncItem = 'profile_json' AND updateFlag = 'true' ";
          var syncData =  $cordovaSQLite.execute(db, query).then(function(res) {
                   var  res = res.rows ;
                   deferred.resolve(res);
                 },function(error){
                   deferred.resolve(error);
               });
         return deferred.promise;
        },
        checkProfileJsonForUerID :  function(userId,syncItem){
          var deferred = $q.defer();
          var db = databaseManager.getConnectionObject();
          var query = "SELECT * FROM SyncData WHERE userId = "+userId+" AND syncItem = '"+syncItem+"' ";
          var syncData =  $cordovaSQLite.execute(db, query).then(function(res) {
                   var  res = res.rows ;
                   deferred.resolve(res);
                 },function(error){
                   deferred.resolve(error);
               });
          return deferred.promise;
        },
        startSyncServiesTouploadData : function (res){
             var deferred = $q.defer();
             var db = databaseManager.getConnectionObject();
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
                          var girderToken = fileItemPromiseInfo[i].config.headers["girder-token"];
                            for (var j = 0; j < res.length; j++) {
                                     var syncItemName = res.item(j).syncItem ;
                                     var itemId =  res.item(j).itemId ;
                                     if (syncItemName.toLocaleLowerCase() == itemName.toLocaleLowerCase() && itemId == parentId ) {
                                       var syncData = res.item(j).syncData;
                                      //   var girderToken = res.item(j).globalId ;
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
            return deferred.promise;
          },

        startSyncServiesToUpdateData : function(res){
          var deferred = $q.defer();
                if(res.length > 0 ){
                   var fileItemPromise = [];
                   for (var k = 0; k < res.length; k++) {
                        var girderToken = res.item(k).globalId;
                        var itemId = res.item(k).itemId ;
                        fileItemPromise.push(dataStoreManager.getListOfFilesForItem(girderToken,itemId));
                   }

                   $q.all(fileItemPromise).then(function(fileItemPromiseInfo){
                       var createUploadRequest = [];
                       for (var i = 0; i < fileItemPromiseInfo.length; i++) {
                       var obj = fileItemPromiseInfo[i] ;
                       for (var h = 0; h < obj.length; h++) {
                         var element = obj[h];
                         var fileId = element._id;
                         var itemIdServer = element.itemId;
                         var itemNameServer = element.name ;
                         // with the itemId get the girder token from the cache
                           for (var j = 0; j < res.length; j++) {
                                    var syncItemNameLocal = res.item(j).syncItem ;
                                    var itemIdLocal =  res.item(j).itemId ;
                                    if (syncItemNameLocal.toLocaleLowerCase() == itemNameServer.toLocaleLowerCase() && itemIdLocal == itemIdServer ) {
                                      var syncData = res.item(j).syncData;
                                      var fileSize = LZString.compressToEncodedURIComponent(syncData).length;
                                      var girderToken = res.item(j).globalId ;
                                      createUploadRequest.push(dataStoreManager.createUpdateRequest(girderToken,fileId,fileSize));
                                    }
                               }
                         }
                     }
                    $q.all(createUploadRequest).then(function(uploadChunkInfo){
                         var uploadChunkData = [];
                         for (var L = 0; L < uploadChunkInfo.length; L++) {
                                     var uploadData = uploadChunkInfo[L] ;
                                     for (var c = 0; c < uploadData.length; c++) {
                                       var config = uploadData[c].config ;
                                       var responseData = uploadData[c].data ;
                                       var updateId = responseData._id ;
                                       var girderToken = config.headers["girder-token"];
                                       var itemNameServer = responseData.name ;
                                         for (var c = 0; c < res.length; c++) {
                                                  var syncItemNameLocal = res.item(c).syncItem ;
                                                  var girderTokenLocal = res.item(c).globalId ;
                                                  if (syncItemNameLocal.toLocaleLowerCase() == itemNameServer.toLocaleLowerCase() && girderTokenLocal == girderToken ) {
                                                    var syncData = res.item(c).syncData;
                                                    var syncData = LZString.compressToEncodedURIComponent(syncData);
                                                    uploadChunkData.push(dataStoreManager.updateFileChunks(girderToken,updateId,syncData));
                                                  }
                                             }
                                     }
                          }
                          $q.all(uploadChunkData).then(function(dataUpload){
                              var removeChunkFromLocalDb = [];
                              for (var L = 0; L < dataUpload.length; L++) {
                                         var chunkDetails = dataUpload[L] ;
                                         var syncItem = chunkDetails.name ;
                                         var itemId =  chunkDetails.itemId ;
                                         removeChunkFromLocalDb.push(dataStoreManager.removeSyncQueueFromLocalDb(syncItem,itemId));
                              }
                              $q.all(removeChunkFromLocalDb).then(function(removeChunkInfo){
                                           var returnArray = {"status":200,"statusText":"Data was updated successfully."};
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

                     },function(error){
                       deferred.resolve(error);
                   });
                 }else {
                   deferred.resolve(res);
                 }
          return deferred.promise;
        },
       startSyncServiesToFetchResults  : function(loggedUserEmail){
               var deferred = $q.defer();
               var getResultItems = [];
               var girderTokens = [];
               profileDataManager.getUserList().then(function(response){
                 if (response) {
                  for (var i = 0; i < response.length; i++) {
                   var folderId = response.item(i).folderId ;
                   var emailID = response.item(i).emailId;
                   var token = response.item(i).token ;
                   // if we remove this check will fetch the details for all the local users
                    if (emailID.trim() == loggedUserEmail.trim()) {
                      getResultItems.push(dataStoreManager.getItemListByFolderId(folderId,token));
                    }
                  }
                 }else {
                   deferred.resolve(response);
                 }
                 $q.all(getResultItems).then(function(itemSetList){
                        var downloadableItems = [];
                        for (var k = 0; k < itemSetList.length; k++) {
                            if (itemSetList[k].status == "200") {
                              var itemList = itemSetList[k].data ;
                              var girderToken = itemSetList[k].config.headers["girder-token"] ;
                                for (var j = 0; j < itemList.length; j++) {
                                  var itemName = itemList[j].name;
                                  var item_id =  itemList[j]._id;
                                  var folderId = itemList[j].folderId ;
                                      if (itemName == 'results') {
                                         downloadableItems.push(dataStoreManager.downloadFilesListForItem(item_id,girderToken));
                                       }else if (itemName == 'profile') {
                                         downloadableItems.push(dataStoreManager.downloadFilesListForItem(item_id,girderToken));
                                       }
                                  }
                             }
                        }

                        $q.all(downloadableItems).then(function(filesToDownload){
                             var itemsToDownload = [];
                             var profileJsonData = [];
                             for (var d = 0; d < filesToDownload.length; d++) {
                                 if (filesToDownload[d].status == "200") {
                                 var data = filesToDownload[d].data;
                                 if (data.length>0) {
                                   var girderToken = filesToDownload[d].config.headers["girder-token"] ;
                                   var file_id = data[0]._id;
                                   var createdDate =  data[0].created;
                                   var name = data[0].name;
                                   if (name == "profile_json") {
                                    profileJsonData.push(dataStoreManager.downloadFileById(file_id,girderToken));
                                   }else {
                                   itemsToDownload.push(dataStoreManager.downloadFileById(file_id,girderToken));
                                  }
                                 }
                              }
                            }
                          $q.all(itemsToDownload).then(function(dataDownloaded){
                                 var liveResults = []; var deleteResults =  [];
                                 for (var h = 0; h < dataDownloaded.length; h++) {
                                   if (dataDownloaded[h].status == "200") {
                                        var data = JSON.stringify(dataDownloaded[h].data);
                                        var token = dataDownloaded[h].config.headers["girder-token"] ;
                                        deleteResults.push(dataStoreManager.deleteResultsLocally(token));
                                        liveResults.push(dataStoreManager.addResultsLocally(data,token));
                                    }
                                 }

                               $q.all(deleteResults).then(function(deleteData){
                                     $q.all(liveResults).then(function(add){
                                         // start the profile resolve
                                         $q.all(profileJsonData).then(function(profileDataDownloaded){
                                            var updateLocalDB = [] ;
                                            for (var z = 0; z < profileDataDownloaded.length; z++) {
                                            var data = LZString.decompressFromEncodedURIComponent(profileDataDownloaded[z].data);
                                            var config = profileDataDownloaded[z].config;
                                            var token = config.headers["girder-token"];
                                            updateLocalDB.push(dataStoreManager.updateUserProfileData(token,data));
                                          }
                                          $q.all(updateLocalDB).then(function(update){
                                             deferred.resolve(update);
                                          });
                                       });
                                     });
                                 });
                             }, function (error) {
                                     deferred.resolve(error);
                             });
                         }, function (error) {
                           deferred.resolve(error);
                         });
                     }, function (error) {
                       deferred.resolve(error);
                     });
                 }, function (error) {
                   deferred.resolve(error);
                 });
              return deferred.promise;
           },
        verifyUserToFetchToken : function(encoded){
             var deferred = $q.defer();
            dataStoreManager.signInGlobalUser(encoded).then(function(res){
                 if (res.data) {
                     var resultData = res.data ;
                     var token = resultData.authToken['token'] ;
                     var parentId = resultData.user['_id'];
                     var email = resultData.user['email'];
                     if (token &&email) {
                     profileDataManager.getUserIDByEmail(email).then(function (localUserId){
                      var folderName = 'user';
                      dataStoreManager.createUserFolderInServer(token,parentId,folderName).then(function(folderInfo){
                        if (folderInfo.data) {
                           var folderDetails = folderInfo.data ;
                           var folderId = folderDetails._id ;
                           var createItems = [];
                           createItems.push(dataStoreManager.createItemForFolder(token,folderId,"profile"));
                           createItems.push(dataStoreManager.createItemForFolder(token,folderId,"consent"));
                           createItems.push(dataStoreManager.createItemForFolder(token,folderId,"app"));
                           createItems.push(dataStoreManager.createItemForFolder(token,folderId,"response"));
                           createItems.push(dataStoreManager.createItemForFolder(token,folderId,"settings"));

                           $q.all(createItems).then(function(itemCreateInfo){
                               var addToLocalQueue = [];
                               var updateMappingTable = [];
                               var updateItemIdForResultsList = [];
                               for (var i = 0; i < itemCreateInfo.length; i++) {
                                    if (itemCreateInfo[i].status==200) {
                                        var data = itemCreateInfo[i].data ;
                                        if (data) {
                                          var name = data.name ;
                                          var itemId = data._id ;
                                          addToLocalQueue.push(profileDataManager.addTouserItemMappingTable(token,localUserId,name,itemId));
                                            //update SyncData table with itemId folderID and girderToken
                                            switch (name) {
                                                case "app":
                                                updateMappingTable.push(profileDataManager.updateToSyncQueue(token,localUserId,"app_json",folderId,itemId));
                                                break;
                                                case "consent":
                                                updateMappingTable.push(profileDataManager.updateToSyncQueue(token,localUserId,"consent_json",folderId,itemId));
                                                break;
                                                case "profile":
                                                updateMappingTable.push(profileDataManager.updateToSyncQueue(token,localUserId,"profile_json",folderId,itemId));
                                                break;
                                                case "response":
                                                updateItemIdForResultsList.push(profileDataManager.updateToSyncQueueForResultsList(token,localUserId,folderId,itemId));
                                                break;
                                              default:
                                            }
                                        }
                                    }
                               }

                               $q.all(addToLocalQueue).then(function(createLocalData){
                               $q.all(updateMappingTable).then(function(updateLocalData){
                               $q.all(updateItemIdForResultsList).then(function(updateLocalResultsItemId){
                                 },function(error){
                                      deferred.resolve(error);
                                 });

                                   profileDataManager.updateFolderIdToUserID(localUserId,folderId,"yes").then(function(updateId){
                                      profileDataManager.updateUserAuthToken(email.trim(),token).then(function(updateId){
                                         deferred.resolve(updateId);
                                      },function(error){
                                           deferred.resolve(error);
                                      });
                                    },function(error){
                                         deferred.resolve(error);
                                    });
                                  },function(error){
                                       deferred.resolve(error);
                                  });
                                },function(error){
                                     deferred.resolve(error);
                                });
                             },function(error){
                                  deferred.resolve(error);
                             });
                           }
                         },function(error){
                              deferred.resolve(error);
                         });
                       },function(error){
                            deferred.resolve(error);
                       });
                     }
                  }
              },function(error){
                   deferred.resolve(error);
              });
            return deferred.promise;
         },
      leaveStudyUpdateStatus :   function(folderId,authToken,studyData){
        var deferred = $q.defer();
        dataStoreManager.getItemListByFolderId(folderId,authToken).then(function(itemSet){
                         if (itemSet.data.length >0) {
                            var itemList = itemSet.data ;
                            var settingsItemId = "";
                            var downloadableProfile = [];
                            for (var i = 0; i < itemList.length; i++) {
                              var itemName = itemList[i].name;
                              var item_id = itemList[i]._id;
                                  if (itemName.toLowerCase() == 'settings') {
                                     settingsItemId = item_id ;
                                     downloadableProfile.push(dataStoreManager.downloadFilesListForItem(item_id,authToken));
                                   }
                            }
                            $q.all(downloadableProfile).then(function(filesToDownload){
                                    if (filesToDownload[0].status==200){
                                          var syncData = studyData;
                                          var data = filesToDownload[0].data;
                                          if (data.length > 0) {
                                            // file already created so do update content request and upload the data
                                            var fileId = data[0]._id;
                                            var fileSize = LZString.compressToEncodedURIComponent(syncData).length;
                                            dataStoreManager.createUpdateRequest(authToken,fileId,fileSize).then(function(updateRequest){
                                                if (updateRequest.length >0) {
                                                  var responseData = updateRequest[0].data ;
                                                  var updateId = responseData._id ;
                                                  var dataString = LZString.compressToEncodedURIComponent(syncData);
                                                  dataStoreManager.updateFileChunks(authToken,updateId,dataString).then(function(uploadChunk){
                                                    deferred.resolve(uploadChunk);
                                                  },function(error){
                                                    deferred.resolve(error);
                                                 });
                                               }else {
                                                   deferred.resolve(updateRequest);
                                               }
                                            },function(error){
                                              deferred.resolve(error);
                                          });
                                          }else {
                                                // no files created yet so create a file upload the data
                                                var fileName = "config_json";
                                                var dataString = LZString.compressToEncodedURIComponent(syncData);
                                                var fileSize = dataString.length;
                                                dataStoreManager.createFileForItem(authToken,settingsItemId,fileName,fileSize).then(function(fileCreateInfo){
                                                    if (fileCreateInfo.status==200) {
                                                      var fileCreateDetails = fileCreateInfo.data ;
                                                      var fileCreateId = fileCreateDetails._id ;
                                                      var dataString = LZString.compressToEncodedURIComponent(syncData);
                                                      dataStoreManager.uploadAudioFileChunk(authToken,fileCreateId,dataString).then(function(dataUpload){
                                                         deferred.resolve(dataUpload);
                                                       },function(error){
                                                         deferred.resolve(error);
                                                     });
                                                   }else {
                                                     deferred.resolve(fileCreateInfo);
                                                   }
                                                },function(error){
                                                  deferred.resolve(error);
                                              });
                                            }
                                   }else {
                                      deferred.resolve(filesToDownload);
                                   }
                                 },function(error){
                                   deferred.resolve(error);
                               });
                             }else {
                                deferred.resolve(itemSet);
                             }
                         },function(error){
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

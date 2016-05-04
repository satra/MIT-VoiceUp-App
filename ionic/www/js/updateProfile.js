angular.module('updateProfile',[])
//=======Home screen controller======================
.controller('updateProfileController', function($scope,$rootScope,$cordovaSQLite,$ionicPopup,$q,$compile,$ionicModal,$http,$ionicLoading,profileDataManager,databaseService,$state) {

      var email = $rootScope.emailId ;

      console.log('update profile controller email ID passed to get the profile json '+email);
      profileDataManager.getUserUpdateProfile(email).then(function(response){
      var items = response;
      $scope.updateDiv = '';
      for (var i = 0; i < items.length; i++) {

        if(items[i].type != 'password'){
          if (items[i].placeholder != 'Required') { // should be removed later after testing
            $scope.updateDiv += $scope.generateUpdateProfileDiv(items[i]);
          }
        }
      }

      var updateProfile = angular.element(document.querySelector('#updateProfile'));
      updateProfile.append($scope.updateDiv);
      $compile(updateProfile)($scope);
     });

     $scope.closeModal = function() {
       $scope.modal.remove();
     };

     // Cleanup the modal when we're done with it!
     $scope.$on('$destroy', function() {
      // $scope.modal.remove();
     });

     // Execute action on hide modal
     $scope.$on('modal.hidden', function() {
       // Execute action
     });

     // Execute action on remove modal
     $scope.$on('modal.removed', function() {
       // Execute action
     });

     $scope.generateUpdateProfileDiv = function (obj){
        var value = obj.value;
        var type = obj.type;
        var id = obj.id ;
        if(value){
        $scope[id] = [value];
        }
        var div = '';
              if(!type){
               type = 'label';
               }
             switch(type){
                case 'label': div += '<irk-form-item title="'+obj.title+'"></irk-form-item>'
                              break ;

                case 'text' :
                              div += '<label class="item item-input" type="text" id="'+obj.id+'" text="'+obj.text+'" placeholder="'+obj.placeholder+'">'+
                                      '<span class="input-label irk-form-input-label" aria-label="'+obj.text+'" >'+obj.text+'</span>'+
                                      '<input type="text" ng-model="'+id+'" placeholder="'+obj.placeholder+'" ng-required="false" ng-model="$parent.formData.dynamicContent.'+obj.id+'" style="" ></label>';
                              break;

                case 'email':
                              div += '<label class="item item-input" type="email" id="'+obj.id+'" text="'+obj.text+'" placeholder="'+obj.placeholder+'">'+
                                      '<span class="input-label irk-form-input-label" aria-label="'+obj.text+'" >'+obj.text+'</span>'+
                                      '<input type="email"  ng-model="'+id+'" ng-disabled="true" placeholder="'+obj.placeholder+'" ng-required="false" ng-model="$parent.formData.dynamicContent.'+obj.id+'" style=""></label>';
                              break;

                case 'password':
                                var label = obj.text;
                                if(obj.text == 'Confirm Password'){
                                  var res = obj.text.split(" ");
                                  label = res[0]+'<br>'+res[1];
                                }
                                div += '<label class="item item-input" type="password" id="'+obj.id+'" text="'+obj.text+'" placeholder="'+obj.placeholder+'">'+
                                      '<span class="input-label irk-form-input-label" aria-label="'+obj.text+'" >'+label+'</span>'+
                                      '<input type="password" placeholder="'+obj.placeholder+'" ng-required="false" ng-model="$parent.formData.dynamicContent.'+obj.id+'" style=""></label>';
                               break;

                case 'date':   var id = obj.id ;
                               $scope[id] = new Date(value);
                               div += '<label class="item item-input" type="date" id="'+obj.id+'" text="'+obj.text+'" placeholder="'+obj.placeholder+'">'+
                                      '<span class="input-label irk-form-input-label" aria-label="'+obj.text+'" >'+obj.text+'</span>'+
                                      '<input type="date" ng-model="'+id+'" placeholder="'+obj.placeholder+'" ng-required="false" ng-model="$parent.formData.dynamicContent.'+obj.id+'" style=""></label>';
                              break;

             /*   case 'radio': div +='<irk-form-item type="radio" id="'+obj.id+'" text="'+obj.text+'" placeholder="'+obj.placeholder+'"></irk-form-item>';
                              break;
               */

                case 'number':  var int = parseInt(value, 10);
                                $scope[id] = int;
                                div += '<label class="item item-input" type="number" id="'+obj.id+'" text="'+obj.text+'" placeholder="'+obj.placeholder+'">'+
                                      '<span class="input-label irk-form-input-label" aria-label="'+obj.text+'" >'+obj.text+'</span>'+
                                      '<input type="number" ng-model="'+id+'" placeholder="'+obj.placeholder+'" ng-required="false" ng-model="$parent.formData.dynamicContent.'+obj.id+'" style=""></label>';
                              break;

                default :  break ;
             }
         return div ;
     }

     $scope.updateProfile = function(){
       // to get all the items
      var steps = angular.element(document.querySelectorAll('.item-input'));
      var formValid = true;
      var keepGoing = true;
      var password = null ;
      var password_confirm = null;
      var emailId = null;
      var dataCache = new Array();

      //iterate the form and validate the form
      for (var i = 0; i < steps.length; i++) {
       var lableId = steps[i].id;
       var spanTag = angular.element(document.querySelectorAll('.item-input')[i].querySelector('span'));
       var text = spanTag[0].textContent ;
      if(keepGoing){
          var inputValue = angular.element(document.querySelectorAll('.item-input')[i].querySelector('input'));
          var type = inputValue.prop('type');
          var placeholder = inputValue.prop('placeholder');
          var value = inputValue.prop('value') ;
          switch (lableId) {
           case 'firstName':
                 if(value ==''){
                   formValid = false;
                   keepGoing = false;
                   $scope.callAlertDailog('Please enter your '+lableId);
                 }else {
                   obj = {"id": lableId,  "placeholder": placeholder,"text":text,"type": type,"value":value};
                   dataCache.push(obj);
                 }
                break;
            case 'lastName':
                  if(value ==''){
                      formValid = false ; keepGoing = false;
                      $scope.callAlertDailog('Please enter your '+lableId);
                  }else {
                    obj = {"id": lableId,  "placeholder": placeholder,"text":text,"type": type,"value":value};
                    dataCache.push(obj);
                  }
                break;

            case 'email':
                          emailId = value;
                          obj = {"id": lableId,  "placeholder": placeholder,"text":text,"type": type,"value":value};
                          dataCache.push(obj);
                    break;

              default:
              obj = {"id": lableId,  "placeholder": placeholder,"text":text,"type": type,"value":value};
              dataCache.push(obj);
            }
        }
      }

    if (formValid) {
          $scope.emailId = emailId ;
          console.log('All set '+emailId+' json '+JSON.stringify(dataCache));
          profileDataManager.updateUserByEmailId(dataCache,$scope.emailId).then(function(res){
            if(res){
               $scope.successAlertMsg('Profile Data Updated');
            }
           console.log(res);
           console.log('All Done ');
          });
       }
     }

     $scope.callAlertDailog =  function (message){
          $ionicPopup.alert({
           title: 'Data Invalid',
           template: message
          });
     }

     $scope.successAlertMsg = function (message) {
         $ionicPopup.alert({
          title: 'Success',
          template: message
         });
     }

});

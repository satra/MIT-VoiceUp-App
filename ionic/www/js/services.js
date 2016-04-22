angular.module('starter.services', [])
.factory('userService', function($http) {
	return {
		getUsers: function(){ 
			  return $http.get("assets/consent.json").then(function(response) {
					   return response.data.consent_screens;
			  });
		},
	    getEligibilityQuestions: function(){ 
			  return $http.get("assets/consent.json").then(function(response) {
					   return response.data.Eligibility_Test;
			  });
		},

        parseConsent: function($consent_array,$enable_review){
			var task = '';
		    angular.forEach($consent_array, function(value, key){
                      
            		    var mainType = '';
                        var type  = value.type;
                        if(type){
                          var mainType = value.type;
	                       if(mainType!='consent-review'){
                             task = task +'<irk-task><irk-visual-consent-step id="'+value.id+'" type="'+value.type+'" text="Learn more" summary="'+value.summary+'" title="'+value.title+'"  >'+value.data+'</irk-visual-consent-step></irk-task>';
                   	       }
                        }else {
                       	   angular.forEach(value, function(value, key){
		                           var 	main_typeNext = value.main_type;
					                  if(main_typeNext!='consent-review'){
			                           task = task +'<irk-task><irk-visual-consent-step id="'+value.id+'" type="'+value.type+'" text="Learn more" summary="'+value.summary+'" title="'+value.title+'">'+value.data+'</irk-visual-consent-step></irk-task>';
			                          }    
	                          });
                        }; 
			  })

		    //check if review enabled 
		    if($enable_review== "True"){

		    	angular.forEach($consent_array, function(value, key){
            		    var mainType = '';
                        var type  = value.type;
                        var tagData = '';
                        if(!type){
                       	   angular.forEach(value, function(value, key){
		                           var 	main_typeNext = value.main_type;
                                   var tagData = '';
                                    if(main_typeNext=='consent-review'){
             	                                var reviewTag = '';
             	                                 var subTag = '';
						                         for(var i in value){
 
						                         	if(typeof(value[i]) === 'object'){
						                         	
						                         		var subvalue = value[i] ;
						                         		subTag = '';
						                         		for(var k in subvalue){
								                         	    	 switch(k){
										                               case "main_type" : break ;
										                               case "data" : break ;
										                               default :
										                               subTag = subTag+" "+k+"="+'"'+subvalue[k]+'"'; 
										                               break ; 
										                        	  }
          						                         		}
              						                        subTag = ' <irk-'+i+subTag+' /> ';						                         	    
						                         	    }else{
						                         	    	 switch(i){
								                               case "main_type" : break ;
								                               case "data" : break ;
								                               default :
								                               reviewTag =reviewTag+" "+i+"="+'"'+value[i]+'"'; 
								                               break ; 
								                        	  }
						                         	    }
													} 

			       task = task +'<irk-task><irk-'+main_typeNext+'-step '+reviewTag+'">'+subTag+'</irk-'+main_typeNext+'-step></irk-task>';
			                          
			                          }    
	                          });
                        }; 
			    })
		    }

			return task;
		},

		parseReviewConsent:function($consent_array){
			var task = "";
			angular.forEach($consent_array, function(value, key){
            		    var mainType = '';
                        var type  = value.type;
                        if(type){
                          var mainType = value.type;
	                       if(mainType=='consent-review'){
                             task = task +'<irk-task><irk-consent-review-step id="'+value.id+'" type="'+value.type+'" text="Learn more" summary="'+value.summary+'" title="'+value.title+'"  >'+value.data+'</irk-consent-review-step></irk-task>';
                   	       }
                        }else {
                       	   angular.forEach(value, function(value, key){
		                           var 	main_typeNext = value.main_type;
					                  if(main_typeNext=='consent-review'){
			                           task = task +'<irk-task><irk-consent-review-step id="'+value.id+'" type="'+value.type+'" text="Learn more" summary="'+value.summary+'" title="'+value.title+'">'+value.data+'</irk-consent-review-step></irk-task>';
			                          }    
	                          });
                        }; 
			  })
			return task;
		},
		getSurveyMainList:function(){
			  return $http.get("assets/consent.json").then(function(response) {
					   return response.data;
			  });
		},
		getUserProfileFields:function(){
		      return $http.get("assets/consent.json").then(function(response) {
					   return response.data;
			  });	
		}
	}
});
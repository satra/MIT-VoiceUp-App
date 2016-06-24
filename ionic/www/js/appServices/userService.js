angular.module('userService', [])
.factory('userService', function($http,$cordovaSQLite) {
	return {
		getConfigJson:function(){
			  return $http.get("assets/consent.json").then(function(response) {
					   return response.data;
			  });
		},
		getLocalJson : function(){
			return $http.get("assets/consent.json").then(function(response) {
					 return response.data;
			});
		},
		getSeverJson:function(){
			return $http.get("assets/newspec.json").then(function(response) {
					 return response.data;
			});
		},
	  parseConsent: function($consent_array,$enable_review){
			  var task = '';
		    angular.forEach($consent_array, function(value, key){
            		        var mainType = '';  var title = '';
                        var type  = value.type;
                       	   angular.forEach(value, function(valueIn, key){
														  var 	main_typeNext = valueIn.main_type;
														   if(main_typeNext!='consent-review'){
																title = valueIn.title ;
																if (valueIn.data) {
																	if(!title){
																		title = '';
																	}
																		task +='<irk-task><irk-visual-consent-step id="'+valueIn.id+
																		'" type="'+valueIn.type+'" text="Learn more" summary="'+valueIn.summary+
																		'" title="'+title+'"  >'+valueIn.data+'</irk-visual-consent-step></irk-task>';
																 }else {
																	 if(!title){
																		 title = '';
																	 }
																	 task += '<irk-task><irk-visual-consent-step id="'+valueIn.id+
																	 '" type="'+valueIn.type+'" text="Learn more" show-Learn-More="false" summary="'+
																	 valueIn.summary+'" title="'+title+'" ></irk-visual-consent-step></irk-task>';
																 }

															  }
	                          });

			  });

		    //check if review enabled
		    if($enable_review== "True"){
		    	angular.forEach($consent_array, function(value, key){
                		    var mainType = '';
                        var type  = value.type;
                        var tagData = '';
											 	   angular.forEach(value, function(value, key){
		                           var 	main_typeNext = value.main_type;
															 type = value.main_type;
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
																									 case "signature-page-content" : break;
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
																							 case "signature-page-content":
																							 reviewTag =reviewTag+" text="+'"'+value[i]+'"';
								                               default :
								                               reviewTag =reviewTag+" "+i+"="+'"'+value[i]+'"';
								                               break ;
								                        	  }
						                         	    }
												       	}
task = task +'<irk-task><irk-'+main_typeNext+'-step '+reviewTag+' ">'+subTag+'</irk-'+main_typeNext+'-step></irk-task>';
			                          }
	                          });
			      })
		    }
			 return task;
		 }
  }
});

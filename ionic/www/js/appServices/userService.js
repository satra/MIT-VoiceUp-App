angular.module('userService', [])
.factory('userService', function($http,$cordovaSQLite,databaseManager,$q) {
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
			return $http.get("assets/diffJson.json").then(function(response) {
					 return response.data;
			});
		},

		getAppContent :  function (){
			var deferred = $q.defer();
			var db = databaseManager.getConnectionObject();
			var query = "SELECT * FROM AppContent";
			$cordovaSQLite.execute(db, query).then(function(res) {
							var len = res.rows.length;
							var eligiblity = null;
						  if (len > 0) {
						  eligiblity = res.rows.item(0);
						  }
							deferred.resolve(eligiblity);
						}, function (err) {
							deferred.resolve(err);
					});
		 return deferred.promise;
		},

	  parseConsent: function($consent_array,$enable_review){
			  var task = '';
		    angular.forEach($consent_array, function(value, key){
            		        var mainType = '';  var title = '';
                        var type  = value.type;
                       	angular.forEach(value, function(valueIn, key){
														  var 	main_typeNext = valueIn.main_type;
															var type = valueIn.type ;
														   if(main_typeNext!='consent-review' && main_typeNext != "review-questions"){
															//   if (main_typeNext.toLowerCase() == "review-questions" && type.toLowerCase() =="boolean" ) {
																/*	 var text = "";
																	 if (valueIn.text) {
																	 	text = valueIn.text ;
																	 }
																	 var trueText = valueIn["true-text"];
																	 var falseText = valueIn["false-text"];
																	 task +='<irk-task><irk-boolean-question-step  optional="false" id="H'+key+'" title="'+valueIn.title+'" text="'+text+'" true-text="'+trueText+'" false-text="'+falseText+'" /></irk-task>';
                                */
                              //   }else {
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
																// }
															}
	                      });

			  });

	angular.forEach($consent_array, function(value, key){
                		    var mainType = '';
                        var type  = value.type;
                        var tagData = '';
											 	   angular.forEach(value, function(value, key){
		                           var 	main_typeNext = value.main_type;
															 type = value.main_type;
                                   var tagData = '';
																if(main_typeNext == "review-questions"){
	 																	  if ($enable_review.toLowerCase() == "true" ) {
	 																			  var qtype = value.type
	 																				if (qtype.toLowerCase() =="boolean" ) {
	 																					var text = "";
	 																					if (value.text) {
	 																					 text = value.text ;
	 																					}
																						var id = value.id ;
																						var splitId = id.replace(/\./g,'_');
	 																					var trueText = value["true-text"];
	 																					var falseText = value["false-text"];
																						task +='<irk-task><irk-boolean-question-step  optional="false" id="'+splitId+'" title="'+value.title+'" text="'+text+'" true-text="'+trueText+'" false-text="'+falseText+'" /></irk-task>';
	 																				}
	 																	 	}
	 																}
                                  else if(main_typeNext=='consent-review'){
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
			 return task;
		 }
  }
});

function activitiesDivGenerator(customId,stepData){
   var type = stepData.type;
   var customDiv = '';
//2============================generate div using switch looking type ====
      switch(type){
          case 'irk-instruction-step':
                if(stepData['button-text']){
                customDiv = '<irk-task><irk-instruction-step id="'+customId+'" title="'+stepData.title+'" text="'+stepData.text+'" button-text="'+stepData['button-text']+'"/> </irk-task>';
                }else {
                customDiv = '<irk-task><irk-instruction-step id="'+customId+'" title="'+stepData.title+'" text="'+stepData.text+'" /> </irk-task>';
                }
                break ;
          case 'irk-scale-question-step':
                customDiv = '<irk-task><irk-scale-question-step  id="'+customId+'" title="'+stepData.title+'" text="'+stepData.text+'" step="'+stepData.step+'" value="'+stepData.value+'" /> </irk-task>';
                break;

          case 'irk-boolean-question-step':
                customDiv = '<irk-task><irk-boolean-question-step id="'+customId+'" title="'+stepData.title+'" text="'+stepData.text+'" true-text="'+stepData['true-text']+'" false-text="'+stepData['false-text']+'" /> </irk-task>';
                break;

          case 'irk-text-question-step':
                if(stepData['multiple-lines']){
                customDiv = '<irk-task><irk-text-question-step id="'+customId+'" optional="false" title="'+stepData.title+'" text="'+stepData.text+'" multiple-lines="'+stepData['multiple-lines']+'" /> </irk-task>';
                }else {
                customDiv = '<irk-task><irk-text-question-step optional="false" id="'+customId+'" title="'+stepData.title+'" text="'+stepData.text+'" /> </irk-task>';
                }
                break;

          case 'irk-text-choice-question-step':
                        var style = '';
                        if (stepData.text.toLowerCase() ==='Select only one'.toLowerCase())
                        style = "single";
                        else
                        style = "multiple";
                        var choice = '';
                        for (var i = 0; i < stepData.choices.length; i++) {
                        if(stepData.choices[i].detail)
                        choice += '<irk-text-choice  detail-text="'+stepData.choices[i].detail+'" text="'+stepData.choices[i].text+'" value="'+stepData.choices[i].value+'"></irk-text-choice>';
                        else
                        choice += '<irk-text-choice  text="'+stepData.choices[i].text+'" value="'+stepData.choices[i].value+'"></irk-text-choice>';
                        }
                        customDiv = '<irk-task > <irk-text-choice-question-step id="'+customId+'" title="'+stepData.title+'" style="'+style+'">'+
                        choice+'</irk-text-choice-question-step></irk-task>';
                 break;

           case 'irk-numeric-question-step':
                 customDiv = '<irk-task> <irk-numeric-question-step id="'+customId+'" title="'+stepData.title+'" text="'+stepData.text+'" unit="'+stepData['unit']+'"/></irk-task>';
                 break;

           case 'irk-date-question-step':
                 customDiv = '<irk-task> <irk-date-question-step id="'+customId+'" title="'+stepData.title+'" text="'+stepData.text+'" /></irk-task>';
                 break;

           case 'irk-time-question-step':
                 customDiv = '<irk-task> <irk-time-question-step id="'+customId+'" title="'+stepData.title+'" text="'+stepData.text+'" /></irk-task>';
                 break;

           case 'irk-value-picker-question-step':
                        var choice = '';
                        for (var i = 0; i < stepData.choices.length; i++) {
                        choice += '<irk-picker-choice text="'+stepData.choices[i].text+'" value="'+stepData.choices[i].value+'"></irk-picker-choice>';
                        }
                        customDiv = '<irk-task> <irk-value-picker-question-step id="'+customId+'" title="'+stepData.title+'" text="'+stepData.text+'">'+
                        choice+'</irk-value-picker-question-step></irk-task>';
                 break;

           case 'irk-image-choice-question-step':
                        var choice = '';
                        for (var i = 0; i < stepData.choices.length; i++) {
                        choice += '<irk-image-choice text="'+stepData.choices[i].text+'" value="'+stepData.choices[i].value+'" normal-state-image="'+stepData.choices[i]['normal-state-image']+'" selected-state-image="'+stepData.choices[i]['selected-state-image']+'" ></irk-image-choice>';
                        }
                        customDiv = '<irk-task> <irk-image-choice-question-step id="'+customId+'" title="'+stepData.title+'" text="'+stepData.text+'">'+
                        choice+'</irk-image-choice-question-step></irk-task>';
                 break;

           case 'irk-form-step':
                        var choice = '';
                        for (var i = 0; i < stepData.choices.length; i++) {
                        choice += '<irk-form-item text="'+stepData.choices[i].text+'" type="'+stepData.choices[i].type+'" id="'+stepData.choices[i].id+'" placeholder="'+stepData.choices[i].placeholder+'"  ></irk-form-item>';
                        }
                        customDiv = '<irk-task> <irk-form-step id="'+customId+'" title="'+stepData.title+'" text="'+stepData.text+'">'+
                        choice+'</irk-form-step></irk-task>';
                 break;

/*           case 'instruction':
                 customDiv = '<irk-task> <irk-instruction-step id="'+customId+'" title="'+stepData.title+'" text="'+stepData.text+'" button-text="Get Started" image="'+stepData.image+'" footer-attach="'+stepData['footer-attach']+'"/></irk-task>';
                 break;

           case 'irk-audio-task':
                 customDiv = '<irk-task> <irk-audio-task id="'+customId+'" duration="'+stepData.duration+'" text= "'+stepData.text+'"/></irk-task>';
           break;
*/        }
      return customDiv;

      //1============================generate div dynamically without looking main type ====
    /*
      var mainTag = '';  var subtag ='';  var nextsubtag ='';
      angular.forEach(stepData, function(value, key){
            if(key === 'type'){
             mainTag ='<irk-task><'+value+subtag+'>'+nextsubtag+'</'+value+'></irk-task>';
            }else if(typeof(value)!='object'){
              subtag += ' '+key+'="'+value+'"';
            }else if(typeof(value)== 'object'){
               angular.forEach(value, function(v, k){
                     if(typeof(v)== 'object'){
                          var nextssubtag ='';
                          angular.forEach(v, function(vs, ks){
                                nextssubtag += ' '+ks+'="'+vs+'"';
                           });
                           nextsubtag += '<irk-text-choice '+nextssubtag+'></irk-text-choice>';
                      }
               });
            }
        });
      return mainTag ;
      */

}

// utils functions for profileCtrl
function generateProfileDiv(obj){
       var type = obj.type;
       var div = '';
         if(!type){
          type = 'label';
          }
        switch(type){
           case 'label': div += '<irk-form-item title="'+obj.title+'"></irk-form-item>'
                         break ;

           case 'text' : div += '<label class="item item-input IRK-FONT2" type="text" id="'+obj.id+'" text="'+obj.text+'" placeholder="'+obj.placeholder+'">'+
                                 '<span class="input-label irk-form-input-label IRK-FONT2" aria-label="'+obj.text+'" >'+obj.text+'</span>'+
                                 '<input type="text" placeholder="'+obj.placeholder+'" ng-required="false" ng-model="$parent.formData.dynamicContent.'+obj.id+'" style="" ></label>';
                         break;

           case 'email':  div += '<label class="item item-input IRK-FONT2" type="email" id="'+obj.id+'" text="'+obj.text+'" placeholder="'+obj.placeholder+'">'+
                                 '<span class="input-label irk-form-input-label IRK-FONT2" aria-label="'+obj.text+'" >'+obj.text+'</span>'+
                                 '<input type="email"  placeholder="'+obj.placeholder+'" ng-required="false" ng-model="$parent.formData.dynamicContent.'+obj.id+'" style=""></label>';
                         break;

           case 'password':
                           var label = obj.text;
                           if(obj.text == 'Confirm Password'){
                             var res = obj.text.split(" ");
                             label = res[0]+'<br>'+res[1];
                           }
                           div += '<label class="item item-input IRK-FONT2" type="password" id="'+obj.id+'" text="'+obj.text+'" placeholder="'+obj.placeholder+'">'+
                                 '<span class="input-label irk-form-input-label IRK-FONT2" aria-label="'+obj.text+'" >'+label+'</span>'+
                                 '<input type="password" placeholder="'+obj.placeholder+'" ng-required="false" ng-model="$parent.formData.dynamicContent.'+obj.id+'" style=""></label>';
                         break;

           case 'date': div += '<label class="item item-input IRK-FONT2" type="date" id="'+obj.id+'" text="'+obj.text+'" placeholder="'+obj.placeholder+'">'+
                                 '<span class="input-label irk-form-input-label IRK-FONT2" aria-label="'+obj.text+'" >'+obj.text+'</span>'+
                                 '<input type="date" placeholder="'+obj.placeholder+'" ng-required="false" ng-model="$parent.formData.dynamicContent.'+obj.id+'" style=""></label>';
                         break;

        /*   case 'radio': div +='<irk-form-item type="radio" id="'+obj.id+'" text="'+obj.text+'" placeholder="'+obj.placeholder+'"></irk-form-item>';
                         break;
          */

           case 'number':  var label = obj.text;
                            var res = obj.text.split(" ");
                            label = res[0]+'<br>'+res[1];

                div += '<label class="item item-input IRK-FONT2" type="number" id="'+obj.id+'" text="'+obj.text+'" placeholder="'+obj.placeholder+'">'+
                                 '<span class="input-label irk-form-input-label IRK-FONT2" aria-label="'+obj.text+'" >'+label+'</span>'+
                                 '<input type="number"  string-to-number placeholder="'+obj.placeholder+'" ng-required="false" ng-model="$parent.formData.dynamicContent.'+obj.id+'" style=""></label>';
                         break;

           default :  break ;
        }
    return div ;
}

'use strict';
/**
 * Define StatesController for the states component of CS142 project #4
 * problem #2.  The model data for this view (the states) is available
 * at window.cs142models.statesModel().
 */

cs142App.controller('StatesController', ['$scope', function($scope) {
	$scope.statesModel=window.cs142models.statesModel().sort();
   	console.log($scope.statesModel);
}]).filter('myfilter',function(){
	return function(statesModel,subString){
		return statesModel.filter(function(item){
			if(subString){
				return item.toLowerCase().includes(subString.toLowerCase());
			}
			else{
				return true;
			}
		});
	};
});

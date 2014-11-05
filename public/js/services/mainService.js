// js/services/mainService.js

var app = angular.module('mainService', []);

app.factory('ASG', function($http){

	var NOT_A_KEY = "a3iSOsJ77pgC8BnX"
	return{
		getSubjects: function(){
			return $http.get('http://api.asg.northwestern.edu/subjects/?key=' + NOT_A_KEY);
		},
		getCourses: function(term, subject){
			return $http.get('http://api.asg.northwestern.edu/courses/?key=' + NOT_A_KEY + '&term=' + term + '&subject=' + subject);
		}
	}
});

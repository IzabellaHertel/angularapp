var app = angular.module('app', ['chart.js', 'ngRoute']);

app.config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/cities', {
        controller: 'cityController',
        templateUrl: 'cities.html'
    }).when('/list', {
        controller: 'ssnController',
        templateUrl: 'list.html'
    }).otherwise({
        controller: 'homeController',
        templateUrl: 'welcome.html'
    });
}]);

app.factory('ssnFactory', [function () {
    var today = new Date();
    var year = today.getFullYear();
    var month = today.getMonth() + 1;
    var day = today.getDate();
    return {
        isLeapYear: function(_year){
            return ((_year % 4 == 0) && (_year % 100 != 0)) || (_year % 400 == 0);
        },
        age: function(ssn){
            if (ssn != undefined) {
                var birthYear = Number(ssn.slice(0,2));
                var thisYear = Number(year.toString().slice(2));
                if (birthYear < 10){
                    birthYear = '0' + birthYear;
                }
                if ( birthYear >= thisYear ) {
                    birthYear = '19' + birthYear;
                } else {
                    birthYear = '20' + birthYear;
                }
                var yourAge = year - birthYear;
                var birthMonth = ssn.slice(2,4);
                var birthDay = ssn.slice(4,6);

                if ( month < birthMonth ) {
                    yourAge--;
                } else if ( ( month == birthMonth ) && ( day < birthDay ) ) {
                    yourAge--;
                }
                return yourAge;
            }
        },
        validSsn: function(ssn){
            if (ssn != undefined) {

                var birthYear = ssn.slice(0,2);
                var thisYear = year.toString();
                thisYear = thisYear.slice(2);

                    if ( birthYear > thisYear ) {
                        birthYear = '19' + birthYear;
                    } else {
                        birthYear = '20' + birthYear;
                    }
                var birthMonth = ssn.slice(2,4);
                var birthDay = ssn.slice(4,6);
                if ( birthMonth < 1 || birthMonth > 12 ) {
                    return false;
                } 
                if ( birthDay < 1 ) {
                    return false;
                }
                switch( Number(birthMonth) ){ 
                    case 1: case 3: case 5: case 7: case 8: case 10: case 12:
                        if ( birthDay > 31 ) {
                            return false;
                        }
                    break;
                    case 4: case 6: case 9: case 11:
                        if ( birthDay > 30 ) {
                            return false;
                        }
                    break;
                    case 2:
                        if ( this.isLeapYear(Number(birthYear)) ){
                            if ( birthDay > 29 ) {
                                return false;
                            }
                        } else {
                            if ( birthDay > 28 ) {
                                return false;
                            }
                        }
                    break;
                }

                var newSsn = ssn.slice(0,6) + ssn.slice(7,10);
                var control = []; // Tar emot varje enskild siffra i ssn
                var x = 0; // Varje enskild siffra i ssn
                var change = true;
                var sum = 0;
                for ( var i = 0; i < newSsn.length; i++ ) {
                    x = newSsn.slice(i,i+1);
                    if ( change ){
                        x *= 2;
                        change = false;
                    } else{
                        x *= 1;
                        change = true;
                    }
                    control.push(x);
                }   
                for ( var j = 0; j < 9; j++ ) {
                    if ( control[j] >= 10 ) {
                        sum += control[j] - 9;
                    } else {
                        sum += control[j];
                    }
                }
                newSum = sum.toString();
                if ( newSum.length == 2 ) {
                    sum = newSum.slice(1);
                }
                sum = 10 - sum;
                var controlNumber = ssn.slice(10);
                if ( controlNumber == sum ) {
                    return true;
                } else {
                    return false;
                }
            }
        }
    }
}]);

app.factory('cityFactory', ['$http', function($http) {
    var cities = [];
    var name = [];
    var population = [];
    return {
        fetch: function() {
            return $http.get ('http://cities.jonkri.se/0.0.0/cities').then(function (list){
                name.splice(0, name.length);
                population.splice(0, population.length);
                cities = list.data.items;
                for (var i = 0; i < cities.length; i++) {
                    name.push(cities[i].name);
                    population.push(cities[i].population);
                }
            });

        },
        post: function(addCityName, addCityPopulation) {
            return $http.post('http://cities.jonkri.se/0.0.0/cities', {name: addCityName, population: addCityPopulation}).then(function(data){
                cities = data;
            }); 
        },
        getName: function () {
            return name;
        },
        getPopulation: function() {
            return population;
        }
    }
}]);

app.run(['$rootScope', function($rootScope){
    $rootScope.name = '';
}]);

app.filter('capitalize', function() {
    return function(input) {
      return (!!input) ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : '';
    };
});

app.directive('validateSsn', ['$rootScope', 'ssnFactory', function($rootScope, ssnFactory) {
    return {
        require: 'ngModel',
        restrict: 'A',
        link: function(scope, element, attributes, controller) {
            controller.$validators.validateSsn = function(modelValue, viewValue) {
                return ssnFactory.validSsn(viewValue);
            };
        }
    };
}]);

 app.directive('domDirective', [function () {
      return {
          restrict: 'A',
          link: function ($scope, element, attrs) {
              element.on('mouseenter', function () {
                  element.css('background-color', 'yellow');
              });
              element.on('mouseleave', function () {
                  element.css('background-color', 'white');
              });
          }
      };
}]);

app.controller('cityController', ['$scope', '$http', '$rootScope', 'cityFactory', function($scope, $http, $rootScope, cityFactory){
    $scope.name = cityFactory.getName();
    $scope.population = cityFactory.getPopulation();
    cityFactory.fetch();

    $scope.addCity = function(){
        $scope.errorMessage = false;       
        if (($scope.addCityName == undefined) || ($scope.addCityPopulation == undefined)) {     
            $scope.errorMessage = true;
        } else if (($scope.addCityName.length == 0) || ($scope.addCityPopulation.length == 0)) {
            $scope.errorMessage = true;
        } else {
           cityFactory.post($scope.addCityName, $scope.addCityPopulation);
           $scope.addCityName = '';
           $scope.addCityPopulation = '';
        }
    };
    
}]);

app.controller('ssnController', ['$scope', '$rootScope', 'ssnFactory', function($scope, $rootScope, ssnFactory){
    $scope.isLeapYear = ssnFactory.isLeapYear;
    $scope.validSsn = ssnFactory.validSsn;
    $scope.age = ssnFactory.age;

    $scope.correctInput = function (ssn){
        if (ssn != undefined) {
            return /^\d{6}\-\d{4}$/.test(ssn);
        }
    };
}]);

app.controller('homeController', ['$scope', '$rootScope', function($scope, $rootScope){
    $scope.addName = function(){
        $rootScope.name = $scope.whatsYourName;
        $scope.whatsYourName = '';
    };
}]);


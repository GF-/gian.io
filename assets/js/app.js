'use strict';

angular.module('gianio', [
  'ngRoute',
  'ngAnimate',
  'ngSanitize',
  'ngMaterial',
  'ngMdIcons',
  '720kb.socialshare'
])

// Routes
.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/', {templateUrl: 'partials/front.html', controller: 'PostListCtrl'});
  $routeProvider.when('/posts/:postUrl', {templateUrl: 'partials/post-detail.html', controller: 'PostDetailCtrl'});
  $routeProvider.when('/contact', {templateUrl: 'partials/contact-form.html'});
  $routeProvider.otherwise({redirectTo: '/'});
}])

// Avoiding conflict with Handlebars, angular syntax is now {[{ this }]}
.config(function($interpolateProvider) {
  $interpolateProvider.startSymbol('{[{');
  $interpolateProvider.endSymbol('}]}');
})


// Angular Material theme config
.config(function($mdThemingProvider) {
  $mdThemingProvider.theme('default')
    .primaryPalette('deep-purple')
    .accentPalette('pink')
    .warnPalette('red')
    .backgroundPalette('grey', {
      'default': '50', // by default use shade 400 from the pink palette for primary intentions
      'hue-1': '200', // use shade 100 for the <code>md-hue-1</code> class
      'hue-2': '600', // use shade 600 for the <code>md-hue-2</code> class
      'hue-3': 'A100' // use shade A100 for the <code>md-hue-3</code> class
    });
})

// Calling Ghost JSON
.controller('PostListCtrl', ['$scope', '$http',
  function ($scope, $http) {
    $http.get(

      ghost.url.api('posts', {
        limit: 'all'
      })

      ).success(function(data) {
      $scope.posts = data.posts;
      // IMPORTANT /1
      // = 'data.posts' instead of 'data' guarantees that we look into 'POSTS' on the JSON provided by Ghost. Important!
      // console.log('Success!', data);
      

    });

    // $scope.orderProp = 'age';
  }])

.controller('PostDetailCtrl', ['$scope', '$routeParams', '$http',
  function($scope, $routeParams, $http) {
    $http.get(
      
      // 'posts/' + $routeParams.postUrl + '.json'

        // No clue why this does not work
        // ghost.url.api('posts', {
        //   slug: 'welcome-to-ghost'
        // })

        // This is a working alternative, as documented here http://api.ghost.org/docs/postsslugslug
        ghost.url.api('posts/slug/' + $routeParams.postUrl)

      ).success(function(data) {
    // $http.get('post-' + $routeParams.postId + '.json').success(function(data) {
      $scope.post = data.posts[0];
      // IMPORTANT /2
      // [0] because:
      // https://groups.google.com/forum/#!topic/angular/EaTWQu0wffA

    });
  }])


// Angular Material - Layout + sidenav
.controller('gianioCtrl', ['$scope', '$routeParams', '$http',
  function($scope, $routeParams, $http) {

    $http.get(

      ghost.url.api('users/1')

      ).success(function(data) {
      $scope.user = data.users[0];

    });
  }])


// This is to make sure that the document scrolls on top at every change of location. Thank you http://www.ngroutes.com/questions/14149d0/changing-route-doesnt-scroll-to-top-in-the-new-page.html#7 */
.run(["$rootScope", "$anchorScroll" , function ($rootScope, $anchorScroll) {
  $rootScope.$on("$locationChangeSuccess", function() {
      setTimeout($anchorScroll, 600); // It is delayed to allow the 'leave' animation to complete - otherwise there is a weird jump at the beginning of the animation
  });
}])



// Formspree

.controller('MailControllerAjax',function($scope, $http, $mdToast) { 

  // Form
  
  // creating a blank object to hold our form information.
  //$scope will allow this to pass between controller and view
  $scope.formData = {};
  // submission message doesn't show when page loads
  $scope.submission = false;
  // Updated code thanks to Yotam
  var param = function(data) {
        var returnString = '';
        for (var d in data){
            if (data.hasOwnProperty(d))
               returnString += d + '=' + data[d] + '&';
        }
        // Remove last ampersand and return
        return returnString.slice( 0, returnString.length - 1 );
  };
  
  // $.ajax({
  //   url: 'http://formspree.io/gianfranco.pooli@gmail.com',
  //   method: 'POST',
  //   data: $('#formspree').serialize(),
  //   dataType: 'json',
  //   beforeSend: function() {},
  //   success: function(data) { 

$scope.submitFormAjax = function() {

  $http({
    method : 'POST',
    // url : 'http://dev.gian.io/assets/php/contact-engine.php',
    url : 'http://formspree.io/gianfranco.pooli@gmail.com',
    data : param($scope.formData), // pass in data as strings
    // data: $.param({
    //     name: 'Name',
    //     email: 'mymail@gian.io',
    //     message: 'ciao'
    // }),
    headers : {
      'Accept': 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded'
    } // set the headers so angular passing info as form data (not request payload)
  })
    .success(function(data) {

      if (!data.success) {

       // // if not successful, bind errors to error variables
       // $scope.errorName = data.errors.name;
       // $scope.errorEmail = data.errors.email;
       // $scope.errorTextarea = data.errors.message;
       // $scope.errorRobotest = data.errors.robotest;
       // $scope.submissionMessage = data.messageError;
       // $scope.submission = true; //shows the error message
       // wrap message in a toast
       $mdToast.show(
          $mdToast.simple()
            .content("Wait, validation error")
            .position('bottom left')
            .hideDelay(3000)
            .parent('#success-toast')
        );
      } else {
       $scope.contactform.$setPristine();
       $scope.model = '';
       // if successful, bind success message to message
       // $scope.submissionMessage = data.messageSuccess;
       $scope.formData = {}; // form fields are emptied with this line
       $scope.submission = true; //shows the success message
       // wrap message in a toast
       $mdToast.show(
          $mdToast.simple()
            .content('Thank you! Message received :-)')
            .position('bottom left')
            .hideDelay(7000)
            .parent('#success-toast')
        );
      }
     });
   };

})


// Contact form

.controller('MailController',function($scope, $http, $mdToast) { 
  
  // Form
  
  // creating a blank object to hold our form information.
  //$scope will allow this to pass between controller and view
  $scope.formData = {};
  // submission message doesn't show when page loads
  $scope.submission = false;
  // Updated code thanks to Yotam
  var param = function(data) {
        var returnString = '';
        for (var d in data){
            if (data.hasOwnProperty(d))
               returnString += d + '=' + data[d] + '&';
        }
        // Remove last ampersand and return
        return returnString.slice( 0, returnString.length - 1 );
  };
  $scope.submitForm = function() {
    $http({
    method : 'POST',
    // url : 'http://dev.gian.io/assets/php/contact-engine.php',
    url : 'http://dev.gian.io:80/contact-engine.php',
    data : param($scope.formData), // pass in data as strings
    headers : { 'Content-Type': 'application/x-www-form-urlencoded' } // set the headers so angular passing info as form data (not request payload)
  })
    .success(function(data) {
      if (!data.success) {
       // if not successful, bind errors to error variables
       $scope.errorName = data.errors.name;
       $scope.errorEmail = data.errors.email;
       $scope.errorTextarea = data.errors.message;
       $scope.errorRobotest = data.errors.robotest;
       $scope.submissionMessage = data.messageError;
       $scope.submission = true; //shows the error message
       // wrap message in a toast
       $mdToast.show(
          $mdToast.simple()
            .content(data.messageError)
            .position('bottom left')
            .hideDelay(3000)
            .parent('#form-message')
        );
      } else {
      // if successful, bind success message to message
       $scope.submissionMessage = data.messageSuccess;
       $scope.formData = {}; // form fields are emptied with this line
       $scope.submission = true; //shows the success message
       // wrap message in a toast
       $mdToast.show(
          $mdToast.simple()
            .content(data.messageSuccess)
            .position('bottom left')
            .hideDelay(7000)
            .parent('#success-toast')
        );
      }
     });
   };

});


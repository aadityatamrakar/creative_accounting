angular
  .module('app')
  .controller('LoginController', function ($scope, ngNotify, $state, Client) {
    if (Client.isAuthenticated()) {
      $state.go("app.dashboard");
    }

    $scope.login = function () {
      Client.login({
          username: $scope.username,
          password: $scope.password
        },
        function () {
          console.log("logged in");
          window.localStorage.setItem('username', $scope.username);
          var event = new Event('username');
          event.username = $scope.username;
          document.dispatchEvent(event);
          $state.go("app.dashboard");
        },
        function (err) {
          if (err.data && err.data.error && err.data.error.message) {
            ngNotify.set(err.data.error.message, {
              type: 'error',
              duration: 7000,
              position: "bottom"
            });
          }
        }
      );
    };
  })

  .controller('RegisterController', function ($rootScope, $state, $scope, ngNotify, $state, Client) {
    $scope.register = function () {
      let data = {
        username: $scope.username,
        mobile: $scope.mobile,
        password: $scope.password
      };
      Client.create(data).$promise.then(function (resp) {
        console.log(resp);
        ngNotify.set("User created success.", {
          type: "success",
          position: "bottom"
        });
        // $state.go('login');

        Client.login({
            username: $scope.username,
            password: $scope.password
          },
          function () {
            console.log("logged in");
            window.localStorage.setItem('username', $scope.username);
            var event = new Event('username');
            event.username = $scope.username;
            document.dispatchEvent(event);
            $state.go("app.dashboard");
          },
          function (err) {
            if (err.data && err.data.error && err.data.error.message) {
              ngNotify.set(err.data.error.message, {
                type: 'error',
                duration: 7000,
                position: "bottom"
              });
            }
          }
        );
      }, function(err) {
        if (err.data && err.data.error && err.data.error.message) {
          ngNotify.set(err.data.error.message, {
            type: "danger",
            position: "bottom"
          });
        }
      });
    }
  })

  .controller('appController', function ($scope, $rootScope, $state, Client, ngNotify) {
    $scope.isActive = function (viewLocation) {
      return viewLocation === $state.current.name
    };

    $scope.printDate = function (date) {
      return moment(date).format('DD/MM/Y');
    }
    $scope.getAgeing = function (date) {
      let today = moment()
      let callDate = moment(date);
      return today.diff(callDate, 'days');
    }

    $scope.current_user = {
      username: "user"
    };
    $scope.isAdmin = false;
    Client.getCurrent().$promise.then(function(user) {
      $scope.isAdmin = user.admin ? user.admin : false;
      $rootScope.isAdmin = user.admin ? user.admin : false;
      $rootScope.username = user.username;
      $scope.current_user = user;
      $scope.clientId = user.id;
      $scope.clientRole = user.role;
      window.localStorage.setItem('username', user.username);
      var event = new Event('username');
      event.username = user.username;
      document.dispatchEvent(event);
    })

    $scope.logout = function () {
      Client.logout().$promise.then(function(resp) {
        ngNotify.set('Logged out.', {
          position: "bottom",
          type: "grimace"
        })
        $state.go('login');
      })
    }

    ngNotify.config({
      theme: 'pitchy',
      position: 'bottom',
      duration: 5000,
      type: 'grimace'
    });
  })
  .directive('repeatDone', function () {
    return function (scope, element, attrs) {
      if (scope.$last) { // all are rendered
        scope.$eval(attrs.repeatDone);
      }
    }
  })

  .factory('debounce', ['$timeout', '$q', function ($timeout, $q) {
    return function debounce(func, wait, immediate) {
      var timeout;
      return function () {
        var context = this,
          args = arguments;
        var later = function () {
          timeout = null;
          if (!immediate) func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
      };
    };
  }]);
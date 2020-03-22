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
      }, function (err) {
        if (err.data && err.data.error && err.data.error.message) {
          ngNotify.set(err.data.error.message, {
            type: "danger",
            position: "bottom"
          });
        }
      });
    }
  })

  .controller('appController', function ($scope, $rootScope, $state, Client, Transaction, ngNotify) {
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
    Client.getCurrent().$promise.then(function (user) {
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
      Client.logout().$promise.then(function (resp) {
        ngNotify.set('Logged out.', {
          position: "bottom",
          type: "grimace"
        })
        $state.go('login');
      })
    }

    $scope.downloadBooking = function () {
      Transaction
        .find({filter: {include: ['client']}})
        .$promise
        .then(function (resp) {
          let total = resp.reduce(function (acc, item) {
            acc.total_amount += item.total_amount;
            acc.commission_amount += item.commission_amount;
            acc.payable_amount += item.payable_amount;
            acc.paying_amount += item.paying_amount;
            acc.credit += item.credit;
            return acc;
          }, {
            total_amount: 0,
            commission_amount: 0,
            payable_amount: 0,
            paying_amount: 0,
            credit: 0
          })

          let headers = [
            'Date',
            'Total Amount',
            'Commission',
            'Payable',
            'Paid',
            'Credit',
            'Description',
            'User',
            'Mobile'
          ];
          let itemsFormatted = resp.map(transaction => {
            return [
              $scope.printDate(transaction.tdate),
              transaction.total_amount,
              transaction.commission_amount,
              transaction.payable_amount,
              transaction.paying_amount,
              transaction.credit,
              transaction.description.replace(/(\n)|(\r)|(\')|(\")|(\;)|(\:)|(\,)/g, ''),
              transaction.client.name,
              transaction.client.mobile,
            ]
          });
          itemsFormatted.push([
            'Total:',
            total.total_amount,
            total.commission_amount,
            total.payable_amount,
            total.paying_amount,
            total.credit,
            '',
            '',
            ''
          ]);
          let fileTitle = 'all_data';
          exportCSVFile(headers, itemsFormatted, fileTitle);      
        });
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

angular
  .module('app')


  .controller('ClientController', function ($scope, ngNotify, Client, Transaction, Page) {
    $scope.user = {};
    $scope.pages = [];
    Page.find({}).$promise.then(function (pages) {
      $scope.pages = pages;
    });


    $scope.message = function (idx) {
      if (String($scope.users[idx].mobile).length == 10) {
        let msgtxt = prompt('Message', 'Hello ');
        Transaction.sendmsg({
          mobile: $scope.users[idx].mobile,
          message: msgtxt
        }).$promise.then(function (res) {
          alert('Msg Sent!');
        })
      }
    }

    $scope.validateForm = function () {
      $scope.errors = [];

      if (typeof $scope.user.name == 'undefined') {
        $scope.errors.push({
          name: "user.name",
          msg: "Name is Required"
        });
      }
      if (typeof $scope.user.username == 'undefined') {
        $scope.errors.push({
          name: "user.username",
          msg: "Username is Required"
        });
      }

      if (typeof $scope.user.password == 'undefined') {
        $scope.errors.push({
          name: "user.password",
          msg: "Password is Required"
        });
      }

      $('.is-invalid').removeClass('is-invalid');

      setTimeout(function () {
        $scope.errors.forEach(function (error) {
          $('[ng-model="' + error.name + '"]').addClass('is-invalid');
        });
      }, 250);

      if ($scope.errors.length > 0) {
        return false;
      } else return true;
    }

    $scope.save = function () {
      if (typeof $scope.user.id == 'undefined') {
        Client
          .create($scope.user)
          .$promise
          .then(function (user) {
            $scope.getData();
            $scope.user = {};
            $("#newUserModal").modal('hide');
            alert('User Saved!');
          })
      } else {
        // $scope.getData();
        $scope.user.$save();
        $scope.user = {};
        $("#newUserModal").modal('hide');
        alert('User Saved!');
      }
    }

    $scope.getData = function () {
      Client.find({}).$promise.then(function (users) {
        $scope.users = users;
      })
    }
    $scope.getData();

    $scope.reset = function (id) {
      let pass = prompt('New Password?');
      if (pass.trim().length > 3) {
        $scope.users[id].password = pass;
        $scope.users[id].last_sync = new Date();
        $scope.users[id].$save();
        alert('Password Changed.');
      } else {
        alert('Password should be minimum 4 char.');
      }
    }

    $scope.edit = function (idx) {
      $("#newUserModal").modal('show');
      $scope.user = $scope.users[idx];
    }
  })

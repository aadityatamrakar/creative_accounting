angular
  .module('app')


  .controller('PagesController', function ($scope, ngNotify, Client, Transaction, Page) {
    $scope.page = {}

    $scope.validateForm = function () {
      $scope.errors = [];

      if (typeof $scope.page.name == 'undefined') {
        $scope.errors.push({
          name: "page.name",
          msg: "Name is Required"
        });
      }
      if (typeof $scope.page.username == 'undefined') {
        $scope.errors.push({
          name: "page.username",
          msg: "Username is Required"
        });
      }

      if (typeof $scope.page.link == 'undefined') {
        $scope.errors.push({
          name: "page.link",
          msg: "Link is Required"
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
      if (typeof $scope.page.id == 'undefined') {
        Page
          .create($scope.page)
          .$promise
          .then(function (page) {
            $scope.getData();
            $scope.page = {};
            $("#newPageModal").modal('hide');
            alert('Page Saved!');
          })
      } else {
        // $scope.getData();
        $scope.page.$save();
        $scope.page = {};
        $("#newPageModal").modal('hide');
        alert('Page Saved!');
      }
    }

    $scope.getData = function () {
      Page.find({}).$promise.then(function (pages) {
        $scope.pages = pages;
      })
    }
    $scope.getData();

    $scope.edit = function (idx) {
      $("#newPageModal").modal('show');
      $scope.page = $scope.pages[idx];
    }
    $scope.delete = function (idx) {
      if (confirm("Are you sure?")) {
        Page.deleteById({
          id: $scope.pages[idx].id
        }).$promise.then($scope.getData);
      }
    }
  })
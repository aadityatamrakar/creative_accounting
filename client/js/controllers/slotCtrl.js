angular
  .module('app')


  .controller('SlotsController', function ($scope, ngNotify, Client, Slot, Page) {
    $scope.pages = [];
    $scope.slots = [];
    $scope.slot = {bookdate: new Date()};
    $scope.query = {
      from_date: new Date(),
      to_date: new Date()
    };

    Page.find({}).$promise.then(function (pages) {
      $scope.pages = pages;
    });

    $scope.validateForm = function () {
      $scope.errors = [];

      if (typeof $scope.slot.name == 'undefined') {
        $scope.errors.push({
          name: "slot.name",
          msg: "Name is Required"
        });
      }

      if (typeof $scope.slot.gap == 'undefined') {
        $scope.errors.push({
          name: "slot.gap",
          msg: "Gap is Required"
        });
      }

      if (typeof $scope.slot.amount == 'undefined') {
        $scope.errors.push({
          name: "slot.amount",
          msg: "Amount is Required"
        });
      }

      // if (typeof $scope.slot.time == 'undefined') {
      //   $scope.errors.push({
      //     name: "slot.time",
      //     msg: "Time is Required"
      //   });
      // }

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
      $scope.slot.bookdate = parseInt(moment($scope.slot.bookdate).format('X'));
      if (typeof $scope.slot.id == 'undefined') {
        $scope.slot.client_name = $scope.current_user.name;
        Slot
          .create($scope.slot)
          .$promise
          .then(function (slot) {
            $scope.getData();
            $scope.slot = {};
            $("#addNewSlot").modal('hide');
            alert('Slot Saved!');
          })
      } else {
        // $scope.getData();
        $scope.slot.$save();
        $scope.slot = {};
        $("#addNewSlot").modal('hide');
        alert('slot Saved!');
      }
    }

    $scope.printDts = function (date) {
      return moment(date, 'X').format('DD/MM/Y HH:mm A');
    }

    $scope.getData = function () {
      Slot.find({
        filter: {
          where: {
            bookdate: {
              between: [
                parseInt(moment($scope.query.from_date).startOf('day').format('X')),
                parseInt(moment($scope.query.to_date).endOf('day').format('X'))
              ]
            }
          }
        }
      }).$promise.then(function (slots) {
        $scope.slots = slots;
      })
    }
    $scope.getData();

    $scope.edit = function (idx) {
      $("#addNewSlot").modal('show');
      $scope.slot = $scope.slots[idx];
      $scope.slot.bookdate = moment($scope.slot.bookdate, 'X').toDate();
    }
    $scope.delete = function (idx) {
      if (confirm("Are you sure?")) {
        Slot.deleteById({
          id: $scope.slots[idx].id
        }).$promise.then($scope.getData);
      }
    }
  })

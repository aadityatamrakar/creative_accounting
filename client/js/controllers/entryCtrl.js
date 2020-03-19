angular
  .module('app')


  .controller('DisplayController', function ($scope, $stateParams, Client, Transaction) {
    $scope.showId = $stateParams['clientId'];

    $scope.report = {};
    Transaction.dashboard().$promise.then(function (report) {
      console.log(report);
      $scope.report = report.filter(c => c.client.id == $scope.clientId)[0];
      $scope.report.hero = report.sort(function (a, b) {
        return b.payable - a.payable
      })[0].client.name;
    });

    $scope.total = {};

    $scope.getData = function () {
      Transaction.find({
        filter: {
          where: {
            clientId: $scope.showId
          }
        }
      }).$promise.then(function (transactions) {
        $scope.transactions = transactions;
        $scope.total = $scope.transactions.reduce(function (acc, item) {
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
      })
    }
    $scope.getData();
  })
  .controller('TransactionController', function ($scope, ngNotify, Client, Transaction) {
    $scope.report = {};
    $scope.total = {};
    $scope.drawChart = function () {

      let rowsData = Object.values($scope.report).map(c => {
        // console.log(c);
        // return [c.client.name, c.total_amount, c.commission_amount];
        return [c.client.name, c.total_amount];
      });
      var data = google.visualization.arrayToDataTable([
        ['Name', 'Total Amount'],
        // ['Name', 'Total Amount', 'Commission'],
        ...rowsData
      ]);
      var chart = new google.visualization.ColumnChart(document.getElementById('chart_div'));
      var options = {
        chart: {
          title: 'Company Performance',
          subtitle: 'Sales and Commission',
        }
      };
      chart.draw(data, google.charts.Bar.convertOptions(options));
    }

    $scope.query = {
      from_date: moment().startOf('day').toDate(),
      to_date: moment().endOf('day').toDate()
    }

    $scope.getData = function () {
      Transaction.report({
        from_date: $scope.query.from_date,
        to_date: $scope.query.to_date
      }).$promise.then(function (result) {
        $scope.report = JSON.parse(JSON.stringify(result));
        $scope.drawChart();
        $scope.total = Object.values($scope.report).reduce(function (acc, item) {
          acc.total_amount += item.total_amount;
          acc.commission_amount += item.commission_amount;
          acc.payable_amount += item.payable_amount;
          acc.paid_amount += item.paying_amount;
          acc.balance += item.paying_amount - item.payable_amount;
          return acc;
        }, {
          total_amount: 0,
          commission_amount: 0,
          payable_amount: 0,
          paid_amount: 0,
          balance: 0
        })
      })
    }
    $scope.getData();
  })
  .controller('EntryController', function ($scope, ngNotify, Client, Transaction) {
    $scope.transaction = {
      clientId: $scope.clientId,
      tdate: new Date(),
      total_amount: 0,
      commission_amount: 0,
      payable_amount: 0,
      paying_amount: 0,
      credit: 0,
      description: '',
    }

    $scope.calculatePayable = function () {
      $scope.transaction.payable_amount = $scope.transaction.total_amount - $scope.transaction.commission_amount;
      if (parseInt($scope.transaction.paying_amount) != 0)
        // $scope.transaction.paying_amount = $scope.transaction.total_amount - $scope.transaction.commission_amount;
        $scope.transaction.credit = ($scope.transaction.total_amount - $scope.transaction.commission_amount) - $scope.transaction.paying_amount;
      // else
    }

    $scope.validateForm = function () {
      $scope.errors = [];

      if (typeof $scope.transaction.tdate == 'undefined') {
        $scope.errors.push({
          name: "transaction.name",
          msg: "Date is Required"
        });
      }
      if (typeof $scope.transaction.total_amount == 'undefined') {
        $scope.errors.push({
          name: "transaction.total_amount",
          msg: "Total amount is Required"
        });
      }
      if (typeof $scope.transaction.commission_amount == 'undefined') {
        $scope.errors.push({
          name: "transaction.commission_amount",
          msg: "Total amount is Required"
        });
      }
      if (typeof $scope.transaction.payable_amount == 'undefined') {
        $scope.errors.push({
          name: "transaction.payable_amount",
          msg: "Total amount is Required"
        });
      }
      if (typeof $scope.transaction.paying_amount == 'undefined') {
        $scope.errors.push({
          name: "transaction.paying_amount",
          msg: "Total amount is Required"
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

    $scope.saveBtn = false;
    $scope.save = function () {
      $scope.transaction.clientId = $scope.clientId
      $scope.saveBtn = true;
      if ($scope.validateForm()) {
        Transaction
          .create($scope.transaction)
          .$promise
          .then(function (transaction) {
            $scope.saveBtn = false;
            $scope.transaction = {
              tdate: new Date(),
              total_amount: 0,
              commission_amount: 0,
              payable_amount: 0,
              paying_amount: 0,
              credit: 0,
              description: '',
            };
            alert('Transaction Saved!');
          })
      }
    }

  })

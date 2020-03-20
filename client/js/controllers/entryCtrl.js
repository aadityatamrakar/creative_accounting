angular
  .module('app')


  .controller('DisplayController', function ($scope, $stateParams, Client, Transaction) {
    $scope.showId = $stateParams['clientId'];

    $scope.report = {};
    Transaction.dashboard().$promise.then(function (report) {
      $scope.report = report.filter(c => c.client.id == $scope.showId)[0];
      $scope.report.hero = report.sort(function (a, b) {
        return b.payable - a.payable
      })[0].client.name;
    });

    $scope.total = {};

    $scope.remove = function (idx) {
      Transaction.deleteById({
        id: $scope.transactions[idx].id
      });
      $scope.getData();
    }

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
    $scope.downloadimg = {
      a: '',
      b: '',
      c: ''
    }
    // $('#transTbl').DataTable();

    $scope.downloadImg = function (title) {
      // console.log($scope.downloadimg[title]);
      // window.open($scope.downloadimg[title]);
      saveAs(dataURItoBlob($scope.downloadimg[title]), "charts.jpg");
    }
    // $scope.downloadImg = function (html_id, title) {
    //   html2canvas($(html_id), {
    //     onrendered: function (canvas) {
    //       theCanvas = canvas;
    //       document.body.appendChild(canvas);
    //       canvas.toBlob(function (blob) {
    //         saveAs(blob, title + ".jpg");
    //       });
    //     }
    //   });
    // }

    $scope.downloadCsv = function () {
      let headers = ['Name', 'Total Amount', 'Commission', 'Payable', 'Paid', 'Balance'];
      let itemsFormatted = Object.values($scope.report).map(transaction => {
        return [
          transaction.client.name,
          transaction.total_amount,
          transaction.commission_amount,
          transaction.payable_amount,
          transaction.paying_amount,
          (transaction.paying_amount - transaction.payable_amount)
        ]
      });
      itemsFormatted.push([
        'Total:',
        $scope.total.total_amount,
        $scope.total.commission_amount,
        $scope.total.payable_amount,
        $scope.total.paid_amount,
        $scope.total.balance
      ]);
      let fileTitle = 'summary';
      exportCSVFile(headers, itemsFormatted, fileTitle);
    }


    $scope.drawChart = function () {
      let rowsData = Object.values($scope.report).map(c => {
        // console.log(c);
        // return [c.client.name, c.total_amount, c.commission_amount];
        return [c.client.name, c.payable_amount];
      });
      var data = google.visualization.arrayToDataTable([
        ['Name', 'Total Amount'],
        // ['Name', 'Total Amount', 'Commission'],
        ...rowsData
      ]);
      var chart = new google.visualization.ColumnChart(document.getElementById('chart_div'));
      var view = new google.visualization.DataView(data);
      view.setColumns([0, 1,
        {
          calc: "stringify",
          sourceColumn: 1,
          type: "string",
          role: "annotation"
        }
      ]);
      var options = {
        chart: {
          title: 'Company Performance',
          subtitle: 'Sales and Commission',
        }
      };
      google.visualization.events.addListener(chart, 'ready', function () {
        $scope.downloadimg['a'] = chart.getImageURI();
      });
      chart.draw(view, google.charts.Bar.convertOptions(options));
    }
    $scope.drawChart2 = function () {
      let rowsData = Object.values($scope.report).map(c => {
        // console.log(c);
        // return [c.client.name, c.total_amount, c.commission_amount];
        return [c.client.name, parseFloat(((c.payable_amount / c.client.target) * 100).toFixed(2))];
      });
      let data = google.visualization.arrayToDataTable([
        ['Name', 'Performance %'],
        // ['Name', 'Total Amount', 'Commission'],
        ...rowsData
      ]);
      let chart = new google.visualization.ColumnChart(document.getElementById('chart_div2'));
      var view = new google.visualization.DataView(data);
      view.setColumns([0, 1,
        {
          calc: "stringify",
          sourceColumn: 1,
          type: "string",
          role: "annotation"
        }
      ]);
      let options = {
        chart: {
          title: 'Company Performance %',
          subtitle: 'Sales and Commission',
        }
      };
      google.visualization.events.addListener(chart, 'ready', function () {
        $scope.downloadimg['b'] = chart.getImageURI();
      });
      chart.draw(view, google.charts.Bar.convertOptions(options));
    }

    $scope.drawChart3 = function () {
      let targetTotal = 0;
      let rowsData = Object.values($scope.report).map(c => {
        targetTotal += c.client.target;
        // return [c.client.name, parseFloat(((c.payable_amount / c.client.target) * 100).toFixed(2))];
        return [c.client.name, c.payable_amount];
      });
      let data = google.visualization.arrayToDataTable([
        ['User', 'Contribution'],
        ['Remaining', targetTotal],
        ...rowsData
      ]);
      console.log(rowsData);
      let options = {
        title: 'Performance',
        slices: {
          0: { color: 'black' }
          // 0: { color: 'yellow' },
        }
        // pieSliceText: 'label'
      };

      let chart = new google.visualization.PieChart(document.getElementById('piechart'));
      google.visualization.events.addListener(chart, 'ready', function () {
        $scope.downloadimg['c'] = chart.getImageURI();
      });
      chart.draw(data, options);
    }

    $scope.query = {
      from_date: moment().subtract(7, 'days').startOf('day').toDate(),
      to_date: moment().endOf('day').toDate()
    }

    $scope.getData = function () {
      Transaction.report({
        from_date: $scope.query.from_date,
        to_date: $scope.query.to_date
      }).$promise.then(function (result) {
        $scope.report = JSON.parse(JSON.stringify(result));
        $scope.drawChart();
        $scope.drawChart2();
        $scope.drawChart3();
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

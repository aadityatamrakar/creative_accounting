angular
  .module('app')

  .controller('AnnouncementController', function ($scope, $state, Client, Counters) {

    Counters
      .findById({
        id: "5e77262881d405ac52f3245b"
      })
      .$promise
      .then(function (announcement) {
        $scope.announcement = announcement;
      });


    $scope.save = function () {
      // Counters.create($scope.announcement);
      $scope.announcement.$save();
    }
  })
  .controller('DashboardController', function ($scope, $state, Client, Transaction, Counters) {

    $scope.qoutes = ["Done is better than perfect.", "Tend to the people, and they will tend to the business.", "What you do has far greater impact than what you say.", "Always do your best. What you plant now, you will harvest later. ", "The way to get started is to quit talking and begin doing.", "Either run the day or the day runs you.", "Our greatest weakness lies in giving up. The most certain way to succeed is always to try just one more time", "The harder the conflict, the more glorious the triumph", "I attribute my success to this: I never gave or took any excuse.", "You miss 100% of the shots you don’t take.", "There is always room at the top.",  "Big shots are only little shots who keep shooting. ", "Trying is winning in the moment.", "Fall down seven times and stand up eight.", "“If you aren’t going all the way, why go at all?", "You just can't beat the person who never gives up.",  "“Every problem is a gift—without problems we would not grow. ",  "“Even if you are on the right track, you’ll get run over if you just sit there.", "“There are no secrets to success. It is the result of preparation, hard work and learning from failure.", "“Yesterday’s home runs don’t win today’s games.", "“The only place where success comes before work is in the dictionary.", "Opportunities don't happen. You create them.", "I find that the harder I work, the more luck I seem to have.", "If you are not willing to risk the usual, you will have to settle for the ordinary.", "The ones who are crazy enough to think they can change the world, are the ones that do.", "“Winning isn’t everything, it’s the only thing.", "“Winning isn’t everything, but wanting it is.", "Winners don’t wait for chances, they take them.", "“Winners are those that convert problems into opportunities.", "“Winners are not people who never fail, but people who never quit.", "“If you don’t see yourself as a winner, then you cannot perform as a winner.", "I'm not in competition with anybody but myself. My goal is to beat my last performance.", "A horse never runs so fast as when he has other horses to catch up and outpace.", "To be a great champion you must believe you are the best. If you're not, pretend you are.", "“Knowing Is Not Enough; We Must Apply. Wishing Is Not Enough; We Must Do.",  "“We Generate Fears While We Sit. We Overcome Them By Action. –", "“I Think Goals Should Never Be Easy, They Should Force You To Work, Even If They Are Uncomfortable At The Time.", "“Today’s Accomplishments Were Yesterday’s Impossibilities.", "“Leaders Are Never Satisfied; They Continually Strive To Be Better.", "“What You Lack In Talent Can Be Made Up With Desire, Hustle And Giving 110% All The Time.", "You just can't beat the person who never gives up."];
    $scope.selectQoute = Math.floor(Math.random() * $scope.qoutes.length);

    $scope.counts = {
      total_pending: 0,
      escated: 0,
      ageing: 0,
      part: 0,
    }

    Counters
      .findById({
        id: "5e77262881d405ac52f3245b"
      })
      .$promise
      .then(function (announcement) {
        $scope.announcement = announcement;
      });

    Client.getCurrent().$promise.then(function (user) {
      $scope.allReport = {};
      $scope.report = {};
      $scope.total = {};

      Transaction.dashboard().$promise.then(function (report) {
        $scope.allReport = report.filter(c => c.client.role !='Admin').sort((a, b) => (b.total / b.client.target) - (a.total / a.client.target));
        $scope.total = $scope.allReport.reduce(function (acc, item) {
          acc.payable += item.payable;
          acc.target += item.client.target;
          acc.balance += item.balance;
          return acc;
        }, {
          payable: 0,
          target: 0,
          balance: 0
        })
        $scope.report = report.filter(c => c.client.id == $scope.clientId)[0];
        $scope.report.hero = report.sort(function (a, b) {
          return b.payable - a.payable
        })[0].client.name;
      })
    });

  })

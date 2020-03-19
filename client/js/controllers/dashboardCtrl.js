angular
  .module('app')

  .controller('AnnouncementController', function ($scope, $state, Client) {

    Counters
      .findById({
        id: "5dd548a20be53a47b5e6f70a"
      })
      .$promise
      .then(function (announcement) {
        $scope.announcement = announcement;
      });


    $scope.save = function () {
      $scope.announcement.$save();
    }
  })
  .controller('DashboardController', function ($scope, $state, Client, Transaction) {

    $scope.qoutes = ["If you’re offered a seat on a rocket ship, don’t ask what seat! Just get on.Sheryl Sandberg", "To win in the marketplace you must first win in the workplace.Doug Conant", "When people are financially invested, they want a return. When people are emotionally invested, they want to contribute.Simon Sinek", "Tell me and I forget. Teach me and I remember. Involve me and I learn.Benjamin Franklin", "I always did something I was a little not ready to do. I think that’s how you grow. When there’s that moment of ‘Wow, I’m not really sure I can do this,’ and you push through those moments, that’s when you have a breakthrough.Marissa Mayer", "Every strike brings me closer to the next home run.Babe Ruth", "We must all learn not only to not fear change, but to embrace it enthusiastically and, perhaps even more important, encourage and drive it.Tony Hsieh", "Nothing is impossible, the word itself says, “I’m possible!”Audrey Hepburn", "Always treat your employees exactly as you want them to treat your best customers.Stephen R. Covey", "Research indicates that workers have three prime needs: Interesting work, recognition for doing a good job, and being let in on things that are going on in the company.Zig Ziglar", "If you don’t stand for something, you’ll fall for anything.Malcolm X", "If you hear a voice within you say “you cannot paint,” then by all means paint and that voice will be silenced.Vincent Van Gogh", "When I let go of what I am, I become what I might be.Lao Tzu", "When everything seems to be going against you, remember that the airplane takes off against the wind, not with it.Henry Ford", "You can have all the potential in world, but unless you have confidence, you have nothing.Tyra Banks", "It’s not the years in your life that count. It’s the life in your years. Abraham Lincoln", "Appreciate everything your associates do for the business. Nothing else can quite substitute for a few well-chosen, well-timed, sincere words of praise. They’re absolutely free and worth a fortune.Sam Walton", "Don’t limit yourself. Many people limit themselves to what they think they can do. You can go as far as your mind lets you. What you believe, remember, you can achieve.Mary Kay Ash", "The strength of the team is each individual member. The strength of each member is the team.Phil Jackson", "There are only three measurements that tell you nearly everything you need to know about your organization’s overall performance: employee engagement, customer satisfaction, and cash flow.Jack Welch", "You can’t let your failures define you. You have to let your failures teach you.Barack Obama", "Some companies don’t have an engagement problem, they have a hiring problem.Bob Kelleher", "Opportunity is missed by most people because it is dressed in overalls and looks like work.Thomas Edison", "If you don’t understand, ask questions. If you’re uncomfortable about asking questions, say you are uncomfortable about asking questions and then ask anyway. It’s easy to tell when a question is coming from a good place. Then listen some more.Chimamanda Ngozi Adichie", "The first thing that has to be recognized is that one cannot train someone to be passionate–it’s either in their DNA or it’s not.Richard Branson", "If it scares you, it might be a good thing to try.Seth Godin", "If you don’t give people a chance to fail, you won’t innovate. If you want to be an innovative company, allow people to make mistakes.Indra Nooyi", "The only way to do great work is to love what you do.Steve Jobs", "Continuous improvement is better than delayed perfection.Mark Twain", "Talent wins games, but teamwork and intelligence win championships.Michael Jordan", "In theory, theory and practice are the same. In practice, they are not.Albert Einstein", "Success is a lousy teacher. It seduces smart people into thinking they can’t lose.Bill Gates", "A pessimist sees the difficulty in every opportunity; an optimist sees the opportunity in every difficulty.Winston Churchill", "The one thing I learned is to just give everything a shot. You don’t want to live in regret.Chloe Kim", "Often any decision, even the wrong decision, is better than no decision.Ben Horowitz", "The three things that motivate creative people – autonomy, mastery, purpose!Daniel H. Pink", "You can’t use up creativity. The more you use, the more you have.Maya Angelou", "Formal education will make you a living; self-education will make you a fortune.Jim Rohn", "Getting the right people and the right chemistry is more important than the right idea.Ed Catmull", "You just have to keep driving down the road. It’s going to bend and curve and you’ll speed up and slow down, but the road keeps going.Ellen DeGeneres"];
    $scope.selectQoute = Math.floor(Math.random() * $scope.qoutes.length);

    $scope.counts = {
      total_pending: 0,
      escated: 0,
      ageing: 0,
      part: 0,
    }


    Client.getCurrent().$promise.then(function (user) {

      $scope.report = {};
      Transaction.dashboard().$promise.then(function (report) {
        console.log(report);
        $scope.report = report.filter(c => c.client.id == $scope.clientId)[0];
        $scope.report.hero = report.sort(function (a, b) {
          return b.payable - a.payable
        })[0].client.name;
      })
    });

  })

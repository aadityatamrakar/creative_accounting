(function ($) {
  "use strict"; // Start of use strict

  function sidebarToggle(e) {
    $("body").toggleClass("sidebar-toggled");
    $(".sidebar").toggleClass("toggled");
    if ($(".sidebar").hasClass("toggled")) {
      $('.sidebar .collapse').collapse('hide');
    };
  }

  $(document).on('click', '#sidebarToggle, #sidebarToggleTop', sidebarToggle);
  
  $(window).resize(function () {
    if ($(window).width() < 768) {
      $('.sidebar .collapse').collapse('hide');
    };
  });

  google.charts.load('current', {
    'packages': ['corechart', 'bar', 'visualization']
  });
})(jQuery); // End of use strict
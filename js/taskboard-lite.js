(function($) {

$(document).ready(function(){
  TASKBOARD.init();
});

var TASKBOARD = window.TASKBOARD = {};

TASKBOARD.init = function () {

  TASKBOARD.init.sorting();
  TASKBOARD.init.editing();
  TASKBOARD.init.adding();
  TASKBOARD.init.tagging();

}

TASKBOARD.init.sorting = function () {

  var $sortables = $("#board .column");
  $sortables
    .equalHeight()
    .sortable({ 
      tolerance: 'pointer',
      placeholder: 'placeholder card',
      forcePlaceholderSize: true,
      connectWith: '#board .column',
      change: function(){ $sortables.equalHeight(); },
    });

}

TASKBOARD.init.editing = function () {

  $("#board")
    .delegate('.card', 'dblclick', function(){
      var $this = $(this),
          $text = $this.find(".text");
      $("#board").removeClass("highlighted")
        .find(".highlighted, .clicked").removeClass("highlighted clicked");  // #tags
      $("#board .column").sortable("disable"); // sortable breaks contenteditable in Firefox
      $text.html(function(i, html){ return TASKBOARD.tags.unmarkTags(html); }); // #tags
      $text[0].contentEditable = "true";
      $text.focus();
    })
    .delegate('.card .text', 'focusout', function(){
      if (this.contentEditable === "true") {
        this.contentEditable = "false";
        $(this).html(function(i, html){ return TASKBOARD.tags.markTags(html); }); // #tags
        $("#board .column").sortable("enable");
      }
    });

};

TASKBOARD.init.adding = function () {

  var colors = ['transparent', 'green', 'blue', 'red', 'orange', 'yellow'];
  var $deck = $("<aside id='deck' class='column'></aside>").appendTo('body');

  $.each(colors, function (i, color) {
    var $card = $(TASKBOARD.templates.card)
      .appendTo($deck)
      .addClass("new " + color)
      .css({ left: '-40px' })
      .draggable({ 
        addClasses: false,
        connectToSortable: '#board .column',
        helper: function(event) {
          return $(event.target).closest(".card").clone() },
        start: function() { $(this).hide(); },
        stop: function() {
          var $this = $(this);
          setTimeout(function () {
            $this.css({ left: '-40px' }).show().animate({ left: '0' }, 'normal', 'easeOutBack');
          }, 750);
        }
      })
      .bind('mouseenter mouseleave', function (ev){
        $(this).stop().animate({ left: (ev.type == 'mouseenter') ? '20px' : '0' }, 'normal', 'easeOutBack');
      });

      setTimeout(function(){
        $card.animate({ left: '0' }, 'normal', 'easeOutBack');
      }, (colors.length - i) * 100)

  });


  $("#board .column").bind("sortbeforestop", function(ev, ui) {
    if (ui.item.hasClass('new')) {
      ui.item.removeClass('new')
        .find(".text").html("<p><em>Double-click to edit</em> <span class='tag'>#new</span></p>");
    }
  });

}

/* Tags */

TASKBOARD.tags = {};

TASKBOARD.tags.markTags = function (text) {
  /* turn #tags into nice spans */
  return text.replace(/(\s|^)(#\w*)\b/gi, "$1<span class='tag'>$2</span>");
}

TASKBOARD.tags.unmarkTags = function (text) {
  return text.replace(/<span\sclass=['"]tag['"]\s*>(#\w*)<\/span>/gi, "$1");
}

TASKBOARD.init.tagging = function () {

  $("#board")
    .delegate('.tag', 'hover', function(ev){
      var enter = /^mouse(enter|over)/i.test(ev.type),
          $this = $(this),
          $tags = $("#board .tag").filter(function () {
            return $(this).text().toLowerCase() == $this.text().toLowerCase();
          });
      if (!$this.hasClass("clicked")) {
        $tags.toggleClass("highlighted", enter);
      }
    })

    .delegate('.tag', 'click', function(ev){
      var $this = $(this),
          $tags = $("#board .tag").filter(function () {
            return $(this).text().toLowerCase() == $this.text().toLowerCase();
          });
      $tags.toggleClass("clicked");
      if ($this.hasClass("clicked")) {
        $tags.closest(".card").add("#board").addClass("highlighted");
      } else {
        $tags.closest(".card").add("#board").not(':has(.clicked)').removeClass("highlighted");
      }
    })

  $("#board .column").bind("sortbeforestop", function(ev, ui) {
    ui.item.css({position:"", left: "", right: "", top: "", bottom: ""});
  });;
}


TASKBOARD.templates = {};

TASKBOARD.templates.card = "<section class='card'><div class='text'></div></section>";

/**
 * UTILS
 * ========
 */

/**
 * Computes the maximum height of all the elements (as sum of children heights)
 * and expands all the elements to this height.
 *
 * @param options
 * @param options.offset   Offset in pixels to be added to max height (default = 0)
 * @param options.css      CSS attribute to be changed (default = min-height)
 */
$.fn.equalHeight = function(options){
    var settings = {
        offset : 0,
        css    : "min-height"
    };

    if(options) {
        $.extend(settings, options);
    }

    var maxHeight = 0;
    var height;
    this.css(settings.css, "").each(function(i, el){
        height = $(el).height();
        if(maxHeight < height){
            maxHeight = height;
        }
    });
    return this.css(settings.css, maxHeight + settings.offset);
};

})(jQuery);

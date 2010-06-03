(function($) {

var TASKBOARD = {},
    $board = $("#board");

$(document).ready(function(){
  TASKBOARD.init();
});

TASKBOARD.init = function () {
  var functions = TASKBOARD.init.initializers,
      i = 0;
  for (i = 0; i < functions.length; i++) {
    if ($.isFunction(functions[i])) {
      functions[i].apply(this);
    }
  }
};

TASKBOARD.init.initializers = [];

/* Building board */

TASKBOARD.build = function (data) {

  data = data || TASKBOARD.data.load(); // later get some real data

  $board.empty();
  $.each(data.columns, function (i, column) {
    var $column = $(TASKBOARD.templates.column).appendTo($board);
    $.each(column.cards, function (i, card) {
      $(TASKBOARD.templates.card)
        .appendTo($column).addClass(card.type)
        .find(".text")
          .formatCardText(card.text);
    });
  });
};

TASKBOARD.init.initializers.push( TASKBOARD.build );


/* Sorting cards */

$.fn.columns = function () {
  return this.find(".column");
};

$.fn.updateSize = function () {
  return this.width( this.columns().equalHeight().sumWidth() );
};


TASKBOARD.init.sorting = function () {

  var options = {
        tolerance: 'pointer',
        placeholder: 'placeholder card',
        connectWith: '#board .column'
      };

  $board.addClass("sortable")
    .bind({
      "sortstart sortstop": function (ev) {
        $board.toggleClass("sorting", ev.type === "sortstart");
      },
      "sortover": function () { $board.columns().equalHeight(); },
      "sortstop": function () {
        var $columns = $board.columns();
        if ( $columns.last().find(".card").length > 0 ) {
          // if dropped card on a last column than add a new one
          $(TASKBOARD.templates.column).sortable(options).appendTo($board);
        } else {
          // remove any empty columns from the end (except one)
          while ($columns.eq(-2).find(".card").length == 0) {
            $columns.last().remove();
            $columns = $columns.slice(1, -1);
          }
        }
        $board.updateSize();
        TASKBOARD.data.save();
      }
    })
    .append(TASKBOARD.templates.column)
    .updateSize()
    .columns().sortable(options);

};

TASKBOARD.init.initializers.push( TASKBOARD.init.sorting );

/* Editing cards */

$.fn.formatCardText = function (text) {
  return this.data("value", text).html(TASKBOARD.formatCardText(text));
};

// override this function to provide some formatting
TASKBOARD.formatCardText = function (text) { return text; };

TASKBOARD.init.editing = function () {

  $board
    .delegate('.card .text', 'dblclick', function(){
      var $this = $(this);
      if (this.contentEditable !== "true") {
        $this
          .trigger("cardeditstart")
          .html($this.data("value"))
          .attr("contentEditable", "true")
          .focus();
      }
    })
    .delegate('.card .text', 'focusout', function(){
      var $this = $(this), value;
      if (this.contentEditable === "true") {
        value = $this.html();
        $this
          .attr("contentEditable", "inherit")
          .formatCardText(value)
          .trigger("cardeditstop");
        TASKBOARD.data.save()
      }
    });

  // disable sorting while editing to prevent problems with selecting text and stuff
  $board.bind("cardeditstart cardeditstop", function (ev) {
    var enable = (ev.type === "cardeditstop");
    $board.toggleClass("sortable", enable)
      .columns().sortable(enable ? "enable" : "disable");
  });

};

TASKBOARD.init.initializers.push( TASKBOARD.init.editing );

/* Adding new cards */

TASKBOARD.init.adding = function () {

  var colors = ['transparent', 'green', 'blue', 'red', 'orange', 'yellow'],
      $deck = $("<aside id='deck' class='sortable column'></aside>").appendTo('body');

  $.each(colors, function (i, color) {
    var $card = $(TASKBOARD.templates.card)
      .appendTo($deck)
      .addClass("new " + color)
      .css({ left: '-40px' })
      .draggable({ 
        addClasses: false,
        connectToSortable: '#board .column',
        helper: function(event) {
          return $(event.target).closest(".card").clone(); },
        start: function() {
          $(this).hide();
          $board
            .trigger("sortstart")
            .one("sort", function() { $board.updateSize(); });
        },
        stop: function() {
          var $this = $(this);
          setTimeout(function () {
            $this.css({ left: '-40px' }).show().animate({ left: '0' }, 'normal', 'easeOutBack');
          }, 750);
        }
      })
      .bind('mouseenter mouseleave', function (ev){
        $(this).stop().animate({ left: (ev.type === 'mouseenter') ? '20px' : '0' }, 'normal', 'easeOutBack');
      });

      setTimeout(function(){
        $card.animate({ left: '0' }, 'normal', 'easeOutBack');
      }, (colors.length - i) * 100);
  });

  $board.bind("sortbeforestop", function(ev, ui) {
    if (ui.item.hasClass('new')) {
      ui.item.removeClass('new')
        .find(".text").formatCardText("<p><em>Double-click to edit</em> #new</p>");
    }
  });

};

TASKBOARD.init.initializers.push(TASKBOARD.init.adding );

/* Tagging cards */

TASKBOARD.init.tagging = function () {

  $board
    .delegate('.tag', 'hover', function(ev){
      var enter = /^mouse(enter|over)/i.test(ev.type),
          $this = $(this),
          $tags = $board.find(".tag").filter(function () {
            return $(this).text().toLowerCase() === $this.text().toLowerCase();
          });
      if (!$this.hasClass("clicked")) {
        $tags.toggleClass("highlighted", enter);
      }
    })
    .delegate('.tag', 'click', function(ev){
      var $this = $(this),
          $tags = $board.find(".tag").filter(function () {
            return $(this).text().toLowerCase() === $this.text().toLowerCase();
          });
      $tags.toggleClass("clicked");
      if ($this.hasClass("clicked")) {
        $tags.closest(".card").add($board).addClass("highlighted");
      } else {
        $tags.closest(".card").add($board).not(':has(.clicked)').removeClass("highlighted");
      }
    })
    .bind({
      "cardeditstart": function(ev) {
       $board.removeClass("highlighted")
          .find(".highlighted, .clicked").removeClass("highlighted clicked");
      },
      "sortbeforestop": function(ev, ui) {
        ui.item.css({ position:"", left: "", right: "", top: "", bottom: "" });
      }
    });
};

TASKBOARD.formatCardText = function (text) {
  /* turn #tags into nice spans */
  return text.replace(/(\s|^|>)(#\w*)\b/gi, "$1<span class='tag'>$2</span>");
};

TASKBOARD.init.initializers.push(TASKBOARD.init.tagging );

/* Templates */

TASKBOARD.templates = {
  board: "<section id='board'></section>",

  column: "<section class='column'></section>",

  card: "<section class='card'><div class='text'></div></section>"
};



/* Data */

TASKBOARD.data = {};

TASKBOARD.data.save = function () {
  localStorage.setItem('board', TASKBOARD.data.boardToJSON( $board ));
};

TASKBOARD.data.clear = function () {
  localStorage.clear();
  window.location = window.location;
};

TASKBOARD.data.load = function () {
  var stored = localStorage.getItem('board');
  return stored ? JSON.parse(stored) : TASKBOARD.data.dummy;
};

// quick and dirty way to store board changes:
// go through every single card on every change
TASKBOARD.data.boardToJSON = function ($board) {
  var data = { columns: [] };

  $board.columns().slice(0,-1).each(function () {
    var $column = $(this),
        column = { cards: [] };
    $column.find(".card").each(function () {
      var $card = $(this),
          card = {
            type: $.trim(this.className.replace("card", "")),
            text: $card.find(".text").data("value")
          };
      column.cards.push(card);
    });
    data.columns.push(column);
  });

  return JSON.stringify(data);
};

TASKBOARD.data.dummy = {
  columns: [
    {
      cards: [
        {
          type: "transparent",
          text: "<h2>To Do</h2>"
        },
        {
          type: "green",
          text: "<p>Removing #cards</p>"
        }
      ]
    },
    {
      cards: [
        {
          type: "transparent",
          text: "<h2>In Progress</h2>"
        },
        {
          type: "orange",
          text: "<p>Storing #board data</p>"
        },
        {
          type: "green",
          text: "<p>Editing #cards text</p>"
        }
      ]
    },
    {
      cards: [
        {
          type: "transparent",
          text: "<h2>Done</h2>"
        },
        {
          type: "yellow",
          text: "<p>Adding #columns</p>"
        },
        {
          type: "green",
          text: "<p>Adding #tags to #cards</p>"
        },
        {
          type: "green",
          text: "<p>Sorting #cards</p>"
        }
      ]
    }
  ]

};

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
        },
        maxHeight = 0,
        height;

    if(options) {
        $.extend(settings, options);
    }

    this.css(settings.css, "").each(function(i, el){
        height = $(el).height();
        if(maxHeight < height){
            maxHeight = height;
        }
    });
    return this.css(settings.css, maxHeight + settings.offset);
};

/*
 * Returns sumarized width (outer width with margins) of all elements.
 */
$.fn.sumWidth = function(){
    var sum = 0;
    this.each(function(){ sum += $(this).outerWidth(true); });
    return sum;
};
}(jQuery));

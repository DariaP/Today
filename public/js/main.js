$(function () {
  var Day = Backbone.Model.extend({
    done: "",
    diff: "",
    date: ""
  });

  var Days = Backbone.Collection.extend({
    model: Day,

    initialize: function() {
      var href = $(location).attr('href');
      var code = href.substring(href.indexOf("=") + 1);
      this.url = 'http://localhost:8000/days?code=' + code;
    }

  });

  var DayView = Backbone.View.extend({

    tagName:  "li",
    
    initialize: function() {
      this.template = _.template($('#day-template').html());
    },

    render: function() {
      this.$el.html(this.template(this.model.toJSON()));
      return this;
    }
  });

  var PageView = Backbone.View.extend({

    el: 'body',

    events: {
      "submit form": "newDayResults"
    },

    initialize: function() {
      this.days = new Days();
      this.listenTo(this.days, 'add', this.showDay);
      this.days.fetch();
    },

    newDayResults: function(e) {
      e.preventDefault();

      this.days.create({
        date: this.getDate(),
        done: this.$('textarea[name="done"]').val(),
        diff: this.$('textarea[name="diff"]').val()
      });
    },

    getDate: function() {
      var today = new Date();
      var dd = today.getDate();
      var mm = today.getMonth()+1; //January is 0!
      var yyyy = today.getFullYear();

      if(dd<10) {
          dd='0'+dd
      } 

      return mm+'/'+dd+'/'+yyyy;
    },

    showDay: function(day) {
      var dayView = new DayView({model: day}).render();
      this.$('ul').prepend(dayView.el);
    }
  });

  new PageView();
});
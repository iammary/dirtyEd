directory.EmployeeListView = Backbone.View.extend({

    tagName:'ul',

    id: 'employeeList',

    className:'nav nav-list',

    initialize:function () {
        var self = this;
        this.model.on("reset", this.render, this);
        this.model.on("add", function (employee) {
            self.$el.append(new directory.EmployeeListItemView({model:employee}).render().el);
        });
    },

    render:function () {
        this.$el.empty();
        _.each(this.model.models, function (employee) {
            this.$el.append(new directory.EmployeeListItemView({model:employee}).render().el);
        }, this);
        return this;
    }
});

directory.EmployeeListItemView = Backbone.View.extend({

    tagName:"li",

    initialize:function () {
        this.model.on("change", this.render, this);
        this.model.on("destroy", this.close, this);
    },

    render:function () {
        //console.log(this.model);
        this.$el.html(this.template(this.model.attributes));
        return this;
    }

});
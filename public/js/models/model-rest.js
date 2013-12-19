directory.Employee = Backbone.Model.extend({
    urlRoot:"/profiles"
});

directory.EmployeeCollection = Backbone.Collection.extend({

    model: directory.Employee,
    comparator: function(model) {
        return model.get('fullName').toLowerCase();
    },
    url:"/profiles"

});

directory.Profile = Backbone.Model.extend({
    urlRoot: "/profile"
});

directory.BasicField = Backbone.Model.extend({

    urlRoot:"/custom-fields/1",

    initialize:function () {
        this.reportsBasic = new directory.BasicFieldCollection();
    }

});

directory.BasicFieldCollection = Backbone.Collection.extend({

    model: directory.BasicField,

    url:"/custom-fields/1"

});
directory.CustFieldModel = Backbone.Model.extend({
    idAttribute: "_id",
    url: '/updatecustomfield',
    urlRoot: '/custom-fields'
});

directory.CustFieldsCollection = Backbone.Collection.extend({
    model: directory.CustFieldModel,
    url: '/custom-fields'
});
directory.CustomField = Backbone.Model.extend({

    urlRoot:"/custom-fields/0",

    initialize:function () {
        this.reportsCBasic = new directory.CustomFieldCollection();
    }

});

directory.CustomFieldCollection = Backbone.Collection.extend({

    model: directory.CustomField,
    url:"/custom-fields/0"

});
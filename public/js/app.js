var directory = {

    views: {},

    models: {},

    loadTemplates: function(views, callback) {

        var deferreds = [];

        $.each(views, function(index, view) {
            if (directory[view]) {
                deferreds.push($.get('tpl/' + view + '.html', function(data) {
                    directory[view].prototype.template = _.template(data);
                }, 'html'));
            } else {
                alert('tpl/' + view + '.html' + " not found");
            }
        });

        $.when.apply(null, deferreds).done(callback);
    }

};

function tz_err(key, sel, val, msg) {
    var ret;
    if (val) {
        if (!($("#errLogin div#err" + key).length > 0))
            $("#errLogin").append("<div id='err" + key + "'>" + msg + ".</div>")
        $(sel).closest('.form-group').addClass('error');
        $(sel).closest('.form-group').find('label').attr('for', 'inputError');
        ret = false;
    } else {
        $("#errLogin div#err" + key).remove();
        $(sel).closest('.form-group').removeClass('error');
        $(sel).closest('.form-group').find('label').attr('for', '');
        ret = true;
    }
    return ret;
}

function tz_err_inline(sel, val, msg) {
    var ret;
    if (val) {
        console.log("val is true");
        $(sel).closest('.form-group').find('.help-inline').html(msg)
        $(sel).closest('.form-group').addClass('error');
        $(sel).closest('.form-group').find('label').attr('for', 'inputError');
    } else {
        console.log("val is false");
        $(sel).closest('.form-group').find('.help-inline').html('')
        $(sel).closest('.form-group').removeClass('error');
        $(sel).closest('.form-group').find('label').attr('for', '');
    }
    return !val;
}

directory.Router = Backbone.Router.extend({

    routes: {
        "": "home",
        "contact": "contact",
        "employees/:id": "employeeDetails",
        "login": "login",
        "custfield": "custfield",
	"createAccount": "createAccount",
	"profile/:username": "profile"
    },

    initialize: function() {
        directory.shellView = new directory.ShellView();
        $('body').html(directory.shellView.render().el);
        // Close the search dropdown on click anywhere in the UI
        $('body').click(function() {
            $('.dropdown').removeClass("open");
        });
        this.$content = $("#content");
    },

    custfield: function() {
        var basicField = new directory.BasicField();
        var customField = new directory.CustomField();

        var self = this;

        basicField.fetch({
            success: function(data) {
                console.log(data);

                customField.fetch({
                    success: function(data2) {
                        console.log(data2);
                        var wrap = [data, data2];
                        self.$content.html(new directory.CustFieldView({
                            model: wrap
                        }).render().el);
                    }
                });
            }
        });

        if (!directory.custFieldView) {
            directory.custFieldView = new directory.CustFieldView();
            directory.custFieldView.render();
        } else {
            console.log('reusing home view');
            directory.custFieldView.delegateEvents(); // delegate events when the view is recycled
        }
        this.$content.html(directory.custFieldView.el);
        directory.shellView.selectMenuItem('cust-menu');
    },

    createAccount: function() {
        var basicFields     = new directory.BasicField,
            customFields    = new directory.CustomField,
            self            = this;

        basicFields.fetch({
            success: function(basicDocs) {

                customFields.fetch({
                    success: function(customDocs) {
                        self.$content.html(new directory.CreateAccountView({
                            collection: {
                                basic   : basicDocs,
                                custom  : customDocs
                            }
                        }).render().el);
                    }
                });
            }
        });

        if (!directory.createAccountView) {
            directory.createAccountView = new directory.CreateAccountView();
            directory.createAccountView.render();
        } else {
            console.log('reusing home view');
            directory.createAccountView.delegateEvents(); // delegate events when the view is recycled
        }
        this.$content.html(directory.createAccountView.el);
        directory.shellView.selectMenuItem('createAccount-menu');
    },

    profile: function(username) {
	var userProfile  = new directory.Profile({ id: username }),
	    customFields = new directory.CustFieldsCollection,
	    self         = this;

	userProfile.fetch({
	    success: function(userData) {

		customFields.fetch({
		    success: function(fieldData) {
			self.$content.html(new directory.ProfileView({
			    collection: {
				user    : userData,
				fields  : fieldData
			    }
			}).render().el);
		    }
		});
	    }
	});

	if (!directory.profileView) {
	    directory.profileView = new directory.ProfileView();
	    directory.profileView.render();
	} else {
	    console.log('reusing home view');
	    directory.profileView.delegateEvents(); // delegate events when the view is recycled
	}
	this.$content.html(directory.profileView.el);
	directory.shellView.selectMenuItem('');
    },

    employeeDetails: function(id) {
        var employee = new directory.Employee({
            id: id
        });
        var self = this;
        employee.fetch({
            success: function(data) {
                console.log(data);
                // Note that we could also 'recycle' the same instance of EmployeeFullView
                // instead of creating new instances
                self.$content.html(new directory.EmployeeView({
                    model: data
                }).render().el);
            }
        });
        directory.shellView.selectMenuItem();
    },

    home: function() {
        
        directory.homeView = new directory.HomeView();

        this.$content.html(directory.homeView.render().el);
        directory.shellView.selectMenuItem('home-menu');
    },

    contact: function() {
        if (!directory.contactView) {
            directory.contactView = new directory.ContactView();
            directory.contactView.render();
        }
        this.$content.html(directory.contactView.el);
        directory.shellView.selectMenuItem('contact-menu');
    },

    login: function() {
        // Since the home view never changes, we instantiate it and render it only once
        if (!directory.loginView) {
            directory.loginView = new directory.LoginView();
            directory.loginView.render();
        } else {
            console.log('reusing home view');
            directory.loginView.delegateEvents(); // delegate events when the view is recycled
        }
        this.$content.html(directory.loginView.el);
        directory.shellView.selectMenuItem('login-menu');
    }

});

$(document).on("ready", function() {
    directory.loadTemplates([
            "HomeView",
            "ContactView",
            "ShellView",
            "EmployeeView", 
            "EmployeeSummaryView", 
            "EmployeeListItemView", 
            "LoginView", 
            "CustFieldView", 
            "bfListItemView", 
            "cfListItemView", 
            "bfEditItemView", 
            "bfEditViewItemView",
            "cfEditItemView",
            "cfEditItemViewAttr",
            "cfEditItemViewType",
            "cfEditItemViewLbl",
            "CreateAccountView",
            "FormFieldListItemView",
	    "ModalView",
	    "ProfileView"
        ],
        function() {
            directory.router = new directory.Router();
            Backbone.history.start();
        });
});

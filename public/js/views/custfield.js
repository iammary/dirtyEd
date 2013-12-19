var dDown = [{
    id: 1,
    label: 'Textbox',
    mult: 0
}, {
    id: 2,
    label: 'Text Area',
    mult: 0
}, {
    id: 3,
    label: 'Dropdown',
    mult: 1
}, {
    id: 4,
    label: 'Radio Button',
    mult: 1
}, {
    id: 5,
    label: 'Check Box',
    mult: 1
}];

function getIndex(text) {
    var id = null;
    for (var i = 0; i < dDown.length; i++) {
        if (dDown[i].label == text) {
            id = dDown[i]
            break;
        }
    }
    return id;
}

function getIndexText(index) {
    var id = null;
    for (var i = 0; i < dDown.length; i++) {
        if (dDown[i].id == index) {
            id = dDown[i].label
            break;
        }
    }
    return id;
}

function getIndexById(idx) {
    var id = null;
    for (var i = 0; i < dDown.length; i++) {
        if (dDown[i].id == idx) {
            id = dDown[i]
            break;
        }
    }
    return id;
}

directory.cfListView = Backbone.View.extend({

    tagName: 'tbody',

    className: 'customs',

    render: function() {
        this.$el.empty();
        var firstProp;
        if (this.model)
            for (var key in this.model["attributes"]) {
                if (this.model["attributes"].hasOwnProperty(key)) {
                    this.$el.append(new directory.cfListItemView({
                        model: this.model["attributes"][key]
                    }).render().el);
                }
            }
        return this;
    }
});

directory.cfListItemView = Backbone.View.extend({

    events: {
        "click #custEditer": "custEditer",
        "click #custCanceller": "custCanceller" //,
        //"click #custSaver": "custSaver"
    },

    tagName: "tr",

    render: function() {
        var data = _.clone(this.model);

        data.newType = getIndexText(data.fieldType);
        data.newValues = data.values.join(', ')
        data.isPublicStr = data.isPublic ? "Public" : "Private"
        data.isRequiredStr = data.isRequired ? "Required" : "Optional"
        data.isEditableStr = data.isEditable ? "Editable" : "Permanent"

        this.$el.html(this.template(data));

        this.$el.find('#delcust' + data._id).confirmation({
            "animation": "true",
            "singleton": "true",
            "title": "Do you really want to delete this field?",
            "popout": "true",
            onConfirm: function() {

                $(this).closest("tr").remove();
                $.ajax({
                    url: "/custom-fields/" + data._id,
                    type: 'delete',
                    async: false,
                    success: function(result) {
                        //$("#info-cust").html("Item Successfully Deleted");
                        //$("#info-cust").css('display', 'block').css('visibility', 'visible');
                    },
                    error: function(result) {
                        $("#err-cust").html("There was an error trying to Delete Item");
                        $("#err-cust").css('display', 'block').css('visibility', 'visible');
                    }
                });
                //perform delete here

                //Call below for success
                //$("#info-cust").html("success message")
                //$("#info-cust").css('display', 'block').css('visibility', 'visible');

                //Call below for error
                //$("#err-cust").html("error message")
                //$("#err-cust").css('display', 'block').css('visibility', 'visible');

                return false;
            }
        });
        return this;
    },

    custEditer: function(ev) {
        $(ev.target).parent().find('.isedit').css('display', 'inline-block').css('visibility', 'visible')
        $(ev.target).css('display', 'none').css('visibility', 'hidden')

        var values = $(ev.target).closest("td").prev();
        var attributes = values.closest("td").prev();
        var typest = attributes.closest("td").prev();
        var label = typest.closest("td").prev();

        this.model.isPublicStr = this.model.isPublic ? "Public" : "Private"
        this.model.isRequiredStr = this.model.isRequired ? "Required" : "Optional"
        this.model.isEditableStr = this.model.isEditable ? "Editable" : "Permanent"
        this.model.newType = getIndexText(this.model.fieldType);
        this.model.isEdit = true;

        values.html(new directory.bfEditItemView({
            model: this.model
        }).render().el);
        attributes.html(new directory.cfEditItemView({
            model: this.model
        }).render().el);
        typest.html(new directory.cfEditItemViewType({
            model: this.model
        }).render().el);
        label.html(new directory.cfEditItemViewLbl({
            model: this.model
        }).render().el);

        var par = $(ev.target).parent();
        var innerModel = this.model;

        $(ev.target).closest("td").find('#custSaver').confirmation({
            "animation": "true",
            "singleton": "true",
            "title": "Do you really want to save changes?",
            "popout": "true",
            onConfirm: function() {

                var parTr = $(ev.target).closest('tr');
                var lbl = parTr.find('#lableParam');
               // console.log(isNullOrWhiteSpace(lbl.val()));
                var isValid = tz_err_inline(lbl, isNullOrWhiteSpace(lbl.val()), "Please fill up empty field.")
                if (getIndexById(parTr.find('#fieldTypeDDownId').val()).mult == 1) {
                    var val = parTr.find('#valyy');
                    var temp = true;
                    var obj = val.closest("td").find("input[type=text]");

                    obj.each(function() {
                        temp = !isNullOrWhiteSpace($(this).val()) && temp;
                    });
                    tz_err_inline(obj.first(), !temp,"Please fill up empty field.")
                    isValid = isValid && temp;
                }
                if (isValid) {
                    //Call below for success
                    //$("#info-cust").html("success message")
                    //$("#info-cust").css('display', 'block').css('visibility', 'visible');

                    var container = par.closest("tr");

                    var tId = container.find("input[name=id]").val();
                    var lblx = container.find("input[name=lableParam]").val();
                    var ftype = container.find("input[name=fieldTypeDDownId]").val();
                    var pub = container.find("input[name=public]").val();
                    var req = container.find("input[name=required]").val();
                    var ed = container.find("input[name=editable]").val();
                    var cfDataInner = new Array();
                    container.find("input[name=val]").each(function() {
                        cfDataInner.push($(this).val())
                    });

                    //   declare our model
                    var cf = new directory.CustFieldModel;

                    // set the route url 
                    cf.url = cf.url + "/" + tId;

                    cf.save({
                        values: cfDataInner,
                        label: lblx,
                        fieldType: ftype,
                        isPublic: pub == 'true',
                        isRequired: req == 'true',
                        isEditable: ed == 'true'
                    }, {
                        success: function(model, response) {
                            //$("#info-basic").html("");
                            //$("#info-basic").css('display', 'block').css('visibility', 'visible');
                            //its from a trusted source
                            var modded = eval("(" + JSON.stringify(model) + ")");
                            modded._id = tId;

                            par.closest("tr").replaceWith(new directory.cfListItemView({
                                model: modded
                            }).render().el);
                        },
                        error: function(model, response) {
                            $("#err-basic").html(response);
                            $("#err-basic").css('display', 'block').css('visibility', 'visible');
                        }
                    });
                } else {
                    console.log("please fill up empty fields");
                }

                return false;
            }
        });
    },

    custCanceller: function(ev) {
        this.model.isEdit = false;

        var values = $(ev.target).closest("td").prev();
        var attributes = values.closest("td").prev();
        var typest = attributes.closest("td").prev();
        var label = typest.closest("td").prev();

        values.html(new directory.bfEditViewItemView({
            model: this.model
        }).render().el);
        attributes.html(new directory.cfEditItemViewAttr({
            model: this.model
        }).render().el);
        typest.html(new directory.cfEditItemViewType({
            model: this.model
        }).render().el);
        label.html(new directory.cfEditItemViewLbl({
            model: this.model
        }).render().el);

        $(ev.target).parent().find('.isedit').css('display', 'none').css('visibility', 'hidden');
        $(ev.target).parent().find('.thisedit').css('display', 'inline-block').css('visibility', 'visible');
    }
});

function isNullOrWhiteSpace(str) {
    return str === null || str.match(/^ *$/) !== null;
}

directory.cfEditItemView = Backbone.View.extend({
    render: function() {
        var data = _.clone(this.model);
        data.newValues = data.values.join(', ');
        data.isMult = getIndexById(data.fieldType).mult;
        this.$el.html(this.template(data));
        return this;
    }
});

directory.cfEditItemViewAttr = Backbone.View.extend({
    render: function() {
        var data = _.clone(this.model);
        data.isPublicStr = data.isPublic ? "Public" : "Private"
        data.isRequiredStr = data.isRequired ? "Required" : "Optional"
        data.isEditableStr = data.isEditable ? "Editable" : "Permanent"
        this.$el.html(this.template(data));
        return this;
    }
});

directory.cfEditItemViewType = Backbone.View.extend({
    events: {
        "click .ddb": "changedDown"
    },

    changedDown: function(ev) {
        var text = $(ev.target).html();
        var obj = getIndex(text);
        var par = $(ev.target).closest("tr");
        par.find("#fieldTypeDDownBtn").html(text);
        par.find("#fieldTypeDDownId").val(obj.id)

        par.find("#addValues").children().each(function() {
            $(this).remove();
        });

        this.model.fieldType = obj.id;
        par.find(".valx").html(new directory.bfEditItemView({
            model: this.model
        }).render().el);
    },

    render: function() {
        var data = _.clone(this.model);
        data.newType = getIndexText(data.fieldType);
        this.$el.html(this.template(data));

        if (data.isEdit)
            for (var i = 0; i < dDown.length; i++) {
                if (i == data.fieldType - 1) {
                    this.$el.find("#fieldTypeDDownBtn").html(dDown[i].label);
                    this.$el.find("#fieldTypeDDownId").val(i + 1);
                }
                this.$el.find("#fieldTypeDDown").append("<li class='ddb'><a>" + dDown[i].label + "</a></li>");
            };
        return this;
    }
});

directory.cfEditItemViewLbl = Backbone.View.extend({
    render: function() {
        var data = _.clone(this.model);
        this.$el.html(this.template(data));
        return this;
    }
});

directory.bfListView = Backbone.View.extend({

    tagName: 'tbody',

    className: 'basics',

    render: function() {
        this.$el.empty();
        var firstProp;
        if (this.model)
            for (var key in this.model["attributes"]) {
                if (this.model["attributes"].hasOwnProperty(key)) {
                    this.$el.append(new directory.bfListItemView({
                        model: this.model["attributes"][key]
                    }).render().el);
                }
            }
        return this;
    }
});

directory.bfListItemView = Backbone.View.extend({

    events: {
        "click #basicEditer": "basicEditer",
        "click #basicCanceller": "basicCanceller"
    },

    tagName: "tr",

    render: function() {
        var data = _.clone(this.model);

        data.newType = getIndexText(data.fieldType);
        data.newValues = data.values.join(', ')
        data.isPublicStr = data.isPublic ? "Public" : "Private"
        data.isRequiredStr = data.isRequired ? "Required" : "Optional"
        data.isEditableStr = data.isEditable ? "Editable" : "Permanent"

        this.$el.html(this.template(data));

        return this;
    },

    basicEditer: function(ev) {
        var par = $(ev.target).closest("td");
        var elm = $(this.el);
        var innerModel = this.model;

        par.closest("td").prev().html(new directory.bfEditItemView({
            model: innerModel
        }).render().el);
        par.closest("td").html("<button class=\"btn btn-primary saveBast" + innerModel._id + "\" id=\"basicSaver\">save</button><button class=\"btn btn-default\" id=\"basicCanceller\">cancel</button>");

        par.closest("td").find('.saveBast' + innerModel._id).confirmation({
            "animation": "true",
            "singleton": "true",
            "title": "Do you really want to save changes?",
            "popout": "true",
            onConfirm: function() {

                var parTr = par.closest('tr');
                var isValid = true;

                if (parTr.find("input[type=text]").length > 1) {
                    parTr.find("input[type=text]").each(function() {
                        isValid = tz_err_inline($(this), isNullOrWhiteSpace($(this).val()), "Please fill up empty field.") && isValid
                    });
                }

                if (isValid) {

                    //  get the id first
                    var tId = par.closest("tr").find("input").serializeArray()[0].value;

                    //   store all values but delete the first element since it is from the ID field
                    sdata = par.closest("tr").find("input").serializeArray();
                    sdata.shift();
                    //   declare our model
                    var cf = new directory.CustFieldModel;

                    // set the route url 
                    cf.url = cf.url + "/" + tId;

                    var cfData = new Array();

                    sdata.forEach(function(entry) {
                        cfData.push(entry.value);
                    });

                    cf.save({
                        values: cfData
                    }, {
                        success: function(model, response) {
                            //$("#info-basic").html("");
                            //$("#info-basic").css('display', 'block').css('visibility', 'visible');
                            //its from a trusted source
                            var modded = eval("(" + JSON.stringify(model) + ")");

                            innerModel.values = modded.values

                            par.closest("tr").replaceWith(new directory.bfListItemView({
                                model: innerModel
                            }).render().el);
                        },
                        error: function(model, response) {
                            $("#err-basic").html(response);
                            $("#err-basic").css('display', 'block').css('visibility', 'visible');
                        }
                    });
                }

                return false;
            }
        });
    },

    basicCanceller: function(ev) {
        $(ev.target).closest("td").prev().html(new directory.bfEditViewItemView({
            model: this.model
        }).render().el);
        $(ev.target).closest("td").html("<button class=\"btn btn-default\" id=\"basicEditer\">edit</button>");
    },
});

directory.bfEditItemView = Backbone.View.extend({
    render: function() {
        var data = _.clone(this.model);
        data.newValues = data.values.join(', ');
        data.isMult = getIndexById(data.fieldType).mult;
        this.$el.html(this.template(data));
        return this;
    }
});

directory.bfEditViewItemView = Backbone.View.extend({
    render: function() {
        var data = _.clone(this.model);
        data.newValues = data.values.join(', ');
        this.$el.html(this.template(data));
        return this;
    }
});

// directory.CustFieldModel = Backbone.Model.extend({
//    url: 'http://localhost:3000/custom-fields'
// });

// directory.CustFieldsCollection = Backbone.Collection.extend({
//    model: directory.CustFieldModel,
//    url: 'http://localhost:3000/custom-fields'
// });

function finisher(callback){

}

directory.CustFieldView = Backbone.View.extend({

    events: {
        "click .ddb": "changedDown",
        "click #addbutn": "addFields",
        "click .remVal": "remFields",
        "click #clker": "toggleHider",
        "click #login": "submiter",
        "submit #customFieldForm": "submiter"
    },

    render: function() {
        this.$el.html(this.template());

        for (var i = 0; i < dDown.length; i++) {
            if (i == 0) {
                this.$el.find("#fieldTypeDDownBtn").html(dDown[i].label);
                this.$el.find("#fieldTypeDDownId").val(1);
            }
            this.$el.find("#fieldTypeDDown").append("<li class='ddb'><a>" + dDown[i].label + "</a></li>");
        };

        if (this.model && this.model[0])
            $(this.el).find(".basics").append(new directory.bfListView({
                model: this.model[0]
            }).render().el);

        if (this.model && this.model[1]) {
            $(this.el).find(".customs").append(new directory.cfListView({
                model: this.model[1]
            }).render().el);
        }

        return this;
    },

    changedDown: function(ev) {
        var text = $(ev.target).html();
        var obj = getIndex(text);
        $("#fieldTypeDDownBtn").html(text);
        $("#fieldTypeDDownId").val(obj.id)

        $("#addValues").children().each(function() {
            $(this).remove();
        });

        tz_err_inline("#lableParam", false, "");
        tz_err_inline("#valxx", false, "");

        if (obj.mult == 0)
            $("#addbutn").css('display', 'none').css('visibility', 'hidden');
        else
            $("#addbutn").css('display', 'inline-block').css('visibility', 'visible');

    },

    addFields: function() {
        $("#addValues").append(
            "<div style=\"vertical-align: top; display: block; margin-left: 0px;\" class=\"newval btn-group\">" +
            "     <input type=\"text\" class=\"form-control\" id=\"label\" placeholder=\"value\" name=\"value\" style=\"margin-bottom: 0px;\">" +
            "     <button style=\"text-align: right;\" class=\"btn remVal\"><i class=\"icon-minus\"></i>" +
            "     </button>" +
            //"     <label class=\"control-label help-inline\"for=\"\">" +
            "     </label>" +
            "</div>");
    },

    remFields: function(ev) {
        $(ev.target).closest('.newval').remove();
    },

    toggleHider: function() {
        $("#info").css('display', 'none').css('visibility', 'hidden');

        if ($("#addHider").css('display') == "none")
            $("#addHider").css('display', 'block').css('visibility', 'visible');
        else
            $("#addHider").css('display', 'none').css('visibility', 'hidden');
    },

    submiter: function(x) {
        $("#info").css('display', 'none').css('visibility', 'hidden');
        var errorFields;
        var isValid = true;
        var temp = false;
        var flag = 0;
        isValid = isValid && tz_err_inline("#lableParam", isNullOrWhiteSpace($('#lableParam').val()), "Please fill up empty field.");//check label 
        if (getIndexById($("#fieldTypeDDownId").val()).mult == 1){
            isValid = isValid && tz_err_inline("#valxx", isNullOrWhiteSpace($('#valxx').val()), "Please fill up empty field.");// check the first value
           
            console.log('more than 1');
            $('#addValues').find("input[type='text']").each(function(i){
                var chk = isNullOrWhiteSpace($(this).val());
                temp = isNullOrWhiteSpace($(this).val()) || temp;
                var r = $(this).find('input[type=text]')
                console.log(i);
                if(i>=0){// if multiple
                    flag=1;
                }
            });
        }
        
        var def_val = isValid && !temp;
        if(flag ==1){
            tz_err_inline('#valxx', !def_val, "Please fill up empty field.");// check the first value
        }
              
        isValid = isValid && !temp;        
            
            
        if (isValid) {
            //PERFORM SAVE HERE
            this.submitForm();
            $("#addValues").children().each(function() {//remove extra fields
                $(this).remove();
            });

            $("#addHider").css('display', 'none').css('visibility', 'hidden');
            $("#lableParam").val("");

            for (var i = 0; i < dDown.length; i++) {
                if (i == 0) {
                    $("#fieldTypeDDownBtn").html(dDown[i].label);
                    $("#fieldTypeDDownId").val(1);
                }
            };

            $("#valxx").val("");

            $("#info").html("Successfully added new field.")
            $("#info").css('display', 'block').css('visibility', 'visible');
            //$("#error").html("Problems with the operation")
            //$("#error").css('display', 'block').css('visibility', 'visible');
        }else{
            console.log("isvalid is false. should not submit.");
        }

        return false;
    },

    submitForm: function() {
        //evt.preventDefault();
        var custFieldData = this.getFormData($('#customFieldForm')); //JSON.stringify(this.getFormData($('#customFieldForm')));
        var customField = new directory.CustFieldModel;

        customField.url = customField.urlRoot;
        var rawMod = this.model;
        var rawEl = $(this.el);

        //customField.set(JSON.parse(custFieldData));
        customField.save({
            label: custFieldData.label,
            fieldType: custFieldData.fieldType,
            values: custFieldData.values,
            isRequired: custFieldData.isRequired,
            isPublic: custFieldData.isPublic,
            isEditable: custFieldData.isEditable,
            isBasic: false,
            isActive: true
        }, {
            success: function(model, response) {

            },
            error: function(model, response) {
                if (rawMod && rawMod[1]) {
                    rawEl.find(".customs").html("");

                    var dd = JSON.parse(JSON.stringify(rawMod[1]))
                    dd[666] = model;

                    //alert(JSON.stringify(dd))
                    //alert(JSON.stringify(rawMod[1]))

                    var customFieldx = new directory.CustomField();
                    customFieldx.fetch({
                        success: function(data2) {
                            rawEl.find(".customs").html("");
                            rawEl.find(".customs").append(new directory.cfListView({
                               model: data2
                            }).render().el);
                        }
                    });

                    //rawEl.find(".customs").append(new directory.cfListView({
                    //    model: rawMod[1]
                    //}).render().el);
                }
            }
        });
    },

    getFormData: function(form) {
        var FormArray = form.serializeArray(),
            mappedData = this.mapSerializedArray(FormArray),
            data = {};

        var values = $("input[name='value']").map(function() {
            return ($(this).val()).trim();
        }).get()

        data = {
            label: mappedData.lableParam,
            fieldType: mappedData.fieldType,
            values: values,
            isRequired: this.toggledCheckbox('isRequired'),
            isPublic: this.toggledCheckbox('isPublic'),
            isEditable: this.toggledCheckbox('isEditable')
        }

        return data;
    },

    mapSerializedArray: function(array) {
        var obj = {};

        $.map(array, function(value, index) {
            obj[value['name']] = value['value'].trim();
        });
        return obj;
    },

    toggledCheckbox: function(btn) {
        return $('button[name="' + btn + '"]').hasClass('active') ? true : false;
    }
});

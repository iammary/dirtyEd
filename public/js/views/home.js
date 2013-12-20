directory.HomeView = Backbone.View.extend({

    initialize: function() {
        var self = this;
        this.directoryListing = new directory.EmployeeCollection();
        this.directoryListingView = new directory.EmployeeListView({model: this.directoryListing});
        this.directoryListing.fetch({ reset: true });
        this.directoryListing.on('reset', this.paginate, this);
        this.perPage = 10;
        this.shownPageLink = 3;
        this.Pages = 0;
        this.totalEmployees = 0;
        this.holder = '#employeeList';
        this.activateIndexClass ='';
        this.spanHolder = 'div.holder span a.';
        this.prevNextHolder = 'div.holder a.';
        this.currentLastLink = this.shownPageLink;
        this.currentFirstLink = 1;
    },

    render: function () {
        this.$el.html(this.template());
        $('.directory-list', this.el).append(this.directoryListingView.render().el);
        return this;
    },

    events: {
        "change #sortby": "sortnow",
        "click .pageLink": "showHideList",
        "click .prevnext": "goPrevNext"
    },

    sortnow: function(e) {
        this.directoryListing.comparator = function(model) {
            switch(parseInt(e.target.value)) {
                case 1:
                    return [model.get('field')[2][0].toLowerCase(), model.get('fullName').toLowerCase()];
                    console.log('Sorted by Job Position');
                    break;
                case 2:
                    return model.get('fullName').toLowerCase();
                    console.log('Sorted by First Name');
                    break;
                default:
                    return [model.get('field')[1][0].toLowerCase(), model.get('field')[0][0].toLowerCase()];
                    console.log('Sorted by Last Name');
            }   
        };
        this.directoryListing.sort();
        this.directoryListing.fetch({reset: true});
    },

    paginate: function(e) {
        var prev = '<a href="#" class="prevlink prevnext" style="display: none"> Previous </a> ',
            next = '<a href="#"" class="lastlink prevnext"> Next </a>',
            appendThis = prev + '<span>',
            pages;
            this.totalEmployees = $(this.holder + ' li').length;
            console.log(this.perPage);
        pages = Math.ceil( this.totalEmployees / this.perPage );
        this.Pages = pages;
        for (var i = 1; i <= this.Pages; i++) {
            if(i == 1)
                appendThis += ' <a class="pageLink link_' + i + ' active"';
            else
                appendThis += ' <a href="#" class="pageLink link_' + i + '"';
            if(i > this.shownPageLink)
                appendThis += ' style="display:none;"';
            appendThis += '> ' + i + ' </a>';
        };
        appendThis += '</span>' + next + '<br /> <p class="showing"> Showing <span class="shown"> ' + this.totalEmployees + ' </span> of ' + this.totalEmployees +'</p>';
        $('div.holder').html(appendThis);
        this.showHideList();
    },

    showHideList: function(e) {
        if(e) {
            e.preventDefault();
            this.activateIndexClass = 'link_' + e.target.text;

            this.addRemClass();
        } 
        this.pageNow();
    },

    goPrevNext: function(e) {
        if(e) {
            e.preventDefault();
            
            if(e.target.href) {
                var currentLink = $(this.spanHolder + 'active').text(),
                    nextLink, prevLink;
                if (e.target.classList[0]==='lastlink') {
                    nextLink = parseInt(currentLink) + 1;
                    this.activateIndexClass= 'link_' + nextLink.toString();
                    if (nextLink>this.currentLastLink) {
                        $(this.spanHolder + 'pageLink').hide();
                        for(var i = nextLink; i<= (nextLink+this.Pages); i++) {
                            if(nextLink <= $(this.holder + ' li').length) {
                                $(this.spanHolder + 'link_' + i).show();
                            } else {
                                break;
                            }
                        }
                        this.currentLastLink = nextLink + this.Pages;
                        this.currentFirstLink = this.currentLastLink - this.Pages;
                    }
                } else {
                    prevLink = parseInt(currentLink) - 1;
                    this.activateIndexClass = 'link_' + prevLink.toString();
                    if (prevLink<this.currentFirstLink) {
                        $(this.spanHolder + 'pageLink').hide();
                        console.log(this.currentFirstLink);
                        for(var i = this.currentFirstLink-1; i > (this.currentFirstLink-this.Pages); i--) {
                            if(this.currentFirstLink >= 1) {
                                $(this.spanHolder + 'link_' + i).show();
                            } else {
                                break;
                            }
                        }
                        this.currentFirstLink = prevLink - this.Pages;
                        this.currentLastLink = this.currentFirstLink + this.Pages;
                    }
                }
                this.addRemClass();
                this.pageNow();
            }
        }
    },

    addRemClass: function(e) {
        $(this.spanHolder + 'active').attr('href','#');
        $(this.spanHolder + 'active').toggleClass('active');
        
        $(this.spanHolder + this.activateIndexClass).addClass('active');
        $(this.spanHolder + this.activateIndexClass).removeAttr('href');

        if(parseInt($(this.spanHolder + 'active').text())==this.Pages) {
            $(this.prevNextHolder + 'lastlink').hide();
        } else {
            $(this.prevNextHolder + 'lastlink').show();
        }
        if(parseInt($(this.spanHolder + 'active').text())==1) {
            $(this.prevNextHolder + 'prevlink').hide();
        } else {
            $(this.prevNextHolder + 'prevlink').show();
        }
    },

    pageNow: function(e) {
        $(this.holder + ' li').hide();
        var i;
        var activeIndex = $('.holder span a.active').text(),
            start = 1 + ((activeIndex -1) * this.perPage),
            end = start + this.perPage;
            console.log('start:' + start + ' end: ' + end);
        for(i = start; i < end; i++) {
            if(i > this.totalEmployees) {
                break;
            }
            $(this.holder + ' li:nth-child(' + i +')').toggle();
        }  
        $('.shown').text(start + ' - ' + (i-1));
    }
});

var genusers = function (num) {
    var users = [];
    for (var i = 0; i < num; i++) {
        users.push({
            id: i+1,
            name: "user" + (i+1),
            mobile: "1234567897",
            email: "dong@xinda.im",
            backgroundColor: 'antiquewhite'
        })
    }
    return users;
};

var users = genusers(10);

var maxId = users.length;

var app = new Vue({
    el: '#app',
    data: {
        contactusers: users,
        curuser: null,
        curindex: null,
        needscroll: false
    },
    updated: function () {
        if (this.needscroll) {
            var list = document.getElementById("list");
            list.scrollTop = list.scrollHeight;
            this.needscroll = false;
        }
    },
    methods: {
        adduser: function () {
            maxId++;
            var user = {
                id: maxId,
                name: "未命名",
                mobile: "",
                email: "",
                backgroundColor: 'antiquewhite'
            };
            this.contactusers.push(user);
            this.selectuser(user, this.contactusers.length - 1);
            this.needscroll = true;
        },
        selectuser: function (user, index) {
            if (this.curuser !== null) {
                this.curuser.backgroundColor = 'antiquewhite';
            }
            this.curuser = user;
            this.curindex = index;
            this.curuser.backgroundColor = 'chartreuse';
        },
        deleteuser: function (user, index) {
            this.contactusers.splice(index, 1);
            if (this.curindex === index) {
                this.curuser = null;
                this.curindex = null;
            }
        },
        modifyinfo: function () {
            var user = this.contactusers[this.curindex];
            user.name = this.curuser.name;
            user.mobile = this.curuser.mobile;
            user.email = this.curuser.email;
        },
        mouseover: function (user, index) {
            user.backgroundColor = 'chartreuse';
        },
        mouseout: function (user, index) {
            if (this.curindex !== index) {
                user.backgroundColor = 'antiquewhite';
            }
        }
    }
});

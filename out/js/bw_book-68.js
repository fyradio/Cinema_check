Vue.use({
    install(Vue) {
        Object.defineProperty(Vue.prototype, "$qs", {
            writable: false,
            value: window.Qs
        });
    }
});
Vue.use(VueLoading);
Vue.component('loading', VueLoading)
var broadapp = new Vue({
    el: '#broadapp',
    data: {
        選擇影城: "Zhubei",
        programid: "",
        classdata: [],
        moviesdata: [],
        username: "",
        login: "N",
        confirm:""
    },
    async created() {
        await this.loadtheater();
        var getUrlString = location.href;
        var url = new URL(getUrlString);
        var sid = url.searchParams.get('obj');
        if (sid != null) { this.選擇影城 = sid; }
        var pid = url.searchParams.get('pid');
        if (pid != null) { this.programid = pid; this.loadsingleshow(); } else {
            this.loadshow();
        }
        this.loaduser();
    },
    methods: {
        async loadtheater() {
            var url = "Movie/GetTheater";
            axios.get(url).then(e => {
                var result = e.data;
                if (result.status) {
                    this.classdata = result.Data;
                    this.classdata.splice(0, 1);
                }
            }).catch(function (error) {
                console.log(error);
            });
        },
        loadsingleshow() {
            var url = "Movie/GetSingleMovie/" + this.選擇影城 + "/" + this.programid;
            axios.get(url).then(e => {
                var result = e.data;
                if (result.status) {
                    this.moviesdata = result.Data;
                } else {
                    this.moviesdata = null;
                }
                loader.hide();                
            }).catch(function (error) {
                console.log(error);
            });
        },
        loadshow() {
            let loader = this.$loading.show({
                loader: 'spinner',
                color: 'blue',
                Backgroundcolor: 'white'
            });
            var url = "Movie/GetMovieList/" + this.選擇影城;
            axios.get(url).then(e => {
                var result = e.data;
                if (result.status) {
                    this.moviesdata = result.Data;
                } else {
                    this.moviesdata = null;
                }
                loader.hide();
            }).catch(function (error) {
                loader.hide();
                console.log(error);
            });
        },
        selectdate: function (item1, datedata, item) {
            var d = item1.date;
            for (let i = 0; i < datedata.length; i++) {
                if (datedata[i].date === d) { datedata[i].active = true; } else { datedata[i].active = false; }
            }
            var url = "Movie/GetMovieAlltime/" + this.選擇影城 + "/" + item.programid + "/" + d;
            item.timedata.length = 0;
            axios.get(url).then(e => {
                var result = e.data;
                if (result.status) {
                    item.timedata = result.Data;
                }
            }).catch(function (error) {
                console.log(error);
            });
        },
        selecttime: function (item3, timedata) {
            if (!item3.disable && !item3.active) {
                var h = item3.hall;
                var t = item3.時間;
                for (let i = 0; i < timedata.length; i++) {
                    var tt = timedata[i].subtimedata;
                    for (let j = 0; j < tt.length; j++) {
                        if (tt[j].hall === h && tt[j].時間 === t) { tt[j].active = true; }
                        else { tt[j].active = false; }
                    }

                }
            }
        },
        viewseat: function (item) {
            var programid = item.programid;
            var datedata = item.datedata;
            var timedata = item.timedata;
            var date = "";
            //for (let i = 0; i < datedata.length; i++) {
            //    if (datedata[i].active) { date = datedata[i].date; }
            //}
            var time = "";
            var hall = "";
            for (let j = 0; j < timedata.length; j++) {
                var tt = timedata[j].subtimedata;
                for (let k = 0; k < tt.length; k++) {
                    if (tt[k].active) {
                        time = tt[k].時間;
                        time = time.replace(':', '-');
                        hall = tt[k].hall;
                        date = tt[k].showdate;
                    }
                }
            }
            if (hall === "") { alert("請先選擇場次"); }
            else {
                var url = "quick-view.html?obj=" + this.選擇影城 + "," + programid + "," + date + "," + time + "," + hall;
                window.open(url, "_blank");
            }
        },
        bookseat: function (item) {
            var programid = item.programid;
            var cname = item.cname;
            var ename = item.ename;
            var datedata = item.datedata;
            var timedata = item.timedata;
            var filmlevel = item.filmlevel;
            var image = item.image;
            var date = "";
            var week = "";
            var SubName2 = "";
            var SubCode = "";
            //for (let i = 0; i < datedata.length; i++) {
            //    if (datedata[i].active) { date = datedata[i].date; week = datedata[i].星期; }
            //}
            var time = "";
            var hall = "";
            var hallname = "";
            for (let j = 0; j < timedata.length; j++) {
                var tt = timedata[j].subtimedata;
                for (let k = 0; k < tt.length; k++) {
                    if (tt[k].active) {
                        time = tt[k].時間;
                        hall = tt[k].hall;
                        hallname = tt[k].hallname;
                        SubName2 = tt[k].SubName2;
                        SubCode = tt[k].SubCode;
                        date = tt[k].showdate;
                    }
                }
            }
            if (hall === "") { alert("請先選擇場次"); }
            else {
                var obj = new Object();
                obj.sts = true;
                obj.SiteID = this.選擇影城;
                obj.SiteIDName = "";
                for (let i = 0; i < this.classdata.length; i++) {
                    if (this.classdata[i].item_value === obj.SiteID) { obj.SiteIDName = this.classdata[i].item_name; }
                }
                alert("您現在選擇的影城是【" + obj.SiteIDName + "】");

                obj.programid = programid;
                obj.cname = cname;
                obj.ename = ename;
                obj.date = date;
                obj.week = week;
                obj.filmlevel = filmlevel;
                obj.image = image;
                obj.time = time;
                obj.hall = hall;
                obj.hallname = hallname;
                obj.SubCode = SubCode;
                obj.SubName2 = SubName2;
                obj.totalticket = 0;
                obj.totalfee = 0;
                obj.totalamount = 0;
                var url = "Common/SetobjN";
                axios.post(url, this.$qs.stringify(obj)).then(e => {
                    if (e.data == "Y") {
                        if (this.login === "Y") {
                            if (this.confirm === "1") {
                                var next = "book-step1.html";
                                window.location.replace(next);
                            }
                            else {
                                alert("請先至信箱點選認證，如未收到註冊時寄發的認證信，可至會員維護重發認證信");
                            }                          
                        } else {
                            var next = "login.html?obj=l&obj1=bst1";
                            window.location.replace(next);
                        }
                    } else { alert(e.data); }
                }).catch(function (error) {
                    console.log(error);
                });
            }
        },
        changetheater: function (item) {
            this.選擇影城 = item.item_value;
            if (this.programid != "") { this.loadsingleshow(); } else { this.loadshow(); }
        },
        loaduser() {
            var url1 = "Common/Getuser";
            axios.get(url1).then(e => {
                var user = e.data;
                if (user.sts) {
                    this.username = user.nick_name;
                    this.login = "Y";
                    this.confirm = user.confirm;
                }
            }).catch(function (error) {
                console.log(error);
            });
        },
        logout() {
            var url = "Common/logout";
            axios.get(url).then(e => {
                var msg = e.data;
                if (msg === "ok") {
                    this.login = "N";
                    this.username = "";
                    var next = "index.html";
                    window.location.replace(next);
                } else { alert(msg); }
            }).catch(function (error) {
                console.log(error);
            });
        }
    }
});   
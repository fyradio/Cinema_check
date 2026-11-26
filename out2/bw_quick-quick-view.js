Vue.use({
    install(Vue) {
        Object.defineProperty(Vue.prototype, "$qs", {
            writable: false,
            value: window.Qs
        });
    }
});
var broadapp = new Vue({
    el: '#broadapp',
    data: {
        classdata: [],
        選擇影城: "",
        日期: "",
        廳: "",
        programid: "",
        場次: "",
        halldata: [],
        username: "",
        login: "N"
    },
    created() {
        var getUrlString = location.href;
        var url = new URL(getUrlString);
        var str = url.searchParams.get('obj');
        var ar = str.split(',');
        console.log(ar);
        this.選擇影城 = ar[0];
        this.programid = ar[1];
        this.日期 = ar[2];
        this.場次 = ar[3];
        this.廳 = ar[4];
        this.loadSeat();
        this.loadtheater();
        this.loaduser();
    },
    methods: {
        loadtheater() {
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
        loadSeat() {
            var url = "Movie/GetSeatView/" + this.選擇影城 + "/" + this.programid + "/" + this.日期 + "/" + this.場次 + "/" + this.廳;
            // console.log(url);
            axios.get(url).then(e => {
                var result = e.data;
                if (result.status) {
                    this.halldata = result.Data;
                    console.log(this.halldata);
                }
            }).catch(function (error) {
                console.log(error);
            });
        },
        loaduser() {
            var url1 = "Common/Getuser";
            axios.get(url1).then(e => {
                var user = e.data;
                if (user.sts) {
                    this.username = user.nick_name;
                    this.login = "Y";
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
                } else { alert(msg); }
            }).catch(function (error) {
                console.log(error);
            });
        }
    }
});
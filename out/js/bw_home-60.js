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
        apiurl: "",
        imgurl: "",
        newsdata: [],
        test: [],
        showdata: [],
        選擇影城: "",
        classitems: [],
        classdata: [],
        選擇電影: "",
        movieitems: [],
        選擇日期: "",
        dateitems: [],
        選擇場次: "",
        listitems: [],
        slidedata: [],
        login: "N",
        username: ""
    },
    async created() {
        await this.loadConfig();
        this.loadmovie();
        this.loadtheater();
        this.loaduser();
    },
    mounted() {
        const mySwiper = new Swiper('.s-swiper', {
            pagination: {
                el: ".dot",
                clickable: true
            },
            navigation: {
                nextEl: ".swiper-button-next",
                prevEl: ".swiper-button-prev"
            },
            autoplay: {
                delay: 2500,
                disableOnInteraction: false,
                stoponstopOnLastSlide: false,
            },
            breakpoints: {
                992: {
                    slidesPerView: "auto",
                    spaceBetween: 10
                }
            }
        });

        const swiper = new Swiper('#swiper_online', {
            speed: 500,
            slidesPerView: 5,            
            spaceBetween: 15,            
            centeredSlides: true,
            grabCursor: true,
            autoplay: true,
            autoplay: {
                delay: 1500,
                disableOnInteraction: false,
                stopOnLastSlide: false,
            },
            watchSlidesProgress: true,
            on: {
                progress: function (progress) {
                    slides = this.slides
                    for (i = 0; i < slides.length; i++) {
                        slide = slides.eq(i)
                        progress = slides[i].progress
                        slide.css({ 'opacity': '', 'background': '' });
                        slide.transform('');
                        slide.transform('scale(' + (1 - Math.abs(progress) / 8) + ')');
                    }
                },
                setTransition: function (transition) {
                     for (var i = 0; i < this.slides.length; i++) {
                        var slide = this.slides.eq(i)
                        slide.transition(transition);
                    }
                },
                transitionEnd: function () {
                    let activeSlide = swiper.realIndex + 1; 
                    let previousSlide = swiper.previousIndex - 2; 
                    if (previousSlide == -1) {
                        previousSlide = 0;
                    } else if (previousSlide ==
                        document.querySelectorAll('.swiper-slide .swiper-slide-text').length) {
                        return;
                    }
                },
            },
            pagination: {
                el: '#swiper_online > .swiper-pagination',
                clickable: true,
                dynamicBullets: true,
            }, 
        });
    },
    methods: {
        async loadConfig() {
            var url = "Common/Geturl";
            axios.get(url).then(e => {
                this.apiurl = e.data;
                console.log(this.apiurl);
                this.loadnews();
                this.loadbanner();
            }).catch(function (error) {
                console.log(error);
            });
        },
        loadnews() {
            var url = this.apiurl + "/News/QueryLatestNews";
            axios.get(url).then(e => { this.newsdata = e.data.Data; }
            ).catch(function (error) {
                console.log(error);
            });
        },
        loadbanner() {
            var url = "Common/GetImageUrl";
            axios.get(url).then(e => {
                this.imgurl = e.data;               
            }).catch(function (error) {
                console.log(error);
            });
            var url = this.apiurl + "/Banner/QueryWebBanner";
            axios.get(url).then(e => {
                this.slidedata = e.data.Data;
            }
            ).catch(function (error) {
                console.log(error);
            });
        },
        loadmovie() {
            var url = "Movie/GetMovieRelease";
            axios.get(url).then(e => {
                var result = e.data;
                if (result.status) {
                    this.showdata = result.Data;
                }
            }).catch(function (error) {
                console.log(error);
            });
        },
        loadtheater() {
            var url = "Movie/GetTheater";
            axios.get(url).then(e => {
                var result = e.data;
                if (result.status) {
                    this.classitems = result.Data;
                    for (let i = 1; i < this.classitems.length; i++) {
                        this.classdata.push(this.classitems[i]);
                    }
                }
            }).catch(function (error) {
                console.log(error);
            });
        },
        ontheaterChange(event) {
            var a = event.target.options[event.target.options.selectedIndex].value;
            this.loadnowmovie(a);
        },
        onmovieChange(event) {
            var a = event.target.options[event.target.options.selectedIndex].value;
            this.loadmoviedate(this.選擇影城, a);
        },
        ondateChange(event) {
            var a = event.target.options[event.target.options.selectedIndex].value;
            this.loadmovietime(this.選擇影城, this.選擇電影, a);
        },
        loadnowmovie(theater) {
            this.movieitems.length = 0;
            this.選擇電影 = "";
            this.dateitems.length = 0;
            this.選擇日期 = "";
            this.listitems.length = 0;
            this.選擇場次 = "";
            var url = "Movie/GetMovieNow/" + theater;
            axios.get(url).then(e => {
                var result = e.data;
                if (result.status) {
                    this.movieitems = result.Data;
                }
            }).catch(function (error) {
                console.log(error);
            });
        },
        loadmoviedate(theater, programid) {
            this.dateitems.length = 0;
            this.選擇日期 = "";
            this.listitems.length = 0;
            this.選擇場次 = "";
            var url = "Movie/GetMovieDate/" + theater + "/" + programid;
            axios.get(url).then(e => {
                var result = e.data;
                if (result.status) {
                    this.dateitems = result.Data;
                }
            }).catch(function (error) {
                console.log(error);
            });
        },
        loadmovietime(theater, programid, mdate) {
            this.listitems.length = 0;
            this.選擇場次 = "";
            var url = "Movie/GetMovieTime/" + theater + "/" + programid + "/" + mdate;
            console.log(url);
            axios.get(url).then(e => {
                var result = e.data;
                if (result.status) {
                    this.listitems = result.Data;
                }
            }).catch(function (error) {
                console.log(error);
            });
        },
        onChange(event) {
            var a = event.target.options.selectedIndex;
            if (a === 0) { alert("請選擇場次"); } else {
                var obj = new Object();
                obj.SiteID = this.選擇影城;
                obj.ProgramID = this.選擇電影;
                //obj.showdate = this.選擇日期;
                obj.ShowDate = this.listitems[a].ShowDate;
                obj.ShowTime = this.listitems[a].ShowTime;
                obj.RoomID = this.listitems[a].hall;
                var url = "ShopCar/ToOrder";
                axios.post(url, this.$qs.stringify(obj)).then(e => {
                    if (e.data == "ok") {
                        if (this.login === "Y") {
                            var next = "book-step1.html";
                            window.location.replace(next);
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
                } else { alert(msg); }
            }).catch(function (error) {
                console.log(error);
            });
        }
    }
});

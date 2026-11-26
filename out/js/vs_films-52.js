$(window).load(function() {
    //$(".sticky-wrapper").addClass('hidden');
    //For width [Jssor Slider]
    function videoScale() {
        var videoH = 0.59; //=550/930
        $("#sliderVideo").width($(".header").width());
        $(".slidesArea").width($(".header").width());
        $("#sliderPicture").width($(".header").width());
        if($(window).width() > 620){
            $("#sliderVideo").height($(".mainVideo .slidesArea div iframe").height()+100);
            $(".versionList li").eq(0).addClass('show');
        }else{
            $("#sliderVideo").height($(".mainVideo").width()*videoH);
            $(".mainVideo .slidesArea div iframe").width($(".header").width());
            $(".mainVideo .slidesArea div iframe").height($(".mainVideo").width()*videoH);
        }
    }
    videoScale();

    var options = {
        $AutoPlay: false, //[Optional] Whether to auto play, to enable slideshow, this option must be set to true, default value is false
        $PauseOnHover: 1, //[Optional] Whether to pause when mouse over if a slideshow is auto playing, default value is false
        $AutoPlayInterval: 6000, //[Optional] Interval (in milliseconds) to go for next slide since the previous stopped if the slider is auto playing, default value is 3000
        $SlideDuration: 500, //[Optional] Specifies default duration (swipe) for slide in milliseconds, default value is 500
        $UISearchMode: 1, //[Optional] The way (0 parellel, 1 recursive, default value is 1) to search UI components (slides container, loading screen, navigator container, arrow navigator container, thumbnail navigator container etc).
        $PlayOrientation: 1, //[Optional] Orientation to play slide (for auto play, navigation), 1 horizental, 2 vertical, 5 horizental reverse, 6 vertical reverse, default value is 1
        $DragOrientation: 1, //[Optional] Orientation to drag slide, 0 no drag, 1 horizental, 2 vertical, 3 either, default value is 1 (Note that the $DragOrientation should be the same as $PlayOrientation when $Cols is greater than 1, or parking position is not 0)
        //$SlideWidth: slidePicW,                             //[Optional] Width of every slide in pixels, the default is width of 'slides' container
        $SlideSpacing: 0, //Space between each slide in pixels
        $Cols: 1, //Number of pieces to display (the slideshow would be disabled if the value is set to greater than 1), the default value is 1
        $ParkingPosition: 0, //The offset position to park slide (this options applys only when slideshow disabled).

        $ArrowKeyNavigation: true, //[Optional] Allows keyboard (arrow key) navigation or not, default value is false
        $SlideDuration: 160, //[Optional] Specifies default duration (swipe) for slide in milliseconds, default value is 500
        $MinDragOffsetToSlide: 20, //[Optional] Minimum drag offset to trigger slide , default value is 20

        $ArrowNavigatorOptions: {
            $Class: $JssorArrowNavigator$, //[Requried] Class to create arrow navigator instance
            $ChanceToShow: 2, //[Required] 0 Never, 1 Mouse Over, 2 Always
            $AutoCenter: 2, //[Optional] Auto center navigator in parent container, 0 None, 1 Horizontal, 2 Vertical, 3 Both, default value is 0
            $Steps: 1 //[Optional] Steps to go for each navigation request, default value is 1
        }
    };


    if($("#sliderVideo iframe").length>0){
        var jssor_slider1 = new $JssorSlider$("sliderVideo", options);
    }else{
        $(".movieVideo").hide();
    }

    //Jssor Slider
    var _SlideshowTransitions = [
        //Fade
        {
            $Duration: 1200,
            $Opacity: 2
        }
    ];

    var displayP, slidePicW, slideS;
    if ($(window).width() < 620) {
        displayP = 1;
        slidePicW = '';
        slideS = 0;
    }else{
        displayP = 3;
        slidePicW = 350;
        slideS = 30;
    }

    //Bottom Photo
    var options2 = {
        $AutoPlay: false, //[Optional] Whether to auto play, to enable slideshow, this option must be set to true, default value is false
        $AutoPlaySteps: displayP, //[Optional] Steps to go for each navigation request (this options applys only when slideshow disabled), the default value is 1
        $AutoPlayInterval: 4000, //[Optional] Interval (in milliseconds) to go for next slide since the previous stopped if the slider is auto playing, default value is 3000
        $PauseOnHover: 1, //[Optional] Whether to pause when mouse over if a slider is auto playing, 0 no pause, 1 pause for desktop, 2 pause for touch device, 3 pause for desktop and touch device, 4 freeze for desktop, 8 freeze for touch device, 12 freeze for desktop and touch device, default value is 1

        $ArrowKeyNavigation: true, //[Optional] Allows keyboard (arrow key) navigation or not, default value is false
        $SlideDuration: 160, //[Optional] Specifies default duration (swipe) for slide in milliseconds, default value is 500
        $SlideWidth: slidePicW, //[Optional] Width of every slide in pixels, default value is width of 'slides' container
        //$SlideHeight: slideH, //[Optional] Height of every slide in pixels, default value is height of 'slides' container
        $SlideSpacing: slideS, //[Optional] Space between each slide in pixels, default value is 0
        $Cols: displayP, //[Optional] Number of pieces to display (the slideshow would be disabled if the value is set to greater than 1), the default value is 1
        $ParkingPosition: 0, //[Optional] The offset position to park slide (this options applys only when slideshow disabled), default value is 0.
        $UISearchMode: 1, //[Optional] The way (0 parellel, 1 recursive, default value is 1) to search UI components (slides container, loading screen, navigator container, arrow navigator container, thumbnail navigator container etc).
        $PlayOrientation: 1, //[Optional] Orientation to play slide (for auto play, navigation), 1 horizental, 2 vertical, 5 horizental reverse, 6 vertical reverse, default value is 1
        $DragOrientation: 0, //[Optional] Orientation to drag slide, 0 no drag, 1 horizental, 2 vertical, 3 either, default value is 1 (Note that the $DragOrientation should be the same as $PlayOrientation when $Cols is greater than 1, or parking position is not 0)

        $ArrowNavigatorOptions: {
            $Class: $JssorArrowNavigator$, //[Requried] Class to create arrow navigator instance
            $ChanceToShow: 2, //[Required] 0 Never, 1 Mouse Over, 2 Always
            $AutoCenter: 2, //[Optional] Auto center navigator in parent container, 0 None, 1 Horizontal, 2 Vertical, 3 Both, default value is 0
            $Steps: 1 //[Optional] Steps to go for each navigation request, default value is 1
        }
    };


    if($("#sliderPicture img").length>0){
        var jssor_slider2 = new $JssorSlider$("sliderPicture", options2);
    }else{
        $("#sliderPicture").hide();
    }

    //Photo Swipe
    var initPhotoSwipeFromDOM = function(gallerySelector) {

        // parse slide data (url, title, size ...) from DOM elements
        // (children of gallerySelector)
        var parseThumbnailElements = function(el) {
            var thumbElements = el.childNodes,
                numNodes = thumbElements.length,
                items = [],
                figureEl,
                childElements,
                linkEl,
                size,
                item;

            for(var i = 1; i < numNodes; i++) {


                figureEl = thumbElements[i]; // <figure> element

                // include only element nodes
                if(figureEl.nodeType !== 1) {
                    continue;
                }

                linkEl = figureEl.children[0]; // <a> element

                size = linkEl.getAttribute('data-size').split('x');

                // create slide object
                item = {
                    src: linkEl.getAttribute('href'),
                    w: parseInt(size[0], 10),
                    h: parseInt(size[1], 10)
                };


                //Evy Edit 2014.12.20
                if(figureEl.children.length > 0) {
                    // <figcaption> content
                    item.title = figureEl.children[1].innerHTML;
                }

                if(linkEl.children.length > 0) {
                    // <img> thumbnail element, retrieving thumbnail url
                    item.msrc = linkEl.children[0].getAttribute('src');
                }

                item.el = figureEl; // save link to element for getThumbBoundsFn
                items.push(item);
            }

            return items;
        };

        // find nearest parent element
        var closest = function closest(el, fn) {
            return el && ( fn(el) ? el : closest(el.parentNode, fn) );
        };

        // triggers when user clicks on thumbnail
        var onThumbnailsClick = function(e) {
            e = e || window.event;
            e.preventDefault ? e.preventDefault() : e.returnValue = false;

            var eTarget = e.target || e.srcElement;

            var clickedListItem = closest(eTarget, function(el) {
                return el.tagName === 'DIV';
            });

            if(!clickedListItem) {
                return;
            }


            // find index of clicked item
            var clickedGallery = clickedListItem.parentNode,
                childNodes = clickedListItem.parentNode.childNodes,
                numChildNodes = childNodes.length,
                nodeIndex = -1,  //預設nodeIndex=0
                index;

            for (var i = 0; i < numChildNodes; i++) {
                if(childNodes[i].nodeType !== 1) {
                    continue;
                }

                if(childNodes[i] === clickedListItem) {
                    index = nodeIndex;
                    break;
                }
                nodeIndex++;
            }



            if(index >= 0) {
                openPhotoSwipe( index, clickedGallery );
            }
            return false;
        };

        // parse picture index and gallery index from URL (#&pid=1&gid=2)
        var photoswipeParseHash = function() {
            var hash = window.location.hash.substring(1),
            params = {};

            if(hash.length < 5) {
                return params;
            }

            var vars = hash.split('&');
            for (var i = 0; i < vars.length; i++) {
                if(!vars[i]) {
                    continue;
                }
                var pair = vars[i].split('=');
                if(pair.length < 2) {
                    continue;
                }
                params[pair[0]] = pair[1];
            }

            if(params.gid) {
                params.gid = parseInt(params.gid, 10);
            }

            if(!params.hasOwnProperty('pid')) {
                return params;
            }
            params.pid = parseInt(params.pid, 10);
            return params;
        };

        var openPhotoSwipe = function(index, galleryElement, disableAnimation) {
            var pswpElement = document.querySelectorAll('.pswp')[0],
                gallery,
                options,
                items;

            items = parseThumbnailElements(galleryElement);

            // define options (if needed)
            options = {
                index: index,

                // define gallery index (for URL)
                galleryUID: galleryElement.getAttribute('data-pswp-uid'),

                getThumbBoundsFn: function(index) {
                    // See Options -> getThumbBoundsFn section of docs for more info
                    var thumbnail = items[index].el.getElementsByTagName('img')[0], // find thumbnail
                        pageYScroll = window.pageYOffset || document.documentElement.scrollTop,
                        rect = thumbnail.getBoundingClientRect();

                    return {x:rect.left, y:rect.top + pageYScroll, w:rect.width};
                },

                // history & focus options are disabled on CodePen
                // remove these lines in real life:
               historyEnabled: false,
               focus: false

            };

            if(disableAnimation) {
                options.showAnimationDuration = 0;
            }

            // Pass data to PhotoSwipe and initialize it
            gallery = new PhotoSwipe( pswpElement, PhotoSwipeUI_Default, items, options);
            gallery.init();
            //當燈箱關閉時，執行此動作
            gallery.listen('close', function() {
            //  location.href = window.location.href+"#photo";
            });
        };

        // loop through all gallery elements and bind events
        var galleryElements = document.querySelectorAll( gallerySelector );

        for(var i = 0, l = galleryElements.length; i < l; i++) {
            galleryElements[i].setAttribute('data-pswp-uid', i+1);
            galleryElements[i].onclick = onThumbnailsClick;
        }

        // Parse URL and open gallery if it contains #&pid=3&gid=1
        var hashData = photoswipeParseHash();
        if(hashData.pid > 0 && hashData.gid > 0) {
            openPhotoSwipe( hashData.pid - 1 ,  galleryElements[ hashData.gid - 1 ], true );
        }
    };

    // execute above function
    initPhotoSwipeFromDOM('.movieGallery');

    if ($(window).width() > 768) {        
        //Version Menu [Show Theater]
        $(".versionFirst").mouseover(function(event) {            
            $(".versionList li ul").stop().fadeOut(5);
            $(this).closest('li').find('ul').stop().fadeIn(5);
            $(this).closest('li').addClass('show').siblings('li').removeClass('show');
            $(this).next('ul').css('overflow','auto');            
        });
    }else{
        //Version Menu [Show Theater]
        $(".versionFirst").click(function(event) {
            $(".versionList li ul").stop().slideUp('400', function(){
                $(this).removeClass('slide');                
            });
            if($(this).closest('li').hasClass('show')){
                $(this).closest('li').find('ul').stop().slideUp('400', function() {                    
                    $(".versionList li").removeClass('show');
                });
            }else{
                $(this).closest('li').find('ul').stop().slideDown('400', function() {
                    $(this).closest('li').addClass('show').siblings('li').removeClass('show');                    
                });
            }
            return false;
        });
    };

    //Movie Gallery
    $(".movieGallery").find('img').css('height', 'auto');
    $(".loading").remove();

    //Product Figure Height
    var productOneH = $('#sliderPicture .picSlides div a').width()*0.529;
    $('#sliderPicture .picSlides div a').height(productOneH);
    var tWidth = $("#sliderPicture .picSlides").find("div:eq(1) a img").width();  //算出不同解析下的圖片寬度
    var tHight = $("#sliderPicture .picSlides").find("div:eq(1) a img").width()*0.529;

    $.each($("#sliderPicture .picSlides div a img"), function(){ //如果圖片高度小於正確高度，要改不同對齊方式
        if($(this).height()<tHight){
            $(this).css({
                "height": "100%",
                "width":"auto"
            });
            $(this).css(
                "margin-left", function() { return -($(this).width()-tWidth)/2;} //讓放大後的圖片也能置中對齊
            );
        }
    });
});
$(document).ready(function() {
    //let overflow setting on first
    $('.versionList li ul').first().css('overflow','auto');
    //Show Version on top
    $(".versionList li ul li").click(function(event) {
        $(".sticky-wrapper").removeClass('hidden');
    	$(".versionList li ul li").removeClass('where');
    	$(this).addClass('where');
    	var version = $(this).closest('ul').closest('li').find('.versionFirst').text();
    	var where = $(".where").text();
    	//Show版本和影城
        if($(".sticky-wrapper")){ $(".sticky-wrapper").remove()}; //如果有出現，先刪除。
        $(".movieTime").prepend("<div class='theaterSelect'><h1>"+version+"<span></span></h1></div>");
    	$(".theaterSelect h1 span").text(where);
        $(".theaterSelect").sticky({topSpacing:0});
    	return false;
    });

    //Show Theater Time
    $(".versionList li ul li").click(function(event) {
    	var which = $(this).find('a').attr('href');
    	$(".movieTime .hidden").stop().slideUp('400', function(){
    		$(this).removeClass('slide');
    	});
    	if($(this).hasClass('slide')){
    		$(which).stop().slideUp('400', function(){
    			$(this).removeClass('slide');
    		});
    	}else{
    		$(which).stop().slideDown('400', function(){
    			$(this).addClass('slide');
                                                $('body').animate({scrollTop:$(".slide").position().top}, 400);
    		});
    	}
    	return false;
    });

    //Scroll to Movie Info
    $(".view").click(function(event) {
        var linkObj = $(this).attr('href');
        setTimeout(function(){
            $('body').animate({scrollTop:$(linkObj).position().top-45}, 400);
        },50);
        return false;
    });

    //Version Check
    if($("ul.versionList li").length>0){
        $(".movieVersion").animate({ "opacity":"1"}, 300);
    }else{ $(".movieVersion").hide();}
});

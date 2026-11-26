
$(function () {
    getLstCinema();
    $("[name=cinema]").on("change", getLstMovie);
    $("[name=movie]").on("change", getLstDate);
    $("[name=date]").on("change", getLstSession);
    $("[name=session]").on("change", showseats);
    getLstArea();
    $("[name=area]").on("change", getLstFilm);
    $("[name=film]").on("change", getLstTime);

    $("#SessionSeats").on('click', function (event) {
        var gethref = $(this).attr("href");
        if (gethref == '#') {
            if ($("#searchBox1").length > 0) { //For Index
                $(".bookGroup select").focus();
            }
            if ($("#searchForm1").length > 0) { //For Inside
                $(".bookBox select").focus();
            }
            return false;
        }
    });
});

function generateSelect(api, name, text) {
    console.log(api);
    console.log(strApiPath);
    $.ajax({
        url: strApiPath + api,
        method: "GET",
        contentType: "application/json"
    }).done(function (data) {
        var select = $("[name=" + name + "]");
        select.find("option").remove();
        select.append($("<option></option>").val("").text(text));
        for (var i in data) {
            select.append($("<option></option>").val(data[i].strValue).text(data[i].strText));
        }
    });
}

function getLstArea() {
    generateSelect("/GetLstDicArea", "area", "請選擇地區");
}

function getLstFilm() {
    generateSelect("/GetLstDicFilm?area=" + $(this).val(), "film", "請選擇影片");
}

function getLstTime() {
    generateSelect("/GetLstDicDate?area=" + $("[name=area]").val() + "&movie=" + $(this).val(), "time", "請選擇日期");
}

function getLstCinema() {
    generateSelect("/GetLstDicCinema", "cinema", "請選擇影城");
}

function getLstMovie() {
    generateSelect("/GetLstDicMovie?cinema=" + $(this).val(), "movie", "請選擇影片");
}

function getLstDate() {
    generateSelect("/GetLstDicDate?cinema=" + $("[name=cinema]").val() + "&movie=" + $(this).val(), "date", "請選擇日期");
}

function getLstSession() {
    generateSelect("/GetLstDicSession?cinema=" + $("[name=cinema]").val() + "&movie=" + $("[name=movie]").val() + "&date=" + $(this).val(), "session", "請選擇場次");
}

// $("[name=session]").val() 加入限制的 DtmAdvanceBookingDate
function booking() {
    if ($("[name=session]").val()) {
        var sessionInfo = $("[name=session]").val();
        var dtCurrent = new Date(); 
        var strLimitedTime = getUrlParameter('DtmAdvanceBookingDate');
        var dtLimited = new Date(strLimitedTime);
        var bookingUrl = $("#vsTicket").val();

        //if (strLimitedTime !== '' && dtLimited.getTime() >= dtCurrent.getTime()) {
        //    //console.log('booking');
        //    window.alert('您所點選的場次將於 ' + strLimitedTime + ' 開放訂購，請稍候，謝謝!');
        //}
        //else {
            if (sessionInfo.indexOf('DtmAdvanceBookingDate') != -1) {
                sessionInfo = sessionInfo.substring(0, sessionInfo.indexOf('DtmAdvanceBookingDate'));
        }
        window.location.href = bookingUrl + 'ticketing/booking.aspx?' + sessionInfo;
        //}
    } else {
        if ($("#searchBox1").length > 0) { //For Index
            $(".bookGroup select").focus();
        }
        if ($("#searchForm1").length > 0) { //For Inside
            $(".bookBox select").focus();
        }
    }
}

function showseats() {
    if ($("[name=session]").val()) {
        var sessionInfo = $("[name=session]").val();
        var dtCurrent = new Date();
        var strLimitedTime = getUrlParameter('DtmAdvanceBookingDate');
        var dtLimited = new Date(strLimitedTime);        

        if (strLimitedTime !== '' && dtLimited.getTime() >= dtCurrent.getTime()) {
            //console.log('showseats');
            //window.alert('您所點選的場次將於 ' + strLimitedTime + ' 開放訂購，請稍候，謝謝!');
        }
        else {
            if (sessionInfo.indexOf('DtmAdvanceBookingDate') != -1) {
                sessionInfo = sessionInfo.substring(0, sessionInfo.indexOf('DtmAdvanceBookingDate'));
            }
            $("#SessionSeats").attr("href", "https://sales.vscinemas.com.tw/VoucherTicketing/SessionSeats.aspx?" + sessionInfo);
        }
    } else {
        if ($("#searchBox1").length > 0) { //For Index
            $(".bookGroup select").focus();
        }
        if ($("#searchForm1").length > 0) { //For Inside
            $(".bookBox select").focus();
        }
    }
}

// 抓取 parameter 參數
function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec($("[name=session]").val());
    var getLimitedTime = results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
    // IE [date] Invalid Date, IE only support 2018/02/01.
    return getLimitedTime.replace(/-/g, '/');
};


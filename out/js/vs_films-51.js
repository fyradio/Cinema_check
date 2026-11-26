(function () {    
    const url = window.location.pathname.toLowerCase();
    const check = url.includes("/ishow/");    
    if (check) {        
        return;
    }

    // 取得目前這支 JS 的 script 標籤（最後一個 script 通常是自己）
    const currentScript = document.currentScript || (function () {
        const scripts = document.getElementsByTagName('script');
        return scripts[scripts.length - 1];
    })();

    // 取得這支 JS 的 src 路徑
    const scriptSrc = currentScript.src;

    // 推出 JSON 的完整路徑（與 JS 同資料夾）
    const basePath = scriptSrc.substring(0, scriptSrc.lastIndexOf('/'));
    const configUrl = basePath + "/time-range.json?_=" + new Date().getTime(); // 防快取

    console.log(configUrl);

    if (!window.serverTime instanceof Date) {
        console.error("讀取時間區間時發生錯誤：", error);
        return;
    }

    const now = new Date(window.serverTime);
    console.log(now);
    const nowDay = now.getDay();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();    

    fetch(configUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error("無法讀取時間範圍設定檔");
            }
            return response.json();
        })
        .then(config => {
            console.log(config);
            let inSpecialRange = false;
            if (config.specialRange) {
                const startTime = new Date(config.specialRange.start);
                const endTime = new Date(config.specialRange.end);
                inSpecialRange = now >= startTime && now < endTime;
            }

            let inWeeklyRange = false;

            if (config.weeklyRange) {
                let rule = config.weeklyRange;
                if (rule.week === nowDay) {
                    const [startHour, startMinute] = rule.start.split(":").map(Number);
                    const [endHour, endMinute] = rule.end.split(":").map(Number);
                    const start = startHour * 60 + startMinute;
                    const end = endHour * 60 + endMinute;
                    inWeeklyRange = nowMinutes >= start && nowMinutes < end;
                }
            }

            if (inSpecialRange || inWeeklyRange) {
                //alert('現在尚未可以訂票，請於開放時間內訪問！');
                window.location.href = 'https://www.vscinemas.com.tw/hold/';
            } else {
                //alert('現在可以訂票');
            }
        }
    );    
    console.log('結束');
})();

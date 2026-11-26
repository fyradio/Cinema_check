// modal.js
document.addEventListener("DOMContentLoaded", function () {
    const triggers = document.querySelectorAll("[data-modal-target]");
    const backdrops = document.querySelectorAll(".modal-backdrop");

    // 點擊 data-modal-target 的 <a> 時阻止冒泡
    document.querySelectorAll('[data-modal-target]').forEach(el => {
        el.addEventListener('click', function (e) {
            e.stopPropagation(); // 防止觸發 li click
        });
    });

    triggers.forEach(trigger => {
        trigger.addEventListener("click", function () {
            const targetId = trigger.getAttribute("data-modal-target");
            const modal = document.querySelector(targetId);
            const backdrop = modal.previousElementSibling;
            const outBox = backdrop.parentElement;

            backdrop.classList.add("show");
            modal.classList.add("show");
            outBox.classList.add("show");
        });
    });

    backdrops.forEach(backdrop => {
        backdrop.addEventListener("click", function () {
            const modal = backdrop.nextElementSibling;
            const outBox = backdrop.parentElement;
            backdrop.classList.remove("show");
            modal.classList.remove("show");
            outBox.classList.remove("show");
        });
    });

    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") {
            backdrops.forEach(backdrop => {
                const modal = backdrop.nextElementSibling;
                const outBox = backdrop.parentElement;
                backdrop.classList.remove("show");
                modal.classList.remove("show");
                outBox.classList.remove("show");
            });
        }
    });
});

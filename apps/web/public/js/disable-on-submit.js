// public/js/disable-on-submit.js

(() => {
    const form = document.getElementById("target-form");
    const btn = document.getElementById("submit-btn");
    if (!form || !btn) return;

    form.addEventListener("submit", () => {
        btn.disabled = true;
        btn.classList.add("disabled");
    });
})();
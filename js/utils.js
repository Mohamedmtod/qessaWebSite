// Utility functions
const SETTINGS = {
    whatsappNumber: "201068430400",
    currency: "EGP",
};


function fmtCurrency(value) {
    return new Intl.NumberFormat("ar-EG").format(value);
}

function safeNum(v) {
    return Number.isFinite(Number(v)) ? Number(v) : 0;
}

function getStoredOudState() {
    return localStorage.getItem("qessa_oud_enabled") === "true";
}

function setStoredOudState(state) {
    localStorage.setItem("qessa_oud_enabled", state);
}

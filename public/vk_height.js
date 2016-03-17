VK.init(function () {
});

function autosize() {
    if (!document.getElementById('body')) {
        alert('error');
        return;
    }
    if (typeof VK.callMethod != 'undefined') {
        VK.callMethod('resizeWindow', 607, document.getElementById('body').clientHeight);
    } else {
        alert('error #2');
    }
}
$(document).ready(function () {
    setInterval('autosize()', 333);
});
$(document).ready(function () {

    $.ajax({
        type: "POST",
        url: "/Account/IsLoggedIn",
        dataType: "json",
        success: function (msg) {
            if (msg) { 
                alert("TEST: Benutzer ist angemeldet!");
            } else {
                alert("TEST: Benutzer ist nicht angemeldet!");
            }
        }
    });
});
// app.js
var AUTH0_DOMAIN = 'dalemcm.eu.auth0.com';
var AUTH0_CLIENT_ID = 'F1eNCjLiDHr3j4xic2aKzEKuA4DTvqYg';
var AUTH0_CALLBACK_URL = 'http://localhost:3000/index.html';

var webAuth = new auth0.WebAuth({
    domain: AUTH0_DOMAIN,
    clientID: AUTH0_CLIENT_ID,
    redirectUri: AUTH0_CALLBACK_URL,
    audience: 'https://' + AUTH0_DOMAIN + '/userinfo',
    responseType: 'token id_token',
    scope: 'openid'
});

/** Authorize Stuff */
$('document').ready(function () {

    var loginStatus = $('.container h4');
    var loginView = $('#login-view');
    var homeView = $('#home-view');

    // buttons and event listeners
    var homeViewBtn = $('#btn-home-view');
    var loginBtn = $('#btn-login');
    var logoutBtn = $('#btn-logout');

    homeViewBtn.click(function () {
        homeView.css('display', 'inline-block');
        loginView.css('display', 'none');
    });

    loginBtn.click(function (e) {
        e.preventDefault();
        webAuth.authorize();
    });

    logoutBtn.click(logout);

    function setSession(authResult) {
        // Set the time that the access token will expire at
        var expiresAt = JSON.stringify(
            authResult.expiresIn * 1000 + new Date().getTime()
        );
        localStorage.setItem('access_token', authResult.accessToken);
        localStorage.setItem('id_token', authResult.idToken);
        localStorage.setItem('expires_at', expiresAt);
    }

    function logout() {
        // Remove tokens and expiry time from localStorage
        localStorage.removeItem('access_token');
        localStorage.removeItem('id_token');
        localStorage.removeItem('expires_at');
        displayButtons();
    }

    function isAuthenticated() {
        // Check whether the current time is past the
        // access token's expiry time
        var expiresAt = JSON.parse(localStorage.getItem('expires_at'));
        return new Date().getTime() < expiresAt;
    }

    function handleAuthentication() {
        webAuth.parseHash(function (err, authResult) {
            if (authResult && authResult.accessToken && authResult.idToken) {
                window.location.hash = '';
                setSession(authResult);
                loginBtn.addClass('hidden');
                homeView.css('display', 'inline-block');
            } else if (err) {
                homeView.css('display', 'inline-block');
                console.log(err);
                alert(
                    'Error: ' + err.error + '. Check the console for further details.'
                );
            }
            displayButtons();
        });
    }

    function displayButtons() {
        if (isAuthenticated()) {

            $('.logged-in-content').removeClass('hidden');
            $('.logged-out-content').addClass('hidden');

            loginBtn.addClass('hidden');
            logoutBtn.removeClass('hidden');
            // loginStatus.text('You are logged in!');
        } else {
            $('.logged-out-content').removeClass('hidden');
            $('.logged-in-content').addClass('hidden');
            loginBtn.removeClass('hidden');
            logoutBtn.addClass('hidden');
            //  loginStatus.text('You are not logged in! Please log in to continue.');
        }
    }

    // Check if user has logged in
    handleAuthentication();


});


//begin main function
$('document').ready(function(){
    retriveData();
});
//end main function

// grab data
function retriveData() {
    var dataSource = '/data/products.json';
    $.getJSON(dataSource, renderDataVisualsTemplate);
};

// render compiled handlebars template
function renderDataVisualsTemplate(data){
    handlebarsDebugHelper();
    renderHandlebarsTemplate('/templates/products.handlebars', '#products', data);
};

// render handlebars templates via ajax
function getTemplateAjax(path, callback) {
    var source, template;
    $.ajax({
        url: path,
        success: function (data) {
            source = data;
            template = Handlebars.compile(source);
            if (callback) callback(template);
        }
    });
};

// function to compile handlebars template
function renderHandlebarsTemplate(withTemplate,inElement,withData){
    getTemplateAjax(withTemplate, function(template) {
        $(inElement).html(template(withData));
    })
};

// add handlebars debugger
function handlebarsDebugHelper(){
    Handlebars.registerHelper("debug", function(optionalValue) {
        console.log("Current Context");
        console.log("====================");
        console.log(this);
    });
};
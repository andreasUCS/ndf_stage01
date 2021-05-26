$(document).ready(function () {
    console.log("ready!");

    // support objectFit for IE
    if('objectFit' in document.documentElement.style === false) {
        supportObjectFitForIE($('.objectfit-img'));
        supportObjectFitForIE($('.objectfit-img-header'));
        supportObjectFitForIE($('.objectfit-img-list'));
    }

    $(".login__user").click(function () {
        $(".login__container").toggleClass("hide");
        $(".login__plugin").toggleClass("hide");
    });

    //prevents scrolling of the page when the menu is open
    $('#hamburger').change(function () {
        if (this.checked == true) {
            $("body").css("overflow", "hidden");
        }

        if (this.checked != true) {
            $("body").css("overflow", "auto");

        }
    });

    //ensures that only one subnav of the menu can be expanded at a time
    $('nav input.hamburger-subnav').on('change', function () {
        $("nav li.has-subnav").removeClass('active');
        if ($('nav input.hamburger-subnav:checked').length > 1) {
            $("nav input.hamburger-subnav:checked").prop("checked", false);
            this.checked = true;
        }
    });

    //utilizes jquery.touchSwipe.min.js to implement swipe gestures on lightbox
    $(function () {
        //Enable swiping:
        $(".lightbox").swipe({
            //Generic swipe handler for all directions
            swipe: function (event, direction, distance, duration, fingerCount, fingerData) {
                if (direction === "right") {
                    $('#lightbox a.lb-prev').trigger('click');
                } else if (direction === "left") {
                    $('#lightbox a.lb-next').trigger('click');
                }
            },
            threshold: 75
        });
    });
    
    var cookieConsentData = omCookieUtility.getCookie('omCookieConsent');
    if(!(cookieConsentData !== null && cookieConsentData.length > 0)){
        var cookiePanel = document.querySelector('.om-cookie-panel');
        var cookieButton = document.querySelectorAll('.cookie-panel__button');

        if (cookiePanel !== null) {
            cookiePanel.parentElement.classList.add('locked');
        }

        for(i=0; i < cookieButton.length; i++) {
            cookieButton[i].addEventListener('click', function() { 
                cookiePanel.parentElement.classList.remove('locked');
            });
        }   
    }

});

function supportObjectFitForIE(images) {
    images.each(function() {     
        var image = $(this),
            src = 'url(' + image.attr('src') + ')',
            imageParent = image.parent(),
            // div with backgroundimage instead of img tag with object fit style
            div = $('<div></div>');

        image.hide();
        imageParent.append(div);
        div.css({
                'height'                : '100%', 
                'width'                 : '100%',
                'background-size'       : 'cover',
                'background-repeat'     : 'no-repeat',
                'background-position'   : 'center',
                'background-image'      : src,
                'position'              : 'absolute',
                'top'                   : '0',
                'z-index'               : '5'
        }); 

        if(images.attr('class') !='objectfit-img-list') {
            div.css({
                'border-radius'         : '50%'
            });
        }    
    });
}

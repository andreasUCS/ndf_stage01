/*
 * This file provides some JavaScript functions for the seminars front-end
 * editor and the registration form.
 *
 * @author Saskia Metzler <saskia@merlin.owl.de>
 * @author Oliver Klee <typo3-coding@oliverklee.de>
 * @author Niels Pardon <mail@niels-pardon.de>
 */

var TYPO3 = TYPO3 || {};
TYPO3.seminars = {};

/**
 * Marks the current attachment as deleted if the confirm becomes submitted.
 *
 * @param {String} listItemId
 *        ID of the list item with the attachment to delete, must not be empty
 * @param {String} confirmMessage
 *        localized confirm message for whether really to mark an attachment for
 *        deletion
 */
TYPO3.seminars.markAttachmentAsDeleted = function (listItemId, confirmMessage) {
    var listItem = document.getElementById(listItemId);
    var deleteButton = document.getElementById(listItemId + '_button');

    if (confirm(confirmMessage)) { 
        document.getElementById('tx_seminars_pi1_seminars__delete_attached_files').value += ',' + listItem.firstChild.nodeValue;
        listItem.setAttribute('class', 'deleted');
        deleteButton.disabled = true;
    }
};

/**
 * Marks the current attachment as deleted if the confirm becomes submitted.
 *
 * @param {String} listItemId
 *        ID of the list item with the attachment to delete, must not be empty
 * @param {String} confirmMessage
 *        localized confirm message for whether really to mark an attachment for
 *        deletion
 */
TYPO3.seminars.markImageAsDeleted = function (listItemId, confirmMessage) {
    var listItem = document.getElementById(listItemId);

    document.getElementById('tx_seminars_pi1_seminars__delete_image').value += ',' + listItem.firstChild.nodeValue;
    jQuery('.uploaded-image').hide();
    jQuery('.new-image').show();

};

/**
 * Marks the current attachment as deleted if the confirm becomes submitted.
 *
 * @param {String} listItemId
 *        ID of the list item with the attachment to delete, must not be empty
 * @param {String} confirmMessage
 *        localized confirm message for whether really to mark an attachment for
 *        deletion
 */
TYPO3.seminars.markVeranstalter_logoAsDeleted = function (listItemId, confirmMessage) {
    var listItem = document.getElementById(listItemId);

    document.getElementById('tx_seminars_pi1_seminars__delete_veranstalter_logo').value += ',' + listItem.firstChild.nodeValue;
    jQuery('.uploaded-veranstalter_logo').hide();
    jQuery('.new-veranstalter_logo').show();

};

/**
 * Collects the names from the first/last name field pairs and compiles/inserts
 * them into the human-readable "additional attendees" field and the machine-readable
 * "structured attendees" field.
 */
TYPO3.seminars.compileNames = function () {
    var $nameFieldsContainer = jQuery('#tx_seminars_pi1_registration_editor_separate_names');
    if ($nameFieldsContainer.length === 0) {
        return;
    }

    var humanReadableField = jQuery('#tx_seminars_pi1_registration_editor__attendees_names')[0];
    var machineReadableField = jQuery('#tx_seminars_pi1_registration_editor__structured_attendees_names')[0];

    var separateNamesElement = jQuery('#tx_seminars_pi1_registration_editor_separate_names');

    var firstNames = separateNamesElement.find('.tx_seminars_pi1_registration_editor_first_name');
    var lastNames = separateNamesElement.find('.tx_seminars_pi1_registration_editor_last_name');
    var positions = separateNamesElement.find('.tx_seminars_pi1_registration_editor_position');
    var eMailAddresses = separateNamesElement.find('.tx_seminars_pi1_registration_editor_attendee_email');

    var humanReadableNames = '';
    var machineReadableNames = [];

    var numberOfLines = firstNames.length;

    for (var i = 0; i < numberOfLines; i++) {
        var firstName = jQuery.trim(firstNames[i].value);
        var lastName = jQuery.trim(lastNames[i].value);

        if (firstName === '' && lastName === '') {
            continue;
        }

        var position = '';
        if (i < positions.length) {
            position = jQuery.trim(positions[i].value);
        }

        var eMailAddress = '';
        if (i < eMailAddresses.length) {
            eMailAddress = jQuery.trim(eMailAddresses[i].value);
        }

        var fullName = jQuery.trim(firstName + ' ' + lastName);
        if (humanReadableNames !== '') {
            humanReadableNames += "\r\n";
        }
        humanReadableNames += fullName;

        if (position !== '') {
            humanReadableNames += ', ' + position;
        }
        if (eMailAddress !== '') {
            humanReadableNames += ', ' + eMailAddress;
        }

        machineReadableNames[i] = [firstName, lastName, position, eMailAddress];
    }

    humanReadableField.value = humanReadableNames;
    machineReadableField.value = JSON.stringify(machineReadableNames);
};

/**
 * Restores the separate name fields from the hidden field with the names
 * in a JSON-encoded array.
 */
TYPO3.seminars.restoreSeparateNameFields = function () {
    var machineReadableField = jQuery('#tx_seminars_pi1_registration_editor__structured_attendees_names')[0];

    if (!machineReadableField || machineReadableField.value === '') {
        return;
    }

    var separateNamesElement = jQuery('#tx_seminars_pi1_registration_editor_separate_names');
    var firstNames = separateNamesElement.find('.tx_seminars_pi1_registration_editor_first_name');
    var lastNames = separateNamesElement.find('.tx_seminars_pi1_registration_editor_last_name');
    var positions = separateNamesElement.find('.tx_seminars_pi1_registration_editor_position');
    var eMailAddresses = separateNamesElement.find('.tx_seminars_pi1_registration_editor_attendee_email');

    if (firstNames.length !== lastNames.length) {
        return;
    }

    var allNames = JSON.parse(machineReadableField.value);
    var numberOfNames = Math.min(firstNames.length, allNames.length);

    for (var i = 0; i < numberOfNames; i++) {
        firstNames[i].value = allNames[i][0];
        lastNames[i].value = allNames[i][1];
        if (positions[i]) {
            positions[i].value = allNames[i][2];
        }
        if (eMailAddresses[i]) {
            eMailAddresses[i].value = allNames[i][3];
        }
    }
};

/**
 * Adds or drops name fields to match the number of selected seats.
 */
TYPO3.seminars.fixNameFieldsNumber = function () {
    var neededNameLines = TYPO3.seminars.getNumberOfNeededNameFields();
    var nameLines = jQuery('#tx_seminars_pi1_registration_editor_separate_names .tx_seminars_pi1_registration_editor_name_line');

    if (nameLines.length < neededNameLines) {
        var nameLineTemplate = jQuery('#tx_seminars_pi1_registration_editor_name_template .tx_seminars_pi1_registration_editor_name_line')[0];
        if (!nameLineTemplate) {
            return;
        }

        var nameLinesContainer = jQuery('#tx_seminars_pi1_registration_editor_separate_names');

        for (var i = nameLines.length; i < neededNameLines; i++) {
            nameLinesContainer.append(nameLineTemplate.cloneNode(true));
        }
    } else if (nameLines.length > neededNameLines) {
        for (var j = nameLines.length; j > neededNameLines; j--) {
            $(nameLines[j - 1]).remove();
        }
    }
};

/**
 * Gets the number of needed name fields.
 *
 * @return {Number} the number of needed name fields, will be >= 0
 */
TYPO3.seminars.getNumberOfNeededNameFields = function () {
    var seatsElements = jQuery('#tx_seminars_pi1_registration_editor__seats');
    if (seatsElements.length === 0) {
        return 0;
    }

    var seats = parseInt(seatsElements[0].value);

    var myselfSelector = jQuery('#tx_seminars_pi1_registration_editor__registered_themselves');
    var selfSeat;
    if (myselfSelector.length > 0) {
        selfSeat = parseInt(myselfSelector.attr('value'));
    } else {
        var $defaultValue = jQuery('#tx-seminars-pi1-themselves-default');
        if ($defaultValue.length > 0) {
            selfSeat = parseInt($defaultValue.data('value'));
        } else {
            selfSeat = 1;
        }
    }

    return seats - selfSeat;
};

/**
 * Updates an auxiliary record after it has been edited in the FE editor.
 *
 * @param {String} htmlId
 *        the HTML ID of the auxiliary record checkbox label to update, must not
 *        be empty
 * @param {String} title the title of the auxiliary record, must not be empty
 */
TYPO3.seminars.updateAuxiliaryRecordInEditor = function (htmlId, title) {
    var labels = jQuery('#' + htmlId);
    if (labels.length === 0) {
        return;
    }

    labels[0].innerHTML = title;
};

/**
 * Updates an auxiliary record after it has been edited in the FE editor to listbox.
 *
 * @param {String} htmlId
 *        the HTML ID of the auxiliary record checkbox label to update, must not
 *        be empty
 * @param {String} elementId the elementId of the auxiliary record, must not be empty
 * @param {String} title the title of the auxiliary record, must not be empty
 */
TYPO3.seminars.updateAuxiliaryRecordInEditorToListbox = function (htmlId, elementId, title) {
    jQuery("#"+htmlId+" option[value="+elementId+"]").text(title);
};

/**
 * Appends an auxiliary record as a checkbox so that it is available for
 * selection in the FE editor.
 *
 * @param {Number} uid the UID of the record to add, must be > 0
 * @param {String} title the title of the record, must not be empty
 * @param {String} htmlName
 *        the relevant part of the IDs and names for the selection elements,
 *        e.g. "place", "speaker" or "tutor".
 * @param {Array} buttonData the data of the edit button of the record
 */
TYPO3.seminars.appendAuxiliaryRecordInEditor = function (uid, title, htmlName, buttonData) {
    var container = jQuery('#tx_seminars_pi1_seminars_' + htmlName + ' tbody')[0];
    if (!container) {
        return;
    }
    var nextOptionNumber = jQuery('#tx_seminars_pi1_seminars_' + htmlName + ' input').length;

    var id = 'tx_seminars_pi1_seminars_' + htmlName + '_' + nextOptionNumber;
    var input = document.createElement('input');
    input.setAttribute('id', id);
    input.setAttribute('type', 'checkbox');
    input.setAttribute('value', uid);
    input.setAttribute('name', 'tx_seminars_pi1_seminars[' + htmlName + '][' + nextOptionNumber + ']');
    input.setAttribute('class', 'tx-seminars-pi1-event-editor-checkbox');

    var labelId = 'tx_seminars_pi1_seminars_' + htmlName + '_label_' + uid;
    var label = document.createElement('label');
    label.setAttribute('for', id);
    label.setAttribute('id', labelId);
    label.appendChild(document.createTextNode(title));

    var button = document.createElement('input');
    button.setAttribute('type', 'button')
    button.setAttribute('name', buttonData.name);
    button.setAttribute('value', buttonData.value);
    button.setAttribute('id', buttonData.id);
    button.setAttribute('class', 'tx-seminars-pi1-event-editor-edit-button');   

    var tableRow = document.createElement('tr');
    var tableColumnLeft = document.createElement('td');
    var tableColumnRight = document.createElement('td');

    tableColumnLeft.appendChild(input);
    tableColumnLeft.appendChild(label);
    tableColumnRight.appendChild(button);
    tableRow.appendChild(tableColumnLeft);
    tableRow.appendChild(tableColumnRight);

    container.appendChild(tableRow);
};


/**
 * Appends an auxiliary record as a select option so that it is available for
 * selection in the FE editor.
 *
 * @param {Number} uid the UID of the record to add, must be > 0
 * @param {String} title the title of the record, must not be empty
 * @param {String} htmlName
 *        the relevant part of the IDs and names for the selection elements,
 *        e.g. "place", "speaker" or "tutor".
 * @param {Array} buttonData the data of the edit button of the record
 */
TYPO3.seminars.appendAuxiliaryRecordInEditorToListbox = function (uid, title, htmlName, buttonData) {
    jQuery("#tx_seminars_pi1_seminars__"+htmlName).append("<option value='"+ uid +"'>"+ title +"</option>");
    jQuery("#tx_seminars_pi1_seminars__"+htmlName).val(uid);

    if ( htmlName == "place" ) {
        var button = document.createElement('input');
        button.setAttribute('type', 'button')
        button.setAttribute('name', buttonData.name);
        button.setAttribute('value', buttonData.value);
        button.setAttribute('id', buttonData.id);
        button.setAttribute('class', 'tx-seminars-pi1-event-editor-edit-button');
        
        document.getElementById("editPlaceButtons").appendChild(button);

        changeEditPlaceButton(document.getElementById("tx_seminars_pi1_seminars__place"));
    }
};


/**
 * Appends a place so that it is available for selection in the FE editor.
 *
 * @param {Number} uid the UID of the place to add, must be > 0
 * @param {String} title the title of the place, must not be empty
 * @param {Array} buttonData the data of the edit button of the place
 */
TYPO3.seminars.appendPlaceInEditor = function (uid, title, buttonData) {
    TYPO3.seminars.appendAuxiliaryRecordInEditorToListbox(uid, title, "place", buttonData);
};

/**
 * Appends a speaker so that it is available for selection in the FE editor.
 *
 * @param {Number} uid the UID of the speaker to add, must be > 0
 * @param {String} title the name of the speaker, must not be empty
 * @param {Array} buttonData the data of the edit button of the speaker
 */
TYPO3.seminars.appendSpeakerInEditor = function (uid, title, buttonData) {
    // TYPO3.seminars.appendAuxiliaryRecordInEditorToListbox(uid, title, 'speakers', buttonData);
    TYPO3.seminars.appendAuxiliaryRecordInEditor(uid, title, 'speakers', buttonData);
};

/**
 * Appends a checkbox so that it is available for selection in the FE editor.
 *
 * @param {Number} uid the UID of the checkbox to add, must be > 0
 * @param {String} title the title of the checkbox, must not be empty
 * @param {Array} buttonData the data of the edit button of the checkbox
 */
TYPO3.seminars.appendCheckboxInEditor = function (uid, title, buttonData) {
    TYPO3.seminars.appendAuxiliaryRecordInEditor(uid, title, 'checkboxes', buttonData);
};

/**
 * Appends a target group so that it is available for selection in the FE editor.
 *
 * @param {Number} uid the UID of the target group to add, must be > 0
 * @param {String} title the title of the target group, must not be empty
 * @param {Array} buttonData the data of the edit button of the target group
 */
TYPO3.seminars.appendTargetGroupInEditor = function (uid, title, buttonData) {
    TYPO3.seminars.appendAuxiliaryRecordInEditor(uid, title, 'target_groups', buttonData);
};

/**
 * Clears the selection of the search widget.
 */
TYPO3.seminars.clearSearchWidgetFields = function () {
    
    window.history.replaceState(null, null, window.location.pathname);

    var prefix = 'tx_seminars_pi1';
    var textElements = ['sword', 'search_age', 'price_from', 'price_to'];
    for (var i = 0; i < textElements.length; i++) {
        var textElement = document.getElementById(prefix + '_' + textElements[i]);
        if (textElement) {
            textElement.value = null;
        }
    }

    var suffixes = ['dates', 'from_day', 'from_month', 'from_year', 'to_day', 'to_month',
        'to_year', 'event_type', 'language', 'country', 'city', 'place', 'date',
        'organizer', 'categories', 'eventtopic', 'veranstaltungslevel', 'track', 'durchfuehrungsart'
    ];

    for (var j = 0; j < suffixes.length; j++) {
        var suffix = suffixes[j];
        var element = document.getElementById(prefix + '-' + suffix);
        if (element) {
            for (var k = 0; k < element.options.length; k++) {
                element.options[k].selected = false;
            }
        }
    }
};

/**
 * Clears the selection of one field of the search widget.
 * @param {String} elementName
 */
TYPO3.seminars.clearSpecificSearchWidgetField = function (elementName) {

    var prefix = 'tx_seminars_pi1';

    var suffixes = [ elementName ]
    
    if( elementName == 'date' )
    {
        suffixes = ['from_day', 'from_month', 'from_year', 'to_day', 'to_month', 'to_year'];
    }

    for (var j = 0; j < suffixes.length; j++) {
        var suffix = suffixes[j];
        var element = document.getElementById(prefix + '-' + suffix);
        if (element) {
            for (var k = 0; k < element.options.length; k++) {
                element.options[k].selected = false;
                $(element).next().children().eq(k).removeClass('selected');
            }
            toggleActiveFilterDot(jQuery(element));
        }
    }
};


/**
 * Converts the links that have a data-method="post" to JavaScript-powered on-the-fly forms.
 */
TYPO3.seminars.convertActionLinks = function () {
    jQuery('a[data-method]').click(TYPO3.seminars.executeLinkAction);
};

/**
 * Executes the action on a link.
 *
 * @param {MouseEvent} event
 */
TYPO3.seminars.executeLinkAction = function (event) {
    var linkElement = event.target;
    var linkHref = linkElement.getAttribute('href');

    TYPO3.seminars.disableAllActionLinks();

    var formElement = document.createElement("form");
    formElement.style.display = 'none';
    formElement.setAttribute('method', 'post');
    formElement.setAttribute('action', linkHref);

    for (var j = 0; j < linkElement.attributes.length; j++) {
        var attribute = linkElement.attributes[j];
        var name = attribute.name;
        if (/^data-post-/.test(name)) {
            var dataParts = name.split('-');
            var inputElement = document.createElement('input');
            inputElement.setAttribute('type', 'hidden');
            inputElement.setAttribute('name', dataParts[2] + '[' + dataParts[3] + ']');
            inputElement.setAttribute('value', attribute.value);
            formElement.appendChild(inputElement);
        }
    }

    linkElement.appendChild(formElement);
    formElement.submit();

    return false;
};

/**
 * Disables all action links (so that they cannot be clicked again once an action is being processed).
 */
TYPO3.seminars.disableAllActionLinks = function () {
    var linkElements = document.querySelectorAll('a[data-method]');
    for (var i = 0; i < linkElements.length; i++) {
        linkElements[i].onclick = function () {
            return false;
        };
    }
};

/**
 * Prevents registration form submit event to be called twice.
 */
TYPO3.seminars.preventMultipleFormSubmit = function () {
    var submitForm = document.getElementById('tx_seminars_pi1_registration_editor');
    var submitButton = document.getElementById('tx_seminars_pi1_registration_editor__button_submit');
    submitForm.addEventListener('submit', function (event) {
        if (submitButton.hasAttribute('disabled')) {
            event.preventDefault();
        }
    });
}

/**
 * Initializes the search widget.
 */
TYPO3.seminars.initializeSearchWidget = function () {
    if (jQuery('.tx-seminars-pi1-selectorwidget').length === 0) {
        return;
    }

    jQuery('.tx-seminars-pi1-clear-search-widget').click(function () {
        TYPO3.seminars.clearSearchWidgetFields();
    });

    jQuery('.filter-clear-all-mobile').click(function () {
        jQuery('.tx-seminars-pi1-clear-search-widget').click();
    });

    jQuery('.tx-seminars-pi1-selectorwidget .clear-one-field').each(function() {
        jQuery(this).click(function () {
            TYPO3.seminars.clearSpecificSearchWidgetField( jQuery(this).attr("name") );
        });
    });


    //enables multiple selections and single deselections with mouse only
    jQuery('.tx-seminars-pi1-selectorwidget span select option').mousedown(function(e) {
            e.preventDefault();
            this.selected = !this.selected;
            toggleActiveFilterDot(jQuery(this).parent());
        }
    );
    
    jQuery('#filter-toggle-options').change(function () {
        if (this.checked) {
            $("body").css("overflow", "hidden"); 
        } else {
            $("body").css("overflow", "auto"); 
        }
    });

    jQuery(window).on('resize', function(){
        if (jQuery(this).width() >= 768) { 
            jQuery('#filter-toggle-options').prop('checked', false).change();
        }
    });

};

let initialFilterSelections = [];

function toggleActiveFilterDot(selectElement){
    let labelElem = jQuery('label[for='+ selectElement.parent().attr('id')+'-checkbox]');

    let circleClass;
    let selectType = selectElement.attr("id").split('-')[1];
    let initialSel = initialFilterSelections[selectType];
    let currentSel = selectElement.val();

    let isSameSelection = (initialSel.toString()===currentSel.toString())

    if(isSameSelection){
        circleClass="fas";
    }
    else {
        circleClass="far"
    }

    if(selectElement.val().length)
    { //something is selected
        if(!labelElem.has(".fa-circle."+circleClass).length){ //has no circle
            labelElem.find(".fa-circle").remove();
            labelElem.find(".fa-chevron-right").before('<i class="' + circleClass + ' fa-circle"></i>');
            labelElem.nextAll(".tx-seminars-pi1-optionbox").addClass("long-label");
        }

        if(!jQuery(".filter-toggle-button").has(".fa-circle").length){ //has no circle
            jQuery(".filter-toggle-button").append('<i class="fas fa-circle"></i>');
        }
    }
    else
    { //nothing is selected
        labelElem.find(".fa-circle").remove();  

        if(!isSameSelection){
            labelElem.find(".fa-chevron-right").before('<i class="' + circleClass + ' fa-circle"></i>');
        }
        else {
            labelElem.nextAll(".tx-seminars-pi1-optionbox").removeClass("long-label");
        }
    }
}


/**
 * This method updates the UI if anything corresponding the number of seats has changed.
 */
TYPO3.seminars.updateAttendees = function () {
    TYPO3.seminars.fixNameFieldsNumber();
    TYPO3.seminars.compileNames();
};

/**
 * Initializes the registration form.
 */
TYPO3.seminars.initializeRegistrationForm = function () {
    var registrationForm = jQuery('#tx-seminars-pi1-registration-form');
    if (registrationForm.length === 0) {
        return;
    }

    registrationForm.find('#tx_seminars_pi1_registration_editor_separate_names').on('blur', 'input', TYPO3.seminars.compileNames);
    registrationForm.find('#tx_seminars_pi1_registration_editor__seats').change(TYPO3.seminars.updateAttendees);
    registrationForm.find('#tx_seminars_pi1_registration_editor__registered_themselves_checkbox').click(TYPO3.seminars.updateAttendees);

    TYPO3.seminars.fixNameFieldsNumber();
    TYPO3.seminars.restoreSeparateNameFields();
    TYPO3.seminars.compileNames();
    TYPO3.seminars.preventMultipleFormSubmit();
};

/**
 * Converts (input) type
 */
TYPO3.seminars.convertInputType = function () {
    let elemMaxAttendees = document.getElementById('tx_seminars_pi1_seminars__attendees_max');
    if (elemMaxAttendees) {
        elemMaxAttendees.type = 'number';
    }
};

/**
 * Toggles Upload button so that only one image coud be uploaded
 */
TYPO3.seminars.checkForUploadedImages = function () {
    if (document.getElementsByClassName('uploaded-image').length > 0) {
        jQuery('.new-image').hide(); 
    }
};

/**
 * Toggles Upload button so that only one veranstalter_logo coud be uploaded
 */
TYPO3.seminars.checkForUploadedVeranstalter_logos = function () {
    if (document.getElementsByClassName('uploaded-veranstalter_logo').length > 0) {
        jQuery('.new-veranstalter_logo').hide();
    }
};

jQuery(document).ready(function () {
    if (jQuery('.tx-seminars-pi1').length === 0) {
        return;
    }

    TYPO3.seminars.initializeSearchWidget();
    TYPO3.seminars.initializeRegistrationForm();
    TYPO3.seminars.convertActionLinks();
    TYPO3.seminars.convertInputType();
    TYPO3.seminars.checkForUploadedImages();
    TYPO3.seminars.checkForUploadedVeranstalter_logos();

    moveAndShowEditPlaceButtons();

    $('.date-wrapper input').datetimepicker({
        lang:'de',
        format:'d.m.Y H:i',
        step: 15,
        minDate:'2021/07/12', //yesterday is minimum date(for today use 0 or -1970/01/01)
        maxDate:'2021/07/19', //tomorrow is maximum date calendar
        defaultDate:'2021/07/09',
        yearStart: 2021,
        yearEnd: 2021,
        // fixed: true,
        onShow:logic,
        onClose: logicClose
    });
    
    $('#begindate_datepicker img').click(function () {
        $('#begindate_datepicker input').datetimepicker('show');
    });

    $('#enddate_datepicker img').click(function () {
        $('#enddate_datepicker input').datetimepicker('show');
    });

    
    //set maxlength for input
    function setInputMaxlength (selector, maxlength) {
        $(selector).attr('maxlength', maxlength);
    }

    setInputMaxlength("#tx_seminars_pi1_seminars__title", 70);
    setInputMaxlength("#tx_seminars_pi1_seminars__teaser", 200);
    setInputMaxlength("#tx_seminars_pi1_seminars__description", 2000);
    setInputMaxlength("#tx_seminars_pi1_seminars__zielgruppe", 200);
    setInputMaxlength("#tx_seminars_pi1_seminars__agenda", 200);

    //the following code ensures that only selected topics can be selected as priorities

    //set initial
    let topicpriority1Selector = "#tx_seminars_pi1_seminars__topicpriority1";
    let topicpriority2Selector = "#tx_seminars_pi1_seminars__topicpriority2";

    setDisabledTopics();

    //sets disable/enabled for each topic
    function setDisabledTopics() {
        $("[id^=tx_seminars_pi1_seminars__eventtopic_]").each(function (i) {
            changeDisabledTopicOption(this);
        });
    }

    //if a topic checkbox changes, update disabled/enabled for that value 
    $("[id^=tx_seminars_pi1_seminars__eventtopic_]").change(function () {
        changeDisabledTopicOption(this)
    });

    //changes disabled/enabled according to its corresponding checkbox state
    function changeDisabledTopicOption(that) {
        //gets the topic number
        let str = that.id;
        let topicNum =  parseInt($('#'+str).val());

        if (!isNaN(topicNum)) {
            let dropdown1 = topicpriority1Selector + " option[value=" + topicNum + "]";
            let dropdown2 = topicpriority2Selector + " option[value=" + topicNum + "]";

            if (that.checked) {
                $(dropdown1).removeAttr("disabled");
                $(dropdown2).removeAttr("disabled");
            }
            else {
                $(dropdown1).attr("disabled", "true");
                $(dropdown2).attr("disabled", "true");
            }
        }

        if ($(topicpriority1Selector).val() == null) {
            $(topicpriority1Selector).val("0");
        };

        if ($(topicpriority2Selector).val() == null) {
            $(topicpriority2Selector).val("0");
        };
    }

    //ensures that priorities can only be selected in one dropdown
    $(topicpriority1Selector + ", " + topicpriority2Selector).change(function () {
        preventSamePriorityValue(this)
    });

    function preventSamePriorityValue(that) {
        let seletedValue = $(that).val();
        let dropdown1 = topicpriority1Selector + " option[value=" + seletedValue + "]";
        let dropdown2 = topicpriority2Selector + " option[value=" + seletedValue + "]";

        if (that.id == "tx_seminars_pi1_seminars__topicpriority1") {

            setDisabledTopics();

            if (seletedValue != "0") {
                $(dropdown2).attr("disabled", "true");
            }

            if ($(topicpriority2Selector).val() != "0") {
                $(topicpriority1Selector + " option[value=" + $(topicpriority2Selector).val() + "]").attr("disabled", "true");
            }

        }

        if (that.id == "tx_seminars_pi1_seminars__topicpriority2") {

            setDisabledTopics();

            if (seletedValue != "0") {
                $(dropdown1).attr("disabled", "true");
            }

            if ($(topicpriority1Selector).val() != "0") {
                $(topicpriority2Selector + " option[value=" + $(topicpriority1Selector).val() + "]").attr("disabled", "true");
            }

        }
    }
    //the above-noted code ensures that only selected topics can be selected as priorities

    function moveAndShowEditPlaceButtons() {        
        let editPlaceButtonWrap = jQuery('#editPlaceButtons');
        if(editPlaceButtonWrap.length > 0) {
            jQuery('input[id^=tx_seminars_pi1_seminars__editPlaceButton_]').appendTo(editPlaceButtonWrap).hide();        
            changeEditPlaceButton(document.getElementById("tx_seminars_pi1_seminars__place"));
        }        
    }

    $("#tx_seminars_pi1_seminars__place").change(function () {
        changeEditPlaceButton(this)
    });

    jQuery('.tx-seminars-pi1-selectorwidget span select').each(function() {

        //cache initial filter selection values
        let keyName = jQuery(this).attr("id").split('-')[1];
        initialFilterSelections[keyName] = jQuery(this).val();

        toggleActiveFilterDot(jQuery(this));
    });

    // creates <ul> based on select with same functionality for better styling
    jQuery('.tx-seminars-pi1-selectorwidget span select').each(function () {

        let selectElement1 = jQuery(this);
        let numberOfOptions = selectElement1.children('option').length;

        // Hides the select element
        selectElement1.hide();

        // Insert <ul> after select element
        var $generatedlist = jQuery('<ul />', {
            'class': 'options'
        }).insertAfter(selectElement1);

        // Insert a list item into the unordered list for each select option
        for (var i = 0; i < numberOfOptions; i++) {
            jQuery('<li />', {
                text: selectElement1.children('option').eq(i).text(),
                'class': (selectElement1.children('option').eq(i).get(0).selected) ? 'selected' : '',
                rel: selectElement1.children('option').eq(i).val()
            }).appendTo($generatedlist);
        }

        var $listItems = $generatedlist.children('li');

        // Updates the select element to have the value of the equivalent option
        $listItems.click(function (e) {
            e.stopPropagation();

            let val1 = jQuery(this).attr('rel');
            let selectedOption = selectElement1.find('option[value="'+val1+'"]');

            selectedOption.trigger('mousedown');
            selectedOption.trigger('mouseup');

            jQuery(this).toggleClass( "selected", selectedOption[0].selected );

        });
    });

    //toggles highlight on filter label and closes other open filters
    $('form .filter-checkbox-hidden').change(function(){
        $(this).prev().toggleClass("filter-label-highlight");
        $('form .filter-checkbox-hidden').not($(this)).prop('checked', false).prev().removeClass("filter-label-highlight");
    });

    // pre-fill event package field from events submission form depending on url parameter
    var term = $.urlParam('eventpaket');
    if (term) {
        $('#tx_seminars_pi1_seminars__eventpaket').val(term); 
    }

});

function changeEditPlaceButton(elem) {   
    let editPlaceButtonWrap = jQuery('#editPlaceButtons');    
    jQuery('input[id^=tx_seminars_pi1_seminars__editPlaceButton_]').hide();
    let buttonObject = jQuery('#tx_seminars_pi1_seminars__editPlaceButton_'+elem.value);
    if(buttonObject.length > 0) {
        editPlaceButtonWrap.show();
        buttonObject.show();
    } else {            
        editPlaceButtonWrap.hide();
    }
}

jQuery('input[type="file"]').change(function(e) {
    var fileName = e.target.files[0].name;

    switch (e.target.id) {
        case 'tx_seminars_pi1_seminars__image':
                jQuery('#new-image-input').val(fileName);
        break;

        case 'tx_seminars_pi1_seminars__veranstalter_logo':
                jQuery('#new-veranstalter_logo-input').val(fileName);
        break;

        case 'femanager_field_image':
                jQuery('#new-image-input').val(fileName);
    }   
});

var logic = function() {
    $('body').append('<div class="datepicker_modalboxoverlay" style="background-color: black; position: absolute; top: 0px; left: 0px; z-index: 100000; width: 100%; height: 3680px; padding: 0px; margin: 0px; opacity: 0.6;"></div>');
    $('.xdsoft_datetimepicker ').css('z-index', 20000000);
};
var logicClose = function() {
    $('.datepicker_modalboxoverlay').remove();
};

$('.filter-apply-desktop').click(function () {
    jQuery(".tx-seminars-pi1-selectorwidget form").attr("method", "get"); 
});

$.urlParam = function(name){
    var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
    if (results==null){
       return null;
    }
    else{
       return results[1] || 0;
    }
}

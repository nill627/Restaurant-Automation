/**
 * Authors - Mit, Raj, Prabhjot, Nill, Dylan, Mouli
 * Project Website - https://github.com/Mitbits/Software-Project
 */

import { CountDownTimer } from './CountDownTimer.js';
import { Template } from 'meteor/templating';
import { Order, Orders } from '../../imports/api/order.js';
import { MenuItems, MenuItem } from '../../imports/api/menuItem.js';
import { orderQueue } from '../../imports/api/priorityManager.js';
import { inventoryItems, inventoryItem} from '../../imports/api/ingredient.js';
import updatePriorityManager from '../../imports/api/priorityManager.js';

Template.orderRow.events({
    /**
     * @function click div#tap
     * @summary Catches all the events that occur on the page
     */
    'click div#tap': function(event, templateInstance) {
        // check if user clicked on the buttons
        /*
        if (!templateInstance.data.timer) {
            console.log('timer not found' + templateInstance.data.itemName);
        }
        */
        var id = event.target.id;
        if(id == 'done-btn' || id == 'done-btn-icon') {
            doneButtonHandler(event, templateInstance);
            return;
        } else if(id == 'add-time-btn' || id == 'add-time-icon') {
            addTimeHandler(event, templateInstance);
            return;
        }

        var $colorObj = $(event.target.parentNode);
        var classesApplied = $colorObj.attr('class');
        var isActive = classesApplied.includes('active');
        var $addTimeBtn = $colorObj.find('#add-time-btn');

        if (isActive) { //change it to normal- white
            $colorObj.removeClass('active');
            $colorObj.addClass('white');
            $addTimeBtn.addClass('disabled');
            resetTimer(event, templateInstance);
        } else {
            $colorObj.removeClass('white');
            $colorObj.addClass('active');
            $addTimeBtn.removeClass('disabled');
            startTimer(event, templateInstance);
        }
    }
});

/**
 * @name TimeObject Creator
 * @summary Creates the time objects when the page is rendered.
 */
Template.orderRow.onRendered(function() {
    // create timer
    var {timeMin, timeSec, timeText, $timeObj} = getTime(null, this.$('div#time'));
    var duration = 60*timeMin + timeSec;
    this.data.timer = new CountDownTimer(duration, 1000);
    this.$('div#undo').hide();
});

Template.orderQueue.helpers({
    /**
     * @function orders
     * @returns {Array.<orderItems>}
     */
    orders() {
        //console.log("orders() helper func");
        var data = updatePriorityManager();
        for(var obj of data) {

            var cookTime = parseInt(obj.cookTime * 60);
            console.log(cookTime);
            var min = parseInt(cookTime / 60);
            var sec = parseInt(cookTime % 60);
            obj.cookTimeStr = timeToString(min, sec);
        }
        return data;
    }
});

/**
 * @function doneButtonHandler
 * @summary Allows user to get rid of an order from the order queue and use that data to update new existing values in database based on the algorithm
 * @param event
 * @param templateInstance
 */
var doneButtonHandler = function(event, templateInstance) {
    var $selectedObj = $(event.target);
    var $deleteObj = $selectedObj.closest('#tap');
    $deleteObj.fadeOut('slow', function() {
        var $undoObj = $deleteObj.next();
        $undoObj.show();
        var clicked = false;
        $undoObj.find('#undo-btn').click(function() {
            $undoObj.hide();
            $deleteObj.show();
            clicked = true;
        });
        setTimeout(function() {
            if(!clicked) {
                //var timeElapsed = templateInstance.data.timer.ranFor; // time left

				var expectedCookTime = (MenuItem.findOne({ itemID: templateInstance.data.menuItemID }).cookTime);
				var timeTaken = 0;
				if(templateInstance.data.timer){

              timeTaken = templateInstance.data.timer.duration - templateInstance.data.timer.timeLeft - 6;
        }

        if(timeTaken < 0) {
          timeTaken = 0;
        }

        var element1 = Order.findOne({ orderID: templateInstance.data.orderID })
          .setItemCompleted(true, templateInstance.data.itemID - 1);
        //console.log(MenuItem.findOne({itemID: element1}).ingredients.length);

        //console.log(MenuItem.findOne({itemID: element1}).itemName);
        MenuItem.findOne({itemID: element1}).incrementTimesOrdered();
        for(var i = 0; i < length; i++) {
            var item = MenuItem.findOne({itemID: element1}).ingredients[i].ingItemID;
            var quantity = MenuItem.findOne({itemID: element1}).ingredients[i].ingQuantity;
            inventoryItem.findOne({invID: item}).subtractQuantity(quantity);
            inventoryItem.findOne({invID: item}).incrementTimesUsed();
        }

        var itemsCompleted = 0;

        Order.findOne({ orderID: templateInstance.data.orderID })
        .orderItems.forEach(function(element) {
            if (element.isCompleted) {
                itemsCompleted++;
            }
        });

        if(itemsCompleted == Order.findOne({ orderID: templateInstance.data.orderID }).orderItems.length) {
            Order.findOne({ orderID: templateInstance.data.orderID }).setOrderCompleted(true);
        }

        // calculate average time
        var newAverageCookTimeMins = parseFloat((0.5*(timeTaken + 60*expectedCookTime) / 60).toPrecision(3));

        Order.findOne({ orderID: templateInstance.data.orderID })
          .setCookTime(newAverageCookTimeMins, templateInstance.data.itemID - 1);
        MenuItem.findOne({ itemID: templateInstance.data.menuItemID })
          .setCookTime(newAverageCookTimeMins);
        /** rerender template and call priority manager here **/

                $deleteObj.remove();
                $undoObj.remove();
            }
        }, 5000);
    });
}

var deltaTime = 30;
/**
 * @function addTimeHandler
 * @summary Adds a specified amount of time (30secs for now) to the current time of an Order
 * @param event
 * @param templateInstance
 */
var addTimeHandler = function(event, templateInstance) {
    var { timeMin, timeSec, timeText, $timeObj } = getTime(event);
    var duration = 60*timeMin + timeSec + deltaTime;
    var time = CountDownTimer.parse(duration);
    timeText = timeToString(time['minutes'], time['seconds']);
    resetTimer(event, templateInstance);
    if(templateInstance.data.timer == null) {
        templateInstance.data.timer = new CountDownTimer(duration, 1000);
    }
    startCountDown($timeObj, duration, timeText, templateInstance.data.timer);
}

/**
 * @function startTimer
 * @summary When the user clicks on an Order this function will start the timer for that order
 * @param event
 * @param templateInstance
 */
var startTimer = function(event, templateInstance) {
    var {timeMin, timeSec, timeText, $timeObj} = getTime(event);
    var duration = 60*timeMin + timeSec;
    if(templateInstance.data.timer == null) {
        templateInstance.data.timer = new CountDownTimer(duration, 1000);
    }
    startCountDown($timeObj, duration, timeText, templateInstance.data.timer);
}
/**
 * @function getTime
 * @summary Gets the current time being shown to the user
 * @param event
 * @param {Object} $timeObj
 * @returns {{timeMin: number, timeSec: number, timeText: string, $timeObj: Object}}
 */
var getTime = function(event, $timeObj) {
    if(!$timeObj) {
        var $selectedObj = $(event.target);
        $timeObj = $selectedObj.closest('#tap').find('#time');
    }
    var timeText = $timeObj.text();
    var timeMin = 1*timeText.substring(0, timeText.indexOf(':'));
    var timeSec = 1*timeText.substring(timeText.indexOf(':')+1);
    return {timeMin, timeSec, timeText, $timeObj};
}

/**
 * @function timeToString
 * @summary Converts numerical time to text form
 * @param {Number} min - Minute Input
 * @param {Number} sec - Second Input
 * @returns {string}
 */
var timeToString = function(min, sec) {
    var timeText = '';
    if(min < 10) {
        timeText += '0'+min;
    } else {
        timeText += min;
    }

    if(sec < 10) {
        timeText += ':0'+sec;
    } else {
        timeText += ":"+sec;
    }
    return timeText;
}

/**
 * @function startCountDown
 * @summary Starts the count down and appropriately updates the screen
 * @param {Object} $timeObj
 * @param {Number} duration - Time length (seconds)
 * @param {String} resetTimeText - sets screen display to appropriate time (mm:ss (units))
 * @param {CountDownTimer} timer - holds data needed for numerous times
 */
var startCountDown = function($timeObj, duration, resetTimeText, timer) {
    //var timer = new CountDownTimer(duration, 1000);
    timer.onTick(function(min, sec) {
        if(timer.expired() && !timer.reset) {
            timerExpired($timeObj);
        }
        if(timer.reset) { // reset timer
            $timeObj.text(resetTimeText);
        } else {
            $timeObj.text(timeToString(min, sec));
        }
    });
    timer.start();
}

/**
 * @function resetTimer
 * @summary Resets the timer
 * @param event
 * @param templateInstance
 */
var resetTimer = function(event, templateInstance) {
	/*if(!timeText) {
	 var $selectedObj = $(event.target);
	 timeText = $selectedObj.closest('#tap').find('#time').text();
	 }*/

    templateInstance.data.timer.resetTimer();
    templateInstance.data.timer = null;
}

/**
 * @function timerExpired
 * @summary Highlights the row red when the timer time expires
 * @param {Object} $timeObj A jquery object of the encapsulates the timer div
 */
var timerExpired = function($timeObj) {
    var $orderRow = $timeObj.closest('div#tap');
    $orderRow.removeClass('white');
    $orderRow.removeClass('active');
    $orderRow.addClass('expired');
}

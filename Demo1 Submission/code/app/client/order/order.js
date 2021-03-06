import { CountDownTimer } from './CountDownTimer.js';
import { Template } from 'meteor/templating';
import { Order, Orders } from '../../imports/api/order.js';
import '../../imports/api/priorityManager.js';
import { PriorityManager } from '../../imports/api/priorityManager.js';

Template.orderRow.events({
    /**
     * @function
     * @name click div#tap
     * @summary Catches all the events that occur on the page
     */
	'click div#tap': function(event, templateInstance) {
		// check if user clicked on the buttons
		if (!templateInstance.data.timer) {
			console.log('timer not found');
		}
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

		if(isActive) { //change it to normal- white
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
		return PriorityManager.start();
	}
});

/**
 * @function doneButtonHandler
 * @summary Allows user to get rid of an order from the order queue
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
 * @param {JQuery} $timeObj
 * @returns {{timeMin: number, timeSec: number, timeText: string, $timeObj: JQuery}}
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
 * @param {JQuery} $timeObj
 * @param {Number} duration - Time length (seconds)
 * @param {String} resetTimeText - sets screen display to appropriate time (mm:ss (units))
 * @param {CountDownTimer} timer - holds data needed for numerous times
 */
var startCountDown = function($timeObj, duration, resetTimeText, timer) {
	//var timer = new CountDownTimer(duration, 1000);
	timer.onTick(function(min, sec) {
		if(timer.expired() && !reset) {
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
 * @param {JQuery} $timeObj A jquery object of the encapsulates the timer div
 */
var timerExpired = function($timeObj) {
	var $orderRow = $timeObj.closest('div#tap');
	$orderRow.removeClass('white');
	$orderRow.removeClass('active');
	$orderRow.addClass('expired');
}

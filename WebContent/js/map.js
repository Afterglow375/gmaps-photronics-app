// Declaring global vars to prevent JS hint from whining about undefined vars
/*global google:false */
/*global InfoBox:false */
/*global $:false */
/*global CodeMirror:false */

// Global variables to be used by many functions
var map;
var infoWindow = new google.maps.InfoWindow();
var lineInfoWindow = new google.maps.InfoWindow();
var markersArr;
var SENDING = "#0000FF"; // Sending color
var RECEIVING = "#E68A00"; // Receiving color
var FAILURE = "#FF0000"; // Failure color

function initialize() {
	"use strict";

	// Creating the styling for the map
	// See here for more info: https://developers.google.com/maps/documentation/javascript/styling
	var styles = [
	  {
	    "featureType": "road.highway",
	    "stylers": [
	      { "visibility": "off" }
	    ]
	  },{
	    "featureType": "administrative.country",
	    "elementType": "geometry.fill",
	    "stylers": [
	      { "weight": 0.1 },	
	      { "visibility": "on" }
	    ]
	  },{
	    "featureType": "administrative.country",
	    "elementType": "labels.text",
	    "stylers": [
	      { "visibility": "off" }
	    ]
	  },{
	    "featureType": "water",
	    "elementType": "labels",
	    "stylers": [
	      { "visibility": "off" }
	    ]
	  },{
	    "featureType": "administrative",
	    "elementType": "geometry",
	    "stylers": [
	      { "visibility": "off" }
	    ]
	  },{
	    "featureType": "administrative.province",
	    "stylers": [
	      { "visibility": "off" }
	    ]
	  },{
	    "featureType": "administrative.locality",
	    "stylers": [
	      { "visibility": "off" }
	    ]
	  },{
	    "featureType": "road",
	    "stylers": [
	      { "visibility": "off" }
	    ]
	  },{
	    "featureType": "poi",
	    "stylers": [
	      { "visibility": "off" }
	    ]
	  },{
	    "featureType": "transit",
	    "stylers": [
	      { "visibility": "off" }
	    ]
	  },{
	    "featureType": "administrative.neighborhood",
	    "stylers": [
	      { "visibility": "off" }
	    ]
	  },{
	    "featureType": "administrative.country",
	    "elementType": "geometry",
	    "stylers": [
	      { "visibility": "on" }
	    ]
	  }
	];

	// Initializing the map
	var mapOptions = {
	  zoom: 3
	  ,disableDefaultUI: true
	  ,styles: styles
	  ,draggable: false
	  ,disableDoubleClickZoom: true
	  ,scrollwheel: false
	};

	map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);

	// Creating the array of markers
	// Can add or remove a site here
	// The order doesn't matter, nor does the order they occur in the input XML matter
	markersArr = [	
	 				new SmartMarker(new google.maps.LatLng(41.434544, -73.379402), "BRK", "Brookfield"),
	 				new SmartMarker(new google.maps.LatLng(33.0942,-96.678615), "ALN", "Allen"),
	 				new SmartMarker(new google.maps.LatLng(43.512193,-116.141053), "BOI", "Boise"),
	 				new SmartMarker(new google.maps.LatLng(51.124872,13.784212), "DRE", "Dresden"),
	 				new SmartMarker(new google.maps.LatLng(51.493548,-3.580192), "BGD", "Brigdend"),
	 				new SmartMarker(new google.maps.LatLng(36.851827,127.123332), "PKL", "Cheonan"),
	 				new SmartMarker(new google.maps.LatLng(24.777802, 121.016808), "PKT", "Hsin Chu"),
	 				new SmartMarker(new google.maps.LatLng(17, 130), "PSM", "Taichung"), // Made up lat/long
	 				new SmartMarker(new google.maps.LatLng(1.37541,103.975267), "SIN", "Singapore"),
	 				new SmartMarker(new google.maps.LatLng(33.155504,-117.123867), "MIL", "Milpitas"),
	 				new SmartMarker(new google.maps.LatLng(47, -12), "MAN", "Manchester"), // Made up lat/long
	 				new SmartMarker(new google.maps.LatLng(25,-92), "TRI", "Dallas") // Made up lat/long
	 			];

	// Ensuring all markers show up in the browser window (this bit of code is to accommodate different screen resolutions)
	var bounds = new google.maps.LatLngBounds();
	for (var i = 0; i < markersArr.length; i++) {
		bounds.extend(markersArr[i].marker.position);
	}
	map.fitBounds(bounds);

	// Creating the toggle all lines button
  	var button = document.createElement('div');
  	button.setAttribute("class", "btn btn-default");
  	button.setAttribute("type", "button");
  	button.style.marginBottom = '20px';
  	button.innerHTML = 'Toggle All Lines';
  	map.controls[google.maps.ControlPosition.BOTTOM_CENTER].push(button);
  	
  	// Creating the webpage header
  	var header = document.createElement('h1');
  	header.innerHTML = "Photronics Data Transfer Visualizer";
  	map.controls[google.maps.ControlPosition.TOP_CENTER].push(header);

	//
	// EVENT LISTENERS
	//

  	// Given a google maps marker object, obtain a reference to the respective SmartMarker
	function getSmartMarker(marker) {
		for (var i = 0; i < markersArr.length; i++) {
			if (marker.title === markersArr[i].title) {
				return markersArr[i];
			}
		}
	}
	
	// Single click on markers
	var center;
	var blackLinesToggle = false; // True if black lines are rendered, false if not
	var lastClicked = markersArr[0]; // Initializing to an arbitrary SmartMarker
	var lastClickedOn = false; // True if last marker clicked is active, false if not
	
	function singleClick() {
		var smartMarker = getSmartMarker(this);
		if (blackLinesToggle) {
			blackLinesToggle = toggleBlackLines(blackLinesToggle);
		}
		else {
			offPolylines(lastClicked);
		}
		onPolylines(smartMarker);
		lastClicked = smartMarker;
		lastClickedOn = true;
		infoWindow.setContent(infoWindowText(smartMarker.title, smartMarker.name, smartMarker.senders, smartMarker.receivers));
		infoWindow.open(map, smartMarker.marker);
	}
	
	// Sets the text of the InfoWindow on marker single click
	function infoWindowText(title, name, senders, receivers) {
		var fileStrSenders = ' files...';
		var fileStrReceivers = ' files...';
		if (senders === 1) {
			fileStrSenders = ' file...';
		}
		if (receivers === 1) {
			fileStrReceivers = ' file...';
		}

		return 	'<div class="infoWindow">' +
				'<h3>' + title + ' - ' + name + '</h3>' +
				'<p>Sending ' + senders + fileStrSenders + '</p>' +
				'<p>Receiving ' + receivers + fileStrReceivers + '</p>' +
				'</div>';
	}
	
	for (var i = 0; i < markersArr.length; i++) {
		google.maps.event.addListener(markersArr[i].marker, 'click', singleClick);
	}

  	// Double click on markers
  	var doubleClicked;
	function doubleClick() {
		var smartMarker = getSmartMarker(this);
		$('#dbl-click-modal-label').html(smartMarker.name);
  		populateMarkerModal(smartMarker);
  		$('#dbl-click-modal').modal('show');
  		doubleClicked = smartMarker;
	} 

	for (var i = 0; i < markersArr.length; i++) {
		google.maps.event.addListener(markersArr[i].marker, 'dblclick', doubleClick);
	}

  	// Miscellaneous event handlers
  	google.maps.event.addListener(map, 'click', function() {
	    if (!blackLinesToggle) {
			offPolylines(lastClicked);
		}
		lastClickedOn = false;
	    infoWindow.close();
	    map.panTo(center);
	    map.fitBounds(bounds);
  	});
  	google.maps.event.addListener(infoWindow, 'closeclick', function() {
	    map.panTo(center);
  	});
  	google.maps.event.addListenerOnce(map, "center_changed", function() { 
  		center = map.getCenter(); 
  	});

  	// Handling toggling all lines
  	google.maps.event.addDomListener(button, 'click', function() {
  		if (lastClickedOn) {
  			offPolylines(lastClicked);
  		}
  		lastClickedOn = false;
  		infoWindow.close();
  		blackLinesToggle = toggleBlackLines(blackLinesToggle);
  	});
  	
  	// This bit of code enables highlighting when mousing over a plate, redacted for now
  	
	//	$('#dbl-click-modal').on('mouseover', 'div div.modal-elem-wrapper', function() {
	//	$( this ).addClass( "modal-elem-mouseover" );
	//});
	//$('#dbl-click-modal').on('mouseout', 'div div.modal-elem-wrapper', function() {
	//	$( this ).removeClass( "modal-elem-mouseover" );
	//});
  	
  	//
  	// AJAX HANDLERS
  	//
  	
  	// Creating the proper loading spinner for the ajax loading modal, see https://github.com/jschr/bootstrap-modal for details
  	$.fn.modal.defaults.spinner = $.fn.modalmanager.defaults.spinner = 
  		'<div class="loading-spinner" style="width: 200px; margin-left: -100px;">' +
  			'<img alt="Loading..." src="ajax-loader.gif">' +
  		'</div>';
  	
  	// Displays the ajax-loader.gif whenever ajax occurs
  	var $body = $('body');
  	$(document)
		.ajaxStart(function() {
			$body.modalmanager('loading');
	})
		.ajaxStop(function() {
			$body.modalmanager('removeLoading');
	  		$body.modalmanager('removeSpinner');
	});
  	
  	// Refreshing the webpage periodically, using ajax
  	(function ajaxRefresh() {
  		// Turning off polylines
  		// The app malfunctions unless the polylines are turned off before this ajax call
  		var reClick = false;
  		var blackLinesOff = false;
  		if (blackLinesToggle) {
  			blackLinesToggle = toggleBlackLines(blackLinesToggle);
  			blackLinesOff = true;
  		}
  		if (lastClickedOn) {
  			google.maps.event.trigger(map, 'click');
  			reClick = true;
  		}

  		// Clear the contents of all the SmartMarkers
  		for (var i = 0; i < markersArr.length; i++) {
			markersArr[i].clear();
		}
  		
		// Parse the xml and fill up the appropriate data structures
  		$.ajax({
  			type: "GET"
  			,url: "MainData"
  			,dataType: "xml"
  			,cache: false // Set cache to false to handle IE not properly refreshing
  			,error: function(jqXHR, textStatus, errorThrown) {
  				alert("Database query failed.");
  				console.log(textStatus, errorThrown);
			}
  			,success: function(xml) {
  				var sender;
  				var receiver;
  				var plate;
  				var currLocation;
  				var count;
  				// Parsing the XML...
  				$(xml).find('sender').each(function() {

  					// Obtain a reference to the sender SmartMarker
  					sender = $(this).children('id').text();
  					for (var i = 0; i < markersArr.length; i++) {
		  				if (sender === markersArr[i].title) {
		  					sender = markersArr[i];
		  					break;
		  				}
		  			}

  					// Loop through the receivers array in the XML file and refresh SmartMarker data structures
  					$(this).find('receivers').each(function() {
  						receiver = $(this).children('receiver').text();
  						// Obtain a reference to the receiver SmartMarker
  						for (var j = 0; j < markersArr.length; j++) {
		  					if (receiver === markersArr[j].title) {
			  					receiver = markersArr[j];
			  					break;
			  				}
		  				}
						
						// Refreshing the internal data structures	  				
  						count = 0;
  						var failure = false;
  						$(this).find('plates').each(function() { // For each plate
  							for (var i = 0; i < markersArr.length; i++) {
				  				if ($(this).find('location').text() === markersArr[i].title) {
				  					currLocation = markersArr[i].name;
				  					break;
				  				}
				  			}
  							
  							var plateStatus = $(this).find('status').text();
  							if (plateStatus === "Failed") {
  								failure = true;
  							}

  							// The plate object contains all the info about each plate
  							plate = { 
  								index: $(this).attr('index')
  								,plateNumber: $(this).children('plate').text()
  								,status: plateStatus
  								,receiver: receiver.name
  								,location: currLocation
  								,xmlId: $(this).children('xml-data-id').text()
  								,jlnId: $(this).children('jln-id').text()
  								,cancelPending: $(this).children('cancel-pending').text()
  								,resetPending: $(this).children('reset-pending').text()
  								,rejectCopyStatus: $(this).children('reject-copy-status').text()
  							};

  							sender.refresh(receiver, plate);
  							count++;
  						});

  						// Creating the polylines
  						sender.sendersArr.push({
							receiverTitle: receiver.title
							,count: count
							,failure: failure
							,line: sender.createSenderPolyline(receiver, count, failure)
						});
						receiver.receiversArr.push({
							senderTitle: sender.title
							,count: count
							,failure: failure
							,line: sender.createReceiverPolyline(receiver, count, failure)
						});
  					});
  				});
  			}
  			,complete: function(jqXHR, status) { 
  				// Only refresh the modal if it's currently open
			  	if ($('#dbl-click-modal').hasClass('in')) {
					populateMarkerModal(doubleClicked);
			  	}
			  	
			  	// Re-showing the polylines
			  	if (reClick) {
	  				google.maps.event.trigger(lastClicked.marker, 'click');
		  		}
		  		if (blackLinesOff) {
		  			blackLinesToggle = toggleBlackLines(blackLinesToggle);
		  		}
  			}
  		});
  		
  		setTimeout(ajaxRefresh, 30000); // Refresh with ajax every 30 seconds
	})();
  	
  	// Code Mirror provides an in-browser text editor: http://codemirror.net/doc/manual.html
  	var myCodeMirror = CodeMirror.fromTextArea(document.getElementById("code-modal-textarea"), {
		lineNumbers: true
		,viewportMargin: Infinity // Setting to Infinity will allow CTRL+F to work everywhere, but slows performance
	});
  	
  	// Ajax handler for the "View and edit XML history" link
  	var $xmlError = $('#xml-error');
  	var xmlId;
	$('#dbl-click-modal').on('click', 'div .modal-elem-wrapper .xml-history', function() {
		var plateNumber = $(this).siblings('.plate-number').html();
		var plateCurrLocation = $(this).siblings('.plate-curr-location').html();
		xmlId = $(this).attr('id');
		$('#code-editor-modal .modal-footer').show();
		$xmlError.hide();

		$.ajax({
			type: "GET"
			,url: "XMLHistoryData"
			,data: {xmlId: xmlId}
			,cache: false
			,dataType: "text"
			,error: function(jqXHR, textStatus, errorThrown) {
				alert("Database query failed.");
				console.log(textStatus, errorThrown);
			}
			,success: function(xmlData) {
				
				// Creating the modal with the text editor in it
				var modalHeight = $(window).height() - 150;
				$('#code-editor-modal').modal({
			  		height: modalHeight-100 + 'px'
			  		,maxHeight: modalHeight + 'px'
			  		,keyboard: false
			  	});
				
				$('#code-editor-modal div .modal-title').html("Plate " + plateNumber + " XML History - Currently At " + plateCurrLocation);
				myCodeMirror.setSize('100%', '100%');
			    myCodeMirror.setValue(xmlData);
			}
		});
	});
	
	// Ajax handler for the "View and edit XML history" Save To Database button
	var parser = new DOMParser();
	$('#save-to-database').click(function() {
		var doc = parser.parseFromString(myCodeMirror.getValue(), "application/xml");
		var error = $(doc).find('parsererror div').html();

		// Display an error if there is one
		if (error !== undefined) { 
			$xmlError.children('#xml-error-text').html("XML Error: " + error);
			$xmlError.fadeIn('fast');
		}
		else { // Otherwise write to database
			$xmlError.fadeOut('fast');
			$.ajax({
				type: "POST"
				,url: "XMLHistoryData"
				,data: {
					xmlData: myCodeMirror.getValue()
					,xmlId: xmlId
				}
				,error: function(jqXHR, textStatus, errorThrown) {
					alert("Database query failed.");
					console.log(textStatus, errorThrown);
				}
				,success: function() {
					$('#code-editor-modal').modal('hide');
				}
			});
		}
	});
	
	// Ajax handler for the "See Log" link
	$('#dbl-click-modal').on('click', 'div .modal-elem-wrapper .plate-log', function() {
		// Retrieving vars to use in the table
		var jlnId = $(this).attr('id');
		var plateNumber = $(this).siblings('.plate-number').html();
		var plateCurrLocation = $(this).siblings('.plate-curr-location').html();
		var plateSender = $(this).siblings('.plate-sender').html();
		var plateReceiver = $(this).siblings('.plate-receiver').html();
		var plateSenderAbbr, plateReceiverAbbr;
		for (var i = 0; i < markersArr.length; i++) {
			if (markersArr[i].name === plateSender) {
				plateSenderAbbr = markersArr[i].title;
			}
			if (markersArr[i].name === plateReceiver) {
				plateReceiverAbbr = markersArr[i].title;
			}
		}

		$.ajax({
			type: "GET"
			,url: "PlateLogData"
			,data: { jlnId: jlnId
				,sender: plateSenderAbbr		
				,receiver: plateReceiverAbbr
			}
			,cache: false
			,error: function(jqXHR, textStatus, errorThrown) {
				alert("Database query failed.");
				console.log(textStatus, errorThrown);
			}
			,success: function(data) {
				var $plateLogsTable = $('#plate-logs-table');
				var $plateLogsTable2 = $('#plate-logs-table2');
				
				// Setting up the tables...
				var lines = data.split('\n');
				lines.pop();
				$plateLogsTable.children('tbody').empty();
				$plateLogsTable2.children('tbody').empty();
				$plateLogsTable.children('caption').html("To site: " + plateReceiver);
				$plateLogsTable2.children('caption').html("From site: " + plateSender);
				
				// Inserting rows of data into the table...
				$.each(lines, function(index, line) {
					var elements = line.split(" ");
					if (line === "=") { // Start inserting into the receiver site log 
						$plateLogsTable = $plateLogsTable2;
					}
					else {
						$plateLogsTable.children('tbody').append(
							'<tr>' +
								'<td>' + elements[0] + '</td>' + 
								'<td>' + elements[1] + '</td>' + 
								'<td>' + elements[2] + '</td>' + 
								'<td>' + elements[3] + '</td>' + 
								'<td>' + elements[4] + '</td>' + 
								'<td>' + elements[5] + '</td>' + 
								'<td>' + elements[6] + '</td>' + 
								'<td>' + elements[7] + '</td>' + 
								'<td>' + elements[8] + '</td>' + 
								'<td>' + elements[9] + '</td>' + 
							'</tr>'
						);
					}
				});
				
				$('#plate-log-modal').modal({
			  		keyboard: false
			  	});
				$('#plate-log-modal .modal-body').addClass('no-margin-padding');
				$('#plate-log-modal div .modal-title').html("Plate " + plateNumber + " Log - Currently At " + plateCurrLocation);
			}
		});
	});
	
	// Ajax handler for the "Reject Copy Status" link that is sometimes available
	$('#dbl-click-modal').on('click', 'div .modal-elem-wrapper .reject-copy-status', function() {
		// Retrieving vars to use in the table
		var jlnId = $(this).siblings('.plate-log').attr('id');
		var plateNumber = $(this).siblings('.plate-number').html();
		var plateCurrLocation = $(this).siblings('.plate-curr-location').html();
		var plateSender = $(this).siblings('.plate-sender').html();
		var plateReceiver = $(this).siblings('.plate-receiver').html();
		var plateSenderAbbr, plateReceiverAbbr;
		for (var i = 0; i < markersArr.length; i++) {
			if (markersArr[i].name === plateSender) {
				plateSenderAbbr = markersArr[i].title;
			}
			if (markersArr[i].name === plateReceiver) {
				plateReceiverAbbr = markersArr[i].title;
			}
		}

		$.ajax({
			type: "GET"
			,url: "RejectCopyStatus"
			,data: { jlnId: jlnId
				,sender: plateSenderAbbr		
				,receiver: plateReceiverAbbr
			}
			,cache: false
			,error: function(jqXHR, textStatus, errorThrown) {
				alert("Database query failed.");
				console.log(textStatus, errorThrown);
			}
			,success: function(data) {
				var $rejectCopyTable = $('#reject-copy-table');
				var lines = data.split('\n');
				lines.pop();
				$rejectCopyTable.children('tbody').empty();
				
				// Inserting rows of data into the table...
				$.each(lines, function(index, line) {
					var elements = line.split(" ");
					$rejectCopyTable.children('tbody').append(
						'<tr>' +
							'<td>' + elements[0] + '</td>' + 
							'<td>' + elements[1] + '</td>' + 
							'<td>' + elements[2] + " " + elements[3] + '</td>' + 
							'<td>' + elements[4] + '</td>' + 
						'</tr>'
					);
				});
				
				$('#reject-copy-status').modal({
			  		keyboard: false
			  	});
				$('#reject-copy-status .modal-body').addClass('no-margin-padding');
				$('#reject-copy-status div .modal-title').html("Plate " + plateNumber + " Reject Copy Status - Currently At " + plateCurrLocation);
			}
		});
	});
	
	//
	// AJAX HANDLERS FOR PLATE TRANSFER FAILURES
	//
	
	// Ajax handler for the "System Output" during plate transfer failures
	$('#dbl-click-modal').on('click', 'div .modal-elem-wrapper .system-output', function() {
		var plateNumber = $(this).siblings('.plate-number').html();
		var plateCurrLocation = $(this).siblings('.plate-curr-location').html();
		xmlId = $(this).siblings('.xml-history').attr('id');
		$('#code-editor-modal .modal-footer').hide();

		$.ajax({
			type: "GET"
			,url: "SystemOutput"
			,data: {xmlId: xmlId}
			,cache: false
			,dataType: "text"
			,error: function(jqXHR, textStatus, errorThrown) {
				alert("Database query failed.");
				console.log(textStatus, errorThrown);
			}
			,success: function(systemOutput) {
				
				var modalHeight = $(window).height() - 150;
				$('#code-editor-modal').modal({
			  		height: modalHeight-100 + 'px'
			  		,maxHeight: modalHeight + 'px'
			  		,keyboard: false
			  	});
				
				$('#code-editor-modal div .modal-title').html("Plate " + plateNumber + " System Output - Currently At " + plateCurrLocation);
				myCodeMirror.setSize('100%', '100%');
			    myCodeMirror.setValue(systemOutput);
			}
		});
	});
	
	// Ajax handler for the "Cancel plate transfer" link for failed transfers
	$('#dbl-click-modal').on('click', 'div .modal-elem-wrapper .cancel-transfer', function() {
		var $cancelTransfer = $(this);
		xmlId = $cancelTransfer.siblings('.xml-history').attr('id');
		
		$.ajax({
			type: "POST"
			,url: "CancelTransfer"
			,data: { xmlId: xmlId }
			,error: function(jqXHR, textStatus, errorThrown) {
				alert("Database query failed.");
				console.log(textStatus, errorThrown);
			}
			,success: function() {
				$cancelTransfer.html("Pending plate transfer cancellation...");
				$cancelTransfer.contents().unwrap();
			}
		});
	});
	
	// Ajax handler for the "Reset plate transfer" link for failed transfers
	$('#dbl-click-modal').on('click', 'div .modal-elem-wrapper .reset-transfer', function() {
		var $cancelTransfer = $(this);
		xmlId = $cancelTransfer.siblings('.xml-history').attr('id');
		
		$.ajax({
			type: "POST"
			,url: "ResetTransfer"
			,data: { xmlId: xmlId }
			,error: function(jqXHR, textStatus, errorThrown) {
				alert("Database query failed.");
				console.log(textStatus, errorThrown);
			}
			,success: function() {
				$cancelTransfer.html("Pending plate transfer reset...");
				$cancelTransfer.contents().unwrap();
			}
		});
	});
}

// Populating the modal which shows when a marker is double clicked
function populateMarkerModal(smartMarker) {
	"use strict";
	// Clear the contents first
	$('#dbl-click-modal .modal-body').empty();
  	$('#dbl-click-modal .modal-footer').empty();

	var modalElem;

	// Sending portion of the modal
	$('#dbl-click-modal .modal-body').append('<h4>Sending ' + smartMarker.sendingQueue.length + ' Files.</h4>');
	for (var i = 0; i < smartMarker.sendingQueue.length; i++) {
		// Handling the display of failed transfers
		var plateStatus = smartMarker.sendingQueue[i].status;
		if (plateStatus === "Failed") { 
			var cancelPendingText = (smartMarker.sendingQueue[i].cancelPending === "Y") ? 
					'Pending plate transfer cancellation...' : '<a class="cancel-transfer">Cancel plate transfer</a>';
			var resetPendingText = (smartMarker.sendingQueue[i].resetPending === "Y") ? 
					'Pending plate transfer reset...' : '<a class="reset-transfer">Reset plate transfer</a>';
			plateStatus = 	'<span style="color:red">Failed</span>' +
							'<br><a class="system-output">System Output</a>' +
						  	'<br>' + cancelPendingText +
						  	'<br>' + resetPendingText; 
		}
		
		// Create the "Reject Copy Status" link if available
		var rejectCopyStatus = smartMarker.sendingQueue[i].rejectCopyStatus;
		console.log(rejectCopyStatus);
		var rejectCopyStatusText = (rejectCopyStatus === "") ? 
				"" : '<br><a class="reject-copy-status" >Reject Copy Status: ' + rejectCopyStatus + '</a>';
		
		modalElem = $(	'<div class="modal-elem-wrapper"><div>' +
							'<span class="plate-sender" style="display: none">' + 
							smartMarker.name + 
							'</span><hr>Queue Number: ' +
							(i+1) +
							'<br>Plate: <span class="plate-number">' +
							smartMarker.sendingQueue[i].plateNumber +
							'</span><br>Status: ' +
							plateStatus +
							'<br>Sending to: <span class="plate-receiver">' +
							smartMarker.sendingQueue[i].receiver + 
							'</span><br>Current Location: <span class="plate-curr-location">' +
							smartMarker.sendingQueue[i].location +
							'</span><br><a class="xml-history" id="' + smartMarker.sendingQueue[i].xmlId +
							'">View and edit XML history</a>' +
							'<br><a class="plate-log" id="' + smartMarker.sendingQueue[i].jlnId + '">See Log</a>' +
							rejectCopyStatusText +
						'</div></div>');
		$('#dbl-click-modal .modal-body').append(modalElem); 
	}

	// Receiving portion of the modal
	$('#dbl-click-modal .modal-footer').append('<h4>Receiving ' + smartMarker.receivingQueue.length + ' Files.</h4>');
	for (var i = 0; i < smartMarker.receivingQueue.length; i++) {
		// Handling the display of failed transfers
		var plateStatus = smartMarker.receivingQueue[i].status;
		if (plateStatus === "Failed") {
			var cancelPendingText = (smartMarker.receivingQueue[i].cancelPending === "Y") ? 
					'Pending plate transfer cancellation...' : '<a class="cancel-transfer">Cancel plate transfer</a>';
			var resetPendingText = (smartMarker.receivingQueue[i].resetPending === "Y") ? 
					'Pending plate transfer reset...' : '<a class="reset-transfer">Reset plate transfer</a>';
			plateStatus = 	'<span style="color:red">Failed</span>' + 
							'<br><a class="system-output">System Output</a>' +
						  	'<br>' + cancelPendingText +
						  	'<br>' + resetPendingText;
		}
		
		// Create the "Reject Copy Status" link if available
		var rejectCopyStatus = smartMarker.receivingQueue[i].rejectCopyStatus;
		var rejectCopyStatusText = (rejectCopyStatus === "") ? 
				"" : '<br><a class="reject-copy-status" >Reject Copy Status: ' + rejectCopyStatus + '</a>';
				
		modalElem = $(	'<div class="modal-elem-wrapper"><div>' +
							'<span class="plate-receiver" style="display: none">' + 
							smartMarker.name + 
							'</span><hr>Queue Number: ' +
							(i+1) +
							'<br>Plate: <span class="plate-number">' +
							smartMarker.receivingQueue[i].plateNumber +
							'</span><br>Status: ' +
							plateStatus +
							'<br>Receiving from: <span class="plate-sender">' +
							smartMarker.receivingQueue[i].sender +
							'</span><br>Current Location: <span class="plate-curr-location">' +
							smartMarker.receivingQueue[i].location +
							'</span><br><a class="xml-history" id="' + smartMarker.receivingQueue[i].xmlId +
							'">View and edit XML history</a>' +
							'<br><a class="plate-log" id="' + smartMarker.receivingQueue[i].jlnId + '">See Log</a>' +
							rejectCopyStatusText +
						'</div></div>');
		$('#dbl-click-modal .modal-footer').append(modalElem);
	}
}

// Toggles the black lines
function toggleBlackLines(blackLinesToggle) {
	"use strict";
	var line;
	for (var j = 0; j < markersArr.length; j++) {
		for (var i = 0; i < markersArr[j].sendersArr.length; i++) {
			line = markersArr[j].sendersArr[i].line;
			// If the black lines are turned on, turn em off
			if (line.getVisible()) {
				if (line.strokeColor !== FAILURE) {
					line.setOptions({strokeColor: SENDING});
				}
				line.setVisible(false);
				blackLinesToggle = false;
			}
			// Else turn them on
			else {
				if (line.strokeColor !== FAILURE) {
					line.setOptions({strokeColor: 'black'});
				}
	    		line.setVisible(true);
	    		blackLinesToggle = true;
			}
	    }
	}
	return blackLinesToggle;
}

// Turns on the given SmartMarker's polylines
function onPolylines(smartMarker) {
	"use strict";
	for (var i = 0; i < smartMarker.sendersArr.length; i++) {
    	smartMarker.sendersArr[i].line.setVisible(true);
    }
    for (var j = 0; j < smartMarker.receiversArr.length; j++) {
    	smartMarker.receiversArr[j].line.setVisible(true);
	}
}

// Turns off the given SmartMarker's polylines
function offPolylines(smartMarker) {
	"use strict";
	for (var i = 0; i < smartMarker.sendersArr.length; i++) {
    	smartMarker.sendersArr[i].line.setVisible(false);
    }
    for (var j = 0; j < smartMarker.receiversArr.length; j++) {
    	smartMarker.receiversArr[j].line.setVisible(false);
	}
}

// SmartMarker class wraps the standard Marker class and adds features to it
function SmartMarker(position, title, name) {
	"use strict";
	this.marker = new google.maps.Marker({
    	position: position
    	,map: map
        ,title: title
    });
	this.clear();
	this.title = title;
	this.name = name;

	// Creating the sending number and receiving number next to each marker
	var infoBoxOptions = {
		content: "0"
		,boxStyle: {
		   	textAlign: "left"
			,fontSize: "10pt"
			,fontWeight: "bold"
		}
		,disableAutoPan: true
		,pixelOffset: new google.maps.Size(14, -35)
		,position: position
		,closeBoxURL: ""
		,enableEventPropagation: true
	};
	this.infoBox = new InfoBox(infoBoxOptions);
	this._updateInfoBox();
	this.infoBox.open(map);
}

// Clears the contents of the sending/receiving arrays and counts
SmartMarker.prototype.clear = function() {
	"use strict";
	this.senders = 0;
	this.receivers = 0;
	this.sendersArr = [];
	this.receiversArr = [];
	this.sendingQueue = [];
	this.receivingQueue = [];
};

// Used to update the InfoBox when there's a change
SmartMarker.prototype._updateInfoBox = function() {
	"use strict";
	this.infoBox.setContent("<span class='marker-numbers' style='color:" + SENDING + "'>" + this.senders + "</span><span class='marker-numbers' style='color:" + RECEIVING + "'><br>" + this.receivers + "</span>");
};

// This will be called for every plate in the XML for all sites
// Populates the necessary data structures for sender/receiever SmartMarkers given plate information
SmartMarker.prototype.refresh = function(receiver, plate) {
	"use strict";
	this.senders++;
	receiver.receivers++;
	this._updateInfoBox();
	receiver._updateInfoBox();

	// Populating the sender's sendingQueue with the new plate
	// This queue is used to display the sending files from a site (double click on markers)
	// Sorting the sending plates for displaying...
	if (this.sendingQueue.length === 0) {
		this.sendingQueue.push(plate);
	}
	else if (plate.status === "Failed") { 
		this.sendingQueue.splice(0, 0, plate);
	}
	else if (plate.location === receiver.name) {
		if (plate.status === "Active") { 
			this.sendingQueue.splice(0, 0, plate);
		}
		else if (plate.status === "Queued") {
			for (var i = 0; i < this.sendingQueue.length; i++) {
				if ((this.sendingQueue[i].location === receiver.name && this.sendingQueue[i].status === "Queued" && this.sendingQueue[i].index > plate.index) || 
					(this.sendingQueue[i].location === this.name)) {
						this.sendingQueue.splice(i, 0, plate);
						break;
				}
				else if (i+1 === this.sendingQueue.length) {
					this.sendingQueue.push(plate);
					break;
				}	
			}
		}
	}
	else if (plate.location === this.name) {
		if (plate.status === "Active") {
			for (var i = 0; i < this.sendingQueue.length; i++) {
				if (this.sendingQueue[i].location === this.name) {
					this.sendingQueue.splice(i, 0, plate);
					break;
				}
				else if (i+1 === this.sendingQueue.length) {
					this.sendingQueue.push(plate);
					break;
				}	
			}
		}
		else if (plate.status === "Queued") {
			for (var i = 0; i < this.sendingQueue.length; i++) {
				if (this.sendingQueue[i].location === this.name && this.sendingQueue[i].status === "Queued" && this.sendingQueue[i].index > plate.index) {
					this.sendingQueue.splice(i, 0, plate);
					break;
				}
				else if (i+1 === this.sendingQueue.length) {
					this.sendingQueue.push(plate);
					break;
				}	
			}
		}
	}
	else { // If the plate's status/location is not valid, just insert it on the bottom 
		console.log("Unexpected plate location: " + plate.status + " Status: " + plate.location);
		this.sendingQueue.push(plate);
	}

	// Populating the receiver's receivingQueue with the new plate
	// This queue is used to display the receiving files of a site (double click on markers)
	var receiverPlate = {
		index: plate.index
		,plateNumber: plate.plateNumber
		,status: plate.status
		,sender: this.name
		,location: plate.location
		,xmlId: plate.xmlId
		,jlnId: plate.jlnId
		,cancelPending: plate.cancelPending
		,resetPending: plate.resetPending
		,rejectCopyStatus: plate.rejectCopyStatus
	};

	// Sorting the receiving plates for displaying...
	if (receiver.receivingQueue.length === 0) {
		receiver.receivingQueue.push(receiverPlate);
	}
	else if (receiverPlate.status === "Failed") {
		receiver.receivingQueue.splice(0, 0, receiverPlate);
	}
	else if (receiverPlate.location === receiver.name) {
		if (receiverPlate.status === "Active") { 
			receiver.receivingQueue.splice(0, 0, receiverPlate);
		}
		else if (receiverPlate.status === "Queued") {
			for (var i = 0; i < receiver.receivingQueue.length; i++) {
				if ((receiver.receivingQueue[i].location === receiver.name && receiver.receivingQueue[i].status === "Queued" && receiver.receivingQueue[i].index > receiverPlate.index) || 
					(receiver.receivingQueue[i].location !== receiver.name)) {
						receiver.receivingQueue.splice(i, 0, receiverPlate);
						break;
				}
				else if (i+1 === receiver.receivingQueue.length) {
					receiver.receivingQueue.push(receiverPlate);
					break;
				}
			}
		}
	}
	else if (receiverPlate.location === this.name) {
		if (receiverPlate.status === "Active") {
			for (var i = 0; i < receiver.receivingQueue.length; i++) {
				if (receiver.receivingQueue[i].location !== receiver.name) {
					receiver.receivingQueue.splice(i, 0, receiverPlate);
					break;
				}
				else if (i+1 === receiver.receivingQueue.length) {
					receiver.receivingQueue.push(receiverPlate);
					break;
				}
			}
		}
		else if (receiverPlate.status === "Queued") {
			for (var i = 0; i < receiver.receivingQueue.length; i++) {
				if (receiver.receivingQueue[i].location !== receiver.name && receiver.receivingQueue[i].status === "Queued" && receiver.receivingQueue[i].index > receiverPlate.index) {
					receiver.receivingQueue.splice(i, 0, receiverPlate);
					break;
				}
				else if (i+1 === receiver.receivingQueue.length) {
					receiver.receivingQueue.push(receiverPlate);
					break;
				}
			}
		}
	}
	else { // If the plate's status/location is not valid, just insert it on the bottom 
		console.log("Unexpected plate location: " + receiverPlate.status + " Status: " + receiverPlate.location);
		receiver.receivingQueue.push(receiverPlate);
	}
};

// Creating a sender polyline
SmartMarker.prototype.createSenderPolyline = function(receiver, count, failure) {
	"use strict";
	var color = SENDING;
	// If there's a data transfer failure set the line to the FAILURE color
	if (failure) {
		color = FAILURE;
	}
	
	var offset = '50%';
	var secondPoint = receiver.marker.position;
	var coordArr;

	// Handling when two sites are sending and receiving to/from each other...
	for (var i = 0; i < receiver.sendersArr.length; i++) {
		if (receiver.sendersArr[i].receiverTitle === this.title) {
			secondPoint = midpoint([this.marker.position, secondPoint]);
			offset = '100%';
			coordArr = [receiver.marker.position, secondPoint];
			if (receiver.sendersArr[i].failure) { // Handling failures when two sites send to/from each other
				receiver.sendersArr[i].line = receiver._createLine(FAILURE, offset, coordArr, this, receiver.sendersArr[i].count);
			}
			else {
				receiver.sendersArr[i].line = receiver._createLine(color, offset, coordArr, this, receiver.sendersArr[i].count);
			}
			break;
		}
	}

	coordArr = [this.marker.position, secondPoint];
	return this._createLine(color, offset, coordArr, receiver, count);
};

// Creating a receiver polyline
SmartMarker.prototype.createReceiverPolyline = function(receiver, count, failure) {
	"use strict";
	var color = RECEIVING;
	// If there's a data transfer failure set the line to the FAILURE color
	if (failure) {
		color = FAILURE;
	}
	
	var offset = '50%';
	var secondPoint = receiver.marker.position;
	var coordArr;

	// Handling when two sites are sending and receiving to/from each other...
	for (var i = 0; i < this.receiversArr.length; i++) {
		if (this.receiversArr[i].senderTitle === receiver.title) {
			secondPoint = midpoint([this.marker.position, secondPoint]);
			offset = '100%';
			coordArr = [receiver.marker.position, secondPoint];
			if (this.receiversArr[i].failure) { // Handling failures when two sites send to/from each other
				this.receiversArr[i].line = receiver._createLine(FAILURE, offset, coordArr, this, this.receiversArr[i].count);
			}
			else {
				this.receiversArr[i].line = receiver._createLine(color, offset, coordArr, this, this.receiversArr[i].count);
			}
			break;
		}
	}

	coordArr = [this.marker.position, secondPoint];
	return this._createLine(color, offset, coordArr, receiver, count);
};

// Creating the polyline
SmartMarker.prototype._createLine = function(color, offset, coordArr, receiver, count) {
	"use strict";
	// Preventing the lines from going off the map by adding a midpoint
	if (((coordArr[0].lng()>=0)!==(coordArr[1].lng()>=0)) && (Math.abs(coordArr[0].lng()) + Math.abs(coordArr[1].lng()) >= 180)) {
		coordArr = [coordArr[0], midpoint(coordArr), coordArr[1]];
	}

	var lineSymbol = {
		path: google.maps.SymbolPath.FORWARD_OPEN_ARROW
	};
	var line = new google.maps.Polyline({
	    path: coordArr
	    ,icons: [{
	      	icon: lineSymbol
	      	,offset: offset
	    }]
	    ,map: map
	    ,strokeColor: color
	    ,strokeOpacity: 0.5
	    ,strokeWeight: 5
	    ,visible: false
	});

	// Adding event handlers for every polyline
	var sender = this;
	google.maps.event.addListener(line, 'mouseover', function() {
	    line.setOptions({strokeWeight:8});

	    // Creating the InfoWindow's contents
	    var fileStr = ' files...';
	    var contentStr;
	    if (count === 1) {
	    	fileStr = ' file...';
	    }
	    if (color === RECEIVING) {
		    contentStr = '<h3>' + receiver.title + ' receiving from ' + sender.title + '</h3>' + '<p>Receiving ' + count + fileStr + '</p>';
	    }
	    else {
	    	contentStr = '<h3>' + sender.title + ' sending to ' + receiver.title + '</h3>' + '<p>Sending ' + count + fileStr + '</p>';
	    }

	    lineInfoWindow.setContent(contentStr);

	    // Setting the InfoWindow's position
	    lineInfoWindow.setPosition(midpoint([coordArr[0], coordArr[coordArr.length-1]]));
		lineInfoWindow.open(map);
  	});
  	google.maps.event.addListener(line, 'mouseout', function() {
	    line.setOptions({strokeWeight:5});
	    lineInfoWindow.close();
  	});
	return line;
};

// Takes an array of two LatLng objs and returns a new LatLng midpoint
function midpoint(coordArr) {
	"use strict";
	return new google.maps.LatLng((coordArr[0].lat() + coordArr[1].lat()) / 2, (coordArr[0].lng() + coordArr[1].lng()) / 2);
}

google.maps.event.addDomListener(window, 'load', initialize);
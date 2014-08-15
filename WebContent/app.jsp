<%@ page language="java" contentType="text/html; charset=ISO-8859-1"
    pageEncoding="ISO-8859-1"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
	<head>
		<meta name="viewport" content="initial-scale=1.0, user-scalable=no" />
		
		<link rel="stylesheet" type="text/css" href="css/bootstrap.min.css">
		<link rel="stylesheet" type="text/css" href="css/bootstrap-modal-bs3patch.css">
		<link rel="stylesheet" type="text/css" href="css/bootstrap-modal.css">
		<link rel="stylesheet" type="text/css" href="css/style.css">
		<link rel="stylesheet" type="text/css" href="css/codemirror.css">
		
		<script type="text/javascript" 
			src="http://maps.google.com/maps/api/js?sensor=false">
		</script>
		<script type="text/javascript" src="//ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script>
		<script type="text/javascript" src="js/infobox.min.js"> </script>
		<script type="text/javascript" src="js/bootstrap.min.js"> </script>
		<script type="text/javascript" src="js/bootstrap-modalmanager.js"> </script>
		<script type="text/javascript" src="js/bootstrap-modal.js"> </script>
		<script type="text/javascript" src="js/codemirror.js"> </script>
		<script type="text/javascript" src="js/xml.js"></script>  <!-- Used to style XML in CodeMirror (syntax highlighting) -->
		<script type="text/javascript" src="js/map.js"></script>
		<title>Maps App</title>
	</head>
	<body>

		<!-- Double Click Modal -->
		<div class="modal fade" id="dbl-click-modal" tabindex="-1" role="dialog" aria-labelledby="dbl-click-modal-label" aria-hidden="true">
		    <div class="modal-header">
			    <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
			    <h2 class="modal-title" id="dbl-click-modal-label"></h2>
		    </div>
		    <div class="modal-body">
		    </div>
		    <div class="modal-footer">
		  	</div>
		</div>
		
		<!-- Code Editor Modal -->
		<div class="modal container fade" id="code-editor-modal" tabindex="-1" role="dialog" aria-labelledby="code-editor-label" aria-hidden="true">
		    <div class="modal-header">
			    <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
			    <h2 class="modal-title"></h2>
		    </div>
		    <div class="modal-body">
		    	<textarea id="code-modal-textarea"></textarea>
		    </div>
		    <div class="modal-footer">
			    <div id="xml-error">
			    	<span class="glyphicon glyphicon-exclamation-sign"></span>
					<span id="xml-error-text"></span>
				</div>
				<div id="xml-history-buttons">
				    <button type="button" data-dismiss="modal" class="btn btn-default">Cancel</button>
		    		<button id="save-to-database" type="button" class="btn btn-primary">Save To Database</button>
	    		</div>
		  	</div>
		</div>

		<!-- Plate Data Modal -->
		<div class="modal container fade" id="plate-log-modal" tabindex="-1" role="dialog" aria-labelledby="plate-modal-label" aria-hidden="true">
		    <div class="modal-header">
			    <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
			    <h2 class="modal-title"></h2>
		    </div>
		    <div class="modal-body">
		    	<table id="plate-logs-table" class="table table-bordered" style="margin-bottom: 0px">
		    		<caption></caption>
		    	 	<thead>
				    	<tr>
							<th>JOBS_ID_FK</th>
							<th>XML_DATA_ID_FK</th>
							<th>SOURCE_STE_ID_FK</th>
							<th>TARGET_STE_ID_FK</th>
							<th>EVENT</th>
							<th>EVENT_GMT</th>
							<th>EMP_ID_FK</th>
							<th>EVENT_CODE</th>
							<th>EVENT_TYPE</th>
							<th>SLG_ID</th>
				    	</tr>
				    </thead>
				    <tbody>
				    </tbody>
		    	</table>
		    	<table id="plate-logs-table2" class="table table-bordered" style="margin-bottom: 0px">
		    		<caption></caption>
		    	 	<thead>
				    	<tr>
							<th>JOBS_ID_FK</th>
							<th>XML_DATA_ID_FK</th>
							<th>SOURCE_STE_ID_FK</th>
							<th>TARGET_STE_ID_FK</th>
							<th>EVENT</th>
							<th>EVENT_GMT</th>
							<th>EMP_ID_FK</th>
							<th>EVENT_CODE</th>
							<th>EVENT_TYPE</th>
							<th>SLG_ID</th>
				    	</tr>
				    </thead>
				    <tbody>
				    </tbody>
		    	</table>		    	
		    </div>
		</div>
		
		<!-- Reject Copy Status Modal -->
		<div class="modal container fade" id="reject-copy-status" tabindex="-1" role="dialog" aria-labelledby="plate-modal-label" aria-hidden="true">
		    <div class="modal-header">
			    <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
			    <h2 class="modal-title"></h2>
		    </div>
		    <div class="modal-body">
		    	<table id="reject-copy-table" class="table table-bordered" style="margin-bottom: 0px">
		    	 	<thead>
				    	<tr>
							<th>From Plate</th>
							<th>To Plate</th>
							<th>Start Date</th>
							<th>Status</th>
				    	</tr>
				    </thead>
				    <tbody>
				    </tbody>
		    	</table>  	
		    </div>
		</div>
		
		<!-- Map -->
		<div id="map-canvas"/>

	</body>
</html>
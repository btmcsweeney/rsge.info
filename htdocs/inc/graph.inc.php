<?php require_once "../../inc/functions.inc.php"; ?>
<div class="inner-header">
    <form method="post" id="addItem">
    <input type="text" name="id" id="addItemInput" class="itemSearch">
    <input type="submit" value="Graph Item" id="addItemSubmit">
    </form>
    <select class="chzn-select" id="timeRangeSelect">
	<option value="14">14 Days</option>
	<option value="30" selected>30 Days</option>
	<option value="60">60 Days</option>
	<option value="90">90 Days</option>
	<option value="120">120 Days</option>
	<option value="180">180 Days</option>
    </select>
    <button id="saveGraphButton">Save</button>
</div>
<div id="graph"></div>
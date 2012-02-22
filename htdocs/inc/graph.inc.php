<?php require_once "inc/functions.inc.php"; ?>
<div class="inner-header">
    <form method="post" id="graphItem">
    <input type="text" name="id" id="graphItemInput" class="itemSearch" placeholder="Start typing an item name...">
    <!-- <input type="submit" value="Graph Item" id="graphItemSubmit"> -->
    </form>
    <button id="saveGraphButton" class="hidden">Save</button>
</div>
<div id="graph"></div>
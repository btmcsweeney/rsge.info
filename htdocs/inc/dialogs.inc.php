<?php require_once "inc/functions.inc.php"; ?>
<div class="hidden">
    <div id="saveAsDialog" title="Save Graph As...">Title:<br><input type="text" name="title" id="saveGraphTitle"></div>
    <div id="newCalcDialog" title="Select New Calculation Type">
	<button value="merchanting">Merchanting</button>
	<button value="custom">Custom</button>
    </div>
    <div id="calcSyntaxDialog" title="Calculation Syntax">
	The base code for calculations works just like it would if you typed it into a calculator, with the exception of a few special operators that allow you to insert dynamic values. These are:
	<ul>
	    <li>
		Item prices: Putting the ID of an item inside brackets [] will return the current price of that item. You can look up item IDs using the ID lookup search bar.<br>
		ex: The code [2]+100 would result in 246+100 = 346.
	    <li>
		Input fields: Putting curly braces {} into a calculation will result in an input field being generated in the resulting calculation, allowing you to change that value without editing the calculation's source code. You can set a default value by putting that value inside the braces.<br>
		ex: The code {5}*4 would result in <input type="text" value="5" size="5">*4 = 20.
	    </li>
	    <li>
		EXP lookup: Putting a username in quotes will return the total EXP of that user. If the username is followed by a colon and a skill, that user's EXP for that skill will be returned.<br>
		ex: The code 200000000-"Zezima:Dungeoneering" would result in 200,000,000-140,017,408 = 59,982,592.
	    </li>
    </div>
</div>
<?php
require_once "config.inc.php";
$mongo=new Mongo();
$mdb=$mongo->rsge;
$itemsColl=$mdb->items;
$catsColl=$mdb->categories;
$itemHistColl=$mdb->itemPrices;
$miscColl=$mdb->misc;
?>

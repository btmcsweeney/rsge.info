<?php
require_once "config.inc.php";
$con = mysql_pconnect($mysql_host,$mysql_user,$mysql_pass);
if (!$con)
{
  die('Could not connect: ' . mysql_error());
}
$mongo=new Mongo();
$mdb=$mongo->rsge;
$itemsColl=$mdb->items;
$catsColl=$mdb->categories;
$itemHistColl=$mdb->itemPrices;
?>

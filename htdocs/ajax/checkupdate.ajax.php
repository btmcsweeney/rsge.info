<?php
require_once "../inc/functions.inc.php";
$cursor = $miscColl->find(array('name'=>"updateText"));
$cursor->sort(array('time'=> -1));
$lastUpdate=$cursor->getNext();
$time=$lastUpdate['time'];

echo "The GE last updated on ".date("M jS \a\\t g:ia T", $time);
$hours=floor((time()-$time)/3600);
$mins=floor((time()-$time)/60)-$hours*60;
if ($hours==0) { $hours=""; } else if ($hours==1) { $hours="1 hour and"; } else { $hours="$hours hours and"; }
if ($mins==1) { $mins="1 min"; } else { $mins="$mins mins"; }
echo " ($hours $mins ago).";
?>
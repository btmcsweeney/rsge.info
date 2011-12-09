<?php
require_once "../../inc/functions.inc.php";
$query=mysql_query("select * from rsge.lastupdate");
$times=mysql_fetch_array($query);
echo "The GE last updated on ".date("M jS \a\\t g:ia T", $times['rs']);
$hours=floor((time()-$times['rs'])/3600);
$mins=floor((time()-$times['rs'])/60)-$hours*60;
if ($hours==0) { $hours=""; } else if ($hours==1) { $hours="1 hour and"; } else { $hours="$hours hours and"; }
if ($mins==1) { $mins="1 min"; } else { $mins="$mins mins"; }
echo " ($hours $mins ago).";
if ($times['rs'] > $times['rsge_start']) {
    $mins=floor(($times['rs']-time()+900)/60);
    if ($mins==1) { $mins="1 min"; } else { $mins="$mins mins"; }
    echo " | RSGE.info will fetch new prices in $mins.";
} else if ($times['rsge_start'] > $times['rsge_finish']) {
    echo " | RSGE.info is fetching new prices.";
}
?>
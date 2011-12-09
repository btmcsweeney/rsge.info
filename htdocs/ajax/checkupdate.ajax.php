<?php
require_once "../inc/functions.inc.php";

/*
    - From priceupdatemongo.pl -
    $cursor = $miscColl->find({name=>"updateText"});
    $cursor->sort({'time'=> -1});
	my $dbUpdateText=$cursor->next;
*/
$cursor = $miscColl->find(array('name'=>"updateText"));
$cursor->sort(array('time'=> -1));
$time=$cursor->getNext()['time']/1000;
//var_dump($cursor->getNext());

echo "The GE last updated on ".date("M jS \a\\t g:ia T", $time);
$hours=floor((time()-$time)/3600);
$mins=floor((time()-$time)/60)-$hours*60;
if ($hours==0) { $hours=""; } else if ($hours==1) { $hours="1 hour and"; } else { $hours="$hours hours and"; }
if ($mins==1) { $mins="1 min"; } else { $mins="$mins mins"; }
echo " ($hours $mins ago).";
?>
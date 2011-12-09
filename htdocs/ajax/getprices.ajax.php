<?php
require_once "../inc/functions.inc.php";
if (isset($_REQUEST['id'])) {
    $id=clean_int($_REQUEST['id']);
    if (isset($_REQUEST['mintime'])) {
	$mintime=(time()-clean_int($_REQUEST['mintime']))*1000;
    } else {
	$mintime=time()-180*24*60*60*1000;//180 days
    }
    if (!($item=$itemsColl->findOne(array("id"=>$id)))) {
	$page=`sh /var/www/getpage.sh http://services.runescape.com/m=itemdb_rs/api/catalogue/detail.json?item=$id`;
	$item=json_decode($page);
	echo $item->item->name;
    } else {
	echo $item["name"]; }
	if (!($itemHist=$itemHistColl->findOne(array("id"=>$id)))) {
	    //$page=file_get_contents("http://services.runescape.com/m=itemdb_rs/api/graph/$id.json");
	    //echo "1";
	    $page=`sh /var/www/getpage.sh http://services.runescape.com/m=itemdb_rs/api/graph/$id.json`;
	    $itemHist=json_decode($page);
	    $itemHist->id=$id;
	    $itemHistColl->insert($itemHist);
	}
	$itemHist=$itemHistColl->findOne(array("id"=>$id));
	foreach (array_keys($itemHist["daily"]) as $time) {
	    if ($time>$mintime) {
		echo ';' . $time . ',' . $itemHist["daily"][$time];
	    }
	}
    
    // http://services.runescape.com/m=itemdb_rs/api/graph/ITEMID.json
    
}
?>

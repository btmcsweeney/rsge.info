<?php
require_once "../inc/functions.inc.php";
if (isset($_GET['term'])){
    $term=clean_string($_GET['term']);
    $resultArray=array();
    /*
    $items=mysql_query("select * from rsge.items where name LIKE '%$term%' order by searches desc");
    while ($item=mysql_fetch_array($items)) {
    */
    $items=$itemsColl->find(array("name"=> new MongoRegex("/$term/i")));
    $items->sort(array("searches"=>-1));
    while ($item=$items->getNext()) {
	    extract($item, EXTR_PREFIX_ALL, "item");
	    $itemData=array("label"=>$item_name, "value"=>$item_name, "id"=>$item_id);
	    array_push($resultArray, $itemData);
    }
    echo json_encode($resultArray);
}
?>
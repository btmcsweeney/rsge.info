<?php
require_once "../inc/functions.inc.php";
if (isset($_POST['id'])){
    $id=clean_int($_POST['id']);
    //mysql_query("update rsge.items set searches=(searches+1) where id=$id");
    $itemsColl->update(array("id"=>$id), array('$inc'=> array('searches'=>1)));
}
?>
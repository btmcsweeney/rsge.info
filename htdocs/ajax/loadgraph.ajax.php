<?php
require_once "../../inc/functions.inc.php";
if (isset($_POST['id'])) {
    $id=$_POST['id'];
    $query=mysql_query("select * from rsge.graphs where id=$id");
    while ($graph=mysql_fetch_array($query)){
	extract($graph, EXTR_PREFIX_ALL, "graph");
	echo $graph_title.'|'.$graph_items;
    }
}
?>
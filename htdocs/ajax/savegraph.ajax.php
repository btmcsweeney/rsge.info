<?php
require_once "../../inc/functions.inc.php";
if (isset($_POST['items']) && isset($user_id)) {
    if (isset($_POST['id'])) {
	mysql_query("update rsge.graphs set items='".$_POST['items']."' where id=".$_POST['id']." and owner=$user_id");
    } else if (isset($_POST['title'])) {
	mysql_query("insert into rsge.graphs (owner, title, items) values ($user_id, '".$_POST['title']."', '".$_POST['items']."')");
	$query=mysql_query("select * from rsge.graphs where owner=$user_id order by id desc");
	$graph=mysql_fetch_array($query);
	echo $graph['id'];
    }
}
?>
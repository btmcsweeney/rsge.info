<?php
require_once "../inc/functions.inc.php";
if (isset($_POST['id']) && isset($user_id)) {
    mysql_query("delete from rsge.graphs where id=".$_POST['id']." and owner=$user_id");
}
?>
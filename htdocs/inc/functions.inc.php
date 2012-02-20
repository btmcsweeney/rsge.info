<?php
session_start();
require_once "dbconnect.inc.php";

$ip=$_SERVER['REMOTE_ADDR'];

$dateformat="M jS \a\\t g:ia T";
class user {
    function info($id){
	$query=mysql_query("select * from rsge.users where id=$id");
	return mysql_fetch_array($query);
    }
}
$userclass=new user();

function clean_string($string) { return addcslashes($string, "\x00\n\r\'\x1a\x25"); }
function clean_int($number) { return intval($number); }
function clean_float($number) { return floatval($number); }
function clean_bool($bool) { return stripos($bool, "true") >= 0; }

function last_update() {
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
}

function unique_salt() {
    return substr(sha1(mt_rand()),0,22);
}
function make_hash($password, $salt) {
    return crypt($password, "$2a$10$".$salt);
}
function check_password($hash, $password) {
    $full_salt = substr($hash, 0, 29);
    $new_hash = crypt($password, $full_salt);
    return ($hash == $new_hash);
}

if (isset($_GET['vc'])) {
    $vc=$_GET['vc'];
    $query=mysql_query("select * from rsge.users where hash='$vc'");
    if (mysql_num_rows($query)===1) {
	$_SESSION['login']=true;
	$user=mysql_fetch_array($query);
	$_SESSION['id']=$user['id'];
	$query=mysql_query("update rsge.users set verified=1 where hash='$vc'");
	//header("location:http://localhost/rsge?v=1");
	header("location:http://rsge.info?v=1");
    } else {
	echo "Error: This user does not exist.";
    }
}

if (isset($_SESSION['login'])) {
    $user = $userclass->info($_SESSION['id']);
    extract($user, EXTR_PREFIX_ALL, "user");
} else {
    return false;
}
?>
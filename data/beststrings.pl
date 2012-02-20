#!/usr/bin/perl
use POSIX;
use Data::Dumper;
use HTML::TableExtract;
use LWP::UserAgent;
use JSON;
use MongoDB;
use warnings;
use strict;

my $ua=LWP::UserAgent->new();
$ua->timeout(10);

#MongoDB Connection
my $connection = MongoDB::Connection->new(host => 'localhost', port => 27017);
my $database   = $connection->rsge;
my $itemsColl  = $database->items;
my $searchColl = $database->bestSearches;

$searchColl->remove();

my @letters=('a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'w', 'x', 'y', 'z');
my $count;
my $search="";

my $first='a'; my $second='r'; my $third='m';
foreach $first (@letters) {
	foreach $second (@letters) {
		foreach $third (@letters) {
			$count=$itemsColl->find({'name'=> qr/$first+$second+$third/i})->count();
			if ($count>100) {
				#$searchColl->insert({'string'=>"$first$second$third", 'count'=>$count});
				#print "$first$second$third $count\n";
				$search=$search."*$first$second$third* ";
			}
		}
	}
}
my $response=$ua->post('http://services.runescape.com/m=itemdb_rs/g=runescape/results.ws', [query=> $search, price=>"all"]);
if ($response->is_success) {
	print $response->decoded_content."\n";
}else {
     die $response->status_line;
     #print $search;
 }

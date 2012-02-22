#!/usr/bin/perl
use POSIX;
use Data::Dumper;
use LWP::Simple;
use JSON;
use MongoDB;
use warnings;
use strict;

my $resetDB=0;
my $api="http://services.runescape.com/m=itemdb_rs/api";

#MongoDB Connection
my $connection = MongoDB::Connection->new(host => 'localhost', port => 27017);
my $database   = $connection->rsge;
my $catsColl   = $database->categories;
my $itemsColl  = $database->items;
my $miscColl   = $database->misc;
my $itemHistColl=$database->itemPrices;
if ($resetDB) {
    print "\n\nRESETTING DATABASE... ";
	$catsColl->remove();
	$itemsColl->remove();
	$miscColl->remove(); 
    $itemHistColl->remove();
	print "done\n\n";
}

if (checkForUpdate()) {
	checkForNewItems();
}

sub checkForUpdate {
	print "Grabbing file to check for updates... ";
	my $updateText=get("$api/catalogue/items.json?category=28&alpha=d&page=0"); #Grabs the 'D' page under prayer supplies
	while (!$updateText || is_error($updateText)) {
		print "1";
		$updateText=get("$api/catalogue/items.json?category=28&alpha=d&page=0");
		sleep(10);
	}
	print "done\n";
	if ($resetDB) {
		$miscColl->insert({name=>"updateText", 'time'=>time(), text=>$updateText});
		1;
	} else {
		my $cursor = $miscColl->find({name=>"updateText"});
		$cursor->sort({'time'=> -1});
		my $dbUpdateText=$cursor->next;
		if ($dbUpdateText->{text} eq $updateText) {
			print "No update.\n";
			0;
		} else {
			$miscColl->insert({name=>"updateText", 'time'=>time(), text=>$updateText});
			print $dbUpdateText->{time}."\n";
			print "Update detected at ".time()."!\n";
			$itemHistColl->remove();
			1;
		}
	}
}

sub checkForNewItems {
	#Getting list of all IDs
	for (my $i=0; $i<37; $i++) { #37 categories
		#print "Category $i:\n";
		my $categoryJSON=get("$api/catalogue/category.json?category=$i");
		while (!$categoryJSON || is_error($categoryJSON)) { #They figured out how to limit requests!
			print "1";
			$categoryJSON=get("$api/catalogue/category.json?category=$i");
			sleep(10);
		}
		my $category=from_json($categoryJSON);
		$category->{category}=$i;
		my $catFound=1;
		if (!$catsColl->find_one({category=>$i})) {
			print "Cat $i not found!\n";
			$catsColl->insert($category);
			$catFound=0;
		}
		my $oldCategory=$catsColl->find_one({category=>$i});
		for (my $alpha=0; $alpha<27; $alpha++) {#27
			my $letter=$category->{alpha}->[$alpha]->{letter};
			$letter=~s/#/%23/g;
			my $itemNum=$category->{alpha}->[$alpha]->{items};
			my $dbItemNum=$oldCategory->{alpha}->[$alpha]->{items};
			if ($dbItemNum==$itemNum && $catFound) {
				print "No change for $i $letter\n";
			} elsif ($itemNum==0) {
				print "No items for $i $letter\n";
			} else {
				print "New items in $i $letter\n";
				$catsColl->update({category=>$i}, $category);
				for (my $page=1; $page<=ceil($itemNum/12); $page++) {
					my $itemPageJSON=get("$api/catalogue/items.json?category=$i&alpha=$letter&page=$page");
					while (!$itemPageJSON || is_error($itemPageJSON)) {
						print "1";
						$itemPageJSON=get("$api/catalogue/items.json?category=$i&alpha=$letter&page=$page");
						sleep(10);
					}
					my $itemPage=from_json($itemPageJSON);
					my $itemsOnPage;
					if ($page==ceil($itemNum/12) && $itemNum%12) {
	    					$itemsOnPage=$itemNum%12;
					} else {
						$itemsOnPage=12;
					}
					print "Page $page of ".ceil($itemNum/12).": $itemsOnPage items.";
					for (my $a=0; $a<$itemsOnPage; $a++) {
						my $itemID=$itemPage->{items}->[$a]->{id};
						my $itemName=$itemPage->{items}->[$a]->{name};
						print " $itemID";
						if (!$itemsColl->find_one({id=>$itemID})) {
							$itemsColl->insert({id=>$itemID, name=>$itemName, searches=>0});
						}
					}
					print "\n";
				}
				print "\n";
			}
		}
		print "\n";
	}
}

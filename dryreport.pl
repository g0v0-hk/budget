#!/usr/bin/perl -w
# work_bench.pl --- 
# Author: Yanyi Wan <stephen@Yanyis-MacBook-Pro.local>
# Created: 15 Feb 2014
# Version: 0.01

use warnings;
use strict;
#use JSON;
use Data::Dumper;
use LWP::UserAgent;

my $ua = new LWP::UserAgent;


my $remote_url = "http://data.jmsc.hku.hk/hongkong/budget/data/rawdata/sum_exp_e_2007.txt";

my $response = $ua->get($remote_url);

my @lines = split "\n", $response->content;

my $result = [];


my @incomplete_item = ();

for ( @lines) {
    if ( @incomplete_item) {
        goto CONT;        
    }


    if ( /^\s{0,2}(?<did>\d+)\s+ (?:[^\d]+) (?<amount>\d{1,3}(?:[\s,]\d{3})*\b)/x) {                  
        my @completed_item = ($+{did}, ($+{amount} =~ s/[\s,]//gr) + 0);            
        push @$result, \@completed_item;
        @incomplete_item = ();
    }
    
    elsif (/^\s{0,2}(?<did>\d+)\s+(?:\w[^.]*)/gx) {
        push @incomplete_item, $+{did};
        goto CONT;
        
    }
    next;
    
CONT:
    if ( /\G.*?[.]{3,}\s+(?<amount>\d{1,3}(?:[\s,]\d{3})*\b)?/gxm) {
        my $amount = ($+{amount})? $+{amount} : 0;        
        push @incomplete_item, ($amount =~ s/[\s,]//gr) + 0;
        my @completed_item = @incomplete_item;            
        push @$result, \@completed_item;
        @incomplete_item = ();
    }        
}



my $total = 0;

for ( @$result) {
    print $_->[0], "\t", $_->[1], "\n";
    
    $total = $total + $_->[1];
    
}

print $total;


__DATA__

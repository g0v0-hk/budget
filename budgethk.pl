#!/usr/bin/perl -w
# budgethk.pl --- 
# Author: Yanyi Wan <stephen@Yanyis-MacBook-Pro.local>
# Created: 15 Feb 2014
# Version: 0.01

use warnings;
use strict;
use List::MoreUtils qw(zip);
use List::Util qw ( max min);
use LWP::UserAgent;
use Data::Dumper;
use JSON;





sub fetch_data {
    my $url = shift;
    my $ua = LWP::UserAgent->new();
    my $response = $ua->get($url);
    if ( !$response->is_success) {
        die $response->status_line;        
    }
    $response->content();    
}


my $url = 'http://data.jmsc.hku.hk/hongkong/budget/data/rawdata/budget.expenditures.csv';

sub parse_data {
    my $data = shift;

    $data =~ s/"([^"]*)"/'"'.($1 =~ s{,}{}r).'"'/eg;
    
    
    my @lines = split "\n", $data;
    my @keys = split ",", (shift @lines);
    
    my $result = [];

    for my $_line ( @lines) {
        my @vals =  (split ",", $_line);
        my $_record = {};
        %$_record = zip(@keys, @vals);        
        push @$result, $_record;        
    }
    $result;    
}




sub transform_record {
    my $record = shift;
            
    my @check_keys = qw{ actual2006 actual2007 actual2008 actual2009 actual2010 actual2011 actual2012 actual2013 };
    
    my %_record = (name => $record->{name}, id => $record->{head});
    
    my $pre_key = shift @check_keys;    
    $_record{$pre_key} = $record->{$pre_key};

    for my $_key ( @check_keys ) {
        $_record{$_key} = $record->{$_key};
        if ( $record->{$pre_key}  && $record->{$_key}) {
            $_record{ 'delta_'.$_key} = $record->{$_key} / $record->{$pre_key} -1;            
        } else {
            $_record{ 'delta_'.$_key} = undef;            
        }
        $pre_key = $_key;        
    }
    \%_record;        
}

my $records = (parse_data( fetch_data($url)));
my @t_records = map { transform_record($_); } @$records;


# print max( grep { defined && $_ ne ''} (map { $_->{actual2013} } @t_records));
# print "\n";
# print min( grep { defined && $_ ne ''} (map { $_->{actual2013} } @t_records));
# print "\n";
#print max( grep { defined && $_ ne ''} (map { $_->{delta_actual2013} } @t_records));
# print "\n";
# print min( map {abs} (grep { defined && $_ ne ''} (map { $_->{delta_actual2013} } @t_records)));
# print "\n";



my $output = [];

for my $p_record ( @t_records) {
    my $p_output = {
        id => $p_record->{id},
        name => $p_record->{name},
        year => $p_record->{actual2013},
        change => $p_record->{delta_actual2013},
        years => join(',', map { defined($_) ? $_ : '' }($p_record->{actual2006}, $p_record->{actual2007}, $p_record->{actual2008}, $p_record->{actual2009},
              $p_record->{actual2010}, $p_record->{actual20011}, $p_record->{actual2012}, $p_record->{actual2013}))
    };
    push @$output, $p_output;    
}




my $js_ob = to_json($output);


print $js_ob;



__END__

=head1 NAME

budgethk.pl - Describe the usage of script briefly

=head1 SYNOPSIS

budgethk.pl [options] args

      -opt --long      Option description

=head1 DESCRIPTION

Stub documentation for budgethk.pl, 

=head1 AUTHOR

Yanyi Wan, E<lt>stephen@Yanyis-MacBook-Pro.localE<gt>

=head1 COPYRIGHT AND LICENSE

Copyright (C) 2014 by Yanyi Wan

This program is free software; you can redistribute it and/or modify
it under the same terms as Perl itself, either Perl version 5.8.2 or,
at your option, any later version of Perl 5 you may have available.

=head1 BUGS

None reported... yet.

=cut

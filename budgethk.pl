#!/usr/bin/perl -w
# budgethk.pl --- 
# Author: Yanyi Wan <stephen@Yanyis-MacBook-Pro.local>
# Created: 15 Feb 2014
# Version: 0.01

use warnings;
use strict;
use Data::Dumper;
use JSON;

my $file_dept_json = 'resource/department.json';
my $file_branch_json = 'resource/branch.json';

my $getGid;



sub fetch_depts {
    my $faddr = shift;
    open my $fh, "<", $faddr
        or die "Cannot read from ".$faddr;
        
    local $\;
    my $json = <$fh>;
    close $fh;
    my $ref = from_json($json); 
    $ref;
}


sub fetch_branches {
    my $faddr = shift;
    open my $fh, "<", $faddr
        or die "Cannot read from ".$faddr;
        
    local $\;
    my $json = <$fh>;
    close $fh;
    my $ref = from_json($json); 
    $ref;
}

sub parse_csv {
    my $faddr = shift;
    open my $fh, "<", $faddr
        or die "Cannot read from ".$faddr;

    my @keys = ();
    my $r_records = [];    
    
    while ( <$fh>) {
        chomp;
        next unless $_;

        s/\r\n/\n/g;   # handles win- line breaks
        s/"([^"]*)"/'"'.($1 =~ s{,}{}gr).'"'/eg; # handles quoted comma

        my @values = map { $_ =~ s/^\s+|\s+$//gr } (split ',', $_);
        next unless @values;
        
      
                        
        # the first non-empty line should always be the line containing keys
        unless ( @keys) {
            @keys = @values;
            $keys[0] = 'head';   # sometimes the first character of the file ill-behaves...                        
            
        } else {
            my $r_data = {};            
            for my $i ( 0..$#keys) {                     
                if ( defined $values[$i]) {
                    $values[$i] =~ s/"//g;
                }                
                $r_data->{$keys[$i]} = $values[$i];                
            }
            push @$r_records, $r_data if %$r_data;                        
        }                
    }
    
    close $fh;
    $r_records;      
}


sub transform_record {
    my $r_record = shift;

    my @years = 2006 .. 2014;

    my $year_last_estimate;
    
    for ( reverse (0..$#years)) {                
        my $key = 'estimate'.$years[$_];
        if ( defined($r_record->{$key}) && ($r_record->{$key} ne '')) {
            $year_last_estimate = $years[$_];
            last;            
        }        
    }

    die "Didn't find any year with estimate value, give up..." . $r_record->{name}
        unless $year_last_estimate;
        
    my %trecord = (
        id => $r_record->{head},
        name => $r_record->{name},        
    );

    if ( defined $getGid ) {
        $trecord{gid} = $getGid->($trecord{id});        
    }

    my @valid_years = ();
    my @trend = ();
    
    for ( 2006 .. $year_last_estimate) {
        my $key = 'actual'.$_;
      #  print $_, "->|", $year_last_estimate," : ", $r_record->{$key}. "\n";
        
      
        push @trend, + $r_record->{$key};
        push @valid_years, $_ - 1;        
    }

    push @valid_years, $year_last_estimate;
    push @trend, 0 + $r_record->{'revised'.$year_last_estimate};

    
    push @valid_years, $year_last_estimate + 1;
    push @trend, 0 + $r_record->{'estimate'.$year_last_estimate};
    
    %trecord = ( %trecord,
        trend => join(',', @trend),         
        years => join(',', @valid_years),
        last_change => ($trend[-2])?(0.0 + $trend[-1] - $trend[-2] )/$trend[-2] : undef,
        last_value => $trend[-1],                
    );
    \%trecord;
}

    
    
my $csv_file_addr = 'resource/budge expenditure_tc.v1.3.csv';

my $data = parse_csv($csv_file_addr);

my $transformed_data = [ map { transform_record $_ } @$data ];

print to_json($transformed_data);


    

    
    

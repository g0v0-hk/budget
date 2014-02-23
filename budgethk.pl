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

my $getGid;

{
    local $\;
    my $depts_json = <DATA>;
    my $depts = from_json($depts_json);
    my %depts_map = ();
    for ( @$depts) {
        $depts_map{"".$_->{'id'}} = 0 + $_->{"bid"};        
    }
    $getGid = sub {
        my $id = '' .shift;
        return $depts_map{$id};        
    };            
}




sub fetch_data {
    my $url = shift;
    my $ua = LWP::UserAgent->new();
    my $response = $ua->get($url);
    if ( !$response->is_success) {
        die $response->status_line;        
    }
    $response->content();    
}


my $url_expenditures = 'http://localhost/~stephen/g0v0hk/resource/budget.expenditures.csv';

my $url_revenues = 'http://localhost/~stephen/g0v0hk/resource/budget.revenues_tc.csv';

my $url = $url_revenues;


sub parse_data {
    my $data = shift;

    $data =~ s/\r\n/\n/g;            
    $data =~ s/"([^"]*)"/'"'.($1 =~ s{,}{}gr).'"'/eg;
    
    
    my @lines = split "\n", $data;
    my @keys = split ",", (shift @lines);
    shift @keys;
    
    
    
    
    my $result = [];

    for my $_line ( @lines) {
        chomp($_line);
        
        my @vals =  (split ",", $_line);
        my $_record = {};
        %$_record = zip(@keys, @vals);        
        push @$result, $_record;        
    }
    $result;    
}


sub transform_record {
    my $record = shift;
        
    #my @check_keys = qw{ actual2006 actual2007 actual2008 actual2009 actual2010 actual2011 actual2012 actual2013 revised2013 estimate2013};

    my @check_keys = qw{ actual2006 actual2007 actual2008 actual2009 actual2010 actual2011 actual2012 revised2012 estimate2012};

    my $_extract_year = sub { shift =~ /([a-z]+)(\d+)/; {token => $1, year=> 0 + $2 }};
            
    my %_record = (
        name => $record->{name},
        id => $record->{head},  
#        gid => $getGid->($record->{head}),
    );

    
    
    my $pre_key = shift @check_keys;
    my $first_year = $_extract_year->($pre_key)->{year} -1 ;

    $_record{first_year} = $first_year;
    $_record{last_year} = $first_year;
    
    
    $_record{$first_year } = $record->{$pre_key};

    
    
    for my $_key ( @check_keys ) {        
        last unless defined $record->{$_key};                        
        my ($token, $year) = ( $_extract_year->($_key)->{token},  $_extract_year->($_key)->{year});

        if ( $token eq 'actual') {
            $year -= 1;
        }
        elsif ( $token eq 'revised') {
            $year = $year;            
        } elsif ( $token eq 'estimate') {
            $year += 1;            
        }
        
        
        $_record{last_year} = $year ;
        
        $_record{ $year } = $record->{$_key};
        if ( $record->{$pre_key}  && $record->{$_key}) {
            $_record{ 'delta_'. $year  } = $record->{$_key} / $record->{$pre_key} -1;            
        } else {
            $_record{ 'delta_'.$year } = undef;            
        }
               
        $pre_key = $_key;
        
    }                              
    
    \%_record;        
}

sub observe_record {
    my $record = shift ;

     if ( $record->{last_year} <2011) {
        return undef;        
    }
    
    my $observed = {
        id => + $record->{id},
        name => $record->{name},    
      #  gid => $record->{gid},
        last_change =>  + $record->{'delta_'.$record->{last_year}},
        last_value =>  + $record->{$record->{last_year}},      
    };

    my $years = [+ $record->{first_year} .. +$record->{last_year}];
   
    
    my $trend = 
    [map { defined($record->{$_})?$record->{$_}:'' } @$years];
    
    $observed->{trend} = join ',', @$trend;
    $observed->{years} = join ',', @$years;    
    $observed;        
}



my $records = (parse_data( fetch_data($url)));

#print to_json($records, {pretty => 1});
#die();

#transform_record($records->[0]);
#die();



my $t_records = [map { transform_record($_); } @$records ];


#print Dumper($t_records);
#die();


my $o_records = [grep {defined $_} (map { observe_record($_); } @$t_records )];

print to_json($o_records, {pretty => 0});


# print max( grep { defined && $_ ne ''} (map { $_->{actual2013} } @t_records));
# print "\n";
# print min( grep { defined && $_ ne ''} (map { $_->{actual2013} } @t_records));
# print "\n";
#print max( grep { defined && $_ ne ''} (map { $_->{delta_actual2013} } @t_records));
# print "\n";
# print min( map {abs} (grep { defined && $_ ne ''} (map { $_->{delta_actual2013} } @t_records)));
# print "\n";


__DATA__
[{"bid":5,"zhname":"行政長官辦公室","name":"Chief Executive Office","id":21},{"bid":12,"zhname":"漁農自然護理署","name":"Agriculture, Fisheries and Conservation Department","id":22},{"bid":8,"zhname":"醫療輔助隊","name":"Auxiliary Medical Service","id":23},{"bid":5,"zhname":"審計署","name":"Audit Commission","id":24},{"bid":17,"zhname":"建築署","name":"Architectural Services Department","id":25},{"bid":13,"zhname":"統計處","name":"Census and Statistics Department","id":26},{"bid":8,"zhname":"民安隊","name":"Civil Aid Service","id":27},{"bid":18,"zhname":"民航處","name":"Civil Aviation Department","id":28},{"bid":8,"zhname":"懲教署","name":"Correctional Services Department","id":30},{"bid":8,"zhname":"海關","name":"Customs and Excise Department","id":31},{"bid":17,"zhname":"土木工程拓展署","name":"Civil Engineering and Development Department","id":33},{"bid":12,"zhname":"衛生署","name":"Department of Health","id":37},{"bid":17,"zhname":"渠務署","name":"Drainage Services Department","id":39},{"bid":17,"zhname":"機電工程署","name":"Electrical and Mechanical Services Department","id":42},{"bid":19,"zhname":"環境保護署","name":"Environmental Protection Department","id":44},{"bid":8,"zhname":"香港消防處","name":"Fire Services Department","id":45},{"bid":1,"zhname":"公務員一般開支","name":"General Expenses of the Civil Service","id":46},{"bid":14,"zhname":"政府資訊科技總監辦公室","name":"Government Secretariat: Office of the Government Chief Information Officer","id":47},{"bid":12,"zhname":"政府化驗所","name":"Government Laboratory","id":48},{"bid":12,"zhname":"食物環境衛生署","name":"Food and Environmental Hygiene Department","id":49},{"bid":13,"zhname":"政府產業署","name":"Government Property Agency","id":51},{"bid":3,"zhname":"民政事務局","name":"Government Secretariat: Home Affairs Bureau","id":53},{"bid":14,"zhname":"商務及經濟發展局(通訊及科技科)","name":"Government Secretariat: Commerce, Industry and Technology Bureau (Communications and Technology Branch)","id":55},{"bid":13,"zhname":"政府物流服務署","name":"Government Logistics Department","id":59},{"bid":18,"zhname":"路政署","name":"Highways Department","id":60},{"bid":18,"zhname":"房屋署","name":"Housing Department","id":62},{"bid":3,"zhname":"民政事務總署","name":"Home Affairs Department","id":63},{"bid":8,"zhname":"入境事務處","name":"Immigration Department","id":70},{"bid":5,"zhname":"廉政公署","name":"Independent Commission Against Corruption","id":72},{"bid":3,"zhname":"政府新聞處","name":"Information Services Department","id":74},{"bid":13,"zhname":"稅務局","name":"Inland Revenue Department","id":76},{"bid":14,"zhname":"知識產權署","name":"Intellectual Property Department","id":78},{"bid":14,"zhname":"投資推廣署","name":"Invest Hong Kong","id":79},{"bid":2,"zhname":"司法機構","name":"Judiciary","id":80},{"bid":17,"zhname":"屋宇署","name":"Buildings Department","id":82},{"bid":16,"zhname":"勞工處","name":"Labour Department","id":90},{"bid":17,"zhname":"地政總署","name":"Lands Department","id":91},{"bid":9,"zhname":"律政司","name":"Department of Justice","id":92},{"bid":3,"zhname":"法律援助署","name":"Legal Aid Department","id":94},{"bid":3,"zhname":"康樂及文化事務署","name":"Leisure and Cultural Services Department","id":95},{"bid":14,"zhname":"海外經濟貿易辦事處","name":"Government Secretariat: Overseas Economic and Trade Offices","id":96},{"bid":18,"zhname":"海事處","name":"Marine Department","id":100},{"bid":6,"zhname":"雜項服務","name":"Miscellaneous Services","id":106},{"bid":4,"zhname":"立法會行政管理委員會","name":"Legislative Council Commission","id":112},{"bid":5,"zhname":"申訴專員公署","name":"Office of The Ombudsman","id":114},{"bid":13,"zhname":"破產管理署","name":"Official Receiver? Office","id":116},{"bid":17,"zhname":"規劃署","name":"Planning Department","id":118},{"bid":6,"zhname":"退休金","name":"Pensions","id":120},{"bid":7,"zhname":"監警會","name":"Independent Police Complaints Council","id":121},{"bid":8,"zhname":"警務處","name":"Hong Kong Police Force","id":122},{"bid":5,"zhname":"公務員敍用委員會秘書處","name":"Public Service Commission","id":136},{"bid":19,"zhname":"環境局","name":"Government Secretariat: Environment Bureau","id":137},{"bid":17,"zhname":"發展局(規劃地政科)","name":"Government Secretariat: Housing, Planning and Lands Bureau (Planning and Lands Branch)","id":138},{"bid":12,"zhname":"食物及衛生局(食物科)","name":"Government Secretariat: Health, Welfare and Food Bureau (Food and Environmental Hygiene Branch)","id":139},{"bid":12,"zhname":"食物及衛生局(衛生科)","name":"Government Secretariat: Health, Welfare and Food Bureau (Health and Welfare Branch)","id":140},{"bid":16,"zhname":"勞工及福利局","name":"Government Secretariat: Labour and Welfare Bureau","id":141},{"bid":11,"zhname":"政務司司長辦公室及財政司司長辦公室","name":"Government Secretariat: Offices of the Chief Secretary for Administration and the Financial Secretary","id":142},{"bid":1,"zhname":"公務員事務局","name":"Government Secretariat: Civil Service Bureau","id":143},{"bid":10,"zhname":"政制及內地事務局","name":"Government Secretariat: Constitutional Affairs Bureau","id":144},{"bid":13,"zhname":"財經事務及庫務局(庫務科)","name":"Government Secretariat: Financial Services and the Treasury Bureau (The Treasury Branch)","id":147},{"bid":13,"zhname":"財經事務及庫務局(財經事務科)","name":"Government Secretariat: Financial Services and the Treasury Bureau (Financial Services Branch)","id":148},{"bid":8,"zhname":"保安局","name":"Government Secretariat: Security Bureau","id":151},{"bid":14,"zhname":"商務及經濟發展局(工商及旅遊科)","name":"Government Secretariat: Commerce, Industry and Technology Bureau (Commerce and Industry Branch)","id":152},{"bid":14,"zhname":"創新科技署","name":"Government Secretariat: Innovation and Technology Commission","id":155},{"bid":15,"zhname":"教育局","name":"Government Secretariat: Education and Manpower Bureau","id":156},{"bid":18,"zhname":"運輸及房屋局(運輸科)","name":"Government Secretariat: Environment, Transport and Works Bureau (Transport Branch)","id":158},{"bid":17,"zhname":"發展局(工務科)","name":"Government Secretariat: Environment, Transport and Works Bureau (Works Branch)","id":159},{"bid":14,"zhname":"香港電台 ","name":"Radio Television Hong Kong","id":160},{"bid":13,"zhname":"差餉物業估價署","name":"Rating and Valuation Department","id":162},{"bid":10,"zhname":"選舉事務處","name":"Registration and Electoral Office","id":163},{"bid":8,"zhname":"飛行服務隊","name":"Government Flying Service","id":166},{"bid":14,"zhname":"天文台","name":"Hong Kong Observatory","id":168},{"bid":8,"zhname":"截取通訊及監察事務專員秘書處","name":"Secretariat, Commissioner on Interception of Communications and Surveillance","id":169},{"bid":16,"zhname":"社會福利署","name":"Social Welfare Department","id":170},{"bid":15,"zhname":"學生資助辦事處","name":"Student Financial Assistance Agency","id":173},{"bid":1,"zhname":"薪諮會聯合秘書處","name":"Joint Secretariat for the Advisory Bodies on Civil Service and Judicial Salaries and Conditions of Service","id":174},{"bid":14,"zhname":"電影、報刊及物品管理辦事處","name":"Television and Entertainment Licensing Authority","id":180},{"bid":14,"zhname":"工業貿易署","name":"Trade and Industry Department","id":181},{"bid":6,"zhname":"轉撥各基金的款項","name":"Transfers to Funds","id":184},{"bid":18,"zhname":"運輸署","name":"Transport Department","id":186},{"bid":13,"zhname":"庫務署","name":"Treasury","id":188},{"bid":15,"zhname":"大學教育資助委員會","name":"University Grants Committee","id":190},{"bid":17,"zhname":"水務署","name":"Water Supplies Department","id":194}]

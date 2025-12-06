<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: PUT, GET, POST");
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");

// [START analytics_data_quickstart]
require 'vendor/autoload.php';

use Google\Analytics\Data\V1beta\BetaAnalyticsDataClient;
use Google\Analytics\Data\V1beta\DateRange;
use Google\Analytics\Data\V1beta\Dimension;
use Google\Analytics\Data\V1beta\Metric;


$property_id = '351148451';

$credentials_json_path = 'wethioproperties-775e89f81310.json';

$client = new BetaAnalyticsDataClient(['credentials' => $credentials_json_path]);

$report = isset($_GET["report"])? $_GET["report"] : "";
$startDate = isset($_GET["start_date"])? $_GET["start_date"] : "";
$endDate  = isset($_GET["end_date"])? $_GET["end_date"] : "";

if( $report == "ActiveUsers_by_country" ) report_ActiveUsers_by_country($startDate, $endDate);

if( $report == "ActiveUsers_by_deviceCategory" ) report_ActiveUsers_by_deviceCategory($startDate, $endDate); 

if( $report == "ActiveUsers_by_date" ) report_ActiveUsers_by_date($startDate, $endDate); 

if( $report == "Sessions_by_country" ) report_Sessions_by_country($startDate, $endDate);

if( $report == "Conversions" ) report_Conversions($startDate, $endDate);

if( $report == "Conversions_by_Channel" ) report_Conversions_by_Channel($startDate, $endDate);

if( $report == "Conversions_by_fullPageUrl" ) report_Conversions_by_fullPageUrl($startDate, $endDate);

if( $report == "BounceRate" ) report_BounceRate($startDate, $endDate);

if($report == "traffic_source") report_traffic_source($startDate, $endDate);

if($report == "traffic_source_details") report_traffic_source_details($startDate, $endDate);

if($report == "BounceRate_and_activeUsers") report_BounceRate_and_activeUsers($startDate, $endDate);

if($report == "Conversion_by_destination") report_Conversion_by_destination($startDate, $endDate);


//////////// Report result ActiveUsers By country
function report_ActiveUsers_by_country($startDate, $endDate)
{
    global $property_id,$client;

    $response = $client->runReport([
        'property' => 'properties/' . $property_id,
        'dateRanges' => [
            new DateRange([
                'start_date' => $startDate,
                'end_date' => $endDate,
            ]),
        ],
        'limit' => 7,
        'dimensions' => [new Dimension(
            [
                'name' => 'country',
            ]
        ),
        ],
        'metrics' => [new Metric(
            [
                'name' => 'activeUsers',
            ]
        )
        ]
    ]);


    $data = array();

    foreach ($response->getRows() as $row) {

        $sub_data = array(  
                        "label" => $row->getDimensionValues()[0]->getValue(),
                        "value" => $row->getMetricValues()[0]->getValue() 
                    );

        array_push($data, $sub_data);

    }

    echo json_encode( $data );

}

/// Report result ActiveUsers By device
function report_ActiveUsers_by_deviceCategory($startDate, $endDate)
{
    global $property_id,$client;

    $response = $client->runReport([
        'property' => 'properties/' . $property_id,
        'dateRanges' => [
            new DateRange([
                'start_date' => $startDate,
                'end_date' => $endDate,
            ]),
        ],
        'dimensions' => [new Dimension(
            [
                'name' => 'deviceCategory',
            ]
        ),
        ],
        'metrics' => [new Metric(
            [
                'name' => 'activeUsers',
            ]
        )
        ]
    ]);

    $data = array();

    foreach ($response->getRows() as $row) {

        $sub_data = array(  
                        "label" => $row->getDimensionValues()[0]->getValue(),
                        "value" => $row->getMetricValues()[0]->getValue() 
                    );

        array_push($data, $sub_data);

    }

    echo json_encode( $data );

}

//////////// Report result ActiveUsers By date
function report_ActiveUsers_by_date($startDate, $endDate)
{
    global $property_id,$client;

    $response = $client->runReport([
        'property' => 'properties/' . $property_id,
        'dateRanges' => [
            new DateRange([
                'start_date' => $startDate,
                'end_date' => $endDate,
            ]),
        ],
        'dimensions' => [new Dimension(
            [
                'name' => 'date',
            ]
        ),
        ],
        'metrics' => [new Metric(
            [
                'name' => 'activeUsers',
            ]
        )
        ]
    ]);

    $data = array();

    foreach ($response->getRows() as $row) {

        $sub_data = array(  
                        "label" => date("d-m-Y", strtotime( $row->getDimensionValues()[0]->getValue() ) ) ,
                        "value" => $row->getMetricValues()[0]->getValue() 
                    );

        array_push($data, $sub_data);

    }

    function date_compare($element1, $element2) {
        $datetime1 = strtotime($element1['label']);
        $datetime2 = strtotime($element2['label']);
        return $datetime1 - $datetime2;
    } 
      
    // Sort the array 
    usort( $data, 'date_compare');

    echo json_encode( $data );

}

//////////// Report result Sessions
function report_Sessions_by_country($startDate, $endDate)
{
    global $property_id,$client;

    $response = $client->runReport([
        'property' => 'properties/' . $property_id,
        'dateRanges' => [
            new DateRange([
                'start_date' => $startDate,
                'end_date' => $endDate,
            ]),
        ],
        'limit' => 7,
        'dimensions' => [new Dimension(
            [
                'name' => 'country',
            ]
        )],
        'metrics' => [new Metric(
            [
                'name' => 'sessions',
            ]
        )]
    ]);

    $data = array();

    foreach ($response->getRows() as $row) {

        $sub_data = array(  
                        "label" => $row->getDimensionValues()[0]->getValue(),
                        "value" => $row->getMetricValues()[0]->getValue() 
                    );

        array_push($data, $sub_data);

    }

    echo json_encode( $data );

}

//////////// Report result Conversions
function report_Conversions($startDate, $endDate)
{
    global $property_id,$client;

    $response = $client->runReport([
        'property' => 'properties/' . $property_id,
        'dateRanges' => [
            new DateRange([
                'start_date' => $startDate,
                'end_date' => $endDate,
            ]),
        ],
        'dimensions' => [new Dimension(
            [
                'name' => 'visible',
            ]
        ),
        ],
        'metrics' => [new Metric(
            [
                'name' => 'conversions',
            ]
        )
        ]
    ]);

    $data = array();

    foreach ($response->getRows() as $row) {

        $sub_data = array(  
                        "value" => $row->getMetricValues()[0]->getValue() 
                    );

        array_push($data, $sub_data);

    }

    echo json_encode( $data );

}

//////////// Report result Conversions By Channel
function report_Conversions_by_Channel($startDate, $endDate)
{
    global $property_id,$client;

    $response = $client->runReport([
        'property' => 'properties/' . $property_id,
        'dateRanges' => [
            new DateRange([
                'start_date' => $startDate,
                'end_date' => $endDate,
            ]),
        ],
        'dimensions' => [new Dimension(
            [
                'name' => 'defaultChannelGrouping',
            ]
        ),
        ],
        'metrics' => [new Metric(
            [
                'name' => 'conversions',
            ]
        )
        ]
    ]);

    $data = array();

    foreach ($response->getRows() as $row) {

        $sub_data = array(  
                        "label" => $row->getDimensionValues()[0]->getValue(),
                        "value" => $row->getMetricValues()[0]->getValue() 
                    );

        array_push($data, $sub_data);

    }

    echo json_encode( $data );
}

//////////// Report result Conversions By fullPageUrl
function report_Conversions_by_fullPageUrl($startDate, $endDate)
{
    global $property_id,$client;

    $response = $client->runReport([
        'property' => 'properties/' . $property_id,
        'dateRanges' => [
            new DateRange([
                'start_date' => $startDate,
                'end_date' => $endDate,
            ]),
        ],
        'dimensions' => [new Dimension(
            [
                'name' => 'fullPageUrl',
            ]
        ),
        ],
        'metrics' => [new Metric(
            [
                'name' => 'conversions',
            ]
        )
        ]
    ]);

    $data = array();

    foreach ($response->getRows() as $row) {

        $sub_data = array(  
                        "label" => $row->getDimensionValues()[0]->getValue(),
                        "value" => $row->getMetricValues()[0]->getValue() 
                    );

        array_push($data, $sub_data);

    }

    echo json_encode( $data );
}

//////////// Report result bounceRate
function report_BounceRate($startDate, $endDate)
{
    global $property_id,$client;

    $response = $client->runReport([
        'property' => 'properties/' . $property_id,
        'dateRanges' => [
            new DateRange([
                'start_date' => $startDate,
                'end_date' => $endDate,
            ]),
        ],
        'dimensions' => [new Dimension(
            [
                'name' => 'visible',
            ]
        ),
        ],
        'metrics' => [new Metric(
            [
                'name' => 'bounceRate',
            ]
        )
        ]
    ]);

    $data = array();

    foreach ($response->getRows() as $row) {

        $sub_data = array(  
                        "label" => $row->getDimensionValues()[0]->getValue(),
                        "value" => $row->getMetricValues()[0]->getValue() 
                    );

        array_push($data, $sub_data);

    }

    echo json_encode( $data );
}

//////////// Report result traffic source details
function report_traffic_source_details($startDate, $endDate)
{
    global $property_id,$client;

    $data = array();

    $response = $client->runReport([
        'property' => 'properties/' . $property_id,
        'dateRanges' => [
            new DateRange([
                'start_date' => $startDate,
                'end_date' => $endDate,
            ]),
        ],
        'dimensions' => [new Dimension(
            [
                'name' => 'sessionSource',
            ]
        ),
        ],
        'metrics' => [
            new Metric(['name' => 'activeUsers']),
            new Metric(['name' => 'sessions']),
            new Metric(['name' => 'conversions']),
            new Metric(['name' => 'engagementRate'])
        ]
    ]);
    
    $data_activeUsers = array();
    $data_sessions = array();
    $data_conversions = array();
    $data_engagementRate = array();

    foreach ($response->getRows() as $row) {

        $data_activeUsers[ $row->getDimensionValues()[0]->getValue() ] = $row->getMetricValues()[0]->getValue();
        $data_sessions[ $row->getDimensionValues()[0]->getValue() ] = $row->getMetricValues()[1]->getValue();
        $data_conversions[ $row->getDimensionValues()[0]->getValue() ] = $row->getMetricValues()[2]->getValue();
        $data_engagementRate[ $row->getDimensionValues()[0]->getValue() ] = $row->getMetricValues()[3]->getValue();

    }


    $data_keys = array_keys( $data_activeUsers);
  
    foreach ($data_keys as $key => $value) {
        
        $values_array = array();

        if(array_key_exists($value, $data_activeUsers)){
            $x = $data_activeUsers[$value];
        }else{
            $x = 0;
        }
        array_push($values_array, $x);


        if(array_key_exists($value, $data_sessions)){
            $x = $data_sessions[$value];
        }else{
            $x = 0;
        }
        array_push($values_array, $x);

        if(array_key_exists($value, $data_conversions)){
            $x = $data_conversions[$value];
        }else{
            $x = 0;
        }
        array_push($values_array, $x);

        if(array_key_exists($value, $data_engagementRate)){
            $x = $data_engagementRate[$value];
        }else{
            $x = 0;
        }
        array_push($values_array, $x);

        $data[$value] = $values_array; 

    }

    echo json_encode( $data );

}

//////////// Report result traffic source
function report_traffic_source($startDate, $endDate)
{
    global $property_id,$client;

    $data = array();

    $response = $client->runReport([
        'property' => 'properties/' . $property_id,
        'dateRanges' => [
            new DateRange([
                'start_date' => $startDate,
                'end_date' => $endDate,
            ]),
        ],
        'dimensions' => [new Dimension(
            [
                'name' => 'sessionDefaultChannelGrouping',
            ]
        ),
        ],
        'metrics' => [
            new Metric(['name' => 'activeUsers']),
            new Metric(['name' => 'sessions']),
            new Metric(['name' => 'conversions']),
            new Metric(['name' => 'engagementRate'])
        ]
    ]);
    
    $data_activeUsers = array();
    $data_sessions = array();
    $data_conversions = array();
    $data_engagementRate = array();

    foreach ($response->getRows() as $row) {

        $data_activeUsers[ $row->getDimensionValues()[0]->getValue() ] = $row->getMetricValues()[0]->getValue();
        $data_sessions[ $row->getDimensionValues()[0]->getValue() ] = $row->getMetricValues()[1]->getValue();
        $data_conversions[ $row->getDimensionValues()[0]->getValue() ] = $row->getMetricValues()[2]->getValue();
        $data_engagementRate[ $row->getDimensionValues()[0]->getValue() ] = $row->getMetricValues()[3]->getValue();

    }


    $data_keys = array_keys( $data_activeUsers);
  
    foreach ($data_keys as $key => $value) {
        
        $values_array = array();

        if(array_key_exists($value, $data_activeUsers)){
            $x = $data_activeUsers[$value];
        }else{
            $x = 0;
        }
        array_push($values_array, $x);

        
        if(array_key_exists($value, $data_sessions)){
            $x = $data_sessions[$value];
        }else{
            $x = 0;
        }
        array_push($values_array, $x);

        if(array_key_exists($value, $data_conversions)){
            $x = $data_conversions[$value];
        }else{
            $x = 0;
        }
        array_push($values_array, $x);

        if(array_key_exists($value, $data_engagementRate)){
            $x = $data_engagementRate[$value];
        }else{
            $x = 0;
        }
        array_push($values_array, $x);
        

        $data[$value] = $values_array; 

    }

    echo json_encode( $data );

}

//////////// Report BounceRate and activeUsers
function report_BounceRate_and_activeUsers($startDate, $endDate)
{
    global $property_id,$client;

    $response = $client->runReport([
        'property' => 'properties/' . $property_id,
        'dateRanges' => [
            new DateRange([
                'start_date' => $startDate,
                'end_date' => $endDate,
            ]),
        ],
        'dimensions' => [new Dimension(
            [
                'name' => 'visible',
            ]
        ),
        ],
        'metrics' => [
            new Metric(['name' => 'bounceRate']),
            new Metric(['name' => 'activeUsers'])
        ]
    ]);

    $data = array();

    foreach ($response->getRows() as $row) {

        $data["bounceRate"] = $row->getMetricValues()[0]->getValue();
        $data["activeUsers"] = $row->getMetricValues()[1]->getValue();

    }

    echo json_encode( $data );
}

//////////// Report result Conversion by destination
function report_Conversion_by_destination($startDate, $endDate)
{
    global $property_id,$client;

    $response = $client->runReport([
        'property' => 'properties/' . $property_id,
        'dateRanges' => [
            new DateRange([
                'start_date' => $startDate,
                'end_date' => $endDate,
            ]),
        ],
        'limit' => 7,
        'dimensions' => [new Dimension(
            [
                'name' => 'eventName',
            ]
        ),
        ],
        'metrics' => [new Metric(
            [
                'name' => 'conversions',
            ]
        )
        ]
    ]);


    $data = array();

    foreach ($response->getRows() as $row) {

        $sub_data = array(  
                        "label" => $row->getDimensionValues()[0]->getValue(),
                        "value" => $row->getMetricValues()[0]->getValue() 
                    );

        array_push($data, $sub_data);

    }

    echo json_encode( $data );

}
/*
 <SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/">
 <SOAP-ENV:Header>
 <t:Transaction xmlns:t="xxs">
 <tc>
 <iden u="FLXtest" p="dLKx6Xne" pseudocity="AEO2" agt="xmlava001" agtpwd="3l912O8X$p" agtrole="Ticketing Agent" agy="05600044"/>
 <agent user="xmlava001"/>
 <trace>xmlava001</trace>
 <script engine="FLXDM" name="avaea-dispatch.flxdm"/>
 </tc>
 </t:Transaction>
 </SOAP-ENV:Header>
 <SOAP-ENV:Body>
 <ns1:XXTransaction xmlns:ns1="xxs">
 <REQ>
 <AirAvailabilityRQ>
 <OriginDestination>
 <Departure>
 <CityCode>YYZ</CityCode>
 </Departure>
 <Arrival>
 <CityCode>YVR</CityCode>
 </Arrival>
 <Date Qualifier="DEPARTURE">2016-02-08</Date>
 <Preferences Sort="NEUTRAL"/>
 </OriginDestination>
 <OriginDestination>
 <Departure>
 <CityCode>YVR</CityCode>
 </Departure>
 <Arrival>
 <CityCode>YYZ</CityCode>
 </Arrival>
 <Date Qualifier="DEPARTURE">2016-02-12</Date>
 <Preferences Sort="NEUTRAL"/>
 </OriginDestination>
 <TravelerIDs PaxType="ADT" AssociationID="T1"/>
 </AirAvailabilityRQ>
 </REQ>
 </ns1:XXTransaction>
 </SOAP-ENV:Body>
 </SOAP-ENV:Envelope>

 */

var _           = require('lodash-node'),
    https       = require('https'),
    xmlparser   = require('xml2json');

var tc = '' +
    '<tc>\
        <iden u="FLXtest" p="dLKx6Xne" pseudocity="AEO2" agt="xmlava001" agtpwd="3l912O8X$p" agtrole="Ticketing Agent" agy="05600044"/>\
        <agent user="xmlava001"/>\
        <trace>xmlava001</trace>\
        <script engine="FLXDM" name="avaea-dispatch.flxdm"/>\
    </tc>';

var destination = '' +
    '<OriginDestination>\
        <Departure>\
            <CityCode>{{departure}}</CityCode>\
        </Departure>\
        <Arrival>\
            <CityCode>{{arrival}}</CityCode>\
        </Arrival>\
        <Date Qualifier="DEPARTURE">{{date}}</Date>\
        <Preferences Sort="NEUTRAL"/>\
    </OriginDestination>';

var airAvailability = '' +
    '<AirAvailabilityRQ>\
        {{destination}}\
        <TravelerIDs PaxType="ADT" AssociationID="T1"/>\
    </AirAvailabilityRQ>';

var flightPrice = '' +
    '<FlightPriceRQ>\
        <TravelerInfo Type="ADT">1</TravelerInfo>\
        <TravelerIDs AssociationID="T1" PaxType="ADT"/>\
        <OriginDestination>\
            <Flight AssociationID="F1" FlightRefKey="F1" MarriedSegment="B" Source="AA">\
                <AirlineCode>{{airline}}</AirlineCode>\
                <FlightNumber>{{flightnumber}}</FlightNumber>\
                <ClassOfService>{{classofservice}}</ClassOfService>\
                <Equipment>\
                    <Code>{{equipmentcode}}</Code>\
                    <Name>{{equipmentname}}</Name>\
                </Equipment>\
                <Departure>\
                    <AirportCode>{{departureapt}}</AirportCode>\
                    <Date>{{departuredate}}</Date>\
                    <Time>{{departuretime}}</Time>\
                </Departure>\
                <Arrival>\
                    <AirportCode>{{arrivalapt}}</AirportCode>\
                    <Date>{{arrivaldate}}</Date>\
                    <Time>{{arrivaltime}}</Time>\
                </Arrival>\
                <NumberOfStops>0</NumberOfStops>\
                <PriceClass Code="" Name=""/>\
                <FareRefKey/>\
            </Flight>\
        </OriginDestination>\
        <PricingInfo BestPricing="Y" FareType="BOTH" RequestOptions="N">\
            <SegmentIDRef PriceClassCode="" PriceClassName="">F1</SegmentIDRef>\
            <Restrictions Advance="Y" MaximumStay="Y" MinimumStay="Y" Penalty="Y"/>\
            <PrivateFares>\
                <Office Provider="F1">AA1V</Office>\
            </PrivateFares>\
        </PricingInfo>\
    </FlightPriceRQ>';


var body = '' +
    '<SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/">\
        <SOAP-ENV:Header>\
            <t:Transaction xmlns:t="xxs">\
                {{tc}}\
            </t:Transaction>\
        </SOAP-ENV:Header>\
        <SOAP-ENV:Body>\
            <ns1:XXTransaction xmlns:ns1="xxs">\
                <REQ>\
                    {{request}}\
                </REQ>\
            </ns1:XXTransaction>\
        </SOAP-ENV:Body>\
    </SOAP-ENV:Envelope>';

exports.air = function(req, res, next) {

    if (
        _.isEmpty(req.body) || !req.body.rows || !req.body.depart || !req.body.arrive || !req.body.date ||
        req.body.depart.length != req.body.rows || req.body.arrive.length != req.body.rows || req.body.date.length != req.body.rows

    ) {
        var results = {status: 400, error: 'Not enough params for searching'};
        res.status(409).json(results);
    }

    var composedRequest = body, dest = '', aa = airAvailability;

    for (var i = 0; i < req.body.rows; i++) {
        dest += destination
            .replace(/\{\{departure\}\}/g, req.body.depart[i])
            .replace(/\{\{arrival\}\}/g, req.body.arrive[i])
            .replace(/\{\{date\}\}/g, req.body.date[i])
    }

    aa = aa.replace(/\{\{destination\}\}/, dest);
    composedRequest = composedRequest.replace(/\{\{tc\}\}/g, tc).replace(/\{\{request\}\}/g, aa);

    postData(composedRequest, function(response){

        if (!response.error) {
            res.send(response['SOAP-ENV:Envelope']['SOAP-ENV:Body']['ns1:XXTransactionResponse']['RSP']['AirAvailabilityRS']['OriginDestination']);
        } else {
            res.send({status: 400, error: response.error});
        }
    });

};

exports.price = function(req, res, next) {

    if ( _.isEmpty(req.body) ) {
        var results = {status: 400, error: 'Not enough params for searching'};
        res.status(409).json(results);
    };

    var composedRequest = body, request = flightPrice, data = req.body;

    request = request
        .replace(/\{\{airline\}\}/g, data.airline)
        .replace(/\{\{flightnumber\}\}/g, data.flightnumber)
        .replace(/\{\{classofservice\}\}/g, data.classofservice)

        .replace(/\{\{equipmentcode\}\}/g, data.equipmentcode)
        .replace(/\{\{equipmentname\}\}/g, data.equipmentname)

        .replace(/\{\{departureapt\}\}/g, data.departureapt)
        .replace(/\{\{departuredate\}\}/g, data.departuredate)
        .replace(/\{\{departuretime\}\}/g, data.departuretime)

        .replace(/\{\{arrivalapt\}\}/g, data.arrivalapt)
        .replace(/\{\{arrivaldate\}\}/g, data.arrivaldate)
        .replace(/\{\{arrivaltime\}\}/g, data.arrivaltime);

    composedRequest = composedRequest.replace(/\{\{tc\}\}/g, tc).replace(/\{\{request\}\}/g, request);

    postData(composedRequest, function(response){

        if (!response.error) {
            res.send(response['SOAP-ENV:Envelope']['SOAP-ENV:Body']['ns1:XXTransactionResponse']['RSP']['FlightPriceRS']['FareGroup']);
        } else {
            res.send({status: 400, error: response.error});
        }
    });

};

function postData (composedRequest, callback) {
    callback = callback || function(){};

    var post_options = {
        host: 'stg.farelogix.com',
        port: '443',
        path: '/xmlts/sandboxdm',
        method: 'POST',
        headers: {
            'Content-Type': 'application/xml',
            'Content-Length': Buffer.byteLength(composedRequest)
        }
    };

    var post_req = https.request(post_options, function(response) {
        var body = '';

        response.setEncoding('utf8');
        response.on('data', function (chunk) {
            body += chunk;
        });
        response.on('end', function () {
            try {
                callback(JSON.parse(xmlparser.toJson(body)));
            } catch(e) {
                console.log("Parse response error: " + e.message);
                callback({error: 'Cannot parse response'});
            }
        });

    });

    post_req.write(composedRequest);
    post_req.end();
}
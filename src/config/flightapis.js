/* global sails */
module.exports.flightapis = {
  searchApiMaxDays: 330,
  execReadEticketPeriod: 60*60*2, // 2 hours (in seconds) @IrinaKuznetsova 
  mondee: {
    commonNamespace: 'http://trippro.com/webservices/common/v2',
    baseEndPoint: 'https://onvoya.trippro.com/api/v2',
    clientId: 'CFP1017',
    providerInfo: {
      callTo: '+1 (877) 917-8453',
      pubName: 'Mondee',
      siteUrl: 'www.mondee.com'
    }
  },
  farelogix: {
    providerInfo: {
      callTo: '+1 (786) 464-8650',
      pubName: 'FareLogix',
      siteUrl: 'www.farelogix.com'
    },
    post_options: {
      host: 'api.farelogix.com',
      port: '443',
      path: '/xmlts/2e73ff29',
      method: 'POST',
      headers: {
        'Content-Type': 'application/xml'
      }
    },
    tc: {
      iden: {
        u: "Avaea",
        p: "HnCMdDzL72c7sYy4q",
        pseudocity: "AFPF",
        agt: "xmlava001",
        agtpwd: "Bg82810K",
        agtrole: "Ticketing Agent",
        agy: "05663033"
      },
      agent: {
        user: "xmlava001"
      },
      trace: 'AFPF_ava',
      script: {
        engine: "FLXDM",
        name: "avaea-dispatch.flxdm"
      }
    }
  },
  mystifly: {
    baseEndPoint: 'http://testapi.myfarebox.com/V2/OnePoint.svc',
    AccountNumber: 'MCN001022',
    Password: 'AVAEA2015_xml',
    Target: 'Test',
    UserName: 'AVAEAXML'
  },
  cheapoair: {
    commonNamespace: 'http://FpwebBox.Fareportal.com/Gateway.asmx',
    baseEndPoint: 'http://fpwebbox.fareportal.com/gateway.asmx',
    flightSearch: 'SearchFlightAvailability34',
    security: {
      WUID: 'ED88ED4D-3DE0-4B75-84C2-BDDD26FEB2EF',
      User: 'xmlfeedTest@cheapoair.com',
      Password: 'sky2@1@',
      AffiliateCode: 'xmlfeedTest_fpwebbox'
    },
    providerInfo: {
      pubName: 'FAREPORTAL INC.',
      Company: 'FAREPORTAL INC.',
      Address: '135 W 50th Street, Suite 500, New York, NY 10020',
      siteUrl: 'fpwebbox.fareportal.com'
    }
  }
};

/* global sails */
module.exports.flightapis = {
  searchApiMaxDays: 330,
  execReadEticketPeriod: 3600*24, // seconds
  mondee: {
    commonNamespace: 'http://trippro.com/webservices/common/v2',
    baseEndPoint: 'http://api.trippro.com/api/v2',
    clientId: 'CFP1017',
    providerInfo: {
      callTo: '+1 (877) 917-8453',
      pubName: 'Mondee',
      siteUrl: 'www.mondee.com'
    }
  },
  farelogix: {
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
  }
};

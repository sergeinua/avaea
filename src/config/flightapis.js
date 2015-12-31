/* global sails */
module.exports.flightapis = {
  searchProvider: 'mondee', // 'mystifly' TODO: temporary config
  mondee: {
    commonNamespace: 'http://trippro.com/webservices/common/v2',
    baseEndPoint: 'http://sandbox.trippro.com/api/v2',
    clientId: 'CFS1017'
  },
  farelogix: {
    endPoint: 'https://stg.farelogix.com/xmlts/sandboxdm',
    tc: {
      iden: {
        _attr: {
          u: "FLXtest",
          p: "dLKx6Xne",
          pseudocity: "AEO2",
          agt: "xmlava001",
          agtpwd: "3l912O8X$p",
          agtrole: "Ticketing Agent",
          agy: "05600044"
        }
      },
      agent: {
        _attr: {
          user: "xmlava001"
        }
      },
      trace: 'xmlava001',
      script: {
        _attr: {
          engine: "FLXDM",
          name: "avaea-dispatch.flxdm"
        }
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

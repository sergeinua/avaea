module.exports = {


  models: {
    connection: 'etPostgresqlServer'
  },


//  port: 80,
//  explicitHost: 'localhost',

  log: {
    level: 'verbose',
    timestamp: true
  },

  session: {
    host: '127.0.0.1',
    user: 'avaea',
    password: 'avaea',
    database: 'avaea',
    port: 5432
  },
flightapis: {
//    mondee: {
//      baseEndPoint: 'http://localhost:23456/api/v2'/*, // 'http://sandbox.trippro.com/api/v2',
//      clientId: 'CFS1017' // CFS login is not actual, CFP login is now used for both PROD and STAGE Mondee API*/
//    },
    farelogix: {
      post_options: {
        host: 'stg.farelogix.com',
        path: '/xmlts/sandboxdm'
      },
      tc: {
        iden: {
          u: "FLXtest",
          p: "dLKx6Xne",
          pseudocity: "AEO2",
          agtpwd: "3l912O8X$p",
          agy: "05600044"
        },
        trace: 'xmlava001'
      }
    }
  },



  hookTimeout: 512000,
  segmentio_key: 'xtV7Xew6UQa1scURs186FRazPcgCPcxR'
};
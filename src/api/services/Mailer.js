
module.exports = {
    sendMail: function(tplName, tplData) {

        // sails.hooks.email.send(template, data, options, cb)
        sails.hooks.email.send(
            tplName,
            tplData,
            {
                to: tplData.to,
                subject: tplData.subject
            },
            function(err) {
                if (err) {
                    sails.log.error(err);
                }
                else {
                    sails.log.info("Email is sent");
                }
            }
        );
    }
};
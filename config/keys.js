module.exports = {
    google: {
        clientID: process.env.googleKey,
        clientSecret: process.env.googleSecret,
        callbackURL: process.env.googleCb
    },
    twitter: {
        consumerKey: process.env.twitterKey,
        consumerSecret: process.env.twitterSecret,
        callbackURL: process.env.twitterCb
    },
    mongoDB: {
        uri: process.env.mongoURI
    },
    session: {
        enctryptionkey: process.env.encKey
    },
    app: {
        PORT: process.env.PORT
    }
};
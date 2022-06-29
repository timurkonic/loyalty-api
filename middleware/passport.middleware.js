import passport from 'passport';
import passportJwt from 'passport-jwt';

const passportJwtOptions = {
    jwtFromRequest: passportJwt.ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWTSECRET
}

passport.use(new passportJwt.Strategy(passportJwtOptions, function(jwt_payload, done) {
    return done(null, {id: jwt_payload.user.id});
}));

export default passport;
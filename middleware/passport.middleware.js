import passport from 'passport';
import passportJwt from 'passport-jwt';

const passportJwtOptions = {
    jwtFromRequest: passportJwt.ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWTSECRET
}

passport.use(new passportJwt.Strategy(passportJwtOptions, function(jwt_payload, done) {
    return done(null, {id: jwt_payload.user.id});
}));

const passportAuth = (req, res, next) => {
    passport.authenticate('jwt', { session: false }, (err, user, info) => {
        if (err)
            return next(err);
        if (!user )
            return res.status(401).json({error: 'unauthorised'});
        req.user = user;
        return next();
    })(req, res, next);
 }

 export default passportAuth;
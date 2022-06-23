const checkApiKey = (req, res, next) => {
    if (req.get('X-API-Key') !== process.env.APIKEY)
        res.status(401).json({error: 'unauthorised'});
    else
        next();
}

export default checkApiKey;
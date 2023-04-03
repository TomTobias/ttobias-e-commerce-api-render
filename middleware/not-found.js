const notFound = (req, res) => res.status(404).send('Route does not exist')
// notice we don't call next()...once we hit 404 we are done...no route

module.exports = notFound

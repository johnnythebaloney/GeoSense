// src/routes/countries.js
const express = require('express')
const { fetchAllCountries, getCountry } = require('../services/countryService')

const router = express.Router()

router.get('/', async (req, res, next) => {
  try {
    const { threat, region, search } = req.query
    let countries = await fetchAllCountries()

    if (threat)  countries = countries.filter(c => c.threatLevel === threat)
    if (region)  countries = countries.filter(c => c.region?.toLowerCase().includes(region.toLowerCase()))
    if (search)  countries = countries.filter(c => c.name?.toLowerCase().includes(search.toLowerCase()))

    const slim = countries.map(c => ({
      name:          c.name,
      cca2:          c.cca2,
      flagEmoji:     c.flagEmoji,
      flag:          c.flag,
      region:        c.region,
      continent:     c.continent,
      population:    c.population,
      threatLevel:   c.threatLevel,
      advisory:      c.advisory,
      conflictCount: c.conflictCount,
      coordinates:   c.coordinates,
    }))

    res.json({ countries: slim, total: slim.length })
  } catch (err) { next(err) }
})

router.get('/:name', async (req, res, next) => {
  try {
    const country = await getCountry(req.params.name)
    if (!country) return res.status(404).json({ error: 'Country not found' })
    res.json({ country })
  } catch (err) { next(err) }
})

module.exports = router

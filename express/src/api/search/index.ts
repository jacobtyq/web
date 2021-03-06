import { Videos } from '../../videos'
import { fastr } from '../../api/fastr'
import * as dayjs from 'dayjs'

export default async (req, res) => {

  if (!req.body.requests || !req.body.requests.length) {
    res.sendStatus(400)
  }

  let { query, page, refinement, sortOrder, lang, excludes } = req.body.requests[0].params

  let q = query ? query.trim().split(/\s+/).map(token => `+${token}`).join(" ") : query

  let maxHitsPerPage = 20
  let hits = fastr.search(q, refinement, sortOrder)
    .filter(hit => hit != null)

  let reducer = (stats, it) => {
    let x = dayjs(it.recordingDate * 1000).format('YYYY')
    stats.likes = (stats.likes || 0) + it.likes
    stats.views = (stats.views || 0) + it.views
    stats.stage = (stats.stage || 0) + it.duration
    stats.videos = (stats.videos || 0) + 1
    stats.timeline = (stats.timeline || {})
    stats.timeline[x] = (stats.timeline[x] || 0) + 1 
    return stats
  }
  let stats = hits.reduce(reducer, {})

  let hitsIds = hits
    .filter(hit => !lang || hit.language == lang) 
    .filter(hit => !(excludes || []).includes(hit.objectID))
    .map(hit => hit.objectID)  

  let from = (page || 0) * maxHitsPerPage
  let to = from + maxHitsPerPage
  let hitsPage = await new Videos(hitsIds.slice(from, to)).fetch()
  let nbPages = Math.ceil(hitsIds.length / maxHitsPerPage)

  res.json({
    stats: stats,
    results: [{
        hits: hitsPage,
        page: page,
        nbHits: hitsIds.length,
        nbPages: nbPages,
        hitsPerPage: maxHitsPerPage
    }]}
  )

}
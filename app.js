const express = require('express')
const cors = require('cors')
const moviesData = require('./movies.json')
const {validateMovie, validatePartialMovie} = require('./schemas/movies')

const server = express()

server.disable('x-powered-by')
server.use(express.json())//es necesario (OBLIGATORIO) si se desea acceder al req.body

const ACCEPTED_ORIGINS = ['http://localhost:8080']
server.use(cors({
  origin: (origin, callback) => {
    if (ACCEPTED_ORIGINS.includes(origin)) {
      return callback(null, true)
    }

    if (!origin) {
      return callback(null, true)
    }

    return callback(new Error('Not allowed by CORS'))
  }
}))
//PARA MÉTODOS GET / HEAD / POST solo se requiere especificar 'Access-Control-Allow-Origin'
//PERO PARA MÉTODOS PUT/PATCH/DELETE existe lo llamado CORS-FLIGHT las cuales requieren una petición especial previa llamada OPTIONS

server.get('/movies', (req, res)=>{
  console.log(req.query);

/*  const origin = req.header('origin')//esta cabezar no la envían los navegadores cuando el destino al que intentan acceder es el mismo que el origen
  if(ACCEPTED_ORIGINS.includes(origin) || !origin) {
      res.header('Access-Control-Allow-Origin', origin)
  }
   */
  
  if(req.query.genre) {
    const {genre} = req.query
    const filteredMovies = moviesData.filter((movie)=>
      movie.genre.some((g)=>g.toLowerCase()=== genre.toLowerCase())
    )
    return res.json(filteredMovies)
  }
  res.json(moviesData)
})

server.get('/movies/:id', (req, res)=>{  
  console.log(req.params);
  const {id} = req.params
  const movieById  = moviesData.find((movie)=>movie.id=== id)
  if(movieById) return res.json(movieById)  
  return res.status(404).json({message: 'Movie Not Found'})
})

server.post('/movies', (req, res)=>{  
  //validamos el input
  const result = validateMovie(req.body)
  //huno error?
  if(!result.success) {
    return res.status(400).json(JSON.parse(result.error.message))
  } 
  const newMovie = {
      id: crypto.randomUUID(),
      ...result.data
    }
  //guardamos
  moviesData.push(newMovie)
  // respondemos
  res.status(201).json(newMovie)
})
server.patch('/movies/:id', (req, res)=>{
  console.log(req.params);
  const {id} = req.params 
  const movieIndex = moviesData.findIndex((e)=>e.id === id)
  console.log(movieIndex);
  
  if(movieIndex < 0) return res.status(404).json({message : "Movie not found"}) 

  const result = validatePartialMovie(req.body)
  if(!result.success) return res.status(400).json({error : JSON.parse(result.error.message)}) 
  const updatedMovie = {...moviesData[movieIndex], ...result.data}
  moviesData[movieIndex] = updatedMovie
  res.status(202).json(updatedMovie)
})

server.delete('/movies/:id', (req, res)=>{
 /*  const origin = req.header('origin')
  if(ACCEPTED_ORIGINS.includes(origin) || !origin) {
      res.header('Access-Control-Allow-Origin', origin)
  }   */
  const {id} = req.params

  const movieIndex = moviesData.findIndex((movie)=>movie.id === id)

  if (movieIndex < 0) {
    res.status(404).json({message: 'Movie Not Found'})
  }

  moviesData.splice(movieIndex, 1)
  return res.json({message: 'Movie Deleted'})
})

/* server.options('/movies/:id', (req, res)=>{
  const origin = req.header('origin')
  if(ACCEPTED_ORIGINS.includes(origin) || !origin) {
      res.header('Access-Control-Allow-Origin', origin)
      res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE')
  }
  res.send(200)
})
 */
const PORT = process.env.PORT ?? 3000

server.listen(PORT, ()=>{
  console.log(`Corriendo servidor en http://localhost:${PORT}`);
})



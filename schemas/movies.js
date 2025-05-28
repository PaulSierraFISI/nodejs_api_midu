const z = require('zod/v4')
const {genreList} = require('../constantes.js')

const movieSchema = z.object({
  title: z.string(),
  year: z.int().min(1900).max(new Date().getFullYear()),
  director: z.string(),
  duration: z.int().positive(),
  poster: z.url(),
  genre: z.array(z.enum(genreList)),
  rate: z.number().positive().default(5)
})

function validateMovie(input){
  return movieSchema.safeParse(input)
}

function validatePartialMovie(input){
  return movieSchema.partial().safeParse(input)
}
module.exports = {validateMovie, validatePartialMovie}
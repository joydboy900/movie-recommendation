import { Application, Router } from 'https://deno.land/x/oak@v12.6.1/mod.ts';
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.7.0/+esm';
import { oakCors } from 'https://deno.land/x/cors@v1.2.2/mod.ts'; // Updated CORS import

const TMDB_API_KEY = '3c6ec703890682871f09009db1489504'; // TMDb API Key
const SUPABASE_URL = 'https://woplhuqdjytzfreesdft.supabase.co'; // Supabase Project URL
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvcGxodXFkanl0emZyZWVzZGZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjkwNzY5NDUsImV4cCI6MjA0NDY1Mjk0NX0.gpPa19Mnhis9pBNorOmVjNos4UvsGAMAvQtFVzZY2uk'; // Supabase API Key

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const app = new Application();
const router = new Router();

app.use(oakCors()); // Enable CORS for cross-origin requests

// API: Fetch trending movies from TMDb
router.get('/api/movies/trending', async (ctx) => {
  const response = await fetch(
    `https://api.themoviedb.org/3/trending/movie/week?api_key=${TMDB_API_KEY}`
  );
  const data = await response.json();
  ctx.response.body = { movies: data.results };
});

// API: Register user
router.post('/api/users/register', async (ctx) => {
  const { email } = await ctx.request.body().value;
  const { data, error } = await supabase
    .from('Users')
    .insert([{ email }]);

  if (error) {
    ctx.response.status = 400;
    ctx.response.body = { error: error.message };
  } else {
    ctx.response.status = 201;
    ctx.response.body = { user: data[0] };
  }
});

// API: Add movie to watchlist
router.post('/api/watchlist/add', async (ctx) => {
  const { user_id, movie_id, movie_title, poster_path } = await ctx.request.body().value;

  const { data, error } = await supabase
    .from('Watchlist')
    .insert([{ user_id, movie_id, movie_title, poster_path }]);

  if (error) {
    ctx.response.status = 400;
    ctx.response.body = { error: error.message };
  } else {
    ctx.response.status = 201;
    ctx.response.body = { watchlist: data[0] };
  }
});

// API: Get user watchlist
router.get('/api/watchlist/:user_id', async (ctx) => {
  const { user_id } = ctx.params;
  const { data, error } = await supabase
    .from('Watchlist')
    .select('*')
    .eq('user_id', user_id);

  if (error) {
    ctx.response.status = 400;
    ctx.response.body = { error: error.message };
  } else {
    ctx.response.body = { watchlist: data };
  }
});

app.use(router.routes());
app.use(router.allowedMethods());

app.listen({ port: 8000 });
console.log('Deno server is running on http://localhost:8000');

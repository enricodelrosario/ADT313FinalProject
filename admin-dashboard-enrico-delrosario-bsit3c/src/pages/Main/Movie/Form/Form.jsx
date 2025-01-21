import axios from 'axios';
import { useCallback, useEffect, useState, createContext, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './Form.css';


const MovieContext = createContext();

const Form = () => {
  const [query, setQuery] = useState('');
  const [searchedMovieList, setSearchedMovieList] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(undefined);
  const [movie, setMovie] = useState(undefined);
  const [title, setTitle] = useState('');
  const [overview, setOverview] = useState('');
  const [cast, setCast] = useState([]);
  const [trailers, setTrailers] = useState([]);
  const navigate = useNavigate();
  const { movieId } = useParams();
  
  const [movies, setMovies] = useState([]);

  const handleSearch = useCallback(() => {
    axios.get(`https://api.themoviedb.org/3/search/movie`, {
      params: {
        query,
        include_adult: false,
        language: 'en-US',
        page: 1,
      },
      headers: {
        Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIxYjhkNWY2ZGY4MWI5ZDIyNTQ1MGZjMGYwZmM4MzI4MyIsIm5iZiI6MTczMTA3Njg1My4wNjYsInN1YiI6IjY3MmUyMmY1ZjI4ODBkMTAwNGY2YzI1YiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.RfhOUWELjREd7m7Y_jnUKtECZlUce4OEzvEaGvh6ZAk',
      },
    }).then((response) => {
      setSearchedMovieList(response.data.results);
    });
  }, [query]);

  const handleSelectMovie = (movie) => {
    setSelectedMovie(movie);
    setTitle(movie.original_title);
    setOverview(movie.overview);
    fetchAdditionalDetails(movie.id);
  };

  const fetchAdditionalDetails = (movieId) => {
    axios.get(`https://api.themoviedb.org/3/movie/${movieId}/credits`, {
      headers: {
        Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIxYjhkNWY2ZGY4MWI5ZDIyNTQ1MGZjMGYwZmM4MzI4MyIsIm5iZiI6MTczMTA3Njg1My4wNjYsInN1YiI6IjY3MmUyMmY1ZjI4ODBkMTAwNGY2YzI1YiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.RfhOUWELjREd7m7Y_jnUKtECZlUce4OEzvEaGvh6ZAk',
      },
    }).then((response) => {
      setCast(response.data.cast.slice(0, 18));
    });

   
    axios.get(`https://api.themoviedb.org/3/movie/${movieId}/videos`, {
      headers: {
        Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIxYjhkNWY2ZGY4MWI5ZDIyNTQ1MGZjMGYwZmM4MzI4MyIsIm5iZiI6MTczMTA3Njg1My4wNjYsInN1YiI6IjY3MmUyMmY1ZjI4ODBkMTAwNGY2YzI1YiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.RfhOUWELjREd7m7Y_jnUKtECZlUce4OEzvEaGvh6ZAk',
      },
    }).then((response) => {
      const youtubeTrailers = response.data.results.filter(
        (video) => video.site === 'YouTube' && video.type === 'Trailer'
      );
      setTrailers(youtubeTrailers);
    });
  };

  const handleSave = () => {
    const accessToken = localStorage.getItem('accessToken')
    if (!selectedMovie) {
      alert('Please select a movie to save.');
      return;
    }

    const data = {
      tmdbId: selectedMovie.id,
      title: title,
      overview: overview,
      popularity: selectedMovie.popularity,
      releaseDate: selectedMovie.release_date,
      voteAverage: selectedMovie.vote_average,
      backdropPath: `https://image.tmdb.org/t/p/original/${selectedMovie.backdrop_path}`,
      posterPath: `https://image.tmdb.org/t/p/original/${selectedMovie.poster_path}`,
      isFeatured: 0,

      casts: cast.map((member) => ({
        name: member.name,
        url: member.profile_path
          ? `https://image.tmdb.org/t/p/w200${member.profile_path}`
          : null,
        characterName: member.character,
      })),

      videos: trailers.map((trailer) => ({
        url: `https://www.youtube.com/watch?v=${trailer.key}`,
        description: trailer.name,
      })),

      photos: [
        {
          url: `https://image.tmdb.org/t/p/original/${selectedMovie.poster_path}`,
          description: 'Poster Image',
        },
        {
          url: `https://image.tmdb.org/t/p/original/${selectedMovie.backdrop_path}`,
          description: 'Backdrop Image',
        },
      ],
    };



    const requestMethod = movieId ? 'PATCH' : 'POST';
    const url = movieId ? `/movies/${movieId}` : '/movies';

    axios
      .request({
        method: requestMethod,
        url: url,
        data: data,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      .then((response) => {
        console.log('Movie saved successfully:', response.data);
        alert('Movie saved successfully!');
        navigate('/main/movies');
      })
      .catch((error) => {
        console.error('Error saving movie:', error.response?.data || error.message);
        alert('An error occurred while saving the movie. Please try again.');
      });

  };

  useEffect(() => {
    if (movieId) {
      axios.get(`/movies/${movieId}`).then((response) => {
        const tempData = {
          id: response.data.tmdbId,
          original_title: response.data.title,
          overview: response.data.overview,
          popularity: response.data.popularity,
          release_date: response.data.releaseDate,
          vote_average: response.data.voteAverage,
          backdrop_path: response.data.backdropPath,
          poster_path: response.data.posterPath,
        };
        setSelectedMovie(tempData);
        setTitle(tempData.original_title);
        setOverview(tempData.overview);
        fetchAdditionalDetails(response.data.tmdbId);
      });
    }
  }, [movieId]);

  return (
    <MovieContext.Provider value={{ movies, setMovies }}>
      <h1>{movieId !== undefined ? 'Edit ' : 'Create '} Movie</h1>

      {movieId === undefined && (
        <div className="search-container">
          Search Movie:{' '}
          <input
            type="text"
            onChange={(event) => setQuery(event.target.value)}
          />
          <button type="button" onClick={handleSearch}>
            Search
          </button>
          <div className="searched-movie">
            {searchedMovieList.map((movie) => (
              <p key={movie.id} onClick={() => handleSelectMovie(movie)}>
                {movie.original_title}
              </p>
            ))}
          </div>
        </div>
      )}

      <div className="container">
        <form>
          {selectedMovie && (
            <>
              <img
                className="poster-image"
                src={`https://image.tmdb.org/t/p/original/${selectedMovie.poster_path}`}
                alt={selectedMovie.original_title}
              />
              <div className="field">
                Title:
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="field">
                Overview:
                <textarea
                  rows={10}
                  value={overview}
                  onChange={(e) => setOverview(e.target.value)}
                />
              </div>
              <div className="field">
                Popularity:
                <input
                  type="text"
                  value={selectedMovie ? selectedMovie.popularity : ''}
                  readOnly
                />
              </div>

              <div className="field">
                Release Date:
                <input
                  type="text"
                  value={selectedMovie ? selectedMovie.release_date : ''}
                  readOnly
                />
              </div>

              <div className="field">
                Vote Average:
                <input
                  type="text"
                  value={selectedMovie ? selectedMovie.vote_average : ''}
                  readOnly
                />
              </div>
            </>

          )}
        </form>
      </div>
      {cast.length > 0 && (
        <div className="cast-section">
          <h2>Cast</h2>
          <ul>
            {cast.map((member) => (
              <li key={member.id}>
                <img
                  src={`https://image.tmdb.org/t/p/w200${member.profile_path}`}
                  alt={member.name}
                  className="cast-image"
                />
                <p>{member.name} as {member.character}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {trailers.length > 0 && (
        <div className="trailer-section">
          <h2>Trailers</h2>
          {trailers.map((trailer) => (
            <iframe
              key={trailer.id}
              width="560"
              height="315"
              src={`https://www.youtube.com/embed/${trailer.key}`}
              title={trailer.name}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          ))}
        </div>
      )}

      <button type="save-button" onClick={handleSave} className="save-btn" >
        Save
      </button>
    </MovieContext.Provider>
  );
};

export const useMovieContext = () => useContext(MovieContext);



export default Form;

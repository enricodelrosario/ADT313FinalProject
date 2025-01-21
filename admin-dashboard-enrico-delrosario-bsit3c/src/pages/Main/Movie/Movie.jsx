import { Outlet } from 'react-router-dom';
import './Movie.css';

const Movie = () => {
  return (
    <div className="movie-container">
      <h1 className="movie-header">Movies</h1>
      <div className="movie-content">
        <Outlet />
      </div>
    </div>
  );
};

export default Movie;


import { useNavigate } from 'react-router-dom';
import './Lists.css';
import { useEffect, useState } from 'react';
import axios from 'axios';

const Lists = () => {
  const accessToken = localStorage.getItem('accessToken');
  const navigate = useNavigate();
  const [lists, setLists] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const getMovies = (page = 1) => {
    axios
      .get(`/movies`)
      .then((response) => {
        const movies = response.data;
        const startIndex = (page - 1) * pageSize;
        const paginatedMovies = movies.slice(startIndex, startIndex + pageSize);
        setLists(paginatedMovies);
        setTotalPages(Math.ceil(movies.length / pageSize));
      })
      .catch((error) => {
        console.error('Error fetching movies:', error);
      });
  };

  useEffect(() => {
    getMovies(currentPage);
  }, [currentPage]);

  const handleDelete = (id) => {
    const isConfirm = window.confirm('Are you sure that you want to delete this data?');
    if (isConfirm) {
      axios
        .delete(`/movies/${id}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        .then(() => {
          const tempLists = lists.filter((movie) => movie.id !== id);
          setLists(tempLists);
        })
        .catch((error) => {
          console.error('Error deleting movie:', error);
        });
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="lists-container">
      <div className="create-container">
        <button
          type="button"
          onClick={() => {
            navigate('/main/movies/form');
          }}
        >
          Create new
        </button>
      </div>
      <div className="table-container">
        <table className="movie-lists">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {lists.map((movie) => (
              <tr key={movie.id}>
                <td>{movie.id}</td>
                <td>{movie.title}</td>
                <td>
                  <button
                    type="button"
                    onClick={() => {
                      navigate('/main/movies/form/' + movie.id);
                    }}
                    className="edit-btn"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(movie.id)}
                    className="delete-btn"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="pagination-container">
        <button
          type="button"
          onClick={() => handlePageChange(currentPage - 1)}
          hidden={currentPage === 1}
        >
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          type="button"
          onClick={() => handlePageChange(currentPage + 1)}
          hidden={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Lists;

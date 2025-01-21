import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import './Main.css';

function Main() {
  const accessToken = localStorage.getItem('accessToken');
  const navigate = useNavigate();

  const handleLogout = () => {
    const confirmLogout = window.confirm('Are you sure you want to logout?'); // Ask for confirmation
    if (confirmLogout) {
      setTimeout(() => {
        localStorage.removeItem('accessToken');
        navigate('/login'); // redirect to login page after logout
      }, 2000); // 2 seconds delay before navigating
    }
  };

  useEffect(() => {
    if (!accessToken) { 
      navigate('/login'); // Redirect to login if no access token
    }
  }, [accessToken, navigate]); // Added accessToken and navigate as dependencies

  return (
    <div className='Main'>
      <div className='container'>
        <div className='navigation'>
          <ul>
          <li>
              {/* Disable navigation for Movies */}
              <a
                style={{ pointerEvents: 'none', color: 'gray', cursor: 'not-allowed' }}
                onClick={(e) => e.preventDefault()}
              >
                Movies
              </a>
            </li>
            <li>
              <a onClick={() => navigate('/home')}>Home</a>
            </li>
            {accessToken ? (
              <li className='logout'>
                <a onClick={handleLogout}>Log Out</a>
              </li>
            ) : (
              <li className='login'>
                <a onClick={() => navigate('/login')}>Login</a> 
              </li>
            )}
          </ul>
        </div>
        <div className='outlet'>
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default Main;

import { useState, useEffect, useRef } from "react";
import { useMovies } from "./useMovies.js";
import { useLocalStorageState } from "./useLocalStorageState.js";
import StarRating from "./StarRating.js";
import { useKeyPress } from "./useKeyPress.js";
const API_KEY = "6a2a72a6";

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  );
}

function Search({ query, setQuery }) {
  const inputElement = useRef(null);
  // const inputElement2 = document.querySelector(".search");

  useKeyPress("Enter", function () {
    if (document.activeElement === inputElement.current) return;
    inputElement.current.focus();
    setQuery("");
  });

  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      ref={inputElement}
    />
  );
}

function NumResults({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies?.length}</strong> results
    </p>
  );
}

function Navbar({ children }) {
  return (
    <nav className="nav-bar">
      <Logo />
      {children}
    </nav>
  );
}

function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className="box">
      <Button handleClick={setIsOpen} isOpen={isOpen} />
      {isOpen && children}
    </div>
  );
}

function MovieList({ movies, onSetSelectedMovieID }) {
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <Movie
          movie={movie}
          key={movie.imdbID}
          onSetSelectedMovieID={onSetSelectedMovieID}
        />
      ))}
    </ul>
  );
}

function Movie({ movie, onSetSelectedMovieID }) {
  return (
    <li key={movie.imdbID} onClick={() => onSetSelectedMovieID(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}

function Button({ handleClick, isOpen }) {
  return (
    <button className="btn-toggle" onClick={() => handleClick((open) => !open)}>
      {isOpen ? "–" : "+"}
    </button>
  );
}

function MovieSummary({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));

  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating.toFixed(2)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating.toFixed(2)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime} min</span>
        </p>
      </div>
    </div>
  );
}

function WatchedList({ watched, onDeleteWatchedMovie }) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchedMovie
          key={movie.imdbID}
          movie={movie}
          onDeleteWatchedMovie={onDeleteWatchedMovie}
        />
      ))}
    </ul>
  );
}

function WatchedMovie({ movie, onDeleteWatchedMovie }) {
  return (
    <li>
      <img src={movie.poster} alt={`${movie.title} poster`} />
      <h3>{movie.title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runTime} min</span>
        </p>
        <button
          className="btn-delete"
          onClick={() => onDeleteWatchedMovie(movie.imdbID)}
        >
          X
        </button>
      </div>
    </li>
  );
}

function Loader() {
  return <p className="loader">LOADING...</p>;
}

function Main({ children }) {
  return <main className="main">{children}</main>;
}

function ShowErrorMess({ message }) {
  return <p className="error">⛔{message}</p>;
}

export default function App() {
  const [query, setQuery] = useState("");
  const [selectedMovieID, setSelectedMovieID] = useState(null);

  const { movies, isLoad, errObj } = useMovies(query);
  const [watched, setWatched] = useLocalStorageState([], "watched");

  function handleSetSelectedMovieID(id) {
    setSelectedMovieID((oldID) => (oldID === id ? null : id));
  }

  function handleCloseMovieBtn() {
    setSelectedMovieID(null);
  }

  function handleSetWatched(movie) {
    setWatched((watchedList) => [...watchedList, movie]);
  }

  function handleDeleteWatchedMovie(id) {
    setWatched((watchedList) => watchedList.filter((mov) => mov.imdbID !== id));
  }

  return (
    <>
      <Navbar>
        <Search query={query} setQuery={setQuery} />
        <NumResults movies={movies} />
      </Navbar>
      <Main>
        {/* <Box element={<MovieList movies={movies} />} />
        <Box
          element={
            <>
              <MovieSummary watched={watched} />
              <WatchedList watched={watched} />
            </>
          }
        /> */}

        <Box>
          {errObj && <ShowErrorMess message={errObj} />}
          {isLoad && <Loader />}
          {!errObj & !isLoad && (
            <MovieList
              movies={movies}
              onSetSelectedMovieID={handleSetSelectedMovieID}
            />
          )}
          {/* {isLoad ? <Loader /> : <MovieList movies={movies} />} */}
        </Box>
        <Box>
          {selectedMovieID ? (
            <SelectedMovie
              watchedList={watched}
              selectedMovieID={selectedMovieID}
              onCloseMovie={handleCloseMovieBtn}
              onSetWatchedList={handleSetWatched}
            />
          ) : (
            <>
              <MovieSummary watched={watched} />
              <WatchedList
                watched={watched}
                onDeleteWatchedMovie={handleDeleteWatchedMovie}
              />
            </>
          )}
        </Box>
      </Main>
    </>
  );
}

function SelectedMovie({
  selectedMovieID,
  onCloseMovie,
  watchedList,
  onSetWatchedList,
}) {
  const [movie, setMovie] = useState({});
  const [isLoad, setIsLoad] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [isRated, setIsRated] = useState(0);

  const counterRef = useRef(0);

  const {
    Title: title,
    Year: year,
    Released: released,
    Runtime: runTime,
    Actors: actors,
    Plot: plot,
    Poster: poster,
    Genre: genre,
    Director: director,
    imdbRating,
  } = movie;

  useKeyPress("Escape", onCloseMovie);

  useEffect(
    function () {
      if (userRating) counterRef.current += 1;
    },
    [userRating]
  );

  useEffect(
    function () {
      async function fetchMovieDetail() {
        setIsLoad(true);
        setIsRated(0);

        const res = await fetch(
          `https://www.omdbapi.com/?apikey=${API_KEY}&i=${selectedMovieID}`
        );

        const data = await res.json();
        setMovie(data);
        setIsLoad(false);

        const watchedMovie = watchedList.find(
          (mov) => mov.imdbID === selectedMovieID
        );
        if (watchedMovie) {
          setIsRated(watchedMovie.userRating);
        }
      }

      fetchMovieDetail();
    },
    [selectedMovieID, watchedList]
  );

  useEffect(
    function () {
      if (!title) return;
      document.title = `MOVIE:${title}`;

      return function () {
        document.title = `usePopcorn`;
      };
    },
    [title]
  );

  function handleAdd() {
    const newWathedMovie = {
      imdbID: selectedMovieID,
      title,
      year,
      poster,
      imdbRating: Number(imdbRating),
      runTime: Number(runTime.split(" ").at(0)),
      counterUserRating: counterRef.current,
      userRating,
    };
    onSetWatchedList(newWathedMovie);
    onCloseMovie();
  }

  // if (imdbRating > 7) return <p>Hello World</p>;
  /* eslint-disable */
  // if (imdbRating > 7) [isGoodQuality, setIsQuality] = useState("");

  return (
    <div className="details">
      {isLoad ? (
        <Loader />
      ) : (
        <>
          <header>
            <button className="btn-back" onClick={onCloseMovie}>
              &larr;
            </button>
            <img src={poster} alt={`Poster of ${title}`} />
            <div className="details-overview">
              <h2>{title}</h2>
              <p>
                {released} &bull; {runTime}
              </p>
              <p>{genre}</p>
              <p>
                <span>⭐</span>
                {imdbRating} IMDb rating
              </p>
            </div>
          </header>
          <section>
            <div className="rating">
              {!isRated ? (
                <>
                  <StarRating
                    maxRating={10}
                    size={24}
                    onSetRate={setUserRating}
                  />
                  {userRating ? (
                    <button className="btn-add" onClick={handleAdd}>
                      + Add to List
                    </button>
                  ) : (
                    ""
                  )}
                </>
              ) : (
                <p>You rated with movie {isRated}</p>
              )}
            </div>
            <p>
              <em>{plot}</em>
            </p>
            <p>Starring {actors}</p>
            <p>Directed by {director}</p>
          </section>
        </>
      )}
    </div>
  );
}

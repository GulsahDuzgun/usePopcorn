import { useState, useEffect } from "react";
const API_KEY = "6a2a72a6";

export function useMovies(query) {
  const [movies, setMovies] = useState([]);
  const [isLoad, setIsLoad] = useState(false);
  const [errObj, setErrObj] = useState("");

  useEffect(
    function () {
      const controller = new AbortController();
      async function fetchMovies() {
        try {
          setIsLoad(true);
          setErrObj("");

          const res = await fetch(
            `http://www.omdbapi.com/?i=tt3896198&apikey=${API_KEY}&s=${query}`,
            { signal: controller.signal }
          );

          if (!res.ok)
            throw new Error(
              "Something went wrong. Please check your internet connection."
            );

          const data = await res.json();
          if (data.Response === "False") throw new Error("Movie not Found");

          setMovies(data.Search);
          setErrObj("");
        } catch (err) {
          if (err.name !== "AbortError") setErrObj(err.message);
        } finally {
          setIsLoad(false);
        }
      }

      if (query.trim().length < 3) {
        setErrObj("");
        setMovies([]);
        return;
      }

      fetchMovies();

      return function () {
        controller.abort();
      };
    },
    [query]
  );

  return { movies, isLoad, errObj };
}

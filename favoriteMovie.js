'use strict'
const BASE_URL = "https://movie-list.alphacamp.io"
const INDEX_URL = BASE_URL + "/api/v1/movies/"
const POSTER_URL = BASE_URL + "/posters/"
const movies = JSON.parse(localStorage.getItem("favoriteMovies")) || []
const dataPanel = document.querySelector("#data-panel")

function renderMovieList(data) {
  let rawHTML = ""

  data.forEach((item) => {
    rawHTML += `
    <div class="col-sm-3">
      <div class="mb-2">
        <div class="card">
          <img src="${POSTER_URL + item.image}" class="card-img-top" class="card-img-top"   alt="Movie Poster">
          <div class="card-body">
            <h5 class="card-title">${item.title}</h5>
          </div>
          <div class="card-footer">
            <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#movie-modal" data-id="${item.id}">More</button>
            <button class="btn btn-danger btn-remove-favorite" data-id="${item.id}">del</button>
          </div>
        </div>
      </div>
    </div>
    `
  })

  dataPanel.innerHTML = rawHTML
}

// 秀出電影資訊
function showMovieModal(id) {
  const movieTitle = document.querySelector("#movie-modal-title")
  const movieDate = document.querySelector("#movie-modal-date")
  const movieImage = document.querySelector("#movie-modal-image")
  const movieDescription = document.querySelector("#movie-modal-description")
  movieTitle.innerText = ""
  movieDate.innerText = ""
  movieDescription.innerText = ""
  movieImage.innerHTML = ""

  axios.get(INDEX_URL + id).then(response => {
    const data = response.data.results
    movieTitle.innerText = data.title
    movieDate.innerText = "Release date:" + data.release_date
    movieDescription.innerText = data.description
    movieImage.innerHTML = `<img src="${POSTER_URL + data.image}" alt="movie-poster" class="img-fluid">`
  })
}

// 刪除我的收藏
function removeFromFavorite(id) {
  if (!(movies.length)) return
  const movieIndex = movies.findIndex(movie => movie.id === id)
  if (movieIndex === -1) return // 傳入id在收藏清單中不存在
  movies.splice(movieIndex, 1)
  localStorage.setItem("favoriteMovies", JSON.stringify(movies))
  renderMovieList(movies)
}

// 點擊more的狀況
dataPanel.addEventListener("click", function onPanelClicked(event) {
  const target = event.target
  if (target.matches(".btn-show-movie")) {
    console.log(target.dataset.id)
    showMovieModal(target.dataset.id)
  } else if (target.matches(".btn-remove-favorite")) {
    removeFromFavorite(Number(target.dataset.id))
  }
})

// main process
renderMovieList(movies)
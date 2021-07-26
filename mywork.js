// 變數們
'use strict'
const BASE_URL = "https://movie-list.alphacamp.io"
const INDEX_URL = BASE_URL + "/api/v1/movies/"
const POSTER_URL = BASE_URL + "/posters/"
const dataPanel = document.querySelector("#data-panel")
const submitForm = document.querySelector("#search-form")
const searchInput = document.querySelector("#search-input")
const paginator = document.querySelector("#paginator")
let filteredMovies = []
const movies = []
const MOVIES_PER_PAGE = 12

// 新增此處
let currentPage = 1
const modeList = document.querySelector("#list-mode")
const modeCard = document.querySelector("#card-mode")
const modeChange = document.querySelector("#mode-change")

/////////////////////////////////////////////////////////////////////////////////////
// 函式們
// 分頁器的函式page -> 就回傳裡面有幾部電影的資料?
function getMoviesByPage(page) {
  const data = filteredMovies.length ? filteredMovies : movies
  const startIndex = (page - 1) * MOVIES_PER_PAGE
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}

// 要能夠改變paginator，要知道電影的數量 // 修改此處
function renderPaginator(page) {
  const data = filteredMovies.length ? filteredMovies : movies
  if (!data.length) return
  const numberOfPages = Math.ceil(data.length / MOVIES_PER_PAGE)
  let rawHTML = ""
  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page=${page}>${page}</a></li>`
  }
  paginator.innerHTML = rawHTML
  paginator.children[page - 1].classList.add('active')
}

// 渲染清單
// 卡片樣式
function renderMovieCard(data) {
  const favoriteMovies = JSON.parse(localStorage.getItem("favoriteMovies")) || []
  let rawHTML = ""
  data.forEach((item) => {
    let disabledOnOrOff = ""
    if (favoriteMovies.some(movie => movie.id === item.id)) {
      disabledOnOrOff = "disabled"
    }
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
            <button class="btn btn-info btn-add-favorite" data-id="${item.id}" ${disabledOnOrOff}>+</button>
          </div>
        </div>
      </div>
    </div>
    `
  })
  dataPanel.innerHTML = rawHTML
  modeCard.classList.add("active") // 新增此處
}

// 清單樣式
function renderMovieList(data) {
  const favoriteMovies = JSON.parse(localStorage.getItem("favoriteMovies")) || []
  let rawHTML = ""
  data.forEach(item => {
    let disabledOnOrOff = ""
    if (favoriteMovies.some(movie => movie.id === item.id)) {
      disabledOnOrOff = "disabled"
    }
    rawHTML += `
      <div class="col-12 d-flex justify-content-between border-top pt-2 pb-3">
        <h6 class="list-name">${item.title}</h6>
        <div class="button">
          <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#movie-modal"
            data-id="${item.id}">More</button>
          <button class="btn btn-info btn-add-favorite" data-id="${item.id}" ${disabledOnOrOff}>+</button>
        </div>
      </div>`
  })
  dataPanel.innerHTML = rawHTML
  modeList.classList.add("active") // 新增此處
}

// 轉換function // 修改此處
function determineMode(pageNumber) {
  if (modeList.matches(".active")) {
    renderMovieList(getMoviesByPage(pageNumber))
  }
  if (modeCard.matches(".active")) {
    renderMovieCard(getMoviesByPage(pageNumber))
  }
}

// 找尋功能修改 // 新增此處
function findTheMovies(word) {
  filteredMovies = movies.filter(movie => movie.title.toLowerCase().includes(word))
  if (filteredMovies.length === 0) {
    alert(`Cannot find movies with keyword: ${word}`)
  }
  renderPaginator(1)
  determineMode(1)
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

// 加入的favorite
function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem("favoriteMovies")) || []
  const favoriteMovie = movies.find(movie => movie.id === id)
  if (list.some(favoriteMovie => favoriteMovie.id === id)) {
    return alert("You had added it before!!")
  }
  alert("Add to Favorite")
  list.push(favoriteMovie)
  localStorage.setItem("favoriteMovies", JSON.stringify(list))
}

//////////////////////////////////////////////////////////////////////////////////
// main process
// render整個頁面
axios.get(INDEX_URL).then(response => {
  movies.push(...response.data.results)

  renderPaginator(1)
  determineMode(currentPage)

}).catch((err) => console.log(err))

// paginator的分頁監聽器
paginator.addEventListener("click", function onPaginatorClicked(event) {
  event.preventDefault()
  if (event.target.tagName !== "A") return
  currentPage = Number(event.target.dataset.page)
  determineMode(currentPage) // 新增此處
  renderPaginator(currentPage)
})

// 點擊more的狀況
dataPanel.addEventListener("click", function onPanelClicked(event) {
  const target = event.target
  if (target.matches(".btn-show-movie")) {
    showMovieModal(target.dataset.id)
  } else if (target.matches(".btn-add-favorite")) {
    target.disabled = true // 新增此處
    addToFavorite(Number(target.dataset.id))
  }
})

// 按下搜尋後
submitForm.addEventListener("submit", function onSearchFormSubmitted(event) {
  event.preventDefault()
  const keyword = searchInput.value.trim().toLowerCase()
  findTheMovies(keyword) // 新增此處
})

// 新增輸入即可查的功能 // 新增此處
submitForm.addEventListener("input", function onSearchFormInput(e) {
  const keyword = e.target.value.trim().toLowerCase()
  findTheMovies(keyword)
})

// 綁定切換鈕 // 新增此處
modeChange.addEventListener("click", function switchMode(e) {
  const modeChangeList = [...modeChange.children]
  modeChangeList.forEach(item => item.classList.remove("active"))
  if (e.target === modeList) {
    modeList.classList.add("active")
    renderMovieList(getMoviesByPage(currentPage))
  }
  if (e.target === modeCard) {
    modeCard.classList.add("active")
    renderMovieCard(getMoviesByPage(currentPage))
  }
})
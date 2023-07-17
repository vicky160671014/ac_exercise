const BASE_URL = 'https://webdev.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/movies/'
const POSTER_URL = BASE_URL + '/posters/'

const movies = [] //電影總清單
let filteredMovies = [] //搜尋清單

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')

const MOVIES_PER_PAGE = 12
let currentPage = 1 //宣告currentPage紀錄當前分頁，並確保切換模式時，分頁不會跑掉，或搜尋時分頁顯示正確

const paginator = document.querySelector('#paginator')
const modeChangeSwitch = document.querySelector('#change-mode')


function renderMovieList(data) {
  if (dataPanel.dataset.mode === 'card-mode') {
    let rawHTML = ''
    data.forEach((item) => {
      // title, image,id隨著每個item變化
      rawHTML += `<div class="col-sm-3">
    <div class="mb-2">
      <div class="card">
        <img src="${POSTER_URL + item.image}" class="card-img-top" alt="Movie Poster">
        <div class="card-body">
          <h5 class="card-title">${item.title}</h5>
        </div>
        <div class="card-footer">
          <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${item.id}">More</button>
          <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
        </div>
      </div>
    </div>
  </div>`
    })
    dataPanel.innerHTML = rawHTML
  } else if (dataPanel.dataset.mode === 'list-mode') {
    let rawHTML = '<ul class="list-group list-group-flush mb-2 col-sm-12">'
    data.forEach((item) => {
      rawHTML += `
    <li class="list-group-item d-flex justify-content-between">
        <h5 class="card-title">${item.title}</h5>
        <div>
          <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${item.id}">More</button>
          <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
        </div>
    </li>`
    })
    rawHTML += '</ul>'
    dataPanel.innerHTML = rawHTML
}  
}


function showMovieModal(id){
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')
  axios.get(INDEX_URL + id).then((response)=>{
    const data = response.data.results
    modalTitle.innerText = data.title
    modalDate.innerText = 'Release date:' + data.release_date
    modalDescription.innerText = data.description
    modalImage.innerHTML = `<img src="${POSTER_URL+data.image}" alt="movie-poster" class="img-fluid">`
  })
}

function addToFavorite(id){
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const movie = movies.find((movie)=> movie.id === id)
  if (list.some((movie) => movie.id === id)){
    return alert('此電影已經在收藏清單中！')
  }
  list.push(movie)
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
}

function giveMoviesByPage(page){
  //計算起始index
  const data = filteredMovies.length ? filteredMovies:movies
  const startIndex = (page - 1) * MOVIES_PER_PAGE
  //回傳切割後的新陣列
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}

function renderPaginator(amount){
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)

  let rawHTML = ''

  for (let page = 1; page <= numberOfPages; page++){
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page = "${page}">${page}</a></li>`
  }

  paginator.innerHTML = rawHTML
}

// 依 data-mode 切換不同的顯示方式
function changeDisplayMode (displayMode){
  if (dataPanel.dataset.mode === displayMode) return
  dataPanel.dataset.mode = displayMode
}


// 監聽切換模式事件
modeChangeSwitch.addEventListener('click', function onSwitchClicked(event) {
  if (event.target.matches('#card-mode-button')){
    changeDisplayMode('card-mode')
    renderMovieList(giveMoviesByPage(currentPage))
  } else if (event.target.matches('#list-mode-button')){
    changeDisplayMode('list-mode')
    renderMovieList(giveMoviesByPage(currentPage))
  }

})



searchForm.addEventListener('submit', function onSearchFormSubmitted(event){
  event.preventDefault()
  const keyword = searchInput.value.trim().toLowerCase()
  // let filteredMovies =[]

  // if(!keyword.length){
  //   return alert('請輸入有效字串!')
  // }

  // // 【作法一】用迴圈迭代：for-of
  // for (const movie of movies) {
  //   if(movie.title.toLowerCase().includes(keyword)){
  //     filteredMovies.push(movie)
  //   }
  // }

  // 【作法二】用條件來迭代：filter
  filteredMovies = movies.filter((movie)=> movie.title.toLowerCase().includes(keyword))

  if(filteredMovies.length === 0){
    return alert(`您輸入的關鍵字:${keyword} 沒有符合條件的電影`)
  }
  currentPage = 1
  renderPaginator(filteredMovies.length)
  renderMovieList(giveMoviesByPage(currentPage))
})


axios
  .get(INDEX_URL)
  .then((response) => {
    movies.push(...response.data.results)
    renderPaginator(movies.length)
    renderMovieList(giveMoviesByPage(currentPage))
  })
  .catch((err) => console.log(err))

  

dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-add-favorite')){
    addToFavorite(Number(event.target.dataset.id))
  }
})

paginator.addEventListener('click', function onPaginatorClicked(event){
  if(event.target.tagName !== 'A') return

  const page = Number(event.target.dataset.page)
  currentPage = page
  
  renderMovieList(giveMoviesByPage(currentPage))
})
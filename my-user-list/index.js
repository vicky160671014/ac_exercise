const BASE_URL = 'https://user-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/users/'
const users = []
let filteredUser = []
const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const USER_PER_PAGE = 12
const paginator = document.querySelector('#paginator')


function renderUserList (data){
  let rawHTML = ''
  data.forEach((item) => {
    rawHTML += `
    <div class="col-sm-3">
        <div class="mb-2">
          <div class="card">
            <img 
            src= ${item.avatar}
            class="card-img-top" 
            alt="..."
            id="user-avatar">
            <div class="card-body">
              <h5 class="card-title" id="user-name">${item.name}</h5>
            </div>
            <div class="card-footer text-muted">
              <button type="button" class="btn btn-outline-primary btn-show-user" data-bs-toggle="modal" data-bs-target="#user-modal" data-id="${item.id}">More</button>
              <button type="button" class="btn btn-outline-danger btn-add-closefriend" data-id="${item.id}">Like</button>
            </div>
          </div>
        </div>
      </div>`
    
  });

  dataPanel.innerHTML = rawHTML
}

function giveUsersByPage(page){
  const data = filteredUser.length ? filteredUser:users
  const startIndex = (page - 1) * USER_PER_PAGE 

  return data.slice(startIndex, startIndex + USER_PER_PAGE)

}

function renderPaginator (amount){
  const numberOfPages = Math.ceil(amount / USER_PER_PAGE)

  let rawHTML = ''
  for (page = 1; page <= numberOfPages; page++){
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }

  paginator.innerHTML = rawHTML
}

function showUserModal(id){
  const modalTitle = document.querySelector('#user-modal-name')
  const modalImage = document.querySelector('#user-modal-avatar')
  const modalInformation = document.querySelector('#user-modal-information')
  axios.get(INDEX_URL+id).then((response)=>{
    const data = response.data
    modalTitle.innerText = data.name + data.surname
    modalImage.innerHTML = `<img src= ${data.avatar}   alt="user-avatar" class="img-fluid" id="user-modal-image">`
    modalInformation.innerHTML = `
            <p>Email:${data.email}</p>
            <p>Gender:${data.gender}</p>
            <p>Age:${data.age}</p>
            <p>Region:${data.region}</p>
            <p>Birthday:${data.birthday}</p>`

  }) 
}

function addToClosefriend(id){
  const list = JSON.parse(localStorage.getItem('closedFriends')) || []
  const user = users.find((user) => Number(user.id) === Number(id))
  if(list.some((user)=>Number(user.id) === Number(id))){
    return alert('此朋友已加入我的最愛!')
  }
  list.push(user)
  localStorage.setItem('closedFriends',JSON.stringify(list))
}


axios.get(INDEX_URL)
  .then(function (response) {
    // handle success
    users.push(...response.data.results)
    console.log(users)
    renderPaginator(users.length)
    renderUserList(giveUsersByPage(1))
  })
  .catch(function (error) {
    // handle error
    console.log(error);
  })


dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-user')) {
    showUserModal(event.target.dataset.id)
  } else if (event.target.matches('.btn-add-closefriend')) {
    addToClosefriend(event.target.dataset.id)
  }
})

searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  event.preventDefault()
  const keyword = searchInput.value.trim().toLowerCase()
  console.log(keyword)
  filteredUser = users.filter((user) => user.name.toLowerCase().includes(keyword))

  if (filteredUser.length === 0) {
    return alert(`您輸入的關鍵字:${keyword}，沒有相關的搜尋結果`)
  }
  renderPaginator(filteredUser.length)
  renderUserList(giveUsersByPage(1))
})

paginator.addEventListener('click', function onPaginatorClicked(event){
  if(event.target.tagName !== 'A') return

  const page = Number(event.target.dataset.page)
  renderUserList(giveUsersByPage(page))
})
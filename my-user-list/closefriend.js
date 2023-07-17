const BASE_URL = 'https://user-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/users/'
const users = JSON.parse(localStorage.getItem('closedFriends')) || []
const dataPanel = document.querySelector('#data-panel')



function renderUserList(data) {
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
              <button type="button" class="btn btn-outline-danger btn-remove-closefriend" data-id="${item.id}">X</button>
            </div>
          </div>
        </div>
      </div>`

  });

  dataPanel.innerHTML = rawHTML
}

function showUserModal(id) {
  const modalTitle = document.querySelector('#user-modal-name')
  const modalImage = document.querySelector('#user-modal-avatar')
  const modalInformation = document.querySelector('#user-modal-information')
  axios.get(INDEX_URL + id).then((response) => {
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

function removeFromClosefriend(id) {
  if(!users || !users.length) return

  const userIndex = users.findIndex((user)=>Number(user.id) === Number(id))
  if(userIndex === -1) return
  
  users.splice(userIndex, 1)
  
  localStorage.setItem('closedFriends', JSON.stringify(users))
  
  renderUserList(users)
  
}



dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-user')) {
    showUserModal(event.target.dataset.id)
  } else if (event.target.matches('.btn-remove-closefriend')) {
    removeFromClosefriend(event.target.dataset.id)
  }
})


renderUserList(users)

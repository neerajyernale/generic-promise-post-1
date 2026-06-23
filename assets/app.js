const cl = console.log;
const postForm = document.getElementById('postForm');
const titleControl = document.getElementById('title');
const bodyControl = document.getElementById('body');
const userIdControl = document.getElementById('users');
const addBtn = document.getElementById('addBtn');
const updateBtn = document.getElementById('updateBtn');
const userContainer = document.getElementById('userContainer');
const spinner = document.getElementById('spinner');

function snackbar(msg,icon){
    Swal.fire({
        title:msg,
        icon:icon,
        timer:3000
    });
}

let userArr = [];
let baseURL = "https://jsonplaceholder.typicode.com";
let postUrl = `${baseURL}/posts`

function makeApiCall(methodName, api_url, body = null) {
    spinner.classList.remove('d-none');
    return new Promise((resolve, reject) => {

        let xhr = new XMLHttpRequest();

        xhr.open(methodName, api_url, true);

        
        xhr.setRequestHeader("Content-Type", "application/json");

        xhr.onload = function () {
            if (xhr.status >= 200 && xhr.status <= 299) {
                resolve(JSON.parse(xhr.response));
            } else {
                reject(xhr);
            }
        };

        xhr.onerror = function () {
            reject(xhr);
        };

        xhr.send(body ? JSON.stringify(body) : null);
    });
}


function createCrareds(arr){
    let result= ''
    arr.forEach(user=>{

        result+=`
        <div class="col-md-4 mt-3" id="${user.id}">
        <div class="card shadow h-100">
        <div class="card-header">
        <h1>${user.title}</h1>
        <h2>${user.userId}</h2>
        
        </div>
        <div class="card-body">
        <p>${user.body}</p>
        
        </div>
        <div class="card-footer d-flex justify-content-between">
        <button class="btn btn-sm shadow-sm btn-outline-primary"  onClick="onEdit(this)">Edit</button>
        <button class="btn btn-sm shadow-sm btn-outline-danger"  onClick="onRemove(this)">Remove</button>
          </div>
          </div>
        </div>`
       
    })
     userContainer.innerHTML=result;
}

function fetchUsers(){
    makeApiCall('GET',postUrl)
    .then(data =>{
        userArr = data.reverse();
        createCrareds(userArr);
        
    })
    .catch(err =>{
       snackbar("Something went wrong", "error");
    })
    .finally(()=>{
        spinner.classList.add('d-none');
    })
}
fetchUsers();


function onCreate(e) {
    e.preventDefault();

    let newObj = {
        title: titleControl.value,
        body: bodyControl.value,
        userId: userIdControl.value,
    };
        userArr.push(newObj);
    makeApiCall('POST', postUrl, newObj)
        .then(res => {
   cl(res);

    createSingle(res);
    postForm.reset();
    snackbar("Post Added Successfully", "success");
})
        .catch(err => {
            console.log(err);
            snackbar("Something went wrong", "error");
        })
         .finally(()=>{
        spinner.classList.add('d-none');
    })
        
}

function createSingle(obj){
    let div = document.createElement('div');
    div.className = 'col-md-4 mt-3';
    div.id = obj.id;
    div.innerHTML = `
        <div class="card shadow h-100">
            <div class="card-header">
                <h1>${obj.title}</h1>
                <h2>${obj.userId}</h2>
            </div>
            <div class="card-body">
                <p>${obj.body}</p>
            </div>
            <div class="card-footer d-flex justify-content-between">
                <button class="btn btn-sm shadow-sm btn-outline-primary" onClick="onEdit(this)">Edit</button>
                <button class="btn btn-sm shadow-sm btn-outline-danger" onClick="onRemove(this)">Remove</button>
            </div>
        </div>`;
    userContainer.prepend(div);
}

postForm.addEventListener('submit',onCreate);

function onRemove(ele){
     let removeId = ele.closest('.col-md-4').id
    localStorage.setItem('removeId',removeId);
    let removeUrl = `${baseURL}/posts/${removeId}`;
    Swal.fire({
  title: `Are you sure?you want to remove this post id="${removeId}`,
  text: "You won't be able to revert this!",
  icon: "warning",
  showCancelButton: true,
  confirmButtonColor: "#3085d6",
  cancelButtonColor: "#d33",
  confirmButtonText: "Yes, delete it!"
}).then((result) => {
  if (result.isConfirmed) {
    makeApiCall('DELETE',removeUrl)
    .then(res=>{
        cl(res);
        document.getElementById(removeId).remove();
        Swal.fire({
    title: "Deleted!",
    text: "The user has been deleted.",
    icon: "success"
  });
    })
    .catch(err =>{
        snackbar(err);
    })
    .finally(()=>{
        spinner.classList.add('d-none');
        
    })

  }
});
   
    
}
 function onEdit(ele){
    let editId = ele.closest('.col-md-4').id;
    localStorage.setItem('editId',editId);
    let editUrl = `${baseURL}/posts/${editId}`;
    makeApiCall('GET',editUrl,null)
    .then(res=>{
    titleControl.value = res.title;
    bodyControl.value = res.body;
    userIdControl.value = res.userId;
    addBtn.classList.add('d-none');
    updateBtn.classList.remove('d-none');
     postForm.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    })
    .catch(err=>{
        snackbar(err);
    })
    .finally(()=>{
        spinner.classList.add('d-none');
     
    })
 }

function onUpdate(e) {
    e.preventDefault()
  let updateId = localStorage.getItem('editId');
  cl(updateId);
  let updateUrl = `${baseURL}/posts/${updateId}`;
  let updateObj = {
    title: titleControl.value,
    body: bodyControl.value,
    userId: userIdControl.value
  };

  makeApiCall('PATCH', updateUrl, updateObj)
    .then(res => {
      let card = document.getElementById(updateId);
      cl(card);
      card.querySelector('.card-header h1').innerText = res.title;
      card.querySelector('.card-header h2').innerText = res.userId;
      card.querySelector('.card-body p').innerText = res.body;
      postForm.reset();

      addBtn.classList.remove('d-none');
      updateBtn.classList.add('d-none');
       card.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });
      localStorage.removeItem('editId'); 
      snackbar("Post Updated Successfully", "success");
    })
    .catch(err => {
      snackbar("Something went wrong", "error");
    }).finally(()=>{
        spinner.classList.add('d-none');
     
    })
    
}

updateBtn.addEventListener('click',onUpdate)





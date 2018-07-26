const taskInput = document.getElementById('new-task');
const addButton = document.getElementsByTagName('button')[0]; // devuelve coleccion de elementos
// console.log(addButton); // para conocer el indice del boton que necesittamos
const inCompletedTaskList = document.getElementById('incomplete-tasks');
const completedTaskList = document.getElementById('completed-tasks');

let refTask; // La dejamos vacia para abajo asignarle algo.

const init = () => {
    addButton.addEventListener('click', sendTaskFirebase); // Se agrega evento de detonar la siguiente funcion al boton
    refTask = firebase.database().ref().child('tasks'); //En la base de datos referenciamos al hijo= tasks
    getTaskOfFirebase(); // Se detona esta funcion desde que se recarga la pagina
}

const createNewTaskElement = (taskString) => {
    // console.log(taskString);

    // ↓ Creamos elementos de HTML
    const listItem = document.createElement('li');
    const checkbox = document.createElement('input'); // Checkbox
    const label = document.createElement('label');
    const editInput = document.createElement('input'); // Editar Texto
    const editButton = document.createElement('button');
    const deleteButton = document.createElement('button');

    checkbox.type = 'checkbox';
    editInput.type = 'text';

    editButton.innerHTML = 'Edit &#9998;';
    editButton.className = 'edit';
    deleteButton.innerHTML = 'Delete &#x1F5D1;';
    deleteButton.className = 'delete';

    label.innerHTML = taskString;

    listItem.appendChild(checkbox);
    listItem.appendChild(label);
    listItem.appendChild(editInput);
    listItem.appendChild(editButton);
    listItem.appendChild(deleteButton);

    return listItem;
}

const addTask = (key, taskCollection) => { // Recibe los task de firebase y crea una listas
    // console.log('key', key, 'taskCollection', taskCollection);
    // console.log(taskCollection.contenidoTask);
    const listItem = createNewTaskElement(taskCollection.contenidoTask);
    listItem.setAttribute('data-keytask', key)
    if (taskCollection.status == 'completed') {
        listItem.querySelector('input[type= checkbox]').setAttribute('checked',true)
        completedTaskList.appendChild(listItem);
    } else {
        inCompletedTaskList.appendChild(listItem);
    }
    bindTaskEvents(listItem, taskCompleted);
}

const taskCompleted = () => {
    const listItem = event.target.parentNode;
    const keyListItem = event.target.parentNode.dataset.keytask;
    const refTaskToCompleted = refTask.child(keyListItem);
    refTaskToCompleted.once('value', (snapshot) => {
      const data = snapshot.val();
    //   console.log(event.target.checked);
      if (event.target.checked) {
        completedTaskList.appendChild(listItem);
        refTaskToCompleted.update({
          status: 'completed'
        })
      } else {
        inCompletedTaskList.appendChild(listItem);
  
        refTaskToCompleted.update({
          status: 'incompleted'
        })
      }
    })
}

const bindTaskEvents = (taskListItem, checkboxEventHandle) => {
    const checkbox = taskListItem.querySelector('input[type=checkbox]');
    const editButton = taskListItem.querySelector('button.edit');
    const deleteButton = taskListItem.querySelector('button.delete');

    editButton.addEventListener('click', editTask);
    deleteButton.addEventListener('click', deleteTask);
    checkbox.addEventListener('change', checkboxEventHandle);
};

const editTask = () => {
    const listItem = event.target.parentNode;
    const keyListItem = event.target.parentNode.dataset.keytask;
    const editInput = listItem.querySelector('input[type=text]')
    const label  = listItem.querySelector('label');
    const editButton = event.target;
    const containsClass = listItem.classList.contains('editMode');
  
    const refTaskToEdit = refTask.child(keyListItem);
    refTaskToEdit.once('value', (snapshot) => {
      const data = snapshot.val();
  
      if (containsClass) {
        // console.log(containsClass, listItem);
        refTaskToEdit.update({
          contenidoTask: editInput.value
        })
        editButton.innerHTML = 'Edit';
        listItem.classList.remove('editMode');
        editInput.value = '';
      } else {
        console.log(containsClass, listItem)
        editButton.innerHTML = 'Save ';
        editInput.value = data.contenidoTask;
        listItem.classList.add('editMode')
      }
  
    })
  
};

// Boton borrar
const deleteTask = () => {
    // console.log(event.target.parentNode.dataset.keytask);
    const keyListItem = event.target.parentNode.dataset.keytask; // Obtiene el elemento que detona el evento, busca al padre, al padre y obtiene el key
    const refTaskToDelete = refTask.child(keyListItem);
    refTaskToDelete.remove();
};
// Traemos la informacion
const getTaskOfFirebase = () => {
    refTask.on('value', (snapshot) => {
      inCompletedTaskList.innerHTML = '';
      completedTaskList.innerHTML = '';
      const data = snapshot.val()
      for (let key in data) {
        addTask(key, data[key])
      }
    })
}

const sendTaskFirebase = () => {
    refTask.push({
      contenidoTask : taskInput.value,
      status : 'incompleted'
    });
    taskInput.value = '';
  }
  
window.onload = init;
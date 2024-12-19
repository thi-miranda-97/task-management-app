"use strict";

// TASK MODAL HANDLING
const addTaskButtons = document.querySelectorAll(".btn--add");
const taskFormModal = document.getElementById("taskModal");
const closeFormButton = document.getElementById("closeModal");

// TASK LIST CONTAINERS
const taskLists = {
  todo: document.querySelector(".task__list.todo"),
  doing: document.querySelector(".task__list.doing"),
  done: document.querySelector(".task__list.done"),
};

// TASK STORAGE
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

// FORM ELEMENTS
const taskForm = document.getElementById("taskForm");
const formTitle = document.getElementById("title");
const formDescription = document.getElementById("description");
const formPriority = document.getElementById("priority");
const formState = document.getElementById("state");
const formDeadline = document.getElementById("deadline");
const formHeading = document.querySelector(".head-form");
const formSubmitButton = document.querySelector(".task__form-btn");

// TRACK EDIT STATE
let isEditing = false;
let taskIndex = null;

// OPEN MODAL
addTaskButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    resetFormState();
    taskFormModal.classList.remove("hidden");
  });
});

// CLOSE MODAL
closeFormButton.addEventListener("click", () => {
  taskFormModal.classList.add("hidden");
});

// CALCULATE DAYS LEFT
function calcDays(deadline) {
  const today = new Date();
  const finishedDay = new Date(deadline);
  const timeDiff = finishedDay - today;
  const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
  return daysLeft > 0 ? `${daysLeft} days left` : "Deadline passed";
}

// SAVE TASKS TO LOCAL STORAGE
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// RENDER TASK CARDS
function renderTaskCards() {
  // Clear all task lists
  Object.values(taskLists).forEach((list) => (list.innerHTML = ""));

  // Populate tasks into corresponding lists
  tasks.forEach((task, index) => {
    const taskItem = document.createElement("li");
    taskItem.classList.add("task__item");
    taskItem.innerHTML = `
      <div class="task__item--heading">
        <h3>${task.title}</h3>
        <div class="task__item--options">
          <button class="editTaskButton">
            <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="18" height="18" viewBox="0 0 48 48">
            <path fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M18.4,21.8L32.1,8.1c2.3-2.3,6-2.1,8.1,0.4c1.8,2.2,1.5,5.5-0.5,7.5l-2.8,2.8"></path><path fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M32.5,23.3L17.9,37.8c-0.4,0.4-0.8,0.6-1.3,0.8L6.5,41.5l2.9-10.1c0.1-0.5,0.4-0.9,0.8-1.3l3.7-3.7"></path><line x1="29.1" x2="36.9" y1="11.1" y2="18.9" fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="3"></line>
            </svg>
          </button>
          <button class="deleteTaskButton">
            <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="18" height="18" viewBox="0 0 128 128">
            <path d="M 49 1 C 47.34 1 46 2.34 46 4 C 46 5.66 47.34 7 49 7 L 79 7 C 80.66 7 82 5.66 82 4 C 82 2.34 80.66 1 79 1 L 49 1 z M 24 15 C 16.83 15 11 20.83 11 28 C 11 35.17 16.83 41 24 41 L 101 41 L 101 104 C 101 113.37 93.37 121 84 121 L 44 121 C 34.63 121 27 113.37 27 104 L 27 52 C 27 50.34 25.66 49 24 49 C 22.34 49 21 50.34 21 52 L 21 104 C 21 116.68 31.32 127 44 127 L 84 127 C 96.68 127 107 116.68 107 104 L 107 40.640625 C 112.72 39.280625 117 34.14 117 28 C 117 20.83 111.17 15 104 15 L 24 15 z M 24 21 L 104 21 C 107.86 21 111 24.14 111 28 C 111 31.86 107.86 35 104 35 L 24 35 C 20.14 35 17 31.86 17 28 C 17 24.14 20.14 21 24 21 z M 50 55 C 48.34 55 47 56.34 47 58 L 47 104 C 47 105.66 48.34 107 50 107 C 51.66 107 53 105.66 53 104 L 53 58 C 53 56.34 51.66 55 50 55 z M 78 55 C 76.34 55 75 56.34 75 58 L 75 104 C 75 105.66 76.34 107 78 107 C 79.66 107 81 105.66 81 104 L 81 58 C 81 56.34 79.66 55 78 55 z"></path>
            </svg>
          </button>
        </div>
      </div>
      <p class="task__item--text">${task.description}</p>
      <div class="task__item--divider"></div>
      <div class="task__item--footer">
        <span class="priority-${task.priority.toLowerCase()}">${
      task.priority
    }</span>
        <span class="task__item--deadline">${task.daysLeft}</span>
      </div>
    `;

    // Add event listeners for edit and delete buttons
    taskItem
      .querySelector(".editTaskButton")
      .addEventListener("click", () => handleEditTask(task, index));
    taskItem
      .querySelector(".deleteTaskButton")
      .addEventListener("click", () => handleDeleteTask(index));

    taskLists[task.state].appendChild(taskItem);
  });
}

// RESET FORM TO DEFAULT STATE
function resetFormState() {
  isEditing = false;
  taskIndex = null;
  formHeading.textContent = "Add Your Project";
  formSubmitButton.textContent = "Add";
  taskForm.reset();
}

// HANDLE TASK FORM SUBMISSION
taskForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const title = formTitle.value;
  const description = formDescription.value;
  const priority = formPriority.value;
  const state = formState.value;
  const deadline = formDeadline.value;
  const daysLeft = calcDays(deadline);

  if (isEditing && taskIndex !== null) {
    // Update existing task
    tasks[taskIndex] = { title, description, priority, state, daysLeft };
  } else {
    // Add new task
    tasks.push({ title, description, priority, state, daysLeft });
  }

  // Save tasks and re-render
  saveTasks();
  renderTaskCards();

  // Reset form and close modal
  resetFormState();
  taskFormModal.classList.add("hidden");
});

// HANDLE EDIT TASK
function handleEditTask(task, index) {
  isEditing = true;
  taskIndex = index;

  // Prefill form with task details
  formTitle.value = task.title;
  formDescription.value = task.description;
  formPriority.value = task.priority;
  formState.value = task.state;
  formDeadline.value = task.deadline;

  formHeading.textContent = "Update Your Task";
  formSubmitButton.textContent = "Update";

  taskFormModal.classList.remove("hidden");
}

// HANDLE DELETE TASK
function handleDeleteTask(index) {
  tasks.splice(index, 1);
  saveTasks();
  renderTaskCards();
}

// INITIALIZE TASKS ON PAGE LOAD
document.addEventListener("DOMContentLoaded", renderTaskCards);

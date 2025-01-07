// DOM ELEMENTS
const pageLinks = document.querySelectorAll(".nav__link");
const sections = document.querySelectorAll(".section");
const stateHeadings = document.querySelectorAll(".task__state");
const addTaskButtons = document.querySelectorAll(".task__btn--add");
const taskFormModal = document.getElementById("task-modal");
const closeFormButton = document.getElementById("close-modal");
const taskForm = document.getElementById("task-form");
const formTitle = document.getElementById("title");
const formDescription = document.getElementById("description");
const formPriority = document.getElementById("priority");
const formState = document.getElementById("state");
const formDeadline = document.getElementById("deadline");
const formHeading = document.querySelector(".modal__heading");
const formSubmitButton = document.querySelector(".modal__submit-btn");
const updateDate = document.querySelector(".calendar__date-day");
const updateMonth = document.querySelector(".calendar__date-month");
const fullcurrentMonth = document.querySelector(
  ".calendar__sidebar-month-year"
);
const dateRange = document.querySelector(".calendar__sidebar-date-range");

// //////////////////////////////////////////////////////////
const sectionContainers = {
  overview: {
    todo: document.getElementById("overview-todo"),
    doing: document.getElementById("overview-doing"),
    done: document.getElementById("overview-done"),
  },
  list: {
    todo: document.getElementById("list-todo"),
    doing: document.getElementById("list-doing"),
    done: document.getElementById("list-done"),
  },
  calendar: {
    today: document.getElementById("calendar-today"),
    tomorrow: document.getElementById("calendar-tomorrow"),
  },
};

// TASK STORAGE
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let isEditing = false;
let taskIndex = null;

// UTIL FUNCTIONS
function togglePage(id) {
  sections.forEach((section) =>
    section.classList.toggle("hidden", section.id !== id)
  );
  pageLinks.forEach((link) =>
    link.classList.toggle(
      "active",
      link.getAttribute("href").replace("#", "") === id
    )
  );
  localStorage.setItem("currentPage", id);
}

function calcDays(deadline) {
  const today = new Date();
  const finishedDay = new Date(deadline);

  // Normalize both dates to midnight
  today.setHours(0, 0, 0, 0);
  finishedDay.setHours(0, 0, 0, 0);

  // Calculate the difference in days
  const daysLeft = Math.ceil((finishedDay - today) / (1000 * 60 * 60 * 24));
  return daysLeft > 0 ? `${daysLeft} days left` : "Deadline passed";
}

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function resetFormState() {
  isEditing = false;
  taskIndex = null;
  formHeading.textContent = "Add Your Task";
  formSubmitButton.textContent = "Add Task";
  taskForm.reset();
}

function createTaskCard(task, styleClass) {
  const taskCard = document.createElement("li");
  taskCard.className = `task__item ${styleClass}`;
  taskCard.innerHTML = `
    <div class="task__item-header">
      <h4>${task.title}</h4>
      <p class="task__item-description1">${task.description}</p>
      <div class="task__item-options1">
        <button class="task__btn task__btn--edit">
          <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="18" height="18" viewBox="0 0 48 48">
            <path fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M18.4,21.8L32.1,8.1c2.3-2.3,6-2.1,8.1,0.4c1.8,2.2,1.5,5.5-0.5,7.5l-2.8,2.8"></path><path fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M32.5,23.3L17.9,37.8c-0.4,0.4-0.8,0.6-1.3,0.8L6.5,41.5l2.9-10.1c0.1-0.5,0.4-0.9,0.8-1.3l3.7-3.7"></path><line x1="29.1" x2="36.9" y1="11.1" y2="18.9" fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="3"></line>
          </svg>
          </button>
          <button class="task__btn task__btn--delete">
            <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="18" height="18" viewBox="0 0 128 128">
              <path d="M 49 1 C 47.34 1 46 2.34 46 4 C 46 5.66 47.34 7 49 7 L 79 7 C 80.66 7 82 5.66 82 4 C 82 2.34 80.66 1 79 1 L 49 1 z M 24 15 C 16.83 15 11 20.83 11 28 C 11 35.17 16.83 41 24 41 L 101 41 L 101 104 C 101 113.37 93.37 121 84 121 L 44 121 C 34.63 121 27 113.37 27 104 L 27 52 C 27 50.34 25.66 49 24 49 C 22.34 49 21 50.34 21 52 L 21 104 C 21 116.68 31.32 127 44 127 L 84 127 C 96.68 127 107 116.68 107 104 L 107 40.640625 C 112.72 39.280625 117 34.14 117 28 C 117 20.83 111.17 15 104 15 L 24 15 z M 24 21 L 104 21 C 107.86 21 111 24.14 111 28 C 111 31.86 107.86 35 104 35 L 24 35 C 20.14 35 17 31.86 17 28 C 17 24.14 20.14 21 24 21 z M 50 55 C 48.34 55 47 56.34 47 58 L 47 104 C 47 105.66 48.34 107 50 107 C 51.66 107 53 105.66 53 104 L 53 58 C 53 56.34 51.66 55 50 55 z M 78 55 C 76.34 55 75 56.34 75 58 L 75 104 C 75 105.66 76.34 107 78 107 C 79.66 107 81 105.66 81 104 L 81 58 C 81 56.34 79.66 55 78 55 z"></path>
            </svg>
          </button>
      </div>
    </div>
    <p class="task__item-description2">${task.description}</p>
    <div class="task__item-divider"></div>
    <div class="task__item-footer">
      <span class="task__item-priority task__priority--${task.priority.toLowerCase()}">${
    task.priority
  }</span>
        <span class="task__item-deadline">${task.daysLeft}</span>
    </div>

    <div class="task__item-options2">
        <button class="task__btn task__btn--edit">
          <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="18" height="18" viewBox="0 0 48 48">
            <path fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M18.4,21.8L32.1,8.1c2.3-2.3,6-2.1,8.1,0.4c1.8,2.2,1.5,5.5-0.5,7.5l-2.8,2.8"></path><path fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M32.5,23.3L17.9,37.8c-0.4,0.4-0.8,0.6-1.3,0.8L6.5,41.5l2.9-10.1c0.1-0.5,0.4-0.9,0.8-1.3l3.7-3.7"></path><line x1="29.1" x2="36.9" y1="11.1" y2="18.9" fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="3"></line>
          </svg>
          </button>
          <button class="task__btn task__btn--delete">
            <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="18" height="18" viewBox="0 0 128 128">
              <path d="M 49 1 C 47.34 1 46 2.34 46 4 C 46 5.66 47.34 7 49 7 L 79 7 C 80.66 7 82 5.66 82 4 C 82 2.34 80.66 1 79 1 L 49 1 z M 24 15 C 16.83 15 11 20.83 11 28 C 11 35.17 16.83 41 24 41 L 101 41 L 101 104 C 101 113.37 93.37 121 84 121 L 44 121 C 34.63 121 27 113.37 27 104 L 27 52 C 27 50.34 25.66 49 24 49 C 22.34 49 21 50.34 21 52 L 21 104 C 21 116.68 31.32 127 44 127 L 84 127 C 96.68 127 107 116.68 107 104 L 107 40.640625 C 112.72 39.280625 117 34.14 117 28 C 117 20.83 111.17 15 104 15 L 24 15 z M 24 21 L 104 21 C 107.86 21 111 24.14 111 28 C 111 31.86 107.86 35 104 35 L 24 35 C 20.14 35 17 31.86 17 28 C 17 24.14 20.14 21 24 21 z M 50 55 C 48.34 55 47 56.34 47 58 L 47 104 C 47 105.66 48.34 107 50 107 C 51.66 107 53 105.66 53 104 L 53 58 C 53 56.34 51.66 55 50 55 z M 78 55 C 76.34 55 75 56.34 75 58 L 75 104 C 75 105.66 76.34 107 78 107 C 79.66 107 81 105.66 81 104 L 81 58 C 81 56.34 79.66 55 78 55 z"></path>
            </svg>
          </button>
      </div>
  `;

  return taskCard;
}

function renderSection(state, section, styleClass) {
  section.innerHTML = ""; // Clear the section before rendering
  let filteredTasks = [];

  if (state === "today" || state === "tomorrow") {
    // For calendar section, filter tasks by "today" or "tomorrow"
    filteredTasks = tasks.filter((task) => {
      const today = new Date();

      const taskDeadline = new Date(task.deadline);
      const taskDay = taskDeadline.getDate();
      const taskMonth = taskDeadline.getMonth();
      const taskYear = taskDeadline.getFullYear();

      if (state === "today") {
        // Check if the task's deadline is today
        return (
          taskYear === today.getFullYear() &&
          taskMonth === today.getMonth() &&
          taskDay === today.getDate()
        );
      } else if (state === "tomorrow") {
        // Check if the task's deadline is tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(today.getDate() + 1);

        return (
          taskYear === tomorrow.getFullYear() &&
          taskMonth === tomorrow.getMonth() &&
          taskDay === tomorrow.getDate()
        );
      }
      return false;
    });
  } else {
    // For other states (todo, doing, done), filter by the state
    filteredTasks = tasks.filter((task) => task.state === state);
  }

  if (filteredTasks.length === 0) {
    section.innerHTML = `<p class="no-task-message">No task available, please add your task.</p>`;
    return;
  }

  const stateColors = {
    todo: "#e0bcf7",
    doing: "#fbe2aa",
    done: "#bfecff",
  };

  filteredTasks.forEach((task, index) => {
    const taskCard = createTaskCard(task, styleClass);

    // Apply background color only for calendar sections (today or tomorrow)
    if (state === "today" || state === "tomorrow") {
      taskCard.style.backgroundColor = stateColors[task.state];
    }

    taskCard.querySelectorAll(".task__btn--edit").forEach((editButton) => {
      editButton.addEventListener("click", () => handleEditTask(task, index));
    });
    taskCard.querySelectorAll(".task__btn--delete").forEach((deleteButton) => {
      deleteButton.addEventListener("click", () => handleDeleteTask(index));
    });

    section.appendChild(taskCard);
  });
}

function renderAllSections() {
  // Render for both "overview" and "list" pages
  Object.keys(sectionContainers).forEach((page) => {
    Object.keys(sectionContainers[page]).forEach((state) => {
      renderSection(
        state,
        sectionContainers[page][state],
        `task__item--${page}` // Correct style class for each section
      );
    });
  });
}

function handleEditTask(task, index) {
  isEditing = true;
  taskIndex = index;
  formTitle.value = task.title;
  formDescription.value = task.description;
  formPriority.value = task.priority;
  formState.value = task.state;
  formDeadline.value = task.deadline;
  formHeading.textContent = "Update Your Task";
  formSubmitButton.textContent = "Update Task";
  taskFormModal.classList.remove("hidden");
}

function handleDeleteTask(index) {
  tasks.splice(index, 1);
  saveTasks();
  renderAllSections();
}

// EVENT LISTENERS
pageLinks.forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    togglePage(link.getAttribute("href").replace("#", ""));
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const savedPage = localStorage.getItem("currentPage");
  togglePage(savedPage || pageLinks[0].getAttribute("href").replace("#", ""));
  renderAllSections();
});

stateHeadings.forEach((col) => {
  const stateCol = col.textContent;
  col.style.backgroundColor =
    {
      "Not Started": "#e0bcf7",
      "In Progress": "#fbe2aa",
      Completed: "#bfecff",
    }[stateCol] || "transparent";
});

addTaskButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    resetFormState();
    taskFormModal.classList.remove("hidden");
  });
});

closeFormButton.addEventListener("click", () => {
  taskFormModal.classList.add("hidden");
});

taskForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const task = {
    title: formTitle.value,
    description: formDescription.value,
    priority: formPriority.value,
    state: formState.value,
    deadline: formDeadline.value,
    daysLeft: calcDays(formDeadline.value),
  };

  if (isEditing && taskIndex !== null) {
    tasks[taskIndex] = task;
  } else {
    tasks.push(task);
  }

  saveTasks();
  renderAllSections();
  resetFormState();

  taskFormModal.classList.add("hidden");
});

//////////////////////////////////////////////
// Get references to the DOM elements
const calendarTitle = document.querySelector(".calendar__header-title");
const calendarGrid = document.querySelector(".calendar__grid");
const prevButton = document.querySelector(".calendar__header-btn--prev");
const nextButton = document.querySelector(".calendar__header-btn--next");

// Variables for the current date
let currentDate = new Date();

// Display the current day
updateDate.textContent =
  currentDate.getDate() < 10
    ? "0" + currentDate.getDate()
    : currentDate.getDate();

// Display the current month (first three letters, in uppercase)
updateMonth.textContent = currentDate
  .toLocaleString("default", { month: "long" })
  .toUpperCase()
  .slice(0, 3);

// Display full current month and year
fullcurrentMonth.textContent = `${currentDate.toLocaleString("default", {
  month: "long",
})} ${currentDate.getFullYear()}`;

// Calculate and display the date range
const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
const lastDay = new Date(
  currentDate.getFullYear(),
  currentDate.getMonth() + 1,
  0
);

dateRange.textContent = `${firstDay.toLocaleString("default", {
  month: "short",
})} ${firstDay.getDate()}, ${firstDay.getFullYear()} - ${lastDay.toLocaleString(
  "default",
  { month: "short" }
)} ${lastDay.getDate()}, ${lastDay.getFullYear()}`;

//////////////////////////////////////////////////////////////////////
function renderCalendar() {
  // Clear the grid
  calendarGrid.innerHTML = "";

  // Get the current month and year
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // Update first and last day of the current month
  const firstDay = new Date(currentYear, currentMonth, 1);
  const lastDay = new Date(currentYear, currentMonth + 1, 0);

  // Set the calendar title
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  calendarTitle.textContent = `${monthNames[currentMonth]} ${currentYear}`;

  // Calculate and display the date range
  dateRange.textContent = `${firstDay.toLocaleString("default", {
    month: "short",
  })} ${firstDay.getDate()}, ${firstDay.getFullYear()} - ${lastDay.toLocaleString(
    "default",
    { month: "short" }
  )} ${lastDay.getDate()}, ${lastDay.getFullYear()}`;

  // Get the day of the week the month starts on
  const startDay = firstDay.getDay();

  // Render empty cells for the days before the first day
  for (let i = 0; i < startDay; i++) {
    const emptyCell = document.createElement("div");
    emptyCell.classList.add("calendar__day", "calendar__day--empty");
    calendarGrid.appendChild(emptyCell);
  }

  // Render days of the current month
  for (let day = 1; day <= lastDay.getDate(); day++) {
    const dayCell = document.createElement("div");
    dayCell.classList.add("calendar__day");
    dayCell.textContent = day;

    // Highlight the current day
    const today = new Date();
    if (
      day === today.getDate() &&
      currentMonth === today.getMonth() &&
      currentYear === today.getFullYear()
    ) {
      dayCell.classList.add("calendar__day-today");
    }

    // Filter tasks for the current day
    const dayTasks = tasks.filter((task) => {
      const taskDate = new Date(task.deadline);
      console.log(taskDate);
      return (
        taskDate.getDate() === day &&
        taskDate.getMonth() === currentMonth &&
        taskDate.getFullYear() === currentYear
      );
    });

    // If there are tasks, add counters for states
    if (dayTasks.length > 0) {
      const taskCounter = document.createElement("div");
      taskCounter.classList.add("calendar__task-counter");

      // Count tasks by state
      const taskStates = {
        todo: 0,
        doing: 0,
        done: 0,
      };

      dayTasks.forEach((task) => {
        if (taskStates[task.state] !== undefined) {
          taskStates[task.state]++;
        }
      });

      // Append counters with background colors for each state
      for (const [state, count] of Object.entries(taskStates)) {
        if (count > 0) {
          const stateCounter = document.createElement("div");
          stateCounter.classList.add(
            "calendar__task-state",
            `calendar__task-state--${state}`
          );
          stateCounter.textContent = count;

          // Apply styles (color coding for each state)
          const stateColors = {
            todo: "#e0bcf7", // Light purple
            doing: "#fbe2aa", // Light yellow
            done: "#bfecff", // Light blue
          };
          stateCounter.style.backgroundColor = stateColors[state];

          taskCounter.appendChild(stateCounter);
        }
      }

      dayCell.appendChild(taskCounter);
    }

    calendarGrid.appendChild(dayCell);
  }
}

// Event listeners for navigation buttons
prevButton.addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar();
});

nextButton.addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar();
});

// Initialize the calendar
renderCalendar();

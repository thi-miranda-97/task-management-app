"strict mode";

// TOGGLE PAGES
const pageLinks = document.querySelectorAll(".navigation__pages-link");
const taskContainer = document.querySelectorAll(".task-container");
const overviewPage = document.getElementById("overview");

// Overview default page
document.addEventListener("DOMContentLoaded", () => {
  if (!taskContainer || taskContainer.length === 0) {
    console.log("Task container can't be found.");
    return;
  }
  // Move between pages
  pageLinks.forEach((page) => {
    // Remove active class from all links
    page.classList.remove("active");

    // Check if the link's href matches the current pathname
    if (page.href.includes(window.location.pathname)) {
      page.classList.add("active");
    }
  });
});

// Filter Task by Priority

// Filter Task by State

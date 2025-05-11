const baseURL = "https://fir-demo-de05f-default-rtdb.asia-southeast1.firebasedatabase.app";
const booksURL = `${baseURL}/books.json`;

let books = [];
let filters = JSON.parse(localStorage.getItem("filters")) || { genre: "", available: "" };
let sortKey = localStorage.getItem("sortKey") || "";
let currentPage = parseInt(localStorage.getItem("currentPage")) || 1;
let booksPerPage = parseInt(localStorage.getItem("booksPerPage")) || 5;

document.getElementById("genreFilter").value = filters.genre;
document.getElementById("availabilityFilter").value = filters.available;
document.getElementById("sortBooks").value = sortKey;
document.getElementById("booksPerPage").value = booksPerPage;

document.getElementById("genreFilter").addEventListener("change", (e) => {
  filters.genre = e.target.value;
  currentPage = 1;
  saveState();
  renderBooks();
});

document.getElementById("availabilityFilter").addEventListener("change", (e) => {
  filters.available = e.target.value;
  currentPage = 1;
  saveState();
  renderBooks();
});

document.getElementById("sortBooks").addEventListener("change", (e) => {
  sortKey = e.target.value;
  saveState();
  renderBooks();
});

document.getElementById("booksPerPage").addEventListener("change", (e) => {
  booksPerPage = parseInt(e.target.value);
  currentPage = 1;
  saveState();
  renderBooks();
});

async function fetchBooks() {
  try {
    const res = await fetch(booksURL);
    const data = await res.json();
    books = Object.values(data || {});
    renderBooks();
  } catch (error) {
    console.error("Error fetching books:", error);
  }
}

function filterBooks(data) {
  return data.filter(book => {
    const matchGenre = !filters.genre || book.genre === filters.genre;
    const matchAvailable = filters.available === "" || book.available.toString() === filters.available;
    return matchGenre && matchAvailable;
  });
}

function sortBooks(data) {
  if (sortKey === "title" || sortKey === "author") {
    return data.sort((a, b) => a[sortKey].localeCompare(b[sortKey]));
  }
  if (sortKey === "publishedYear") {
    return data.sort((a, b) => b.publishedYear - a.publishedYear);
  }
  return data;
}

function paginate(data) {
  const start = (currentPage - 1) * booksPerPage;
  return data.slice(start, start + booksPerPage);
}

function renderBooks() {
  const filtered = filterBooks(books);
  const sorted = sortBooks(filtered);
  const paginated = paginate(sorted);

  const container = document.getElementById("booksContainer");
  container.innerHTML = "";

  if (paginated.length === 0) {
    container.innerHTML = "<p>No books found.</p>";
    return;
  }

  paginated.forEach(book => {
    const card = document.createElement("div");
    card.className = "book-card";
    card.innerHTML = `
      <strong>${book.title}</strong><br>
      Author: ${book.author}<br>
      Genre: ${book.genre}<br>
      Year: ${book.publishedYear}<br>
      Available: ${book.available ? "Yes" : "No"}
    `;
    container.appendChild(card);
  });
}

function saveState() {
  localStorage.setItem("filters", JSON.stringify(filters));
  localStorage.setItem("sortKey", sortKey);
  localStorage.setItem("currentPage", currentPage);
  localStorage.setItem("booksPerPage", booksPerPage);
}

function prevPage() {
  if (currentPage > 1) {
    currentPage--;
    saveState();
    renderBooks();
  }
}

function nextPage() {
  const totalPages = Math.ceil(filterBooks(books).length / booksPerPage);
  if (currentPage < totalPages) {
    currentPage++;
    saveState();
    renderBooks();
  }
}

fetchBooks();

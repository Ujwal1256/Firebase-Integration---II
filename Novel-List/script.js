// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
  orderBy,
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

// TODO: Replace with your Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyCOVdm3CScPHNMRKCKy37oelM525d53EsE",
  authDomain: "blockuser-bfbbe.firebaseapp.com",
  databaseURL: "https://blockuser-bfbbe-default-rtdb.firebaseio.com",
  projectId: "blockuser-bfbbe",
  storageBucket: "blockuser-bfbbe.firebasestorage.app",
  messagingSenderId: "88809092078",
  appId: "1:88809092078:web:9087145b75116623c614ff",
  measurementId: "G-B0298MB42K"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// DOM Elements
const searchInput = document.getElementById("searchInput");
const yearFilter = document.getElementById("yearFilter");
const sortPrice = document.getElementById("sortPrice");
const novelList = document.getElementById("novelList");

// Fetch and render novels
async function fetchNovels() {
  let q = collection(db, "novels");

  // Apply filters
  const filters = [];

  const selectedYear = yearFilter.value;
  if (selectedYear) {
    filters.push(where("release_year", "==", parseInt(selectedYear)));
  }

  // Apply sorting
  const sortOption = sortPrice.value;
  if (sortOption === "asc") {
    filters.push(orderBy("price", "asc"));
  } else if (sortOption === "desc") {
    filters.push(orderBy("price", "desc"));
  }

  // Build query
  let novelQuery = query(q, ...filters);

  try {
    const querySnapshot = await getDocs(novelQuery);
    let novels = [];
    querySnapshot.forEach((doc) => {
      novels.push({ id: doc.id, ...doc.data() });
    });

    // Apply search filter
    const searchTerm = searchInput.value.toLowerCase();
    if (searchTerm) {
      novels = novels.filter(
        (novel) =>
          novel.title.toLowerCase().includes(searchTerm) ||
          novel.author.toLowerCase().includes(searchTerm)
      );
    }

    renderNovels(novels);
  } catch (error) {
    console.error("Error fetching novels:", error);
  }
}

// Render novels to the DOM
function renderNovels(novels) {
  novelList.innerHTML = "";

  if (novels.length === 0) {
    novelList.innerHTML = "<p>No novels found.</p>";
    return;
  }

  novels.forEach((novel) => {
    const novelItem = document.createElement("div");
    novelItem.className = "novel-item";
    novelItem.innerHTML = `
      <h3>${novel.title}</h3>
      <p><strong>Author:</strong> ${novel.author}</p>
      <p><strong>Price:</strong> $${novel.price.toFixed(2)}</p>
      <p><strong>Release Year:</strong> ${novel.release_year}</p>
      <p><strong>Genre:</strong> ${novel.genre}</p>
    `;
    novelList.appendChild(novelItem);
  });
}

// Event listeners
searchInput.addEventListener("input", fetchNovels);
yearFilter.addEventListener("change", fetchNovels);
sortPrice.addEventListener("change", fetchNovels);

// Initial fetch
fetchNovels();

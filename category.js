const baseUrl = "http://localhost:8080/categories";
const categoryMap = new Map(); // Stores id -> category object

function previewImage() {
  const imageUrl = document.getElementById("addImageLink").value;
  const preview = document.getElementById("imagePreview");
  preview.style.display = imageUrl.trim() ? "block" : "none";
  preview.src = imageUrl.trim();
}

window.onload = getAllCategories;

// * new
async function getAllCategories() {
  const res = await fetch(baseUrl);
  const data = await res.json();
  document.getElementById(
    "categoryCount"
  ).textContent = `Total Categories: ${data.length}`;

  const tableBody = document.getElementById("categoryTableBody");
  tableBody.innerHTML = "";
  categoryMap.clear();

  data.forEach((cat) => {
    // Store in map
    categoryMap.set(cat.id, cat);

    const row = document.createElement("tr");
    row.innerHTML = `
        <td class="cell-name">${cat.name}</td>
        <td class="cell-image">
    <div class="image-container">
  <img src="${cat.imagelink || ""}"
      alt="${cat.name}"
      loading="lazy"
      onerror="this.onerror=null;this.src='https://dummyimage.com/100x100/cccccc/000000&text=No+Image';">

      <div class="image-loader"></div>
    </div>
  </td>
        <td class="cell-status">
          <span class="status-badge ${cat.published ? "published" : "draft"}">
            ${cat.published ? "Published" : "Draft"}
          </span>
        </td>
        <td class="cell-actions">
          <div class="action-buttons">
            <button class="edit-btn" onclick="handleEditClick(${
              cat.id
            })">Edit</button>
            <button class="delete-btn" onclick="deleteCategory(${
              cat.id
            })">Delete</button>
          </div>
        </td>
      `;
    tableBody.appendChild(row);

    const img = row.querySelector(".image-container img");
    const container = row.querySelector(".image-container");
    container.classList.add("loading");

    if (img.complete) {
      img.classList.add("loaded");
      container.classList.remove("loading");
    } else {
      img.addEventListener("load", () => {
        img.classList.add("loaded");
        container.classList.remove("loading");
      });
      img.addEventListener("error", () => {
        // img.src = "placeholder.jpg";
        img.classList.add("loaded");
        container.classList.remove("loading");
      });
    }
  });
}

// * till above
function openAddModal() {
  document.getElementById("addModal").style.display = "flex";
}

function closeAddModal() {
  document.getElementById("addModal").style.display = "none";
  document.getElementById("addForm").reset();
  document.getElementById("addDescription").innerHTML = "";
  document.getElementById("imagePreview").style.display = "none";
}

function openEditModal(
  id,
  name,
  description,
  searchkeywords,
  imagelink,
  seotitle,
  seodescription,
  seokeywords
) {
  document.getElementById("editId").value = id;
  document.getElementById("editName").value = name;
  document.getElementById("editDescription").value = description;
  document.getElementById("editSearchKeywords").value = searchkeywords;
  document.getElementById("editImageLink").value = imagelink;
  document.getElementById("editSeoTitle").value = seotitle;
  document.getElementById("editSeoKeywords").value = seokeywords;
  document.getElementById("editDescription").value = seodescription;
  document.getElementById("editModal").style.display = "flex";
}
function handleEditClick(id) {
  const cat = categoryMap.get(id);
  if (!cat) return alert("Category not found!");
  editCategory(cat);
}

function editCategory(cat) {
  document.getElementById("editId").value = cat.id;
  document.getElementById("editName").value = cat.name;
  document.getElementById("editDescription").value = cat.description;
  document.getElementById("editSearchKeywords").value = cat.searchkeywords;
  document.getElementById("editImageLink").value = cat.imagelink;
  document.getElementById("editSeoTitle").value = cat.seotitle;
  document.getElementById("editSeoKeywords").value = cat.seokeywords;
  document.getElementById("editSeoDescription").value = cat.seodescription;

  // Fix radio button
  document.querySelector(
    `input[name="editStatus"][value="${cat.published ? "PUBLISHED" : "DRAFT"}"]`
  ).checked = true;

  document.getElementById("editModal").style.display = "flex";
}

document
  .getElementById("editForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const id = document.getElementById("editId").value;
    const name = document.getElementById("editName").value;
    const description = document.getElementById("editDescription").value;
    const searchkeywords = document.getElementById("editSearchKeywords").value;
    const imagelink = document.getElementById("editImageLink").value;
    const seotitle = document.getElementById("editSeoTitle").value;
    const seokeywords = document.getElementById("editSeoKeywords").value;
    const seodescription = document.getElementById("editSeoDescription").value;

    const statusValue = document.querySelector(
      'input[name="editStatus"]:checked'
    ).value;
    const published = statusValue === "PUBLISHED"; // Convert to boolean

    const categoryData = {
      name,
      description,
      searchkeywords,
      imagelink,
      seotitle,
      seokeywords,
      seodescription,
      published, // boolean value
    };

    await fetch(`${baseUrl}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(categoryData),
    });
    console.log("Submitting category data:", categoryData);
    closeEditModal();
    getAllCategories();
  });

document
  .getElementById("addForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();
    const name = document.getElementById("addName").value.trim();
    const description = document
      .getElementById("addDescription")
      .innerHTML.trim();
    const searchkeywords = document
      .getElementById("addSearchKeywords")
      .value.trim();
    const imagelink = document.getElementById("addImageLink").value.trim();
    const seotitle = document.getElementById("addSeoTitle").value.trim();
    const seokeywords = document.getElementById("addSeoKeywords").value.trim();
    const seodescription = document
      .getElementById("addSeoDescription")
      .value.trim();
    const publishStatus = document.querySelector(
      'input[name="publishStatus"]:checked'
    );

    await fetch(baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        description,
        searchkeywords,
        imagelink,
        seotitle,
        seokeywords,
        seodescription,
        isPublished: publishStatus,
      }),
    });

    closeAddModal();
    getAllCategories();
  });

function closeEditModal() {
  document.getElementById("editModal").style.display = "none";
  document.getElementById("editForm").reset();
}
async function deleteCategory(id) {
  const confirmDelete = confirm(
    "Are you sure you want to delete this category?"
  );
  if (!confirmDelete) return;
  await fetch(`${baseUrl}/${id}`, { method: "DELETE" });
  getAllCategories();
}

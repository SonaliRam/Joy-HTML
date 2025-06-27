const baseUrl = "http://localhost:8080/categories";

function previewImage() {
  const imageUrl = document.getElementById("addImageLink").value;
  const preview = document.getElementById("imagePreview");
  preview.style.display = imageUrl.trim() ? "block" : "none";
  preview.src = imageUrl.trim();
}

window.onload = getAllCategories;

async function getAllCategories() {
  const res = await fetch(baseUrl);
  const data = await res.json();
  document.getElementById(
    "categoryCount"
  ).textContent = `Total Categories: ${data.length}`;
  const tableBody = document.getElementById("categoryTableBody");
  tableBody.innerHTML = "";

  data.forEach((cat) => {
    const row = document.createElement("tr");
    row.innerHTML = `
            <td>${cat.name}</td>
            <td>${cat.description}</td>
            <td class="action-buttons">
                <button onclick="openEditModal(${cat.id})" class="edit-btn">Edit</button>
              <button class="delete-btn"  onclick="deleteCategory(${cat.id})"> Delete
              </button>
            </td>
          `;
    tableBody.appendChild(row);
  });
}

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

const baseUrl = "http://localhost:8080/products";
const subcategoryUrl = "http://localhost:8080/subcategories";

let allSubcategories = [];
let selectedSubcategoryIds = [];
let quill;

window.onload = () => {
  loadSubcategories();
  document.addEventListener("click", handleOutsideClick);
  document.getElementById("openAddProductModal").onclick = openAddProductModal;
  document
    .getElementById("addProductForm")
    .addEventListener("submit", handleAddProductSubmit);

  // Initialize Quill for rich description
  quill = new Quill("#productDescriptionEditor", {
    theme: "snow",
    placeholder: "Write product description...",
    modules: {
      toolbar: [
        [{ header: [1, 2, false] }],
        ["bold", "italic", "underline"],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ align: [] }],
        ["clean"],
      ],
    },
  });
};

function openAddProductModal() {
  document.getElementById("addProductModal").style.display = "flex";
}

function closeAddProductModal() {
  document.getElementById("addProductModal").style.display = "none";
  document.getElementById("addProductForm").reset();
  document.getElementById("mainImagePreview").style.display = "none";
  resetSubcategorySelector();
  document.getElementById("variantsContainer").innerHTML = "";
  document.getElementById("colorImageContainer").style.display = "none";
  document.getElementById("colorImageContainer").innerHTML = "";
  quill.setContents([]);
}

function previewMainImage() {
  const url = document.getElementById("mainImage").value;
  const img = document.getElementById("mainImagePreview");

  if (url && url !== "undefined") {
    img.src = url;
    img.style.display = "inline";
    img.style.width = "200px"; // ✅ set width
    img.style.height = "150px"; // ✅ set height
    img.style.objectFit = "cover"; // optional: to avoid distortion
  } else {
    img.style.display = "none";
  }
}

function showProductCount(count) {
  const countElement = document.getElementById("productCount");
  if (countElement) {
    countElement.textContent = `Total Products: ${count}`;
  }
}

function addVariantRow() {
  const container = document.getElementById("variantsContainer");
  const div = document.createElement("div");
  div.classList.add("variantRow");
  div.innerHTML = `
    <select required>
      <option value="">Select Option Name</option>
      <option value="Color">Color</option>
      <option value="Size">Size</option>
      <option value="Material">Material</option>
      <option value="Others">Others</option>
    </select>
    <input type="text" placeholder="Enter option values comma-separated" required />
  `;
  container.appendChild(div);
}

function toggleColorImageSection() {
  const container = document.getElementById("colorImageContainer");
  container.style.display = "block";
  addColorImageRow();
}

function addColorImageRow() {
  const container = document.getElementById("colorImageContainer");
  const row = document.createElement("div");
  row.className = "colorImageRow";
  row.style.display = "flex";
  row.style.alignItems = "center";
  row.style.gap = "10px";
  row.style.marginBottom = "10px";

  const colorInputId = `colorInput-${Date.now()}`;

  row.innerHTML = `
    <div style="display: flex; align-items: center; gap: 6px;">
      <input type="color" id="${colorInputId}"  value="#000000" required style="width: 30px; height: 30px; border: none; padding: 0; cursor: pointer;" />
      <span id="${colorInputId}-code" style="font-size: 14px; min-width: 60px; display: inline-block;">#000000</span>
    </div>
    <input type="url" placeholder="Paste image URL" required class="input-field" style="flex: 1;" />
  `;

  container.appendChild(row);

  const colorInput = document.getElementById(colorInputId);
  const colorCode = document.getElementById(`${colorInputId}-code`);
  colorInput.addEventListener("input", () => {
    colorCode.textContent = colorInput.value;
  });
}

function toggleSubcategoryDropdown() {
  const dropdown = document.getElementById("subcategoryDropdownList");
  dropdown.style.display =
    dropdown.style.display === "block" ? "none" : "block";
}

function handleOutsideClick(e) {
  const dropdown = document.getElementById("subcategoryDropdownList");
  const customSelect = document.querySelector(".subcategory-multi-select");
  if (!customSelect.contains(e.target)) {
    dropdown.style.display = "none";
  }
}

async function loadSubcategories() {
  try {
    const res = await fetch(subcategoryUrl);
    if (!res.ok) throw new Error("Failed to load subcategories");
    allSubcategories = await res.json();
    const dropdownList = document.getElementById("subcategoryDropdownList");

    dropdownList.innerHTML = allSubcategories
      .map(
        (sub) => `
          <div class="dropdown-item" data-id="${sub.id}" onclick="selectSubcategory(${sub.id}, '${sub.name}')"
            style="padding: 6px; cursor: pointer; border-bottom: 1px solid #eee;">${sub.name}</div>
        `
      )
      .join("");
  } catch (err) {
    console.error("Error loading subcategories:", err);
  }
}

function selectSubcategory(id, name) {
  if (selectedSubcategoryIds.includes(id)) return;

  selectedSubcategoryIds.push(id);

  const tag = document.createElement("span");
  tag.classList.add("tag");
  tag.style.cssText =
    "background: #e0e0e0; padding: 4px 8px; margin: 2px; border-radius: 5px; display: flex; align-items: center;";
  tag.setAttribute("data-id", id);
  tag.innerHTML = `
    ${name}
    <span style="margin-left: 6px; cursor: pointer;" onclick="removeSubcategory(${id})">❌</span>
  `;
  document.getElementById("selectedSubcategories").appendChild(tag);
}

function removeSubcategory(id) {
  selectedSubcategoryIds = selectedSubcategoryIds.filter((sid) => sid !== id);
  const tag = document.querySelector(
    `#selectedSubcategories span[data-id="${id}"]`
  );
  if (tag) tag.remove();
}

function resetSubcategorySelector() {
  selectedSubcategoryIds = [];
  document.getElementById("selectedSubcategories").innerHTML = "";
}

async function handleAddProductSubmit(e) {
  e.preventDefault();

  const variantsMap = Object.fromEntries(
    Array.from(document.querySelectorAll("#variantsContainer .variantRow")).map(
      (row) => {
        const optionName = row.querySelector("select").value.trim();
        const optionValues = row.querySelector("input").value.trim();
        return [optionName, optionValues];
      }
    )
  );

  const colorImages = Object.fromEntries(
    Array.from(
      document.querySelectorAll("#colorImageContainer .colorImageRow")
    ).map((row) => {
      const color = row.querySelectorAll("input")[0].value;
      const url = row.querySelectorAll("input")[1].value;
      return [color, url];
    })
  );

  const tagsInput = document.getElementById("productTags").value.trim();
  const tags = tagsInput ? tagsInput.split(",").map((t) => t.trim()) : [];

  const product = {
    name: document.getElementById("productName").value,
    description: quill.root.innerHTML,
    size: document.getElementById("productSize").value,
    mainimage: document.getElementById("mainImage").value,
    filter: document.getElementById("productFilter").value,
    producttags: tags,
    metatitle: document.getElementById("metaTitle").value,
    metadescription: document.getElementById("metaDescription").value,
    pagekeywords: document.getElementById("pageKeywords").value,
    ispublished: (() => {
      const value = document.querySelector(
        'input[name="ispublished"]:checked'
      )?.value;
      console.log("📤 Submitting ispublished (raw radio):", value); // ✅
      return value === "true";
    })(),
    variation: Object.keys(variantsMap).length > 0 ? "true" : "false",
    variantsMap: variantsMap,
    colorimages: colorImages,
    subcategories: selectedSubcategoryIds.map((id) => ({ id })),
  };

  console.log("📦 Final product object:", product); // ✅

  const productId = document
    .getElementById("addProductForm")
    .getAttribute("data-id");

  await fetch(`${baseUrl}${productId ? "/" + productId : ""}`, {
    method: productId ? "PUT" : "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(product),
  });

  document.getElementById("addProductForm").removeAttribute("data-id");
  loadProducts();
  closeAddProductModal();
}

async function loadProducts() {
  try {
    const res = await fetch(baseUrl);
    if (!res.ok) throw new Error("Failed to load products");
    const data = await res.json();
    showProductCount(data.length);
    const tbody = document.getElementById("productTableBody");
    tbody.innerHTML = "";

    data.forEach((product) => {
      const tr = document.createElement("tr");

      const statusBadge = product.ispublished
        ? `<span class="status-badge done">Published</span>`
        : `<span class="status-badge not-done">Draft</span>`;

      const subcategories = product.subcategories
        .map((sub) => sub.name)
        .join(", ");

      const categoriesSet = new Set();
      product.subcategories.forEach((sub) => {
        sub.categories?.forEach((cat) => categoriesSet.add(cat.name));
      });

      const categories = Array.from(categoriesSet).join(", ");

      tr.innerHTML = `
        <td>${product.name}</td>
        <td class="cell-image">
          <div class="image-container">
            <img src="${product.mainimage || ""}"
                 alt="Product Image"
                 loading="lazy"
                 onerror="this.onerror=null;this.src='https://dummyimage.com/100x100/cccccc/000000&text=No+Image';">
            <div class="image-loader"></div>
          </div>
        </td>
        <td>${categories || "-"}</td>
        <td>${subcategories || "-"}</td>
        <td>${statusBadge}</td>
        <td>
        <a href="addproductmodel.html" style="text-decoration: none; color: white;">
          <button class="action-btn edit-btn" onclick="editProduct(${
            product.id
          })"> Edit</button></a>
          <button class="action-btn delete-btn" onclick="deleteProduct(${
            product.id
          })">Delete</button>
        </td>
      `;

      tbody.appendChild(tr);

      // Add image loading effect just like category
      const img = tr.querySelector(".image-container img");
      const container = tr.querySelector(".image-container");
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
          img.classList.add("loaded");
          container.classList.remove("loading");
        });
      }
    });
  } catch (err) {
    console.error("Error loading products:", err);
  }
}

async function editProduct(id) {
  // ✅ Redirect to form page with the product ID in the URL
  window.location.href = `addproductmodel.html?id=${id}`;
  try {
    const res = await fetch(`${baseUrl}/${id}`);
    if (!res.ok) throw new Error("Failed to fetch product");

    const product = await res.json();
    console.log("🛠 Edit mode: ispublished from backend →", product.ispublished); // ✅

    document.getElementById("productName").value = product.name;
    document.getElementById("productSize").value = product.size;
    document.getElementById("mainImage").value =
      product.mainImage || product.mainimage;
    previewMainImage();
    document.getElementById("productFilter").value = product.filter || "";
    document.getElementById("productTags").value =
      product.producttags?.join(", ") || "";
    document.getElementById("metaTitle").value = product.metatitle;
    document.getElementById("metaDescription").value = product.metadescription;
    document.getElementById("pageKeywords").value = product.pagekeywords;

    document.querySelector(
      `input[name="ispublished"][value="${product.ispublished}"]`
    ).checked = true;

    quill.root.innerHTML = product.description || "";
    resetSubcategorySelector();
    product.subcategories?.forEach((sub) =>
      selectSubcategory(sub.id, sub.name)
    );

    document.getElementById("variantsContainer").innerHTML = "";
    if (product.variation === "true" && product.variantsMap) {
      Object.entries(product.variantsMap).forEach(
        ([optionName, optionValues]) => {
          const div = document.createElement("div");
          div.classList.add("variantRow");
          div.innerHTML = `
      <select required>
        <option value="">Select Option Name</option>
        <option value="Color" ${
          optionName === "Color" ? "selected" : ""
        }>Color</option>
        <option value="Size" ${
          optionName === "Size" ? "selected" : ""
        }>Size</option>
        <option value="Material" ${
          optionName === "Material" ? "selected" : ""
        }>Material</option>
        <option value="Others" ${
          optionName === "Others" ? "selected" : ""
        }>Others</option>
      </select>
      <input type="text" value="${optionValues}" required />
    `;
          document.getElementById("variantsContainer").appendChild(div);
        }
      );
    }

    document.getElementById("colorImageContainer").innerHTML = "";
    if (product.colorimages) {
      document.getElementById("colorImageContainer").style.display = "block";
      Object.entries(product.colorimages).forEach(([color, url]) => {
        const row = document.createElement("div");
        row.className = "colorImageRow";
        const colorInputId = `colorInput-${Date.now()}`;
        row.innerHTML = `
          <div style="display: flex; align-items: center; gap: 6px;">
            <input type="color" id="${colorInputId}" value="${color}" required style="width: 30px; height: 30px; border: none;" />
            <span id="${colorInputId}-code" style="font-size: 14px;">${color}</span>
          </div>
          <input type="url" value="${url}" required class="input-field" style="flex: 1;" />
        `;
        document.getElementById("colorImageContainer").appendChild(row);
        const colorInput = document.getElementById(colorInputId);
        const colorCode = document.getElementById(`${colorInputId}-code`);
        colorInput.addEventListener("input", () => {
          colorCode.textContent = colorInput.value;
        });
      });
    }

    document
      .getElementById("addProductForm")
      .setAttribute("data-id", product.id);
    openAddProductModal();
  } catch (err) {
    console.error("Error editing product:", err);
  }
}

async function deleteProduct(id) {
  if (!confirm("Are you sure you want to delete this product?")) return;

  try {
    const res = await fetch(`${baseUrl}/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete product");
    loadProducts();
  } catch (err) {
    console.error("Error deleting product:", err);
  }
}

loadProducts();

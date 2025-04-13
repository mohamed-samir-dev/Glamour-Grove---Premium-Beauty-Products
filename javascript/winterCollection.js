document.addEventListener("DOMContentLoaded", function () {
  // Initialize Winter Collection functionality after DOM is fully loaded
  initWinterCollection();

  function initWinterCollection() {
    const winterSection = document.getElementById("Winter");
    if (!winterSection) return;

    // Select essential elements inside the Winter section
    const productsGrid = winterSection.querySelector(".products-grid");
    const productItems = winterSection.querySelectorAll(".product-item");
    const categoryButtons = winterSection.querySelectorAll(".category-btn");
    const sortSelect = document.getElementById("sort-select-winter");
    const showMoreBtn = document.getElementById("winter-show-more-btn");
    const resultsCountSpan = winterSection.querySelector(".results-count span");

    // Configuration constants
    const INITIAL_PRODUCTS_TO_SHOW = 8;
    const PRODUCTS_PER_LOAD = 4;
    let currentlyShownProducts = INITIAL_PRODUCTS_TO_SHOW;

    // Initial setup
    updateProductCount();
    initializeProductDisplay();

    // Handle category filter buttons
    categoryButtons.forEach((button) => {
      button.addEventListener("click", function () {
        // Set active category button
        categoryButtons.forEach((btn) => btn.classList.remove("active"));
        this.classList.add("active");

        // Filter by selected category
        const category = this.getAttribute("data-category");
        filterProductsByCategory(category);

        // Reset state for pagination
        currentlyShownProducts = INITIAL_PRODUCTS_TO_SHOW;
        updateProductVisibility();
        updateShowMoreButton();
        updateProductCount();
      });
    });

    // Handle sorting dropdown
    if (sortSelect) {
      sortSelect.addEventListener("change", function () {
        const sortValue = this.value;
        sortProducts(sortValue);
        updateProductVisibility();
        updateProductCount();
      });
    }

    // Handle "Show More" button click
    if (showMoreBtn) {
      showMoreBtn.addEventListener("click", function () {
        loadMoreProducts();
        updateProductCount();
        updateShowMoreButton();
      });
    }

    // Handle "Add to Cart" buttons
    const addToCartButtons = winterSection.querySelectorAll(".add-to-cart");
    addToCartButtons.forEach((button) => {
      button.addEventListener("click", function () {
        const productId = this.getAttribute("data-product-id");
        const productTitle =
          this.closest(".product-details").querySelector(
            ".product-title"
          ).textContent;
        const productPrice = extractPrice(this.closest(".product-item"));

        addToCart(productId, productTitle, productPrice);
        updateCartCount();
        createSimpleNotification(`${productTitle} added to cart!`);
      });
    });

    // Handle Wishlist buttons (heart icon)
    const wishlistButtons = winterSection.querySelectorAll(".wishlist-btn");
    wishlistButtons.forEach((button) => {
      button.addEventListener("click", function () {
        const heartIcon = this.querySelector("i");
        const productTitle =
          this.closest(".product-details").querySelector(
            ".product-title"
          ).textContent;

        heartIcon.classList.toggle("far");
        heartIcon.classList.toggle("fas");

        if (heartIcon.classList.contains("fas")) {
          createSimpleNotification(`${productTitle} added to wishlist!`);
        } else {
          createSimpleNotification(`${productTitle} removed from wishlist!`);
        }
      });
    });

    // === Helper Functions ===

    // Show initial set of products
    function initializeProductDisplay() {
      productItems.forEach((product, index) => {
        product.style.display = index >= INITIAL_PRODUCTS_TO_SHOW ? "none" : "";
      });
      updateShowMoreButton();
    }

    // Filter products by category
    function filterProductsByCategory(category) {
      productItems.forEach((product) => {
        const productCategory = product.getAttribute("data-category");
        if (category === "all" || productCategory === category) {
          product.classList.remove("category-hidden");
        } else {
          product.classList.add("category-hidden");
        }
      });
    }

    // Sort products by selected option
    function sortProducts(sortValue) {
      const productsArray = Array.from(productItems);

      productsArray.sort((a, b) => {
        const aHidden = a.classList.contains("category-hidden");
        const bHidden = b.classList.contains("category-hidden");

        if (aHidden && !bHidden) return 1;
        if (!aHidden && bHidden) return -1;
        if (aHidden && bHidden) return 0;

        const priceA = extractPrice(a);
        const priceB = extractPrice(b);

        if (sortValue === "price-low") return priceA - priceB;
        if (sortValue === "price-high") return priceB - priceA;

        return productsArray.indexOf(a) - productsArray.indexOf(b);
      });

      productsArray.forEach((product) => {
        productsGrid.appendChild(product);
      });
    }

    // Extract price from product element
    function extractPrice(productElement) {
      const priceElement = productElement.querySelector(".product-price");
      if (!priceElement) return 0;

      const priceText = priceElement.textContent.trim();
      const salePrice = priceText.match(/\$(\d+\.\d+)$/);
      const regularPrice = priceText.match(/\$(\d+\.\d+)/);

      return salePrice
        ? parseFloat(salePrice[1])
        : regularPrice
        ? parseFloat(regularPrice[1])
        : 0;
    }

    // Show/hide products based on current state
    function updateProductVisibility() {
      let visibleCount = 0;

      productItems.forEach((product) => {
        const isHiddenByCategory =
          product.classList.contains("category-hidden");

        if (!isHiddenByCategory) {
          product.style.display =
            visibleCount < currentlyShownProducts ? "" : "none";
          visibleCount++;
        } else {
          product.style.display = "none";
        }
      });
    }

    // Load more products for current category
    function loadMoreProducts() {
      currentlyShownProducts += PRODUCTS_PER_LOAD;
      updateProductVisibility();
    }

    // Show or hide the "Show More" button
    function updateShowMoreButton() {
      const activeCategory = getActiveCategory();
      let totalVisible = 0;

      productItems.forEach((product) => {
        const productCategory = product.getAttribute("data-category");
        if (activeCategory === "all" || productCategory === activeCategory) {
          totalVisible++;
        }
      });

      showMoreBtn.style.display =
        totalVisible <= currentlyShownProducts ? "none" : "block";
    }

    // Update the visible results counter
    function updateProductCount() {
      const activeCategory = getActiveCategory();
      let totalVisible = 0;
      let currentlyShown = 0;

      productItems.forEach((product) => {
        const productCategory = product.getAttribute("data-category");
        if (activeCategory === "all" || productCategory === activeCategory) {
          totalVisible++;
          if (product.style.display !== "none") {
            currentlyShown++;
          }
        }
      });

      resultsCountSpan.textContent = `${currentlyShown} of ${totalVisible} products`;
    }

    // Get currently active category
    function getActiveCategory() {
      const activeButton = winterSection.querySelector(".category-btn.active");
      return activeButton ? activeButton.getAttribute("data-category") : "all";
    }

    // Add product to localStorage cart
    function addToCart(productId, productTitle, productPrice) {
      let cart = JSON.parse(localStorage.getItem("cart")) || [];

      const existingProductIndex = cart.findIndex(
        (item) => item.id === productId
      );

      if (existingProductIndex > -1) {
        cart[existingProductIndex].quantity += 1;
      } else {
        cart.push({
          id: productId,
          title: productTitle,
          price: productPrice,
          quantity: 1,
        });
      }

      localStorage.setItem("cart", JSON.stringify(cart));
    }

    // Update cart item count display
    function updateCartCount() {
      const cart = JSON.parse(localStorage.getItem("cart")) || [];
      const totalItems = cart.reduce((total, item) => total + item.quantity, 0);

      const cartCountElement = document.querySelector(".cart-count");
      if (cartCountElement) {
        cartCountElement.textContent = totalItems;
      }
    }

    // Create and display temporary notification
    function createSimpleNotification(message) {
      let notificationContainer = document.querySelector(
        ".winter-notification-container"
      );

      if (!notificationContainer) {
        notificationContainer = document.createElement("div");
        notificationContainer.className = "winter-notification-container";
        Object.assign(notificationContainer.style, {
          position: "fixed",
          bottom: "20px",
          right: "20px",
          zIndex: "1000",
        });
        document.body.appendChild(notificationContainer);
      }

      const notification = document.createElement("div");
      notification.className = "winter-notification";
      notification.textContent = message;

      Object.assign(notification.style, {
        backgroundColor: "#333",
        color: "white",
        padding: "12px 20px",
        marginTop: "10px",
        borderRadius: "4px",
        boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
        opacity: "1",
        transition: "opacity 0.5s ease",
      });

      notificationContainer.appendChild(notification);

      setTimeout(() => {
        notification.style.opacity = "0";
        setTimeout(() => {
          notification.remove();
        }, 500);
      }, 3000);
    }
  }

  // Inject basic styles including hidden category support and button styles
  const style = document.createElement("style");
  style.textContent = `
        .category-hidden {
            display: none !important;
        }

        .winter-category-filters {
            display: flex;
            justify-content: center;
            margin: 20px 0 30px;
            flex-wrap: wrap;
        }

        .category-btn {
            background-color: #f8f8f8;
            border: 1px solid #ddd;
            color: #333;
            padding: 10px 20px;
            margin: 0 8px 10px;
            border-radius: 4px;
            cursor: pointer;
            font-family: 'Poppins', sans-serif;
            font-size: 14px;
            transition: all 0.3s ease;
        }

        .category-btn:hover {
            background-color: #f0f0f0;
        }

        .category-btn.active {
            background-color: #333;
            color: white;
            border-color: #333;
        }
    `;
  document.head.appendChild(style);
});

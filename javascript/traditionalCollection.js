document.addEventListener("DOMContentLoaded", function () {
  // Traditional Collection specific JavaScript
  initTraditionalCollection();

  function initTraditionalCollection() {
    const traditionalSection = document.getElementById("Traditional");
    if (!traditionalSection) return;

    // Elements
    const productsGrid = traditionalSection.querySelector(".products-grid");
    const productItems = traditionalSection.querySelectorAll(".product-item");
    const categoryButtons =
      traditionalSection.querySelectorAll(".category-btn");
    const sortSelect = document.getElementById("sort-select-traditional");
    const showMoreBtn = document.getElementById("traditional-show-more-btn");
    const resultsCountSpan = traditionalSection.querySelector(
      ".results-count span"
    );

    // Constants
    const INITIAL_PRODUCTS_TO_SHOW = 8;
    const PRODUCTS_PER_LOAD = 4;
    let currentlyShownProducts = INITIAL_PRODUCTS_TO_SHOW;

    // Initialize
    updateProductCount();
    initializeProductDisplay();

    // Category filter functionality
    categoryButtons.forEach((button) => {
      button.addEventListener("click", function () {
        // Update active button
        categoryButtons.forEach((btn) => btn.classList.remove("active"));
        this.classList.add("active");

        // Filter products
        const category = this.getAttribute("data-category");
        filterProductsByCategory(category);

        // Reset show more
        currentlyShownProducts = INITIAL_PRODUCTS_TO_SHOW;
        updateProductVisibility();
        updateShowMoreButton();
        updateProductCount();
      });
    });

    // Sorting functionality
    if (sortSelect) {
      sortSelect.addEventListener("change", function () {
        const sortValue = this.value;
        sortProducts(sortValue);
        updateProductVisibility();
        updateProductCount();
      });
    }

    // Show More button functionality
    if (showMoreBtn) {
      showMoreBtn.addEventListener("click", function () {
        loadMoreProducts();
        updateProductCount();
        updateShowMoreButton();
      });
    }

    // Add to cart functionality
    const addToCartButtons =
      traditionalSection.querySelectorAll(".add-to-cart");
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

    // Wishlist functionality
    const wishlistButtons =
      traditionalSection.querySelectorAll(".wishlist-btn");
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

    // Helper Functions
    function initializeProductDisplay() {
      productItems.forEach((product, index) => {
        if (index >= INITIAL_PRODUCTS_TO_SHOW) {
          product.style.display = "none";
        }
      });
      updateShowMoreButton();
    }

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

    function sortProducts(sortValue) {
      const productsArray = Array.from(productItems);

      productsArray.sort((a, b) => {
        // Skip sorting for hidden products
        const aHidden = a.classList.contains("category-hidden");
        const bHidden = b.classList.contains("category-hidden");

        if (aHidden && !bHidden) return 1;
        if (!aHidden && bHidden) return -1;
        if (aHidden && bHidden) return 0;

        const priceA = extractPrice(a);
        const priceB = extractPrice(b);

        if (sortValue === "price-low") {
          return priceA - priceB;
        } else if (sortValue === "price-high") {
          return priceB - priceA;
        }

        // Default to original order for 'featured'
        return productsArray.indexOf(a) - productsArray.indexOf(b);
      });

      // Re-append products in sorted order
      productsArray.forEach((product) => {
        productsGrid.appendChild(product);
      });
    }

    function extractPrice(productElement) {
      const priceElement = productElement.querySelector(".product-price");
      if (!priceElement) return 0;

      const priceText = priceElement.textContent.trim();

      // Check for sale price (format: <span class="original-price">$149.99</span> $119.99)
      const salePrice = priceText.match(/\$(\d+\.\d+)$/);
      if (salePrice) {
        return parseFloat(salePrice[1]);
      }

      // Regular price (format: $189.99)
      const regularPrice = priceText.match(/\$(\d+\.\d+)/);
      if (regularPrice) {
        return parseFloat(regularPrice[1]);
      }

      return 0;
    }

    function updateProductVisibility() {
      let visibleCount = 0;

      productItems.forEach((product) => {
        const isHiddenByCategory =
          product.classList.contains("category-hidden");

        if (!isHiddenByCategory) {
          if (visibleCount < currentlyShownProducts) {
            product.style.display = "";
          } else {
            product.style.display = "none";
          }
          visibleCount++;
        } else {
          product.style.display = "none";
        }
      });
    }

    function loadMoreProducts() {
      const activeCategory = getActiveCategory();
      let visibleCount = 0;
      let shownCount = 0;

      productItems.forEach((product) => {
        const productCategory = product.getAttribute("data-category");
        const matchesCategory =
          activeCategory === "all" || productCategory === activeCategory;

        if (matchesCategory) {
          visibleCount++;
          if (visibleCount <= currentlyShownProducts) {
            shownCount++;
          }
        }
      });

      currentlyShownProducts += PRODUCTS_PER_LOAD;
      updateProductVisibility();
    }

    function updateShowMoreButton() {
      const activeCategory = getActiveCategory();
      let totalVisible = 0;

      productItems.forEach((product) => {
        const productCategory = product.getAttribute("data-category");
        if (activeCategory === "all" || productCategory === activeCategory) {
          totalVisible++;
        }
      });

      if (totalVisible <= currentlyShownProducts) {
        showMoreBtn.style.display = "none";
      } else {
        showMoreBtn.style.display = "block";
      }
    }

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

    function getActiveCategory() {
      const activeButton = traditionalSection.querySelector(
        ".category-btn.active"
      );
      return activeButton ? activeButton.getAttribute("data-category") : "all";
    }

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

    function updateCartCount() {
      const cart = JSON.parse(localStorage.getItem("cart")) || [];
      const totalItems = cart.reduce((total, item) => total + item.quantity, 0);

      const cartCountElement = document.querySelector(".cart-count");
      if (cartCountElement) {
        cartCountElement.textContent = totalItems;
      }
    }

    function createSimpleNotification(message) {
      let notificationContainer = document.querySelector(
        ".traditional-notification-container"
      );
      if (!notificationContainer) {
        notificationContainer = document.createElement("div");
        notificationContainer.className = "traditional-notification-container";

        Object.assign(notificationContainer.style, {
          position: "fixed",
          bottom: "20px",
          right: "20px",
          zIndex: "1000",
        });

        document.body.appendChild(notificationContainer);
      }

      const notification = document.createElement("div");
      notification.className = "traditional-notification";
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

  // Add CSS for category-hidden class and category buttons
  const style = document.createElement("style");
  style.textContent = `
        .category-hidden {
            display: none !important;
        }
        
        .traditional-category-filters {
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



document.addEventListener("DOMContentLoaded", function () {
    // Configuration
    const productsPerPage = 4; // Number of products to show initially and add each time
    
    // Get the Gym Collection elements
    const gymCollection = document.getElementById("Gym");
    if (!gymCollection) return; // Exit if Gym collection doesn't exist
    
    const gymProductsGrid = gymCollection.querySelector('.products-grid[data-collection="gym"]');
    const showMoreBtn = gymCollection.querySelector(".show-more-btn");
    const sortSelect = gymCollection.querySelector("#sort-select-gym");
    const resultsCountSpan = gymCollection.querySelector(".results-count span");
    
    // Exit if elements don't exist
    if (!gymProductsGrid || !showMoreBtn) return;
    
    // Get all products and store original order
    const allProducts = Array.from(gymProductsGrid.querySelectorAll(".product-item"));
    const originalOrder = [...allProducts];
    let filteredProducts = [...allProducts]; // Start with all products
    let currentlyShown = 0;
    
    // Initialize product count
    updateProductCount();
    
    // Initially hide products beyond the initial count
    showInitialProducts();
    
    // Add filter buttons dynamically based on product categories
    addFilterButtons();
    
    // Add event listeners
    showMoreBtn.addEventListener("click", showMoreProducts);
    
    if (sortSelect) {
      sortSelect.addEventListener("change", sortProducts);
    }
    
    // FUNCTIONS
    
    // Update the product count display
    function updateProductCount() {
      if (resultsCountSpan) {
        resultsCountSpan.textContent = `${filteredProducts.length} products`;
      }
    }
    
    // Show initial set of products
    function showInitialProducts() {
      // First hide all products
      allProducts.forEach((product) => {
        product.style.display = "none";
      });
      
      // Then show only the first batch of filtered products
      for (
        let i = 0;
        i < Math.min(productsPerPage, filteredProducts.length);
        i++
      ) {
        filteredProducts[i].style.display = "";
      }
      
      // Update currently shown count
      currentlyShown = Math.min(productsPerPage, filteredProducts.length);
      
      // Update show more button visibility
      updateShowMoreButton();
    }
    
    // Show more products when button is clicked
    function showMoreProducts() {
      // Show the next batch of products
      for (
        let i = currentlyShown;
        i < Math.min(currentlyShown + productsPerPage, filteredProducts.length);
        i++
      ) {
        filteredProducts[i].style.display = "";
        
        // Add fade-in animation
        filteredProducts[i].classList.add("fade-in");
        setTimeout(() => {
          filteredProducts[i].classList.remove("fade-in");
        }, 500);
      }
      
      // Update currently shown count
      currentlyShown = Math.min(
        currentlyShown + productsPerPage,
        filteredProducts.length
      );
      
      // Update show more button visibility
      updateShowMoreButton();
    }
    
    // Update show more button visibility
    function updateShowMoreButton() {
      if (filteredProducts.length <= currentlyShown) {
        showMoreBtn.style.display = "none";
      } else {
        showMoreBtn.style.display = "";
      }
    }
    
    // Sort products based on selected option
    function sortProducts() {
      const sortValue = sortSelect.value;
      filteredProducts.sort((a, b) => {
        // Get prices (handle sale prices)
        const getPriceValue = (product) => {
          const priceElement = product.querySelector(".product-price");
          const text = priceElement.innerText.trim();
          // If there's a sale price, get the current price (last number)
          const matches = text.match(/\$(\d+\.\d+)/g);
          if (matches && matches.length > 1) {
            return parseFloat(matches[matches.length - 1].replace("$", ""));
          }
          return parseFloat(text.replace("$", ""));
        };
        
        const priceA = getPriceValue(a);
        const priceB = getPriceValue(b);
        
        if (sortValue === "price-low") {
          return priceA - priceB;
        } else if (sortValue === "price-high") {
          return priceB - priceA;
        } else {
          // Featured - return to original order
          return originalOrder.indexOf(a) - originalOrder.indexOf(b);
        }
      });
      
      // Reorder products in the DOM
      filteredProducts.forEach((product) => {
        gymProductsGrid.appendChild(product);
      });
      
      // Reset display
      currentlyShown = 0;
      showInitialProducts();
    }
    
    // Add filter buttons based on product categories
    function addFilterButtons() {
      // Get unique categories
      const categories = new Set();
      allProducts.forEach((product) => {
        const categoryElement = product.querySelector(".product-category");
        if (categoryElement) {
          const category = categoryElement.textContent;
          categories.add(category);
        }
      });
      
      // Create filter container if it doesn't exist
      let filterContainer = gymCollection.querySelector(".collection-filters");
      if (!filterContainer) {
        filterContainer = document.createElement("div");
        filterContainer.className = "collection-filters";
        const collectionHeader = gymCollection.querySelector(".collection-header");
        if (collectionHeader) {
          collectionHeader.parentNode.insertBefore(
            filterContainer,
            collectionHeader.nextSibling
          );
        }
      }
      
      // Add "All" button
      const allButton = document.createElement("button");
      allButton.className = "filter-btn active";
      allButton.textContent = "All";
      allButton.dataset.category = "all";
      filterContainer.appendChild(allButton);
      
      // Add category buttons
      categories.forEach((category) => {
        const button = document.createElement("button");
        button.className = "filter-btn";
        button.textContent = category;
        button.dataset.category = category;
        filterContainer.appendChild(button);
      });
      
      // Add event listeners to filter buttons
      const filterButtons = filterContainer.querySelectorAll(".filter-btn");
      filterButtons.forEach((button) => {
        button.addEventListener("click", function () {
          // Update active state
          filterButtons.forEach((btn) => btn.classList.remove("active"));
          this.classList.add("active");
          
          const category = this.dataset.category;
          
          // Filter products
          if (category === "all") {
            filteredProducts = [...allProducts];
          } else {
            filteredProducts = allProducts.filter((product) => {
              const categoryElement = product.querySelector(".product-category");
              if (categoryElement) {
                const productCategory = categoryElement.textContent;
                return productCategory === category;
              }
              return false;
            });
          }
          
          // Update count and display
          updateProductCount();
          currentlyShown = 0;
          showInitialProducts();
          
          // If sorted, maintain sort order
          if (sortSelect && sortSelect.value !== "featured") {
            sortProducts();
          }
        });
      });
    }
    
    // Add CSS for the fade-in animation and filter buttons
    const style = document.createElement("style");
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      .fade-in {
        animation: fadeIn 0.5s ease-out forwards;
      }
      
      .collection-filters {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin-bottom: 20px;
      }
      
      .filter-btn {
        padding: 8px 16px;
        background-color: #f5f5f5;
        border: 1px solid #ddd;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.3s ease;
      }
      
      .filter-btn:hover {
        background-color: #e9e9e9;
      }
      
      .filter-btn.active {
        background-color: #333;
        color: white;
        border-color: #333;
      }
    `;
    document.head.appendChild(style);
    
    // Add wishlist functionality
    const wishlistButtons = gymCollection.querySelectorAll(".wishlist-btn");
    wishlistButtons.forEach((button) => {
      button.addEventListener("click", function () {
        const icon = this.querySelector("i");
        icon.classList.toggle("far");
        icon.classList.toggle("fas");
        // You could add code here to save to localStorage or send to server
      });
    });
    
    // Add to cart functionality
    const addToCartButtons = gymCollection.querySelectorAll(".add-to-cart");
    addToCartButtons.forEach((button) => {
      button.addEventListener("click", function () {
        const productId = this.dataset.productId;
        const productTitle =
          this.closest(".product-item").querySelector(
            ".product-title"
          ).textContent;
        
        // Show confirmation message
        const message = document.createElement("div");
        message.className = "cart-message";
        message.textContent = `${productTitle} added to cart!`;
        document.body.appendChild(message);
        
        // Remove message after 3 seconds
        setTimeout(() => {
          message.classList.add("fade-out");
          setTimeout(() => {
            document.body.removeChild(message);
          }, 500);
        }, 3000);
        
        // Update cart count in header
        const cartCount = document.querySelector(".cart-count");
        if (cartCount) {
          cartCount.textContent = parseInt(cartCount.textContent) + 1;
        }
        
        // You could add code here to save to localStorage or send to server
      });
    });
    
    // Add styles for cart message
    const cartStyle = document.createElement("style");
    cartStyle.textContent = `
      .cart-message {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background-color: #333;
        color: white;
        padding: 12px 20px;
        border-radius: 4px;
        z-index: 1000;
        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        transition: opacity 0.5s, transform 0.5s;
      }
      
      .fade-out {
        opacity: 0;
        transform: translateY(20px);
      }
    `;
    document.head.appendChild(cartStyle);
  });
  
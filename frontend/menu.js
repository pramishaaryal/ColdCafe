document.addEventListener(
    "DOMContentLoaded",
    function () {


        /* =====================================================
           API CONFIGURATION
        ===================================================== */

        const API_BASE_URL =
            import.meta.env.VITE_API_URL;


        if (!API_BASE_URL) {

            console.error(
                "VITE_API_URL is missing from .env"
            );

            return;
        }


        const API_URL =
            API_BASE_URL.replace(/\/+$/, "");


        const PRODUCTS_URL =
            `${API_URL}/api/products`;


        const CATEGORIES_URL =
            `${API_URL}/api/categories`;



        /* =====================================================
           ELEMENTS
        ===================================================== */

        const menuSearch =
            document.getElementById(
                "menuSearch"
            );


        const categoryButtons =
            document.getElementById(
                "categoryButtons"
            );


        const menuSections =
            document.getElementById(
                "menuSections"
            );


        const noResults =
            document.getElementById(
                "noResults"
            );


        const menuToggle =
            document.getElementById(
                "menuToggle"
            );


        const navLinks =
            document.getElementById(
                "navLinks"
            );



        /* =====================================================
           DATA
        ===================================================== */

        let allProducts = [];

        let allCategories = [];

        let currentCategory = "all";

        let refreshTimer = null;

        let loading = false;



        /* =====================================================
           ESCAPE HTML
        ===================================================== */

        function escapeHTML(value) {

            const div =
                document.createElement(
                    "div"
                );


            div.textContent =
                value === null ||
                value === undefined
                    ? ""
                    : String(value);


            return div.innerHTML;
        }



        /* =====================================================
           NORMALIZE TEXT
        ===================================================== */

        function normalizeText(value) {

            return String(value || "")
                .toLowerCase()
                .trim()
                .replace(/&/g, " and ")
                .replace(/[^\w\s-]/g, " ")
                .replace(/\s+/g, " ")
                .trim();
        }



        /* =====================================================
           SLUG
        ===================================================== */

        function createSlug(value) {

            return normalizeText(value)
                .replace(/\s+/g, "-");
        }



        /* =====================================================
           CATEGORY NAME
        ===================================================== */

        function getCategoryName(
            category
        ) {

            if (
                typeof category === "string"
            ) {

                return category.trim();
            }


            if (!category) {

                return "";
            }


            return (
                category.name ||
                category.title ||
                category.categoryName ||
                category.category_name ||
                ""
            )
                .toString()
                .trim();
        }



        /* =====================================================
           PRODUCT CATEGORY
        ===================================================== */

        function getProductCategory(
            product
        ) {

            if (!product) {

                return "Other";
            }


            if (
                typeof product.category ===
                "object" &&
                product.category !== null
            ) {

                return (
                    product.category.name ||
                    product.category.title ||
                    "Other"
                );
            }


            return (
                product.category ||
                product.categoryName ||
                product.category_name ||
                "Other"
            )
                .toString()
                .trim();
        }



        /* =====================================================
           PRODUCT NAME
        ===================================================== */

        function getProductName(
            product
        ) {

            return (
                product.name ||
                product.title ||
                "Unnamed Product"
            )
                .toString()
                .trim();
        }



        /* =====================================================
           PRODUCT DESCRIPTION
        ===================================================== */

        function getProductDescription(
            product
        ) {

            return (
                product.description ||
                product.details ||
                "Freshly prepared at Cold Cafe By Giriz."
            )
                .toString()
                .trim();
        }



        /* =====================================================
           PRODUCT PRICE
        ===================================================== */

        function getProductPrice(
            product
        ) {

            const price =
                product.price;


            if (
                price === null ||
                price === undefined ||
                price === ""
            ) {

                return "0";
            }


            const number =
                Number(
                    String(price)
                        .replace(
                            /[^0-9.]/g,
                            ""
                        )
                );


            if (
                Number.isNaN(number)
            ) {

                return "0";
            }


            return number.toFixed(0);
        }



        /* =====================================================
           IMAGE URL
        ===================================================== */

        function getImageUrl(
            image
        ) {

            if (!image) {

                return "";
            }


            const imagePath =
                String(image)
                    .trim();


            if (
                imagePath.startsWith(
                    "http://"
                ) ||
                imagePath.startsWith(
                    "https://"
                ) ||
                imagePath.startsWith(
                    "data:"
                )
            ) {

                return imagePath;
            }


            if (
                imagePath.startsWith(
                    "//"
                )
            ) {

                return (
                    window.location.protocol +
                    imagePath
                );
            }


            if (
                imagePath.startsWith("/")
            ) {

                return (
                    API_URL +
                    imagePath
                );
            }


            return (
                API_URL +
                "/" +
                imagePath
                    .replace(
                        /^\.?\//,
                        ""
                    )
            );
        }



        /* =====================================================
           CATEGORY FALLBACK IMAGE
        ===================================================== */

        function getCategoryImage(
            category
        ) {

            const text =
                normalizeText(
                    category
                );


            if (
                text.includes("waffle")
            ) {

                return (
                    "https://i.pinimg.com/1200x/f4/88/fa/" +
                    "f488fa3048a4597dbde4cc6badded47c.jpg"
                );
            }


            if (
                text.includes("bubble") ||
                text.includes("boba")
            ) {

                return (
                    "https://i.pinimg.com/1200x/00/16/09/" +
                    "0016093cdf9023051eebd26d1f8b93b7.jpg"
                );
            }


            if (
                text.includes("coffee") ||
                text.includes("latte") ||
                text.includes("espresso")
            ) {

                return (
                    "https://i.pinimg.com/736x/55/5e/bb/" +
                    "555ebb52070c9043eaf2611008e76e2e.jpg"
                );
            }


            if (
                text.includes("shake") ||
                text.includes("milkshake")
            ) {

                return (
                    "https://i.pinimg.com/736x/03/ad/d5/" +
                    "03add5dd1102a1f2d30644340a1769ac.jpg"
                );
            }


            if (
                text.includes("tea") ||
                text.includes("mojito") ||
                text.includes("refresh")
            ) {

                return (
                    "https://i.pinimg.com/736x/0b/ca/08/" +
                    "0bca08a216d6ee59631f358a4121df60.jpg"
                );
            }


            return "";
        }



        /* =====================================================
           CATEGORY TITLE
        ===================================================== */

        function getCategoryTitle(
            category
        ) {

            const name =
                getCategoryName(
                    category
                );


            if (!name) {

                return "Our Menu";
            }


            return name;
        }



        /* =====================================================
           EXTRACT PRODUCTS
        ===================================================== */

        function extractProducts(
            data
        ) {

            if (
                Array.isArray(data)
            ) {

                return data;
            }


            if (
                data &&
                Array.isArray(
                    data.products
                )
            ) {

                return data.products;
            }


            if (
                data &&
                Array.isArray(
                    data.data
                )
            ) {

                return data.data;
            }


            return [];
        }



        /* =====================================================
           EXTRACT CATEGORIES
        ===================================================== */

        function extractCategories(
            data
        ) {

            if (
                Array.isArray(data)
            ) {

                return data;
            }


            if (
                data &&
                Array.isArray(
                    data.categories
                )
            ) {

                return data.categories;
            }


            if (
                data &&
                Array.isArray(
                    data.data
                )
            ) {

                return data.data;
            }


            return [];
        }



        /* =====================================================
           FETCH JSON
        ===================================================== */

        async function fetchJSON(
            url
        ) {

            const response =
                await fetch(
                    url,
                    {
                        method: "GET",

                        headers: {
                            Accept:
                                "application/json"
                        },

                        cache: "no-store"
                    }
                );


            if (!response.ok) {

                throw new Error(
                    `${response.status} ${response.statusText}`
                );
            }


            return await response.json();
        }



        /* =====================================================
           LOAD CATEGORIES
        ===================================================== */

        async function loadCategories() {

            try {

                const data =
                    await fetchJSON(
                        CATEGORIES_URL
                    );


                allCategories =
                    extractCategories(
                        data
                    );


                console.log(
                    "Categories loaded:",
                    allCategories
                );


            } catch (error) {

                console.error(
                    "CATEGORY API ERROR:",
                    error
                );


                allCategories = [];
            }
        }



        /* =====================================================
           LOAD PRODUCTS
        ===================================================== */

        async function loadProducts() {

            try {

                const data =
                    await fetchJSON(
                        PRODUCTS_URL
                    );


                allProducts =
                    extractProducts(
                        data
                    );


                console.log(
                    "Products loaded:",
                    allProducts
                );


            } catch (error) {

                console.error(
                    "PRODUCT API ERROR:",
                    error
                );


                allProducts = [];
            }
        }



        /* =====================================================
           GET UNIQUE CATEGORIES
        ===================================================== */

        function getUniqueCategories() {

            const categories = [];

            const seen =
                new Set();


            function addCategory(
                value
            ) {

                const name =
                    getCategoryName(
                        value
                    );


                if (!name) {

                    return;
                }


                const key =
                    normalizeText(
                        name
                    );


                if (
                    seen.has(key)
                ) {

                    return;
                }


                seen.add(key);

                categories.push(name);
            }


            /*
                First use backend
                category table.
            */

            allCategories.forEach(
                function (category) {

                    addCategory(
                        category
                    );
                }
            );


            /*
                Then use product categories.

                This is important because
                Product.category is a STRING
                in your backend.
            */

            allProducts.forEach(
                function (product) {

                    addCategory(
                        getProductCategory(
                            product
                        )
                    );
                }
            );


            return categories;
        }



        /* =====================================================
           RENDER CATEGORY BUTTONS
        ===================================================== */

        function renderCategoryButtons() {

            if (!categoryButtons) {

                return;
            }


            categoryButtons.innerHTML =
                "";


            /*
                ALL BUTTON
            */

            const allButton =
                document.createElement(
                    "button"
                );


            allButton.type =
                "button";


            allButton.className =
                "category-btn";


            allButton.dataset.filter =
                "all";


            allButton.textContent =
                "All";


            if (
                currentCategory ===
                "all"
            ) {

                allButton.classList.add(
                    "active"
                );
            }


            categoryButtons.appendChild(
                allButton
            );


            /*
                BACKEND CATEGORIES
            */

            const categories =
                getUniqueCategories();


            categories.forEach(
                function (category) {

                    const button =
                        document.createElement(
                            "button"
                        );


                    const slug =
                        createSlug(
                            category
                        );


                    button.type =
                        "button";


                    button.className =
                        "category-btn";


                    button.dataset.filter =
                        slug;


                    button.textContent =
                        getCategoryTitle(
                            category
                        );


                    if (
                        currentCategory ===
                        slug
                    ) {

                        button.classList.add(
                            "active"
                        );
                    }


                    categoryButtons.appendChild(
                        button
                    );
                }
            );
        }



        /* =====================================================
           CREATE PRODUCT ITEM
        ===================================================== */

        function createProductItem(
            product
        ) {

            const name =
                getProductName(
                    product
                );


            const description =
                getProductDescription(
                    product
                );


            const price =
                getProductPrice(
                    product
                );


            const article =
                document.createElement(
                    "article"
                );


            article.className =
                "menu-item backend-product";


            article.dataset.name =
                name;


            article.dataset.category =
                createSlug(
                    getProductCategory(
                        product
                    )
                );


            article.dataset.description =
                description;


            article.dataset.productId =
                product.id || "";


            article.innerHTML = `

                <div class="item-name">

                    <h3>
                        ${escapeHTML(name)}
                    </h3>

                    <span class="line"></span>

                    <h4>
                        NPR ${escapeHTML(price)}
                    </h4>

                </div>


                <p>
                    ${escapeHTML(description)}
                </p>

            `;


            return article;
        }



        /* =====================================================
           CREATE CATEGORY SECTION
        ===================================================== */

        function createCategorySection(
            category,
            products,
            index
        ) {

            const section =
                document.createElement(
                    "section"
                );


            const categoryName =
                getCategoryName(
                    category
                );


            const categorySlug =
                createSlug(
                    categoryName
                );


            section.className =
                "menu-section backend-menu-section visible";


            section.dataset.category =
                categorySlug;


            section.dataset.categoryName =
                categoryName;


            /*
                Alternate layout.
            */

            if (
                index % 2 === 1
            ) {

                section.classList.add(
                    "reverse"
                );
            }


            /*
                Find first product
                image.
            */

            let categoryImage =
                "";


            for (
                const product
                of products
            ) {

                const image =
                    getImageUrl(
                        product.image ||
                        product.imageUrl ||
                        product.photo
                    );


                if (image) {

                    categoryImage =
                        image;

                    break;
                }
            }


            /*
                Fallback image.
            */

            if (!categoryImage) {

                categoryImage =
                    getCategoryImage(
                        categoryName
                    );
            }


            section.innerHTML = `

                <div class="menu-image">

                    <img
                        src="${escapeHTML(categoryImage)}"
                        alt="${escapeHTML(categoryName)}"
                        loading="lazy"
                    >

                    <span class="image-badge">
                        Freshly Made
                    </span>

                </div>


                <div class="menu-content">

                    <span>
                        COLD CAFE FAVOURITES
                    </span>


                    <h2>
                        ${escapeHTML(categoryName)}
                    </h2>


                    <p class="menu-text">
                        Freshly prepared favourites
                        made with quality ingredients
                        at Cold Cafe By Giriz.
                    </p>


                    <div class="menu-list"></div>

                </div>

            `;


            const list =
                section.querySelector(
                    ".menu-list"
                );


            products.forEach(
                function (product) {

                    list.appendChild(
                        createProductItem(
                            product
                        )
                    );
                }
            );


            const image =
                section.querySelector(
                    "img"
                );


            if (image) {

                image.addEventListener(
                    "error",
                    function () {

                        const fallback =
                            getCategoryImage(
                                categoryName
                            );


                        if (
                            fallback &&
                            image.src !== fallback
                        ) {

                            image.src =
                                fallback;
                        }

                    }
                );
            }


            return section;
        }



        /* =====================================================
           RENDER MENU
        ===================================================== */

        function renderMenu() {

            if (!menuSections) {

                return;
            }


            menuSections.innerHTML =
                "";


            /*
                If backend has no products.
            */

            if (
                allProducts.length === 0
            ) {

                updateNoResults(
                    true
                );

                return;
            }


            /*
                Group products by category.
            */

            const groups =
                new Map();


            allProducts.forEach(
                function (product) {

                    const category =
                        getProductCategory(
                            product
                        );


                    const key =
                        normalizeText(
                            category
                        );


                    if (
                        !groups.has(key)
                    ) {

                        groups.set(
                            key,
                            {
                                name:
                                    category,

                                products:
                                    []
                            }
                        );
                    }


                    groups
                        .get(key)
                        .products
                        .push(product);
                }
            );


            /*
                Render each category.
            */

            let index = 0;


            groups.forEach(
                function (group) {

                    const section =
                        createCategorySection(
                            group.name,
                            group.products,
                            index
                        );


                    menuSections.appendChild(
                        section
                    );


                    index++;
                }
            );


            setupImageFallbacks();

            filterMenu();
        }



        /* =====================================================
           IMAGE FALLBACK
        ===================================================== */

        function setupImageFallbacks() {

            const images =
                document.querySelectorAll(
                    ".menu-section img"
                );


            images.forEach(
                function (image) {

                    if (
                        image.dataset.fallbackReady
                    ) {

                        return;
                    }


                    image.dataset.fallbackReady =
                        "true";


                    image.addEventListener(
                        "error",
                        function () {

                            if (
                                image.dataset.fallbackUsed
                            ) {

                                return;
                            }


                            image.dataset.fallbackUsed =
                                "true";


                            const section =
                                image.closest(
                                    ".menu-section"
                                );


                            const category =
                                section
                                    ? section.dataset.categoryName
                                    : "";


                            const fallback =
                                getCategoryImage(
                                    category
                                );


                            if (fallback) {

                                image.src =
                                    fallback;
                            }

                        }
                    );
                }
            );
        }



        /* =====================================================
           FILTER MENU
        ===================================================== */

        function filterMenu() {

            const searchTerm =
                menuSearch
                    ? normalizeText(
                        menuSearch.value
                    )
                    : "";


            const sections =
                document.querySelectorAll(
                    ".menu-section"
                );


            let visibleCount = 0;


            sections.forEach(
                function (section) {

                    const category =
                        normalizeText(
                            section.dataset.categoryName ||
                            section.dataset.category
                        );


                    const items =
                        section.querySelectorAll(
                            ".menu-item"
                        );


                    let visibleItems = 0;


                    items.forEach(
                        function (item) {

                            const name =
                                normalizeText(
                                    item.dataset.name ||
                                    item.querySelector(
                                        "h3"
                                    )?.textContent
                                );


                            const description =
                                normalizeText(
                                    item.dataset.description ||
                                    item.querySelector(
                                        "p"
                                    )?.textContent
                                );


                            const matchesSearch =
                                !searchTerm ||
                                name.includes(
                                    searchTerm
                                ) ||
                                description.includes(
                                    searchTerm
                                ) ||
                                category.includes(
                                    searchTerm
                                );


                            const matchesCategory =
                                currentCategory ===
                                "all" ||
                                createSlug(
                                    section.dataset.categoryName ||
                                    section.dataset.category
                                ) ===
                                currentCategory;


                            const show =
                                matchesSearch &&
                                matchesCategory;


                            if (show) {

                                item.style.display =
                                    "";


                                visibleItems++;

                            } else {

                                item.style.display =
                                    "none";
                            }

                        }
                    );


                    /*
                        Show category section only
                        when it has visible products.
                    */

                    if (
                        visibleItems > 0
                    ) {

                        section.style.display =
                            "";


                        section.classList.add(
                            "visible"
                        );


                        visibleCount +=
                            visibleItems;

                    } else {

                        section.style.display =
                            "none";

                    }

                }
            );


            updateNoResults(
                visibleCount === 0
            );
        }



        /* =====================================================
           NO RESULTS
        ===================================================== */

        function updateNoResults(
            show
        ) {

            if (!noResults) {

                return;
            }


            if (show) {

                noResults.classList.add(
                    "show"
                );

            } else {

                noResults.classList.remove(
                    "show"
                );
            }
        }



        /* =====================================================
           CATEGORY CLICK
        ===================================================== */

        function setupCategoryEvents() {

            if (!categoryButtons) {

                return;
            }


            categoryButtons.addEventListener(
                "click",
                function (event) {

                    const button =
                        event.target.closest(
                            ".category-btn"
                        );


                    if (!button) {

                        return;
                    }


                    currentCategory =
                        button.dataset.filter ||
                        "all";


                    categoryButtons
                        .querySelectorAll(
                            ".category-btn"
                        )
                        .forEach(
                            function (item) {

                                item.classList.remove(
                                    "active"
                                );
                            }
                        );


                    button.classList.add(
                        "active"
                    );


                    filterMenu();

                }
            );
        }



        /* =====================================================
           SEARCH EVENT
        ===================================================== */

        function setupSearch() {

            if (!menuSearch) {

                return;
            }


            menuSearch.addEventListener(
                "input",
                function () {

                    filterMenu();

                }
            );
        }



        /* =====================================================
           MOBILE NAVIGATION
        ===================================================== */

        function setupMobileNavigation() {

            if (
                !menuToggle ||
                !navLinks
            ) {

                return;
            }


            menuToggle.addEventListener(
                "click",
                function () {

                    const isOpen =
                        navLinks.classList.toggle(
                            "open"
                        );


                    menuToggle.setAttribute(
                        "aria-expanded",
                        String(isOpen)
                    );


                    menuToggle.innerHTML =
                        isOpen
                            ? '<i class="ri-close-line"></i>'
                            : '<i class="ri-menu-3-line"></i>';

                }
            );


            navLinks
                .querySelectorAll("a")
                .forEach(
                    function (link) {

                        link.addEventListener(
                            "click",
                            function () {

                                navLinks.classList.remove(
                                    "open"
                                );


                                menuToggle.setAttribute(
                                    "aria-expanded",
                                    "false"
                                );


                                menuToggle.innerHTML =
                                    '<i class="ri-menu-3-line"></i>';

                            }
                        );

                    }
                );
        }



        /* =====================================================
           SMOOTH SCROLL
        ===================================================== */

        function setupSmoothScroll() {

            document
                .querySelectorAll(
                    'a[href^="#"]'
                )
                .forEach(
                    function (anchor) {

                        anchor.addEventListener(
                            "click",
                            function (event) {

                                const targetId =
                                    anchor.getAttribute(
                                        "href"
                                    );


                                if (
                                    !targetId ||
                                    targetId === "#"
                                ) {

                                    return;
                                }


                                const target =
                                    document.querySelector(
                                        targetId
                                    );


                                if (target) {

                                    event.preventDefault();


                                    target.scrollIntoView(
                                        {
                                            behavior:
                                                "smooth",

                                            block:
                                                "start"
                                        }
                                    );
                                }

                            }
                        );

                    }
                );
        }



        /* =====================================================
           LOAD EVERYTHING
        ===================================================== */

        async function initializeMenu() {

            if (loading) {

                return;
            }


            loading = true;


            try {

                console.log(
                    "Loading Cold Cafe menu..."
                );


                console.log(
                    "Products API:",
                    PRODUCTS_URL
                );


                console.log(
                    "Categories API:",
                    CATEGORIES_URL
                );


                await Promise.all(
                    [
                        loadCategories(),
                        loadProducts()
                    ]
                );


                renderCategoryButtons();

                renderMenu();


                console.log(
                    "Menu loaded successfully."
                );


                console.log(
                    "Total products:",
                    allProducts.length
                );


                console.log(
                    "Total categories:",
                    allCategories.length
                );

            } catch (error) {

                console.error(
                    "MENU INITIALIZATION ERROR:",
                    error
                );

            } finally {

                loading = false;
            }
        }



        /* =====================================================
           REFRESH MENU
        ===================================================== */

        async function refreshMenu() {

            if (loading) {

                return;
            }


            await initializeMenu();
        }



        /* =====================================================
           AUTO REFRESH
           
           Every 30 seconds
        ===================================================== */

        function startAutoRefresh() {

            if (refreshTimer) {

                clearInterval(
                    refreshTimer
                );
            }


            refreshTimer =
                setInterval(
                    function () {

                        if (
                            document.hidden
                        ) {

                            return;
                        }


                        refreshMenu();

                    },
                    30000
                );
        }



        /* =====================================================
           PAGE VISIBILITY
        ===================================================== */

        document.addEventListener(
            "visibilitychange",
            function () {

                if (
                    !document.hidden
                ) {

                    refreshMenu();
                }

            }
        );



        /* =====================================================
           GLOBAL REFRESH FUNCTION
           
           Can also be called manually
           from browser console.
        ===================================================== */

        window.refreshMenuFromBackend =
            refreshMenu;



        /* =====================================================
           INITIALIZE
        ===================================================== */

        setupCategoryEvents();

        setupSearch();

        setupMobileNavigation();

        setupSmoothScroll();

        initializeMenu();

        startAutoRefresh();



        /* =====================================================
           FINAL CONSOLE MESSAGE
        ===================================================== */

        console.log(
            "Cold Cafe Menu JavaScript initialized."
        );

    }
);
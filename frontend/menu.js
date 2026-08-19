document.addEventListener("DOMContentLoaded", function () {

    /* =====================================================
       API CONFIGURATION
    ===================================================== */

    const API_URL =
        window.API_BASE_URL ||
        "http://localhost:5000/api";

    const API_ORIGIN =
        API_URL.replace(/\/api\/?$/, "");


    /* =====================================================
       ELEMENTS
    ===================================================== */

    const menuSearch =
        document.getElementById("menuSearch");

    const noResults =
        document.getElementById("noResults");

    const menuSections =
        document.getElementById("menuSections");

    const menuToggle =
        document.getElementById("menuToggle");

    const navLinks =
        document.getElementById("navLinks");

    const categoryButtons =
        document.getElementById("categoryButtons");

    const dynamicSection =
        document.getElementById("dynamicProductsSection");

    const dynamicProducts =
        document.getElementById("dynamicProducts");


    /* =====================================================
       GLOBAL DATA
    ===================================================== */

    let currentCategory = "all";

    let allProducts = [];

    let allCategories = [];

    let menuRefreshInterval = null;

    let menuRefreshInProgress = false;


    /* =====================================================
       ESCAPE HTML
    ===================================================== */

    function escapeHTML(value) {

        const div =
            document.createElement("div");

        div.textContent =
            value === undefined ||
            value === null
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
            .replace(/[^\w\s]/g, " ")
            .replace(/\s+/g, " ")
            .trim();
    }


    /* =====================================================
       SLUGIFY
    ===================================================== */

    function slugify(value) {

        return normalizeText(value)
            .replace(/\s+/g, "-");
    }


    /* =====================================================
       CATEGORY SLUG
    ===================================================== */

    function getCategorySlug(category) {

        const value =
            normalizeText(category);


        if (value.includes("waffle")) {

            return "waffles";
        }


        if (
            value.includes("bubble") ||
            value.includes("boba")
        ) {

            return "bubble";
        }


        if (
            value.includes("coffee") ||
            value.includes("latte") ||
            value.includes("espresso")
        ) {

            return "coffee";
        }


        if (
            value.includes("shake") ||
            value.includes("milkshake")
        ) {

            return "shakes";
        }


        if (
            value.includes("tea") ||
            value.includes("mojito") ||
            value.includes("refresh")
        ) {

            return "refreshers";
        }


        return slugify(category) || "other";
    }


    /* =====================================================
       CATEGORY TITLE
    ===================================================== */

    function getCategoryTitle(category) {

        const value =
            String(category || "").trim();

        const slug =
            getCategorySlug(value);


        const titles = {

            waffles:
                "Waffles",

            bubble:
                "Bubble Tea",

            coffee:
                "Cold Coffee",

            shakes:
                "Milkshakes",

            refreshers:
                "Ice Tea & Mojito"
        };


        return (
            titles[slug] ||
            value ||
            "Our Menu"
        );
    }


    /* =====================================================
       CATEGORY DEFAULT IMAGE
    ===================================================== */

    function getCategoryImage(category) {

        const slug =
            getCategorySlug(category);


        const images = {

            waffles:
                "https://i.pinimg.com/1200x/f4/88/fa/f488fa3048a4597dbde4cc6badded47c.jpg",

            bubble:
                "https://i.pinimg.com/1200x/00/16/09/0016093cdf9023051eebd26d1f8b93b7.jpg",

            coffee:
                "https://i.pinimg.com/736x/55/5e/bb/555ebb52070c9043eaf2611008e76e2e.jpg",

            shakes:
                "https://i.pinimg.com/736x/03/ad/d5/03add5dd1102a1f2d30644340a1769ac.jpg",

            refreshers:
                "https://i.pinimg.com/736x/0b/ca/08/0bca08a216d6ee59631f358a4121df60.jpg"
        };


        return (
            images[slug] ||
            images.waffles
        );
    }


    /* =====================================================
       IMAGE URL
    ===================================================== */

    function getImageUrl(image) {

        if (!image) {

            return "";
        }


        const imagePath =
            String(image).trim();


        if (
            imagePath.startsWith("http://") ||
            imagePath.startsWith("https://") ||
            imagePath.startsWith("data:")
        ) {

            return imagePath;
        }


        if (
            imagePath.startsWith("//")
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
                API_ORIGIN +
                imagePath
            );
        }


        return (
            API_ORIGIN +
            "/" +
            imagePath
                .replace(/^\.\//, "")
                .replace(/^\//, "")
        );
    }


    /* =====================================================
       FORMAT PRICE
    ===================================================== */

    function formatPrice(price) {

        if (
            price === undefined ||
            price === null ||
            price === ""
        ) {

            return "0";
        }


        const cleanPrice =
            String(price)
                .replace(/[^0-9.]/g, "");


        const number =
            Number(cleanPrice);


        if (
            Number.isNaN(number)
        ) {

            return "0";
        }


        return number.toFixed(0);
    }


    /* =====================================================
       EXTRACT PRODUCTS
    ===================================================== */

    function extractProducts(data) {

        if (
            Array.isArray(data)
        ) {

            return data;
        }


        if (
            data &&
            Array.isArray(data.products)
        ) {

            return data.products;
        }


        if (
            data &&
            Array.isArray(data.data)
        ) {

            return data.data;
        }


        if (
            data &&
            data.data &&
            Array.isArray(data.data.products)
        ) {

            return data.data.products;
        }


        return [];
    }


    /* =====================================================
       EXTRACT CATEGORIES
    ===================================================== */

    function extractCategories(data) {

        if (
            Array.isArray(data)
        ) {

            return data;
        }


        if (
            data &&
            Array.isArray(data.categories)
        ) {

            return data.categories;
        }


        if (
            data &&
            Array.isArray(data.data)
        ) {

            return data.data;
        }


        if (
            data &&
            data.data &&
            Array.isArray(data.data.categories)
        ) {

            return data.data.categories;
        }


        return [];
    }


    /* =====================================================
       PRODUCT CATEGORY
    ===================================================== */

    function getProductCategory(product) {

        if (!product) {

            return "Other";
        }


        if (
            typeof product.category === "object" &&
            product.category
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
        );
    }


    /* =====================================================
       CATEGORY NAME
    ===================================================== */

    function getCategoryName(category) {

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
       PRODUCT NAME
    ===================================================== */

    function getProductName(product) {

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

    function getProductDescription(product) {

        return (
            product.description ||
            product.details ||
            "Freshly prepared at Cold Cafe By Giriz."
        )
            .toString()
            .trim();
    }


    /* =====================================================
       CREATE COMPARISON KEY
       
       This is the IMPORTANT DUPLICATE FIX.
    ===================================================== */

    function cleanProductNameForComparison(
        name,
        category
    ) {

        let clean =
            normalizeText(name);


        const categorySlug =
            getCategorySlug(category);


        /*
           Backend:
           Strawberry Bubble Tea

           Frontend:
           Strawberry

           Both become:
           strawberry
        */

        if (
            categorySlug === "bubble"
        ) {

            clean =
                clean
                    .replace(/\bbubble tea\b/g, "")
                    .replace(/\bbubble\b/g, "")
                    .trim();
        }


        /*
           Backend:
           Oreo Shake

           Frontend:
           Oreo Shake

           Both become:
           oreo
        */

        if (
            categorySlug === "shakes"
        ) {

            clean =
                clean
                    .replace(/\bmilkshake\b/g, "")
                    .replace(/\bshake\b/g, "")
                    .trim();
        }


        /*
           Backend:
           Mango Mojito

           Frontend:
           Mango

           Both become:
           mango
        */

        if (
            categorySlug === "refreshers"
        ) {

            clean =
                clean
                    .replace(/\bmojito\b/g, "")
                    .replace(/\bice tea\b/g, "")
                    .replace(/\biced tea\b/g, "")
                    .replace(/\btea\b/g, "")
                    .trim();
        }


        return clean;
    }


    function getProductKey(
        name,
        category
    ) {

        const categorySlug =
            getCategorySlug(category);


        const cleanName =
            cleanProductNameForComparison(
                name,
                category
            );


        return (
            categorySlug +
            "::" +
            cleanName
        );
    }


    /* =====================================================
       FIND EXISTING STATIC PRODUCT
    ===================================================== */

    function findExistingMenuItem(
        product
    ) {

        const productName =
            getProductName(product);


        const productCategory =
            getProductCategory(product);


        const productKey =
            getProductKey(
                productName,
                productCategory
            );


        const staticItems =
            document.querySelectorAll(
                "#menuSections .menu-item:not(.backend-product)"
            );


        for (
            const item of staticItems
        ) {

            const itemName =
                item.dataset.name ||
                item.querySelector("h3")?.textContent ||
                "";


            const section =
                item.closest(
                    ".menu-section"
                );


            if (!section) {

                continue;
            }


            const sectionCategory =
                section.dataset.category ||
                "other";


            const itemKey =
                getProductKey(
                    itemName,
                    sectionCategory
                );


            if (
                itemKey === productKey
            ) {

                return item;
            }
        }


        return null;
    }


    /* =====================================================
       UPDATE EXISTING STATIC PRODUCT
    ===================================================== */

    function updateExistingMenuItem(
        item,
        product
    ) {

        const name =
            getProductName(product);


        const description =
            getProductDescription(product);


        const price =
            formatPrice(product.price);


        const nameElement =
            item.querySelector("h3");


        const priceElement =
            item.querySelector("h4");


        const descriptionElement =
            item.querySelector("p");


        if (nameElement) {

            nameElement.textContent =
                name;
        }


        if (priceElement) {

            priceElement.textContent =
                `NPR ${price}`;
        }


        if (descriptionElement) {

            descriptionElement.textContent =
                description;
        }


        item.dataset.name =
            name;


        item.dataset.description =
            description;


        item.dataset.backendId =
            product.id || "";


        item.dataset.backendProduct =
            "true";


        /*
           Mark it as synchronized.
        */

        item.classList.add(
            "backend-synced"
        );
    }


    /* =====================================================
       CREATE NEW PRODUCT ITEM
    ===================================================== */

    function createProductItem(
        product
    ) {

        const name =
            getProductName(product);


        const description =
            getProductDescription(product);


        const price =
            formatPrice(product.price);


        const article =
            document.createElement(
                "article"
            );


        article.className =
            "menu-item backend-product";


        article.dataset.name =
            name;


        article.dataset.description =
            description;


        article.dataset.category =
            getCategorySlug(
                getProductCategory(product)
            );


        article.dataset.backendId =
            product.id || "";


        article.dataset.backendProduct =
            "true";


        article.innerHTML = `

            <div class="item-name">

                <h3>
                    ${escapeHTML(name)}
                </h3>

                <span class="line"></span>

                <h4>
                    NPR ${price}
                </h4>

            </div>

            <p>
                ${escapeHTML(description)}
            </p>

        `;


        return article;
    }


    /* =====================================================
       CREATE NEW CATEGORY SECTION
       
       Only used when backend contains a completely
       new category which doesn't exist in HTML.
    ===================================================== */

    function createDynamicCategorySection(
        category,
        products,
        index
    ) {

        const section =
            document.createElement(
                "section"
            );


        const categorySlug =
            getCategorySlug(category);


        const categoryTitle =
            getCategoryTitle(category);


        const firstProduct =
            products[0] || {};


        const productImage =
            getImageUrl(
                firstProduct.image ||
                firstProduct.imageUrl ||
                firstProduct.photo ||
                firstProduct.image_url
            );


        const image =
            productImage ||
            getCategoryImage(category);


        section.className =
            "menu-section backend-menu-section visible";


        if (
            index % 2 === 1
        ) {

            section.classList.add(
                "reverse"
            );
        }


        section.dataset.category =
            categorySlug;


        section.dataset.categoryName =
            category;


        section.innerHTML = `

            <div class="menu-image">

                <img
                    src="${escapeHTML(image)}"
                    alt="${escapeHTML(categoryTitle)}"
                    loading="lazy"
                >

                <span class="image-badge">
                    Freshly Made
                </span>

            </div>

            <div class="menu-content">

                <span>
                    FROM OUR MENU
                </span>

                <h2>
                    ${escapeHTML(categoryTitle)}
                </h2>

                <p class="menu-text">
                    Freshly prepared favourites
                    from Cold Cafe By Giriz.
                </p>

                <div class="menu-list compact-list"></div>

            </div>

        `;


        const list =
            section.querySelector(
                ".menu-list"
            );


        products.forEach(
            function (product) {

                list.appendChild(
                    createProductItem(product)
                );
            }
        );


        return section;
    }


    /* =====================================================
       FIND STATIC CATEGORY SECTION
    ===================================================== */

    function findStaticCategorySection(
        category
    ) {

        const categorySlug =
            getCategorySlug(category);


        const sections =
            document.querySelectorAll(
                "#menuSections > .menu-section:not(#dynamicProductsSection)"
            );


        for (
            const section of sections
        ) {

            const sectionCategory =
                section.dataset.category ||
                "";


            if (
                getCategorySlug(
                    sectionCategory
                ) === categorySlug
            ) {

                return section;
            }
        }


        return null;
    }


    /* =====================================================
       REMOVE OLD DYNAMIC PRODUCTS
    ===================================================== */

    function clearDynamicProducts() {

        if (dynamicProducts) {

            dynamicProducts.innerHTML =
                "";
        }


        /*
           Remove dynamically-created category sections
           from previous refresh.
        */

        document
            .querySelectorAll(
                "#menuSections .backend-menu-section"
            )
            .forEach(
                function (section) {

                    section.remove();
                }
            );
    }


    /* =====================================================
       RENDER BACKEND PRODUCTS
       
       MAIN FIX
    ===================================================== */

    function renderBackendProducts(
        products
    ) {

        if (!menuSections) {

            console.error(
                "#menuSections not found."
            );

            return;
        }


        clearDynamicProducts();


        /*
           Keep track of backend products that
           are already present in static HTML.
        */

        const newProductsByCategory = {};


        products.forEach(
            function (product) {

                if (!product) {

                    return;
                }


                const category =
                    getProductCategory(product);


                const categorySlug =
                    getCategorySlug(category);


                /*
                   STEP 1
                   Find same product already
                   present in HTML.
                */

                const existingItem =
                    findExistingMenuItem(
                        product
                    );


                if (existingItem) {

                    /*
                       DO NOT CREATE DUPLICATE.
                       Just update existing HTML.
                    */

                    updateExistingMenuItem(
                        existingItem,
                        product
                    );


                    return;
                }


                /*
                   STEP 2
                   Product is genuinely new.
                   Add it to dynamic area.
                */

                if (
                    !newProductsByCategory[
                        categorySlug
                    ]
                ) {

                    newProductsByCategory[
                        categorySlug
                    ] = {
                        name: category,
                        products: []
                    };
                }


                newProductsByCategory[
                    categorySlug
                ].products.push(
                    product
                );
            }
        );


        /*
           STEP 3
           Add only genuinely new products.
        */

        let dynamicIndex = 0;


        Object.values(
            newProductsByCategory
        ).forEach(
            function (group) {

                const category =
                    group.name;


                const productsInCategory =
                    group.products;


                /*
                   If an existing category section
                   exists, add new products there.
                */

                const staticSection =
                    findStaticCategorySection(
                        category
                    );


                if (
                    staticSection
                ) {

                    let list =
                        staticSection.querySelector(
                            ".menu-list"
                        );


                    /*
                       If category has no menu list,
                       create one.
                    */

                    if (!list) {

                        list =
                            document.createElement(
                                "div"
                            );

                        list.className =
                            "menu-list compact-list";

                        staticSection
                            .querySelector(
                                ".menu-content"
                            )
                            ?.appendChild(list);
                    }


                    productsInCategory.forEach(
                        function (product) {

                            const item =
                                createProductItem(
                                    product
                                );


                            list.appendChild(
                                item
                            );
                        }
                    );


                    return;
                }


                /*
                   Completely new category.
                   Create a new section.
                */

                const newSection =
                    createDynamicCategorySection(
                        category,
                        productsInCategory,
                        dynamicIndex
                    );


                dynamicIndex++;


                /*
                   Insert before dynamic
                   placeholder section.
                */

                if (
                    dynamicSection
                ) {

                    menuSections.insertBefore(
                        newSection,
                        dynamicSection
                    );

                } else {

                    menuSections.appendChild(
                        newSection
                    );
                }
            }
        );


        /*
           Hide "More Favourites" section if
           there are no genuinely new products.
        */

        if (dynamicSection) {

            const hasDynamicItems =
                dynamicProducts &&
                dynamicProducts.children.length > 0;


            dynamicSection.style.display =
                hasDynamicItems
                    ? ""
                    : "none";
        }


        /*
           Update filters.
        */

        filterMenu();


        setupImageFallback();
    }


    /* =====================================================
       LOAD PRODUCTS
    ===================================================== */

    async function loadProducts() {

        try {

            console.log(
                "Loading products:",
                `${API_URL}/products`
            );


            const response =
                await fetch(
                    `${API_URL}/products`,
                    {
                        method: "GET",

                        headers: {
                            "Accept":
                                "application/json"
                        },

                        cache: "no-store"
                    }
                );


            if (
                !response.ok
            ) {

                throw new Error(
                    `Products API Error: ${response.status}`
                );
            }


            const data =
                await response.json();


            allProducts =
                extractProducts(data);


            console.log(
                "Products received:",
                allProducts.length
            );


            renderBackendProducts(
                allProducts
            );


        } catch (error) {

            console.error(
                "PRODUCT API ERROR:",
                error
            );


            /*
               Important:
               Backend fail हुँदा static
               menu गायब हुँदैन।
            */

            allProducts = [];


            filterMenu();
        }
    }


    /* =====================================================
       LOAD CATEGORIES
    ===================================================== */

    async function loadCategories() {

        try {

            const response =
                await fetch(
                    `${API_URL}/categories`,
                    {
                        method: "GET",

                        headers: {
                            "Accept":
                                "application/json"
                        },

                        cache: "no-store"
                    }
                );


            if (
                !response.ok
            ) {

                throw new Error(
                    `Categories API Error: ${response.status}`
                );
            }


            const data =
                await response.json();


            allCategories =
                extractCategories(data);


        } catch (error) {

            console.error(
                "CATEGORY API ERROR:",
                error
            );


            allCategories =
                [];
        }


        renderCategoryButtons();
    }


    /* =====================================================
       GET ALL CATEGORY NAMES
    ===================================================== */

    function getUniqueCategoryNames() {

        const names = [];

        const seen =
            new Set();


        function addCategory(name) {

            const clean =
                String(name || "")
                    .trim();


            if (!clean) {

                return;
            }


            const slug =
                getCategorySlug(clean);


            if (
                seen.has(slug)
            ) {

                return;
            }


            seen.add(slug);

            names.push(clean);
        }


        /*
           Backend categories
        */

        allCategories.forEach(
            function (category) {

                addCategory(
                    getCategoryName(category)
                );
            }
        );


        /*
           Backend product categories
        */

        allProducts.forEach(
            function (product) {

                addCategory(
                    getProductCategory(product)
                );
            }
        );


        /*
           Existing frontend categories
           are always preserved.
        */

        [
            "Waffles",
            "Bubble Tea",
            "Cold Coffee",
            "Milkshakes",
            "Ice Tea & Mojito"
        ].forEach(
            function (category) {

                addCategory(category);
            }
        );


        return names;
    }


    /* =====================================================
       RENDER CATEGORY BUTTONS
    ===================================================== */

    function renderCategoryButtons() {

        if (!categoryButtons) {

            return;
        }


        const previousCategory =
            currentCategory;


        categoryButtons.innerHTML =
            "";


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


        categoryButtons.appendChild(
            allButton
        );


        const categories =
            getUniqueCategoryNames();


        categories.forEach(
            function (category) {

                const slug =
                    getCategorySlug(category);


                /*
                   Avoid duplicate category
                   buttons.
                */

                if (
                    categoryButtons.querySelector(
                        `[data-filter="${slug}"]`
                    )
                ) {

                    return;
                }


                const button =
                    document.createElement(
                        "button"
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


                categoryButtons.appendChild(
                    button
                );
            }
        );


        /*
           Restore selected category.
        */

        const selectedButton =
            categoryButtons.querySelector(
                `[data-filter="${previousCategory}"]`
            );


        if (selectedButton) {

            selectedButton.classList.add(
                "active"
            );

        } else {

            currentCategory =
                "all";


            allButton.classList.add(
                "active"
            );
        }


        bindCategoryButtons();
    }


    /* =====================================================
       CATEGORY BUTTONS
    ===================================================== */

    function bindCategoryButtons() {

        if (!categoryButtons) {

            return;
        }


        categoryButtons
            .querySelectorAll(
                ".category-btn"
            )
            .forEach(
                function (button) {

                    button.onclick =
                        function () {

                            categoryButtons
                                .querySelectorAll(
                                    ".category-btn"
                                )
                                .forEach(
                                    function (btn) {

                                        btn.classList.remove(
                                            "active"
                                        );
                                    }
                                );


                            button.classList.add(
                                "active"
                            );


                            currentCategory =
                                button.dataset.filter ||
                                "all";


                            filterMenu();
                        };
                }
            );
    }


    /* =====================================================
       FILTER MENU
    ===================================================== */

    function filterMenu() {

        if (!menuSections) {

            return;
        }


        const sections =
            menuSections.querySelectorAll(
                ".menu-section"
            );


        const searchText =
            menuSearch
                ? menuSearch.value
                    .trim()
                    .toLowerCase()
                : "";


        let totalVisibleItems =
            0;


        sections.forEach(
            function (section) {

                /*
                   Ignore special sections.
                */

                if (
                    section.classList.contains(
                        "special"
                    )
                ) {

                    return;
                }


                const sectionCategory =
                    section.dataset.category ||
                    "other";


                const categoryMatches =
                    currentCategory === "all" ||
                    getCategorySlug(
                        sectionCategory
                    ) === currentCategory;


                const items =
                    section.querySelectorAll(
                        ".menu-item"
                    );


                let visibleItems =
                    0;


                items.forEach(
                    function (item) {

                        const name =
                            (
                                item.dataset.name ||
                                item.querySelector("h3")?.textContent ||
                                ""
                            )
                                .toLowerCase();


                        const description =
                            (
                                item.dataset.description ||
                                item.querySelector("p")?.textContent ||
                                ""
                            )
                                .toLowerCase();


                        const searchMatches =
                            searchText === "" ||
                            name.includes(
                                searchText
                            ) ||
                            description.includes(
                                searchText
                            );


                        const shouldShow =
                            categoryMatches &&
                            searchMatches;


                        item.style.display =
                            shouldShow
                                ? ""
                                : "none";


                        if (
                            shouldShow
                        ) {

                            visibleItems++;

                            totalVisibleItems++;
                        }
                    }
                );


                /*
                   Show section only when
                   it contains visible products.
                */

                if (
                    visibleItems > 0
                ) {

                    section.style.display =
                        "";

                } else {

                    /*
                       Intro/empty backend section
                       shouldn't stay visible.
                    */

                    if (
                        items.length > 0
                    ) {

                        section.style.display =
                            "none";
                    }
                }
            }
        );


        /*
           NO RESULTS
        */

        if (noResults) {

            if (
                totalVisibleItems === 0
            ) {

                noResults.classList.add(
                    "show"
                );

            } else {

                noResults.classList.remove(
                    "show"
                );
            }
        }
    }


    /* =====================================================
       SEARCH
    ===================================================== */

    if (menuSearch) {

        menuSearch.addEventListener(
            "input",
            function () {

                filterMenu();
            }
        );
    }


    /* =====================================================
       IMAGE FALLBACK
    ===================================================== */

    function setupImageFallback() {

        document
            .querySelectorAll(
                "#menuSections img"
            )
            .forEach(
                function (img) {

                    if (
                        img.dataset.fallbackReady
                    ) {

                        return;
                    }


                    img.dataset.fallbackReady =
                        "true";


                    img.addEventListener(
                        "error",
                        function () {

                            if (
                                img.dataset.fallbackUsed
                            ) {

                                return;
                            }


                            img.dataset.fallbackUsed =
                                "true";


                            const section =
                                img.closest(
                                    ".menu-section"
                                );


                            const category =
                                section
                                    ? (
                                        section.dataset.categoryName ||
                                        section.dataset.category ||
                                        "other"
                                    )
                                    : "other";


                            img.src =
                                getCategoryImage(
                                    category
                                );
                        }
                    );
                }
            );
    }


    /* =====================================================
       MOBILE NAVIGATION
    ===================================================== */

    if (
        menuToggle &&
        navLinks
    ) {

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


                            target.scrollIntoView({
                                behavior: "smooth",
                                block: "start"
                            });
                        }
                    }
                );
            }
        );


    /* =====================================================
       INITIAL LOAD
    ===================================================== */

    bindCategoryButtons();

    setupImageFallback();

    filterMenu();


    Promise.all([
        loadCategories(),
        loadProducts()
    ])
        .then(
            function () {

                renderCategoryButtons();

                filterMenu();

                setupImageFallback();


                console.log(
                    "================================"
                );

                console.log(
                    "COLD CAFE MENU LOADED"
                );

                console.log(
                    "Backend Products:",
                    allProducts.length
                );

                console.log(
                    "Backend Categories:",
                    allCategories.length
                );

                console.log(
                    "================================"
                );
            }
        )
        .catch(
            function (error) {

                console.error(
                    "MENU INITIALIZATION ERROR:",
                    error
                );
            }
        );


    /* =====================================================
       MANUAL REFRESH
    ===================================================== */

    window.refreshMenuFromBackend =
        async function () {

            try {

                await Promise.all([
                    loadCategories(),
                    loadProducts()
                ]);


                renderCategoryButtons();

                filterMenu();

                setupImageFallback();


                console.log(
                    "Menu refreshed successfully."
                );


                return {

                    success: true,

                    products:
                        allProducts,

                    categories:
                        allCategories
                };


            } catch (error) {

                console.error(
                    "MENU REFRESH ERROR:",
                    error
                );


                return {

                    success: false,

                    error: error
                };
            }
        };


    /* =====================================================
       AUTO REFRESH
    ===================================================== */

    function startMenuAutoRefresh() {

        if (
            menuRefreshInterval
        ) {

            clearInterval(
                menuRefreshInterval
            );
        }


        menuRefreshInterval =
            setInterval(
                async function () {

                    if (
                        menuRefreshInProgress
                    ) {

                        return;
                    }


                    menuRefreshInProgress =
                        true;


                    try {

                        await Promise.all([
                            loadCategories(),
                            loadProducts()
                        ]);


                        renderCategoryButtons();

                        filterMenu();

                        setupImageFallback();


                    } catch (error) {

                        console.error(
                            "AUTO REFRESH ERROR:",
                            error
                        );


                    } finally {

                        menuRefreshInProgress =
                            false;
                    }

                },
                30000
            );
    }


    startMenuAutoRefresh();


    /* =====================================================
       VISIBILITY CHANGE
    ===================================================== */

    document.addEventListener(
        "visibilitychange",
        function () {

            if (
                document.hidden
            ) {

                if (
                    menuRefreshInterval
                ) {

                    clearInterval(
                        menuRefreshInterval
                    );


                    menuRefreshInterval =
                        null;
                }

            } else {

                startMenuAutoRefresh();


                if (
                    typeof window.refreshMenuFromBackend ===
                    "function"
                ) {

                    window.refreshMenuFromBackend();
                }
            }
        }
    );


    /* =====================================================
       FINAL
    ===================================================== */

    console.log(
        "Cold Cafe Menu JavaScript initialized."
    );

});
document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       ELEMENTS
    ===================================================== */

    const menuSearch =
        document.getElementById("menuSearch");

    const categoryButtons =
        document.querySelectorAll(".category-btn");

    const noResults =
        document.getElementById("noResults");

    const menuToggle =
        document.getElementById("menuToggle");

    const navLinks =
        document.getElementById("navLinks");

    const dynamicProducts =
        document.getElementById("dynamicProducts");


    /* =====================================================
       API
    ===================================================== */

    const API_URL =
        "http://localhost:5000/api";


    let currentCategory = "all";


    /* =====================================================
       MOBILE NAVIGATION
    ===================================================== */

    if (menuToggle && navLinks) {

        menuToggle.addEventListener(
            "click",
            () => {

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
            .forEach(link => {

                link.addEventListener(
                    "click",
                    () => {

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

            });

    }


    /* =====================================================
       ESCAPE HTML
       Prevents invalid HTML when backend data is rendered.
    ===================================================== */

    function escapeHTML(value) {

        const div =
            document.createElement("div");


        div.textContent =
            value === null ||
            value === undefined
                ? ""
                : String(value);


        return div.innerHTML;

    }


    /* =====================================================
       CATEGORY SLUG
    ===================================================== */

    function getCategorySlug(category) {

        const value =
            String(category || "")
                .toLowerCase()
                .trim();


        if (
            value.includes("waffle")
        ) {

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
            value.includes("mojito") ||
            value.includes("tea") ||
            value.includes("refresh")
        ) {

            return "refreshers";

        }


        return "other";

    }


    /* =====================================================
       CATEGORY IMAGE
    ===================================================== */

    function getCategoryImage(category) {

        const slug =
            getCategorySlug(category);


        const images = {

            waffles:
                "https://i.pinimg.com/1200x/f4/88/fa/f488fa3048a4597dbde4cc6badded47c.jpg",

            bubble:
                "https://i.pinimg.com/736x/fd/2d/b7/fd2db79e9adb3d8146a7c8ff52a554bf.jpg",

            coffee:
                "https://i.pinimg.com/736x/55/5e/bb/555ebb52070c9043eaf2611008e76e2e.jpg",

            shakes:
                "https://i.pinimg.com/736x/de/cb/21/decb215d1078fa6485e9e44e0f52a2de.jpg",

            refreshers:
                "https://i.pinimg.com/1200x/eb/9f/35/eb9f3539e2631d4140af212477a99277.jpg",

            other:
                "https://i.pinimg.com/1200x/97/a5/47/97a547cda8e06f3899cd55427fdecb57.jpg"

        };


        return (
            images[slug] ||
            images.other
        );

    }


    /* =====================================================
       FORMAT PRICE
    ===================================================== */

    function formatPrice(price) {

        const number =
            Number(price);


        if (
            Number.isNaN(number)
        ) {

            return "0";

        }


        return number.toFixed(0);

    }


    /* =====================================================
       RENDER BACKEND PRODUCTS
    ===================================================== */

    function renderBackendProducts(
        products
    ) {

        if (!dynamicProducts) {

            console.error(
                "dynamicProducts element not found."
            );

            return;

        }


        dynamicProducts.innerHTML = "";


        if (
            !Array.isArray(products) ||
            products.length === 0
        ) {

            return;

        }


        const groupedProducts = {};


        products.forEach(product => {

            const category =
                product.category ||
                "Other";


            if (
                !groupedProducts[category]
            ) {

                groupedProducts[category] = [];

            }


            groupedProducts[category]
                .push(product);

        });


        Object.entries(
            groupedProducts
        ).forEach(
            ([category, categoryProducts]) => {

                const section =
                    document.createElement(
                        "section"
                    );


                section.className =
                    "menu-section backend-menu-section";


                section.dataset.category =
                    getCategorySlug(
                        category
                    );


                const firstProduct =
                    categoryProducts[0];


                const image =
                    firstProduct &&
                    firstProduct.image
                        ? firstProduct.image
                        : getCategoryImage(
                            category
                        );


                section.innerHTML = `

                    <div class="menu-image">

                        <img
                            src="${escapeHTML(image)}"
                            alt="${escapeHTML(category)}"
                            loading="lazy"
                        >

                        <span class="image-badge">
                            Freshly Added
                        </span>

                    </div>


                    <div class="menu-content">

                        <span>
                            OUR MENU
                        </span>

                        <h2>
                            ${escapeHTML(category)}
                        </h2>

                        <p class="menu-text">
                            Freshly prepared
                            favourites from
                            Cold Cafe.
                        </p>


                        <div class="menu-list">

                            ${categoryProducts
                                .map(product => {

                                    const name =
                                        escapeHTML(
                                            product.name ||
                                            "Unnamed Product"
                                        );


                                    const description =
                                        escapeHTML(
                                            product.description ||
                                            "Freshly prepared at Cold Cafe."
                                        );


                                    const price =
                                        formatPrice(
                                            product.price
                                        );


                                    return `

                                        <article
                                            class="menu-item backend-product"
                                            data-name="${name}"
                                        >

                                            <div class="item-name">

                                                <h3>
                                                    ${name}
                                                </h3>

                                                <span class="line"></span>

                                                <h4>
                                                    NPR ${price}
                                                </h4>

                                            </div>


                                            <p>
                                                ${description}
                                            </p>

                                        </article>

                                    `;

                                })
                                .join("")}

                        </div>

                    </div>

                `;


                dynamicProducts.appendChild(
                    section
                );

            }
        );


        /*
         * Observe newly created sections
         */

        dynamicProducts
            .querySelectorAll(
                ".menu-section"
            )
            .forEach(section => {

                revealObserver.observe(
                    section
                );

            });


        /*
         * Apply current search/category
         */

        filterMenu();

    }


    /* =====================================================
       LOAD PRODUCTS FROM BACKEND
    ===================================================== */

    async function loadProducts() {

        try {

            console.log(
                "Loading products from backend..."
            );


            const response =
                await fetch(
                    `${API_URL}/products`
                );


            if (!response.ok) {

                throw new Error(
                    `HTTP Error: ${response.status}`
                );

            }


            const products =
                await response.json();


            console.log(
                "Products from backend:",
                products
            );


            renderBackendProducts(
                products
            );


        } catch (error) {

            console.error(
                "Backend products could not be loaded:",
                error
            );


            /*
             * Backend down bhaye pani
             * static menu normally works.
             */

            filterMenu();

        }

    }
        /* =====================================================
       SEARCH + CATEGORY FILTER
    ===================================================== */

    function filterMenu() {

        /*
         * IMPORTANT:
         * querySelectorAll() function bhitra rakheko cha,
         * so dynamically loaded backend products pani
         * automatically include huncha.
         */

        const menuSections =
            document.querySelectorAll(
                "#menuSections .menu-section"
            );


        const searchText =
            menuSearch
                ? menuSearch.value
                    .trim()
                    .toLowerCase()
                : "";


        let totalVisibleItems = 0;


        menuSections.forEach(section => {

            const sectionCategory =
                section.dataset.category ||
                "other";


            const categoryMatches =
                currentCategory === "all" ||
                sectionCategory ===
                    currentCategory;


            const menuItems =
                section.querySelectorAll(
                    ".menu-item, .drink-card"
                );


            let sectionVisibleItems = 0;


            menuItems.forEach(item => {

                const itemName =
                    (
                        item.dataset.name ||
                        item.textContent ||
                        ""
                    )
                    .toLowerCase();


                const searchMatches =
                    searchText === "" ||
                    itemName.includes(
                        searchText
                    );


                const shouldShow =
                    categoryMatches &&
                    searchMatches;


                if (shouldShow) {

                    item.style.display =
                        "";


                    sectionVisibleItems++;

                    totalVisibleItems++;

                } else {

                    item.style.display =
                        "none";

                }

            });


            if (
                categoryMatches &&
                sectionVisibleItems > 0
            ) {

                section.style.display =
                    "";

            } else {

                section.style.display =
                    "none";

            }

        });


        /*
         * No results message
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
       CATEGORY BUTTONS
    ===================================================== */

    categoryButtons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                categoryButtons.forEach(
                    btn => {

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

            }
        );

    });


    /* =====================================================
       SEARCH
    ===================================================== */

    if (menuSearch) {

        menuSearch.addEventListener(
            "input",
            () => {

                filterMenu();

            }
        );

    }


    /* =====================================================
       SCROLL REVEAL
    ===================================================== */

    const revealObserver =
        new IntersectionObserver(
            (entries, observer) => {

                entries.forEach(
                    entry => {

                        if (
                            entry.isIntersecting
                        ) {

                            entry.target.classList.add(
                                "visible"
                            );


                            observer.unobserve(
                                entry.target
                            );

                        }

                    }
                );

            },
            {
                threshold: 0.08
            }
        );


    /*
     * Existing static sections
     */

    document
        .querySelectorAll(
            "#menuSections .menu-section"
        )
        .forEach(section => {

            revealObserver.observe(
                section
            );

        });


    /* =====================================================
       SMOOTH ANCHOR
    ===================================================== */

    document
        .querySelectorAll(
            'a[href^="#"]'
        )
        .forEach(anchor => {

            anchor.addEventListener(
                "click",
                event => {

                    const targetId =
                        anchor.getAttribute(
                            "href"
                        );


                    if (
                        targetId === "#" ||
                        !targetId
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

        });


    /* =====================================================
       START
    ===================================================== */

    /*
     * First static menu filter
     */

    filterMenu();


    /*
     * Then load products from backend
     */

    loadProducts();

});
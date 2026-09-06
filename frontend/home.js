/* =====================================================
   COLD CAFE HOME PAGE
   BACKEND API INTEGRATION

   Connected Sections:

   1. Special Menu
   2. Best Sellers
   3. Home Gallery

   Backend:
   https://cold-cafe-backend-1.onrender.com

   Existing CSS/design is preserved.
===================================================== */


document.addEventListener("DOMContentLoaded", () => {


    /* =====================================================
       API BASE URL
    ====================================================== */

    const API_BASE_URL =
        String(import.meta.env.VITE_API_URL || "")
            .replace(/\/+$/, "");


    if (!API_BASE_URL) {

        console.error(
            "VITE_API_URL is missing from .env"
        );

        return;

    }


    const HOME_API_URL =
        `${API_BASE_URL}/api/home`;


    /* =====================================================
       HTML CONTAINERS
    ====================================================== */

    const specialMenuContainer =
        document.getElementById(
            "specialMenuContainer"
        );


    const bestSellerContainer =
        document.getElementById(
            "bestSellerContainer"
        );


    const galleryContainer =
        document.getElementById(
            "homeGalleryGrid"
        );



    /* =====================================================
       ESCAPE HTML
       Prevents unsafe HTML from backend data
    ====================================================== */

    function escapeHTML(value) {

        const element =
            document.createElement("div");


        element.textContent =
            value === null ||
            value === undefined
                ? ""
                : String(value);


        return element.innerHTML;

    }



    /* =====================================================
       IMAGE URL HANDLER
    ====================================================== */

    function getImageURL(value) {

        const image =
            String(value || "").trim();


        if (!image) {

            return "";

        }


        /* Full URL */

        if (
            image.startsWith("http://") ||
            image.startsWith("https://")
        ) {

            return image;

        }


        /* Protocol relative URL */

        if (
            image.startsWith("//")
        ) {

            return (
                window.location.protocol +
                image
            );

        }


        /* Backend absolute path */

        if (
            image.startsWith("/")
        ) {

            return (
                `${API_BASE_URL}${image}`
            );

        }


        /* Backend relative path */

        return (
            `${API_BASE_URL}/${image.replace(
                /^\.?\//,
                ""
            )}`
        );

    }



    /* =====================================================
       GET IMAGE FROM DIFFERENT POSSIBLE FIELD NAMES
    ====================================================== */

    function getImage(item) {

        return getImageURL(

            item?.image ||

            item?.imageUrl ||

            item?.imageURL ||

            item?.photo ||

            item?.photoUrl ||

            item?.url ||

            ""

        );

    }



    /* =====================================================
       PRICE FORMAT
    ====================================================== */

    function formatPrice(value) {

        const number =
            Number(value);


        if (!Number.isFinite(number)) {

            return String(
                value ?? ""
            );

        }


        if (
            Number.isInteger(number)
        ) {

            return `Rs. ${number}`;

        }


        return `Rs. ${number.toFixed(2)}`;

    }



    /* =====================================================
       FETCH JSON
    ====================================================== */

    async function getJSON(url) {

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


        const text =
            await response.text();


        let data = {};


        try {

            data =
                text
                    ? JSON.parse(text)
                    : {};

        } catch (error) {

            throw new Error(
                `Invalid JSON response from ${url}`
            );

        }


        if (!response.ok) {

            throw new Error(

                data?.message ||

                `Request failed with status ${response.status}`

            );

        }


        return data;

    }



    /* =====================================================
       EXTRACT ARRAY

       Backend response can be:

       []
       { data: [] }
       { products: [] }
       { items: [] }
       etc.
    ====================================================== */

    function extractArray(
        data,
        keys = []
    ) {


        /* Direct array */

        if (
            Array.isArray(data)
        ) {

            return data;

        }


        /* Named array */

        for (
            const key of keys
        ) {

            if (
                data &&
                Array.isArray(
                    data[key]
                )
            ) {

                return data[key];

            }

        }


        /* data array */

        if (
            data &&
            data.data &&
            Array.isArray(
                data.data
            )
        ) {

            return data.data;

        }


        /* results array */

        if (
            data &&
            data.results &&
            Array.isArray(
                data.results
            )
        ) {

            return data.results;

        }


        return [];

    }



    /* =====================================================
       DISPLAY MESSAGE
    ====================================================== */

    function renderMessage(
        container,
        message
    ) {

        if (!container) {

            return;

        }


        container.innerHTML =

            `<p style="
                grid-column:1/-1;
                text-align:center;
            ">
                ${escapeHTML(message)}
            </p>`;

    }



    /* =====================================================
       SPECIAL MENU
    ======================================================

       Backend:

       GET
       /api/home/specialmenu

    ====================================================== */

    function renderSpecialMenu(
        items
    ) {


        if (!specialMenuContainer) {

            return;

        }


        if (
            !items.length
        ) {

            renderMessage(
                specialMenuContainer,
                "No special menu items available right now."
            );

            return;

        }


        specialMenuContainer.innerHTML =

            items
                .map(
                    (item) => {


                        const name =

                            item?.name ||

                            item?.title ||

                            "Special Menu";


                        const description =

                            item?.description ||

                            "";


                        const image =
                            getImage(item);


                        const imageHTML =

                            image

                                ? `
                                    <img
                                        src="${escapeHTML(image)}"
                                        alt="${escapeHTML(name)}"
                                        loading="lazy"
                                        onerror="this.style.display='none';"
                                    >
                                  `

                                : `
                                    <span
                                        aria-hidden="true"
                                    ></span>
                                  `;


                        return `

                            <div class="card">

                                <div class="card-img">

                                    ${imageHTML}

                                </div>


                                <div class="card-content">

                                    <h3>
                                        ${escapeHTML(name)}
                                    </h3>


                                    <p>

                                        ${escapeHTML(
                                            description
                                        )}

                                    </p>


                                    <div class="price">

                                        <h4>

                                            ${escapeHTML(
                                                formatPrice(
                                                    item?.price
                                                )
                                            )}

                                        </h4>


                                        <a
                                            href="menu.html"
                                            aria-label="View ${escapeHTML(
                                                name
                                            )}"
                                        >

                                            <i
                                                class="ri-shopping-bag-3-fill"
                                            ></i>

                                        </a>

                                    </div>

                                </div>

                            </div>

                        `;

                    }
                )
                .join("");

    }



    /* =====================================================
       LOAD SPECIAL MENU
    ====================================================== */

    async function loadSpecialMenu() {

        try {


            const data =

                await getJSON(

                    `${HOME_API_URL}/specialmenu`

                );


            const items =

                extractArray(
                    data,
                    [
                        "specialMenu",
                        "specialmenu",
                        "products",
                        "items"
                    ]
                );


            renderSpecialMenu(
                items
            );


        } catch (error) {


            console.error(
                "Special Menu API error:",
                error
            );


            renderMessage(

                specialMenuContainer,

                "Unable to load the special menu."

            );

        }

    }



    /* =====================================================
       BEST SELLERS
    ======================================================

       Backend:

       GET
       /api/home/Bestsellers

    ====================================================== */

    function renderBestSellers(
        items
    ) {


        if (!bestSellerContainer) {

            return;

        }


        if (
            !items.length
        ) {

            renderMessage(

                bestSellerContainer,

                "No best sellers available right now."

            );

            return;

        }


        bestSellerContainer.innerHTML =

            items
                .map(
                    (item) => {


                        const title =

                            item?.title ||

                            item?.name ||

                            "Best Seller";


                        const description =

                            item?.description ||

                            "";


                        const image =
                            getImage(item);


                        const imageHTML =

                            image

                                ? `
                                    <img
                                        src="${escapeHTML(image)}"
                                        alt="${escapeHTML(title)}"
                                        loading="lazy"
                                        onerror="this.style.display='none';"
                                    >
                                  `

                                : `
                                    <div
                                        style="
                                            height:370px;
                                            background:#fff;
                                        "
                                    ></div>
                                  `;


                        return `

                            <div class="best-card">

                                ${imageHTML}


                                <div class="best-content">

                                    <h3>

                                        ${escapeHTML(
                                            title
                                        )}

                                    </h3>


                                    <p>

                                        ${escapeHTML(
                                            description
                                        )}

                                    </p>


                                    <span>

                                        ${escapeHTML(
                                            formatPrice(
                                                item?.price
                                            )
                                        )}

                                    </span>

                                </div>

                            </div>

                        `;

                    }
                )
                .join("");

    }



    /* =====================================================
       LOAD BEST SELLERS
    ====================================================== */

    async function loadBestSellers() {

        try {


            const data =

                await getJSON(

                    `${HOME_API_URL}/Bestsellers`

                );


            const items =

                extractArray(

                    data,

                    [
                        "bestSellers",
                        "bestsellers",
                        "bestSeller",
                        "items"
                    ]

                );


            renderBestSellers(
                items
            );


        } catch (error) {


            console.error(
                "Best Sellers API error:",
                error
            );


            renderMessage(

                bestSellerContainer,

                "Unable to load best sellers."

            );

        }

    }



    /* =====================================================
       HOME GALLERY
    ======================================================

       Backend:

       GET
       /api/home/Gallery

    ====================================================== */

    function renderGallery(
        items
    ) {


        if (!galleryContainer) {

            return;

        }


        if (
            !items.length
        ) {

            renderMessage(

                galleryContainer,

                "No gallery photos available right now."

            );

            return;

        }


        galleryContainer.innerHTML =

            items

                .map(
                    (item, index) => {


                        const image =
                            getImage(item);


                        if (!image) {

                            return "";

                        }


                        return `

                            <img
                                src="${escapeHTML(image)}"
                                alt="Cold Cafe gallery photo ${
                                    index + 1
                                }"
                                loading="lazy"
                                onerror="this.remove();"
                            >

                        `;

                    }
                )

                .join("");

    }



    /* =====================================================
       LOAD GALLERY
    ====================================================== */

    async function loadGallery() {

        try {


            const data =

                await getJSON(

                    `${HOME_API_URL}/Gallery`

                );


            const items =

                extractArray(

                    data,

                    [
                        "gallery",
                        "galleries",
                        "items"
                    ]

                );


            renderGallery(
                items
            );


        } catch (error) {


            console.error(
                "Gallery API error:",
                error
            );


            renderMessage(

                galleryContainer,

                "Unable to load the gallery."

            );

        }

    }



    /* =====================================================
       LOAD ALL SECTIONS
    ======================================================

       Each section loads independently.

       So if Gallery fails,
       Special Menu and Best Sellers
       still work.
    ====================================================== */

    loadSpecialMenu();

    loadBestSellers();

    loadGallery();


});
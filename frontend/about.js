/* =====================================================
   ABOUT PAGE
   ABOUT + STATUS + WHY US + TEAM + REVIEW BACKEND
   INTEGRATION
====================================================== */


/* =====================================================
   API URL
====================================================== */

const API_URL = import.meta.env.VITE_API_URL;


/* =====================================================
   LOAD ABOUT STORY
====================================================== */

const aboutFields = {
    image: document.getElementById("storyImage"),
    label: document.getElementById("storyLabel"),
    heading: document.getElementById("storyHeading"),
    paragraph1: document.getElementById("storyParagraph1"),
    paragraph2: document.getElementById("storyParagraph2"),
    feature1: document.getElementById("featureTitle1"),
    feature2: document.getElementById("featureTitle2"),
    feature3: document.getElementById("featureTitle3"),
    feature4: document.getElementById("featureTitle4")
};


function getAboutValue(about, names) {

    const name = names.find(
        (fieldName) =>
            about[fieldName] !== undefined &&
            about[fieldName] !== null
    );

    return name
        ? about[name]
        : null;
}


function getAboutPayload(responseData) {

    if (
        !responseData ||
        typeof responseData !== "object"
    ) {
        return null;
    }


    const payload =
        responseData.data ||
        responseData.about ||
        responseData.aboutData ||
        responseData.result ||
        responseData;


    return payload &&
        typeof payload === "object"
        ? payload
        : null;
}


function getImageUrl(value) {

    const imageUrl =
        String(value).trim();


    if (!imageUrl) {
        return null;
    }


    try {

        return new URL(
            imageUrl,
            `${String(API_URL).replace(/\/+$/, "")}/`
        ).toString();

    }
    catch (error) {

        return imageUrl;

    }

}


async function loadAbout() {

    if (!aboutFields.image) {
        return;
    }


    try {

        if (!API_URL) {
            throw new Error(
                "VITE_API_URL is not available."
            );
        }


        const response =
            await fetch(
                `${String(API_URL).replace(/\/+$/, "")}/api/about`,
                {
                    cache: "no-store"
                }
            );


        if (!response.ok) {

            throw new Error(
                `About API Error: ${response.status}`
            );

        }


        const responseData =
            await response.json();


        const about =
            getAboutPayload(responseData);


        if (
            !about ||
            typeof about !== "object"
        ) {

            throw new Error(
                "About API returned an invalid response."
            );

        }


        const fields = [

            [
                aboutFields.image,
                [
                    "storyImage",
                    "storyImageUrl",
                    "image",
                    "imageUrl"
                ]
            ],

            [
                aboutFields.label,
                [
                    "storySectionLabel",
                    "storyLabel",
                    "sectionLabel",
                    "label"
                ]
            ],

            [
                aboutFields.heading,
                [
                    "storyHeading",
                    "storyTitle",
                    "heading",
                    "title"
                ]
            ],

            [
                aboutFields.paragraph1,
                [
                    "storyParagraph1",
                    "firstParagraph",
                    "paragraph1",
                    "storyDescription1"
                ]
            ],

            [
                aboutFields.paragraph2,
                [
                    "storyParagraph2",
                    "secondParagraph",
                    "paragraph2",
                    "storyDescription2"
                ]
            ],

            [
                aboutFields.feature1,
                [
                    "feature1Title",
                    "feature1"
                ]
            ],

            [
                aboutFields.feature2,
                [
                    "feature2Title",
                    "feature2"
                ]
            ],

            [
                aboutFields.feature3,
                [
                    "feature3Title",
                    "feature3"
                ]
            ],

            [
                aboutFields.feature4,
                [
                    "feature4Title",
                    "feature4"
                ]
            ]

        ];


        fields.forEach(
            ([element, names]) => {

                const value =
                    element
                        ? getAboutValue(
                            about,
                            names
                        )
                        : null;


                if (value === null) {
                    return;
                }


                if (
                    element ===
                    aboutFields.image
                ) {

                    const imageUrl =
                        getImageUrl(value);


                    if (imageUrl) {

                        element.src =
                            `${imageUrl}${imageUrl.includes("?") ? "&" : "?"}v=${Date.now()}`;

                    }

                }
                else {

                    element.textContent =
                        String(value);

                }

            }
        );

    }
    catch (error) {

        console.error(
            "Failed to load About content:",
            error
        );

    }

}


/* =====================================================
   STATUS CONTAINERS
====================================================== */

const statusContainers = {

    yearsExperience:
        document.getElementById(
            "yearsExperience"
        ),

    happyCustomers:
        document.getElementById(
            "happyCustomers"
        ),

    signatureDrinks:
        document.getElementById(
            "signatureDrinks"
        ),

    customerRating:
        document.getElementById(
            "customerRating"
        )

};


/* =====================================================
   LOAD STATUS
====================================================== */

async function loadStatus() {

    const containers =
        Object.values(statusContainers)
            .filter(Boolean);


    if (containers.length === 0) {
        return;
    }


    containers.forEach(
        (container) => {

            container.textContent =
                "Loading...";

        }
    );


    try {

        if (!API_URL) {

            throw new Error(
                "VITE_API_URL is not available."
            );

        }


        const response =
            await fetch(
                `${API_URL}/api/status`
            );


        if (!response.ok) {

            throw new Error(
                `Status API Error: ${response.status}`
            );

        }


        const responseData =
            await response.json();


        const status =
            responseData &&
            responseData.data
                ? responseData.data
                : responseData;


        if (statusContainers.yearsExperience) {

            statusContainers.yearsExperience.textContent =
                formatCount(
                    status.yearsExperience
                );

        }


        if (statusContainers.happyCustomers) {

            statusContainers.happyCustomers.textContent =
                formatCustomers(
                    status.happyCustomers
                );

        }


        if (statusContainers.signatureDrinks) {

            statusContainers.signatureDrinks.textContent =
                formatCount(
                    status.signatureDrinks
                );

        }


        if (statusContainers.customerRating) {

            statusContainers.customerRating.textContent =
                formatRating(
                    status.customerRating
                );

        }

    }
    catch (error) {

        console.error(
            "Failed to load cafe status:",
            error
        );


        containers.forEach(
            (container) => {

                container.textContent = "—";

            }
        );

    }

}


function formatCount(value) {

    const number =
        Number(value);


    return Number.isFinite(number)
        ? `${number}+`
        : "—";

}


function formatCustomers(value) {

    const number =
        Number(value);


    if (!Number.isFinite(number)) {
        return "—";
    }


    const formatted =
        new Intl.NumberFormat(
            "en",
            {
                notation: "compact",
                maximumFractionDigits: 1
            }
        ).format(number);


    return `${formatted}+`;

}


function formatRating(value) {

    const number =
        Number(value);


    return Number.isFinite(number)
        ? `${number}★`
        : "—";

}


/* =====================================================
   WHY US CONTAINER
====================================================== */

const whyUsContainer =
    document.querySelector(
        ".why-container"
    );


/* =====================================================
   GET WHY US ARRAY
====================================================== */

function getWhyUsArray(responseData) {

    if (Array.isArray(responseData)) {
        return responseData;
    }


    if (
        !responseData ||
        typeof responseData !== "object"
    ) {
        return [];
    }


    const possibleArrays = [

        responseData.data,

        responseData.whyUs,

        responseData.why_us,

        responseData.whyUsItems,

        responseData.items,

        responseData.results

    ];


    for (
        const value
        of possibleArrays
    ) {

        if (Array.isArray(value)) {
            return value;
        }

    }


    return [];

}


/* =====================================================
   GET WHY US FIELD
====================================================== */

function getWhyUsValue(
    item,
    names,
    fallback = ""
) {

    if (
        !item ||
        typeof item !== "object"
    ) {
        return fallback;
    }


    const fieldName =
        names.find(
            (name) =>
                item[name] !== undefined &&
                item[name] !== null &&
                String(
                    item[name]
                ).trim() !== ""
        );


    return fieldName
        ? item[fieldName]
        : fallback;

}


/* =====================================================
   CREATE WHY US CARD
====================================================== */

function createWhyUsCard(item) {

    const title =
        getWhyUsValue(
            item,
            [
                "title",
                "name",
                "heading",
                "featureTitle",
                "whyUsTitle"
            ],
            "Cold Cafe"
        );


    const description =
        getWhyUsValue(
            item,
            [
                "description",
                "text",
                "content",
                "details",
                "whyUsDescription"
            ],
            ""
        );


    const icon =
        getWhyUsValue(
            item,
            [
                "icon",
                "iconClass",
                "iconName",
                "symbol"
            ],
            "ri-cup-fill"
        );


    const card =
        document.createElement(
            "div"
        );


    card.className =
        "why-card";


    card.innerHTML = `

        <i class="${escapeHTML(icon)}"></i>

        <h3>
            ${escapeHTML(title)}
        </h3>

        <p>
            ${escapeHTML(description)}
        </p>

    `;


    return card;

}


/* =====================================================
   LOAD WHY US
   ADMIN DASHBOARD -> BACKEND -> ABOUT PAGE
====================================================== */

async function loadWhyUs() {

    if (!whyUsContainer) {

        console.warn(
            "Why Us container not found."
        );

        return;

    }


    /*
       Save existing HTML.

       If backend is empty or unavailable,
       the original Why Us cards will stay visible.
    */

    const originalHTML =
        whyUsContainer.innerHTML;


    try {

        if (!API_URL) {

            throw new Error(
                "VITE_API_URL is not available."
            );

        }


        const baseURL =
            String(API_URL)
                .replace(/\/+$/, "");


        /*
           Primary endpoint:
           /api/why-us

           Small fallback:
           /api/whyus

           This does not change the frontend UI.
        */

        const endpoints = [

            `${baseURL}/api/why-us`,

            `${baseURL}/api/whyus`

        ];


        let response = null;

        let lastError = null;


        for (
            const endpoint
            of endpoints
        ) {

            try {

                const currentResponse =
                    await fetch(
                        endpoint,
                        {
                            cache: "no-store"
                        }
                    );


                if (
                    currentResponse.ok
                ) {

                    response =
                        currentResponse;

                    break;

                }


                lastError =
                    new Error(
                        `Why Us API Error: ${currentResponse.status}`
                    );

            }
            catch (error) {

                lastError =
                    error;

            }

        }


        if (!response) {

            throw (
                lastError ||
                new Error(
                    "Why Us API is unavailable."
                )
            );

        }


        const responseData =
            await response.json();


        console.log(
            "Why Us data:",
            responseData
        );


        const whyUsItems =
            getWhyUsArray(
                responseData
            );


        /*
           If no data is added from admin,
           do not destroy the existing design.
        */

        if (
            whyUsItems.length === 0
        ) {

            whyUsContainer.innerHTML =
                originalHTML;

            return;

        }


        /*
           Backend has data.

           Only the Why Us cards are replaced.
           HTML and CSS remain untouched.
        */

        whyUsContainer.innerHTML =
            "";


        whyUsItems.forEach(
            (item) => {

                const card =
                    createWhyUsCard(
                        item
                    );


                whyUsContainer.appendChild(
                    card
                );

            }
        );

    }
    catch (error) {

        console.error(
            "Failed to load Why Us content:",
            error
        );


        /*
           Backend error bhaye
           existing cards preserve garne.
        */

        whyUsContainer.innerHTML =
            originalHTML;

    }

}


/* =====================================================
   TEAM CONTAINER
====================================================== */

const teamContainer =
    document.getElementById(
        "teamContainer"
    );


/* =====================================================
   REVIEW CONTAINER
====================================================== */

let testimonialContainer =
    document.getElementById(
        "testimonialContainer"
    );


let reviewPrevBtn =
    document.getElementById(
        "reviewPrevBtn"
    );


let reviewNextBtn =
    document.getElementById(
        "reviewNextBtn"
    );


let reviewSlideIndex = 0;

let reviewSlideTimer = null;

let reviewCardCount = 0;

let isLoadingReviews = false;

let reviewLoadRetryCount = 0;


/* =====================================================
   LOAD REVIEWS
====================================================== */

async function fetchWithRetry(url, options, retries = 3, delayMs = 2000) {
    let lastError = null;
    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000);
            const res = await fetch(url, { ...options, signal: controller.signal });
            clearTimeout(timeoutId);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return await res.json();
        } catch (err) {
            lastError = err;
            if (attempt < retries) {
                await new Promise((r) => setTimeout(r, delayMs * (attempt + 1)));
            }
        }
    }
    throw lastError;
}

async function loadReviews() {

    // Re-query container if module loaded before DOM (prevents missing reviews)
    if (!testimonialContainer) {
        testimonialContainer = document.getElementById("testimonialContainer");
    }
    if (!testimonialContainer) {
        return;
    }

    // Prevent concurrent duplicate loads that cause missing/duplicate cards
    if (isLoadingReviews) {
        return;
    }
    isLoadingReviews = true;

    // Prevent duplicate timers on re-fetch
    clearInterval(reviewSlideTimer);
    reviewSlideTimer = null;
    reviewSlideIndex = 0;
    reviewCardCount = 0;

    testimonialContainer.style.transition = "none";
    testimonialContainer.style.transform = "translateX(0)";

    // Only show loading placeholder on first attempt, keep existing cards on retry
    if (reviewLoadRetryCount === 0) {
        testimonialContainer.innerHTML = `

        <div class="testimonial-card review-loading-card">

            <i class="ri-loader-4-line"></i>

            <p>
                Loading reviews...
            </p>

        </div>

    `;
    }


    try {

        const effectiveAPI =
            API_URL && String(API_URL).trim()
                ? String(API_URL).trim()
                : "https://cold-cafe-backend-1.onrender.com";

        const baseURL =
            String(effectiveAPI).replace(/\/+$/, "");

        // Fetch customer reviews + Google reviews in parallel with retry for Render cold-start.
        // Keep design/backend connection exactly same – only reliability improved.
        const [customerResult, googleResult] =
            await Promise.allSettled([
                fetchWithRetry(`${baseURL}/api/reviews`, { cache: "no-store" }, 2, 1500),
                fetchWithRetry(`${baseURL}/api/google-reviews`, { cache: "no-store" }, 2, 1500)
            ]);

        let allReviews = [];

        // ---- Customer reviews (/api/reviews) ----
        if (customerResult.status === "fulfilled") {
            const responseData = customerResult.value;
            const rawArray =
                Array.isArray(responseData)
                    ? responseData
                    : responseData &&
                      Array.isArray(responseData.data)
                        ? responseData.data
                        : responseData &&
                          Array.isArray(responseData.reviews)
                            ? responseData.reviews
                            : [];

            rawArray.forEach((item) => {
                if (!item || typeof item !== "object") return;
                allReviews.push({
                    _dedupId:
                        item.id !== undefined && item.id !== null
                            ? `customer-id-${String(item.id).trim().toLowerCase()}`
                            : item._id
                              ? `customer-_id-${String(item._id).trim().toLowerCase()}`
                              : null,
                    name: item.name || item.customerName || item.authorName || "Cold Cafe Customer",
                    review: item.review || item.text || item.message || item.comment || "",
                    rating: Number(item.rating),
                    position: item.position || "Customer",
                    _contentKey: `${String(item.name || item.customerName || "").trim().toLowerCase()}|${String(item.review || item.text || item.message || "").trim().toLowerCase()}`
                });
            });
        } else {
            console.warn("Customer reviews fetch failed:", customerResult.reason);
        }

        // ---- Google reviews (/api/google-reviews) ----
        if (googleResult.status === "fulfilled") {
            const googleData = googleResult.value;
            const googleArray =
                Array.isArray(googleData)
                    ? googleData
                    : googleData && Array.isArray(googleData.reviews)
                        ? googleData.reviews
                        : googleData && Array.isArray(googleData.data)
                            ? googleData.data
                            : [];

            googleArray.forEach((item) => {
                if (!item || typeof item !== "object") return;
                const text = item.text || item.review || item.message || "";
                if (!String(text).trim()) return;
                allReviews.push({
                    _dedupId: `google-${String(item.authorName || item.name || "").trim().toLowerCase()}|${String(item.publishTime || item.relativePublishTimeDescription || text).trim().toLowerCase().slice(0, 80)}`,
                    name: item.authorName || item.name || "Cold Cafe Customer",
                    review: text,
                    rating: Number(item.rating),
                    position: "Customer",
                    _contentKey: `${String(item.authorName || item.name || "").trim().toLowerCase()}|${String(text).trim().toLowerCase()}`
                });
            });
        } else {
            console.warn("Google reviews fetch failed:", googleResult.reason);
        }

        // ---- Deduplicate: prevent duplicate reviews when fetching/rendering ----
        const seen = new Map();
        const uniqueReviews = [];
        for (const rev of allReviews) {
            if (!rev.review || String(rev.review).trim() === "") continue;
            const idKey = rev._dedupId ? `id:${rev._dedupId}` : null;
            const contentKey = `content:${rev._contentKey}|${Number.isFinite(rev.rating) ? Math.round(rev.rating) : "norating"}`;
            // If either id or content already seen, skip
            if ((idKey && seen.has(idKey)) || seen.has(contentKey)) continue;
            if (idKey) seen.set(idKey, true);
            seen.set(contentKey, true);
            uniqueReviews.push(rev);
        }

        if (uniqueReviews.length === 0) {
            // Backend cold-start: keep polling automatically without requiring manual refresh
            if (reviewLoadRetryCount < 12) {
                reviewLoadRetryCount++;
                isLoadingReviews = false;
                // Keep loading indicator visible while polling
                if (!testimonialContainer.querySelector(".review-loading-card")) {
                    testimonialContainer.innerHTML = `
                        <div class="testimonial-card review-loading-card">
                            <i class="ri-loader-4-line"></i>
                            <p>Loading reviews...</p>
                        </div>
                    `;
                }
                setTimeout(() => loadReviews(), 2200 + reviewLoadRetryCount * 300);
                return;
            }

            testimonialContainer.innerHTML = `

                <div class="testimonial-card">

                    <i class="ri-double-quotes-l"></i>

                    <p>
                        No reviews available yet.
                    </p>

                </div>

            `;

            return;

        }

        // Success - reset retry counter
        reviewLoadRetryCount = 0;

        reviewCardCount =
            uniqueReviews.length;


        testimonialContainer.innerHTML =
            uniqueReviews.length > 1

                ? createReviewCard(
                    uniqueReviews[
                        uniqueReviews.length - 1
                    ]
                  ) +

                  uniqueReviews
                    .map(createReviewCard)
                    .join("") +

                  createReviewCard(
                      uniqueReviews[0]
                  )

                : uniqueReviews
                    .map(createReviewCard)
                    .join("");


        if (uniqueReviews.length > 1) {

            // Defer slider until layout is ready to avoid missing/offset cards
            requestAnimationFrame(() => {
                requestAnimationFrame(() => startReviewSlider());
            });

        } else {
            // Single card: reset position
            testimonialContainer.style.transform = "translateX(0)";
        }

    }
    catch (error) {

        console.error(
            "Failed to load reviews:",
            error
        );

        // Auto-retry for cold-start / transient network – no manual refresh needed
        if (reviewLoadRetryCount < 12) {
            reviewLoadRetryCount++;
            isLoadingReviews = false;
            if (!testimonialContainer.querySelector(".review-loading-card")) {
                testimonialContainer.innerHTML = `
                    <div class="testimonial-card review-loading-card">
                        <i class="ri-loader-4-line"></i>
                        <p>Loading reviews...</p>
                    </div>
                `;
            }
            setTimeout(() => loadReviews(), 2200 + reviewLoadRetryCount * 300);
            return;
        }


        testimonialContainer.innerHTML = `

            <div class="testimonial-card">

                <i class="ri-double-quotes-l"></i>

                <p>
                    Reviews are temporarily unavailable.
                </p>

            </div>

        `;

        // Even after showing error, keep polling in background so it appears automatically
        setTimeout(() => {
            reviewLoadRetryCount = 8;
            if (!isLoadingReviews) loadReviews();
        }, 5000);

    } finally {
        isLoadingReviews = false;
    }

}


/* =====================================================
   CREATE REVIEW CARD
====================================================== */

function createReviewCard(review) {

    const name =
        review.name ||
        review.customerName ||
        "Cold Cafe Customer";


    const reviewText =
        review.review ||
        review.text ||
        review.message ||
        "Thank you for visiting Cold Cafe.";


    const rating =
        Number(review.rating);


    const stars =
        Number.isFinite(rating)

            ? "★".repeat(
                Math.max(
                    0,
                    Math.min(
                        5,
                        Math.round(rating)
                    )
                )
            )

            : "";


    return `

        <div class="testimonial-card">

            <i class="ri-double-quotes-l"></i>

            <p>
                ${escapeHTML(reviewText)}
            </p>

            ${
                stars
                    ? `
                        <div class="review-stars-display">
                            ${stars}
                        </div>
                      `
                    : ""
            }

            <h3>
                ${escapeHTML(name)}
            </h3>

            <span>
                ${escapeHTML(
                    review.position ||
                    "Customer"
                )}
            </span>

        </div>

    `;

}


/* =====================================================
   START REVIEW SLIDER
====================================================== */

function startReviewSlider() {

    clearInterval(
        reviewSlideTimer
    );

    // Re-query in case DOM was not ready earlier
    if (!testimonialContainer) {
        testimonialContainer = document.getElementById("testimonialContainer");
    }
    if (!testimonialContainer) return;

    const cards = testimonialContainer.querySelectorAll(".testimonial-card");
    if (cards.length < 3) {
        testimonialContainer.style.transform = "translateX(0)";
        return;
    }

    reviewSlideIndex = 1;


    // Ensure layout is ready before measuring (prevents sometimes-missing cards)
    const tryPosition = (attempt = 0) => {
        const card = testimonialContainer.querySelector(".testimonial-card");
        const w = card ? card.getBoundingClientRect().width : 0;
        if (w === 0 && attempt < 10) {
            requestAnimationFrame(() => tryPosition(attempt + 1));
            return;
        }
        setReviewPosition(false);
    };
    tryPosition();


    reviewSlideTimer =
        setInterval(
            () => moveReview(1),
            5500
        );

}


/* =====================================================
   MOVE REVIEW
====================================================== */

function moveReview(direction) {

    if (!testimonialContainer) {
        return;
    }


    const cards =
        testimonialContainer
            .querySelectorAll(
                ".testimonial-card"
            );


    if (cards.length < 3) {
        return;
    }


    reviewSlideIndex +=
        direction;


    setReviewPosition(true);


    if (
        reviewSlideIndex === 0 ||
        reviewSlideIndex ===
            reviewCardCount + 1
    ) {

        testimonialContainer.addEventListener(
            "transitionend",
            () => {

                reviewSlideIndex =
                    direction > 0
                        ? 1
                        : reviewCardCount;


                setReviewPosition(
                    false
                );

            },
            {
                once: true
            }
        );

    }

}


/* =====================================================
   SET REVIEW POSITION
====================================================== */

function setReviewPosition(
    animate
) {

    if (!testimonialContainer) {
        testimonialContainer = document.getElementById("testimonialContainer");
    }
    if (!testimonialContainer) {
        return;
    }


    const card =
        testimonialContainer
            .querySelector(
                ".testimonial-card"
            );


    if (!card) {
        return;
    }


    const cardWidth =
        card.getBoundingClientRect()
            .width;


    const gap =
        parseFloat(
            getComputedStyle(
                testimonialContainer
            ).gap
        ) || 0;

    // If layout not ready yet (width 0), retry – prevents reviews appearing off-screen
    if (cardWidth === 0) {
        requestAnimationFrame(() => setReviewPosition(animate));
        return;
    }


    testimonialContainer.style.transition =
        animate
            ? ""
            : "none";


    testimonialContainer.style.transform =
        `translateX(-${reviewSlideIndex * (cardWidth + gap)}px)`;


    if (!animate) {

        requestAnimationFrame(
            () => {

                // Force reflow then restore transition
                void testimonialContainer.offsetHeight;
                testimonialContainer.style.transition =
                    "";

            }
        );

    }

}


/* =====================================================
   REVIEW NAV BUTTONS - bound reliably (fixes missing arrows)
====================================================== */

function bindReviewNavButtons() {
    // Re-query in case elements were not in DOM at module load
    if (!reviewPrevBtn) reviewPrevBtn = document.getElementById("reviewPrevBtn");
    if (!reviewNextBtn) reviewNextBtn = document.getElementById("reviewNextBtn");
    if (!testimonialContainer) testimonialContainer = document.getElementById("testimonialContainer");

    if (reviewPrevBtn && !reviewPrevBtn.dataset.bound) {
        reviewPrevBtn.addEventListener("click", () => {
            clearInterval(reviewSlideTimer);
            moveReview(-1);
            // restart auto slide
            if (reviewCardCount > 1) {
                clearInterval(reviewSlideTimer);
                reviewSlideTimer = setInterval(() => moveReview(1), 5500);
            }
        });
        reviewPrevBtn.dataset.bound = "1";
    }

    if (reviewNextBtn && !reviewNextBtn.dataset.bound) {
        reviewNextBtn.addEventListener("click", () => {
            clearInterval(reviewSlideTimer);
            moveReview(1);
            if (reviewCardCount > 1) {
                clearInterval(reviewSlideTimer);
                reviewSlideTimer = setInterval(() => moveReview(1), 5500);
            }
        });
        reviewNextBtn.dataset.bound = "1";
    }
}

// Initial bind attempt (for when DOM already ready)
bindReviewNavButtons();

// Recalc slider on resize – prevents missing/offset cards after viewport change
window.addEventListener("resize", () => {
    if (reviewCardCount > 1) {
        setReviewPosition(false);
    }
});

// If user returns to tab after backend cold-start, ensure reviews are loaded
document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && testimonialContainer) {
        const hasCards = testimonialContainer.querySelectorAll(".testimonial-card").length;
        const isPlaceholder = testimonialContainer.textContent.includes("Loading") || testimonialContainer.textContent.includes("temporarily unavailable");
        if (hasCards === 0 || isPlaceholder || hasCards === 1 && testimonialContainer.querySelector(".review-loading-card")) {
            if (!isLoadingReviews) loadReviews();
        }
    }
});


/* =====================================================
   LOAD TEAM
====================================================== */

async function loadTeam() {

    if (!teamContainer) {

        console.error(
            "Team container not found."
        );

        return;

    }


    /* -------------------------------------------------
       Loading
    ------------------------------------------------- */

    teamContainer.innerHTML = `

        <div class="team-loading">

            <i class="ri-loader-4-line"></i>

            <p>
                Loading our team...
            </p>

        </div>

    `;


    try {

        if (!API_URL) {

            throw new Error(
                "VITE_API_URL is not available."
            );

        }


        /* -------------------------------------------------
           Backend Team API
        ------------------------------------------------- */

        const response =
            await fetch(
                `${API_URL}/api/team`
            );


        if (!response.ok) {

            throw new Error(
                `Team API Error: ${response.status}`
            );

        }


        /* -------------------------------------------------
           Get JSON
        ------------------------------------------------- */

        const data =
            await response.json();


        console.log(
            "Team data:",
            data
        );


        /* -------------------------------------------------
           Get Team Array
        ------------------------------------------------- */

        let teamMembers = [];


        if (Array.isArray(data)) {

            teamMembers =
                data;

        }

        else if (
            data &&
            Array.isArray(
                data.data
            )
        ) {

            teamMembers =
                data.data;

        }

        else if (
            data &&
            Array.isArray(
                data.team
            )
        ) {

            teamMembers =
                data.team;

        }

        else if (
            data &&
            Array.isArray(
                data.teamMembers
            )
        ) {

            teamMembers =
                data.teamMembers;

        }


        /* -------------------------------------------------
           Empty Team
        ------------------------------------------------- */

        if (
            teamMembers.length === 0
        ) {

            teamContainer.innerHTML = `

                <div class="team-empty">

                    <i class="ri-team-line"></i>

                    <h3>
                        Our team is coming soon
                    </h3>

                    <p>
                        Team members will appear here
                        once they are added from the
                        admin panel.
                    </p>

                </div>

            `;

            return;

        }


        /* -------------------------------------------------
           Clear Container
        ------------------------------------------------- */

        teamContainer.innerHTML =
            "";


        /* -------------------------------------------------
           Create Team Cards
        ------------------------------------------------- */

        teamMembers.forEach(
            (member) => {

                const card =
                    document.createElement(
                        "div"
                    );


                card.className =
                    "team-card";


                /* -----------------------------------------
                   Name
                ----------------------------------------- */

                const name =
                    member.name ||
                    "Cold Cafe Team";


                /* -----------------------------------------
                   Position
                ----------------------------------------- */

                const position =
                    member.position ||
                    "Team Member";


                /* -----------------------------------------
                   Image
                ----------------------------------------- */

                const image =
                    member.image ||
                    "https://via.placeholder.com/600x600?text=Cold+Cafe";


                /* -----------------------------------------
                   Card HTML
                ----------------------------------------- */

                card.innerHTML = `

                    <div class="team-image">

                        <img
                            src="${escapeHTML(image)}"
                            alt="${escapeHTML(name)}"
                            loading="lazy"
                        >

                    </div>

                    <div class="team-info">

                        <h3>
                            ${escapeHTML(name)}
                        </h3>

                        <span>
                            ${escapeHTML(position)}
                        </span>

                    </div>

                `;


                /* -----------------------------------------
                   Image Error Handling
                ----------------------------------------- */

                const teamImage =
                    card.querySelector(
                        "img"
                    );


                if (teamImage) {

                    teamImage.addEventListener(
                        "error",
                        function () {

                            teamImage.src =
                                "https://via.placeholder.com/600x600?text=Cold+Cafe";

                        }
                    );

                }


                /* -----------------------------------------
                   Add Card
                ----------------------------------------- */

                teamContainer.appendChild(
                    card
                );

            }
        );

    }
    catch (error) {

        console.error(
            "Failed to load team:",
            error
        );


        /* -------------------------------------------------
           Error Message
        ------------------------------------------------- */

        teamContainer.innerHTML = `

            <div class="team-error">

                <i class="ri-error-warning-line"></i>

                <h3>
                    Unable to load our team
                </h3>

                <p>
                    Please try again later.
                </p>

                <button
                    type="button"
                    id="retryTeamBtn"
                >
                    Try Again
                </button>

            </div>

        `;


        /* -------------------------------------------------
           Retry
        ------------------------------------------------- */

        const retryButton =
            document.getElementById(
                "retryTeamBtn"
            );


        if (retryButton) {

            retryButton.addEventListener(
                "click",
                loadTeam
            );

        }

    }

}


/* =====================================================
   REVIEW FORM ELEMENTS
====================================================== */

const reviewToggleBtn =
    document.getElementById(
        "reviewToggleBtn"
    );


const reviewFormContainer =
    document.getElementById(
        "reviewFormContainer"
    );


const reviewForm =
    document.getElementById(
        "reviewForm"
    );


const reviewCancelBtn =
    document.getElementById(
        "reviewCancelBtn"
    );


const starRating =
    document.getElementById(
        "starRating"
    );


const reviewRatingValue =
    document.getElementById(
        "reviewRatingValue"
    );


let selectedRating = 0;


const reviewModalOverlay =
    document.getElementById(
        "reviewModalOverlay"
    );


/* =====================================================
   OPEN REVIEW MODAL
====================================================== */

function openReviewModal() {

    if (
        reviewFormContainer &&
        reviewFormContainer.classList.contains(
            "active"
        )
    ) {

        return;

    }


    if (reviewFormContainer) {

        reviewFormContainer.classList.add(
            "review-modal"
        );


        reviewFormContainer.classList.add(
            "active"
        );

    }


    if (reviewModalOverlay) {

        reviewModalOverlay.classList.add(
            "active"
        );

    }


    document.body.classList.add(
        "review-modal-open"
    );


    if (reviewToggleBtn) {

        reviewToggleBtn.innerHTML = `

            <i class="ri-close-line"></i>

            Close Form

        `;

    }

}


/* =====================================================
   CLOSE REVIEW MODAL
====================================================== */

function closeReviewModal() {

    if (reviewFormContainer) {

        reviewFormContainer.classList.remove(
            "review-modal"
        );


        reviewFormContainer.classList.remove(
            "active"
        );

    }


    if (reviewModalOverlay) {

        reviewModalOverlay.classList.remove(
            "active"
        );

    }


    document.body.classList.remove(
        "review-modal-open"
    );


    if (reviewToggleBtn) {

        reviewToggleBtn.innerHTML = `

            <i class="ri-quill-pen-line"></i>

            Write a Review

        `;

    }


    if (reviewForm) {

        reviewForm.reset();

    }


    selectedRating = 0;


    if (reviewRatingValue) {

        reviewRatingValue.value = 0;

    }


    updateStars();

}


/* =====================================================
   TOGGLE REVIEW FORM
====================================================== */

if (
    reviewToggleBtn &&
    reviewFormContainer
) {

    reviewToggleBtn.addEventListener(
        "click",
        function () {

            if (
                reviewFormContainer.classList.contains(
                    "active"
                )
            ) {

                closeReviewModal();

            }
            else {

                openReviewModal();

            }

        }
    );

}


/* =====================================================
   CANCEL REVIEW FORM
====================================================== */

if (
    reviewCancelBtn &&
    reviewFormContainer
) {

    reviewCancelBtn.addEventListener(
        "click",
        function () {

            closeReviewModal();

        }
    );

}


/* =====================================================
   STAR RATING
====================================================== */

if (starRating) {

    const stars =
        starRating.querySelectorAll(
            "i"
        );


    stars.forEach(
        (star) => {


            /* -----------------------------------------
               Click
            ----------------------------------------- */

            star.addEventListener(
                "click",
                function () {

                    selectedRating =
                        parseInt(
                            this.getAttribute(
                                "data-rating"
                            )
                        );


                    if (reviewRatingValue) {

                        reviewRatingValue.value =
                            selectedRating;

                    }


                    updateStars();

                }
            );


            /* -----------------------------------------
               Mouse Enter
            ----------------------------------------- */

            star.addEventListener(
                "mouseenter",
                function () {

                    const hoverValue =
                        parseInt(
                            this.getAttribute(
                                "data-rating"
                            )
                        );


                    stars.forEach(
                        (s) => {

                            const value =
                                parseInt(
                                    s.getAttribute(
                                        "data-rating"
                                    )
                                );


                            if (
                                value <=
                                hoverValue
                            ) {

                                s.classList.remove(
                                    "ri-star-line"
                                );


                                s.classList.add(
                                    "ri-star-fill"
                                );


                                s.classList.add(
                                    "active"
                                );

                            }
                            else {

                                s.classList.remove(
                                    "ri-star-fill"
                                );


                                s.classList.add(
                                    "ri-star-line"
                                );


                                s.classList.remove(
                                    "active"
                                );

                            }

                        }
                    );

                }
            );


            /* -----------------------------------------
               Mouse Leave
            ----------------------------------------- */

            star.addEventListener(
                "mouseleave",
                function () {

                    updateStars();

                }
            );

        }
    );

}


/* =====================================================
   UPDATE STAR DISPLAY
====================================================== */

function updateStars() {

    if (!starRating) {
        return;
    }


    const stars =
        starRating.querySelectorAll(
            "i"
        );


    stars.forEach(
        (star) => {

            const value =
                parseInt(
                    star.getAttribute(
                        "data-rating"
                    )
                );


            if (
                value <=
                selectedRating
            ) {

                star.classList.remove(
                    "ri-star-line"
                );


                star.classList.add(
                    "ri-star-fill"
                );


                star.classList.add(
                    "active"
                );

            }
            else {

                star.classList.remove(
                    "ri-star-fill"
                );


                star.classList.add(
                    "ri-star-line"
                );


                star.classList.remove(
                    "active"
                );

            }

        }
    );

}


/* =====================================================
   SUBMIT REVIEW
   POST /api/reviews

   Review is sent only to backend.
====================================================== */

if (reviewForm) {

    reviewForm.addEventListener(
        "submit",
        async function (e) {

            e.preventDefault();


            /* -----------------------------------------
               Get Inputs
            ----------------------------------------- */

            const nameInput =
                document.getElementById(
                    "reviewName"
                );


            const reviewTextInput =
                document.getElementById(
                    "reviewText"
                );


            const name =
                nameInput
                    ? nameInput.value.trim()
                    : "";


            const rating =
                parseInt(
                    reviewRatingValue
                        ? reviewRatingValue.value
                        : 0
                );


            const reviewText =
                reviewTextInput
                    ? reviewTextInput.value.trim()
                    : "";


            /* -----------------------------------------
               Validation
            ----------------------------------------- */

            if (!name) {

                alert(
                    "Please enter your name."
                );

                return;

            }


            if (
                !rating ||
                rating < 1 ||
                rating > 5
            ) {

                alert(
                    "Please select a rating."
                );

                return;

            }


            if (!reviewText) {

                alert(
                    "Please write your review."
                );

                return;

            }


            /* -----------------------------------------
               API URL Check
            ----------------------------------------- */

            if (!API_URL) {

                console.error(
                    "VITE_API_URL is missing."
                );


                alert(
                    "API URL is not configured."
                );


                return;

            }


            /* -----------------------------------------
               Submit Button
            ----------------------------------------- */

            const submitButton =
                reviewForm.querySelector(
                    ".review-submit-btn"
                );


            const originalButtonHTML =
                submitButton
                    ? submitButton.innerHTML
                    : "";


            if (submitButton) {

                submitButton.disabled =
                    true;


                submitButton.innerHTML = `

                    <i class="ri-loader-4-line"></i>

                    Submitting...

                `;

            }


            try {

                /* -----------------------------------------
                   SEND TO BACKEND
                ----------------------------------------- */

                const response =
                    await fetch(
                        `${API_URL}/api/reviews`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({

                                    name: name,

                                    rating: rating,

                                    review:
                                        reviewText

                                })

                        }
                    );


                /* -----------------------------------------
                   Read Backend Response
                ----------------------------------------- */

                let data = null;


                try {

                    data =
                        await response.json();

                }
                catch (jsonError) {

                    data = null;

                }


                console.log(
                    "Review API response:",
                    data
                );


                /* -----------------------------------------
                   Backend Error
                ----------------------------------------- */

                if (!response.ok) {

                    throw new Error(

                        data &&
                        data.message

                            ? data.message

                            : `Failed to submit review. Status: ${response.status}`

                    );

                }


                /* -----------------------------------------
                   SUCCESS
                ----------------------------------------- */

                alert(
                    "Thank you! Your review has been submitted successfully."
                );


                /* -----------------------------------------
                   Close Modal
                ----------------------------------------- */

                closeReviewModal();

                // Reload reviews immediately so new review appears
                // without requiring a manual refresh.
                // loadReviews handles deduplication and carousel reset.
                try {
                    await loadReviews();
                } catch (reloadError) {
                    console.warn("Failed to reload reviews after submit:", reloadError);
                }

            }
            catch (error) {

                console.error(
                    "Failed to submit review:",
                    error
                );


                alert(
                    error.message ||
                    "Failed to submit review. Please try again."
                );

            }


            finally {

                if (submitButton) {

                    submitButton.disabled =
                        false;


                    submitButton.innerHTML =
                        originalButtonHTML;

                }

            }

        }
    );

}


/* =====================================================
   ESCAPE HTML
====================================================== */

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
   MOBILE HAMBURGER MENU
====================================================== */

function setupMobileNavbar() {

    const menuToggle =
        document.getElementById(
            "menuToggle"
        );


    const navLinks =
        document.getElementById(
            "navLinks"
        );


    if (
        !menuToggle ||
        !navLinks
    ) {

        return;

    }


    menuToggle.addEventListener(
        "click",
        function (event) {

            event.stopPropagation();


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


    document.addEventListener(
        "click",
        function (event) {

            const navbar =
                document.querySelector(
                    ".navbar"
                );


            if (
                !navbar ||
                navbar.contains(
                    event.target
                )
            ) {

                return;

            }


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


/* =====================================================
   INITIALIZE ABOUT PAGE
====================================================== */

let aboutPageInitialized = false;

function initializeAboutPage() {

    if (aboutPageInitialized) return;
    aboutPageInitialized = true;

    // Ensure review DOM refs are fresh (fixes sometimes-missing on refresh)
    testimonialContainer = document.getElementById("testimonialContainer") || testimonialContainer;
    reviewPrevBtn = document.getElementById("reviewPrevBtn") || reviewPrevBtn;
    reviewNextBtn = document.getElementById("reviewNextBtn") || reviewNextBtn;
    bindReviewNavButtons();

    setupMobileNavbar();

    loadAbout();

    loadStatus();

    loadWhyUs();

    loadTeam();

    loadReviews();

    // Extra safety: if reviews still not rendered after 2.5s (cold start), retry once
    setTimeout(() => {
        if (testimonialContainer) {
            const hasRealCards = testimonialContainer.querySelectorAll(".testimonial-card").length;
            const isLoading = !!testimonialContainer.querySelector(".review-loading-card");
            if ((hasRealCards === 0 || isLoading) && !isLoadingReviews) {
                loadReviews();
            }
        }
    }, 2500);

}


/* =====================================================
   DOM READY - ensure reviews load on first paint without refresh
====================================================== */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeAboutPage
    );

    // Eager fetch: start loading reviews even before DOMContentLoaded
    // so backend cold-start begins immediately on first visit
    if (document.getElementById("testimonialContainer") && !isLoadingReviews) {
        // Defer one tick to allow testimonialContainer let to be assigned
        setTimeout(() => {
            const c = document.getElementById("testimonialContainer");
            if (c && c.querySelector(".review-loading-card") && !isLoadingReviews) {
                // Will be handled by initialize, but start early if possible
                testimonialContainer = c;
            }
        }, 0);
    }

}
else {

    initializeAboutPage();

}

// Window load fallback – guarantees reviews render even if DOMContentLoaded fired before script
window.addEventListener("load", () => {
    testimonialContainer = document.getElementById("testimonialContainer") || testimonialContainer;
    bindReviewNavButtons();
    if (testimonialContainer) {
        const needsLoad = testimonialContainer.querySelector(".review-loading-card") ||
            testimonialContainer.querySelectorAll(".testimonial-card").length === 0 ||
            testimonialContainer.textContent.includes("temporarily unavailable");
        if (needsLoad && !isLoadingReviews) {
            reviewLoadRetryCount = 0;
            loadReviews();
        } else if (reviewCardCount > 1) {
            // Ensure slider positioned correctly after all images/styles loaded
            setReviewPosition(false);
        }
    }
});
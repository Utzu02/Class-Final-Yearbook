//// initializare lightbox
$(document).ready(() => {

    lightbox.option({
        'resizeDuration': 200,
        'wrapAround': true,
        'disableScrolling': true,
        'maxHeight': 700,
        'maxWidth': 1000,
        'showImageNumberLabel': true,
        'alwaysShowNavOnTouchDevices': true,
        'positionFromTop': 140,
        'albumLabel': "Imaginea %1 din %2"
    })

    //// Configuration Constants
    const CONFIG = {
        STUDENT_COUNT: 28,
        STUDENT_COUNT_MINUS_1: 27,
        TOTAL_IMAGES: 55,  // 28 * 2 - 1 (including duplicates, 0-indexed)
        MAX_PERCENTAGE: 49.18,
        PERCENTAGE_PER_STUDENT: 1.825,  // 49.18 / 27

        ANIMATION: {
            CAROUSEL_DURATION: 150,
            NUMBER_UPDATE_DELAY: 300,
            TEAM_MEMBER_STAGGER: 150,
            TEAM_MEMBER_INITIAL_DELAY: 200
        }
    };

    // Freeze to prevent accidental modification
    Object.freeze(CONFIG);
    Object.freeze(CONFIG.ANIMATION);

    /**
     * Animates team members with modern staggered effects
     * @param {string} selector - CSS selector ('.diriginte' or '.membru')
     * @param {boolean} reverse - Animate in reverse order
     * @param {number} staggerDelay - Delay between each element (ms)
     * @param {number} initialDelay - Delay before starting (ms)
     * @param {Function} onComplete - Callback when complete
     */
    function animateTeamMembers(selector, reverse = false, staggerDelay = CONFIG.ANIMATION.TEAM_MEMBER_STAGGER, initialDelay = CONFIG.ANIMATION.TEAM_MEMBER_INITIAL_DELAY, onComplete = null) {
        const elements = document.querySelectorAll(selector);

        if (reverse) {
            // Reverse animation - fade out with modern effects
            gsap.to(elements, {
                y: -30,
                autoAlpha: 0,
                scale: 0.95,
                rotationX: -5,
                duration: .5,
                stagger: staggerDelay / 1000,
                ease: "power2.in",
                delay: initialDelay / 1000,
                onComplete: () => {
                    if (onComplete) onComplete();
                }
            });
        } else {
            // Forward animation - modern reveal with bounce
            gsap.fromTo(elements,
                {
                    y: 60,
                    autoAlpha: 0,
                    scale: 0.8,
                    rotationX: 15
                },
                {
                    y: 0,
                    autoAlpha: 1,
                    scale: 1,
                    rotationX: 0,
                    duration: .8,
                    stagger: staggerDelay / 1000,
                    ease: "back.out(1.4)",
                    delay: initialDelay / 1000,
                    onComplete: () => {
                        if (onComplete) onComplete();
                    }
                }
            );
        }
    }

    //// initializare variabile globale
    gsap.ticker.lagSmoothing(1000, 16);
    gsap.registerPlugin(ScrollTrigger)

    //// DOM element caches for performance
    const track = document.getElementById("image-container");
    const cloneImg = document.getElementById('clone-image');
    const elevi = document.getElementById("sectiune_elevi");
    const despre = document.getElementById("sectiune_despre");
    const plus = document.getElementById("element");
    const imageViewer = document.getElementById("image-viewer");
    const images = document.querySelectorAll(".image");
    const contact = document.getElementById('sectiune_contact');
    const numarImagine = document.getElementById('numarimagine')
    const numePersoana = document.getElementById('numePersoana')
    const htmlElement = document.getElementsByTagName("html")[0]
    const bodyElement = document.body
    const checkDiv = document.getElementById('checkDiv')
    const closeModalBtn = document.getElementById('close-modal')
    const nextBtn = document.getElementById('next')
    const prevBtn = document.getElementById('prev')
    const numarJos = document.getElementById('numarjos')
    const despreElev = document.getElementById('despreElev')
    const iesireSectiune = document.getElementById('iesireSectiune')
    const textBox = document.getElementById('TextBox')
    const clasaImg = document.getElementById('clasaImg')
    const eleviSection = document.getElementById('elevi')
    const despreSection = document.getElementById('despre')
    const contactSection = document.getElementById('contact')
    const containerDespre = despreSection
    const containerContact = contactSection

    //// Global variables
    var x = 1;
    var curentElem;
    var cloneTimeline = new TimelineMax({ paused: true })
    var canHover = false
    var currentHoverImage;
    var escModal = false;
    var escAnimatieElev = false;
    let lastX = 27;
    let resized = false
    let spaceModal = false
    canSwitchText = true
    let isAnimatingCarousel = false  // Flag to prevent position recalculation during animation
    let pendingPositionUpdate = null  // Store timeout ID for position updates
    let lastMoveTime = 0  // For throttling mouse move
    let rafId = null  // RequestAnimationFrame ID for smooth animations

    //// Thumbnail carousel variables
    let thumbnailCarousel = null
    let thumbnailContainer = null
    let thumbnailTrack = null
    let thumbnailScrollPosition = 0
    let currentCarouselIndex = 0
    let thumbnailItems = []  // Cache for thumbnail elements
    let activeThumb = null  // Track currently active thumbnail
    let wheelNavigationTimeout = null  // Debounce timer for modal wheel navigation
    let wheelAccumulator = 0  // Accumulate wheel delta to prevent accidental navigation

    track.dataset.lightBox = "false"
    track.dataset.percentage = 0;
    var canScroll = true
    document.getElementById('nrtotal').textContent = (document.querySelectorAll(".image").length - 1) / 2

    //// Create thumbnail carousel
    createThumbnailCarousel()


    //// Create thumbnail carousel structure
    //// Initialize thumbnail carousel
    function createThumbnailCarousel() {
        // Get references to existing HTML elements
        thumbnailCarousel = document.getElementById('thumbnail-carousel')
        thumbnailContainer = document.getElementById('thumbnail-container')
        thumbnailTrack = document.getElementById('thumbnail-track')
        const leftScroll = document.getElementById('thumb-scroll-left')
        const rightScroll = document.getElementById('thumb-scroll-right')

        // Add event listeners for scroll arrows
        leftScroll.addEventListener('click', () => {
            restartAnimation(leftScroll, 'rotate')
            scrollThumbnailsHorizontal('left')
        })
        rightScroll.addEventListener('click', () => {
            restartAnimation(rightScroll, 'rotate')
            scrollThumbnailsHorizontal('right')
        })

        // Populate thumbnails with ALL carousel images (including duplicates)
        for (let i = 0; i < images.length; i++) {
            const thumb = document.createElement('div')
            thumb.className = 'thumbnail-item'
            thumb.dataset.carouselIndex = i

            // Determine actual student ID (1-28)
            const cntValue = images[i].dataset.cnt || images[i].getAttribute('data-cnt')
            let studentId = parseInt(cntValue)

            if (isNaN(studentId)) {
                studentId = (i % CONFIG.STUDENT_COUNT) + 1
            } else if (studentId > CONFIG.STUDENT_COUNT) {
                studentId = studentId - CONFIG.STUDENT_COUNT
            }

            thumb.dataset.studentId = studentId

            const img = document.createElement('img')
            img.src = images[i].src
            thumb.appendChild(img)

            thumbnailTrack.appendChild(thumb)
            thumbnailItems.push(thumb)  // Cache for performance
        }

        thumbnailTrack.addEventListener('click', (e) => {
            const thumb = e.target.closest('.thumbnail-item')
            if (!thumb) return

            e.stopPropagation()
            const clickedCarouselIndex = parseInt(thumb.dataset.carouselIndex)

            if (clickedCarouselIndex !== currentCarouselIndex && !isNaN(clickedCarouselIndex)) {
                switchToThumbnail(clickedCarouselIndex, 'left')
            }
        })

        // Initialize navigation overlays
        initializeImageNavigation()
    }

    //// Scroll thumbnails horizontally
    function scrollThumbnailsHorizontal(direction) {
        const thumbWidth = 89 // 89px width with 0px gap
        const scrollAmount = thumbWidth * 3 // Scroll 3 items at a time
        const containerWidth = thumbnailContainer.offsetWidth // No padding to account for
        const visibleCount = Math.floor(containerWidth / thumbWidth)
        // Calculate total width needed for all thumbnails
        const totalWidth = images.length * thumbWidth
        // Max scroll is total width minus visible area
        const maxScroll = Math.max(0, totalWidth - containerWidth)

        if (direction === 'left') {
            thumbnailScrollPosition = Math.max(0, thumbnailScrollPosition - scrollAmount)
        } else {
            thumbnailScrollPosition = Math.min(maxScroll, thumbnailScrollPosition + scrollAmount)
        }

        gsap.to(thumbnailTrack, {
            x: -thumbnailScrollPosition,
            duration: 0.4,
            ease: 'power2.out'
        })
    }

    //// Helper: Restart CSS animation by toggling class
    function restartAnimation(element, className) {
        element.classList.remove(className)
        void element.offsetWidth // Force reflow
        element.classList.add(className)
    }

    //// Helper: Cancel and reset name animation timeout
    function cancelNameAnimation() {
        if (window.nameAnimationTimeout) {
            clearTimeout(window.nameAnimationTimeout)
            window.nameAnimationTimeout = null
        }
    }

    //// Initialize navigation overlays on main image
    function initializeImageNavigation() {
        const leftImageNav = document.getElementById('image-nav-left')
        const rightImageNav = document.getElementById('image-nav-right')

        leftImageNav.addEventListener('click', () => {
            restartAnimation(leftImageNav, 'rotate')
            navigateStudent('prev')
        })
        rightImageNav.addEventListener('click', () => {
            restartAnimation(rightImageNav, 'rotate')
            navigateStudent('next')
        })
    }

    //// Navigate to previous or next student
    function navigateStudent(direction) {
        // Only allow navigation in elevi section
        if (!elevi.classList.contains('active')) {
            return;
        }

        cancelNameAnimation()

        let newIndex
        let slideDirection

        if (direction === 'prev') {
            newIndex = currentCarouselIndex - 1
            if (newIndex < 0) newIndex = images.length - 1 // Wrap to last carousel image
            slideDirection = 'right' // Sliding right when going to previous
        } else {
            newIndex = currentCarouselIndex + 1
            if (newIndex >= images.length) newIndex = 0 // Wrap to first carousel image
            slideDirection = 'left' // Sliding left when going to next
        }

        switchToThumbnail(newIndex, slideDirection)
    }

    //// Switch to a different thumbnail
    function switchToThumbnail(carouselIndex, direction) {
        // Only allow thumbnail switching in elevi section
        if (!elevi.classList.contains('active')) {
            return;
        }

        if (carouselIndex === currentCarouselIndex) return

        const oldIndex = currentCarouselIndex
        currentCarouselIndex = carouselIndex

        // Get the exact image from the carousel at this index
        const targetImage = images[carouselIndex]

        if (!targetImage) {
            return
        }

        // Get student ID for highlighting purposes
        let studentId = parseInt(targetImage.dataset.cnt)
        if (studentId > CONFIG.STUDENT_COUNT) {
            studentId = studentId - CONFIG.STUDENT_COUNT
        }

        // Optimized: Update active thumbnail using cached reference
        if (activeThumb) {
            activeThumb.classList.remove('active')
        }
        activeThumb = thumbnailItems[carouselIndex]
        if (activeThumb) {
            activeThumb.classList.add('active')
        }

        // STACKING LOGIC: Intentional stacking for visual effect, but optimized
        // Get all existing slide images ONCE
        const existingSlides = Array.from(document.querySelectorAll('[id^="clone-image-next"]'))

        // Limit to 4 slides (will become 5 after we add the new one)
        while (existingSlides.length > 4) {
            // Remove oldest slides (from beginning of array)
            const oldestSlide = existingSlides.shift() // Remove from array and get reference
            gsap.killTweensOf(oldestSlide)
            if (oldestSlide.parentNode) {
                oldestSlide.remove()
            }
        }

        // Create a second image element for smooth sliding
        const nextImg = document.createElement('img')
        nextImg.id = 'clone-image-next'
        nextImg.src = targetImage.src

        // Use CSS class for static styles, inline for dynamic z-index
        nextImg.className = 'slide-image'
        nextImg.style.zIndex = 1

        // Position next image off-screen for full slide animation
        const slideFrom = direction === 'left' ? window.innerWidth : -window.innerWidth
        const slideTo = direction === 'left' ? -window.innerWidth : window.innerWidth

        // Set initial position and add to DOM
        gsap.set(nextImg, {
            x: slideFrom,
            force3D: true
        })

        document.body.appendChild(nextImg)

        // Slide the previous image out (the last one in the array, or cloneImg if no slides)
        const currentTopImage = existingSlides.length > 0 ? existingSlides[existingSlides.length - 1] : cloneImg

        // Kill any existing animations on the current top image only (others keep animating for stacking effect)
        gsap.killTweensOf(currentTopImage)

        gsap.to(currentTopImage, {
            x: slideTo,
            duration: 0.45,
            ease: "power2.out",
            force3D: true,
            onComplete: () => {
                // Remove the old image after it slides out
                if (currentTopImage !== cloneImg && currentTopImage.parentNode) {
                    currentTopImage.remove()
                }
            }
        })

        // Slide the next image in
        gsap.to(nextImg, {
            x: 0,
            duration: 0.45,
            ease: "power2.out",
            force3D: true,
            onComplete: () => {
                // Update the main clone image with final state
                cloneImg.src = targetImage.src
                cloneImg.dataset.text = targetImage.dataset.text
                cloneImg.dataset.src = targetImage.dataset.src
                cloneImg.dataset.pers = targetImage.dataset.pers

                // Reset cloneImg position
                gsap.set(cloneImg, {
                    x: 0,
                    clearProps: 'transform,force3D,willChange'
                })

                // Remove the temporary next image
                nextImg.remove()
            }
        })

        // Reset name to initial state before updating text
        numePersoana.classList.remove('animate-in')
        gsap.set(numePersoana, { opacity: 0, visibility: 'visible' })
        numePersoana.innerText = targetImage.dataset.text

        // Schedule animation after 200ms of no navigation
        cancelNameAnimation()
        window.nameAnimationTimeout = setTimeout(() => {
            numePersoana.classList.add('animate-in')
        }, 200)

        // Update target position for centering when modal closes
        targetCenterPosition = carouselIndex + 1 // Carousel position for centering

        // Calculate student ID for the number display (1-28)
        const displayStudentId = studentId > CONFIG.STUDENT_COUNT ? studentId - CONFIG.STUDENT_COUNT : studentId

        // Update student number
        gsap.killTweensOf(numarImagine) // Kill previous animation
        TweenMax.to(numarImagine, {
            y: -numarImagine.children[CONFIG.STUDENT_COUNT].offsetHeight * (displayStudentId - 1) + "px",
            duration: .4,
            ease: "power4.InOut",
        })

        // Auto-scroll thumbnails to keep active one visible
        centerActiveThumbnail(carouselIndex)
    }

    //// Center active thumbnail in view
    function centerActiveThumbnail(carouselIndex) {
        const thumbWidth = 89 // 89px width with 0px gap
        const containerWidth = thumbnailContainer.offsetWidth
        const targetPosition = carouselIndex * thumbWidth - (containerWidth / 2) + (thumbWidth / 2)

        const totalWidth = images.length * thumbWidth
        const maxScroll = Math.max(0, totalWidth - containerWidth)

        thumbnailScrollPosition = Math.max(0, Math.min(maxScroll, targetPosition))

        gsap.killTweensOf(thumbnailTrack) // Kill previous animation
        gsap.to(thumbnailTrack, {
            x: -thumbnailScrollPosition,
            duration: 0.4,
            ease: 'power2.out'
        })
    }

    //// Show thumbnail carousel
    function showThumbnailCarousel(activeCarouselIndex) {
        currentCarouselIndex = activeCarouselIndex

        // Reset and show carousel (opacity still 0)
        thumbnailCarousel.style.display = 'flex'

        // Optimized: Remove active class from previous thumb only (if exists)
        if (activeThumb) {
            activeThumb.classList.remove('active')
        }

        // Add active class to new thumb using cached array
        activeThumb = thumbnailItems[activeCarouselIndex]
        if (activeThumb) {
            activeThumb.classList.add('active')
        }

        // Calculate centered position BEFORE showing
        const thumbWidth = 89
        const containerWidth = thumbnailContainer.offsetWidth
        const visibleCount = Math.floor(containerWidth / thumbWidth)
        const targetPosition = activeCarouselIndex * thumbWidth - (containerWidth / 2) + (thumbWidth / 2)
        const maxScroll = Math.max(0, (images.length - visibleCount) * thumbWidth)
        thumbnailScrollPosition = Math.max(0, Math.min(maxScroll, targetPosition))

        // Set position immediately (no animation) so it's already centered when it appears
        gsap.set(thumbnailTrack, { x: -thumbnailScrollPosition })

        // Animate in immediately (already delayed by setTimeout in caller)
        gsap.fromTo(thumbnailCarousel,
            { x: 30, autoAlpha: 0 },
            { x: 0, autoAlpha: 1, duration: 1, ease: 'power2.out' }
        )
    }

    //// Show image navigation overlays
    function showImageNavigation() {
        const leftNav = document.getElementById('image-nav-left')
        const rightNav = document.getElementById('image-nav-right')

        leftNav.style.display = 'flex'
        rightNav.style.display = 'flex'

        gsap.fromTo(leftNav,
            { x: -30, autoAlpha: 0 },
            { x: 0, autoAlpha: 0.7, duration: 0.5, delay: 0.5, ease: 'power2.out' }
        )
        gsap.fromTo(rightNav,
            { x: 30, autoAlpha: 0 },
            { x: 0, autoAlpha: 0.7, duration: 0.5, delay: 0.5, ease: 'power2.out' }
        )
    }

    //// Hide image navigation overlays
    function hideImageNavigation() {
        const leftNav = document.getElementById('image-nav-left')
        const rightNav = document.getElementById('image-nav-right')

        gsap.to([leftNav, rightNav], {
            autoAlpha: 0,
            duration: 0.3,
            ease: 'power2.in',
            onComplete: () => {
                leftNav.style.display = 'none'
                rightNav.style.display = 'none'
            }
        })
    }

    //// Hide thumbnail carousel
    function hideThumbnailCarousel() {
        gsap.to(thumbnailCarousel, {
            x: 50,
            autoAlpha: 0,
            duration: 0.3,
            ease: 'power2.in',
            onComplete: () => {
                thumbnailCarousel.style.display = 'none'
                thumbnailScrollPosition = 0  // Reset scroll position
                gsap.set(thumbnailTrack, { x: 0 })  // Reset track position
            }
        })
    }

    //// fade-in continut pagina
    TweenMax.to('body', {
        autoAlpha: 1,
        duration: 1.5
    })
    var t2 = new TimelineMax({ paused: true })
    t2.to('#elevi', {
        onStart: () => {
            eleviSection.style.display = "block"
            numarJos.style.height = numarImagine.children[0].offsetHeight + "px"
            var children = Array.from(numarImagine.children)
            children.forEach((elem) => {
                elem.style.height = numarImagine.offsetHeight + "px"
            })
            TweenMax.to(numarImagine, {
                y: - numarImagine.children[CONFIG.STUDENT_COUNT].parentElement.offsetHeight * CONFIG.STUDENT_COUNT_MINUS_1 + "px",
                duration: 0,
            })
            containerContact.style.display = 'none'
        },
        onComplete: () => {
            containerDespre.style.display = 'none'
        },
        autoAlpha: 1,
        duration: .4
    },)
    // Smoother, faster carousel entrance without blur
    t2.to('.image',
        {
            duration: .6,
            stagger: { amount: .5 },
            autoAlpha: 1,
            scale: 1,
            ease: 'power2.out',
            y: '0',
            onComplete: () => {
                setarePlus();
            }
        }, .15)
    TweenMax.to(plus, {
        autoAlpha: 0
    })
    t2.to(plus,
        {
            autoAlpha: 1,
            duration: .4,
            delay: .05,
        })

    var t1 = new TimelineMax({ paused: true })
    t1.to(plus,
        {
            autoAlpha: 0,
            duration: .3,
        })
    // Smoother, faster carousel exit without blur
    t1.to('.image', {
        duration: .6,
        autoAlpha: 0,
        scale: 0.9,
        ease: 'power2.in',
        y: '150px',
        stagger: { amount: .5 },
        onComplete: () => {
            canHover = false;
        }
    })

    t1.to('#elevi', {
        autoAlpha: 0,
        duration: .5,
        onComplete: () => {
            // Smooth entrance for Clasa XII-A section
            containerDespre.style.display = 'block'
            textBox.style.display = 'block'
            eleviSection.style.display = "none"
            document.getElementById('container').style.display = 'block'

            TweenMax.fromTo(containerDespre,
                { autoAlpha: 0, y: 30 },
                {
                    autoAlpha: 1,
                    y: 0,
                    duration: .7,
                    ease: "power2.out"
                }
            )

            TweenMax.fromTo('#clasaImg',
                { autoAlpha: 0, scale: 0.95 },
                {
                    autoAlpha: 1,
                    scale: 1,
                    duration: 1.5,
                    ease: "power2.out",
                    onStart: () => {
                        clasaImg.style.visibility = "visible"
                    }
                }
            )
            splitTextTimeline.progress(0);
            splitTextTimeline.play();
            TweenMax.to('#close-modal', {
                autoAlpha: 0,
                duration: 0
            })
            if (cloneImg.style.width !== '0px') {
                reverseCloneAnimation(0, 0, 0, 0);
            }
        }
    }, +0.6)

    splitTextTimeline = new TimelineMax({ paused: true });



    //// functie fade-in element imagini - Modern hover effect
    function FadeInAnimation(element) {
        let hoverTimeline = gsap.timeline({ paused: true });

        hoverTimeline.to(element, {
            autoAlpha: 1,
            scale: 1.05,
            y: -8,
            duration: .4,
            ease: "power2.out",
        });

        element.addEventListener('mouseover', () => {
            if (canHover) hoverTimeline.play();
            else if (canHoverDespre === "true") hoverTimeline.play();
        });

        element.addEventListener('mouseleave', () => {
            if (canHover) hoverTimeline.reverse();
            else if (canHoverDespre === "true") hoverTimeline.reverse();
        });
    }
    //// functie fade-in element - Modern text reveal
    let FadeIn = gsap.timeline({ paused: true });

    function FadeInAny(element, ok) {
        if (ok === true) {
            element.innerText = cloneImg.dataset.text;
            element.style.display = 'block';

            FadeIn = gsap.timeline({
                onReverseComplete: () => {
                    numePersoana.style.display = 'none';
                }
            });

            // Modern reveal animation with slight blur effect
            FadeIn.fromTo(element,
                {
                    autoAlpha: 0,
                    y: 20,
                    scale: 0.95
                },
                {
                    autoAlpha: 1,
                    y: 0,
                    scale: 1,
                    duration: .5,
                    ease: "back.out(1.2)"
                }
            );

            FadeIn.play();
        }
        else FadeIn.reverse();
    }
    //// marire imagine tot ecranul
    var modal_cnt = CONFIG.STUDENT_COUNT;
    let i = 0;
    images.forEach((element) => {
        //// creare element pentru numarare
        let newElem = document.createElement('p')
        i++;
        newElem.innerText = i;
        element.dataset.cnt = i
        let span = document.getElementById("numarimagine")
        if (newElem.innerText < CONFIG.STUDENT_COUNT)
            span.appendChild(newElem)
        else if (newElem.innerText == CONFIG.STUDENT_COUNT) {
            newElem.innerText = 0;
            span.appendChild(newElem)
        }
        else {
            newElem.innerText = i - CONFIG.STUDENT_COUNT;
            span.appendChild(newElem)
        }

        FadeInAnimation(element)
        element.addEventListener('click', () => {
            if (canHover) {
                modal_cnt = element.dataset.cnt;
                console.log(modal_cnt)
                track.dataset.canMove = "false";
                track.dataset.lightBox = "true";
                openModal(element);
            }
        })
    })
    /// initializare splittext
    function init_SplitText() {
        mySplitText = new SplitType('#TextBox', { type: "lines", position: "absolute" })
        gsap.from(mySplitText.lines, {
            scrollTrigger: {
                trigger: '#TextBox',
                toggleActions: "play none none reverse",
                start: "top center"
            },
            onComplete: () => {
            },
            duration: 0.4,
            autoAlpha: 0,
            lazy: false,
            rotationX: -120,
            ease: "power4.InOut",
            force3D: true,
            transformOrigin: "top center -150",
            stagger: { amount: 0.4 }

        })
    }
    /// inchidere Modal cu ESC
    document.onkeydown = function (evt) {
        evt = evt || window.event;
        if (evt.keyCode === 27 || evt.keyCode === 8) {
            if (escModal) {
                evt.preventDefault(); // Prevent backspace browser navigation
                closeModalBtn.click()
                // Let close handler manage flag resets
            }
            else if (escAnimatieElev) {
                evt.preventDefault(); // Prevent backspace browser navigation
                iesireanimatieelev()
                escAnimatieElev = false
                escModal = true
            }
            else {
                console.log("modal not open")
            }
        }
        else if (evt.keyCode === 32) {
            // Space key - only trigger plus when modal is NOT open
            if (modalOpen === false) {
                plus.click()
            }
        }
        else if (evt.keyCode === 37) {
            if (modalOpen === false) prevBtn.click()
        }
        else if (evt.keyCode === 39) {
            if (modalOpen === false) nextBtn.click()
        }
    };
    let modalOpen = false;
    let isClosing = false; // Guard flag to prevent duplicate close animations
    let targetCenterPosition = null; // Store the position to center on after modal closes
    let clickedElement = null; // Store the clicked element reference

    //// deschidere Modal
    function openModal(element) {
        openSpaceModal = false
        modalOpen = true
        canScroll = false  // Disable scrolling immediately when modal opens

        // Cancel any pending position updates from mouse/wheel handlers
        if (pendingPositionUpdate) {
            clearTimeout(pendingPositionUpdate);
            pendingPositionUpdate = null;
        }

        // Lock carousel position updates during animation
        isAnimatingCarousel = true;

        // Get the clicked position (1-55) with safety bounds
        let clickedPosition = parseInt(modal_cnt);
        clickedPosition = Math.max(1, Math.min(CONFIG.TOTAL_IMAGES, clickedPosition));

        // Determine which student (1-28) was clicked
        let studentId = clickedPosition;
        if (studentId > CONFIG.STUDENT_COUNT) {
            studentId = studentId - CONFIG.STUDENT_COUNT;
        }

        // Store the clicked element and target position for centering after close
        clickedElement = element;
        targetCenterPosition = clickedPosition;

        // Don't move carousel - it stays at current position
        // Only use studentId for displaying the correct student in modal
        var duration = 150; // Fast transition since carousel doesn't move

        console.log("Opening modal for student:", studentId, "Will center on position:", clickedPosition, "after close")

        // Smooth fade out of UI elements
        TweenMax.to(checkDiv, {
            autoAlpha: 0,
            duration: .4,
            ease: "power2.out"
        })

        // Display the student number (1-28), not the carousel position (1-55)
        TweenMax.to(numarImagine, {
            y: -numarImagine.children[CONFIG.STUDENT_COUNT].offsetHeight * (studentId - 1) + "px",
            duration: .3,
            ease: "power4.InOut",
        })

        bodyElement.style.pointerEvents = "none"
        htmlElement.style.pointerEvents = "none";
        // Flags now set in cloneTimelineConstructor onComplete (removed setTimeout race condition)

        // Unlock after animation completes
        isAnimatingCarousel = false;
        cloneTimelineConstructor()
        plus.removeEventListener('click', openModalPlus)

        // Element is already hidden, just get its position for the clone
        var rect = element.getBoundingClientRect();
        cloneImg.style.left = rect.left + "px";
        cloneImg.style.top = rect.top + "px";
        cloneImg.style.width = element.offsetWidth + "px";
        cloneImg.style.height = element.offsetHeight + "px";
        cloneImg.src = element.src;
        cloneImg.dataset.text = element.dataset.text
        cloneImg.dataset.src = element.dataset.src
        cloneImg.dataset.pers = element.dataset.pers;
        currentHoverImage = element;
        if (touchSupport) {
            TweenMax.to('#next', {
                autoAlpha: 0,
                duration: .5
            })
        }
        if (touchSupport) {
            TweenMax.to('#prev', {
                autoAlpha: 0,
                duration: .5
            })
        }
        cloneTimeline.play();
        bodyElement.style.pointerEvents = "auto"
        htmlElement.style.pointerEvents = "auto";

        // Set the name from the clicked element
        numePersoana.innerText = element.dataset.text

        // Delay thumbnail carousel until after modal opening animation (0.9s total)
        setTimeout(() => {
            showThumbnailCarousel(clickedPosition - 1)
            showImageNavigation()
        }, 700)

    }

    //// Center carousel on a specific position after modal close
    function centerCarouselOnPosition(targetPosition) {
        // Find the closest instance of this student to current position x
        let studentId = targetPosition;
        if (studentId > CONFIG.STUDENT_COUNT) {
            studentId = studentId - CONFIG.STUDENT_COUNT;
        }

        // The student appears at: studentId and studentId + 28 (if <= 28)
        let possiblePositions = [studentId];
        if (studentId <= CONFIG.STUDENT_COUNT) {
            possiblePositions.push(studentId + CONFIG.STUDENT_COUNT);
        }

        // Calculate which instance is closer using circular distance
        let bestPosition = possiblePositions[0];
        let minDistance = Infinity;

        for (let pos of possiblePositions) {
            // Calculate circular distance (considering wrap-around)
            let linearDist = Math.abs(pos - x);
            let circularDist = Math.min(linearDist, CONFIG.TOTAL_IMAGES - linearDist);

            if (circularDist < minDistance) {
                minDistance = circularDist;
                bestPosition = pos;
            }
        }

        let finalPosition = bestPosition;
        let distance = Math.abs(finalPosition - x);

        // Adjust duration based on distance
        var duration = 400;
        if (distance === 0) return; // Already centered
        else if (distance < 2) duration = 300;
        else if (distance < 5) duration = 450;
        else duration = 600;

        // Calculate target percentage for the target position
        let targetPercentage;
        if (finalPosition === CONFIG.STUDENT_COUNT) {
            targetPercentage = 0;
        }
        else if (finalPosition <= CONFIG.STUDENT_COUNT) {
            targetPercentage = CONFIG.MAX_PERCENTAGE / CONFIG.STUDENT_COUNT_MINUS_1 * (CONFIG.STUDENT_COUNT - finalPosition);
        }
        else {
            // For positions 29-55 (duplicates), calculate extended percentage
            let posInDuplicates = finalPosition - CONFIG.STUDENT_COUNT; // 1-27
            targetPercentage = -CONFIG.MAX_PERCENTAGE / CONFIG.STUDENT_COUNT_MINUS_1 * posInDuplicates;
        }

        // Smooth animation to center position
        track.dataset.prevPercentage = targetPercentage;
        track.dataset.percentage = targetPercentage;
        track.animate({
            transform: `translate(${targetPercentage - 50}%, -50%)`
        }, { duration: duration, fill: "forwards", easing: "ease-out" });

        // Update x to the centered position
        x = finalPosition;
        lastX = x;

        // Update the student number display
        TweenMax.to(numarImagine, {
            y: -numarImagine.children[CONFIG.STUDENT_COUNT].offsetHeight * (studentId - 1) + "px",
            duration: .4,
            ease: "power4.InOut",
        });

        console.log("Centered carousel on position:", finalPosition, "Student:", studentId);
    }

    //// resetare Timeline Clona

    function killCloneTimeline() {

        track.dataset.canMove = "true";
        cloneImg.src = ""
        cloneImg.style.width = 0 + "px"
        cloneImg.style.height = 0 + "px"

        // Restore all carousel images to their original opacity, scale, and visibility
        document.querySelectorAll('.image').forEach((img) => {
            TweenMax.to(img, {
                autoAlpha: 0.8,
                scale: 1,
                visibility: 'visible',
                duration: .5,
                ease: "power2.out"
            });
        });

        // Show plus button again when closing modal
        plus.style.display = 'block'
        TweenMax.to(plus, {
            autoAlpha: 1,
            duration: .4
        })

        // Centering now happens during close animation, not here

        plus.addEventListener('click', openModalPlus)
        cloneTimeline.kill()
    }

    //// constructor Timeline Clona

    function cloneTimelineConstructor() {
        track.dataset.prevPercentage = track.dataset.percentage;
        cloneTimeline = new TimelineMax({ paused: true })

        cloneTimeline.to(cloneImg, {
            width: window.innerWidth + "px",
            height: window.innerHeight + "px",
            left: "0px",
            top: "0px",
            duration: .7,
            ease: "power2.out",
            onComplete: () => {
                // Set flags AFTER animation completes (prevents race condition)
                spaceModal = true;
                escModal = true;
                canScroll = false;

                if (track.dataset.canMove === "false") {
                    // Hide plus button in modal completely
                    plus.style.display = 'none'
                    TweenMax.to(plus, {
                        autoAlpha: 0,
                        duration: 0
                    })

                    // Show name with delayed animation (only if no navigation within 200ms)
                    numePersoana.style.display = 'block'
                    numePersoana.classList.remove('animate-in') // Reset animation
                    gsap.set(numePersoana, { opacity: 0, visibility: 'visible' })

                    // Store timeout ID globally so navigation can cancel it
                    window.nameAnimationTimeout = setTimeout(() => {
                        numePersoana.classList.add('animate-in')
                    }, 200)
                    numePersoana.addEventListener('click', animatieElev)

                    TweenMax.to('#close-modal', {
                        onStart: () => {
                            closeModalBtn.style.display = 'block'
                        },
                        autoAlpha: 1,
                        duration: .5,
                        ease: "power2.out"
                    })

                }
            }
        })
    }

    //// Reverse animation with power2.out easing
    function reverseCloneAnimation(targetWidth, targetHeight, targetLeft, targetTop) {
        cloneTimeline.kill();
        cloneTimeline = new TimelineMax();

        cloneTimeline.to(cloneImg, {
            width: targetWidth + "px",
            height: targetHeight + "px",
            left: targetLeft + "px",
            top: targetTop + "px",
            duration: .7,
            ease: "power2.out",
            onComplete: () => {
                killCloneTimeline()
            }
        });
    }

    //// animatie adaugare text nume
    function adaugareText() {
        TweenMax.to('#numePersoana', {
            display: "block",
            autoAlpha: 1,
            duration: .5
        })
    }
    //// animatie stergere text nume
    function stergereText() {
        TweenMax.to('#numePersoana', {
            autoAlpha: 0,
            duration: .5,
            onComplete: () => {
                numePersoana.style.display = 'none'
            }
        })
    }
    gsap.from('#imgclasa', {
        scrollTrigger: {
            trigger: '#TextBox',
            toggleActions: "play none none reverse",
            start: "top center"
        },
        force3D: true,
        lazy: false,
        duration: .6,
        ease: "power4.InOut",
        x: '100%',
        autoAlpha: 0,
    })
    gsap.from('#textdiriginti', {
        scrollTrigger: {
            trigger: '#textdiriginti',
            toggleActions: "play none none reverse",
            start: "top 80%",
        },
        duration: 1,
        autoAlpha: 0,
    })

    init_SplitText()

    canHoverDespre = "false"


    document.querySelectorAll('.flexitem').forEach((element) => {
        FadeInAnimation(element)
    })
    document.querySelectorAll('.flexitemm').forEach((element) => {
        FadeInAnimation(element)
    })

    ScrollTrigger.create({
        trigger: "#textdiriginti",
        start: "top 60%",
        end: "+=400",
        lazy: false,
        toggleActions: "play none none reverse",
        onEnter: () => animatieDirig(),
        onLeaveBack: () => animatieDirigRev(),
    })
    function animatieDirig() {
        animateTeamMembers('.diriginte', false, 150, 200, () => {
            canHoverDespre = true;
        });
    }
    function animatieDirigRev() {
        animateTeamMembers('.diriginte', true, 150, 0, () => {
            canHoverDespre = false;
        });
    }

    //// animatie text sectiune XII A
    splitTextTimeline.from(mySplitText.lines,
        {
            onReverseComplete: () => {
                // Only run carousel animation if transitioning TO elevi section
                if (elevi.classList.contains('active')) {
                    document.getElementById('container').style.display = 'none'
                    x = CONFIG.STUDENT_COUNT;
                    let i = 0;
                    /*for (const image of track.getElementsByClassName("image")) {
                        i = i + 50 / CONFIG.STUDENT_COUNT;
                        image.animate({
                            objectPosition: `50% 50%`
                        }, { duration: CONFIG.ANIMATION.CAROUSEL_DURATION, fill: "forwards" });
                    }*/
                    /*cloneImg.animate({
                        objectPosition: `50% 50%`
                    }, { duration: CONFIG.ANIMATION.CAROUSEL_DURATION, fill: "forwards" });*/
                    track.dataset.prevPercentage = 0;
                    track.animate({
                        transform: `translate(-50%, -50%)`
                    }, { duration: CONFIG.ANIMATION.CAROUSEL_DURATION, fill: "forwards" });
                    lastX = x;
                    t2.progress(0);
                    t2.play();
                    canHover = true
                    textBox.style.display = 'none'
                }
            },
        });
    splitTextTimeline.play();

    //// intrare sectiune elevi
    elevi.addEventListener('click', () => {
        ////if (elevi.classList.contains('active') === false && canHover === "false")
        if (elevi.classList.contains('active') === false) {
            openSpaceModal = true
            spaceModal = false
            escModal = false

            // Ensure modal controls are hidden when entering elevi section
            // (they should only show when modal is actually opened)
            const leftNav = document.getElementById('image-nav-left')
            const rightNav = document.getElementById('image-nav-right')
            leftNav.style.display = 'none'
            rightNav.style.display = 'none'
            thumbnailCarousel.style.display = 'none'

            if (despre.classList.contains('active') === true) {
                if (touchSupport) {
                    TweenMax.to('#prev', {
                        autoAlpha: 1,
                        duration: 0
                    })
                    TweenMax.to('#next', {
                        autoAlpha: 1,
                        duration: 0
                    })
                }
                canScroll = true
                document.getElementsByClassName('lb-close')[0].click()
                track.dataset.canMove = "true";
                despre.classList.remove('active');
                elevi.classList.add('active');
                canHoverDespre = false

                bodyElement.style.overflow = "hidden"
                htmlElement.style.overflow = "hidden";

                // Smooth fade out and scale for Clasa image
                TweenMax.to('#clasaImg', {
                    autoAlpha: 0,
                    scale: 0.95,
                    duration: .6,
                    ease: "power2.inOut"
                })

                // Smooth fade out for despre container
                TweenMax.to(containerDespre, {
                    autoAlpha: 0,
                    y: -20,
                    duration: .6,
                    ease: "power2.inOut",
                    onComplete: () => {
                        clasaImg.style.visibility = "hidden"
                        plus.addEventListener('click', openModalPlus)
                        // Reset y position for next entrance
                        TweenMax.set(containerDespre, { y: 0 });

                        // Staggered carousel animation with smooth timing
                        TweenMax.to('#checkDiv', {
                            autoAlpha: 1,
                            duration: .4,
                            delay: .1,
                            ease: "power2.out"
                        })

                        setTimeout(() => {
                            document.querySelectorAll('.image').forEach((img, index) => {
                                TweenMax.to(img, {
                                    y: 0,
                                    opacity: 1,
                                    duration: 1,
                                    delay: index * 0.04,
                                    ease: "power3.out"
                                });
                            });
                        }, 100);
                    }
                })
                splitTextTimeline.reverse();
            }
            else {
                canScroll = true
                track.dataset.canMove = "true"

                if (touchSupport) {
                    TweenMax.to('#prev', {
                        autoAlpha: 1,
                        duration: 0
                    })
                    TweenMax.to('#next', {
                        autoAlpha: 1,
                        duration: 0
                    })
                }
                contact.classList.remove('active');
                elevi.classList.add('active');
                animateTeamMembers('.membru', true, 200, 0, () => {
                    canHoverDespre = false;
                });
                TweenMax.to(containerContact, {
                    autoAlpha: 0,
                    duration: .5,
                    delay: .3,
                    onComplete: () => {
                        splitTextTimeline.reverse();
                        plus.addEventListener('click', openModalPlus)
                    }
                })
            }
        }
    });

    //// intrare sectiune XII A
    despre.addEventListener('click', () => {
        ////if (despre.classList.contains('active') === false && canHover === "true") 
        if (despre.classList.contains('active') === false) {
            setTimeout(() => {
                if (resized === true) {
                    init_SplitText()
                    console.log("resizeDA")
                    resize = false
                }
            }, 1500)
            if (elevi.classList.contains('active') === true) {

                plus.removeEventListener('click', openModalPlus)
                plus.removeEventListener('click', animatieElev)
                openSpaceModal = false
                spaceModal = false
                escModal = false

                // Close modal if it's open
                if (track.dataset.lightBox === "true") {
                    closeModalBtn.click()
                }

                // Force hide modal controls immediately to prevent them from appearing in other sections
                const leftNav = document.getElementById('image-nav-left')
                const rightNav = document.getElementById('image-nav-right')
                gsap.killTweensOf([leftNav, rightNav, thumbnailCarousel])
                leftNav.style.display = 'none'
                rightNav.style.display = 'none'
                thumbnailCarousel.style.display = 'none'

                console.log("DA")
                TweenMax.to('#numePersoana', {
                    autoAlpha: 0,
                    duration: .3,
                })
                canScroll = false
                track.dataset.canMove = "false";
                despre.classList.add('active');
                elevi.classList.remove('active');

                // Smooth fade out carousel with scale effect
                TweenMax.to('#checkDiv', {
                    autoAlpha: 0,
                    duration: .4,
                    ease: "power2.in"
                })

                // Staggered fade out of carousel images
                document.querySelectorAll('.image').forEach((img, index) => {
                    TweenMax.to(img, {
                        y: 150,
                        opacity: 0,
                        scale: 0.95,
                        duration: .6,
                        delay: index * 0.02,
                        ease: "power2.in",
                        onComplete: () => {
                            // Reset for next time after animation completes
                            if (index === 0) {
                                setTimeout(() => {
                                    document.querySelectorAll('.image').forEach((resetImg) => {
                                        TweenMax.set(resetImg, { y: 200, opacity: 0.8, scale: 1 });
                                    });
                                }, 200);
                            }
                        }
                    });
                });

                // Trigger student section exit and Clasa entrance
                setTimeout(() => {
                    iesireanimatieelev()
                    bodyElement.style.removeProperty('overflow')
                    htmlElement.style.removeProperty('overflow')

                    // Smooth entrance of Clasa section
                    setTimeout(() => {
                        TweenMax.set('#clasaImg', { scale: 1 });
                        t1.progress(0);
                        t1.play();
                    }, 300);
                }, 400);
            }
            else {
                despre.classList.add('active');
                contact.classList.remove('active');
                bodyElement.style.removeProperty('overflow-y')
                htmlElement.style.removeProperty('overflow-y')
                animateTeamMembers('.membru', true, 200, 0, () => {
                    canHoverDespre = false;
                });
                TweenMax.to(containerContact, {
                    autoAlpha: 0,
                    y: -20,
                    duration: .7,
                    delay: .3,
                    ease: "power2.inOut",
                    onComplete: () => {
                        contactSection.style.display = "none"
                        containerDespre.style.display = 'block'

                        // Smooth entrance with upward motion
                        TweenMax.fromTo(containerDespre,
                            { autoAlpha: 0, y: 20 },
                            {
                                autoAlpha: 1,
                                y: 0,
                                duration: .7,
                                ease: "power2.out"
                            }
                        )

                        textBox.style.display = 'block'
                        document.getElementById('container').style.display = 'block'
                        containerContact.style.display = 'none'
                        // Reset contact container position for next transition
                        TweenMax.set(containerContact, { y: 0 });

                        // Smooth scale and fade for Clasa image
                        TweenMax.fromTo('#clasaImg',
                            { autoAlpha: 0, scale: 0.95 },
                            {
                                autoAlpha: 1,
                                scale: 1,
                                duration: 2.5,
                                ease: "power2.out"
                            }
                        )
                    }
                })

            }
        }
    });
    contact.addEventListener('click', () => {
        if (contact.classList.contains('active') === false) {
            if (despre.classList.contains('active') === true) {
                document.getElementsByClassName('lb-close')[0].click()
                track.dataset.canMove = "true";
                despre.classList.remove('active');
                contact.classList.add('active');
                canHoverDespre = false

                bodyElement.style.overflowY = "hidden"
                htmlElement.style.overflowY = "hidden";
                TweenMax.to(containerDespre, {
                    autoAlpha: 0,
                    duration: 1,
                    onComplete: () => {

                        containerContact.style.display = 'block'
                        TweenMax.to(containerContact, {
                            autoAlpha: 1,
                            duration: 1.7,
                            delay: .1
                        })
                        animateTeamMembers('.membru', false, 250, 200, () => {
                            canHoverDespre = true;
                        });

                        despreSection.style.display = "none"

                    }
                })
                ///iesire despre
            }
            else {

                plus.removeEventListener('click', openModalPlus)
                plus.removeEventListener('click', animatieElev)
                openSpaceModal = false
                spaceModal = false
                escModal = false

                // Close modal if it's open
                if (track.dataset.lightBox === "true") {
                    closeModalBtn.click()
                }

                // Force hide modal controls immediately to prevent them from appearing in other sections
                const leftNav = document.getElementById('image-nav-left')
                const rightNav = document.getElementById('image-nav-right')
                gsap.killTweensOf([leftNav, rightNav, thumbnailCarousel])
                leftNav.style.display = 'none'
                rightNav.style.display = 'none'
                thumbnailCarousel.style.display = 'none'

                TweenMax.to('#numePersoana', {
                    autoAlpha: 0,
                    duration: .3,
                })
                canScroll = false
                track.dataset.canMove = "false";
                contact.classList.add('active');
                elevi.classList.remove('active');
                iesireanimatieelev()
                TweenMax.to(plus,
                    {
                        autoAlpha: 0,
                        duration: .4,
                    })
                TweenMax.to('.image', {
                    duration: 1,
                    ease: 'power4.Out',
                    y: '200%',
                    stagger: { amount: 1 },
                    onComplete: () => {
                        canHover = false;
                    }
                })
                TweenMax.to('#elevi', {
                    autoAlpha: 0,
                    duration: .7,
                    delay: .5,
                    onComplete: () => {
                        if (cloneImg.style.width !== '0px') {
                            reverseCloneAnimation(0, 0, 0, 0);
                        }
                        containerContact.style.display = 'block'
                        TweenMax.to(containerContact, {
                            autoAlpha: 1,
                            duration: 1.7,
                            delay: .1
                        })
                        animateTeamMembers('.membru', false, 250, 200, () => {
                            canHoverDespre = true;
                        });
                        eleviSection.style.display = "none"
                        TweenMax.to('#close-modal', {
                            autoAlpha: 0,
                            duration: 0
                        })
                    }
                })
                splitTextTimeline.play();
                ////iesire elevi
            }
        }
    })


    //// calculare pozitie plus pe pagina (mijlocul imaginii x)
    function setarePlus() {

        plus.style.display = "block"
    }
    //// functii miscare slider (mouse+rotita)
    window.handleOnDown = e => {
        if (track.dataset.canMove === "true") {
            track.dataset.mouseDownAt = e.clientX;
            // Cancel any ongoing click animation when user starts dragging
            isAnimatingCarousel = false;
        }
    }
    window.handleOnUp = () => {
        track.dataset.mouseDownAt = 0;
        // Don't update prevPercentage if we're in a click animation
        if (!isAnimatingCarousel) {
            track.dataset.prevPercentage = track.dataset.percentage;
        }
        // Cleanup: Cancel any pending animation frame
        if (rafId) {
            cancelAnimationFrame(rafId);
            rafId = null;
        }
    }
    window.handleOnMove = e => {
        if (track.dataset.mouseDownAt === "0") return;
        // Don't handle mouse move during click animations
        if (isAnimatingCarousel) return;

        // Throttle to 60fps for performance
        const now = performance.now();
        if (now - lastMoveTime < 16) return; // ~60fps
        lastMoveTime = now;

        const mouseDelta = parseFloat(track.dataset.mouseDownAt) - e.clientX,
            maxDelta = track.offsetWidth * 1.4;
        let percentage = (mouseDelta / maxDelta) * -100;
        let nextPercentageUnconstrained = parseFloat(track.dataset.prevPercentage) + percentage;

        if (nextPercentageUnconstrained > 70) return;
        if (nextPercentageUnconstrained < -70) return;
        if (percentage > 70) return;
        if (percentage < -70) return;
        let nextPercentage = Math.max(Math.min(CONFIG.MAX_PERCENTAGE, nextPercentageUnconstrained), -CONFIG.MAX_PERCENTAGE);

        if (Number.isNaN(nextPercentage)) nextPercentage = 0
        track.dataset.percentage = nextPercentage;

        // Use requestAnimationFrame for smoother animations
        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
            track.animate({
                transform: `translate(${nextPercentage - 50}%, -50%)`
            }, { duration: 150, fill: "forwards" });
        });

        // Clear any existing pending update
        if (pendingPositionUpdate) {
            clearTimeout(pendingPositionUpdate);
        }
        // Schedule debounced position update (removed immediate call for performance)
        pendingPositionUpdate = setTimeout(() => {
            cautBin();
            let studentNum2 = getStudentNumber(x);
            TweenMax.to(numarImagine, {
                y: -numarImagine.children[CONFIG.STUDENT_COUNT].offsetHeight * (studentNum2 - 1) + "px",
                duration: .3,
                ease: "power4.InOut",
            })
            lastX = x;
            pendingPositionUpdate = null;
        }, 300)
    }
    window.addEventListener('wheel', (e) => {
        // Allow natural scrolling in student detail view
        if (escAnimatieElev) {
            return; // Don't handle wheel events - let browser handle natural scrolling
        }

        // Handle modal navigation (BEFORE canScroll check)
        // Only allow modal navigation in elevi section
        if (track.dataset.lightBox === "true" && elevi.classList.contains('active')) {
            e.preventDefault(); // Prevent page scroll in modal

            // Accumulate wheel delta for threshold detection
            wheelAccumulator += e.deltaY

            // Clear existing timeout
            if (wheelNavigationTimeout) {
                clearTimeout(wheelNavigationTimeout)
            }

            // Set debounce timeout - trigger navigation after wheel stops
            wheelNavigationTimeout = setTimeout(() => {
                const threshold = 50 // Minimum delta to trigger navigation

                if (Math.abs(wheelAccumulator) > threshold) {
                    if (wheelAccumulator < 0) {
                        // Scroll up = previous student
                        navigateStudent('prev')
                    } else {
                        // Scroll down = next student
                        navigateStudent('next')
                    }
                }

                // Reset accumulator
                wheelAccumulator = 0
            }, 50) // 150ms debounce

            return;
        }

        // Only handle carousel scrolling if in elevi section and carousel is enabled
        if (!canScroll || track.dataset.canMove === "false" || !elevi.classList.contains('active')) {
            return; // Allow normal page scrolling
        }

        // Prevent default for carousel navigation
        e.preventDefault();

        // Don't handle wheel events during click animations - just cancel the animation
        if (isAnimatingCarousel) {
            isAnimatingCarousel = false;
            return;
        }

        const mouseDelta = e.deltaY,
            maxDelta = track.offsetWidth * 2,
            percentage = (mouseDelta / maxDelta) * 100;
        let nextPercentageUnconstrained = parseFloat(track.dataset.prevPercentage) + percentage;
        if (nextPercentageUnconstrained > 70) return;
        if (nextPercentageUnconstrained < -70) return;
        if (percentage > 70) return;
        if (percentage < -70) return;

        let nextPercentage = Math.max(Math.min(CONFIG.MAX_PERCENTAGE, nextPercentageUnconstrained), -CONFIG.MAX_PERCENTAGE);

        if (Number.isNaN(nextPercentage)) nextPercentage = 0
        track.dataset.percentage = nextPercentage;

        // Use requestAnimationFrame for smoother performance
        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
            track.animate({
                transform: `translate(${nextPercentage - 50}%, -50%)`
            }, { duration: 150, fill: "forwards" });
        });

        track.dataset.prevPercentage = track.dataset.percentage;

        // Clear any existing pending update
        if (pendingPositionUpdate) {
            clearTimeout(pendingPositionUpdate);
        }
        // Debounced position update (removed immediate call for performance)
        pendingPositionUpdate = setTimeout(() => {
            cautBin();
            let studentNum2 = getStudentNumber(x);
            TweenMax.to(numarImagine, {
                y: -numarImagine.children[CONFIG.STUDENT_COUNT].offsetHeight * (studentNum2 - 1) + "px",
                duration: .3,
                ease: "power4.InOut",
            })
            lastX = x;
            track.dataset.prevPercentage = track.dataset.percentage;
            pendingPositionUpdate = null;
        }, 301)
    }, { passive: false });

    //// Helper function to convert carousel position (1-55) to student number (1-28)
    function getStudentNumber(carouselPosition) {
        if (carouselPosition <= CONFIG.STUDENT_COUNT) {
            return carouselPosition;
        } else {
            return carouselPosition - CONFIG.STUDENT_COUNT;
        }
    }

    //// cautare binara element curent

    function cautBin() {
        // Don't recalculate position if we're in the middle of a click animation
        if (isAnimatingCarousel) return;

        // BATCH ALL DOM READS FIRST (eliminate layout thrashing)
        var elementDim = document.getElementById('element').getBoundingClientRect();
        const imageElements = document.getElementsByClassName('image');
        const imageRects = [];

        // Cache all getBoundingClientRect() calls in one pass
        for (let i = 0; i < CONFIG.TOTAL_IMAGES; i++) {
            imageRects[i] = imageElements[i].getBoundingClientRect();
        }

        // THEN DO BINARY SEARCH ON CACHED DATA (no more DOM reads in loop)
        var left = 0, right = CONFIG.TOTAL_IMAGES - 1;
        x = -1;

        while (left <= right) {
            var mijl = Math.floor((left + right) / 2);
            var imageDim = imageRects[mijl]; // Use cached rect instead of DOM query

            if (elementDim.left + elementDim.width <= imageDim.left + imageDim.width && elementDim.left >= imageDim.left) {
                left = right + 1;
                x = mijl + 1;
            }
            else if (elementDim.left > imageDim.left + imageDim.width)
                left = mijl + 1;
            else right = mijl - 1;
        }
        if (x === -1) x = left + 1;

        // Safety: Ensure x is always within valid bounds
        x = Math.max(1, Math.min(CONFIG.TOTAL_IMAGES, x));
    }

    //// fucntie deschidere modal pentru plus
    function openModalPlus() {
        track.dataset.canMove = "false";
        track.dataset.lightBox = "true";
        canHover = false
        modal_cnt = lastX
        openModal(images[x - 1]);
        plus.removeEventListener('click', openModalPlus)
    }
    plus.addEventListener('click', openModalPlus)

    //// aflare element curent peste care se afla mouse-ul
    window.onmouseover = e => {
        curentElem = document.elementsFromPoint(e.clientX, e.clientY)[0]
    }

    //// functie inchidere modal
    let openSpaceModal = false
    closeModalBtn.addEventListener('click', () => {
        // Guard against duplicate close clicks
        if (isClosing) return;
        isClosing = true;

        // Clean up all slide images when modal closes
        const slideImages = document.querySelectorAll('[id^="clone-image-next"]')
        slideImages.forEach(img => {
            gsap.killTweensOf(img)
            img.remove()
        })

        gsap.killTweensOf('#close-modal')
        TweenMax.to('#close-modal', {
            autoAlpha: 0,
            duration: .3,
        })
        TweenMax.to('#numePersoana', {
            autoAlpha: 0,
            duration: .3,
        })
        numePersoana.removeEventListener('click', animatieElev)
        plus.removeEventListener('click', animatieElev)
        cancelNameAnimation() // Cancel orphaned name animation timeout

        // Hide thumbnail carousel
        hideThumbnailCarousel()

        // Hide image navigation
        hideImageNavigation()

        // Center carousel immediately (hidden behind modal) before closing animation
        if (targetCenterPosition !== null) {
            centerCarouselOnPosition(targetCenterPosition);
        }

        // Wait for carousel to center, then update clone to shrink to center position
        setTimeout(() => {
            // Update clone timeline to reverse to CENTER position (where element is now)
            // Calculate center screen position for the image
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            const imageWidth = images[0].offsetWidth; // Use first image as reference
            const imageHeight = images[0].offsetHeight;

            // Center position on screen
            const centerLeft = (viewportWidth - imageWidth) / 2;
            const centerTop = (viewportHeight - imageHeight) / 2;

            // Recreate timeline with center position as the starting point
            cloneTimeline.kill();
            cloneTimeline = new TimelineMax({ paused: true });

            // Use the new reverse function with power2.out easing
            reverseCloneAnimation(imageWidth, imageHeight, centerLeft, centerTop);

            if (touchSupport) {
                TweenMax.to('#next', {
                    autoAlpha: 1,
                    duration: .5
                })
            }
            if (touchSupport) {
                TweenMax.to('#prev', {
                    autoAlpha: 1,
                    duration: .5
                })
            }
        }, 400) // Give time for carousel to center

        setTimeout(() => {
            TweenMax.to('#checkDiv', {
                autoAlpha: 1,
                duration: .5
            })
            openSpaceModal = true
        }, 700) // Adjusted timing

        // Reset modalOpen immediately to prevent ESC double-trigger
        modalOpen = false;

        setTimeout(() => {
            // Clear the target position after modal fully closes
            targetCenterPosition = null;
            clickedElement = null;
            // Complete state reset - prevent stale flags
            escModal = false;
            spaceModal = false;
            escAnimatieElev = false;
            canScroll = true;
            track.dataset.lightBox = "false";
            track.dataset.canMove = "true";
            isClosing = false; // Reset guard flag
        }, 1200) // Adjusted timing
    })



    /// animatii galerie
    const galerie = document.getElementById('galerie')
    let lastText = document.getElementById('textGalerie')
    for (const element of (galerie.children[0].children)) {
        const text = element.children[0].children[0].classList[0]
        if (lastText === document.getElementById('textGalerie')) {
            //// adaugare Animatie aparitie poze galerie
            gsap.from(document.getElementsByClassName(text), {
                scrollTrigger: {
                    trigger: lastText,
                    immediateRender: false,
                    toggleActions: "play none none reverse",
                    start: "100% 100%",
                    ///optimizare incarcare
                    /*onEnter: () => {
                        let row = Array.from(document.getElementsByClassName(text))
                        row.forEach((elem) => {
                            elem.src = elem.dataset.src
                        })
                    }*/
                },
                y: '100%',
                ease: "power4.InOut",
                stagger: .2,
                force3D: true,
                autoAlpha: 0,
                duration: .2,

            })
        }
        else {
            //// adaugare Animatie aparitie poze galerie

            gsap.from(document.getElementsByClassName(text), {
                scrollTrigger: {
                    trigger: document.getElementsByClassName(lastText)[0],
                    toggleActions: "play none none reverse",
                    ///markers: true,
                    start: "-=800",
                    ///optimizare incarcare
                    /*onEnter: () => {
                        let row = Array.from(document.getElementsByClassName(text))
                        row.forEach((elem) => {
                            elem.src = elem.dataset.src
                        })
                    }*/
                },
                y: '100%',
                ease: "power4.InOut",
                autoAlpha: 0,
                force3D: true,
                stagger: .2,
                duration: .2
            })
        }
        lastText = text
    }
    for (const element of (galerie.children)) {
        for (const images of (element.children)) {
            FadeInAnimation(images.children[0].children[0])
        }
    }
    //// adaugare efect FadeIn poze galerie 

    //// inceput animatie intrare elevi

    function animatieElev() {
        canScroll = false
        escModal = false

        spaceModal = false
        escAnimatieElev = true
        // Unlock scrolling completely for student detail view
        bodyElement.style.overflow = "visible"
        htmlElement.style.overflow = "visible";

        // Hide thumbnail carousel when opening student details
        hideThumbnailCarousel()
        // Hide image navigation
        hideImageNavigation()

        const elemDespre = document.getElementById(`${cloneImg.dataset.pers}`)
        document.getElementById('titluElev').innerText = numePersoana.innerText
        document.getElementById('pozaelev').src = cloneImg.src
        document.getElementById('pozaelev2').src = cloneImg.dataset.src
        document.getElementById('p1').innerText = elemDespre.dataset.p1
        document.getElementById('p2').innerText = elemDespre.dataset.p2
        if (elemDespre.dataset.autor === undefined) document.getElementById('citat').innerText = "~ " + "\"" + elemDespre.dataset.citat + "\""
        else document.getElementById('citat').innerText = "~ " + "\"" + elemDespre.dataset.citat + "\"" + " " + elemDespre.dataset.autor
        document.getElementById('melodiePref').src = elemDespre.dataset.src
        if (cloneImg.dataset.pers === 'tirca') document.getElementById('melodiePref').style.display = 'none'
        else document.getElementById('melodiePref').style.display = 'block'

        // Optimized animation with staggered elements
        const tl = gsap.timeline({
            onComplete: () => {
                iesireSectiune.addEventListener('click', iesireanimatieelev)
                // Clear will-change after animation
                gsap.set("#despreElev", { clearProps: "willChange" });
            }
        });

        // Main overlay fade in
        tl.fromTo("#despreElev",
            {
                autoAlpha: 0,
                display: "none",
            },
            {
                autoAlpha: 1,
                display: "block",
                duration: 0.3,
                ease: "power2.out",
            }
        )
            // Sidebar slides in from left with fade
            .fromTo("#despreSidebar",
                {
                    x: -50,
                    autoAlpha: 0,
                },
                {
                    x: 0,
                    autoAlpha: 1,
                    duration: 0.5,
                    ease: "power3.out",
                },
                "-=0.2"
            )
            // Content area slides in from right with fade
            .fromTo("#despreContent",
                {
                    x: 50,
                    autoAlpha: 0,
                },
                {
                    x: 0,
                    autoAlpha: 1,
                    duration: 0.5,
                    ease: "power3.out",
                },
                "-=0.4"
            )
            // Stagger sidebar elements
            .fromTo(["#despreSidebar #pozaelev", "#titluElev", "#despreJos", "#melodiePref"],
                {
                    y: 20,
                    autoAlpha: 0,
                },
                {
                    y: 0,
                    autoAlpha: 1,
                    duration: 0.4,
                    stagger: 0.08,
                    ease: "back.out(1.2)",
                },
                "-=0.3"
            )
            // Stagger content elements
            .fromTo(["#contentScroll .contentTitle", "#contentScroll p", ".contentImages", "#citat"],
                {
                    y: 30,
                    autoAlpha: 0,
                },
                {
                    y: 0,
                    autoAlpha: 1,
                    duration: 0.5,
                    stagger: 0.1,
                    ease: "power2.out",
                },
                "-=0.5"
            );
    }

    //// iesire animatie intrare elevi

    function iesireanimatieelev() {

        spaceModal = true
        despreElev.position = "absolute";

        // Show thumbnail carousel and navigation when returning to modal
        if (track.dataset.lightBox === "true") {
            setTimeout(() => {
                showThumbnailCarousel(currentCarouselIndex)
                showImageNavigation()
            }, 300)
        }

        // Optimized exit animation with reverse stagger
        const exitTl = gsap.timeline({
            onComplete: () => {
                // Reset flags to match UI state after exiting student detail view
                escAnimatieElev = false;
                escModal = true;
                spaceModal = true;

                if (elevi.classList.contains('active') === true) {
                    bodyElement.style.overflowY = "hidden"
                    htmlElement.style.overflow = "hidden";
                }
                iesireSectiune.removeEventListener('click', iesireanimatieelev)
                canScroll = true
            }
        });

        // Fade out content elements in reverse
        exitTl.to(["#citat", ".contentImages", "#contentScroll p", "#contentScroll .contentTitle"],
            {
                y: -20,
                autoAlpha: 0,
                duration: 0.25,
                stagger: 0.05,
                ease: "power2.in",
            }
        )
            // Fade out sidebar elements
            .to(["#melodiePref", "#despreJos", "#titluElev", "#despreSidebar #pozaelev"],
                {
                    y: -15,
                    autoAlpha: 0,
                    duration: 0.25,
                    stagger: 0.04,
                    ease: "power2.in",
                },
                "-=0.15"
            )
            // Slide out sidebar and content
            .to("#despreSidebar",
                {
                    x: -30,
                    autoAlpha: 0,
                    duration: 0.3,
                    ease: "power2.in",
                },
                "-=0.1"
            )
            .to("#despreContent",
                {
                    x: 30,
                    autoAlpha: 0,
                    duration: 0.3,
                    ease: "power2.in",
                },
                "-=0.3"
            )
            // Final overlay fade out
            .to("#despreElev",
                {
                    autoAlpha: 0,
                    duration: 0.2,
                    ease: "power1.in",
                    display: "none",
                },
                "-=0.1"
            );
    }

    //// functie incarcare pagina
    window.onload = (e) => {
        console.log("DA")

    }


    //// functii pentru device-uri cu touchscreen
    window.onmousedown = e => handleOnDown(e);

    window.ontouchstart = e => handleOnDown(e.touches[0]);

    window.onmouseup = e => handleOnUp(e);

    window.ontouchend = e => handleOnUp(e.touches[0]);

    window.onmousemove = e => handleOnMove(e);

    window.ontouchmove = e => handleOnMove(e.touches[0]);

    nextBtn.onclick = () => {
        // Don't allow arrow navigation during click animation
        if (isAnimatingCarousel) return;

        let nextPercentageUnconstrained = parseFloat(track.dataset.prevPercentage) - CONFIG.PERCENTAGE_PER_STUDENT;
        if (nextPercentageUnconstrained > 70) return;
        if (nextPercentageUnconstrained < -70) return;

        let nextPercentage = Math.max(Math.min(CONFIG.MAX_PERCENTAGE, nextPercentageUnconstrained), -CONFIG.MAX_PERCENTAGE);

        track.dataset.percentage = nextPercentage;
        track.animate({
            transform: `translate(${nextPercentage - 50}%, -50%)`
        }, { duration: 150, fill: "forwards" });

        lastX++;
        x = lastX;
        if (x <= CONFIG.TOTAL_IMAGES) {
            let studentNum = getStudentNumber(x);
            TweenMax.to(numarImagine, {
                y: -numarImagine.children[CONFIG.STUDENT_COUNT].offsetHeight * (studentNum - 1) + "px",
                duration: .3,
                ease: "power4.InOut",
            })

        }
        track.dataset.prevPercentage = track.dataset.percentage;
    }
    prevBtn.onclick = () => {
        // Don't allow arrow navigation during click animation
        if (isAnimatingCarousel) return;

        let nextPercentageUnconstrained = parseFloat(track.dataset.prevPercentage) + CONFIG.PERCENTAGE_PER_STUDENT;
        if (nextPercentageUnconstrained > 70) return;
        if (nextPercentageUnconstrained < -70) return;

        let nextPercentage = Math.max(Math.min(CONFIG.MAX_PERCENTAGE, nextPercentageUnconstrained), -CONFIG.MAX_PERCENTAGE);

        track.dataset.percentage = nextPercentage;
        track.animate({
            transform: `translate(${nextPercentage - 50}%, -50%)`
        }, { duration: 150, fill: "forwards" });

        lastX--;
        x = lastX;
        if (x >= 1) {
            let studentNum = getStudentNumber(x);
            TweenMax.to(numarImagine, {
                y: -numarImagine.children[CONFIG.STUDENT_COUNT].offsetHeight * (studentNum - 1) + "px",
                duration: .3,
                ease: "power4.InOut",
            })
            lastX = x;
        }

        track.dataset.prevPercentage = track.dataset.percentage;
    }

    jQuery.support.touch = 'ontouchend' in document;

    let touchSupport = false;

    function isTouchDevice() {
        return (
            (navigator.maxTouchPoints > 0) ||
            (navigator.msMaxTouchPoints > 0));
    }
    function detectTouchSupport() {
        if (jQuery.support.touch)
            touchSupport = true;
        if (isTouchDevice())
            touchSupport = true;
        console.log(touchSupport)
        if (touchSupport === true) {
            TweenMax.to('#next', {
                autoAlpha: 1,
                duration: 0
            })
            TweenMax.to('#prev', {
                autoAlpha: 1,
                duration: 0
            })
        }
        else {
            TweenMax.to('#next', {
                autoAlpha: 0,
                duration: 0
            })
            TweenMax.to('#prev', {
                autoAlpha: 0,
                duration: 0
            })
        }
    }
    detectTouchSupport();
    document.getElementById('checkboxSageti').addEventListener('click', () => {
        console.log("check")
        var checkBox = document.getElementById("checkboxSageti");
        if (checkBox.checked === true) {
            console.log("DA")
            touchSupport = true
            TweenMax.to('#next', {
                autoAlpha: 1,
                duration: .5
            })
            TweenMax.to('#prev', {
                autoAlpha: 1,
                duration: .5
            })
        } else {
            touchSupport = false
            TweenMax.to('#next', {
                autoAlpha: 0,
                duration: .5
            })
            TweenMax.to('#prev', {
                autoAlpha: 0,
                duration: .5
            })
        }
    })
    /// resetare splitext pentru resize
    window.addEventListener('resize', () => {
        resized = true;
        if (despre.classList.contains('active') === true) {
            init_SplitText();
        }
    })
})
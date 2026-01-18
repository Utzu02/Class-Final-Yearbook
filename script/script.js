//// initializare lightbox
$(document).ready(() => {

    lightbox.option({
        'resizeDuration': 200,
        'wrapAround': true,
        'disableScrolling': true,
        'maxHeight': 700,
        'showImageNumberLabel': false,
        'alwaysShowNavOnTouchDevices': true,
        'positionFromTop': 140
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
     * Animates team members with staggered timing
     * @param {string} selector - CSS selector ('.diriginte' or '.membru')
     * @param {boolean} reverse - Animate in reverse order
     * @param {number} staggerDelay - Delay between each element (ms)
     * @param {number} initialDelay - Delay before starting (ms)
     * @param {Function} onComplete - Callback when complete
     */
    function animateTeamMembers(selector, reverse = false, staggerDelay = CONFIG.ANIMATION.TEAM_MEMBER_STAGGER, initialDelay = CONFIG.ANIMATION.TEAM_MEMBER_INITIAL_DELAY, onComplete = null) {
        setTimeout(() => {
            const elements = document.querySelectorAll(selector);
            const elementCount = elements.length;
            let i = reverse ? elementCount - 1 : 0;

            for (const element of elements) {
                setTimeout(() => {
                    element.classList.toggle('andir');
                }, Math.abs(i) * staggerDelay);

                i = reverse ? i - 1 : i + 1;
            }

            if (onComplete) {
                setTimeout(onComplete, elementCount * staggerDelay);
            }
        }, initialDelay);
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
    let letters = 0
    let tween = 0
    let lastX = 27;
    let resized = false
    let spaceModal = false
    canSwitchText = true
    let isAnimatingCarousel = false  // Flag to prevent position recalculation during animation
    let pendingPositionUpdate = null  // Store timeout ID for position updates
    let lastMoveTime = 0  // For throttling mouse move
    let rafId = null  // RequestAnimationFrame ID for smooth animations

    track.dataset.lightBox = "false"
    track.dataset.percentage = 0;
    var canScroll = true
    document.getElementById('nrtotal').textContent = (document.querySelectorAll(".image").length - 1) / 2


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
            cloneTimeline.reverse();
        }
    }, +0.6)

    splitTextTimeline = new TimelineMax({ paused: true });



    //// functie fade-in element imagini
    function FadeInAnimation(element) {
        let FadeInAnimation = TweenMax.to(element, {
            paused: true,
            autoAlpha: 1,
            duration: .15,
            ease: "power4.out",
        })
        element.addEventListener('mouseover', () => {
            if (canHover) FadeInAnimation.play()
            else if (canHoverDespre === "true") FadeInAnimation.play()
        })
        element.addEventListener('mouseleave', () => {
            if (canHover) FadeInAnimation.reverse()
            else if (canHoverDespre === "true") FadeInAnimation.reverse()
        })
    }
    //// functie fade-in element
    let FadeIn = TweenMax.to(element, {
        display: "block",
        autoAlpha: 1,
        duration: .3,
        onReverseComplete: () => {
            numePersoana.style.display = 'none'
            FadeIn.kill()
        }
    })
    function FadeInAny(element, ok) {
        if (ok === true) {
            element.innerText = cloneImg.dataset.text
            FadeIn = TweenMax.to(element, {
                display: "block",
                autoAlpha: 1,
                duration: .3,
                onReverseComplete: () => {
                    numePersoana.style.display = 'none'
                    FadeIn.kill()
                }
            })
            FadeIn.play()
        }
        else FadeIn.reverse()
    }
    //// marire imagine tot ecranul
    var ap = [];
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
                closeModalBtn.click()
                escModal = false
                spaceModal = false
            }
            else if (escAnimatieElev) {
                iesireanimatieelev()
                escAnimatieElev = false
                escModal = true
            }
            else {
                console.log("modal not open")
            }
        }
        else if (evt.keyCode === 32) {
            plus.click()
        }
        else if(evt.keyCode === 37) {
            if(modalOpen===false) prevBtn.click()
        }
        else if(evt.keyCode === 39)
        {
            if(modalOpen===false) nextBtn.click()
        }
    };
    let modalOpen = false;
    //// deschidere Modal
    function openModal(element) {
        openSpaceModal = false
        modalOpen = true

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

        // Find the closest instance of this student to current position x
        // The student appears at: studentId and studentId + 28 (if < 28)
        let possiblePositions = [studentId];
        if (studentId < CONFIG.STUDENT_COUNT) {
            possiblePositions.push(studentId + CONFIG.STUDENT_COUNT);
        }

        // Calculate which instance is closer using circular distance
        // In a circular carousel, distance wraps around at the edges
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

        let targetPosition = bestPosition;
        let distance = Math.abs(targetPosition - x);

        // Adjust duration based on distance
        var duration = 300;
        if (distance === 0) duration = 150
        else if (distance < 2) duration = 250
        else if (distance < 3) duration = 350
        else duration = 450

        // Calculate target percentage for the target position
        let targetPercentage;
        if (targetPosition === CONFIG.STUDENT_COUNT) {
            targetPercentage = 0;
        }
        else if (targetPosition <= CONFIG.STUDENT_COUNT) {
            targetPercentage = CONFIG.MAX_PERCENTAGE / CONFIG.STUDENT_COUNT_MINUS_1 * (CONFIG.STUDENT_COUNT - targetPosition);
        }
        else {
            // For positions 29-55 (duplicates), calculate extended percentage
            let posInDuplicates = targetPosition - CONFIG.STUDENT_COUNT; // 1-27
            targetPercentage = -CONFIG.MAX_PERCENTAGE / CONFIG.STUDENT_COUNT_MINUS_1 * posInDuplicates;
        }

        track.dataset.prevPercentage = targetPercentage;
        track.dataset.percentage = targetPercentage;
        track.animate({
            transform: `translate(${targetPercentage - 50}%, -50%)`
        }, { duration: duration, fill: "forwards" });

        // Update x to the actual target position (1-55), not just studentId
        x = targetPosition
        lastX = x;
        console.log("Moving to position:", x, "Student:", studentId)

        // Smooth fade out of UI elements
        TweenMax.to(checkDiv, {
            autoAlpha: 0,
            duration: .4,
            ease: "power2.out"
        })

        // Fade out other carousel images smoothly and highlight selected image
        document.querySelectorAll('.image').forEach((img) => {
            if (img !== element) {
                TweenMax.to(img, {
                    autoAlpha: 0.3,
                    scale: 0.95,
                    duration: .5,
                    ease: "power2.out"
                });
            } else {
                // Highlight the selected image
                TweenMax.to(img, {
                    autoAlpha: 1,
                    scale: 1.05,
                    duration: .4,
                    ease: "power2.out"
                });
            }
        });

        // Display the student number (1-28), not the carousel position (1-55)
        TweenMax.to(numarImagine, {
            y: -numarImagine.children[CONFIG.STUDENT_COUNT].offsetHeight * (studentId - 1) + "px",
            duration: .3,
            ease: "power4.InOut",
        })

        bodyElement.style.pointerEvents = "none"
        htmlElement.style.pointerEvents = "none";
        setTimeout(()=> {
            spaceModal = true
            escModal = true
        }, 700)

        // Unlock after animation completes and verify position
        setTimeout(() => {
            isAnimatingCarousel = false;
            // Verify that we ended up at the correct position
            track.dataset.percentage = targetPercentage;
            track.dataset.prevPercentage = targetPercentage;
        }, duration + 50)
        setTimeout(() => {
            cloneTimelineConstructor()
            plus.removeEventListener('click', openModalPlus)
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
        }, duration + 100)
        setTimeout(() => {

            bodyElement.style.pointerEvents = "auto"
            htmlElement.style.pointerEvents = "auto";
        }, duration + 320)

    }

    //// resetare Timeline Clona

    function killCloneTimeline() {

        track.dataset.canMove = "true";
        cloneImg.src = ""
        cloneImg.style.width = 0 + "px"
        cloneImg.style.height = 0 + "px"

        // Restore all carousel images to their original opacity and scale
        document.querySelectorAll('.image').forEach((img) => {
            TweenMax.to(img, {
                autoAlpha: 0.8,
                scale: 1,
                duration: .5,
                ease: "power2.out"
            });
        });

        plus.addEventListener('click', openModalPlus)
        cloneTimeline.kill()
    }

    //// constructor Timeline Clona

    function cloneTimelineConstructor() {
        track.dataset.prevPercentage = track.dataset.percentage;
        cloneTimeline = new TimelineMax({ paused: true })

        // Add subtle scale effect during expansion
        TweenMax.set(cloneImg, { scale: 1, transformOrigin: "center center" });

        cloneTimeline.to(cloneImg, {
            width: "100%",
            height: "100%",
            left: 0,
            top: 0,
            scale: 1.02,
            duration: .7,
            ease: "power2.inOut",
            onReverseComplete: () => {
                killCloneTimeline()
            },
            onComplete: () => {
                // Settle back to normal scale
                TweenMax.to(cloneImg, {
                    scale: 1,
                    duration: .3,
                    ease: "power2.out"
                });

                if (track.dataset.canMove === "false") {
                    FadeInAny(numePersoana, true)
                    numePersoana.addEventListener('click', animatieElev)
                    plus.addEventListener('click', animatieElev)
                    TweenMax.to('#close-modal', {
                        onStart: () => {
                            closeModalBtn.style.display = 'block'
                        },
                        autoAlpha: .7,
                        duration: .8,
                        ease: "power2.out"
                    })

                }
            }
        })
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
    var timelineDiriginte = new TimelineLite();
    /*timelineDiriginte.to(".diriginte", {
        autoAlpha: 1,
        filter: 'blur(0px)',
        y: '0%',
        ease: "power4.InOut",
        stagger: .3,
        delay: .3,
        duration: .5,
        force3D: true,
        lazy: false,
        onComplete: () => {
            canHoverDespre = "true"
        }
        
    })*/
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

    /*  onStart: () => {
          textBox.style.display = 'block'
      },*/
    splitTextTimeline.from(mySplitText.lines,
        {
            onReverseComplete: () => {
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
                    filter: 'blur(3px)',
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
                        cloneTimeline.reverse();
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

    //// inchidere modal (vechi)

    /*imageViewer.addEventListener('click', (e) => {
        if (document.elementsFromPoint(e.clientX, e.clientY)[0].classList.contains("modal-content") === false) {
            track.dataset.canMove = "true";
            track.dataset.lightBox = "false"
            TweenMax.to('#image-viewer', {
                display: "none",
                duration: 0
            })
            TweenMax.to('.modal-content', {
                scale: 0,
                duration: 0
            })
        }
    })*/

    //// recalcularea pozitiei plus pentru redimensionarea paginii

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

        // Immediate position update for real-time feedback
        cautBin();
        let studentNum = getStudentNumber(x);
        TweenMax.to(numarImagine, {
            y: -numarImagine.children[CONFIG.STUDENT_COUNT].offsetHeight * (studentNum - 1) + "px",
            duration: .3,
            ease: "power4.InOut",
        })
        lastX = x;

        // Clear any existing pending update
        if (pendingPositionUpdate) {
            clearTimeout(pendingPositionUpdate);
        }
        // Schedule secondary position update for accuracy
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
    window.onwheel = e => {

        if (!canScroll) return;

        // Don't handle wheel events during click animations - just cancel the animation
        if (isAnimatingCarousel) {
            isAnimatingCarousel = false;
            return;
        }

        if (track.dataset.lightBox === "true") {
            track.dataset.lightBox = "false";

            plus.removeEventListener('click', animatieElev)
            TweenMax.to('#numePersoana', {
                autoAlpha: 0,
                duration: .3,
            })
            setTimeout(()=> {
                cloneTimeline.reverse()
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
            },300)
            setTimeout(()=>{

                TweenMax.to('#checkDiv', {
                    autoAlpha: 1,
                    duration: .5
                })
            },500)
            gsap.killTweensOf('#close-modal')
            TweenMax.to('#close-modal', {
                autoAlpha: 0,
                duration: .3,
            })
            return;
        }
        if (track.dataset.canMove === "false") return;

        // Prevent default to stop page scroll
        e.preventDefault();

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

        // Immediate position update
        cautBin();
        let studentNum = getStudentNumber(x);
        TweenMax.to(numarImagine, {
            y: -numarImagine.children[CONFIG.STUDENT_COUNT].offsetHeight * (studentNum - 1) + "px",
            duration: .3,
            ease: "power4.InOut",
        })
        lastX = x;
        track.dataset.prevPercentage = track.dataset.percentage;

        // Clear any existing pending update
        if (pendingPositionUpdate) {
            clearTimeout(pendingPositionUpdate);
        }
        // Debounce secondary position update
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
    }

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

        var elementDim = document.getElementById('element').getBoundingClientRect();
        var left = 0, right = CONFIG.TOTAL_IMAGES - 1
        var image
        x = -1
        while (left <= right) {
            var mijl = Math.floor((left + right) / 2)
            image = document.getElementsByClassName('image')[mijl]
            var imageDim = image.getBoundingClientRect();
            if (elementDim.left + elementDim.width <= imageDim.left + imageDim.width && elementDim.left >= imageDim.left) {
                left = right + 1;
                x = mijl + 1
            }
            else if (elementDim.left > imageDim.left + imageDim.width)
                left = mijl + 1
            else right = mijl - 1
        }
        if (x === -1) x = left + 1

        // Safety: Ensure x is always within valid bounds
        x = Math.max(1, Math.min(CONFIG.TOTAL_IMAGES, x));
    }

    //// cazuri particulare la plus-ul de pe imaginea X pentru Hover
    plus.addEventListener('mouseover', () => {
        let FadeInAnimation = TweenMax.to(images[x - 1], {
            paused: true,
            autoAlpha: 1,
            duration: .15,
            ease: "power4.out",
        })
        if (canHover) FadeInAnimation.play()
    })
    plus.addEventListener('mouseleave', () => {
        let FadeInAnimation = TweenMax.to(images[x - 1], {
            paused: true,
            autoAlpha: 1,
            duration: .15,
            ease: "power4.out",
        })
        if (canHover && curentElem != currentHoverImage) FadeInAnimation.reverse()
    })

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

    /* Deschidere modal vechi
    
       var element = images[x - 1];
       track.dataset.canMove = "false";
       imageViewer.children[1].src = element.src;
    
       track.dataset.lightBox = "true"
       TweenMax.to('.modal-content', {
           scale: 1,
           duration: 0.6
       })
       TweenMax.to('#image-viewer', {
           display: "flex",
           duration: 0
       })
    
       */

    //// aflare element curent peste care se afla mouse-ul
    window.onmouseover = e => {
        curentElem = document.elementsFromPoint(e.clientX, e.clientY)[0]
    }

    //// functie inchidere modal
    let openSpaceModal = false
    closeModalBtn.addEventListener('click', () => {
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
        
        setTimeout(()=> {
            cloneTimeline.reverse()
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
        },300)
        setTimeout(()=>{

            TweenMax.to('#checkDiv', {
                autoAlpha: 1,
                duration: .5
            })
            openSpaceModal = true
        },500)
        setTimeout(()=> {

            modalOpen = false
        },1000)
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
        bodyElement.style.overflowY = "visible"
        htmlElement.style.overflow = "visible";

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
        
        // Optimized exit animation with reverse stagger
        const exitTl = gsap.timeline({
            onComplete: () => {
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
    document.getElementById('checkboxSageti').addEventListener('click',() => {
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
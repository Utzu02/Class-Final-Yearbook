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
    //// initializare variabile globale
    gsap.ticker.lagSmoothing(1000, 16);
    gsap.registerPlugin(ScrollTrigger)
    const containerDespre = document.getElementById('despre')
    var x = 1;
    var curentElem;
    var cloneTimeline = new TimelineMax({ paused: true })
    var canHover = "false"
    var currentHoverImage;
    let letters = 0
    let tween = 0
    let lastX = 27;
    canSwitchText = true
    const track = document.getElementById("image-container");
    const cloneImg = document.getElementById('clone-image');
    const elevi = document.getElementById("sectiune_elevi");
    const despre = document.getElementById("sectiune_despre");
    const plus = document.getElementById("element");
    const imageViewer = document.getElementById("image-viewer");
    const images = document.querySelectorAll(".image");
    const contact = document.getElementById('sectiune_contact');
    const containerContact = document.getElementById('contact');
    track.dataset.lightBox = "false"
    track.dataset.percentage = 0;
    var canScroll = "true"
    document.getElementById('nrtotal').textContent = (document.querySelectorAll(".image").length - 1) / 2


    //// fade-in continut pagina
    TweenMax.to('body', {
        autoAlpha: 1,
        duration: 1.5
    })
    var t2 = new TimelineMax({ paused: true })
    t2.to('#elevi', {
        onStart: () => {
            document.getElementById("elevi").style.display = "block"
            const numarImagine = document.getElementById('numarimagine')
            document.getElementById('numarjos').style.height = document.getElementById("numarimagine").children[0].offsetHeight + "px"
            TweenMax.to(numarImagine, {
                y: -numarImagine.children[28].offsetHeight * 27 - (numarImagine.children[28].offsetHeight - numarImagine.children[28].parentElement.offsetHeight) + "px",
                duration: 0,
            })
            containerContact.style.display = 'none'
        },
        onComplete: () => {
            containerDespre.style.display = 'none'
        },
        autoAlpha: 1,
        duration: .5
    },)
    t2.to('.image',
        {
            duration: .9,
            stagger: { amount: .9 },
            filter: 'blur(0px)',
            ease: 'power1.inOut',
            y: '0',
            onComplete: () => {
                setarePlus();
            }
        }, .25)
    TweenMax.to(plus, {
        autoAlpha: 0
    })
    t2.to(plus,
        {
            autoAlpha: 1,
            duration: .5,
            delay: .1,
        })

    var t1 = new TimelineMax({ paused: true })
    t1.to(plus,
        {
            autoAlpha: 0,
            duration: .4,
        })
    t1.to('.image', {
        duration: .9,
        filter: 'blur(3px)',
        ease: 'power4.Out',
        y: '200%',
        stagger: { amount: .9 },
        onComplete: () => {

            canHover = "false";
        }
    })

    t1.to('#elevi', {
        autoAlpha: 0,
        duration: .7,
        onComplete: () => {
            TweenMax.to(containerDespre, {
                autoAlpha: 1,
                duration: .5
            })
            containerDespre.style.display = 'block'
            document.getElementById('TextBox').style.display = 'block'
            document.getElementById("elevi").style.display = "none"
            document.getElementById('container').style.display = 'block'

            TweenMax.to('#clasaImg', {
                autoAlpha: 1,
                duration: 2.5,
                onStart: () => {
                    document.getElementById("clasaImg").style.visibility = "visible"
                }
            })
            splitTextTimeline.progress(0);
            splitTextTimeline.play();
            TweenMax.to('#close-modal', {
                autoAlpha: 0,
                duration: 0,
                onComplete: () => {
                    closeModal.style.display = 'none'
                }
            })
            cloneTimeline.reverse();
        }
    }, +0.6)
    mySplitText = new SplitType('#TextBox', { type: "lines", position: "absolute" })
    mySplitText.split({ type: "words,chars" })
    gsap.set("#TextBox", { perspective: 400 });
    var chars = mySplitText.chars;
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
            if (canHover === "true") FadeInAnimation.play()
            else if (canHoverDespre === "true") FadeInAnimation.play()
        })
        element.addEventListener('mouseleave', () => {
            if (canHover === "true") FadeInAnimation.reverse()
            else if (canHoverDespre === "true") FadeInAnimation.reverse()
        })
    }
    //// functie fade-in element
    let FadeIn = TweenMax.to(element, {
        display: "block",
        autoAlpha: 1,
        duration: .3,
        onReverseComplete: () => {
            document.getElementById('numePersoana').style.display = 'none'
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
                    document.getElementById('numePersoana').style.display = 'none'
                    FadeIn.kill()
                }
            })
            FadeIn.play()
        }
        else FadeIn.reverse()
    }
    //// marire imagine tot ecranul

    let i = 0;
    images.forEach((element) => {
        //// creare element pentru numarare
        let newElem = document.createElement('p')
        i++;
        newElem.innerText = i;
        let span = document.getElementById("numarimagine")
        if (newElem.innerText < 28)
            span.appendChild(newElem)
        else if (newElem.innerText == 28) {
            newElem.innerText = 0;
            span.appendChild(newElem)
        }
        else {
            newElem.innerText = i - 28;
            span.appendChild(newElem)
        }

        FadeInAnimation(element)
        element.addEventListener('click', () => {
            if (canHover === "true") {
                track.dataset.canMove = "false";
                track.dataset.lightBox = "true";
                openModal(element);
            }
        })
    })
    //// deschidere Modal

    function openModal(element) {
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
    }

    //// resetare Timeline Clona

    function killCloneTimeline() {

        track.dataset.canMove = "true";
        cloneImg.src = ""
        cloneImg.style.width = 0 + "px"
        cloneImg.style.height = 0 + "px"
        if (currentHoverImage != curentElem) {
            TweenMax.to(currentHoverImage, {
                autoAlpha: .8,
                duration: .15,
                ease: "power4.out",
            })
        }
        plus.addEventListener('click', openModalPlus)
        cloneTimeline.kill()
    }

    //// constructor Timeline Clona

    function cloneTimelineConstructor() {
        track.dataset.prevPercentage = track.dataset.percentage;
        cloneTimeline = new TimelineMax({ paused: true })
        cloneTimeline.to(cloneImg, {
            width: "100%",
            height: "100%",
            left: 0,
            top: 0,
            duration: .7,
            ease: "power2.inOut",
            onReverseComplete: () => {
                killCloneTimeline()
            },
            onComplete: () => {
                if (track.dataset.canMove === "false") {
                    FadeInAny(document.getElementById('numePersoana'), true)
                    document.getElementById('numePersoana').addEventListener('click', animatieElev)
                    plus.addEventListener('click', animatieElev)
                    TweenMax.to('#close-modal', {
                        onStart: () => {
                            closeModal.style.display = 'block'
                        },
                        autoAlpha: .7,
                        duration: 1
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
                document.getElementById('numePersoana').style.display = 'none'
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
        setTimeout(() => {
            var i = 0;
            for (const dirig of document.querySelectorAll('.diriginte')) {
                setTimeout(() => {
                    dirig.classList.toggle('andir')
                }, i * 150)
                i++;
            }
            canHoverDespre = "true"
        }, 200)
    }
    function animatieDirigRev() {
        var i = 3;
        for (const dirig of document.querySelectorAll('.diriginte')) {
            setTimeout(() => {
                dirig.classList.toggle('andir')
            }, i * 150)
            i--;
        }
        canHoverDespre = "false"
    }
    //// animatie text sectiune XII A

    /*  onStart: () => {
          document.getElementById('TextBox').style.display = 'block'
      },*/
    splitTextTimeline.from(mySplitText.lines,
        {
            onReverseComplete: () => {
                document.getElementById('container').style.display = 'none'
                x = 28;
                let i = 0;
                /*for (const image of track.getElementsByClassName("image")) {
                    i = i + 50 / 28;
                    image.animate({
                        objectPosition: `50% 50%`
                    }, { duration: 150, fill: "forwards" });
                }*/
                /*cloneImg.animate({
                    objectPosition: `50% 50%`
                }, { duration: 150, fill: "forwards" });*/
                track.dataset.prevPercentage = 0;
                track.animate({
                    transform: `translate(-50%, -50%)`
                }, { duration: 150, fill: "forwards" });
                lastX = x;
                t2.progress(0);
                t2.play();
                canHover = "true"
                document.getElementById('TextBox').style.display = 'none'
            },
        });
    splitTextTimeline.play();

    //// intrare sectiune elevi
    elevi.addEventListener('click', () => {
        ////if (elevi.classList.contains('active') === false && canHover === "false") 
        if (elevi.classList.contains('active') === false) {
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
                canScroll = "true"
                document.getElementsByClassName('lb-close')[0].click()
                track.dataset.canMove = "true";
                despre.classList.remove('active');
                elevi.classList.add('active');
                canHoverDespre = "false"

                document.body.style.overflow = "hidden"
                document.getElementsByTagName("html")[0].style.overflow = "hidden";

                TweenMax.to('#clasaImg', {
                    autoAlpha: 0,
                    duration: .5,
                    onComplete: () => {
                        document.getElementById("clasaImg").style.visibility = "hidden"
                    }
                })
                TweenMax.to(containerDespre, {
                    autoAlpha: 0,
                    duration: .5
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
                var i = 3;
                for (const dirig of document.querySelectorAll('.membru')) {
                    setTimeout(() => {
                        dirig.classList.toggle('andir')
                    }, i * 200)
                    i--;
                }
                canHoverDespre = "false"
                TweenMax.to(containerContact, {
                    autoAlpha: 0,
                    duration: .5,
                    delay: .3,
                    onComplete: () => {
                        splitTextTimeline.reverse();

                    }
                })
            }
        }
    });

    //// intrare sectiune XII A
    despre.addEventListener('click', () => {
        ////if (despre.classList.contains('active') === false && canHover === "true") 
        if (despre.classList.contains('active') === false) {

            if (elevi.classList.contains('active') === true) {
                console.log("DA")
                TweenMax.to('#numePersoana', {
                    autoAlpha: 0,
                    duration: .3,
                })
                canScroll = "false"
                track.dataset.canMove = "false";
                despre.classList.add('active');
                elevi.classList.remove('active');
                iesireanimatieelev()
                document.body.style.removeProperty('overflow-y')
                document.getElementsByTagName("html")[0].style.removeProperty('overflow-y')

                t1.progress(0);
                t1.play();
            }
            else {
                despre.classList.add('active');
                contact.classList.remove('active');
                document.body.style.removeProperty('overflow-y')
                document.getElementsByTagName("html")[0].style.removeProperty('overflow-y')
                var i = 3;
                for (const dirig of document.querySelectorAll('.membru')) {
                    setTimeout(() => {
                        dirig.classList.toggle('andir')
                    }, i * 200)
                    i--;
                }

                canHoverDespre = "false"
                TweenMax.to(containerContact, {
                    autoAlpha: 0,
                    duration: .7,
                    delay: .3,
                    onComplete: () => {
                        document.getElementById("contact").style.display = "none"
                        containerDespre.style.display = 'block'
                        TweenMax.to(containerDespre, {
                            autoAlpha: 1,
                            duration: .5
                        })
                        document.getElementById('TextBox').style.display = 'block'
                        document.getElementById('container').style.display = 'block'
                        containerContact.style.display = 'none'

                        TweenMax.to('#clasaImg', {
                            autoAlpha: 1,
                            duration: 3,
                        })

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
                canHoverDespre = "false"

                document.body.style.overflowY = "hidden"
                document.getElementsByTagName("html")[0].style.overflowY = "hidden";
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
                        setTimeout(() => {
                            var i = 0;
                            for (const dirig of document.querySelectorAll('.membru')) {
                                setTimeout(() => {
                                    dirig.classList.toggle('andir')
                                }, i * 250)
                                i++;
                            }
                            canHoverDespre = "true"
                        }, 200)

                        document.getElementById("despre").style.display = "none"

                    }
                })
                ///iesire despre
            }
            else {
                TweenMax.to('#numePersoana', {
                    autoAlpha: 0,
                    duration: .3,
                })
                canScroll = "false"
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
                        canHover = "false";
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
                        setTimeout(() => {
                            var i = 0;
                            for (const dirig of document.querySelectorAll('.membru')) {
                                setTimeout(() => {
                                    dirig.classList.toggle('andir')
                                }, i * 250)
                                i++;
                            }
                            canHoverDespre = "true"
                        }, 200)
                        document.getElementById("elevi").style.display = "none"
                        TweenMax.to('#close-modal', {
                            autoAlpha: 0,
                            duration: 0,
                            onComplete: () => {
                                closeModal.style.display = 'none'
                            }
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
        }
    }
    window.handleOnUp = () => {
        track.dataset.mouseDownAt = 0;
        track.dataset.prevPercentage = track.dataset.percentage;
    }
    window.handleOnMove = e => {
        if (track.dataset.mouseDownAt === "0") return;

        const mouseDelta = parseFloat(track.dataset.mouseDownAt) - e.clientX,
            maxDelta = track.offsetWidth * 1.4;
        let percentage = (mouseDelta / maxDelta) * -100;
        let nextPercentageUnconstrained = parseFloat(track.dataset.prevPercentage) + percentage;

        if (nextPercentageUnconstrained > 70) return;
        if (nextPercentageUnconstrained < -70) return;
        if (percentage > 70) return;
        if (percentage < -70) return;
        let nextPercentage = Math.max(Math.min(49.18, nextPercentageUnconstrained), -49.18);

        var nextPositionPercentage = nextPercentage

        if (Number.isNaN(nextPercentage)) nextPercentage = 0
        track.dataset.percentage = nextPercentage;
        track.animate({
            transform: `translate(${nextPercentage - 50}%, -50%)`
        }, { duration: 150, fill: "forwards" });
        var nr = 1;
        let i = 0;
        /*for (const image of track.getElementsByClassName("image")) {
            i = i + 50 / 28;
            image.animate({
                objectPosition: `${i + nextPositionPercentage}% 50%`
            }, { duration: 200, fill: "forwards" });
        }*/
        var I = setInterval(() => {
            cautBin();
            if (lastX < x) {
                const numarImagine = document.getElementById('numarimagine')
                lastX = x;
                TweenMax.to(numarImagine, {
                    y: -numarImagine.children[28].offsetHeight * (x - 1) - (numarImagine.children[28].offsetHeight - numarImagine.children[28].parentElement.offsetHeight) + "px",
                    duration: .3,
                    ease: "power4.InOut",
                })
                lastX = x;
            }
            else if (lastX > x) {
                const numarImagine = document.getElementById('numarimagine')
                TweenMax.to(numarImagine, {
                    y: -numarImagine.children[28].offsetHeight * (x - 1) - (numarImagine.children[28].offsetHeight - numarImagine.children[28].parentElement.offsetHeight) + numarImagine.children[28].offsetHeight * (lastX - x - 1) + "px",
                    duration: .3,
                    ease: "power4.InOut",
                })
                lastX = x;
            }
        }, 150)
        /*cloneImg.animate({
            objectPosition: `${x * 50 / 28 + nextPositionPercentage}% 50%`
        }, { duration: 200, fill: "forwards" });*/
        setTimeout(() => {
            clearInterval(I);
        }, 301)
    }
    window.onwheel = e => {

        if (canScroll === "false") return;
        if (track.dataset.lightBox === "true") {
            track.dataset.lightBox = "false";

            plus.removeEventListener('click', animatieElev)
            TweenMax.to('#numePersoana', {
                autoAlpha: 0,
                duration: .3,
            })
            cloneTimeline.reverse()
            gsap.killTweensOf('#close-modal')
            TweenMax.to('#close-modal', {
                autoAlpha: 0,
                duration: .5,
                onComplete: () => {
                    closeModal.style.display = 'none'
                }
            })
            /*TweenMax.to('#image-viewer', {
                display: "none",
                duration: 0
            })
            TweenMax.to('.modal-content', {
                scale: 0,
                duration: 0
            })*/
            return;
        }
        if (track.dataset.canMove === "false") return;
        const mouseDelta = e.deltaY,
            maxDelta = track.offsetWidth * 2,
            percentage = (mouseDelta / maxDelta) * 100;

        let nextPercentageUnconstrained = parseFloat(track.dataset.prevPercentage) + percentage;
        if (nextPercentageUnconstrained > 70) return;
        if (nextPercentageUnconstrained < -70) return;
        if (percentage > 70) return;
        if (percentage < -70) return;

        let nextPercentage = Math.max(Math.min(49.18, nextPercentageUnconstrained), -49.18);

        if (Number.isNaN(nextPercentage)) nextPercentage = 0
        var nextPositionPercentage = nextPercentage
        track.dataset.percentage = nextPercentage;
        track.animate({
            transform: `translate(${nextPercentage - 50}%, -50%)`
        }, { duration: 150, fill: "forwards" });

        var nr = 1;
        let i = 0;
        /*for (const image of track.getElementsByClassName("image")) {
            i = i + 50 / 28;
            image.animate({
                objectPosition: `${i + nextPositionPercentage}% 50%`
            }, { duration: 200, fill: "forwards" });
        }*/
        var nr = 1;
        cautBin();
        if (lastX < x) {
            const numarImagine = document.getElementById('numarimagine')
            lastX = x;
            TweenMax.to(numarImagine, {
                y: -numarImagine.children[28].offsetHeight * (x - 1) - (numarImagine.children[28].offsetHeight - numarImagine.children[28].parentElement.offsetHeight) + "px",
                duration: .3,
                ease: "power4.InOut",
            })
            lastX = x;
        }
        else if (lastX > x) {
            const numarImagine = document.getElementById('numarimagine')
            TweenMax.to(numarImagine, {
                y: -numarImagine.children[28].offsetHeight * (x - 1) - (numarImagine.children[28].offsetHeight - numarImagine.children[28].parentElement.offsetHeight) + numarImagine.children[28].offsetHeight * (lastX - x - 1) + "px",
                duration: .3,
                ease: "power4.InOut",
            })
            lastX = x;
        }
        track.dataset.prevPercentage = track.dataset.percentage;
        ///document.getElementById('nr').innerText = x;
        /*cloneImg.animate({
            objectPosition: `${x * 50 / 28 + nextPositionPercentage}% 50%`
        }, { duration: 200, fill: "forwards" });*/
        setTimeout(() => {
            cautBin();
            if (lastX < x) {
                const numarImagine = document.getElementById('numarimagine')
                lastX = x;
                TweenMax.to(numarImagine, {
                    y: -numarImagine.children[28].offsetHeight * (x - 1) - (numarImagine.children[28].offsetHeight - numarImagine.children[28].parentElement.offsetHeight) + "px",
                    duration: .3,
                    ease: "power4.InOut",
                })
                lastX = x;
            }
            else if (lastX > x) {
                const numarImagine = document.getElementById('numarimagine')
                TweenMax.to(numarImagine, {
                    y: -numarImagine.children[28].offsetHeight * (x - 1) - (numarImagine.children[28].offsetHeight - numarImagine.children[28].parentElement.offsetHeight) + numarImagine.children[28].offsetHeight * (lastX - x - 1) + "px",
                    duration: .3,
                    ease: "power4.InOut",
                })
                lastX = x;
            }
            ///document.getElementById('nr').innerText = x;
            track.dataset.prevPercentage = track.dataset.percentage;
        }, 301)
    }

    //// cautare binara element curent

    function cautBin() {
        var elementDim = document.getElementById('element').getBoundingClientRect();
        var left = 0, right = 54
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
    }

    //// cazuri particulare la plus-ul de pe imaginea X pentru Hover
    plus.addEventListener('mouseover', () => {
        let FadeInAnimation = TweenMax.to(images[x - 1], {
            paused: true,
            autoAlpha: 1,
            duration: .15,
            ease: "power4.out",
        })
        if (canHover === "true") FadeInAnimation.play()
    })
    plus.addEventListener('mouseleave', () => {
        let FadeInAnimation = TweenMax.to(images[x - 1], {
            paused: true,
            autoAlpha: 1,
            duration: .15,
            ease: "power4.out",
        })
        if (canHover === "true" && curentElem != currentHoverImage) FadeInAnimation.reverse()
    })

    //// fucntie deschidere modal pentru plus
    function openModalPlus() {
        track.dataset.canMove = "false";
        track.dataset.lightBox = "true";
        canHover === "false"
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
    const closeModal = document.getElementById('close-modal')
    closeModal.addEventListener('click', () => {
        TweenMax.to('#numePersoana', {
            autoAlpha: 0,
            duration: .3,
        })
        document.getElementById('numePersoana').removeEventListener('click', animatieElev)
        plus.removeEventListener('click', animatieElev)
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
        cloneTimeline.reverse()
        gsap.killTweensOf('#close-modal')
        TweenMax.to('#close-modal', {
            autoAlpha: 0,
            duration: .5,
            onComplete: () => {
                closeModal.style.display = 'none'
            }
        })
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
                    start: "-=850",
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
        canScroll = "false"

        if (!touchSupport) {
            document.body.style.overflowY = "visible"
            document.getElementsByTagName("html")[0].style.overflow = "visible";
        }
        else {
            document.body.style.overflowY = "visible"
            document.getElementsByTagName("html")[0].style.overflowY = "visible";
        }

        const elemDespre = document.getElementById(`${cloneImg.dataset.pers}`)
        document.getElementById('titluElev').innerText = document.getElementById('numePersoana').innerText
        document.getElementById('pozaelev').src = cloneImg.src
        document.getElementById('pozaelev2').src = cloneImg.dataset.src
        document.getElementById('p1').innerText = elemDespre.dataset.p1
        document.getElementById('p2').innerText = elemDespre.dataset.p2
        if (elemDespre.dataset.autor === undefined) document.getElementById('citat').innerText = "~ " + "\"" + elemDespre.dataset.citat + "\""
        else document.getElementById('citat').innerText = "~ " + "\"" + elemDespre.dataset.citat + "\"" + " " + elemDespre.dataset.autor
        document.getElementById('melodiePref').src = elemDespre.dataset.src
        if (cloneImg.dataset.pers === 'tirca') document.getElementById('melodiePref').style.display = 'none'
        else document.getElementById('melodiePref').style.display = 'block'
        gsap.fromTo("#despreElev", {
            x: "100%",
            display: "none",

        }, {
            x: "0%",
            ease: "power4.out",
            display: "block",
            duration: .8,
            onComplete: () => {
                document.getElementById('iesireSectiune').addEventListener('click', iesireanimatieelev)
            }
        })
    }

    //// iesire animatie intrare elevi

    function iesireanimatieelev() {
        document.body.style.overflowY = "hidden"
        document.getElementsByTagName("html")[0].style.overflow = "hidden";
        TweenMax.to("#despreElev", {
            x: "100%",
            duration: .8,
            ease: "power4.out",
            display: "none",
            onComplete: () => {
                document.getElementById('iesireSectiune').removeEventListener('click', iesireanimatieelev)
                canScroll = "true"
            }
        })
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

    document.getElementById('next').onclick = () => {
        let nextPercentageUnconstrained = parseFloat(track.dataset.prevPercentage) - 1.825;
        if (nextPercentageUnconstrained > 70) return;
        if (nextPercentageUnconstrained < -70) return;

        let nextPercentage = Math.max(Math.min(49.18, nextPercentageUnconstrained), -49.18);

        track.dataset.percentage = nextPercentage;
        track.animate({
            transform: `translate(${nextPercentage - 50}%, -50%)`
        }, { duration: 150, fill: "forwards" });

        lastX++;
        x = lastX;
        if(x<=55) {
            const numarImagine = document.getElementById('numarimagine')
            TweenMax.to(numarImagine, {
                y: -numarImagine.children[28].offsetHeight * (x - 1) - (numarImagine.children[28].offsetHeight - numarImagine.children[28].parentElement.offsetHeight) + "px",
                duration: .3,
                ease: "power4.InOut",
            })

        }
        track.dataset.prevPercentage = track.dataset.percentage;
    }
    document.getElementById('prev').onclick = () => {
        let nextPercentageUnconstrained = parseFloat(track.dataset.prevPercentage) + 1.825;
        if (nextPercentageUnconstrained > 70) return;
        if (nextPercentageUnconstrained < -70) return;

        let nextPercentage = Math.max(Math.min(49.18, nextPercentageUnconstrained), -49.18);

        track.dataset.percentage = nextPercentage;
        track.animate({
            transform: `translate(${nextPercentage - 50}%, -50%)`
        }, { duration: 150, fill: "forwards" });

        x = lastX-1;
        if(x>=1) {
            const numarImagine = document.getElementById('numarimagine')
            TweenMax.to(numarImagine, {
                y: -numarImagine.children[28].offsetHeight * (x - 1) - (numarImagine.children[28].offsetHeight - numarImagine.children[28].parentElement.offsetHeight) + numarImagine.children[28].offsetHeight * (lastX - x - 1) + "px",
                duration: .3,
                ease: "power4.InOut",
            })
            lastX = x;
        }
            
        track.dataset.prevPercentage = track.dataset.percentage;
    }

    jQuery.support.touch = 'ontouchend' in document;

    var touchSupport = false;

    function detectTouchSupport() {
        touchSupport = jQuery.support.touch;
        console.log(touchSupport)
        if (touchSupport === true) {
            document.getElementById('next').style.opacity = 1;
            document.getElementById('prev').style.opacity = 1;
        }
    }
    detectTouchSupport();

    window.addEventListener('resize', () => {
        resize = true;
    })
})
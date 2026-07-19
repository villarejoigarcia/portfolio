// autoplay
function observeCarouselVideos() {
  const videos = document.querySelectorAll('#carousel .slide video');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const video = entry.target;

      if (entry.isIntersecting) {

        video.muted = true;
        video.play().catch(() => {});

      } else {
        if (!video.paused) {
          video.pause();
          video.currentTime = 0;
        }
      }
    });
  }, {
    threshold: 0
  });

  videos.forEach(video => observer.observe(video));

}

// content
$(document).ready(function () {
  if (!window.content) return;
  const c = window.content;

  // media
  const $carousel = $('#carousel');
  $carousel.empty();
  c.projects.forEach((project, i) => {
    const $slide = $('<div>').addClass('slide').attr('data-index', i);
    const $media = $('<div>').addClass('media');
    project.media && project.media.forEach(m => {
      if (m.type === 'image') {
        if (m.srcMobile) {
          const $picture = $('<picture>');
          $picture.append($('<source>').attr('srcset', m.srcMobile).attr('media', '(max-width: 600px)'));
          $picture.append($('<img>').attr('src', m.src).attr('alt', project.client));
          $media.append($picture);
        } else {
          const $picture = $('<picture>');
          $picture.append($('<img>').attr('src', m.src).attr('alt', project.client));
          $media.append($picture);
        }
      } else if (m.type === 'video') {
        $media.append($('<video>').attr({
          src: m.src, 
          preload: 'auto', 
          muted: true, 
          loop: true, 
          playsinline: true, 
          alt: project.client,
          poster: m.poster
        }));
      }
    });
    $slide.append($media);
    $carousel.append($slide);
  });

  observeCarouselVideos();

  setTimeout(() => {
  const firstVisible = document
    .querySelector('#carousel .slide video');

  if (firstVisible) {
    firstVisible.muted = true;
    firstVisible.play().catch(() => {});
  }
}, 100);

  // header
  $('#last-update').text(c.header.lastUpdate);
  $('#info-title').text(c.header.information);
  $('#main-name').text(c.header.name);
  $('#main-description').text(c.header.description);
  $('#contact-title').text(c.header.contact.title);
  $('#contact-instagram').text(c.header.contact.instagram);
  $('#contact-arena').text(c.header.contact.arena);
  $('#contact-mail').text(c.header.contact.mail);
  $('#services-title').text(c.header.services.title);
  const $servicesList = $('#services-list');
  $servicesList.empty();
  c.header.services.items.forEach(item => {
    $servicesList.append($('<h1>').text(item));
  });

  // fields
  $('#field-year').text(c.fields.year);
  $('#field-client').text(c.fields.client);
  $('#field-services').text(c.fields.services);

  // index
  // const $slideIndex = $('#slide-index');
  // $slideIndex.empty();
  // c.projects.forEach(project => {
  //   const $div = $('<div>');
  //   $div.append($('<div>').append($('<h1>').text(project.year)));
  //   $div.append($('<div>').append($('<h1>').html(`<em>${project.client}</em>`)));
  //   if (project.services.length > 1) {
  //     const $services = $('<div>').addClass('services multiple');
  //     $services.append($('<h1>').text(project.services[0]));
  //     const $more = $('<div>').addClass('more');
  //     project.services.slice(1).forEach(s => {
  //       $more.append($('<h1>').text(s));
  //     });
  //     $services.append($more);
  //     $div.append($services);
  //   } else {
  //     $div.append($('<div>').addClass('services').append($('<h1>').text(project.services[0])));
  //   }
  //   $slideIndex.append($div);
  // });

  function hasWebOrCodeService(project) {
    if (!Array.isArray(project.services)) return false;

    return project.services.some(service => {
      const normalized = String(service).trim().toLowerCase();
      return normalized === 'web' || normalized === 'code';
    });
  }

  function renderProjectClient(project) {
    const $title = $('<h1>');
    const $name = $('<em>').text(project.client);

    if (hasWebOrCodeService(project) && project.link && project.link.url) {
      const target = project.link.target || '_blank';

      return $title.append(
        $('<a>')
          .attr({
            href: project.link.url,
            target,
            rel: 'noopener noreferrer'
          })
          .append($name)
      );
    }

    return $title.append($name);
  }

  function renderService(service) {
    return $('<h1>').text(service);
  }

  const $slideIndex = $('#slide-index');
  $slideIndex.empty();

  c.projects.forEach(project => {
    const $div = $('<div>');

    $div.append($('<div>').append($('<h1>').text(project.year)));
    $div.append($('<div>').append(renderProjectClient(project)));

    if (project.services.length > 1) {
      const $services = $('<div>').addClass('services multiple');

      $services.append(renderService(project.services[0]));

      const $more = $('<div>').addClass('more');
      project.services.slice(1).forEach(service => {
        $more.append(renderService(service));
      });

      $services.append($more);
      $div.append($services);

    } else {
      $div.append(
        $('<div>')
          .addClass('services')
          .append(renderService(project.services[0]))
      );
    }

    $slideIndex.append($div);
  });

  // credits

  const $credits = $('.credits');
  $credits.empty();
  c.projects.forEach(project => {
    const credits = project.credits || [];
    const $projectCredits = $('<div>').addClass('project-credits');

    if (credits.length > 0) {
      $projectCredits.append($('<h2>').text('credits'));
      credits.forEach(credit => {
        $projectCredits.append($('<h1>').addClass('indent').append($('<em>').text(`${credit}`)));
      });
    }

    $credits.append($projectCredits);
  });
  
});

const animationDelay = 50;
const revealDelay = 666;

// variables
let isIndexAnimating = false;
let isDataHovering = false;
let lastActiveIndex = -1;
let hoverTimeouts = [];
let infoTimeouts = [];
let creditsTimeouts = [];
let slideIndexTimeouts = [];
let clonesAdded = false;
let isInformationAnimating = false;
let pendingInformationUpdate = null;

// functions
function isMobile() {
  return window.innerWidth <= 1024;
}

function recalcHeights() {
  let totalHeight = 0;
  $('#carousel').children('.slide').not('.clone').each(function () {
    totalHeight += $(this).outerHeight(true);
  });
  return totalHeight;
}

function shuffleLetters() {
  const $h1 = $('#view-shuffle');
  $h1.find('span').each(function () {
    const randomOffset = Math.random() < 0.5 ? '0em' : '-1.2em';
    $(this).css('transform', `translateY(${randomOffset})`);
  });
}

function animateCreditsHide(index, reverse = false) {
  const $projectCredits = $('.credits .project-credits').eq(index);
  const $creditsChildren = $projectCredits.children();
  const len = $creditsChildren.length;

  if (len === 0) return;

  creditsTimeouts.forEach(clearTimeout);
  creditsTimeouts = [];

  $creditsChildren.each(function (i) {
    const idx = reverse ? (len - 1 - i) : i;
    const t = setTimeout(function () {
      $($creditsChildren[idx]).hide();
    }, i * animationDelay);
    creditsTimeouts.push(t);
  });

  const hideContainerTimeout = setTimeout(function () {
    $projectCredits.hide();
  }, len * animationDelay);
  creditsTimeouts.push(hideContainerTimeout);
}

function animateCreditsShow(index) {
  const $projectCredits = $('.credits .project-credits').eq(index);
  const $creditsChildren = $projectCredits.children();

  creditsTimeouts.forEach(clearTimeout);
  creditsTimeouts = [];

  $('.credits .project-credits').not($projectCredits).hide().children().hide();

  if ($creditsChildren.length === 0) {
    $projectCredits.hide();
    return;
  }

  $projectCredits.show();
  $creditsChildren.hide();

  $creditsChildren.each(function (i, el) {
    const t = setTimeout(function () {
      $(el).show();
    }, i * animationDelay);
    creditsTimeouts.push(t);
  });
}

// --- Inicialización y scroll infinito ---
$(function () {
  const $container = $('#carousel-container');
  const $wrapper = $('#carousel');
  const $originalSlides = $wrapper.children('.slide');
  let justTeleported = false;

  // Asignar índice único a cada slide original
  $originalSlides.each(function (i) {
    $(this).attr('data-index', i);
  });

  // Scroll infinito solo hacia abajo con buffer fijo
  $container.on('scroll', function () {

    if (window.innerWidth >= 1024) {
      if (!clonesAdded) {
        $originalSlides.clone(true).addClass('clone').appendTo($wrapper);
        clonesAdded = true;
        recalcHeights();
      }
      recalcHeights();

      const scrollTop = $container.scrollTop();
      if (justTeleported) return;

      const totalHeight = recalcHeights();
      if (scrollTop > totalHeight) {
        justTeleported = true;
        $container.scrollTop(scrollTop - totalHeight - 3);
        setTimeout(() => { justTeleported = false; }, 500);
      }
    }
  });

  $('.slide').click(function () {
    const video = $(this).find('video').first().get(0);
    const mediaItems = $('.slide').find('.media').children();
    if (video) {
      video.muted = true;
      video.playsInline = true;
      video.play().catch(() => { });
      if (mediaItems.length > 1) {
        video.currentTime = 0;
        video.pause();
      }
    }
  });

  // --- Slide click: cambia imagen/video y centra slide ---
  $wrapper.on('click', '.slide', function () {
    const index = $(this).data('index');
    const $allSameSlides = $wrapper.find(`.slide[data-index="${index}"]`);

    // En mobile, siempre cambia la imagen
    if (isMobile()) {
      $allSameSlides.each(function () {
        const $media = $(this).find('picture, video');
        const $visible = $media.filter(':visible');
        let nextIndex = $media.index($visible) + 1;
        if (nextIndex >= $media.length) nextIndex = 0;
        $media.hide().eq(nextIndex).show();
      });
      recalcHeights();
      return;
    }

      $allSameSlides.each(function () {
        const $media = $(this).find('picture, video');
        const $visible = $media.filter(':visible');
        let nextIndex = $media.index($visible) + 1;
        if (nextIndex >= $media.length) nextIndex = 0;
        $media.hide().eq(nextIndex).show();
      });
      recalcHeights();

    $wrapper.find('.slide').each(function () {
      if ($(this).data('index') !== index) {
        $(this).removeData('centered');
      }
    });
  });

  //shuffle
  $('#view-shuffle').click(function () {
    isShuffling = true;
    const $slides = $wrapper.find('.slide').not('.clone');
    const numSlides = $slides.length;

    $slides.each(function () {
      const index = $(this).data('index');
      const $allSameSlides = $wrapper.find(`.slide[data-index="${index}"]`);
      const $media = $(this).find('picture, video');
      const mediaLen = $media.length;
      
      if (mediaLen > 0) {
        const randomIndex = Math.floor(Math.random() * mediaLen);
        
        $allSameSlides.each(function () {
          $(this).find('picture, video').hide();
          $(this).find('picture, video').eq(randomIndex).show();
        });
      }
    });

    const randomScrollIndex = Math.floor(Math.random() * numSlides);
    let scrollTo = 0;
    for (let i = 0; i < randomScrollIndex; i++) {
      scrollTo += $slides.eq(i).outerHeight(true);
    }
    console.log('Scroll to:', scrollTo);
    $container.scrollTop(scrollTo);

    setTimeout(function () {
      isShuffling = false;
      updateSlideIndexOnScroll();
    }, 100);
  });
});

// index
function showActiveSlideIndex(activeIndex) {
  let items = $('#slide-index > div');
  let len = items.length;
  let hideTimeouts = [];
  let creditsItems = $('.credits .project-credits');

  const indexChanged = lastActiveIndex !== activeIndex;

  if (!indexChanged && lastActiveIndex !== -1) {
    return;
  }

  slideIndexTimeouts.forEach(clearTimeout);
  slideIndexTimeouts = [];
  
  if (indexChanged && lastActiveIndex !== -1) {
    const $previousMoreChildren = items.eq(lastActiveIndex).find('.more').children();
    const moreLen = $previousMoreChildren.length;
    if (moreLen > 0) {

      items.eq(lastActiveIndex).find('.multiple').removeClass('hide-after');
      
      $previousMoreChildren.each(function (i, el) {
        const idx = moreLen - 1 - i;
        const t = setTimeout(function () {
          $($previousMoreChildren[idx]).hide();
        }, i * animationDelay);
        slideIndexTimeouts.push(t);
      });
    }
    
    items.each(function(i) {
      if (i !== activeIndex && i !== lastActiveIndex) {
        $(this).find('.more').children().hide();
        $(this).find('.multiple').removeClass('hide-after');
      }
    });

    animateCreditsHide(lastActiveIndex, true);

    // creditsItems.each(function (i) {
    //   if (i !== activeIndex && i !== lastActiveIndex) {
    //     $(this).hide().children().hide();
    //   }
    // });

    creditsItems.hide();

  }
  
  lastActiveIndex = activeIndex;

  if (!isDataHovering) {
    if (items.filter(':visible').length === len) {
      isIndexAnimating = true;
      items.each(function (i, el) {
        var idx = len - 1 - i;
        if (idx !== activeIndex) {
          let t = setTimeout(function () {
            $(items[idx]).hide();
            shuffleLetters();
          }, i * animationDelay);
          hideTimeouts.push(t);
        }
      });
      const showActiveTimeout = setTimeout(function () {
        items.eq(activeIndex).show().addClass('active');
        items.not(':eq(' + activeIndex + ')').removeClass('active');
        isIndexAnimating = false;
        if (indexChanged) {
          shuffleLetters();
        }
        
        const showChildrenTimeout = setTimeout(function() {
          const $activeMoreChildren = items.eq(activeIndex).find('.more').children();
          if ($activeMoreChildren.length > 0) {
            items.eq(activeIndex).find('.multiple').addClass('hide-after');
          }
          $activeMoreChildren.each(function (i, el) {
            const t = setTimeout(function () {
              $(el).show();
            }, i * animationDelay);
            slideIndexTimeouts.push(t);
          });
          animateCreditsShow(activeIndex);
        }, revealDelay);
        slideIndexTimeouts.push(showChildrenTimeout);
        
      }, len * animationDelay);
      slideIndexTimeouts.push(showActiveTimeout);
    } else {
      items.each(function(i) {
        if (i !== activeIndex) {
          $(this).find('.more').children().hide();
          $(this).find('.multiple').removeClass('hide-after');
        }
      });
      
      items.hide().removeClass('active');
      items.eq(activeIndex).show().addClass('active');
      if (indexChanged) {
        shuffleLetters();
      }
      
      const showChildrenTimeout = setTimeout(function() {
        const $activeMoreChildren = items.eq(activeIndex).find('.more').children();
        if ($activeMoreChildren.length > 0) {
          items.eq(activeIndex).find('.multiple').addClass('hide-after');
        }
        $activeMoreChildren.each(function (i, el) {
          const t = setTimeout(function () {
            $(el).show();
          }, i * animationDelay);
          slideIndexTimeouts.push(t);
        });

        animateCreditsShow(activeIndex);
      }, revealDelay);
      slideIndexTimeouts.push(showChildrenTimeout);
    }
  }
}

$(document).on('mouseenter', 'header', function () {
  $(this).find('.multiple').addClass('hide-after');
});

$(document).on('mouseleave', 'header', function () {
    setTimeout(() => { 
      $(this).find('.multiple').removeClass('hide-after'); 
    }, revealDelay);
    
});

function updateSlideIndexOnScroll() {
  if (isIndexAnimating || isDataHovering) return;

  const $container = $('#carousel-container');
  const $slides = $('#carousel .slide');
  const items = $('#slide-index > div');

  let scrollTop = $container.scrollTop();
  let containerHeight = $container.innerHeight();
  let scrollHeight = $container[0].scrollHeight;
  let accumulated = 0;
  let activeIndex = 0;
  let middleScreen = scrollTop + window.innerHeight / 2;

  const isMobile = window.matchMedia('(max-width: 768px)').matches;

  if (isMobile) {
    const firstIndex = 0;
    const lastIndex = items.length - 1;

    if (scrollTop <= 1) {
      if (lastActiveIndex !== firstIndex) {
        showActiveSlideIndex(firstIndex);
      }
      return;
    }

    if (scrollTop + containerHeight >= scrollHeight - 1) {
      if (lastActiveIndex !== lastIndex) {
        showActiveSlideIndex(lastIndex);
      }
      return;
    }
  }

  $slides.each(function (i, el) {
    accumulated += $(el).outerHeight(true);
    if (accumulated > middleScreen) {
      activeIndex = i;
      return false;
    }
  });

  showActiveSlideIndex(activeIndex % items.length);
}

$('#carousel-container').on('scroll', updateSlideIndexOnScroll);

$('.data').hover(
  function () {
    isDataHovering = true;
    hoverTimeouts.forEach(clearTimeout);
    hoverTimeouts = [];
    var items = $('#slide-index > *');
    var activeItem = $('#slide-index > .active');
    var activeIndex = items.index(activeItem);
    var len = items.length;

    items.each(function (i, el) {
      if (i !== activeIndex) {
        let t = setTimeout(function () {
          $(el).stop(true, true).show();
          $(el).find('.more').children().hide();
        }, i * animationDelay);
        hoverTimeouts.push(t);
      }
    });
    activeItem.show();

    setTimeout(function () {
      const $activeMoreChildren = activeItem.find('.more').children();
      const moreLen = $activeMoreChildren.length;
      if (moreLen > 0) {
        $activeMoreChildren.each(function (i, el) {
          const idx = moreLen - 1 - i; // Orden inverso
          setTimeout(function () {
            $($activeMoreChildren[idx]).hide();
            if (idx === 0) {
              activeItem.find('.multiple').removeClass('hide-after');
            }
          }, i * animationDelay);
        });
      } else {
        activeItem.find('.multiple').removeClass('hide-after');
      }

      // animateCreditsHide(activeIndex, true);
    }, len * animationDelay + 50);
      animateCreditsHide(activeIndex, true);

  },
  function () {
    isDataHovering = false;
    hoverTimeouts.forEach(clearTimeout);
    hoverTimeouts = [];
    var items = $('#slide-index > *');
    var activeItem = $('#slide-index > .active');
    var activeIndex = items.index(activeItem);
    var len = items.length;

    items.each(function (i, el) {
      var idx = len - 1 - i;
      if (idx !== activeIndex) {
        let t = setTimeout(function () {
          $(items[idx]).stop(true, true).hide();
        }, i * animationDelay);
        hoverTimeouts.push(t);
      }
    });
    activeItem.show();
    
    setTimeout(function() {
      if (!isDataHovering) {
        const $activeMoreChildren = activeItem.find('.more').children();
        if ($activeMoreChildren.length > 0) {
          activeItem.find('.multiple').addClass('hide-after');
        }
        $activeMoreChildren.each(function (i, el) {
          setTimeout(function () {
            $(el).show();
          }, i * animationDelay);
        });

        animateCreditsShow(activeIndex);

      }
    }, len * animationDelay + 50); 
    // }, len * animationDelay); 


    // setTimeout(function () {
    //   if (!isDataHovering) {
    //     animateCreditsShow(activeIndex);
    //   }
    // }, len * animationDelay); 

  }
);

$('#slide-index').on('mouseenter', '> div', function () {
  $(this).addClass('hover');
});
$('#slide-index').on('mouseleave', '> div', function () {
  $(this).removeClass('hover');
});

$('#slide-index').on('click', '> div a', function (e) {
  const $item = $(this).closest('#slide-index > div');

  if ($item.hasClass('active')) {
    e.stopPropagation();
    return;
  }

  e.preventDefault();
  e.stopPropagation();
  $item.trigger('click');
});

$('#slide-index').on('click', '> div', function () {
  var index = $(this).index();

  var items = $('#slide-index > div');
  items.removeClass('active');
  items.eq(index).addClass('active');

  // Centrar  slide correspondiente
  var $container = $('#carousel-container');
  var $slides = $('#carousel .slide');
  var containerScroll = $container.scrollTop();
  var containerHeight = $container.height();

  var closestSlide = null;
  var minDistance = Infinity;

  $slides.each(function () {
    var $slide = $(this);
    if ($slide.data('index') === index) {
      var slideTop = $slide.position().top + containerScroll;
      var slideHeight = $slide.outerHeight(true);
      var slideCenter = slideTop + slideHeight / 2;
      var containerCenter = containerScroll + containerHeight / 2;
      var distance = Math.abs(slideCenter - containerCenter);

      if (distance < minDistance) {
        minDistance = distance;
        closestSlide = $slide;
      }
    }
  });

  if (closestSlide) {
    var slideTop = closestSlide.position().top + containerScroll;
    var slideHeight = closestSlide.outerHeight(true);
    var scrollTo = slideTop + slideHeight / 2 - containerHeight / 2;
    $container.animate({ scrollTop: scrollTo }, 1000);
  }

  if (!isMobile()) {
      const $allSameSlides = $('#carousel .slide').filter(`[data-index="${index}"]`);
      $allSameSlides.data('centered', true);
    }
});

// hide fields
function hideInformationAnimated() {
  if (isInformationAnimating) {
    pendingInformationUpdate = 'hide';
    return;
  }
  isInformationAnimating = true;
  infoTimeouts.forEach(clearTimeout);
  infoTimeouts = [];
  const $children = $('#information').find('*');
  const len = $children.length;

  $children.each(function (i, el) {
    let idx = len - 1 - i;
    let t = setTimeout(function () {
      $children.eq(idx).hide();
    }, i * animationDelay);
    infoTimeouts.push(t);
  });

  setTimeout(function () {
    $('#information').hide();
    isInformationAnimating = false;
    if (pendingInformationUpdate === 'show') {
      pendingInformationUpdate = null;
      showInformationAnimated();
    }
  }, len * animationDelay);
}

function showInformationAnimated() {
  if (isInformationAnimating) {
    pendingInformationUpdate = 'show';
    return;
  }
  isInformationAnimating = true;
  infoTimeouts.forEach(clearTimeout);
  infoTimeouts = [];
  $('#information').show();

  const $children = $('#information').find('*');
  $children.hide();
  $children.each(function (i, el) {
    let t = setTimeout(function () {
      $(el).show();
    }, i * animationDelay);
    infoTimeouts.push(t);
  });

  setTimeout(function () {
    isInformationAnimating = false;
    if (pendingInformationUpdate === 'hide') {
      pendingInformationUpdate = null;
      hideInformationAnimated();
    }
  }, $children.length * animationDelay);
}

// show fields
$('header').hover(
  function () {
    showInformationAnimated();
  },
  function () {
    infoTimeouts.forEach(clearTimeout);
    infoTimeouts = [];
    hideInformationAnimated();
  }
);

// shuffle
$(document).ready(function () {
  const $h1 = $('#view-shuffle');
  const text = $h1.text();

  $h1.html(text.split('').map(char =>
    char === ' ' ? ' ' : `<span style="display: inline-block;">${char}</span>`
  ).join(''));

  $h1.on('click', function () {
    shuffleLetters();
  });
});

// start
$(document).ready(function () {
  $('#slide-index > div').first().addClass('active');
  setTimeout(function () {
    showActiveSlideIndex(0);
    hideInformationAnimated();
  }, revealDelay);
});

// multiple
$('.multiple').hover(
  function () {
    const $indents = $(this).find('.indent');
    $indents.hide();
    
    $indents.each(function (i, el) {
      setTimeout(function () {
        $(el).show();
      }, i * 100);
    });
  },
  function () {
    const $indents = $(this).find('.indent');
    const len = $indents.length;
    
    $indents.each(function (i, el) {
      const idx = len - 1 - i;
      setTimeout(function () {
        $($indents[idx]).hide();
      }, i * 100);
    });
  }
);

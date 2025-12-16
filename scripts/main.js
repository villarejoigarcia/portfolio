// --- Autoplay videos ---
function observeCarouselVideos() {
  const videos = document.querySelectorAll('#carousel .slide video');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const video = entry.target;

      if (entry.isIntersecting) {
        // Pausar TODOS los demás
        videos.forEach(v => {
          if (v !== video) {
            v.pause();
            v.currentTime = 0;
          }
        });

        video.muted = true;
        video.play().catch(() => {});
      } else {
        video.pause();
        video.currentTime = 0;
      }
    });
  }, {
    threshold: .1
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
          // $media.append($('<img>').attr('src', m.src).attr('alt', project.client));
          const $picture = $('<picture>');
          $picture.append($('<img>').attr('src', m.src).attr('alt', project.client));
          $media.append($picture);
        }
      } else if (m.type === 'video') {
        $media.append($('<video>').attr({src: m.src, autoplay: true, muted: true, loop: true, playsinline: true, alt: project.client}));
      }
    });
    $slide.append($media);
    $carousel.append($slide);
  });
  // Asegurar que los videos recién insertados sean observados
  observeCarouselVideos();

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
  const $slideIndex = $('#slide-index');
  $slideIndex.empty();
  c.projects.forEach(project => {
    const $div = $('<div>');
    $div.append($('<div>').append($('<h1>').text(project.year)));
    $div.append($('<div>').append($('<h1>').html(`<em>${project.client}</em>`)));
    if (project.services.length > 1) {
      const $services = $('<div>').addClass('services multiple');
      $services.append($('<h1>').text(project.services[0]));
      const $more = $('<div>').addClass('more');
      project.services.slice(1).forEach(s => {
        $more.append($('<h1>').text(s));
      });
      $services.append($more);
      $div.append($services);
    } else {
      $div.append($('<div>').addClass('services').append($('<h1>').text(project.services[0])));
    }
    $slideIndex.append($div);
  });
});

const animationDelay = 50;

// variables
let isIndexAnimating = false;
let isDataHovering = false;
let lastActiveIndex = -1;
let hoverTimeouts = [];
let infoTimeouts = [];
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

    // En desktop: primer clic centra, segundo clic cambia imagen
    // if (!$allSameSlides.first().data('centered')) {
    //   // Primer clic: solo centrar
    //   var containerScroll = $container.scrollTop();
    //   var containerHeight = $container.height();
    //   var closestSlide = null;
    //   var minDistance = Infinity;

    //   $wrapper.find('.slide').each(function () {
    //     var $slide = $(this);
    //     if ($slide.data('index') === index) {
    //       var slideTop = $slide.position().top + containerScroll;
    //       var slideHeight = $slide.outerHeight(true);
    //       var slideCenter = slideTop + slideHeight / 2;
    //       var containerCenter = containerScroll + containerHeight / 2;
    //       var distance = Math.abs(slideCenter - containerCenter);

    //       if (distance < minDistance) {
    //         minDistance = distance;
    //         closestSlide = $slide;
    //       }
    //     }
    //   });

    //   if (closestSlide) {
    //     var slideTop = closestSlide.position().top + containerScroll;
    //     var slideHeight = closestSlide.outerHeight(true);
    //     var scrollTo = slideTop + slideHeight / 2 - containerHeight / 2;
    //     $container.animate({ scrollTop: scrollTo }, 500);
    //   }
    //   $allSameSlides.data('centered', true);
    // } else {
      // Segundo clic (y siguientes): cambiar imagen
      $allSameSlides.each(function () {
        const $media = $(this).find('picture, video');
        const $visible = $media.filter(':visible');
        let nextIndex = $media.index($visible) + 1;
        if (nextIndex >= $media.length) nextIndex = 0;
        $media.hide().eq(nextIndex).show();
      });
      recalcHeights();
    // }

    // Reinicia el flag de centrado en todas las otras slides
    $wrapper.find('.slide').each(function () {
      if ($(this).data('index') !== index) {
        $(this).removeData('centered');
      }
    });
  });

  // --- Shuffle ---
  $('#view-shuffle').click(function () {
    isShuffling = true;
    const $slides = $wrapper.find('.slide').not('.clone');
    const numSlides = $slides.length;

    // Cambia directamente a una imagen aleatoria en cada slide
    $slides.each(function () {
      const index = $(this).data('index');
      const $allSameSlides = $wrapper.find(`.slide[data-index="${index}"]`);
      const $media = $(this).find('picture, video');
      const mediaLen = $media.length;
      
      if (mediaLen > 0) {
        const randomIndex = Math.floor(Math.random() * mediaLen);
        
        // Oculta todas las imágenes/videos y muestra solo la aleatoria
        $allSameSlides.each(function () {
          $(this).find('picture, video').hide();
          $(this).find('picture, video').eq(randomIndex).show();
        });
      }
    });

    // Cambia la posición del scroll aleatoriamente (sin animación)
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
    }, 100); // Tiempo mínimo ya que no hay animación escalonada
  });
});

// --- Slide index: animación y control ---
function showActiveSlideIndex(activeIndex) {
  let items = $('#slide-index > div');
  let len = items.length;
  let hideTimeouts = [];

  const indexChanged = lastActiveIndex !== activeIndex;
  
  // Si cambió el índice, ocultar elementos .more del anterior progresivamente
  if (indexChanged && lastActiveIndex !== -1) {
    const $previousMoreChildren = items.eq(lastActiveIndex).find('.more').children();
    const moreLen = $previousMoreChildren.length;
    if (moreLen > 0) {
      // Mostrar ::after cuando se ocultan los elementos .more
      items.eq(lastActiveIndex).find('.multiple').removeClass('hide-after');
      
      $previousMoreChildren.each(function (i, el) {
        const idx = moreLen - 1 - i; // Orden inverso
        setTimeout(function () {
          $($previousMoreChildren[idx]).hide();
        }, i * animationDelay);
      });
    }
    
    // Ocultar elementos .more de TODOS los otros slides (excepto el activo)
    items.each(function(i) {
      if (i !== activeIndex && i !== lastActiveIndex) {
        $(this).find('.more').children().hide();
        // Mostrar ::after para slides que no son el activo
        $(this).find('.multiple').removeClass('hide-after');
      }
    });
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
      setTimeout(function () {
        items.eq(activeIndex).show().addClass('active');
        items.not(':eq(' + activeIndex + ')').removeClass('active');
        isIndexAnimating = false;
        if (indexChanged) {
          shuffleLetters();
        }
        
        // Mostrar hijos de .more del elemento activo progresivamente
        setTimeout(function() {
          const $activeMoreChildren = items.eq(activeIndex).find('.more').children();
          if ($activeMoreChildren.length > 0) {
            // Ocultar ::after cuando empiezan a aparecer los elementos .more
            items.eq(activeIndex).find('.multiple').addClass('hide-after');
          }
          $activeMoreChildren.each(function (i, el) {
            setTimeout(function () {
              $(el).show();
            }, i * animationDelay);
          });
        }, 666);
        
      }, len * animationDelay);
    } else {
      // Ocultar elementos .more de todos los slides excepto el activo
      items.each(function(i) {
        if (i !== activeIndex) {
          $(this).find('.more').children().hide();
          // Mostrar ::after para slides que no son el activo
          $(this).find('.multiple').removeClass('hide-after');
        }
      });
      
      items.hide().removeClass('active');
      items.eq(activeIndex).show().addClass('active');
      if (indexChanged) {
        shuffleLetters();
      }
      
      // Mostrar hijos de .more del elemento activo progresivamente
      setTimeout(function() {
        const $activeMoreChildren = items.eq(activeIndex).find('.more').children();
        if ($activeMoreChildren.length > 0) {
          // Ocultar ::after cuando empiezan a aparecer los elementos .more
          items.eq(activeIndex).find('.multiple').addClass('hide-after');
        }
        $activeMoreChildren.each(function (i, el) {
          setTimeout(function () {
            $(el).show();
          }, i * animationDelay);
        });
      }, 666);
    }
  }
}

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

    // Primero mostrar todos los slide index (excepto el activo)
    items.each(function (i, el) {
      if (i !== activeIndex) {
        let t = setTimeout(function () {
          $(el).stop(true, true).show();
          // Asegurar que los elementos .more de este slide se mantengan ocultos
          $(el).find('.more').children().hide();
        }, i * animationDelay);
        hoverTimeouts.push(t);
      }
    });
    activeItem.show();

    // Luego de mostrar todos, ocultar hijos de .more progresivamente
    setTimeout(function () {
      // Solo ocultar progresivamente los hijos de .more del slide activo
      const $activeMoreChildren = activeItem.find('.more').children();
      const moreLen = $activeMoreChildren.length;
      if (moreLen > 0) {
        $activeMoreChildren.each(function (i, el) {
          const idx = moreLen - 1 - i; // Orden inverso
          setTimeout(function () {
            $($activeMoreChildren[idx]).hide();
            // Mostrar ::after cuando se oculta el último elemento .more
            if (idx === 0) {
              activeItem.find('.multiple').removeClass('hide-after');
            }
          }, i * animationDelay);
        });
      } else {
        // Si no hay elementos .more, mostrar ::after inmediatamente
        activeItem.find('.multiple').removeClass('hide-after');
      }
    }, len * animationDelay + 66); // Espera a que todos los slide index estén visibles
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
    
    // Mostrar hijos de .more del slide activo DESPUÉS de que se oculten los otros slide indexes
    setTimeout(function() {
      if (!isDataHovering) {
        const $activeMoreChildren = activeItem.find('.more').children();
        if ($activeMoreChildren.length > 0) {
          // Ocultar ::after cuando empiezan a aparecer los elementos .more
          activeItem.find('.multiple').addClass('hide-after');
        }
        $activeMoreChildren.each(function (i, el) {
          setTimeout(function () {
            $(el).show();
          }, i * animationDelay);
        });
      }
    }, len * animationDelay + 666); // Esperar a que terminen de ocultarse los otros
  }
);

$('#slide-index').on('mouseenter', '> div', function () {
  $(this).addClass('hover');
});
$('#slide-index').on('mouseleave', '> div', function () {
  $(this).removeClass('hover');
});

$('#slide-index').on('click', '> div', function () {
  var index = $(this).index();

  // Cambia el activo visualmente
  var items = $('#slide-index > div');
  items.removeClass('active');
  items.eq(index).addClass('active');

  // Centrar el slide correspondiente
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

// --- Información animada protegida ---
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
    // Ejecuta petición pendiente si existe
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
    // Ejecuta petición pendiente si existe
    if (pendingInformationUpdate === 'hide') {
      pendingInformationUpdate = null;
      hideInformationAnimated();
    }
  }, $children.length * animationDelay);
}

// --- Hover en header protegido ---
$('header').hover(
  function () {
    showInformationAnimated();
  },
  function () {
    // Detener aparición y lanzar animación de ocultar escalonada
    infoTimeouts.forEach(clearTimeout);
    infoTimeouts = [];
    hideInformationAnimated();
  }
);

// --- Shuffle de letras ---
$(document).ready(function () {
  const $h1 = $('#view-shuffle');
  const text = $h1.text();

  // Convertir cada letra en un span individual
  $h1.html(text.split('').map(char =>
    char === ' ' ? ' ' : `<span style="display: inline-block;">${char}</span>`
  ).join(''));

  // Click handler para shuffle de margin-bottom
  $h1.on('click', function () {
    shuffleLetters();
  });
});

// --- Inicialización visual ---
$(document).ready(function () {
  $('#slide-index > div').first().addClass('active');
  setTimeout(function () {
    showActiveSlideIndex(0);
    hideInformationAnimated();
  }, 666);
});

// --- multiple categories con animación escalonada ---
$('.multiple').hover(
  function () {
    const $indents = $(this).find('.indent');
    $indents.hide(); // Ocultar todos primero
    
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
      const idx = len - 1 - i; // Orden inverso para ocultar
      setTimeout(function () {
        $($indents[idx]).hide();
      }, i * 100);
    });
  }
);
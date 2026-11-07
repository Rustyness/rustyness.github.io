(function () {
    'use strict';

    // Escala o palco de 1440px para caber na largura disponível.
    // Abaixo de MIN_SCALE o texto ficaria ilegível, então a moldura passa a rolar para os lados.
    var MIN_SCALE = 0.5;

    var frame = document.querySelector('[data-frame]');
    if (!frame) { return; }

    var sizer = frame.querySelector('[data-sizer]');
    var stage = frame.querySelector('[data-stage]');
    var caption = document.getElementById('legenda');
    var switcher = document.querySelector('[data-switch]');
    var tabs = switcher ? [].slice.call(switcher.querySelectorAll('[role="tab"]')) : [];
    var views = [].slice.call(stage.querySelectorAll('[data-view]'));
    var stageTabs = [].slice.call(stage.querySelectorAll('.obs-tabs__item[data-target]'));
    var width = parseInt(frame.getAttribute('data-w'), 10);

    function fit() {
        var height = parseInt(frame.getAttribute('data-h'), 10);
        var scale = Math.max(MIN_SCALE, Math.min(1, frame.clientWidth / width));

        stage.style.height = height + 'px';
        stage.style.transform = 'scale(' + scale + ')';
        sizer.style.width = Math.round(width * scale) + 'px';
        sizer.style.height = Math.round(height * scale) + 'px';
    }

    function show(name) {
        var main = null;

        views.forEach(function (view) {
            var on = view.getAttribute('data-view') === name;
            view.hidden = !on;
            if (on && view.hasAttribute('data-h')) { main = view; }
        });
        if (!main) { return; }

        frame.setAttribute('data-h', main.getAttribute('data-h'));
        caption.textContent = main.getAttribute('data-caption');

        tabs.forEach(function (tab) {
            var on = tab.getAttribute('data-target') === name;
            tab.setAttribute('aria-selected', on ? 'true' : 'false');
            tab.tabIndex = on ? 0 : -1;
            if (on) { frame.setAttribute('aria-labelledby', tab.id); }
        });
        stageTabs.forEach(function (tab) {
            tab.classList.toggle('is-active', tab.getAttribute('data-target') === name);
        });

        fit();
    }

    if (switcher) {
        switcher.hidden = false;
        frame.setAttribute('role', 'tabpanel');
        frame.removeAttribute('aria-label');

        tabs.forEach(function (tab, i) {
            tab.addEventListener('click', function () { show(tab.getAttribute('data-target')); });
            tab.addEventListener('keydown', function (e) {
                var next = null;
                if (e.key === 'ArrowRight') { next = (i + 1) % tabs.length; }
                else if (e.key === 'ArrowLeft') { next = (i - 1 + tabs.length) % tabs.length; }
                else if (e.key === 'Home') { next = 0; }
                else if (e.key === 'End') { next = tabs.length - 1; }
                if (next === null) { return; }
                e.preventDefault();
                tabs[next].focus();
                show(tabs[next].getAttribute('data-target'));
            });
        });

        // As abas desenhadas dentro da tela também respondem ao clique do mouse
        stageTabs.forEach(function (tab) {
            tab.addEventListener('click', function () { show(tab.getAttribute('data-target')); });
        });
    }

    show('overview');

    if (window.ResizeObserver) {
        new ResizeObserver(fit).observe(frame);
    } else {
        window.addEventListener('resize', fit);
    }
})();

// ==UserScript==
// @name            Gladiator.tf stats backpack.tf integration
// @namespace       https://gladiator.tf
// @version         1.7
// @description     Provides a link to various Gladiator.tf stats pages on backpack.tf pages
// @author          manic
// @grant           none
// @license         MIT

// @homepageURL     https://github.com/gladiatortf/gladiator.tf-stats-bptf
// @supportURL      https://github.com/gladiatortf/gladiator.tf-stats-bptf/issues
// @downloadURL     https://github.com/gladiatortf/gladiator.tf-stats-bptf/raw/master/gladiatortf-stats-bptf.user.js

// @run-at          document-end
// @include         /^https?:\/\/(.*\.)?backpack\.tf(:\d+)?\/stats\//
// @include         /^https?:\/\/(.*\.)?backpack\.tf(:\d+)?\/suggestion\//
// @include         /^https?:\/\/(.*\.)?backpack\.tf(:\d+)?\/item\//
// @include         /^https?:\/\/(.*\.)?backpack\.tf(:\d+)?\/vote\//
// @include         /^https?:\/\/(.*\.)?backpack\.tf(:\d+)?\/classifieds/
// ==/UserScript==
var GLAD_DOMAIN = "gladiator.tf";

(function() {
    'use strict';
    console.log('Running');
    for (let i of document.getElementsByClassName('btn btn-default')) {
        if (i.origin === 'https://gladiator.tf') {
            return;
        }
    }

    hookPopups();

    let item = $('.stats-header-title').text();
    if (!item) item = $('.header .item-name').text();
    if (!item) item = $('.item-text h2').text();
    if (!item) item = $('#item-panel-name h2').text();

    item = item.trim().replace("%", "%25");

    $('#classifieds').append(`
        <a class="btn btn-default" href="https://${GLAD_DOMAIN}/time-machine?item=${item}&at=${new Date().toISOString()}" target="_blank"><i class="fa fa-clock-o fa-fw"></i> Gladiator.tf Time Machine</a>
        <a class="btn btn-default" href="https://${GLAD_DOMAIN}/sales?item=${item}" target="_blank"><i class="fa fa-bar-chart fa-fw"></i> Gladiator.tf stats</a>
    `);
    let panelExtras = $('.panel:first .panel-extras');
    panelExtras.append(`
        <a class="btn btn-panel" href="https://${GLAD_DOMAIN}/sales?item=${item}" target="_blank"><i class="fa fa-bar-chart fa-fw"></i> Gladiator.tf stats</a>
    `);

    // time machine
    if (location.pathname.startsWith("/suggestion")) {
        let time = new Date($('.submitter-info .timeago').attr("datetime"));
        panelExtras.prepend(`
            <a class="btn btn-panel" href="https://${GLAD_DOMAIN}/time-machine?item=${item}&at=${time.toISOString()}" target="_blank"><i class="fa fa-clock-o fa-fw"></i> Gladiator.tf Time Machine</a>
        `);
    } else if (location.pathname.startsWith("/item")) {
        $('.history-sheet tr').each(function() {
            let tr = $(this);
            let time = new Date(tr.find('td:last-child').text());
            if (!time.getTime()) return;
            tr.find('td:nth-child(2)').append(`<span style="float: right; margin-left: 0.6em;"><a href="https://gladiator.tf/time-machine?item=${item}&at=${time.toISOString()}" target="_blank" data-tip="bottom" title="Gladiator.tf Time Machine"><i class="fa fa-clock-o fa-fw"></i></a></span>`)
        })
    }

})();

function hookPopups() {
    $("body").on("mouseover", ".item", function () {
        const self = this;

        const id = setInterval(function() {
            const $element = $(self).next();
            console.log($element);

            if ($element.hasClass("popover")) {
                let $popover = $element.find("#popover-price-links");
                if ($popover.find(`.gladiator-stats-button`).length == 0) {
                    const originalTitle = $(self).data('original-title');
                    $popover.append(`<a class="btn btn-default btn-xs gladiator-stats-button" href="https://${GLAD_DOMAIN}/sales?item=${encodeURIComponent(originalTitle)}" target="_blank"><i class="fa fa-bar-chart fa-fw"></i>Gladiator.tf Stats</a>`);
                }

                clearInterval(id);
            }
        }, 50);

        setTimeout(function () {
            clearInterval(id);
        }, 750);
    });
}

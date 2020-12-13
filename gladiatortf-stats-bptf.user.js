// ==UserScript==
// @name            Gladiator.tf stats backpack.tf integration
// @namespace       https://gladiator.tf
// @version         1.1
// @description     Provides a link to Gladiator.tf listing snapshots on backpack.tf pages
// @author          manic
// @grant           none
// @license         MIT

// @homepageURL     https://github.com/mninc/gladiator.tf-stats-bptf
// @supportURL      https://github.com/mninc/gladiator.tf-stats-bptf/issues
// @downloadURL     https://github.com/mninc/gladiator.tf-stats-bptf/raw/master/gladiatortf-stats-bptf.user.js

// @run-at          document-end
// @match           https://backpack.tf/stats*
// @match           https://backpack.tf/suggestion/*
// @match           https://backpack.tf/item/*
// @match           https://backpack.tf/vote/*
// ==/UserScript==

(function() {
    'use strict';

    let item = $('.stats-header-title').text();
    if (!item) item = $('.header .item-name').text();
    if (!item) item = $('.item-text h2').text();
    if (!item) item = $('#item-panel-name h2').text();

    item = item.trim().replace("%", "%25");

    $('#classifieds').append(`
        <a class="btn btn-default" href="https://gladiator.tf/listings?item=${item}" target="_blank"><i class="fa fa-history fa-fw"></i> Gladiator.tf snapshots</a>
    `);
    $('.panel:first .panel-extras').append(`
        <a class="btn btn-panel" href="https://gladiator.tf/listings?item=${item}" target="_blank"><i class="fa fa-history fa-fw"></i> Gladiator.tf snapshots</a>
    `);
})();

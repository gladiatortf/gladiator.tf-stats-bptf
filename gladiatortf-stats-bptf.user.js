// ==UserScript==
// @name            Gladiator.tf stats backpack.tf integration
// @namespace       https://gladiator.tf
// @version         2.1
// @description     Provides a link to various Gladiator.tf stats pages on backpack.tf pages
// @author          Gladiator.TF Team & manic
// @grant           none
// @license         MIT

// @homepageURL     https://github.com/gladiatortf/gladiator.tf-stats-bptf
// @supportURL      https://github.com/gladiatortf/gladiator.tf-stats-bptf/issues
// @downloadURL     https://github.com/gladiatortf/gladiator.tf-stats-bptf/raw/master/gladiatortf-stats-bptf.user.js
// @updateURL       https://github.com/gladiatortf/gladiator.tf-stats-bptf/raw/master/gladiatortf-stats-bptf.user.js

// @run-at          document-start
// @match           https://backpack.tf/*
// @match           https://*.backpack.tf/*

// @require         https://unpkg.com/popper.js@1
// @require         https://unpkg.com/tippy.js@4
// ==/UserScript==

var GLAD_DOMAIN = "gladiator.tf";

(function () {
    'use strict';

    console.log("Hostname", document.location.hostname);
    if (document.location.hostname === "next.backpack.tf") {
        console.log("Next");
        nextVersion();
        return;
    }

    document.addEventListener(
        'DOMContentLoaded', // run-at=document-end
         () => {
           console.log("Classic");
           classicVersion();
         },
        { once: true }
    );
})();

function nextVersion() {
    'use strict';

    const ICON = (width, height) => `<image xlink:href="https://gladiator.tf/img/logo.svg" src="https://gladiator.tf/img/logo.svg" width="${width}" height="${height}"></image>`;

    const addLink = (linkBox, referenceLinkBox, newLink) => {
        if (linkBox.childElementCount >= 3) {
            let newLinkBox = referenceLinkBox.cloneNode();
            linkBox.parentNode.insertBefore(newLinkBox, linkBox.nextSibling);
            linkBox = newLinkBox;
        }
        linkBox.append(" ");
        linkBox.append(newLink);
        return linkBox;
    }

    const callback = function (mutationsList) {
        for (const mutation of mutationsList) {
            if (mutation.type !== "childList") continue;

            for (const node of mutation.addedNodes) {
                if (node.tagName === "TD") {
                    const links = node.getElementsByTagName("a");
                    for (const link of links) {
                        const href = link.getAttribute("href");
                        if (href.startsWith("/profiles/") && href.includes("?time=")) {
                            const itemInfoInterval = setInterval(() => { // ensure it's fully loaded
                                const itemInfo = document.getElementsByClassName("item-info")[0];
                                if (itemInfo) {
                                    clearInterval(itemInfoInterval)
                                } else {
                                    return;
                                }

                                let item = document.getElementsByClassName("item-info")[0].innerText.trim();
                                const nonCraftable = [...document.getElementsByClassName("attribute__title")].some(elem => elem.innerText.trim() === "Craftable");
                                if (nonCraftable) item = `Non-Craftable ${item}`;
                                item = encodeURIComponent(item);
                                const newLink = link.cloneNode();
                                newLink.innerHTML = ICON(15, 15);
                                const at = new Date(parseInt(href.split("?time=")[1]) * 1000);
                                newLink.setAttribute("href", `https://gladiator.tf/time-machine?item=${item}&at=${at.toISOString()}`);
                                newLink.setAttribute("target", "_blank");
                                newLink.setAttribute("data-tippy-content", "Gladiator.tf Time Machine");
                                tippy(newLink);
                                link.parentNode.insertBefore(newLink, link);
                            }, 10);
                            break;
                        }
                    }
                } else if (node.classList?.contains("col-12") && node.innerText.startsWith("Snapshot")) {
                    const cards = document.getElementsByClassName("card");
                    let item;
                    for (const card of cards) {
                        if (!card.getElementsByClassName("vote-buttons").length) continue;

                        item = card.getElementsByClassName("card__header__title")[0].innerText;
                    }
                    if (!item) continue;

                    const loadedInterval = setInterval(() => {
                        const loading = node.getElementsByClassName("loading-spinner-wrapper").length;
                        if (loading) {
                            return;
                        }

                        const div = node.querySelector(".card__content > div");
                        const link = document.createElement("a");
                        const atElement = document.querySelector(".suggestion__header__metadata__submission-date > div > div");
                        if (!atElement) return;
                        const at = new Date(atElement.getAttribute("content"));
                        link.setAttribute("href", `https://gladiator.tf/time-machine?item=${item}&at=${at.toISOString()}`);
                        link.setAttribute("target", "_blank");
                        link.innerText = "Gladiator.tf Time Machine";
                        div.insertBefore(link, div.firstChild);
                        clearInterval(loadedInterval);
                    }, 10);

                } else if (node.classList?.contains("tippy-popper")) {
                    const titleElem = node.getElementsByClassName("item-tooltip__header__title")[0];
                    if (!titleElem) continue;

                    if (node.getElementsByClassName("btn-item-glad").length) continue;

                    let item = titleElem.innerText;

                    let links = node.getElementsByTagName("a");
                    let query;
                    for (const link of links) {
                        let href = link.getAttribute("href");
                        if (href.startsWith("/classifieds")) {
                            query = new URLSearchParams(href.split("?")[1]);
                            break;
                        }
                    }
                    if (!query) continue;

                    const craftable = query.get("craftable");
                    if (craftable === "0") item = `Non-Craftable ${item}`;
                    item = encodeURIComponent(item);

                    let linkBoxes = node.getElementsByClassName("item-tooltip__content__links");
                    let linkBox = linkBoxes[linkBoxes.length - 1];
                    const referenceLinkBox = linkBox;
                    const referenceLink = linkBoxes[0].children[0].cloneNode(true);
                    referenceLink.setAttribute("target", "_blank");

                    const statsLink = referenceLink.cloneNode(true);
                    statsLink.classList.add("btn-item-glad");
                    statsLink.setAttribute("href", `https://gladiator.tf/sales?item=${item}&at=${new Date().toISOString()}`);
                    statsLink.innerHTML = ICON(10, 10) + " Gladiator.tf Stats";
                    linkBox = addLink(linkBox, referenceLinkBox, statsLink);
                }
            }
        }
    };

    const observer = new MutationObserver(callback);

    observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true });
}

function classicVersion() {
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
}

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

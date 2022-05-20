// ==UserScript==
// @name            Gladiator.tf stats backpack.tf integration
// @namespace       https://gladiator.tf
// @version         1.5
// @description     Provides a link to Gladiator.tf listing snapshots on backpack.tf pages
// @author          manic
// @grant           none
// @license         MIT

// @homepageURL     https://github.com/gladiatortf/gladiator.tf-stats-bptf
// @supportURL      https://github.com/gladiatortf/gladiator.tf-stats-bptf/issues
// @downloadURL     https://github.com/gladiatortf/gladiator.tf-stats-bptf/raw/master/gladiatortf-stats-bptf.user.js

// @run-at          document-end
// @include         /^https?:\/\/(.*\.)?backpack\.tf(:\d+)?\//
// ==/UserScript==

(function () {
    'use strict';

    const ICON = '<image xlink:href="https://gladiator.tf/img/logo.svg" src="https://gladiator.tf/img/logo.svg" width="10" height="10"></image>';

    const addLink = (linkBox, referenceLinkBox, newLink) => {
        if (linkBox.childElementCount >= 4) {
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
                if (!node.classList?.contains("tippy-popper")) continue;

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
                statsLink.setAttribute("href", `https://gladiator.tf/sales?item=${item}`);
                statsLink.innerHTML = ICON + " Gladiator.tf Stats";
                linkBox = addLink(linkBox, referenceLinkBox, statsLink);

                const snapshotsLink = referenceLink.cloneNode(true);
                snapshotsLink.classList.add("btn-item-glad");
                snapshotsLink.setAttribute("href", `https://gladiator.tf/listings?item=${item}`);
                snapshotsLink.innerHTML = ICON + " Gladiator.tf Snapshots";
                linkBox = addLink(linkBox, referenceLinkBox, snapshotsLink);

            }
        }
    };

    const observer = new MutationObserver(callback);

    observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true });

})();

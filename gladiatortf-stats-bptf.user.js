// ==UserScript==
// @name            Gladiator.tf stats backpack.tf integration
// @namespace       https://gladiator.tf
// @version         3.0
// @description     Provides a link to Gladiator.tf listing snapshots on backpack.tf pages
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

// https://next.backpack.tf/suggestions/queue
// https://next.backpack.tf/item/16051359390

(function () {
	"use strict";

	/* global $ */
	/* global __NUXT__ */
	/* global tippy */

	const GLAD_DOMAIN = "gladiator.tf";

	const LOGGER = {
		info: msg => {
			console.log("[gladiator-stats]: " + msg);
		}
	};

	const ICON = (width, height) =>
		`<image xlink:href="https://gladiator.tf/img/logo.svg" src="https://gladiator.tf/img/logo.svg" width="${width}" height="${height}"></image>`;

	let isNext;
	let nextWebsite;

	if (typeof $ !== "undefined" || typeof __NUXT__ !== "undefined") {
		runScript();
		return;
	}

	const loadInterval = setInterval(() => {
		if (typeof $ !== "undefined" || typeof __NUXT__ !== "undefined") {
			clearInterval(loadInterval);
			runScript();
			return;
		}
	}, 10);

	function runScript() {
		isNext = typeof $ === "undefined" || typeof __NUXT__ !== "undefined";

		nextWebsite = isNext ? document.location.hostname : "next.backpack.tf"; // When the move happens

		if (isNext) {
			LOGGER.info("On next site");
			nextVersion();
			return;
		}

		LOGGER.info("On classic site");
		if (document.readyState !== "loading") {
			LOGGER.info("Classic loaded");
			classicVersion();
			return;
		}

		document.addEventListener(
			"DOMContentLoaded", // run-at=document-end
			() => {
				LOGGER.info("Classic loaded");
				classicVersion();
			},
			{ once: true }
		);
	}

	function addLinkNext(linkBox, referenceLinkBox, newLink) {
		if (linkBox.childElementCount >= 3) {
			let newLinkBox = referenceLinkBox.cloneNode();
			linkBox.parentNode.insertBefore(newLinkBox, linkBox.nextSibling);
			linkBox = newLinkBox;
		}

		linkBox.append(" ");
		linkBox.append(newLink);
		return linkBox;
	}

	function handleTdNext(node) {
		const links = Array.from(node.getElementsByTagName("a"));
		const link = links.find(
			link =>
				link.href.startsWith("/profiles/") &&
				link.href.includes("?time=")
		);

		if (!link) {
			return;
		}

		const itemInfoInterval = setInterval(() => {
			const itemInfo = document.getElementsByClassName("item-info")[0];

			if (!itemInfo) {
				return;
			}

			clearInterval(itemInfoInterval);

			let itemName = document
				.getElementsByClassName("item-info")[0]
				.innerText.trim();

			const nonCraftable = [
				...document.getElementsByClassName("attribute__title")
			].some(elem => elem.innerText.trim() === "Craftable");

			if (nonCraftable) {
				itemName = `Non-Craftable ${itemName}`;
			}

			const newLink = link.cloneNode();
			const at = new Date(parseInt(link.href.split("?time=")[1]) * 1000);

			newLink.innerHTML = ICON(15, 15);
			newLink.setAttribute(
				"href",
				`https://gladiator.tf/time-machine?item=${encodeURIComponent(
					itemName
				)}&at=${at.toISOString()}`
			);
			newLink.setAttribute("target", "_blank");
			newLink.setAttribute(
				"data-tippy-content",
				"Gladiator.tf Time Machine"
			);

			tippy(newLink);
			link.parentNode.insertBefore(newLink, link);
		}, 10);
	}

	function handleSnapshotNext(node) {
		const cards = document.getElementsByClassName("card");
		if (cards.length === 0) {
			return;
		}

		const card = cards[0];
		const itemName = card
			.querySelector(".card__header__title")
			.textContent.trim();

		const statsLink = document.createElement("a");
		statsLink.setAttribute(
			"href",
			`https://${GLAD_DOMAIN}/sales?item=${encodeURIComponent(itemName)}`
		);
		statsLink.setAttribute("target", "_blank");
		statsLink.innerText = "Gladiator.tf Stats";

		card.querySelector(".card__header__actions").append(statsLink);

		const appendTimeMachineInterval = setInterval(() => {
			const atElement = document.querySelector(
				".suggestion__header__metadata__submission-date > div > div"
			);

			if (!atElement) {
				return;
			}

			const at = new Date(atElement.getAttribute("content"));
			const timeMachineLink = document.createElement("a");
			timeMachineLink.setAttribute(
				"href",
				`https://${GLAD_DOMAIN}/time-machine?item=${encodeURIComponent(
					itemName
				)}&at=${at.toISOString()}`
			);
			timeMachineLink.setAttribute("target", "_blank");
			timeMachineLink.innerText = "Gladiator.tf Time Machine";

			const snapshotActions = node.querySelector(
				".card__header__actions"
			);
			if (!snapshotActions) {
				return;
			}

			snapshotActions.appendChild(timeMachineLink);
			clearInterval(appendTimeMachineInterval);
		}, 50);
	}

	function handlePopperNext(node) {
		const titleElem = node.getElementsByClassName(
			"item-tooltip__header__title"
		)[0];

		if (!titleElem || node.getElementsByClassName("btn-item-glad").length) {
			return;
		}

		let itemName = titleElem.innerText;
		for (const link of node.getElementsByTagName("a")) {
			if (link.href.startsWith(`https://${nextWebsite}/classifieds`)) {
				const query = new URLSearchParams(link.href.split("?")[1]);
				if (query.get("craftable") === "0") {
					itemName = `Non-Craftable ${itemName}`;
				}

				break;
			}
		}

		const linkBoxes = node.getElementsByClassName(
			"item-tooltip__content__links"
		);
		const referenceLinkBox = linkBoxes[linkBoxes.length - 1];
		const referenceLink = linkBoxes[0].children[0].cloneNode(true);
		referenceLink.setAttribute("target", "_blank");

		const statsLink = referenceLink.cloneNode(true);
		statsLink.classList.add("btn-item-glad");
		statsLink.setAttribute(
			"href",
			`https://gladiator.tf/sales?item=${encodeURIComponent(
				itemName
			)}&at=${new Date().toISOString()}`
		);
		statsLink.innerHTML = ICON(10, 10) + " Gladiator.tf Stats";

		addLinkNext(referenceLinkBox, referenceLinkBox, statsLink);
	}

	function handleStatsPageNext(node) {
		const cards = document.getElementsByClassName("card");
		if (cards.length === 0) {
			return;
		}

		const card = cards[0];
		const itemName = card
			.querySelector(".card__content h2")
			.textContent.trim();

		const statsLink = document.createElement("a");
		statsLink.classList.add("col-auto");
		statsLink.setAttribute(
			"href",
			`https://${GLAD_DOMAIN}/sales?item=${itemName}`
		);
		statsLink.setAttribute("target", "_blank");
		statsLink.innerText = "Gladiator.tf Stats";

		card.querySelector(".card__header__actions > .row").prepend(statsLink);

		const timeMachineLink = document.createElement("a");
		timeMachineLink.classList.add("col-auto");
		timeMachineLink.setAttribute(
			"href",
			`https://${GLAD_DOMAIN}/time-machine?item=${encodeURIComponent(
				itemName
			)}`
		);
		timeMachineLink.setAttribute("target", "_blank");
		timeMachineLink.innerText = "Gladiator.tf Time Machine";

		node.querySelector(".card__header__actions > .row").prepend(
			timeMachineLink
		);
	}

	function nextVersion() {
		function observe(mutationsList) {
			for (const mutation of mutationsList) {
				if (mutation.type !== "childList") {
					continue;
				}

				for (const node of mutation.addedNodes) {
					if (node.tagName === "TD") {
						handleTdNext(node);
					} else if (node.classList?.contains("tippy-popper")) {
						handlePopperNext(node);
					} else if (
						node.classList?.contains("p-chart") &&
						node.parentNode?.parentNode?.parentNode
							?.querySelector(".card__header__title")
							?.textContent.trim() === "Classifieds Trends"
					) {
						handleStatsPageNext(
							node.parentNode.parentNode.parentNode
						);
					} else if (
						node.classList?.contains("card__header__actions") &&
						node.parentNode?.querySelector(
							".card__header__title > span"
						)?.textContent === "Snapshot"
					) {
						handleSnapshotNext(node.parentNode);
					}
				}
			}
		}

		new MutationObserver(observe).observe(document.documentElement, {
			childList: true,
			subtree: true,
			attributes: true
		});
	}

	function isClassicPathForPanelButtons(path) {
		return (
			path.startsWith("/stats/") ||
			path.startsWith("/suggestion/") ||
			path.startsWith("/item/") ||
			path.startsWith("/vote/") ||
			path.startsWith("/classifieds")
		);
	}

	function classicVersion() {
		hookPopupsClassic();

		if (!isClassicPathForPanelButtons(window.location.pathname)) {
			return;
		}

		LOGGER.info("Adding panel buttons for " + window.location.pathname);
		for (let i of document.getElementsByClassName("btn btn-default")) {
			if (i.origin === "https://gladiator.tf") {
				return;
			}
		}

		addPanelButtonsClassic();
	}

	function addPanelButtonsClassic() {
		let itemName = $(".stats-header-title").text();
		if (!itemName) itemName = $(".header .item-name").text();
		if (!itemName) itemName = $(".item-text h2").text();
		if (!itemName) itemName = $("#item-panel-name h2").text();

		itemName = itemName.trim().replace("%", "%25");

		$("#classifieds").append(`
			<a class="btn btn-default" href="https://${GLAD_DOMAIN}/time-machine?item=${itemName}&at=${new Date().toISOString()}" target="_blank">
				<i class="fa fa-clock-o fa-fw"></i> Gladiator.tf Time Machine
			</a>
			<a class="btn btn-default" href="https://${GLAD_DOMAIN}/sales?item=${itemName}" target="_blank"><i class="fa fa-bar-chart fa-fw">
				</i> Gladiator.tf stats
			</a>
		`);

		const panelExtras = $(".panel:first .panel-extras");
		panelExtras.append(`
			<a class="btn btn-panel" href="https://${GLAD_DOMAIN}/sales?item=${itemName}" target="_blank"><i class="fa fa-bar-chart fa-fw">
				</i> Gladiator.tf stats
			</a>
		`);

		if (location.pathname.startsWith("/suggestion")) {
			const time = new Date(
				$(".submitter-info .timeago").attr("datetime")
			);

			panelExtras.prepend(`
				<a class="btn btn-panel" href="https://${GLAD_DOMAIN}/time-machine?item=${itemName}&at=${time.toISOString()}" target="_blank">
					<i class="fa fa-clock-o fa-fw"></i> Gladiator.tf Time Machine
				</a>
			`);
		} else if (location.pathname.startsWith("/item")) {
			$(".history-sheet tr").each(function () {
				const tr = $(this);
				const time = new Date(tr.find("td:last-child").text());
				if (!time.getTime()) {
					return;
				}

				tr.find("td:nth-child(2)").append(
					`<span style="float: right; margin-left: 0.6em;">
						<a href="https://gladiator.tf/time-machine?item=${itemName}&at=${time.toISOString()}" target="_blank" data-tip="bottom" title="Gladiator.tf Time Machine">
							<i class="fa fa-clock-o fa-fw"></i>
						</a>
					</span>
					`
				);
			});
		}
	}

	function appendPopperClassic($target) {
		const $element = $target.next();
		if (!$element.hasClass("popover")) {
			return false;
		}

		let $gladLinks = $element.find("#popover-glad-links");
		if ($gladLinks.length === 0) {
			const $additionalLinks = $element.find("#popover-additional-links");

			$gladLinks = $additionalLinks.clone();
			$gladLinks.empty();
			$gladLinks.attr("id", "popover-glad-links");

			$element.find(".popover-content").first().append($gladLinks);
		}

		if ($gladLinks.find(`.gladiator-stats-button`).length == 0) {
			const originalTitle = $target.data("original-title");

			$gladLinks.append(
				`<a class="btn btn-default btn-xs gladiator-stats-button" href="https://${GLAD_DOMAIN}/sales?item=${encodeURIComponent(
					originalTitle
				)}" target="_blank"><i class="fa fa-bar-chart fa-fw"></i>Gladiator.tf Stats</a>`
			);
		}

		return true;
	}

	function hookPopupsClassic() {
		$("body").on("mouseover", ".item", function () {
			const self = this;

			const id = setInterval(() => {
				if (appendPopperClassic($(self))) {
					clearInterval(id);
				}
			}, 50);

			setTimeout(function () {
				clearInterval(id);
			}, 750);
		});
	}
})();

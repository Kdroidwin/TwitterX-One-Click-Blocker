// ==UserScript==
// @name         TwitterX-One-Click-Blocker
// @namespace    https://x.com/
// @version      1.0
// @description  Add a one-click block button to tweets on X/Twitter
// @author       Kdroidwin
// @match        https://twitter.com/*
// @match        https://x.com/*
// @run-at       document-end
// @grant        none
// @license      MIT
// ==/UserScript==

(function () {
    'use strict';

    // --- Block icon SVG ---
    const blockIconSVG = `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
         viewBox="0 0 24 24" fill="none"
         stroke="currentColor" stroke-width="2"
         stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
    </svg>`;

    // --- Utilities ---
    const simulateClick = (element) => {
        if (element) {
            element.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        }
    };

    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    // --- Block sequence ---
    async function blockUser(event) {
        event.preventDefault();
        event.stopPropagation();

        console.log("OneClickBlock: Starting block sequence...");

        const tweetElement = event.currentTarget.closest('article[data-testid="tweet"]');
        if (!tweetElement) return;

        const moreButton = tweetElement.querySelector('button[data-testid="caret"]');
        if (!moreButton) return;

        simulateClick(moreButton);
        await sleep(150);

        const blockMenuItem = document.querySelector('div[data-testid="block"]');
        if (!blockMenuItem) {
            simulateClick(moreButton);
            return;
        }

        simulateClick(blockMenuItem);
        await sleep(150);

        const confirmButton = document.querySelector('button[data-testid="confirmationSheetConfirm"]');
        if (!confirmButton) return;

        simulateClick(confirmButton);

        // Fade out blocked tweet
        tweetElement.style.transition = 'opacity 0.4s';
        tweetElement.style.opacity = '0.3';

        setTimeout(() => {
            tweetElement.style.display = 'none';
        }, 400);
    }

    // --- Add button to tweet ---
    function addBlockButtons() {
        const tweets = document.querySelectorAll('article[data-testid="tweet"]');

        tweets.forEach(tweet => {
            if (tweet.querySelector('.one-click-block-btn')) return;

            const insertionPoint = tweet.querySelector('[role="group"]');
            if (!insertionPoint) return;

            const button = document.createElement('div');
            button.className = 'one-click-block-btn';
            button.innerHTML = blockIconSVG;
            button.style.cursor = 'pointer';
            button.style.marginLeft = '8px';
            button.style.display = 'flex';
            button.style.alignItems = 'center';
            button.style.color = 'rgb(113, 118, 123)';
            button.title = 'Block this user';

            button.addEventListener('mouseenter', () => {
                button.style.color = 'rgb(239, 68, 68)';
            });

            button.addEventListener('mouseleave', () => {
                button.style.color = 'rgb(113, 118, 123)';
            });

            button.addEventListener('click', blockUser);

            insertionPoint.appendChild(button);
        });
    }

    // --- Observe dynamic loading ---
    const observer = new MutationObserver(() => {
        addBlockButtons();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    console.log("OneClickBlock: Loaded.");
    addBlockButtons();
})();

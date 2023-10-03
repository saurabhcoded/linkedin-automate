/* ====================
Feature Send Connection Requests
======================*/
// Popup Dom Selected
const btn = document.querySelector('.send-btn');
const cancelBtn = document.querySelector('.cancel-btn');
const progress = document.querySelector(".progress");
const totalRequests = document.querySelector(".totalRequests");
const sentRequests = document.querySelector(".sentRequests");
let connectionSelect = document.querySelector(".connectionSelect");

// Regex To confirm for My Network Page.
const linkedinUrlRegex = /^(https?:\/\/)?(www\.)?linkedin\.com\/mynetwork\//i;
let pageRedirect = false;
const networkUrl = 'https://www.linkedin.com/mynetwork';

// Change Connection Limit;
connectionSelect.addEventListener('change', (e) => {
    chrome.storage.local.set({connectionLimit: e.target.value}).then(() => {
        console.log("Value is set", e.target.value);
    }).catch((Err) => {
        console.log(Err);
    });
})
cancelBtn.addEventListener('click', async () => {
    chrome.storage.local.clear();
})
// Connection Button Event Listener 
btn.addEventListener('click', async () => {
    let timeOut = 3;
    let [tab] = await chrome.tabs.query({active: true, currentWindow: true});
    if (!linkedinUrlRegex.test(tab.url)) {chrome.tabs.update({url: networkUrl}); timeOut = 10}
    progress.classList.add("Analysing");
    setTimeout(() => {
        progress.classList.add("active");
        cancelBtn.classList.add("active");
        chrome.scripting.executeScript(
            {
                target: {tabId: tab.id},
                function: sendRequests,
            },
        );
    }, timeOut * 1000);
});

// Injected Script For Sending Connection Requests
async function sendRequests() {
    try {
        let Requests = {
            total: 0,
            sent: 0,
            cancelled: false,
        }
        let connectionLimit = 20;
        function clickWithdrawButtonsInSeries() {
            let buttonsArray = document.querySelectorAll("button");
            const buttons = [];
            buttonsArray.forEach((element, eleIndex) => {
                if (element.innerText === "Connect") {
                    buttons.push(element);
                }
            });
            chrome.storage.local.get(["connectionLimit"]).then((result) => {
                if (result.connectionLimit) {
                    connectionLimit = result.connectionLimit;
                }
            });
            Requests.total = buttons.length;
            let currentIndex = 0;
            function clickNextButton() {
                if (currentIndex < buttons.length && currentIndex < connectionLimit) {
                    const btn = buttons[currentIndex];
                    btn.click();
                    Requests.sent += 1;
                    chrome.runtime.sendMessage({requestsData: Requests});
                    chrome.storage.local.set({conn: Requests}).then(() => {
                        console.log("Value is set");
                    });
                    setTimeout(() => {
                        currentIndex++;
                        setTimeout(clickNextButton, 1000);
                    }, 1000);
                } else {
                    chrome.storage.local.clear();
                }
            }
            clickNextButton();
        }
        clickWithdrawButtonsInSeries();
    } catch (err) {
        console.error(err);
    }
}

// Listen to Updates Of Sent Requests.
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.requestsData) {
        const {total, sent} = message.requestsData;
        totalRequests.innerHTML = total;
        sentRequests.innerHTML = sent;
    }

});

/* ====================
Feature Remove Not Accepted Requests
======================*/
const remove_reqbtn = document.querySelector(".remove-req-btn");
const removeProgress = document.querySelector(".removeProgress");
const removeTotalRequests = document.querySelector(".removeTotalRequests");
const removeSentRequests = document.querySelector(".removeSentRequests");

// Regex To confirm for My Network Requests Page.
const LkdNetworkUrlRegex = /^(https?:\/\/)?(www\.)?linkedin\.com\/mynetwork\/invitation-manager\/sent\//i;
let removePageRedirect = false;
const removeNetworkUrl = 'https://www.linkedin.com/mynetwork/invitation-manager/sent/';

// Remove Connection Button Event Listener 
remove_reqbtn.addEventListener('click', async () => {
    let timeOut = 3;
    let [tab] = await chrome.tabs.query({active: true, currentWindow: true});
    if (!LkdNetworkUrlRegex.test(tab.url)) {chrome.tabs.update({url: removeNetworkUrl}); timeOut = 10}
    progress.classList.add("Analysing");
    setTimeout(() => {
        removeProgress.classList.add("active");
        chrome.scripting.executeScript(
            {
                target: {tabId: tab.id},
                function: removeRequests,
            },
        );
    }, timeOut * 1000);
});

// Injected Script For Sending Connection Requests
async function removeRequests() {
    try {
        let Requests = {
            total: 0,
            sent: 0,
            cancelled: false,
        }
        function clickWithdrawButtonsInSeries() {
            let buttonsArray = document.querySelectorAll("button");
            const buttons = [];
            buttonsArray.forEach((element, eleIndex) => {
                if (element.innerText === "Withdraw") {
                    buttons.push(element);
                }
            });
            Requests.total = buttons.length;
            let currentIndex = 0;
            function clickNextButton() {
                if (currentIndex < buttons.length) {
                    const btn = buttons[currentIndex];
                    btn.click();
                    setTimeout(() => {
                        const modalBtn = document.querySelector(".artdeco-modal__confirm-dialog-btn.artdeco-button--primary");
                        console.log("ModalBtn", modalBtn);
                        if (modalBtn) {
                            modalBtn.click();
                        }
                        currentIndex++;
                        Requests.sent = currentIndex;
                        chrome.runtime.sendMessage({removeRequestsData: Requests});
                        chrome.storage.local.set({removeRequests: Requests}).then(() => {
                            console.log("Value is set");
                        });
                        setTimeout(clickNextButton, 2000);
                    }, 2000);
                } else {
                    Requests.total({total: 0, sent: 0, cancelled: 0});
                }
            }
            clickNextButton();
        }
        clickWithdrawButtonsInSeries();
    } catch (err) {
        console.error(err);
    }
}

// Listen to Updates Of Sent Requests.
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.removeRequestsData) {
        const {total, sent} = message.removeRequestsData;
        removeTotalRequests.innerHTML = total;
        removeSentRequests.innerHTML = sent;
    }

});



// On Page Reload Clear Data

chrome.tabs.onUpdated.addListener(function (changeInfo) {
    if (changeInfo.url === undefined) {
        chrome.storage.local.clear();
    }
});
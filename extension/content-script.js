(() => {
    chrome.storage.local.get(["conn", "connectionLimit", "removeRequests"]).then((result) => {
        console.log(result);
        if (result.conn) {
            const response = JSON.parse(result.conn);
            if (response.total && response.sent) {
                progress.classList.add("active");
                cancelBtn.classList.add("active");
                totalRequests.innerHTML = response.total;
                sentRequests.innerHTML = response.sent;
            }
        }
        console.log(result.connectionLimit);
        if (result.connectionLimit) {
            console.log(result.connectionLimit);
            connectionSelect.value = result.connectionLimit;
        }
        if (result.removeRequests) {
            const response = result.removeRequests;
            if (response.total && response.sent) {
                console.log("removed", result.removeRequests);
                removeProgress.classList.add("active");
                removeTotalRequests.innerHTML = response.total;
                removeSentRequests.innerHTML = response.sent;
            }
        }
    }).catch((Err) => {
        console.error(Err);
    });
})()


(() => {
    chrome.storage.local.get(["conn", "connectionLimit"]).then((result) => {
        console.log(result.conn);
        if (result.conn) {
            progress.classList.add("active");
            cancelBtn.classList.add("active");
            const response = JSON.parse(result.conn);
            totalRequests.innerHTML = response.total;
            sentRequests.innerHTML = response.sent;
        }
        console.log(result.connectionLimit);
        if (result.connectionLimit) {
            console.log(result.connectionLimit);
            connectionSelect.value = result.connectionLimit;
        }
    }).catch((Err) => {
        console.error(Err);
    });
})()
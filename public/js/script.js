const baseUrl = "http://localhost:3000";
const tblBody = document.getElementById("tbl-body");
const search = document.getElementById("search");
search.addEventListener("keyup", () => {
    axios
        .get(`${baseUrl}/search/${search.value}`)
        .then((response) => {
            let extensions = [];
            response.data.forEach((resp) => {
                extensions.push(resp);
            });
            tblBody.innerHTML = showView(extensions);
        })
        .catch((error) => console.log(error));
});

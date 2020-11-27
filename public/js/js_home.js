const addBtn = document.getElementById('todo__btn');
const addTitle = document.getElementById('todo__title');
const addText = document.getElementById('todo__text');

addTitle.addEventListener("input", () => {
    console.log(addTitle.value)
    if (addTitle.value !== "") {
        addBtn.removeAttribute('disabled');
    }
    else {
        addBtn.setAttribute('disabled', true);
    }
})

addBtn.addEventListener("click", async () => {
    console.log(await axios.post("/addtodo", {
        title: addTitle.value,
        text: addText.value
    }));
});
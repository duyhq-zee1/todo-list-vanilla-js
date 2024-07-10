todoList = [
	{ name: "Todo 1", isDone: false },
	{ name: "Todo 2", isDone: false },
];

const todoListElement = document.getElementById("todoList");

function renderList() {
	const filterValue = filter.value;
	todoListElement.innerHTML = "";
	todoList.forEach((todo, index) => {
		if (
			filterValue === "all" ||
			(filterValue === "done" && todo.done) ||
			(filterValue === "undone" && !todo.done)
		) {
			const li = document.createElement("li");
			li.innerHTML = `
                <span>${todo.name}</span>
                <div>
                    <button class="edit-button" onclick="editTask(${index})">Edit</button>
                    <button class="delete-button" onclick="deleteTask(${index})">Delete</button>
                </div>
            `;
			todoListElement.appendChild(li);
		}
	});
}

renderList();

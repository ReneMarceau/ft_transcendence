import { render_game } from "./game/pong.js";
import { initLocalPong } from "./game/pong.js"

(async function () {
	render_game()
	initLocalPong()
})();


$(document).ready(function () {
	function loadTasks() {
		$.ajax({
			url: 'https://localhost/api/todo/',
			method: 'GET',
			success: function (data) {
				$('#task-list').empty();
				data.forEach(function (task) {
					const taskItem = $('<li class="list-group-item d-flex justify-content-between align-items-center"></li>');

					// Left side: Checkbox and task title
					const leftSide = $('<div class="d-flex align-items-center"></div>');
					const taskCheckbox = $('<input type="checkbox" class="mr-2">').prop('checked', task.completed).change(function () {
						updateTask(task.id, task.title, $(this).prop('checked'));
					});
					const taskTitle = $('<span></span>').text(task.title).addClass(task.completed ? 'completed-task' : '');
					leftSide.append(taskCheckbox).append(taskTitle);

					// Right side: Edit and delete buttons
					const rightSide = $('<div></div>');
					const editButton = $('<button class="btn btn-sm btn-warning mr-2">Edit</button>').click(function () {
						editTask(task.id, task.title);
					});
					const deleteButton = $('<button class="btn btn-sm btn-danger">Delete</button>').click(function () {
						deleteTask(task.id);
					});
					rightSide.append(editButton).append(deleteButton);

					taskItem.append(leftSide).append(rightSide);
					$('#task-list').append(taskItem);
				});
			}
		});
	}

	function addTask(title) {
		$.ajax({
			url: 'https://localhost/api/todo/',
			method: 'POST',
			contentType: 'application/json',
			data: JSON.stringify({
				title: title,
				completed: false
			}),
			success: function () {
				$('#task-input').val('');
				loadTasks();
			}
		});
	}

	function updateTask(id, title, completed) {
		$.ajax({
			url: `https://localhost/api/todo/${id}/`,
			method: 'PUT',
			contentType: 'application/json',
			data: JSON.stringify({
				title: title,
				completed: completed
			}),
			success: function () {
				loadTasks();
			}
		});
	}

	function deleteTask(id) {
		$.ajax({
			url: `https://localhost/api/todo/${id}/`,
			method: 'DELETE',
			success: function () {
				loadTasks();
			}
		});
	}

	function editTask(id, currentTitle) {
		const newTitle = prompt("Edit Task", currentTitle);
		if (newTitle !== null) {
			updateTask(id, newTitle, false);
		}
	}

	$('#add-task-btn').click(function () {
		const taskTitle = $('#task-input').val();
		if (taskTitle) {
			addTask(taskTitle);
		}
	});

	loadTasks();
});

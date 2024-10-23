// due date editing fixed and enter key optimized

let progressChart; // To store the Chart.js instance

// Initialize the donut chart
function initializeChart() {
    const ctx = document.getElementById('progressChart').getContext('2d');
    progressChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Completed', 'Remaining'],
            datasets: [{
                data: [0, 1], // Initial data: 0 completed, 1 remaining
                backgroundColor: ['#4CAF50', '#FFC107'],
                borderWidth: 1,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true, // Ensures the aspect ratio is maintained
            plugins: {
                legend: {
                    position: 'bottom',
                },
            },
            layout: {
                padding: {
                    top: 20,
                    bottom: 20
                }
            }
        },
    });

    // Update progress chart after it's initialized
    updateProgressChart();
}


// Update the chart with current progress
function updateProgressChart() {
    const totalTodos = document.getElementById("todo-list").children.length;
    const completedTodos = [...document.getElementById("todo-list").children].filter(todo => {
        return todo.querySelector("input[type='checkbox']").checked;
    }).length;

    const remainingTodos = totalTodos - completedTodos;

    // Handle the case when there are no To-Do items to avoid an empty chart
    const chartData = totalTodos === 0 ? [0, 1] : [completedTodos, remainingTodos];

    // Update the chart data
    progressChart.data.datasets[0].data = chartData;
    progressChart.update(); // Refresh the chart
}


// Function to gather data for the graph
function getTaskDataForGraph() {
    const taskData = {};
    const todoListItems = document.querySelectorAll("#todo-list li");

    todoListItems.forEach(item => {
        const dueDateElement = item.querySelector(".due-date");

        if (dueDateElement) { // Only process if there is a due date element
            const dueDateText = dueDateElement.innerText;
            const dueDate = dueDateText.replace("(Due: ", "").replace(")", "").trim(); // Extract and clean the due date

            if (!taskData[dueDate]) {
                taskData[dueDate] = 0;
            }
            taskData[dueDate]++;
        }
    });

    return taskData; // Return total task data in the correct format
}



function getCompletedTaskDataForGraph() {
    const completedTaskData = {};
    const todoListItems = document.querySelectorAll("#todo-list li");

    // todoListItems.forEach(item => {
    //     const dueDateElement = item.querySelector(".due-date");
    //     if (dueDateElement) {
    //         const dueDateText = item.querySelector(".due-date").innerText;
    //         const dueDate = dueDateText.replace("(Due: ", "").replace(")", "").trim(); // Extract and clean the due date

    //         // Check if the task is completed by checking if the list item has 'text-decoration: line-through'
    //         const isCompleted = window.getComputedStyle(item).textDecoration.includes("line-through");

    //         if (isCompleted) {
    //             if (!completedTaskData[dueDate]) {
    //                 completedTaskData[dueDate] = 0;
    //             }
    //             completedTaskData[dueDate]++;
    //         }
    //     }
    // });

    todoListItems.forEach(item => {
        const dueDateElement = item.querySelector(".due-date");
        const textSpan = item.querySelector(".todo-text"); // Select the text span

        if (dueDateElement) {
            const dueDateText = dueDateElement.innerText; // Get due date text
            const dueDate = dueDateText.replace("(Due: ", "").replace(")", "").trim(); // Extract and clean the due date

            // Check if the task is completed by checking if the text span has 'text-decoration: line-through'
            const isCompleted = window.getComputedStyle(textSpan).textDecoration.includes("line-through");

            if (isCompleted) {
                if (!completedTaskData[dueDate]) {
                    completedTaskData[dueDate] = 0;
                }
                completedTaskData[dueDate]++;
            }
        }
    });

    return completedTaskData; // Return completed task data in the correct format
}


function getOverDueDataForGraph() {
    const taskData = getTaskDataForGraph(); // Total tasks per due date
    const completedTaskData = getCompletedTaskDataForGraph(); // Completed tasks per due date
    const today = new Date().toISOString().split('T')[0]; // Get today's date in "YYYY-MM-DD" format

    const overdueTasks = {};
    let totalOverdueTasks = 0;
    const overdueDates = [];

    Object.keys(taskData).forEach(date => {
        if (date < today) { // If the task due date is in the past
            const totalTasksOnDate = taskData[date] || 0;
            const completedTasksOnDate = completedTaskData[date] || 0;
            const overdueCount = totalTasksOnDate - completedTasksOnDate;

            // Only add to overdue tasks if there are any overdue items
            if (overdueCount > 0) {
                overdueTasks[date] = overdueCount;
                totalOverdueTasks += overdueCount; // Count the total overdue tasks
                overdueDates.push(date); // Keep track of the overdue dates
            }
        }
    });

    // Display the message about overdue tasks
    const overdueTaskMessageElement = document.getElementById("overdue-task-message");

    if (totalOverdueTasks > 0) {
        const overdueDatesString = overdueDates.join(", "); // Convert array of dates to a readable string
        const message = `You have ${totalOverdueTasks} overdue tasks on the following date(s): ${overdueDatesString}.`;
        overdueTaskMessageElement.textContent = message; // Update the message in the p element
    } else {
        overdueTaskMessageElement.textContent = "You have no overdue tasks."; // If there are no overdue tasks
    }

    return overdueTasks; // Return the overdue task data for the chart
}
// getOverDueDataForGraph(); // To update the overdue task message






// Function to create and update the chart
function updateTodoChart() {
    // Save the current scroll position
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;

    const taskData = getTaskDataForGraph(); // Total tasks per due date
    const completedTaskData = getCompletedTaskDataForGraph(); // Completed tasks per due date
    const overdueTaskData = getOverDueDataForGraph(); // Overdue tasks per due date

    const labels = Object.keys(taskData).sort(); // Get all due dates and sort them in ascending order

    const totalTasks = labels.map(label => taskData[label] || 0); // Map total tasks to the labels (dates)
    const completedTasks = labels.map(label => completedTaskData[label] || 0); // Map completed tasks to the same labels
    const overdueTasks = labels.map(label => overdueTaskData[label] || 0); // Map overdue tasks to the same labels

    // console.log("Labels:", labels);
    // console.log("Total Tasks Data:", totalTasks);
    // console.log("Completed Tasks Data:", completedTasks);
    // console.log("Overdue Tasks Data:", overdueTasks);

    const ctx = document.getElementById('todoChart').getContext('2d');

    // Check if the chart already exists, and if so, destroy it
    if (window.todoChart instanceof Chart) {
        window.todoChart.destroy();
    }

    // Create the new chart
    window.todoChart = new Chart(ctx, {
        type: 'bar', // Use bar chart
        data: {
            labels: labels, // Dates for the X-axis
            datasets: [
                {
                    label: 'Total Tasks Due',
                    data: totalTasks, // Total number of tasks per date
                    backgroundColor: 'rgba(54, 162, 235, 0.2)', // Blue for total tasks
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Completed Tasks',
                    data: completedTasks, // Completed number of tasks per date
                    backgroundColor: 'rgba(75, 192, 192, 0.2)', // Green for completed tasks
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Overdue Tasks',
                    data: overdueTasks, // Overdue number of tasks per date
                    backgroundColor: 'rgba(255, 99, 132, 0.2)', // Red for overdue tasks
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Due Date'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Number of Tasks'
                    },
                    beginAtZero: true // Ensure the Y-axis starts at 0
                }
            }
        }
    });

    // Restore the scroll position after the chart is updated
    window.scrollTo(scrollX, scrollY);
}



function getTasksCompletedThisWeek() {
    const todoList = document.getElementById("todo-list");
    const completedTasks = [];

    const today = new Date();
    const firstDayOfWeek = new Date(today.setDate(today.getDate() - today.getDay())); // Sunday of the current week
    const lastDayOfWeek = new Date(today.setDate(firstDayOfWeek.getDate() + 6)); // Saturday of the current week

    todoList.querySelectorAll("li").forEach(item => {
        const checkbox = item.querySelector("input[type='checkbox']").checked;
        const dueDateElement = item.querySelector("span.due-date");
        const dueDateText = dueDateElement ? dueDateElement.textContent : "";
        const dueDate = dueDateText ? new Date(dueDateText.replace(" (Due: ", "").replace(")", "")) : null;

        if (checkbox && dueDate && dueDate >= firstDayOfWeek && dueDate <= lastDayOfWeek) {
            completedTasks.push(item);
        }
    });

    return completedTasks.length;
}

function updateWeeklyTaskTracker() {
    const completedTasksThisWeek = getTasksCompletedThisWeek();
    const messageElement = document.getElementById("completed-task-message");

    if (completedTasksThisWeek === 0) {
        messageElement.textContent = "You haven't completed any tasks of this week.";
    } else {
        messageElement.textContent = `You completed ${completedTasksThisWeek} task of this week.`;
    }
}

// Automatically update weekly tracker every 24 hours
setInterval(() => {
    updateWeeklyTaskTracker();
}, 24 * 60 * 60 * 1000); // 24 hours











document.addEventListener("DOMContentLoaded", function () {
    // Load existing data from local storage when the page loads
    initializeChart(); // Initialize the chart
    loadDataFromLocalStorage();
    updateWeeklyTaskTracker();   // Update the tracker for the current week
    updateProgressChart(); // Set initial chart state
    updateTodoChart();    // update the chart initially and whenever needed

    // Check for tasks due today
    checkTasksDueToday();

    // Add search event listeners
    document.getElementById("todo-search").addEventListener("input", filterTodos);
    document.getElementById("priority-search").addEventListener("input", filterPriorities);

    // Enter key handling for adding items
    const todoInput = document.getElementById("new-todo");
    const dueDateInput = document.getElementById("new-todo-due");
    todoInput.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            event.preventDefault(); // Prevent default behavior
            dueDateInput.focus(); // Move focus to due date input
            // addTodo();
        }
    });

    dueDateInput.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            event.preventDefault(); // Prevent default behavior
            addTodo(); // Call the addTodo function
            todoInput.focus();
        }
    });

    const priorityInput = document.getElementById("new-priority");
    const prioritydueDateInput = document.getElementById("new-priority-due");
    priorityInput.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            event.preventDefault(); // Prevent default behavior
            prioritydueDateInput.focus(); // Move focus to due date input
            // addPriority();
        }
    });

    prioritydueDateInput.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            event.preventDefault(); // Prevent default behavior
            addPriority(); // Call the addPriority function
            priorityInput.focus();
        }
    });

    // Save notes and reminders to local storage on input change
    const notesTextarea = document.querySelector(".notes textarea");
    const reminderTextarea = document.querySelector(".reminder textarea");

    notesTextarea.addEventListener("input", saveNotesToLocalStorage);
    reminderTextarea.addEventListener("input", saveReminderToLocalStorage);

});


// Function to check and toggle the class based on window width
function toggleRowColumns() {
    const todoBody = document.querySelector('.todo-body');
    if (window.innerWidth <= 1200) {
        // If width is <= 1200px, replace `row-cols-md-2` with `row-cols-md-1`
        todoBody.classList.remove('row-cols-md-2');
        todoBody.classList.add('row-cols-md-1');
    } else {
        // If width is greater than 1200px, make sure `row-cols-md-2` is active
        todoBody.classList.remove('row-cols-md-1');
        todoBody.classList.add('row-cols-md-2');
    }
}
// Run the function on page load
window.addEventListener('load', toggleRowColumns);
// Run the function every time the window is resized
window.addEventListener('resize', toggleRowColumns);


// Function to check if any tasks are due today or upcoming tasks
function checkTasksDueToday() {
    const today = new Date();
    const todayString = today.toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
    const upcomingTasks = []; // To store all upcoming tasks with their due dates
    const todoList = document.getElementById("todo-list").children;
    // const priorityList = document.getElementById("priority-list").children;

    let tasksDueToday = 0;

    // Get the p element where the message will be displayed
    const dueTaskMessageElement = document.getElementById("due-task-message");

    // Helper function to check if a task is completed (using text-decoration style)
    // function isTaskCompleted(taskElement) {
    //     return taskElement.style.textDecoration === "line-through";
    // }
    function isTaskCompleted(taskElement) {
        const textSpan = taskElement.querySelector(".todo-text");
        const dueDateSpan = taskElement.querySelector(".due-date");

        // Check if both text and due date have line-through style applied
        const isTextCompleted = textSpan && textSpan.style.textDecoration === "line-through";
        const isDueDateCompleted = dueDateSpan && dueDateSpan.style.textDecoration === "line-through";

        return isTextCompleted && isDueDateCompleted;
    }

    // Helper function to extract the due date from text in the format "(Due: YYYY-MM-DD)"
    function extractDueDate(dueDateText) {
        const dueDateMatch = dueDateText.match(/\(Due: (\d{4}-\d{2}-\d{2})\)/);
        if (dueDateMatch && dueDateMatch[1]) {
            return dueDateMatch[1]; // Return the extracted due date string in YYYY-MM-DD format
        }
        return null;
    }

    // Helper function to process a list of tasks (todo or priority)
    function processTaskList(taskList) {
        for (const task of taskList) {
            const dueDateSpan = task.querySelector("span.due-date");

            if (dueDateSpan) {
                const dueDate = extractDueDate(dueDateSpan.textContent.trim()); // Extract the correct due date
                if (!dueDate) continue; // Skip if due date could not be extracted

                // Check if the task is completed
                if (isTaskCompleted(task)) {
                    continue; // Skip this task if it is completed
                }

                const dueDateObj = new Date(dueDate); // Convert the due date string to a Date object

                // Check if the task is due today
                if (dueDate === todayString) {
                    tasksDueToday++;
                } else {
                    // Add upcoming tasks to the array as {date, element} object
                    upcomingTasks.push({
                        dueDateObj: dueDateObj, // Date object for comparison
                        rawDueDate: dueDate // Original string for display
                    });
                }
            }
        }
    }

    // Process both To-Do and Priority lists
    processTaskList(todoList);
    // processTaskList(priorityList);

    // Show notification and update the message if there are tasks due today
    if (tasksDueToday > 0) {
        const message = `You have ${tasksDueToday} tasks due today!`;
        showNotification(message);
        dueTaskMessageElement.textContent = message; // Update the message in the p element
    } else {
        // Sort upcoming tasks based on their Date objects (ascending order)
        upcomingTasks.sort((a, b) => a.dueDateObj - b.dueDateObj);

        // Check for the nearest upcoming task
        if (upcomingTasks.length > 0) {
            const nearestTask = upcomingTasks[0]; // Get the task with the nearest due date
            const nearestDate = nearestTask.rawDueDate; // Get the original string of the nearest due date
            const countForNearestDate = upcomingTasks.filter(task => task.rawDueDate === nearestDate).length;
            const message = `You have ${countForNearestDate} tasks due on ${nearestDate}.`;
            showNotification(message);
            dueTaskMessageElement.textContent = message; // Update the message in the p element
        } else {
            const message = `You have no tasks due soon.`;
            showNotification(message);
            dueTaskMessageElement.textContent = message; // Update the message in the p element
        }
    }
}






// Helper function to get today's date in the correct local format (YYYY-MM-DD)
function getLocalDateString() {
    const today = new Date();

    // Correct the time zone by explicitly setting local hours
    today.setMinutes(today.getMinutes() - today.getTimezoneOffset());

    // Return date in YYYY-MM-DD format
    return today.toISOString().split('T')[0];
}

// Set today's date as the minimum selectable date for the due date inputs
function setMinDate() {
    const todayString = getLocalDateString(); // Get corrected local date string
    document.getElementById('new-todo-due').setAttribute('min', todayString);
    document.getElementById('new-priority-due').setAttribute('min', todayString);
    const dateInput = document.querySelector('input[type="date"]');
    dateInput.setAttribute('min', todayString);
}
// Call the function when the page loads
window.onload = setMinDate;


// Function to sort To-Do items by most recent date
function sortTodosByDate() {
    const todoList = document.getElementById('todo-list');
    const todoItems = Array.from(todoList.getElementsByTagName('li'));

    // Sort items by due date
    todoItems.sort((a, b) => {
        const aDateMatch = a.textContent.match(/\(Due: (\d{4}-\d{2}-\d{2})\)/);
        const bDateMatch = b.textContent.match(/\(Due: (\d{4}-\d{2}-\d{2})\)/);

        if (aDateMatch && bDateMatch) {
            const aDate = new Date(aDateMatch[1]);
            const bDate = new Date(bDateMatch[1]);

            // Sort by most recent date at the top (descending order)
            // return bDate - aDate;
            // Sort by most late date at the bottom (ascending order)
            return aDate - bDate;
        }
        return 0;
    });

    // Clear the list and append sorted items
    todoList.innerHTML = '';
    todoItems.forEach(item => todoList.appendChild(item));
}



// Function to restore the original order of To-Do items
function restoreOriginalOrder() {
    const todoList = document.getElementById("todo-list");
    const items = Array.from(todoList.getElementsByTagName("li"));

    items.sort((a, b) => {
        const aOrder = parseInt(a.getAttribute('data-order'), 10);
        const bOrder = parseInt(b.getAttribute('data-order'), 10);
        return aOrder - bOrder; // Sort by original order
    });

    // Re-append items in original order to the list
    items.forEach(item => todoList.appendChild(item));
}

// Handle the checkbox change event
document.getElementById('sort-recent').addEventListener('change', function () {
    if (this.checked) {
        sortTodosByDate();
    } else {
        restoreOriginalOrder();
    }
});


// Function to filter To-Do items based on search input
function filterTodos() {
    const searchValue = document.getElementById("todo-search").value.toLowerCase();
    const todoList = document.getElementById("todo-list").children;

    for (const todo of todoList) {
        const text = todo.querySelector("span").textContent.toLowerCase();
        todo.style.display = text.includes(searchValue) ? "" : "none"; // Show or hide based on match
    }
}

// Function to filter Priority items based on search input
function filterPriorities() {
    const searchValue = document.getElementById("priority-search").value.toLowerCase();
    const priorityList = document.getElementById("priority-list").children;

    for (const priority of priorityList) {
        const text = priority.querySelector("span").textContent.toLowerCase();
        priority.style.display = text.includes(searchValue) ? "" : "none"; // Show or hide based on match
    }
}

// Function to display a notification
function showNotification(message) {
    const notificationContainer = document.getElementById("notification-container");

    // Truncate the message if it is longer than 70 characters
    const truncatedMessage = message.length > 70 ? message.slice(0, 70) + "..." : message;

    // Create a new notification div
    const notification = document.createElement("div");
    notification.classList.add("notification");
    notification.textContent = truncatedMessage;

    // Append the notification to the container
    notificationContainer.appendChild(notification);

    // Set a timeout to remove the notification after 3 seconds
    setTimeout(() => {
        notification.classList.add("hide");
        setTimeout(() => {
            notification.remove();
        }, 500); // Time to allow the fade-out transition to complete
    }, 3000); // Show the notification for 3 seconds
}

// Function to add new To-Do item
let todoCounter = 0; // To keep track of the order of items

function addTodo() {
    const todoList = document.getElementById("todo-list");
    const newTodo = document.getElementById("new-todo").value;
    const dueDateElement = document.getElementById("new-todo-due");

    // Check if the due date element exists
    if (!dueDateElement) {
        console.error("Due date input element not found");
        return;
    }

    const dueDate = dueDateElement.value; // Get the due date

    // if (newTodo.trim() !== "" && dueDate) {
    if (newTodo.trim() !== "") {
        const li = createListItem(newTodo, dueDate);

        // Add data-order attribute to track original order
        li.setAttribute('data-order', todoCounter++);

        // Append the new item to the list
        todoList.appendChild(li);

        // Clear the input fields after adding the item
        document.getElementById("new-todo").value = "";
        dueDateElement.value = ""; // Clear the due date input

        // Display notification
        showNotification(`New To-Do Added: ${newTodo}`);

        // Save to local storage
        saveTodosToLocalStorage();

        updateWeeklyTaskTracker();   // Update the tracker for the current week

        // Update progress chart
        updateProgressChart();

        // Check for tasks due today
        checkTasksDueToday();

        // Update the chart after adding a new task
        updateTodoChart();

        // Sort if checkbox is checked
        if (document.getElementById('sort-recent').checked) {
            sortTodosByDate();
        }
    } else {
        alert("Please provide both a task and a due date.");
    }
}



// Similar function for adding new Priority item
function addPriority() {
    const priorityList = document.getElementById("priority-list");
    const newPriority = document.getElementById("new-priority").value;
    const dueDateElement = document.getElementById("new-priority-due");

    // Check if the due date element exists
    if (!dueDateElement) {
        console.error("Due date input element not found");
        return;
    }

    const dueDate = dueDateElement.value; // Get the due date

    if (newPriority.trim() !== "") {
        const li = createListItem(newPriority, dueDate);
        priorityList.appendChild(li);

        // Clear the input field
        document.getElementById("new-priority").value = "";
        dueDateElement.value = ""; // Clear the due date input

        // Show notification for the new Priority item
        showNotification(`New Priority Added: ${newPriority}`);

        // Save the updated Priority list to local storage
        savePrioritiesToLocalStorage();
    }
}

// Function to create a new list item (for To-Do or Priority)
function createListItem(text, dueDate = "", completed = false) {
    const li = document.createElement("li");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = completed;

    // Toggle line-through effect when checkbox is checked
    // checkbox.onclick = function () {
    //     li.style.textDecoration = checkbox.checked ? "line-through" : "none";
    //     updateProgressChart(); // Update the chart when an item is checked
    //     // Save the updated Priority list to local storage
    //     savePrioritiesToLocalStorage();
    //     saveTodosToLocalStorage();
    //     updateWeeklyTaskTracker();   // Update the tracker for the current week
    //     checkTasksDueToday(); // Check for tasks due today
    //     updateTodoChart();    // update the chart initially and whenever needed
    //     // li = checkbox.checked ? showNotification(`🎉Task Completed Sucessfully👏`) : "none";
    //     showNotification(checkbox.checked ? `🎉Task Completed Successfully👏` : `Task Unmarked`);
    // };
    checkbox.onclick = function () {
        const textSpan = li.querySelector('.todo-text');
        const dueDateSpan = li.querySelector('.due-date');

        // Apply line-through to the task text and due date only
        textSpan.style.textDecoration = checkbox.checked ? "line-through" : "none";
        if (dueDateSpan) {
            dueDateSpan.style.textDecoration = checkbox.checked ? "line-through" : "none";
        }

        updateProgressChart(); // Update the chart when an item is checked
        savePrioritiesToLocalStorage(); // Save the updated Priority list to local storage
        saveTodosToLocalStorage();
        updateWeeklyTaskTracker();   // Update the tracker for the current week
        checkTasksDueToday(); // Check for tasks due today
        updateTodoChart();    // update the chart initially and whenever needed

        showNotification(checkbox.checked ? `🎉Task Completed Successfully👏` : `Task Unmarked`);
    };

    const textSpan = document.createElement("span");
    textSpan.textContent = text;
    textSpan.classList.add("todo-text");

    // Display due date if present
    const dueDateSpan = document.createElement("span");
    if (dueDate) {
        dueDateSpan.textContent = ` (Due: ${dueDate})`;
        dueDateSpan.classList.add("due-date");
    }

    // Store the original span for future use in editing
    li.originalTextSpan = textSpan;
    li.originalDueDateSpan = dueDateSpan;  // Make sure this is set correctly

    // Create edit button
    const editButton = document.createElement("button");
    editButton.className = "edit-btn";
    editButton.innerText = "✎";
    editButton.onclick = function () {
        enterEditMode(li, textSpan, dueDateSpan, editButton);
    };

    const removeButton = document.createElement("button");
    removeButton.className = "remove-btn";
    removeButton.innerText = "✖";
    removeButton.onclick = function () {
        showNotification(`Task Removed: ${text}`)
        li.remove();
        saveTodosToLocalStorage(); // Or savePrioritiesToLocalStorage based on the list
        savePrioritiesToLocalStorage();
        updateWeeklyTaskTracker();   // Update the tracker for the current week
        updateProgressChart(); // Update the chart when an item is deleted
        updateTodoChart();    // update the chart initially and whenever needed
    };

    li.appendChild(checkbox);
    li.appendChild(textSpan);
    li.appendChild(dueDateSpan); // Add due date span to the list item
    li.appendChild(editButton);
    li.appendChild(removeButton);

    // li.style.textDecoration = completed ? "line-through" : "none"; // Apply line-through if completed
    // Apply line-through if the item is already marked as completed
    textSpan.style.textDecoration = completed ? "line-through" : "none";
    if (dueDateSpan) {
        dueDateSpan.style.textDecoration = completed ? "line-through" : "none";
    }

    return li;
}

// Function to enter edit mode
function enterEditMode(li, textSpan, dueDateSpan, editButton) {
    const input = document.createElement("input");
    input.type = "text";
    input.value = textSpan.textContent;
    input.className = "edit-input";

    const todayString = getLocalDateString(); // Get corrected local date string
    const dueDateInput = document.createElement("input");
    dueDateInput.type = "date";
    dueDateInput.setAttribute('min', todayString);
    // dueDateInput.value = dueDateSpan.textContent.replace("Due: ", "") || ""; // Remove "Due: " prefix
    // Pre-fill the date input with the previous date, stripping "Due: " if it exists
    dueDateInput.value = dueDateSpan && dueDateSpan.textContent.includes(" Due: ") ?
        dueDateSpan.textContent.replace(" Due: ", "") : "";
    // dueDateInput.className = "edit-date-input";

    li.replaceChild(input, textSpan);
    // li.replaceChild(dueDateInput, dueDateSpan);
    if (dueDateSpan) {
        li.replaceChild(dueDateInput, dueDateSpan);
    }
    editButton.innerText = "✔️";

    let enterPressed = false;

    input.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            event.preventDefault(); // Prevent default behavior
            dueDateInput.focus(); // Move focus to due date input
            // enterPressed = true;
            // saveEditedItem(li, input, dueDateInput, editButton);
            document.removeEventListener("click", outsideClickListener); // Remove listener after saving
        }
    });

    dueDateInput.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            enterPressed = true;
            saveEditedItem(li, input, dueDateInput, editButton);
            document.removeEventListener("click", outsideClickListener); // Remove listener after saving
        }
    });

    // Click outside to save changes
    function outsideClickListener(event) {
        // Only save if the click happens outside the current "li" element
        if (!li.contains(event.target)) {
            saveEditedItem(li, input, dueDateInput, editButton);
            document.removeEventListener("click", outsideClickListener); // Remove listener after saving
        }
    }

    // Attach the outside click listener to the document
    document.addEventListener("click", outsideClickListener);

    // Prevent immediate save when clicking inside date input
    dueDateInput.addEventListener("click", function (event) {
        event.stopPropagation(); // Stop the click event from bubbling up
    });

    input.focus();
}

// Function to save the edited item
function saveEditedItem(li, input, dueDateInput, editButton) {
    const textSpan = li.originalTextSpan;
    const dueDateSpan = li.originalDueDateSpan;

    // Update the text and due date spans with the new values
    textSpan.textContent = input.value.trim() || "Untitled";
    textSpan.classList.add("todo-text");
    // Check if the due date input is empty, if so, retain the original value
    // dueDateSpan.textContent = dueDateInput.value ? `Due: ${dueDateInput.value}` : "";
    const newDueDate = dueDateInput.value.trim() || dueDateSpan.textContent.replace(" Due: ", ""); // Preserve old date if no new date entered
    dueDateSpan.classList.add("due-date");

    // Update the due date span with the new value, avoid adding "Due:" twice
    if (dueDateSpan) {
        dueDateSpan.textContent = newDueDate ? `${newDueDate}` : "";
    }

    // Replace the input fields with the updated spans
    li.replaceChild(textSpan, input);
    // li.replaceChild(dueDateSpan, dueDateInput);
    if (dueDateSpan) {
        li.replaceChild(dueDateSpan, dueDateInput); // Replace due date input with span
    }
    editButton.innerText = "✎"; // Switch back to edit button

    // Re-enable editing functionality
    editButton.onclick = function () {
        enterEditMode(li, textSpan, dueDateSpan, editButton);
    };

    // Save the updated Priority list to local storage
    savePrioritiesToLocalStorage();
    saveTodosToLocalStorage();
    updateProgressChart();
    getOverDueDataForGraph()
    updateTodoChart()
    updateWeeklyTaskTracker();   // Update the tracker for the current week
    checkTasksDueToday(); // Check for tasks due today
}















// Function to save To-Do list to local storage
function saveTodosToLocalStorage() {
    const todoList = document.getElementById("todo-list");
    const todos = [];

    todoList.querySelectorAll("li").forEach(item => {
        const taskTextElement = item.querySelector("span.todo-text");
        const dueDateElement = item.querySelector("span.due-date");

        // If task text exists, proceed, otherwise skip the item
        if (taskTextElement) {
            const taskText = taskTextElement.textContent;
            const dueDateText = dueDateElement ? dueDateElement.textContent : "";
            const checkbox = item.querySelector("input[type='checkbox']").checked;
            const dueDate = dueDateText ? dueDateText.replace(" (Due: ", "").replace(")", "") : "";
            const dataOrder = item.getAttribute("data-order") || ""; // Get the data-order attribute

            todos.push({ text: taskText, dueDate: dueDate, completed: checkbox, order: dataOrder });
        }
    });

    localStorage.setItem("todos", JSON.stringify(todos));
}


// Function to save Priority list to local storage
// function savePrioritiesToLocalStorage() {
//     const priorityList = document.getElementById("priority-list");
//     const priorities = [];

//     priorityList.querySelectorAll("li").forEach(item => {
//         const taskTextElement = item.querySelector("span.todo-text");
//         const dueDateElement = item.querySelector("span.due-date");

//         // If task text exists, proceed, otherwise skip the item
//         if (taskTextElement) {
//             const taskText = taskTextElement.textContent;
//             const dueDateText = dueDateElement ? dueDateElement.textContent : "";
//             const checkbox = item.querySelector("input[type='checkbox']").checked;
//             const dueDate = dueDateText ? dueDateText.replace(" (Due: ", "").replace(")", "") : "";

//             // priorities.push({ text: taskText, dueDate: dueDate, completed: checkbox });
//             priorities.push({ text: taskText, dueDate: dueDate, completed: checkbox});
//         }
//     });

//     localStorage.setItem("priorities", JSON.stringify(priorities));
// }

function savePrioritiesToLocalStorage() {
    const priorityList = document.getElementById("priority-list");
    const priorities = [];

    priorityList.querySelectorAll("li").forEach((item, index) => {
        const taskTextElement = item.querySelector("span.todo-text");
        const dueDateElement = item.querySelector("span.due-date");

        // If task text exists, proceed, otherwise skip the item
        if (taskTextElement) {
            const taskText = taskTextElement.textContent;
            const dueDateText = dueDateElement ? dueDateElement.textContent : "";
            const checkbox = item.querySelector("input[type='checkbox']").checked;
            const dueDate = dueDateText ? dueDateText.replace(" (Due: ", "").replace(")", "") : "";

            // Push the item with its order index
            priorities.push({ text: taskText, dueDate: dueDate, completed: checkbox, order: index });
        }
    });

    // Store the priorities array in local storage
    localStorage.setItem("priorities", JSON.stringify(priorities));
}



// Function to save Notes to local storage
function saveNotesToLocalStorage() {
    const notes = document.querySelector(".notes textarea").value;
    localStorage.setItem("notes", notes);
}

// Function to save Reminder to local storage
function saveReminderToLocalStorage() {
    const reminder = document.querySelector(".reminder textarea").value;
    localStorage.setItem("reminder", reminder);
}



document.addEventListener("DOMContentLoaded", function () {
    const priorityList = document.getElementById("priority-list");

    const sortable = new Sortable(priorityList, {
        animation: 150, // Animation speed in milliseconds

        onEnd: function (evt) {
            // Save the new order to local storage after drag-and-drop reordering
            saveOrderToLocalStorage();
        }
    });
});

// Function to save the new order of priority items to local storage
function saveOrderToLocalStorage() {
    const priorityList = document.getElementById("priority-list");
    const priorities = [];

    // Loop through each list item in the priority list
    priorityList.querySelectorAll("li").forEach((item, index) => {
        const taskTextElement = item.querySelector("span.todo-text");
        const dueDateElement = item.querySelector("span.due-date");

        // If task text exists, proceed, otherwise skip the item
        if (taskTextElement) {
            const taskText = taskTextElement.textContent;
            const dueDateText = dueDateElement ? dueDateElement.textContent : "";
            const checkbox = item.querySelector("input[type='checkbox']").checked;
            const dueDate = dueDateText ? dueDateText.replace(" (Due: ", "").replace(")", "") : "";

            // Save the order along with the task details
            priorities.push({
                text: taskText,
                dueDate: dueDate,
                completed: checkbox,
                order: index // Store the new order based on the current index
            });
        }
    });

    // Save the updated priorities array to local storage
    localStorage.setItem("priorities", JSON.stringify(priorities));
}





// Function to load data from local storage
function loadDataFromLocalStorage() {
    const savedTodos = JSON.parse(localStorage.getItem("todos") || "[]");
    const savedPriorities = JSON.parse(localStorage.getItem("priorities") || "[]");
    const savedNotes = localStorage.getItem("notes") || "";
    const savedReminder = localStorage.getItem("reminder") || "";

    // Load To-Do items
    const todoList = document.getElementById("todo-list");
    savedTodos.forEach(todo => {
        const li = createListItem(todo.text, todo.dueDate, todo.completed); // Correctly access 'text' property
        // li.querySelector("input[type='checkbox']").checked = todo.completed;
        // li.style.textDecoration = todo.completed ? "line-through" : "none";
        const checkbox = li.querySelector("input[type='checkbox']");
        const textSpan = li.querySelector(".todo-text");
        const dueDateSpan = li.querySelector(".due-date");

        // Apply completed state based on local storage data
        checkbox.checked = todo.completed;
        textSpan.style.textDecoration = todo.completed ? "line-through" : "none";
        if (dueDateSpan) {
            dueDateSpan.style.textDecoration = todo.completed ? "line-through" : "none";
        }

        if (todo.order) {
            li.setAttribute("data-order", todo.order); // Restore the data-order attribute
        }
        todoList.appendChild(li);
    });

    // Load Priority items
    const priorityList = document.getElementById("priority-list");
    // savedPriorities.forEach(priority => {
    //     const li = createListItem(priority.text, priority.dueDate, priority.completed);
    //     // li.querySelector("input[type='checkbox']").checked = priority.completed;
    //     // li.style.textDecoration = priority.completed ? "line-through" : "none";
    //     const checkbox = li.querySelector("input[type='checkbox']");
    //     const textSpan = li.querySelector(".todo-text");
    //     const dueDateSpan = li.querySelector(".due-date");

    //     // Apply completed state based on local storage data
    //     checkbox.checked = priority.completed;
    //     textSpan.style.textDecoration = priority.completed ? "line-through" : "none";
    //     if (dueDateSpan) {
    //         dueDateSpan.style.textDecoration = priority.completed ? "line-through" : "none";
    //     }
    //     priorityList.appendChild(li);
    // });

    // Clear the current list to prevent duplicates when reloading
    priorityList.innerHTML = '';

    // Sort priorities by their order before loading
    savedPriorities.sort((a, b) => a.order - b.order); // Sort based on the stored order

    savedPriorities.forEach(priority => {
        const li = createListItem(priority.text, priority.dueDate, priority.completed);

        // Access the checkbox, text span, and due date span
        const checkbox = li.querySelector("input[type='checkbox']");
        const textSpan = li.querySelector(".todo-text");
        const dueDateSpan = li.querySelector(".due-date");

        // Apply completed state based on local storage data
        checkbox.checked = priority.completed;
        textSpan.style.textDecoration = priority.completed ? "line-through" : "none";

        if (dueDateSpan) {
            dueDateSpan.style.textDecoration = priority.completed ? "line-through" : "none";
        }

        // Set the order attribute for maintaining the drag-and-drop order
        li.setAttribute("data-order", priority.order);

        // Append the list item to the priority list
        priorityList.appendChild(li);
    });

    // Load Notes and Reminder
    document.querySelector(".notes textarea").value = savedNotes;
    document.querySelector(".reminder textarea").value = savedReminder;

    // Show the reminder in a notification if it exists
    if (savedReminder.trim() !== "") {
        showNotification(`Reminder: ${savedReminder}`);
    }

    // Update the progress chart after loading data
    updateProgressChart();
    // checkTasksDueToday(); // Check for tasks due today
    updateTodoChart();    // update the chart initially and whenever needed
}




// Function to export current data to JSON and download it as a file
function exportData() {
    const todos = JSON.parse(localStorage.getItem("todos") || "[]");
    const priorities = JSON.parse(localStorage.getItem("priorities") || "[]");
    const notes = localStorage.getItem("notes") || "";
    const reminder = localStorage.getItem("reminder") || "";

    // Prepare a JSON object with the current data
    const data = {
        todos,
        priorities,
        notes,
        reminder
    };

    // Convert the object to a JSON string
    const dataStr = JSON.stringify(data, null, 2);

    // Create a Blob object for the JSON data
    const blob = new Blob([dataStr], { type: "application/json" });

    // Create a download link and trigger a download
    const downloadLink = document.createElement("a");
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = "todo_data.json";

    // Append the link, trigger click, and remove the link
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);

    // Notify the user that export was successful
    showNotification("Data exported successfully!");
}

// Function to import data from a JSON file
function importData(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            try {
                const importedData = JSON.parse(e.target.result);

                // Update local storage with the imported data
                localStorage.setItem("todos", JSON.stringify(importedData.todos || []));
                localStorage.setItem("priorities", JSON.stringify(importedData.priorities || []));
                localStorage.setItem("notes", importedData.notes || "");
                localStorage.setItem("reminder", importedData.reminder || "");

                // Reload the UI with the imported data
                loadDataFromLocalStorage();

                // Notify the user that import was successful
                showNotification("Data imported successfully!");

            } catch (error) {
                showNotification("Error importing data. Please make sure the file is correct.");
            }
        };

        reader.readAsText(file);
    }
}

document.addEventListener('DOMContentLoaded', (event) => {
    const toggleSwitch = document.getElementById('colorModeSelect');
    const currentMode = localStorage.getItem('colorMode') || 'light';

    // Apply the current mode
    document.body.classList.add(currentMode + '-mode');

    // Set the toggle switch based on the current mode
    toggleSwitch.checked = currentMode === 'dark';

    toggleSwitch.addEventListener('change', () => {
        let mode = toggleSwitch.checked ? 'dark' : 'light';

        // Remove the previous mode class
        document.body.classList.remove('light-mode', 'dark-mode');

        // Add the new mode class
        document.body.classList.add(mode + '-mode');

        // Store the current mode in local storage
        localStorage.setItem('colorMode', mode);
    });
});

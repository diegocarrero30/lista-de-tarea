// ==========================================
// 1. SIMULACIÓN DE BASE DE DATOS Y ESTADO
// ==========================================
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentFilter = 'all';

// Elementos del DOM
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const taskList = document.getElementById('task-list');
const totalCount = document.getElementById('total-count');
const completedCount = document.getElementById('completed-count');
const emptyState = document.getElementById('empty-state');
const themeToggle = document.getElementById('theme-toggle');
const filterButtons = document.querySelectorAll('.filter-btn');

// ==========================================
// 2. FUNCIONES DE BASE DE DATOS (LOCALSTORAGE)
// ==========================================
function saveToLocalStorage() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// ==========================================
// 3. RENDERIZADO Y ACTUALIZACIÓN DE INTERFAZ
// ==========================================
function renderTasks() {
    taskList.innerHTML = '';

    // Filtrar tareas según el filtro seleccionado
    const filteredTasks = tasks.filter(task => {
        if (currentFilter === 'pending') return !task.completed;
        if (currentFilter === 'completed') return task.completed;
        return true;
    });

    // Estado vacío
    if (filteredTasks.length === 0) {
        emptyState.classList.remove('hidden');
    } else {
        emptyState.classList.add('hidden');
    }

    filteredTasks.forEach((task) => {
        const li = document.createElement('li');
        li.className = `task-item ${task.completed ? 'completed' : ''}`;
        li.dataset.id = task.id;

        li.innerHTML = `
            <div class="task-content">
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} onclick="toggleTask(${task.id})">
                <span class="task-text">${escapeHTML(task.text)}</span>
            </div>
            <div class="task-actions">
                <button class="btn-action btn-edit" onclick="editTask(${task.id})" title="Editar"><i class="fa-solid fa-pen"></i></button>
                <button class="btn-action btn-delete" onclick="deleteTask(${task.id})" title="Eliminar"><i class="fa-solid fa-trash"></i></button>
            </div>
        `;
        taskList.appendChild(li);
    });

    updateCounters();
}

// Actualizar contadores
function updateCounters() {
    totalCount.textContent = tasks.length;
    completedCount.textContent = tasks.filter(t => t.completed).length;
}

// Prevenir ataques XSS básicos al mostrar texto
function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
}

// ==========================================
// 4. FUNCIONALIDADES CRUD DE TAREAS
// ==========================================

// Agregar tarea
taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = taskInput.value.trim();
    if (!text) return;

    const newTask = {
        id: Date.now(),
        text: text,
        completed: false
    };

    tasks.push(newTask);
    saveToLocalStorage();
    renderTasks();
    taskInput.value = '';
});

// Confirmar / Marcar tarea como completada (Check)
function toggleTask(id) {
    tasks = tasks.map(task => {
        if (task.id === id) {
            return { ...task, completed: !task.completed };
        }
        return task;
    });
    saveToLocalStorage();
    renderTasks();
}

// Eliminar tarea
function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    saveToLocalStorage();
    renderTasks();
}

// Editar tarea (Transforma el texto en un input editable inline)
function editTask(id) {
    const taskItem = document.querySelector(`[data-id="${id}"]`);
    const taskContent = taskItem.querySelector('.task-content');
    const taskTextSpan = taskItem.querySelector('.task-text');
    const taskActions = taskItem.querySelector('.task-actions');
    
    const currentText = taskTextSpan.textContent;

    // Reemplazar texto por input
    taskTextSpan.outerHTML = `<input type="text" class="task-input-edit" value="${currentText}" id="input-edit-${id}">`;
    
    // Cambiar botón de editar por botón de guardar
    taskActions.innerHTML = `
        <button class="btn-action btn-save" onclick="saveEditedTask(${id})" title="Guardar"><i class="fa-solid fa-check"></i></button>
        <button class="btn-action btn-delete" onclick="renderTasks()" title="Cancelar"><i class="fa-solid fa-xmark"></i></button>
    `;

    const inputEdit = document.getElementById(`input-edit-${id}`);
    inputEdit.focus();
    inputEdit.setSelectionRange(inputEdit.value.length, inputEdit.value.length);

    // Guardar también presionando Enter
    inputEdit.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            saveEditedTask(id);
        }
    });
}

// Guardar tarea editada
function saveEditedTask(id) {
    const inputEdit = document.getElementById(`input-edit-${id}`);
    const newText = inputEdit.value.trim();

    if (!newText) return;

    tasks = tasks.map(task => {
        if (task.id === id) {
            return { ...task, text: newText };
        }
        return task;
    });

    saveToLocalStorage();
    renderTasks();
}

// ==========================================
// 5. FILTROS Y MODO CLARO / OSCURO
// ==========================================

// Filtros de navegación secundaria
filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        renderTasks();
    });
});

// Toggle Modo Claro / Oscuro con persistencia
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const icon = themeToggle.querySelector('i');
    
    if (document.body.classList.contains('dark-mode')) {
        icon.classList.replace('fa-moon', 'fa-sun');
        localStorage.setItem('theme', 'dark');
    } else {
        icon.classList.replace('fa-sun', 'fa-moon');
        localStorage.setItem('theme', 'light');
    }
});

// Cargar preferencia de tema guardada al iniciar
window.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        themeToggle.querySelector('i').classList.replace('fa-moon', 'fa-sun');
    }
    renderTasks();
});
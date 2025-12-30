// Todo App - Pure JavaScript Implementation

class TodoApp {
    constructor() {
        this.todos = this.loadTodos();
        this.currentFilter = 'all';

        // DOM Elements
        this.form = document.getElementById('todo-form');
        this.input = document.getElementById('todo-input');
        this.list = document.getElementById('todo-list');
        this.countEl = document.getElementById('todo-count');
        this.clearBtn = document.getElementById('clear-completed');
        this.filterBtns = document.querySelectorAll('.filter-btn');

        this.bindEvents();
        this.render();
    }

    // LocalStorageからTodoを読み込み
    loadTodos() {
        const stored = localStorage.getItem('todos');
        return stored ? JSON.parse(stored) : [];
    }

    // LocalStorageにTodoを保存
    saveTodos() {
        localStorage.setItem('todos', JSON.stringify(this.todos));
    }

    // イベントをバインド
    bindEvents() {
        // フォーム送信
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTodo();
        });

        // 完了済み削除
        this.clearBtn.addEventListener('click', () => {
            this.clearCompleted();
        });

        // フィルターボタン
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.setFilter(btn.dataset.filter);
            });
        });
    }

    // 新しいTodoを追加
    addTodo() {
        const text = this.input.value.trim();
        if (!text) return;

        const todo = {
            id: Date.now(),
            text: text,
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.todos.unshift(todo);
        this.saveTodos();
        this.render();
        this.input.value = '';
        this.input.focus();
    }

    // Todoを削除
    deleteTodo(id) {
        this.todos = this.todos.filter(todo => todo.id !== id);
        this.saveTodos();
        this.render();
    }

    // Todoの完了状態を切り替え
    toggleTodo(id) {
        const todo = this.todos.find(todo => todo.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveTodos();
            this.render();
        }
    }

    // 完了済みを削除
    clearCompleted() {
        this.todos = this.todos.filter(todo => !todo.completed);
        this.saveTodos();
        this.render();
    }

    // フィルターを設定
    setFilter(filter) {
        this.currentFilter = filter;
        this.filterBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
        this.render();
    }

    // フィルター済みのTodoを取得
    getFilteredTodos() {
        switch (this.currentFilter) {
            case 'active':
                return this.todos.filter(todo => !todo.completed);
            case 'completed':
                return this.todos.filter(todo => todo.completed);
            default:
                return this.todos;
        }
    }

    // カウントを更新
    updateCount() {
        const activeCount = this.todos.filter(todo => !todo.completed).length;
        const totalCount = this.todos.length;
        this.countEl.textContent = `${activeCount} / ${totalCount} 件のタスク`;
    }

    // Todo項目のHTML要素を作成
    createTodoElement(todo) {
        const li = document.createElement('li');
        li.className = `todo-item${todo.completed ? ' completed' : ''}`;
        li.dataset.id = todo.id;

        li.innerHTML = `
            <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''}>
            <span class="todo-text">${this.escapeHtml(todo.text)}</span>
            <button class="todo-delete" aria-label="削除">✕</button>
        `;

        // チェックボックスイベント
        const checkbox = li.querySelector('.todo-checkbox');
        checkbox.addEventListener('change', () => {
            this.toggleTodo(todo.id);
        });

        // 削除ボタンイベント
        const deleteBtn = li.querySelector('.todo-delete');
        deleteBtn.addEventListener('click', () => {
            this.deleteTodo(todo.id);
        });

        return li;
    }

    // HTMLエスケープ（XSS対策）
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // UIを描画
    render() {
        const filteredTodos = this.getFilteredTodos();

        // リストをクリア
        this.list.innerHTML = '';

        if (filteredTodos.length === 0) {
            const emptyMsg = document.createElement('li');
            emptyMsg.className = 'empty-message';
            emptyMsg.textContent = this.currentFilter === 'all'
                ? 'タスクがありません。新しいタスクを追加しましょう！'
                : this.currentFilter === 'active'
                    ? '未完了のタスクはありません'
                    : '完了したタスクはありません';
            this.list.appendChild(emptyMsg);
        } else {
            filteredTodos.forEach(todo => {
                this.list.appendChild(this.createTodoElement(todo));
            });
        }

        this.updateCount();
    }
}

// アプリを起動
document.addEventListener('DOMContentLoaded', () => {
    new TodoApp();
});

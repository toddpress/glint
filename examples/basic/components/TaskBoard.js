import {
  define,
  html,
  each,
  when,
  match,
  model,
  createStateContainer,
} from '../../../src';

define('tsp-task-board', (ctx) => {
  const { props, emit, onMount, onDestroy, effect } = ctx;

  // ----------------------------------------------------------
  // Model ownership

  const createTaskBoard = model.owned(taskBoardModel);
  const board = createTaskBoard(ctx);

  board.init(props.initialTasks ?? []);

  // ----------------------------------------------------------
  // Diagnostics

  onMount(() => {
    console.log('[TaskBoard] mounted');
  });

  onDestroy(() => {
    console.log('[TaskBoard] destroyed');
  });

  effect(() => {
    console.log('Filter changed:', board.filter());
  });

  effect(() => {
    console.log('Tasks updated:', board.taskCount());
  });

  // ----------------------------------------------------------
  // Events

  function addTask() {
    const result = board.addTask();
    if (result) emit('added', result);
  }

  // ----------------------------------------------------------
  // View

  return html`
    <div class="taskboard" style="font-family: system-ui; padding: 0.5rem;">

      <header style="margin-bottom: 1rem;">
        <h2>${props.title ?? 'Tasks'}</h2>

        <div style="display: flex; gap: 0.5rem; margin: 0.5rem 0;">
          ${each(['all', 'active', 'completed'], (id) => id, (f) => html`
            <button
              onclick=${() => board.filter(f)}
              style="
                padding: 0.25rem 0.5rem;
                background: ${board.filter() === f ? '#333' : '#eee'};
                color: ${board.filter() === f ? 'white' : 'black'};
                border: none;
                border-radius: 3px;
              "
            >
              ${f}
            </button>
          `)}
        </div>

        <input
          :value=${board.nameFilter}
          oninput=${(e) => board.nameFilter(e.target.value)}
          placeholder="Filter by name..."
          style="padding: 0.25rem 0.5rem; width: 100%;"
        />
      </header>

      <section style="margin-bottom: 1rem;">
        <input
          :value=${board.newText}
          oninput=${(e) => board.newText(e.target.value)}
          placeholder="New task..."
        />
        <button onclick=${addTask} style="margin-left: 0.5rem;">
          Add
        </button>
      </section>

      <ul style="list-style: none; padding: 0; margin: 0;">
        ${each(board.filtered, ({ id }) => id, (task) => html`
            <li style="display: flex; align-items: center; margin-bottom: 0.5rem;">
              <label style="flex: 1; display: flex; gap: 0.5rem;">
                <input
                  type="checkbox"
                  :checked=${task.completed}
                  onchange=${() => board.toggleTask(task.id)}
                />
                <span style="text-decoration:${task.completed ? 'line-through' : 'none'};">
                  ${task.text}
                </span>
              </label>

              ${when(!task.completed, () => html`
                <button
                  onclick=${() => board.removeTask(task.id)}
                  style="
                    background: #c00;
                    color: white;
                    border: none;
                    padding: 0.25rem 0.5rem;
                    border-radius: 3px;
                  "
                >
                  ✕
                </button>
              `)}
            </li>
          `
        )}
      </ul>

      ${match(board.taskCount, {
        0: () => html`<p>No tasks yet.</p>`,
        default: () => html`<p>${board.taskCount} total tasks</p>`,
      })}
    </div>
  `;
});

export const taskBoardModel = model(() => {
  const state = createStateContainer();

  // ----------------------------------------------------------
  // State

  const tasks = state.signal([]);
  const filter = state.signal('all'); // 'all' | 'active' | 'completed'
  const nameFilter = state.signal('');
  const newText = state.signal('');
  const nextId = state.signal(1);

  // ----------------------------------------------------------
  // Derived

  const filtered = state.computed(() => {
    const f = filter();
    const nf = nameFilter().toLowerCase();

    return tasks().filter((t) => {
      const matchesStatus =
        f === 'all'
          ? true
          : f === 'active'
            ? !t.completed
            : t.completed;

      const matchesName =
        nf === '' || t.text.toLowerCase().includes(nf);

      return matchesStatus && matchesName;
    });
  });

  const taskCount = state.computed(() => tasks().length);

  // ----------------------------------------------------------
  // Lifecycle / initialization

  function init(initialTasks = []) {
    tasks(initialTasks);
    nextId(initialTasks.length + 1);
  }

  // ----------------------------------------------------------
  // Actions

  function addTask() {
    const text = newText().trim();
    if (!text) return;

    const id = nextId();
    tasks([...tasks(), { id, text, completed: false }]);
    nextId(id + 1);
    newText('');

    return { id, text };
  }

  function toggleTask(id) {
    tasks(
      tasks().map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t
      )
    );
  }

  function removeTask(id) {
    tasks(tasks().filter((t) => t.id !== id));
  }

  return {
    // lifecycle
    init,

    // state
    tasks,
    filter,
    nameFilter,
    newText,

    // derived
    filtered,
    taskCount,

    // actions
    addTask,
    toggleTask,
    removeTask,
  };
});

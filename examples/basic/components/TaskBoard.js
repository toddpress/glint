import { define, html, each, when, match } from '../../../src';

export const TaskBoard = define('tsp-task-board', (ctx) => {
  const { props, state, emit, onMount, onDestroy, effect } = ctx;

  const { nameFilter } = state({
    nameFilter: ''
  });

  const tasks = state.signal(props.initialTasks ?? []);
  const filter = state.signal('all'); // 'all' | 'active' | 'completed'
  const newText = state.signal('');
  const nextId = state.signal(1);

  const filtered = state.computed(() => {
    const f = filter();
    const nf = nameFilter().toLowerCase();
    return tasks().filter((t) => {
      const matchesFilter =
        f === 'all'
          ? true
          : f === 'active'
          ? !t.completed
          : t.completed;

      const matchesName =
        nf === '' || t.text.toLowerCase().includes(nf);

      return matchesFilter && matchesName;
    });
  });

  const taskCount = state.computed(() => tasks().length);

  function addTask() {
    const text = newText().trim();
    if (!text) return;

    const id = nextId();
    tasks([...tasks(), { id, text, completed: false }]);
    nextId(id + 1);
    newText('');

    emit('added', { id, text });
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

  onMount(() => {
    console.log('[TaskBoard] mounted');
  });

  onDestroy(() => {
    console.log('[TaskBoard] destroyed');
  });

  effect(() => {
    console.log('Filter changed:', filter());
  });

  effect(() => {
    console.log('Tasks updated:', tasks().length);
  });

  return html`
    <div class="taskboard" style="font-family: system-ui; padding: 0.5rem;">

      <header class="header" style="margin-bottom: 1rem;">
        <h2>${props.title ?? "Tasks"}</h2>

        <div class="filters" style="display:flex; gap:0.5rem; margin:0.5rem 0;">
          ${['all', 'active', 'completed'].map(
            (f) => html`
              <button
                onclick=${() => filter(f)}
                style="
                  padding: 0.25rem 0.5rem;
                  background: ${filter() === f ? "#333" : "#eee"};
                  color: ${filter() === f ? "white" : "black"};
                  border: none;
                  border-radius: 3px;
                "
              >
                ${f}
              </button>
            `
          )}
        </div>

        <input
          :value=${nameFilter}
          oninput=${(e) => nameFilter(e.target.value)}
          placeholder="Filter by name..."
          style="padding:0.25rem 0.5rem; width: 100%;"
        />
      </header>

      <section class="new-task" style="margin-bottom:1rem;">
        <input
          :value=${newText}
          oninput=${(e) => newText(e.target.value)}
          placeholder="New task..."
          style="padding:0.25rem 0.5rem;"
        />
        <button onclick=${addTask} style="margin-left:0.5rem;">Add</button>
      </section>

      <ul class="tasks" style="list-style:none; padding:0; margin:0;">
        ${each(
          filtered,
          (task) => html`
            <li class="task" style="display:flex; align-items:center; margin-bottom:0.5rem;">
              <label style="flex:1; display:flex; align-items:center; gap:0.5rem;">
                <input
                  type="checkbox"
                  :checked=${task.completed}
                  onchange=${() => toggleTask(task.id)}
                />
                <span style="text-decoration:${task.completed ? "line-through" : "none"};">
                  ${task.text}
                </span>
              </label>

              ${when(!task.completed, () => html`
                <button
                  onclick=${() => removeTask(task.id)}
                  style="
                    background:#c00;
                    color:white;
                    border:none;
                    padding:0.25rem 0.5rem;
                    border-radius:3px;
                  "
                >
                  ✕
                </button>
              `)}
            </li>
          `
        )}
      </ul>

      ${match(taskCount, {
        0: () => html`<p class="empty">No tasks yet.</p>`,
        default: () =>
          html`<p class="count">${taskCount} total tasks</p>`
      })}

    </div>
  `;
});

export default TaskBoard;

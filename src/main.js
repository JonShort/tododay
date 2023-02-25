const { invoke } = window.__TAURI__.tauri;

let todoInputEl;
let todoMsgEl;

async function addTodo() {
  // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
  todoMsgEl.textContent = await invoke("add_todo", { todo: todoInputEl.value });
}

window.addEventListener("DOMContentLoaded", () => {
  todoInputEl = document.querySelector("#todo-input");
  todoMsgEl = document.querySelector("#todo-msg");

  document
    .querySelector("#todo-form")
    .addEventListener("submit", (ev) => {
      ev.preventDefault();
      addTodo();
    });
});

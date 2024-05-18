"use strict";
// 配列とインデックスアクセス型を使用したユニオン型の作成
const TASK_STATUS = ["todo", "working", "done"]; // readonly
/**
 * フォームの制御を行います。
 */
class TaskForm {
    element;
    titleInputEl;
    descriptionInputEl;
    constructor() {
        // form要素を取得
        this.element = document.querySelector("#task-form");
        // input要素を取得
        this.titleInputEl = document.querySelector("#form-title");
        this.descriptionInputEl = document.querySelector("#form-description");
        // イベントリスナを設定
        this.bindEvents();
    }
    makeNewTask() {
        return {
            // status: TASK_STATUS[0],
            title: this.titleInputEl.value,
            description: this.descriptionInputEl.value,
        };
    }
    clearInputs() {
        this.titleInputEl.value = "";
        this.descriptionInputEl.value = "";
    }
    submitHandler(event) {
        event.preventDefault(); // ブラウザのデフォルトの動作をキャンセル
        // Taskオブジェクトの生成
        const task = this.makeNewTask();
        // TaskItemインスタンスを生成
        const item = new TaskItem(task);
        item.mount("#todo");
        this.clearInputs();
    }
    // 入力フォームにイベントリスナを追加
    bindEvents() {
        this.element.addEventListener("submit", this.submitHandler.bind(this));
    }
}
/**
 * template要素からDOMを作成し、ホスト要素に挿入します。
 */
class UIComponent {
    templateEl;
    element;
    constructor(templateId) {
        // ターゲットのtemplate要素を取得
        this.templateEl = document.querySelector(templateId);
        // template要素を複製
        const clone = this.templateEl.content.cloneNode(true);
        // template要素の子要素を取得
        this.element = clone.firstElementChild;
    }
    mount(selector) {
        const targetEl = document.querySelector(selector);
        targetEl.insertAdjacentElement("beforeend", this.element);
    }
}
/**
 * タスクを格納するリストを作成します。
 */
class TaskList extends UIComponent {
    taskStatus;
    constructor(taskStatus) {
        super("#task-list-template");
        this.taskStatus = taskStatus;
        this.setup();
        // this.element.id = `${this.taskStatus}-tasks`;
    }
    setup() {
        this.element.querySelector("h2").textContent = `${this.taskStatus}`;
        // 挿入した要素の子要素のリストにidを設定
        this.element.querySelector("ul").id = `${this.taskStatus}`;
    }
}
/**
 * リストアイテムの作成とイベントリスナを設定します。
 */
class TaskItem extends UIComponent {
    task;
    constructor(_task) {
        super("#task-item-template");
        this.task = _task;
        this.setup();
        // this.elementにイベントリスナを追加する。
        this.bindEvents();
    }
    setup() {
        // 挿入した要素の子要素のリストにidを設定
        this.element.querySelector("h2").textContent = `${this.task.title}`;
        this.element.querySelector("p").textContent = `${this.task.description}`;
    }
    clickHandler() {
        if (!this.element.parentElement)
            return;
        // 1. 自身が所属しているul要素のidを見にいく。
        const currentListId = this.element.parentElement.id;
        const taskStatusIdx = TASK_STATUS.indexOf(currentListId);
        // id が TASK_STATUS に見つからない時（プログラムのバグ）
        if (taskStatusIdx === -1) {
            throw new Error(`タスクステータスが不正です。`);
        }
        // idによって隣のidを決定
        const nextListId = TASK_STATUS[taskStatusIdx + 1];
        if (nextListId) {
            // 2. 隣のidにli要素を挿入
            const nextListEl = document.getElementById(nextListId);
            nextListEl.appendChild(this.element);
            return;
        }
        // もし現在のリストが"done"なら、要素を削除して終了
        this.element.remove();
    }
    bindEvents() {
        this.element.addEventListener("click", this.clickHandler.bind(this));
    }
}
// 入力フォームの生成
new TaskForm();
// タスクリストの生成
TASK_STATUS.forEach((status) => {
    const list = new TaskList(status);
    list.mount("#container");
});

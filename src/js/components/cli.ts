export class CommandLineInterface {
  self: HTMLDivElement
  history: History
  cmdline: CommandLine
  static counter: number

  constructor(cli: HTMLDivElement) {
    this.self = cli
    this.history = new History(
      <HTMLDivElement>cli.getElementsByClassName('xdsh-history')[0]
    )
    this.cmdline = new CommandLine(
      <HTMLDivElement>cli.getElementsByClassName('xdsh-cmdline')[0]
    )
  }

  static newElement(): HTMLDivElement {
    let ele = document.createElement('div')
    ele.className = 'xdsh-cli'
    ele.setAttribute('ID-cli', (CommandLineInterface.counter++).toString())
    ele.appendChild(History.newElement())
    ele.appendChild(CommandLine.newElement())

    return ele
  }
}

class History {
  self: HTMLDivElement

  constructor(history: HTMLDivElement) {
    this.self = history
  }

  append(record: string | Element) {
    this.self.append(record)
  }

  clear() {
    this.self.innerHTML = ''
  }

  static newElement(): HTMLDivElement {
    let ele = document.createElement('div')
    ele.className = "xdsh-history"

    return ele
  }
}

class CommandLine {
  self: HTMLDivElement
  prompt: HTMLSpanElement
  command: HTMLSpanElement
  autoComplete: HTMLSpanElement
  time: HTMLSpanElement

  constructor(cmdline: HTMLDivElement) {
    this.self = cmdline
    this.prompt = <HTMLSpanElement>cmdline.getElementsByClassName('xdsh-cmdline__prompt')[0]
    this.command = <HTMLSpanElement>cmdline.getElementsByClassName('xdsh-cmdline__command')[0]
    this.autoComplete = <HTMLSpanElement>cmdline.getElementsByClassName('xdsh-cmdline__auto-complete')[0]
    this.time = <HTMLSpanElement>cmdline.getElementsByClassName('xdsh-cmdline__time')[0]

    this.command.addEventListener('keypress', (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        event.preventDefault();
      }
    });
    this.autoComplete.onclick = () => {
      this.focus()
    }
    this.setTime()
  }

  focus() {
    let sel: Selection | null = window.getSelection();

    this.command.focus();
    if (sel) {
      sel.selectAllChildren(this.command);
      sel.collapseToEnd();
    }
  }

  getLine(): HTMLDivElement {
    return this.self.cloneNode(true) as HTMLDivElement
  }

  getPrompt(): string {
    return this.prompt.innerText
  }

  setPrompt(text: string) {
    this.prompt.innerHTML = text
  }

  getCommad(): string {
    return this.command.innerText
  }

  setCommand(cmd: string) {
    this.command.innerHTML = cmd
  }

  setTime() {
    let date = new Date()
    this.time.innerHTML = (new Date(
      date.getTime() - date.getTimezoneOffset() * 60000
    )).toISOString().slice(11, 19).replace(/-/g, "/")
  }

  clear() {
    this.command.innerHTML = ''
    this.autoComplete.innerHTML = ''
  }

  static newElement(): HTMLDivElement {
    let ele = document.createElement('div')
    ele.className = "xdsh-cmdline"
    ele.innerHTML = `
      <span class="xdsh-cmdline__prompt"></span>
      <span class="xdsh-cmdline__command" contenteditable tabindex="1"></span>
      <span class="xdsh-cmdline__auto-complete"></span>
      <span class="xdsh-cmdline__time"></span>`

    return ele
  }
}
export class Terminal {
  cli: HTMLDivElement[]
  history: TerminalHistory
  cmdline: TerminalCommandLine

  constructor(terminal: HTMLDivElement) {
    this.cli = [<HTMLDivElement>terminal.getElementsByClassName('xdsh-cli')[0]]
    this.history = new TerminalHistory(
      <HTMLDivElement>this.cli[0].getElementsByClassName('xdsh-history')[0]
    )
    this.cmdline = new TerminalCommandLine(
      <HTMLDivElement>this.cli[0].getElementsByClassName('xdsh-cmdline')[0]
    )
  }
}

class TerminalHistory {
  history: HTMLDivElement

  constructor(history: HTMLDivElement) {
    this.history = history
  }

  appendElement(record: Element) {
    this.history.append(record)
  }

  appendSentence(text: string) {
    this.history.append(text)
    this.history.append(document.createElement('br'))
  }

  appendPassage(text: string) {
    let lines = text.split('\n')
    for (let line of lines) {
      this.appendSentence(line)
    }
  }

  clear() {
    this.history.innerHTML = ''
  }
}

class TerminalCommandLine {
  cmdline: HTMLDivElement
  prompt: HTMLSpanElement
  command: HTMLSpanElement
  autoComplete: HTMLSpanElement
  time: HTMLSpanElement

  constructor(cmdline: HTMLDivElement) {
    this.cmdline = cmdline
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
    return this.cmdline.cloneNode(true) as HTMLDivElement
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
}
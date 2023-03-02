export class Terminal {
  history: TerminalHistory
  cmdline: TerminalCommandLine

  constructor(cli: HTMLDivElement) {
    this.history = new TerminalHistory(
      <HTMLDivElement>cli.getElementsByClassName('xdsh-history')[0]
    )
    this.cmdline = new TerminalCommandLine(
      <HTMLDivElement>cli.getElementsByClassName('xdsh-cli')[0]
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
  prompt: HTMLSpanElement
  command: HTMLSpanElement
  autoComplete: HTMLSpanElement

  constructor(cli: HTMLDivElement) {
    this.prompt = <HTMLSpanElement>cli.getElementsByClassName('xdsh-cli__prompt')[0]
    this.command = <HTMLSpanElement>cli.getElementsByClassName('xdsh-cli__command')[0]
    this.autoComplete = <HTMLSpanElement>cli.getElementsByClassName('xdsh-cli__auto-complete')[0]

    this.command.addEventListener('keypress', (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        event.preventDefault();
      }
    });
    this.autoComplete.onclick = () => {
      this.focus()
    }
  }

  focus() {
    let sel: Selection | null = window.getSelection();

    this.command.focus();
    if (sel) {
      sel.selectAllChildren(this.command);
      sel.collapseToEnd();
    }
  }

  getLine(): string {
    return this.getPrompt() + this.getCommad()
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

  clear() {
    this.command.innerHTML = ''
    this.autoComplete.innerHTML = ''
  }
}
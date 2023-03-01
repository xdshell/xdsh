class Terminal {
  history: TerminalHistory

  constructor(cli: HTMLDivElement) {
    this.history = new TerminalHistory(
      <HTMLDivElement>cli.getElementsByClassName('xdsh-cli__history')[0]
    )
  }
}

class TerminalHistory {
  history: HTMLDivElement

  constructor(history: HTMLDivElement) {
    this.history = history
  }

  append(record: Element) {
    this.history.append(record)
  }

  writeSentence(text: string) {
    this.history.append(text)
    this.history.append(document.createElement('br'))
  }

  writePassage(text: string) {
    let lines = text.split('\n')
    for (let line of lines) {
      this.writeSentence(line)
    }
  }

  clear() {
    this.history.innerHTML = ''
  }
}

class TerminalCli {
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

  readLine(): string {
    return this.readPrompt() + this.readLine
  }

  readPrompt(): string {
    return this.prompt.innerText
  }

  readCommad(): string {
    return this.command.innerText
  }

  clear() {
    this.command.innerHTML = ''
    this.autoComplete.innerHTML = ''
  }
}
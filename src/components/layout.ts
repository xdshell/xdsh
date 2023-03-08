export class HLayout {
  static newElement(): HTMLDivElement {
    let ele = document.createElement('div')
    ele.className = 'xdsh-layout__row'

    return ele
  }
}

export class VLayout {
  static newElement(): HTMLDivElement {
    let ele = document.createElement('div')
    ele.className = 'xdsh-layout__column'

    return ele
  }
}
export class Divider {
  static newElement(): HTMLDivElement {
    let ele = document.createElement('hr')
    ele.className = 'xdsh-divider'
    
    return ele
  }
}
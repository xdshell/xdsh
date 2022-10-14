class Cmdline {
  constructor() {
    this.setFocus(0);
  }

  setFocus(index) {
    this.history = new CmdlineHistory(document.getElementsByClassName('cmdline__history')[index]);
    this.input = new CmdlineInput(document.getElementsByClassName('cmdline__input')[index]);
  }
}

class CmdlineHistory {
  constructor(cmdlineHistory) {
    this.history = cmdlineHistory;
  }

  append(records) {
    this.history.appendChild(records);
    // this.history.appendChild(document.createElement('br'));
  }

  write(text) {
    this.history.append(text);
    this.history.appendChild(document.createElement('br'));
  }
}

class CmdlineInput {
  constructor(cmdlineInput) {
    this.input = cmdlineInput;
    this.prompt = cmdlineInput.getElementsByClassName('cmdline__prompt')[0];
    this.command = cmdlineInput.getElementsByClassName('cmdline__command')[0];
    this.command.addEventListener('keypress', (event)=>{
      if (event.which === 13) {
        event.preventDefault();
      }
    });
    this.autoComplete = cmdlineInput.getElementsByClassName('cmdline__auto-complete')[0];
    this.autoComplete.onclick = ()=>{
      this.focus();
    }
  }

  focus() {
    this.command.focus();
    let sel = window.getSelection();
    sel.selectAllChildren(this.command);
    sel.collapseToEnd();
  }

  readline() {
    return this.prompt.innerText + this.command.innerText;
  }

  read() {
    return this.command.innerText;
  }

  clear() {
    this.command.innerHTML = '';
  }
}

class Shell {
  constructor() {
    this.cmdline = new Cmdline();

    // name: { help, execute }
    this.cmd = {
      'help': {
        'help': `A real help`,
        'execute': (args)=>{
          if (args[0] == '-h') {
            let help = this.cmd['$SHELL'].help.split('\n');

            for (let i in help)
              this.cmdline.history.write(help[i]);
            return true;
          }

          this.cmdline.history.write('All of the commands are listed below.');
          let commands = '';
          for (let key in this.cmd)
            commands += key + ' '
          this.cmdline.history.write(commands);
          return true;
        }
      },
      '$SHELL': {
        'help': `Usage: $SHELL [<options>]
          Special options:
          -h show this message, then exit
          -v show shell version number, then exit`,
        'execute': (args)=>{
          if (args[0] == '-h') {
            let help = this.cmd['$SHELL'].help.split('\n');

            for (let i in help)
              this.cmdline.history.write(help[i]);
            return true;
          }
          else if (args[0] == '-v') {
            this.cmdline.history.write(this.version);
            return true;
          }

          this.cmdline.history.write(this.shell);
          return true;
        }
      },
    };

    this.shell = 'sh';
    this.version = 'v0.0.1';
    this.account = 'root';
    this.hostname = 'linux';
    this.dirRoot = '~';
    this.dirTree = {};
    this.dirTree[this.dirRoot] = {
      'type': 'dir',
      'content': {
        'posts': {
          'type': 'dir',
          'content': {

          }
        },
        'readme.txt': {
          'type': 'file',
          'content': 'zxd'
        }
      },
    };
    this.dirCurrent = this.dirRoot;
    this.dirStack = [ { 'tree': this.dirTree[this.dirRoot], 'name': this.dirRoot }, ];

    this.setAutoComplete();

    this.errorMsg = {
      'CommandNotFound': (cmd) => `xdsh: ${cmd}: command not found`,
      'NoSuchFileOrDirectory': (file) => `cannot access ${file}: No such file or directory`,
      'NotADirectory': (file) => `not a directory: ${file}`,
      'IsADirectory': (dir) => `${dir}: Is a directory`,
      'InvalidOption': (option) => `invalid option -- '${option}'`,
      'IsLackOfArguments': (cmd) => `${cmd}: is lack of arguments`
    };
  }

  setPrompt() {
    this.cmdline.input.prompt.innerHTML =
      `[${this.account}@${this.hostname} ${this.dirCurrent}]#&nbsp;`;
  }

  setAutoComplete() {
    this.cmdline.input.command.addEventListener('input', ()=>{
      let command = this.cmdline.input.read();
      let commandArray = command.split(/\s+/);
      let cmd = commandArray[0], args = commandArray.slice(1);

      if (commandArray.length <= 1) {
        if (cmd.length) {
          for (let key in this.cmd) {
            if (key.length < command.length)
              continue;
            
            if (key.slice(0, command.length) == command) {
              let complete = key.slice(command.length);
              this.cmdline.input.autoComplete.innerHTML = complete;
              return;
            }
          }
        }
      }
      else {
        let path = args[args.length - 1];
        let pathCurrent = path.substring(0, path.lastIndexOf('/'));
        let pathToComplete = path.substring(path.lastIndexOf('/') + 1, path.length);

        if (pathToComplete.length != 0) {
          let valid, dirStackBak;
          [ valid, , dirStackBak ] = this.pathParser(pathCurrent);
          if (!valid)
            return;

          for (let key in dirStackBak[dirStackBak.length - 1].tree.content) {
            key = key + '/';
            if (key.length < pathToComplete.length)
              continue;
            
            if (key.slice(0, pathToComplete.length) == pathToComplete) {
              let complete = key.slice(pathToComplete.length);
              this.cmdline.input.autoComplete.innerHTML = complete;
              return;
            }
          }
        }
      }

      this.cmdline.input.autoComplete.innerHTML = '';
    }, false);
  }

  exec(cmd, args) {
    if (this.cmd[cmd]) {
      this.cmd[cmd].execute(args);
      return true;
    }

    return false;
  }

  error(text) {
    this.cmdline.history.write(text);
  }
}

class Xdsh extends Shell {
  constructor() {
    super();

    this.shell = 'xdsh';
    this.account = 'usr';
    this.hostname = 'insorker.cn';
    this.setPrompt();

    this.hotkey = {
      'ctrl+': {},
    };

    this.cmd['ls'] = {
      'help': `ls
      List directory contents.More information: https://www.gnu.org/software/coreutils/ls.`,
      'execute': (args)=>{
        let ls = document.createElement('div');
        ls.className = 'xdsh-ls';

        let file;
        if (args.length) {
          let valid, dirCurrentBak, dirStackBak, errorMsg;
          [ valid, dirCurrentBak, dirStackBak, errorMsg ] = this.pathParser(args[0]);

          if (!valid) {
            this.error('ls: ' + errorMsg);
            return false;
          }

          file = dirStackBak[dirStackBak.length - 1].tree;
        }
        else {
          file = this.dirStack[this.dirStack.length - 1].tree;
        }

        if (file) {
          if (file.type == 'dir') {
            for (let key in file.content) {
              let lsitem = document.createElement('div');
              lsitem.innerText = key;

              if (file.content[key].type == 'dir')
                lsitem.className = 'xdsh-ls__dir';
              else if (file.content[key].type == 'file')
                lsitem.className = 'xdsh-ls__file';

              ls.appendChild(lsitem);
            }
          }
          else if (file.type == 'file') {
            ls.innerText = file.name;
          }

          this.cmdline.history.append(ls);
          return true;
        }

        this.error('ls: ' + this.errorMsg['NoSuchFileOrDirectory'](file));
        return false;
      }
    }
    this.cmd['cd'] = {
      'help': `cd
      Change the current working directory.More information: https://manned.org/cd.`,
      'execute': (args)=>{
        if (args.length == 0) {
          this.dirCurrent = this.dirRoot;
          this.dirStack = [ { 'tree': this.dirTree[this.dirRoot], 'name': this.dirRoot }, ];
          this.setPrompt();
          return true;
        }
        
        let valid, dirCurrentBak, dirStackBak, errorMsg;
        [ valid, dirCurrentBak, dirStackBak, errorMsg ] = this.pathParser(args[0]);

        if (!valid) {
          this.error('cd' + errorMsg);
          return false;
        }

        this.dirCurrent = dirCurrentBak;
        this.dirStack = dirStackBak;
        this.setPrompt();
        return true;
      }
    }
    this.cmd['pwd'] = {
      'help': `pwd
      Print name of current/working directory.More information: https://www.gnu.org/software/coreutils/pwd.`,
      'execute': (args)=>{
        let path = '';
        
        for (let i = 0; i < this.dirStack.length; i++) {
          if (i) path += '/';
          path += this.dirStack[i].name;
        }

        this.cmdline.history.write(path);
        return true;
      }
    }
    this.cmd['cat'] = {
      'help': `cat
      Print and concatenate files.More information: https://www.gnu.org/software/coreutils/cat.`,
      'execute': (args)=>{
        if (!args.length) {
          this.error('cat: ' + this.errorMsg['IsLackOfArguments']('cat'));
          return false;
        }

        let valid, dirCurrentBak, dirStackBak, errorMsg;
        [ valid, dirCurrentBak, dirStackBak, errorMsg ] = this.pathParser(args[0], true);

        if (!valid) {
          this.error('cat: ' + errorMsg);
          return false;
        }

        let file = dirStackBak[dirStackBak.length - 1].tree;

        if (file.type == 'dir') {
          this.error('cat: ' + this.errorMsg['IsADirectory'](dirCurrentBak));
          return false;
        }
        else if (file.type == 'file') {
          this.cmdline.history.write(file.content);
          return true;
        }

        return false;
      }
    }
  }

  setup() {
    this.registerHotkey('Enter', (event)=>{
      event.preventDefault();

      let line = this.cmdline.input.readline();
      let command = this.cmdline.input.read();
      let commandArray = command.split(/\s+/);
      let cmd = commandArray[0], args = commandArray.slice(1);

      this.cmdline.history.write(line);
      if (cmd !== '' && !this.exec(cmd, args)) {
        this.error(this.errorMsg['CommandNotFound'](cmd));
      }
      this.cmdline.input.clear();
      this.cmdline.input.autoComplete.innerHTML = '';
    });

    this.registerHotkey('Tab', (event)=>{
      event.preventDefault();

      if (this.cmdline.input.autoComplete.innerHTML) {
        this.cmdline.input.command.innerHTML = 
          this.cmdline.input.command.innerHTML + 
          this.cmdline.input.autoComplete.innerHTML;
        this.cmdline.input.autoComplete.innerHTML = '';
        this.cmdline.input.focus();
      }
    });

    document.addEventListener('keydown', (event) => {
      const keyName = event.key;

      if (this.hotkey[keyName]) {
        this.hotkey[keyName](event);
      }
      else if (event.ctrlKey) {
        if (this.hotkey['ctrl+'][keyName]) {
          this.hotkey['ctrl+'][keyName](event);
        }
      }
    }, false);
  }

  registerHotkey(name, func) {
    this.hotkey[name] = func;
  }

  // check the validity of str, and provide the path tree
  // return [ valid, dirCurrent, dirStack, errorMsg ]
  pathParser(str, endWithFile=false) {
    let path = str.split('/');
    let file = this.dirStack[this.dirStack.length - 1].tree;
    let dirCurrentBak = this.dirCurrent;
    let dirStackBak = this.dirStack.slice();
    if (str.length == 0)
      return [ true, dirCurrentBak, dirStackBak, ];
      
    while (path.length) {
      if (path[0] == '') {
      }
      else if (path[0] == '.') {
      }
      else if (path[0] == '..') {
        if (dirCurrentBak != this.dirRoot) {
          dirStackBak.pop();
          dirCurrentBak = dirStackBak[dirStackBak.length - 1].name;
          file = dirStackBak[dirStackBak.length - 1].tree;
        }
      }
      else {
        let isfound = false;

        for (let key in file.content) {
          if (key == path[0]) {
            if (file.content[key].type != 'dir') {
              if (endWithFile && path.length == 1) {
                dirStackBak.push({
                  'tree': file.content[key],
                  'name': key,
                });
                dirCurrentBak = key;
                return [ true, dirCurrentBak, dirStackBak, ];
              }
              return [ false, , , this.errorMsg['NotADirectory'](str) ];
            }

            dirStackBak.push({
              'tree': file.content[key],
              'name': key,
            });
            dirCurrentBak = key;
            isfound = true;
            break;
          }
        }

        if (!isfound) {
          return [ false, , , this.errorMsg['NoSuchFileOrDirectory'](str) ];
        }
      }

      path.shift();
    }

    return [ true, dirCurrentBak, dirStackBak, ];
  }
}
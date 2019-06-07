class Drag {
  constructor(id, arr) {
    this.id = id;
    this.dragTarget = null;
    this.sections = arr;
    this.popUp = false;
    this.objMenu = "";
    this.sortTarget = null;
    this.currList = null;
    this.newList = null;
    this.iVariance = 40;
  }
  
  /*--------------------------------------------------------*/
  /*--------------------------------------------------------*/
  /*--------------------------------------------------------*/

  init() {
    document.querySelector(".dragdrop").setAttribute("role", "application"); // Set Section  properties
    this.setInitalAttrs();
    this.dragItems = null;

  }

  calculatePosition(objElement, strOffset) {
    let iOffset = 0;

    if (objElement.offsetParent) {
      do {
        iOffset += objElement[strOffset];
        objElement = objElement.offsetParent;
      } while (objElement);
    }

    return iOffset;
  }

  getTarget() {
    let { calculatePosition } = this;
    let strExisting = this.dragTarget.parentNode.getAttribute("id");
    this.currList = strExisting;
    let iCurrentLeft = calculatePosition(this.dragTarget, "offsetLeft");
    let iCurrentTop = calculatePosition(this.dragTarget, "offsetTop");
    let objList, iLeft, iRight, iTop, iBottom, iCounter;

    for (iCounter = 0; iCounter < this.sections.length; iCounter++) {
      if (this.sections[iCounter] != strExisting) {
        objList = document.getElementById(this.sections[iCounter]);
        iLeft = calculatePosition(objList, "offsetLeft") - this.iVariance;
        iRight = iLeft + objList.offsetWidth + this.iVariance;
        iTop = calculatePosition(objList, "offsetTop") - this.iVariance;
        iBottom = iTop + objList.offsetHeight + this.iVariance;

        if (
          iCurrentLeft > iLeft &&
          iCurrentLeft < iRight &&
          iCurrentTop > iTop &&
          iCurrentTop < iBottom
        ) {
          return this.sections[iCounter];
        }
      }
    }

    return "";
  }

  setNewLocationHover() {
    let dragTarget = this.dragTarget;
    let itemArr = Array.from(dragTarget.parentNode.children);
    let objOff = Number(dragTarget.style.top.replace("px", ""));
    let diffA = 0;
    let diffB = 0;
    itemArr.forEach((x, d, i) => {
      x.loc = this.iVariance * d;
      dragTarget === i[d] && (diffA = x.loc + objOff);
      (diffB = Math.abs(x.loc - diffA)) < this.iVariance / 2 &&
        (this.sortTarget = x);
    });
  }

  setInitalAttrs() {
    this.dragItems = [
      ...document.querySelectorAll("#" + this.id + " .draggable")
    ];
    let {
      sections_setARIAattributes,
      listItems__setInitalValues,
      listItems__setARIAattributes,
      listItems__addFocusindicator
    } = this;
    let addEventHandlers = this.addEventHandlers.bind(this);
    this.sections.map(sections_setARIAattributes);
    this.dragItems.map(function(x) {
      listItems__setInitalValues(x);
      listItems__setARIAattributes(x);
      listItems__addFocusindicator(x);
      addEventHandlers(x);
    });
  }

  addChoiceListener(x) {
    let strExisting = this.dragTarget.parentNode.getAttribute("id");
    let dropObject = this.dropObject.bind(this);
    let handleContext = this.handleContext.bind(this);
    let { listItems__addFocusindicator } = this;

    if (x != strExisting) {
      let objChoice = document.createElement("li");
      objChoice.appendChild(document.createTextNode(x));
      objChoice.tabIndex = -1;
      objChoice.setAttribute("role", "menuitem");

      objChoice.onmousedown = function() {
        dropObject(this.firstChild.data);
      };

      objChoice.ontouchstart = function() {
        dropObject(this.firstChild.data);
      };

      objChoice.onkeydown = handleContext;
      listItems__addFocusindicator(objChoice);
      this.objMenu.appendChild(objChoice);
    }
  }

  changeFocus(objItem, direction) {
    let objstart = objItem.parentNode.firstChild;
    let objEnd = objItem.parentNode.lastChild;
    let objFocus = objItem[direction];

    if (!objFocus) {
      objFocus = direction !== "nextSibling" ? objEnd : objstart;
    }

    objItem.className = "";
    objFocus.focus();
    objFocus.className = "focus";
  }
  
  
  /*--------------------------------------------------------*/
  /*--------------------------------------------------------*/
  /*--------------------------------------------------------*/


  sections_setARIAattributes(list) {
    let t = document.getElementById(list);
    t.setAttribute("aria-labelledby", list + "_label");
    t.setAttribute("role", "list");
  }

  sections__resetARIAattributes(x) {
    let t = document.getElementById(x);
    t.removeAttribute("aria-dropeffect");
    this.dragTarget.setAttribute("aria-grabbed", "false");
    t.className = "";
  }

  menu__SetARIAproperties(menu) {
    menu.setAttribute("id", "popup");
    menu.setAttribute("role", "menu");
  }

  listItems_MenuActive__SetARIAproperties(item) {
    item.setAttribute("aria-grabbed", "true");
    item.setAttribute("aria-owns", "popup");
  }

  listItems_MenuActive__resetProps(item) {
    let listItems__resetInitalValues = this.listItems__resetInitalValues.bind(this);
    listItems__resetInitalValues(item);
    item.setAttribute("aria-grabbed", "false");
    item.removeAttribute("aria-owns");
  }

  listItems__setARIAattributes(item) {
    item.setAttribute("aria-grabbed", "false");
    item.setAttribute("aria-haspopup", "true");
    item.setAttribute("role", "listitem");
  }

  listItems__addFocusindicator(item) {
    item.onfocus = function() {
      this.className += " focused";
    };

    item.onblur = function() {
      this.className = this.className.replace(/\s*focused/, "");
    };

    item.onmouseover = function(e) {
      if (this.className.indexOf("hover") < 0) {
        this.className += " hover";
      }
    };

    item.onmouseout = function() {
      this.className = this.className.replace(/\s*hover/, "");
    };

    item.ontouchend = function() {
      this.className = this.className.replace(/\s*hover/, "");
    };
  }

  listItems__setInitalValues(item) {
    item.style.top = "0px";
    item.style.left = "0px";
    item.tabIndex = 0;
  }

  listItems__resetInitalValues(item) {
    item.style.top = "0px";
    item.style.left = "0px";
    item.style.zIndex = "auto";
  }

  listItems__stripStyle(x) {
    x.removeAttribute("style");
    x.className = x.className.replace(/\s*focused/, "");
    x.className = x.className.replace(/\s*hover/, "");
  }
  
  
  /*--------------------------------------------------------*/
  /*--------------------------------------------------------*/
  /*--------------------------------------------------------*/


  addEventHandlers(objNode) {
    let start = this.start.bind(this);
    let keyboardDragDrop = this.keyboardDragDrop.bind(this);
    let removePopup = this.removePopup.bind(this);
    let focus = this.focus;
    objNode.onmousedown = start;
    objNode.ontouchstart = start;

    objNode.onkeydown = function(e) {
      keyboardDragDrop(e, objNode);
    };

    objNode.onclick = focus;
    document.body.onclick = removePopup;
    document.onkeydown = function(e) { // needed to differentiate instances
      return e.keyCode == 38 || e.keyCode == 40 ? false : true;
    };
  }

  handleContext(e) {
    e.preventDefault();
    e = e || window.event;
    let objItem = e.target || e.srcElement;
    let iKey = e.keyCode;
    let dropObject = this.dropObject.bind(this);
    let changeFocus = this.changeFocus.bind(this);
    let sections__resetARIAattributes = this.sections__resetARIAattributes.bind(this);
    let { resetFocus } = this;

    switch (iKey) {
      case 38: // Down arrow
        changeFocus(objItem, "nextSibling")
        break;

      case 40: // Up arrow
        changeFocus(objItem, "previousSibling")
        break;

      case 13: // Enter
        dropObject(objItem.firstChild.data);
        this.popUp = false;
        break;

      case 27: // Escape
      case 9: // Tab
        resetFocus(this.dragTarget, objItem);
        this.popUp = false;
        this.sections.map(sections__resetARIAattributes);
        break;
    }
  }



  keyboardDragDrop(e, objNode) {
    e = e || window.event;
    this.dragTarget = objNode;
    let iKey = e.keyCode;
    let identifyTargets = this.identifyTargets.bind(this);
    let addChoiceListener = this.addChoiceListener.bind(this);

    let {
      listItems_MenuActive__SetARIAproperties,
      menu__SetARIAproperties
    } = this;

    this.checkKeys__removeDoubleTap(iKey)
    this.checkKeys__removeDoubleTap(iKey)

    if (iKey == 32 && !this.popUp) { //spacebar
      this.popUp = true;
      listItems_MenuActive__SetARIAproperties(this.dragTarget);
      this.objMenu = document.createElement("ul");
      menu__SetARIAproperties(this.objMenu);
      this.sections.forEach(addChoiceListener);
      this.dragTarget.appendChild(this.objMenu);
      this.objMenu.firstChild.focus();
      this.objMenu.firstChild.className = "focus";
      identifyTargets(true);
    }

  }


  checkKeys__removeDoubleTap(iKey){
    var obj = this.dragTarget

    if (iKey == 38 && !this.popUp) {
      if(obj.previousSibling !== null){
          obj.after(obj.previousSibling);
     }
    }

    if (iKey == 40 && !this.popUp) {
      if(obj.nextSibling !== null){
              obj.before(obj.nextSibling);
        }
    }
  }
  
  /*--------------------------------------------------------*/
  /*--------------------------------------------------------*/
  /*--------------------------------------------------------*/


  start(e) {
    e = e || window.event;
    if (e.type === 'mousedown' && e.which !== 1) return;
    if (e.type === 'touchstart' && e.touches.length > 1) return;

    let removePopup = this.removePopup.bind(this);
    let identifyTargets = this.identifyTargets.bind(this);
    let moveObj = this.moveObj.bind(this);
    let end =   this.end.bind(this);

    this.dragTarget = e.target;
    this.dragTarget.lastX = e.clientX || e.touches[0].clientX;
    this.dragTarget.lastY = e.clientY || e.touches[0].clientY;
    this.dragTarget.style.zIndex = "2";
    this.dragTarget.setAttribute("aria-grabbed", "true");

    removePopup();

    document.onmousemove = moveObj;
    document.ontouchmove = moveObj;
    document.onmouseup = end;
    document.ontouchend = end;
    
    identifyTargets(true);
    return false;
  }


  end() {
    let dropObject = this.dropObject.bind(this);
    let getTarget = this.getTarget.bind(this);
    dropObject(getTarget());
  
    if (this.newList === this.currList) {
      if(this.sortTarget == null ) this.sortTarget = this.dragTarget 
      this.insertAfter(this.dragTarget, this.sortTarget);
    }

    document.onmousemove = null;
    document.onmouseup = null;
    document.ontouchmove = null;
    document.ontouchend = null;
    this.dragTarget = null;
    this.newList = null;
    this.currList = null;
  }


  moveObj(e) {
    this.setNewLocationHover();
    e = e || window.event;
    let iCurrentY = e.clientY || e.touches[0].clientY;
    let iCurrentX = e.clientX || e.touches[0].clientX;
    let iYPos = parseInt(this.dragTarget.style.top, 10);
    let iXPos = parseInt(this.dragTarget.style.left, 10);
    let iNewX, iNewY;
    iNewX = iXPos + iCurrentX - this.dragTarget.lastX;
    iNewY = iYPos + iCurrentY - this.dragTarget.lastY;
    this.dragTarget.style.left = iNewX + "px";
    this.dragTarget.style.top = iNewY + "px";
    this.dragTarget.lastX = iCurrentX;
    this.dragTarget.lastY = iCurrentY;
    return false;
  }
  

  /*--------------------------------------------------------*/
  /*--------------------------------------------------------*/
  /*--------------------------------------------------------*/


  identifyTargets(bHighlight) {
    let strExisting = this.dragTarget.parentNode.getAttribute("id");
    let objList;
    this.newList = strExisting;
    this.sections.forEach(function(x, i) {
      objList = document.getElementById(x);

      if (bHighlight && x != strExisting) {
        objList.className = "highlight";
        objList.setAttribute("aria-dropeffect", "move");
      } else {
        objList.className = "";
        objList.removeAttribute("aria-dropeffect");
      }
    });
  }

  dropObject(chosenDestination) {
    let addEventHandlers = this.addEventHandlers.bind(this);
    let listItems_MenuActive__resetProps = this.listItems_MenuActive__resetProps.bind(this);
    let identifyTargets = this.identifyTargets.bind(this);
    let removePopup = this.removePopup.bind(this);
    let { addEmptyNode } = this;
    let replaceNode = this.replaceNode.bind(this);

    removePopup();

    if (chosenDestination.length > 0) {
      let objOriginal = this.dragTarget.parentNode;
      let objClone = this.dragTarget.cloneNode(true);
      addEventHandlers(objClone);
      objOriginal.removeChild(this.dragTarget);
      this.dragTarget = objClone;
      replaceNode(chosenDestination, objClone);
      addEmptyNode(objOriginal);
    }

    listItems_MenuActive__resetProps(this.dragTarget);
    identifyTargets(false);
  }
  
  

  /*--------------------------------------------------------*/
  /*--------------------------------------------------------*/
  /*--------------------------------------------------------*/


  insertAfter(newNode, referenceNode) {
    this.dragTarget, this.sortTarget
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
  }

  replaceNode(chosenDestination, objClone) {
    let {
      listItems__stripStyle,
      listItems__addFocusindicator,
      removeEmptyNode
    } = this;
    let objTarget = document.getElementById(chosenDestination);
    objTarget.appendChild(objClone);
    listItems__stripStyle(objClone);
    listItems__addFocusindicator(objClone);
    removeEmptyNode(objTarget);
  }

  removeEmptyNode(objTarget) {
    let objEmpty = objTarget.querySelector(".empty");
    if (objEmpty) {
      objTarget.removeChild(objEmpty);
    }
  }

  removePopup() {
    this.popUp = false;
    document.onkeydown = null;
    let objContext = document.getElementById("popup");

    if (objContext) {
      objContext.parentNode.removeChild(objContext);
    }
  }

  addEmptyNode(objOriginal) {
    let objBands = objOriginal.getElementsByTagName("li");

    if (objBands.length === 0) {
      let objItem = document.createElement("li");
      objItem.appendChild(document.createTextNode("None"));
      objItem.className = "empty";
      objOriginal.appendChild(objItem);
    }
  }

  resetFocus(curr, sel) {
    curr.removeAttribute("aria-owns");
    curr.removeChild(sel.parentNode);
    curr.focus();
  }
}

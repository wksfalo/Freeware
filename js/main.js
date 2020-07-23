// Note: we are storing our UI buttons as nested arrays. Each nested array contains the name, and id, of the button.

//our only global variable, for a nasty workaround for a small bug
var updating = false;

// Title object
let title = {
  main: "Freeware & Shareware",
  sub: "The Ultimate List Of Totally Free Software",
  subSize: "3.5vmin",
  temp_main: "",
  temp_sub: "",
  current_section: "",
  update: function (main, sub, subSize) {
    updating = true; //nasty workaround for bug
    this.main = main;
    this.sub = sub;
    this.subSize = subSize;
    let ourTitle = $("#title");
    let ourMain = $("#main");
    let ourSub = $("#sub");
    ourTitle.removeClass("slide-in slide-in-fast");
    ourTitle.addClass("slide-out");
    this.temp_main = main;
    this.temp_sub = sub;
    setTimeout(() => {
      $("#main").text(this.main);
      ourSub.text(this.sub);
      ourSub.css("fontSize", this.subSize);
      if (this.sub == "") $("h2").css("marginTop", "0px");
      else $("h2").css("marginTop", "0.3rem");
      ourTitle.removeClass("slide-out");
      ourTitle.addClass("slide-in-fast");
      updating = false;
    }, 500);
  },
  instantUpdate: function (main, sub, subSize) {
    this.main = main;
    this.sub = sub;
    this.subSize = subSize;
    let ourSub = $("#sub");
    $("#main").text(this.main);
    ourSub.text(this.sub);
    ourSub.css("fontSize", this.subSize);
    if (this.sub == "") $("h2").css("marginTop", "0px");
    else $("h2").css("marginTop", "0.3rem");
  },
  reset: function () {
    this.update(
      "Freeware & Shareware",
      "The Ultimate List of Totally Free Software",
      "3.5vmin"
    );
  },
  initialize: function () {
    let ourSub = $("#sub");
    $("#main").text(this.main);
    ourSub.text(this.sub);
    ourSub.css("fontSize", this.subSize);
    $("#title").addClass("slide-in");
  },
};

//Buttons object

/* buttons should be stored as a nested array, each button containing its name and then id */

let options = {
  buttons: [],
  html: "",
  update: function (buttons, func) {
    let ourBox = $(".selection-box");
    ourBox.removeClass("fade-in fade-in-fast");
    ourBox.addClass("fade-out");
    setTimeout(() => {
      this.buttons = [...buttons];
      this.buttons.sort((a, b) => {
        if (a[1] < b[1]) {
          return -1;
        }
        if (a[1] > b[1]) {
          return 1;
        }
        // a must be equal to b
        return 0;
      });
      this.html = myUtils.divify(buttons);
      ourBox.html(this.html);
      if (func == softwareFunction) {
        this.buttons.forEach((button) => {
          let element = document.getElementById(button[1]);
          element.addEventListener("click", func);
          element.addEventListener("keypress", function (event) {
            if (event.keyCode === 13) {
              element.click();
            }
          });
          element.addEventListener("mouseover", softwareHover);
          element.addEventListener("focus", softwareHover);
          element.addEventListener("mouseout", softwareUnHover);
          element.addEventListener("blur", softwareUnHover);
        });
      } else {
        this.buttons.forEach((button) => {
          let element = document.getElementById(button[1]);
          element.addEventListener("click", func);
          element.addEventListener("keypress", function (event) {
            if (event.keyCode === 13) {
              element.click();
            }
          });
        });
      }
      ourBox.removeClass("fade-out");
      ourBox.addClass("fade-in-fast");
    }, 500);
  },
  //Returns default buttons
  getDefaults: function () {
    let categories = Object.keys(data.sections).filter(
      (key) => key != "misc" && key != "cheer" && key != "win10"
    );
    categories.sort((a, b) => {
      if (data.sections[a] < data.sections[b]) {
        return -1;
      }
      if (data.sections[1] > data.sections[b]) {
        return 1;
      }
      // a must be equal to b
      return 0;
    });
    categories.unshift("win10");
    categories.push("misc");
    categories.push("cheer");
    return categories.map((key) => [data.sections[key], key]);
  },
  initialize: function () {
    let ourBox = $(".selection-box");
    this.buttons = this.getDefaults();
    this.html = myUtils.divify(this.buttons);
    ourBox.html(this.html);
    this.buttons.forEach((button) => {
      let thisButton = document.getElementById(button[1]);
      thisButton.addEventListener("click", categoriesFunction);
      thisButton.addEventListener("keypress", function (event) {
        if (event.keyCode === 13) {
          thisButton.click();
        }
      });
    });
    ourBox.addClass("fade-in");
  },
  reset: function () {
    this.buttons = this.getDefaults();
    this.update(this.buttons, categoriesFunction);
  },
};

//Utilities object

let myUtils = {
  getSoftwareFromSection: function (section) {
    let output = [];
    data.software.forEach((entry) => {
      if (entry.section == section) {
        output.push(entry);
      }
    });
    return output.map((object) => object.name);
  },
  makeId: function (name) {
    return name.replace(/\s+/g, "").toLowerCase();
  },
  makeIds: function (names) {
    return names.map((name) => this.makeId(name));
  },
  divify: function (buttons) {
    let output = "";
    if (isMobileDevice()) {
      buttons.forEach((button) => {
        output += `<div class="category" onselectstart="return false" id="${button[1]}">${button[0]}</div>\n`;
      });
    } else {
      buttons.forEach((button) => {
        output += `<div class="category" tabindex="0" onselectstart="return false" id="${button[1]}">${button[0]}</div>\n`;
      });
    }
    return output;
  },
  isOverflown: function (element) {
    return (
      element.scrollHeight > element.clientHeight ||
      element.scrollWidth > element.clientWidth
    );
  },
};

/*Categories buttons function:
    Updates title to category name & description
    Updates buttons to software w/in category
*/

function categoriesFunction(event) {
  //this.id gets the id of the button clicked
  title.current_section = this.id;
  let new_options = myUtils
    .getSoftwareFromSection(this.id)
    .map((name) => [name, myUtils.makeId(name)]);
  let new_main = this.textContent;
  let new_sub = data.section_descriptions[this.id];
  if (isMobileDevice()) {
    if (new_sub === undefined) {
      new_sub = `(Tap and hold on an entry to see its description, or tap to open a link to its page)`;
    } else {
      new_sub += `\n(Tap and hold on an entry to see its description, or tap to open a link to its page)`;
    }
    if (this.id == "win10") {
      new_sub =
        data.section_descriptions[this.id] +
        "\n(Tap and hold on an entry to see its description)";
    }
  }
  if (new_sub == undefined) new_sub = "";
  title.update(new_main, new_sub, "max(2.5vmin, 12px)");
  options.update(new_options, softwareFunction);
  let back = $("#back");
  setTimeout(() => {
    back.removeClass("hidden fade-out");
    back.addClass("fade-in-fast");
  }, 500);
}

/*Software button function:
    If the software has a link, opens the link in a new tab upon click
*/
function softwareFunction(event) {
  let link = data.software.find(
    (software) =>
      software.name == this.textContent &&
      software.section == title.current_section
  ).link;
  if (link !== undefined) {
    window.open(link);
  }
}
/*Software button hover function:
    Instant updates the main and sub title to the name and description of the software
*/
function softwareHover(event) {
  let main = this.textContent;
  let sub = data.software.find(
    (software) =>
      software.name == this.textContent &&
      software.section == title.current_section
  ).description;
  title.instantUpdate(main, sub, "max(2.5vmin, 12px)");
}

/*Software button unhover function:
    Waits a 10th of a second; if no category is hovered over, then we instant update the main and sub
    titles back to that set by categoriesFunction
*/
function softwareUnHover(event) {
  setTimeout(() => {
    if (
      $(".category:hover").length == 0 &&
      !$(".category").is(":focus") &&
      !updating
    ) {
      title.instantUpdate(
        title.temp_main,
        title.temp_sub,
        "max(2.5vmin, 12px)"
      );
    }
  }, 100);
}

//Ready up our UI on page load
$(document).ready(() => {
  //Ready up our back button's click function
  let back = $("#back");
  let nativeBack = document.getElementById("back");

  nativeBack.addEventListener("click", () => {
    title.reset();
    options.reset();
    back.removeClass("fade-in fade-in-fast");
    back.addClass("fade-out");
    setTimeout(() => {
      back.addClass("hidden");
    }, 500);
  });
  nativeBack.addEventListener("keypress", function (event) {
    if (event.keyCode === 13) {
      document.getElementById("back").click();
    }
  });

  //Ready up our credit button's click function
  let credit = document.getElementById("credit");
  credit.addEventListener("click", () => {
    window.open("https://github.com/ryan86me");
  });
  credit.addEventListener("keypress", function (event) {
    if (event.keyCode === 13) {
      credit.click();
    }
  });

  //Remove tabbability from the back and credit buttons if we're on a mobile phone
  if (isMobileDevice()) {
    document.getElementById("back").removeAttribute("tabindex");
    credit.removeAttribute("tabindex");
  }

  title.initialize();
  options.initialize();
});

//Helper function
function isMobileDevice() {
  if (
    navigator.userAgent.match(/Android/i) ||
    navigator.userAgent.match(/webOS/i) ||
    navigator.userAgent.match(/iPhone/i) ||
    navigator.userAgent.match(/iPad/i) ||
    navigator.userAgent.match(/iPod/i) ||
    navigator.userAgent.match(/BlackBerry/i) ||
    navigator.userAgent.match(/Windows Phone/i)
  ) {
    return true;
  } else return false;
}

// Ссылки на элементы вёрстки
const circle = document.querySelectorAll(".circle");
const redCircle = document.querySelector(".circle-red");
const yellowCircle = document.querySelector(".circle-yellow");
const greenCircle = document.querySelector(".circle-green");

const selector = document.querySelector(".mode");

// Время работы цикла
let len = 20;

// Коэффициэнты времени работы каждого из сигналов
let RED_K = 0.4;
let YELLOW_K = 0.1;
let GREEN_K = 0.5;

// Время работы каждого из сигналов
let lenRed = len * RED_K;
let lenYellow = len * YELLOW_K;
let lenGreen = len * GREEN_K;

// Ссылки на таймеры времени работы и сигналов
const timer = document.querySelector("[data-timer] input");
const redTimer = document.querySelector("[data-red] input");
const yellowTimer = document.querySelector("[data-yellow] input");
const greenTimer = document.querySelector("[data-green] input");

timer.value = len;
redTimer.value = lenRed;
yellowTimer.value = lenYellow;
greenTimer.value = lenGreen;

// Проверка ввода - только цифры от 0 до 9.
function validationInputValue(inputValue) {
  const val = +inputValue.target.value.replace(/[^\d]/g, "");
  //   inputValue.target.value = val;
  return val;
}

// Вычисляторы таймеров
timer.addEventListener("input", (e) => {
  len = validationInputValue(e);
  timerCalc();
  diagram();
  selector.value === "standby" ? standbyF() : svetoforF();
});

redTimer.addEventListener("input", (e) => {
  /* Переменные с временными актуальными RED_K и GREEN_K чтобы
  код читался полегче */
  let tempRed = validationInputValue(e) / len >= YELLOW_K ? validationInputValue(e) / len : validationInputValue(e) / len + YELLOW_K;
  let tempGreen = 1 - YELLOW_K - validationInputValue(e) / len;
  /* Проверка на то что сумма времени работы сигналов не превышает 
  общего времени работы и дополнительная проверка на 
  то чтобы GREEN_K не становился равен нулю и ниже  */
  if (len * tempRed + lenYellow + len * tempGreen === len && tempGreen > 0) {
    RED_K = tempRed;
  } else {
    RED_K = RED_K;
  }
  GREEN_K = 1 - YELLOW_K - RED_K;
  timerCalc();
  svetoforF();
  diagram();
});

yellowTimer.addEventListener("input", (e) => {
  /* Переменные с временными актуальными RED_K и GREEN_K чтобы
  код читался полегче */
  let tempRed = RED_K >= validationInputValue(e) / len ? RED_K : RED_K + validationInputValue(e) / len;
  let tempGreen = 1 - RED_K - validationInputValue(e) / len;
  /* Проверка на то что сумма времени работы сигналов не превышает 
  общего времени работы и дополнительная проверка на 
  то чтобы RED_K и GREEN_K не становились равны нулю и ниже */
  if (len * tempRed + validationInputValue(e) + len * tempGreen === len && tempRed > 0 && tempGreen > 0) {
    YELLOW_K = validationInputValue(e) / len > 0 ? validationInputValue(e) / len : YELLOW_K;
  } else {
    YELLOW_K = YELLOW_K;
  }

  RED_K = RED_K >= YELLOW_K ? RED_K : RED_K + YELLOW_K;
  GREEN_K = 1 - RED_K - YELLOW_K;
  timerCalc();
  diagram();
  selector.value === "standby" ? standbyF() : svetoforF();
});

greenTimer.addEventListener("input", (e) => {
  /* Переменные с временным актуальным RED_K чтобы
  код читался полегче */
  let tempRed = 1 - YELLOW_K - validationInputValue(e) / len >= YELLOW_K ? 1 - YELLOW_K - validationInputValue(e) / len : YELLOW_K;
  /* Проверка на то что сумма времени работы сигналов не превышает 
  общего времени работы и дополнительная проверка на 
  то чтобы RED_K не становился равен нулю и ниже */
  if (validationInputValue(e) + lenYellow + len * tempRed === len && tempRed > 0) {
    GREEN_K = validationInputValue(e) / len > 0 ? validationInputValue(e) / len : GREEN_K;
  } else {
    GREEN_K = GREEN_K;
  }
  RED_K = 1 - YELLOW_K - GREEN_K >= YELLOW_K ? 1 - YELLOW_K - GREEN_K : YELLOW_K;
  timerCalc();
  svetoforF();
  diagram();
});

// Меняем режим работы согласно выбранному режиму в селекторе
selector.addEventListener("change", (e) => {
  onBtn.style.boxShadow = "none";
  offBtn.style.boxShadow = "none";
  if (selector.value === "standby") {
    len = 6;
    YELLOW_K = 0.5;
    timerCalc();
    // При выборе дежурного режима обнуляются все анимации и желтому сигналу назначается
    // анимация дежурного сигнала. Блоки с инпутами для красного и зеленого сигналов
    // скрываются. Диаграмма скрывается.
    standbyF();
    document.querySelector("[data-timer]").style.display = "block";
    document.querySelector("[data-red]").style.display = "none";
    document.querySelector("[data-green]").style.display = "none";
    document.querySelector("[data-yellow]").style.display = "none";
    document.querySelector(".diagram").style.display = "none";
  } else {
    // При выборе обычного режима все блоки с инпутами делаются видимыми и назначется
    // анимация обычного сигнала.
    document.querySelectorAll(".timer").forEach((e) => {
      e.style.display = "block";
    });
    document.querySelector(".diagram").style.display = "flex";
    // Устанавливаем стандартные значения для режима
    len = 20;
    RED_K = 0.4;
    YELLOW_K = 0.2;
    GREEN_K = 0.4;
    timerCalc();
    svetoforF();
    diagram();
  }
});

/* Массив в который записываются все setTimeout'ы для возможности их выключить при
 изменении режима работы */
let timeouts = [];

// Функция анимации обычного режима
function svetoforF() {
  // Сброс возможного выполнения всех предыдущих анимаций
  clearTimeouts();
  // Сброс всех цветов при вызове функции
  redCircle.style.backgroundColor = "gray";
  yellowCircle.style.backgroundColor = "gray";
  greenCircle.style.backgroundColor = "gray";
  // Мгновенный вызов анимации
  timeouts.push(
    setTimeout(function svet() {
      // Загорается красный
      redCircle.style.backgroundColor = "red";
      timeouts.push(
        setTimeout(() => {
          // Загорается желтый
          yellowCircle.style.backgroundColor = "yellow";
        }, (lenRed - lenYellow) * 1000)
      ); // Время через которое загорается желтый
      timeouts.push(
        setTimeout(() => {
          // Тухнут красный и желтый - загорается зеленый
          redCircle.style.backgroundColor = "gray";
          yellowCircle.style.backgroundColor = "gray";
          greenCircle.style.backgroundColor = "greenyellow";
          timeouts.push(
            setTimeout(() => {
              // Тухнет зеленый, загорается желтый
              greenCircle.style.backgroundColor = "gray";
              yellowCircle.style.backgroundColor = "yellow";
              timeouts.push(
                setTimeout(() => {
                  // Тухнет желтый
                  yellowCircle.style.backgroundColor = "gray";
                }, lenYellow * 1000)
              ); // Тухнет желтый
            }, lenGreen * 1000)
          ); // Тухнет зеленый, загорается желтый
        }, lenRed * 1000)
      ); // Время через которое тухнут красный и желтый - загорается зеленый
      // Рекурсивный вызов этой же анимации, только с уже заданным периодом повторения
      timeouts.push(setTimeout(svet, len * 1000));
    })
  );
}
svetoforF();
diagram();

// Функция анимации дежурного режима
function standbyF() {
  // Сброс возможного выполнения всех предыдущих анимаций
  clearTimeouts();
  // Сброс всех цветов при вызове функции
  redCircle.style.backgroundColor = "gray";
  yellowCircle.style.backgroundColor = "gray";
  greenCircle.style.backgroundColor = "gray";
  // Мгновенный вызов анимации
  timeouts.push(
    setTimeout(function stb() {
      yellowCircle.style.backgroundColor = "yellow";
      timeouts.push(
        setTimeout(() => {
          yellowCircle.style.backgroundColor = "gray";
        }, lenYellow * 1000)
      );
      // Рекурсивный вызов этой же анимации, только с уже заданным периодом повторения
      timeouts.push(setTimeout(stb, len * 1000));
    })
  );
}

// Функция прерывающая выполнение всех setTimeout'ов и очищающая массив в который они записываются
function clearTimeouts() {
  timeouts.forEach((e) => {
    clearTimeout(e);
  });
  timeouts = [];
}

// Функция которая прячет\показывает настройки управления
const onBtn = document.querySelector(".on");
const offBtn = document.querySelector(".off");

onBtn.addEventListener("click", (e) => {
  e.preventDefault();
  onBtn.style.boxShadow = "inset 0px 0px 10px 1px #093e00";
  offBtn.style.boxShadow = "none";
  document.querySelectorAll(".timer").forEach((e) => {
    e.style.display = "none";
  });
});

offBtn.addEventListener("click", (e) => {
  e.preventDefault();
  onBtn.style.boxShadow = "none";
  offBtn.style.boxShadow = "inset 0px 0px 10px 1px #3e0000";
  if (selector.value === "standby") {
    document.querySelector("[data-timer]").style.display = "block";
  } else {
    document.querySelectorAll(".timer").forEach((e) => {
      e.style.display = "block";
    });
  }
});

// Функция пересчёта времени работы сигналов и вывода значений в инпуты
function timerCalc() {
  // Считаем время работы каждого сигнала в одном цикле
  lenRed = len * RED_K;
  lenYellow = len * YELLOW_K;
  lenGreen = len * GREEN_K;

  // Выводим значения таймеров на экран в инпутах
  timer.value = Math.round(len * 100) / 100;
  redTimer.value = Math.round(lenRed * 100) / 100;
  yellowTimer.value = Math.round(lenYellow * 100) / 100;
  greenTimer.value = Math.round(lenGreen * 100) / 100;
}

// Функция рисующая диграмму
function diagram() {
  const redLine = document.querySelector(".red");
  const yellowLine = document.querySelector(".yellow");
  const iYellowLine = document.querySelector(".yellow-inside");
  const greenLine = document.querySelector(".green");

  redLine.style.width = `${RED_K * 100}%`;
  redLine.style.left = `${0}%`;
  iYellowLine.style.width = `${YELLOW_K * 100}%`;
  iYellowLine.style.left = `${(RED_K - YELLOW_K) * 100}%`;
  greenLine.style.width = `${GREEN_K * 100}%`;
  greenLine.style.left = `${RED_K * 100}%`;
  yellowLine.style.width = `${YELLOW_K * 100}%`;
  yellowLine.style.left = `${(RED_K + GREEN_K) * 100}%`;
}

(function () {
  'use strict';

  var CALL_ID = '54115';
  var BASE_REWARD = 58;
  var STORE_KEY = 'callQuiz:v2:' + CALL_ID;
  var TYPE_LABELS = {
    correct: 'Верно',
    partial: 'Частично',
    wrong: 'Неверно',
    joke: 'Шуточный ответ'
  };
  /* Маркер правильности дублирует цвет: значок + подпись. */
  var GLYPHS = { correct: '✓', partial: '◐', wrong: '✕', joke: '☺' };
  /* Доля одного вопроса: базовая награда делится поровну. */
  var PER_QUESTION = BASE_REWARD / 6;
  var EXIT_COPY = 'Квиз не завершён. При выходе попытка сбросится без начисления — при новом старте придётся пройти все вопросы заново. Перейти по ссылке «{href}»?';

  var QUESTIONS = [
    {
      id: 'programming', stage: 'Приветствие и вход в контакт', timestampSeconds: 34, timestamp: '00:34',
      sourcePhrase: '«Расскажите, а что у вас сейчас с поставками?»',
      prompt: 'Что стоило сделать перед серией вопросов?',
      explanation: 'Рамка задаёт структуру разговора, а согласие клиента подтверждает готовность продолжить.',
      options: [
        { id: 'p-correct', kind: 'correct', text: 'Обозначить рамку: «Я задам пару вопросов, а потом вы решите, подходит ли вариант», — и получить согласие.', explanation: 'Сначала обозначьте структуру разговора и дождитесь согласия клиента.' },
        { id: 'p-partial', kind: 'partial', text: 'Сказать, что сначала зададите пару вопросов, но не проверить, согласен ли клиент.', explanation: 'Структура обозначена, но готовность клиента продолжить не подтверждена.' },
        { id: 'p-wrong', kind: 'wrong', text: 'Сразу перейти к вопросам о сроках, объёме и поставках.', explanation: 'Вопросы идут без рамки и согласия на разговор.' },
        { id: 'p-joke', kind: 'joke', text: 'Предупредить, что вопросов будет всего сорок два — если клиент не убежит раньше.', explanation: 'Шутка не заменяет договорённость о формате разговора.' }
      ]
    },
    {
      id: 'budget', stage: 'Квалификация и потребности', timestampSeconds: 72, timestamp: '01:12',
      sourcePhrase: '«Хорошо, а теперь расскажу, что у нас есть.»',
      prompt: 'Что нужно выяснить до презентации вариантов?',
      explanation: 'Бюджетная рамка нужна до презентации, чтобы предложение попадало в ожидания клиента.',
      options: [
        { id: 'b-correct', kind: 'correct', text: 'Спросить, на какой бюджет рассчитывает клиент, до презентации.', explanation: 'Сначала выясните диапазон, затем подбирайте и презентуйте варианты.' },
        { id: 'b-partial', kind: 'partial', text: 'Показать варианты, а затем уточнить, какой бюджет был заложен.', explanation: 'Бюджет выяснен, но слишком поздно — презентация уже могла не попасть в ожидания.' },
        { id: 'b-wrong', kind: 'wrong', text: 'Сразу перечислить преимущества продукта и не обсуждать бюджет.', explanation: 'Без бюджета сложно выбрать релевантное предложение.' },
        { id: 'b-joke', kind: 'joke', text: 'Попросить клиента назвать бюджет по звуку открываемого кошелька.', explanation: 'Догадки не заменяют прямой вопрос о бюджете.' }
      ]
    },
    {
      id: 'summary', stage: 'Квалификация и потребности', timestampSeconds: 118, timestamp: '01:58',
      sourcePhrase: '«Ну, я понял, что вам важны сроки и стабильность поставок.»',
      prompt: 'Как проверить, что потребность понята верно?',
      explanation: 'Резюме должно завершиться явным подтверждением клиента, а не предположением менеджера.',
      options: [
        { id: 's-correct', kind: 'correct', text: 'Кратко повторить сроки и стабильность и спросить: «Всё верно, ничего не упустил?»', explanation: 'Краткое резюме и вопрос дают клиенту возможность подтвердить или поправить понимание.' },
        { id: 's-partial', kind: 'partial', text: 'Кратко повторить сроки и стабильность и перейти к презентации без вопроса клиенту.', explanation: 'Резюме есть, но клиент не подтвердил, что оно точное.' },
        { id: 's-wrong', kind: 'wrong', text: 'Считать потребность подтверждённой и сразу назвать все преимущества компании.', explanation: 'Менеджер предполагает согласие и рискует презентовать не то.' },
        { id: 's-joke', kind: 'joke', text: 'Попросить клиента кивнуть в трубку — так резюме точно считается согласованным.', explanation: 'Нужен явный ответ клиента, а не жест, которого собеседник даже не видит.' }
      ]
    },
    {
      id: 'presentation', stage: 'Презентация и доверие', timestampSeconds: 155, timestamp: '02:35',
      sourcePhrase: '«У нас двенадцать складов и своя логистика по всей стране.»',
      prompt: 'Как связать возможность компании с проблемой клиента — срывами сроков?',
      explanation: 'Преимущество работает в презентации, когда показана его связь с названной клиентом проблемой.',
      options: [
        { id: 'pr-correct', kind: 'correct', text: 'Объяснить, что отгрузка с ближайшего склада помогает доставить за сутки вместо недели.', explanation: 'Преимущество напрямую отвечает на проблему клиента со сроками.' },
        { id: 'pr-partial', kind: 'partial', text: 'Назвать двенадцать складов, но не объяснить, как это сокращает задержки.', explanation: 'Факт назван, но его польза для клиента не раскрыта.' },
        { id: 'pr-wrong', kind: 'wrong', text: 'Повторить, что качество выше, не связывая это со сроками поставки.', explanation: 'Аргумент не отвечает на конкретную боль клиента.' },
        { id: 'pr-joke', kind: 'joke', text: 'Пообещать телепортировать заказ, если склад далеко.', explanation: 'Нереалистичное обещание не доказывает, что сроки будут соблюдены.' }
      ]
    },
    {
      id: 'objection', stage: 'Закрытие и возражения', timestampSeconds: 206, timestamp: '03:26',
      sourcePhrase: '«Ну смотрите, у нас качество выше, поэтому и цена такая.»',
      prompt: 'Что сделать до аргументации цены?',
      explanation: 'Сначала нужно локализовать возражение, иначе менеджер может отвечать не на ту причину отказа.',
      options: [
        { id: 'o-correct', kind: 'correct', text: 'Уточнить, правильно ли поняли, что клиента останавливает именно цена, и подтвердить это.', explanation: 'Локализуйте причину сомнения и дождитесь ответа до аргументации.' },
        { id: 'o-partial', kind: 'partial', text: 'Спросить «Дорого?», но сразу продолжить оправдывать цену, не дожидаясь ответа.', explanation: 'Вопрос задан, но ответ не получен — причина возражения всё ещё не подтверждена.' },
        { id: 'o-wrong', kind: 'wrong', text: 'Сразу доказывать, что качество выше, не выясняя, что именно не устраивает клиента.', explanation: 'Можно аргументировать не ту причину, которая мешает решению.' },
        { id: 'o-joke', kind: 'joke', text: 'Предложить оплатить разницу похвалой менеджеру.', explanation: 'Шутка не проясняет причину возражения и не помогает клиенту принять решение.' }
      ]
    },
    {
      id: 'next-step', stage: 'Закрытие и возражения', timestampSeconds: 252, timestamp: '04:12',
      sourcePhrase: '«Хорошо, тогда подумайте и, если что, звоните — мы на связи.»',
      prompt: 'Как завершить разговор конкретной договорённостью?',
      explanation: 'Дата и время, понятная цель контакта и согласие клиента превращают разговор в следующий шаг.',
      options: [
        { id: 'n-correct', kind: 'correct', text: 'Назначить конкретные день и время, назвать пользу следующего контакта и получить согласие.', explanation: 'Предложите понятный следующий шаг и договоритесь о времени с клиентом.' },
        { id: 'n-partial', kind: 'partial', text: 'Предложить созвониться в четверг, но не уточнить время и что подготовить.', explanation: 'День предложен, но время и цель контакта остаются неопределёнными.' },
        { id: 'n-wrong', kind: 'wrong', text: 'Оставить решение клиенту: «Подумайте и позвоните, если что».', explanation: 'Без договорённости клиент может остыть, а следующий контакт не состоится.' },
        { id: 'n-joke', kind: 'joke', text: 'Поставить напоминание «позвонить когда-нибудь, если звёзды сойдутся».', explanation: '«Когда-нибудь» не задаёт ни срока, ни действия.' }
      ]
    }
  ];

  var content = document.getElementById('quiz-content');
  var results = document.getElementById('quiz-results');
  var main = document.getElementById('quiz-main');
  var dock = document.getElementById('quiz-dock');
  var allowNavigation = false;
  var state = loadState();

  function freshState() {
    return {
      callId: CALL_ID,
      status: 'in_progress',
      currentIndex: 0,
      answers: QUESTIONS.map(function () { return null; }),
      optionOrder: QUESTIONS.map(function (q) { return shuffle(q.options.map(function (o) { return o.id; })); }),
      earnedPoints: null,
      completedAt: null
    };
  }

  function shuffle(items) {
    for (var i = items.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = items[i]; items[i] = items[j]; items[j] = temp;
    }
    return items;
  }

  function loadState() {
    try {
      var saved = JSON.parse(localStorage.getItem(STORE_KEY));
      if (!saved || saved.callId !== CALL_ID || !Array.isArray(saved.answers) || saved.answers.length !== QUESTIONS.length) {
        return freshState();
      }
      if (!Array.isArray(saved.optionOrder) || saved.optionOrder.length !== QUESTIONS.length) return freshState();
      return saved;
    } catch (e) {
      return freshState();
    }
  }

  function saveState() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) {}
  }

  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function optionById(question, id) {
    return question.options.find(function (option) { return option.id === id; });
  }

  function multiplier(kind) {
    return kind === 'correct' ? 1 : kind === 'partial' ? 0.5 : 0;
  }

  function earnedMultiplierTotal() {
    return state.answers.reduce(function (sum, selectedId, i) {
      if (!selectedId) return sum;
      var option = optionById(QUESTIONS[i], selectedId);
      return sum + (option ? multiplier(option.kind) : 0);
    }, 0);
  }

  function provisionalPoints() {
    return BASE_REWARD * earnedMultiplierTotal() / QUESTIONS.length;
  }

  /* Доля вопроса в очках: полная, половина или ноль. */
  function pointsForContribution(kind) {
    return PER_QUESTION * multiplier(kind);
  }

  /* Та же логика, что в расчёте итога: округление один раз на выходе. */
  function runningTotal() {
    return Math.round(BASE_REWARD * earnedMultiplierTotal() / QUESTIONS.length);
  }

  function fmtPoints(value) {
    return String(Math.round(value * 10) / 10).replace('.', ',');
  }

  /* Русские числительные: 1 очко, 4,8 очка, 9,7 очка, 10 очков, 0 очков.
     Дробь управляет родительным падежом единственного числа
     (девять целых семь десятых очка), поэтому тип указывает формат записи. */
  function plural(value, type) {
    var n = Math.round(value * 10) / 10;
    var raw = String(n).split('.');
    var whole = Math.abs(Number(raw[0]));
    if (type === 'fraction' && raw.length === 2 && Number(raw[1]) !== 0) {
      return 'очка';
    }
    var mod100 = whole % 100;
    var mod10 = whole % 10;
    if (mod100 >= 11 && mod100 <= 14) return 'очков';
    if (mod10 === 1) return 'очко';
    if (mod10 >= 2 && mod10 <= 4) return 'очка';
    return 'очков';
  }

  function resultLine(kind) {
    var pts = pointsForContribution(kind);
    if (kind === 'correct') return '+' + fmtPoints(pts) + ' очка';
    if (kind === 'partial') return '+' + fmtPoints(pts) + ' очка из ' + fmtPoints(PER_QUESTION);
    return '0 очков из ' + fmtPoints(PER_QUESTION);
  }

  function render() {
    if (state.status === 'completed') {
      renderResults();
      return;
    }
    renderQuestion();
  }

  function renderQuestion() {
    var index = Math.max(0, Math.min(QUESTIONS.length - 1, Number(state.currentIndex) || 0));
    state.currentIndex = index;
    var question = QUESTIONS[index];
    var selectedId = state.answers[index];
    var selected = selectedId ? optionById(question, selectedId) : null;
    var order = state.optionOrder[index];
    var answeredCount = state.answers.filter(Boolean).length;
    var pct = Math.round(((index + 1) / QUESTIONS.length) * 100);

    var optionsHTML = order.map(function (id, i) {
      var option = optionById(question, id);
      if (!option) return '';
      var isSelected = option.id === selectedId;
      var isCanonical = option.kind === 'correct';
      var classNames = ['quiz-option'];
      var indicator = '';
      var tag = '';

      if (selected) {
        if (isSelected && isCanonical) {
          classNames.push('is-correct');
          indicator = escapeHTML(GLYPHS.correct);
          tag = 'Верно · ваш ответ';
        } else if (isSelected && option.kind === 'partial') {
          classNames.push('is-partial');
          indicator = escapeHTML(GLYPHS.partial);
          tag = 'Частично · ваш ответ';
        } else if (isSelected) {
          classNames.push('is-selected-wrong');
          indicator = escapeHTML(GLYPHS[option.kind]);
          tag = escapeHTML(TYPE_LABELS[option.kind]) + ' · ваш ответ';
        } else if (isCanonical) {
          /* Выбран неверный вариант — показываем, какой был верным. */
          classNames.push('is-canonical');
          indicator = escapeHTML(GLYPHS.correct);
          tag = 'Верный ответ';
        }
      }

      var metaHTML = tag
        ? '<span class="quiz-option-meta">' +
            (indicator ? '<span class="quiz-option-glyph" aria-hidden="true">' + indicator + '</span>' : '') +
            tag +
          '</span>'
        : '';

      return '<button type="button" class="' + classNames.join(' ') + '"' +
        ' data-answer="' + escapeHTML('e' + i) + '"' +
        ' role="radio" aria-checked="' + (isSelected ? 'true' : 'false') + '"' +
        ' tabindex="' + (i === (order.indexOf(selectedId)) || (!selected && i === 0) ? '0' : '-1') + '"' +
        (selected ? ' disabled' : '') + '>' +
        '<span class="quiz-option-copy">' + escapeHTML(option.text) + metaHTML + '</span>' +
        '</button>';
    }).join('');

    var dockHTML = '';
    if (selected) {
      dockHTML = '<div class="card quiz-feedback" data-od-id="quiz-feedback">' +
        '<div class="quiz-feedback-row">' +
          '<span class="chip ' + (selected.kind === 'correct' ? 'accent' : selected.kind === 'partial' ? 'blue' : 'ghost') + '" data-od-id="quiz-feedback-mark">' +
            '<span class="quiz-feedback-glyph" aria-hidden="true">' + escapeHTML(GLYPHS[selected.kind]) + '</span>' +
            escapeHTML(TYPE_LABELS[selected.kind]) +
          '</span>' +
          '<span class="quiz-feedback-pts mono" data-od-id="quiz-feedback-points">' + resultLine(selected.kind) + '</span>' +
        '</div>' +
        '<p>' + escapeHTML(selected.explanation) + '</p>' +
        '<div class="quiz-running">' +
          '<div class="quiz-running-meta">' +
            '<span class="small muted">Накоплено</span>' +
            '<span class="mono">' + runningTotal() + ' <span class="muted small">из ' + BASE_REWARD + '</span></span>' +
          '</div>' +
          '<div class="bar thin"><i style="width:' + Math.round(runningTotal() / BASE_REWARD * 100) + '%"></i></div>' +
          '<span class="small muted">У каждого вопроса равная доля: ' + fmtPoints(PER_QUESTION) + ' очка</span>' +
        '</div>' +
        '<button type="button" class="btn accent quiz-next" id="quiz-next" data-od-id="btn-quiz-next">' + (index === QUESTIONS.length - 1 ? 'Завершить квиз' : 'Дальше') + '</button>';
    }

    var progressText = answeredCount + ' из ' + QUESTIONS.length + ' отвечено';
    content.hidden = false;
    results.hidden = true;
    main.classList.toggle('has-dock', Boolean(selected));
    dock.hidden = !selected;
    dock.innerHTML = dockHTML;
    content.innerHTML =
      '<div class="quiz-progress" aria-label="Ход квиза">' +
        '<div class="quiz-progress-meta"><strong>Вопрос ' + (index + 1) + ' из ' + QUESTIONS.length + '</strong><span>' + progressText + '</span></div>' +
        '<div class="bar"><i style="width:' + pct + '%"></i></div>' +
      '</div>' +
      '<section class="quiz-source" data-od-id="quiz-source-phrase">' +
        '<div class="between"><span class="eyebrow">' + escapeHTML(question.stage) + '</span><span class="mono small muted">' + escapeHTML(question.timestamp) + '</span></div>' +
        '<blockquote class="quote">' + escapeHTML(question.sourcePhrase) + '</blockquote>' +
      '</section>' +
      '<h2 class="quiz-question" id="question-title">' + escapeHTML(question.prompt) + '</h2>' +
      '<div class="quiz-options" role="radiogroup" aria-labelledby="question-title">' + optionsHTML + '</div>';

    var buttons = Array.prototype.slice.call(content.querySelectorAll('[data-answer]'));
    var focusIndex = selectedId ? order.indexOf(selectedId) : 0;

    function moveFocus(delta) {
      if (!buttons.length || state.answers[index]) return;
      focusIndex = (focusIndex + delta + buttons.length) % buttons.length;
      buttons[focusIndex].focus();
    }

    buttons.forEach(function (button, i) {
      button.addEventListener('click', function () {
        choose(buttons[i], i);
      });
      button.addEventListener('keydown', function (event) {
        var key = event.key;
        if (key === 'ArrowDown' || key === 'ArrowRight') { event.preventDefault(); moveFocus(1); }
        else if (key === 'ArrowUp' || key === 'ArrowLeft') { event.preventDefault(); moveFocus(-1); }
      });
    });

    function choose(button) {
      var entryId = button.getAttribute('data-answer');
      var slot = Number(String(entryId).slice(1));
      var id = state.optionOrder[index][slot];
      if (!id || state.answers[index]) return;
      state.answers[index] = id;
      state.status = 'in_progress';
      saveState();
      renderQuestion();
      /* Выбранный вариант подтягиваем на вид, чтобы плавающая панель его не закрыла. */
      var picked = content.querySelector('[data-answer="' + entryId + '"]');
      if (picked) scrollAfterAnswer(picked);
    }

    function scrollAfterAnswer(element) {
      var dockTop = dock.getBoundingClientRect().top;
      var box = element.getBoundingClientRect();
      var gap = 12;
      if (box.bottom > dockTop - gap) {
        window.scrollBy({ top: box.bottom - dockTop + gap, behavior: 'smooth' });
      } else if (box.top < gap) {
        window.scrollBy({ top: box.top - gap, behavior: 'smooth' });
      }
    }

    var next = document.getElementById('quiz-next');
    if (next) {
      next.addEventListener('click', goNext);
      next.focus();
    }
  }

  function goNext() {
    if (!state.answers[state.currentIndex]) return;
    if (state.currentIndex < QUESTIONS.length - 1) {
      state.currentIndex += 1;
      saveState();
      renderQuestion();
      window.scrollTo(0, 0);
      return;
    }
    state.status = 'completed';
    state.earnedPoints = Math.round(BASE_REWARD * earnedMultiplierTotal() / QUESTIONS.length);
    state.completedAt = new Date().toISOString();
    saveState();
    renderResults();
    window.scrollTo(0, 0);
  }

  function renderResults() {
    main.classList.remove('has-dock');
    dock.hidden = true;
    dock.innerHTML = '';
    content.hidden = true;
    results.hidden = false;
    var list = QUESTIONS.map(function (question, i) {
      var selected = optionById(question, state.answers[i]);
      var correct = question.options.find(function (o) { return o.kind === 'correct'; });
      var resultText = selected.kind === 'correct' ? 'Верно' : selected.kind === 'partial' ? 'Частично' : '0 очков';
      var canonical = selected.kind === 'correct' ? '' : '<p><strong>Эталон:</strong> ' + escapeHTML(correct.text) + '</p>';
      return '<article class="quiz-result-item" data-od-id="quiz-result-' + escapeHTML(question.id) + '">' +
        '<div class="between"><div><div class="eyebrow">' + escapeHTML(question.stage) + ' · ' + escapeHTML(question.timestamp) + '</div>' +
        '<h3 style="margin-top:5px">' + escapeHTML(question.prompt) + '</h3></div>' +
        '<div class="quiz-result-score">' +
          '<span class="chip ' + (selected.kind === 'correct' ? 'accent' : selected.kind === 'partial' ? 'blue' : 'ghost') + '" data-od-id="quiz-result-' + escapeHTML(question.id) + '-mark">' +
            '<span class="quiz-feedback-glyph" aria-hidden="true">' + escapeHTML(GLYPHS[selected.kind]) + '</span>' +
            escapeHTML(resultText) +
          '</span>' +
          '<span class="quiz-result-mark mono">' + fmtPoints(pointsForContribution(selected.kind)) + ' ' + plural(1, 'whole') + ' из ' + fmtPoints(PER_QUESTION) + '</span>' +
        '</div></div>' +
        '<p><strong>Ваш ответ:</strong> ' + escapeHTML(selected.text) + '</p>' + canonical +
        '<p>' + escapeHTML(selected.explanation) + '</p></article>';
    }).join('');

    var correctCount = state.answers.reduce(function (n, id, i) {
      var option = optionById(QUESTIONS[i], id);
      return n + (option && option.kind === 'correct' ? 1 : 0);
    }, 0);
    var encouragement = correctCount === QUESTIONS.length
      ? 'Все ответы верны — сильная работа с ключевыми этапами звонка.'
      : 'Разбор ответов поможет закрепить следующий шаг в похожем разговоре.';

    results.innerHTML =
      '<section class="card quiz-result-hero" data-od-id="quiz-result-summary">' +
        '<div class="eyebrow">Квиз завершён · звонок #' + CALL_ID + '</div>' +
        '<div class="big">' + Number(state.earnedPoints || 0) + ' <span class="small muted">из ' + BASE_REWARD + '</span></div>' +
        '<p class="muted">очков начислено за ответы</p>' +
        '<p style="margin-top:12px;font-size:13px">' + escapeHTML(encouragement) + '</p>' +
      '</section>' +
      '<div class="sec"><h2>Результат по вопросам</h2><span class="small muted mono">' + QUESTIONS.length + ' / ' + QUESTIONS.length + '</span></div>' +
      '<div class="quiz-result-list">' + list + '</div>' +
      '<div class="quiz-result-actions"><a class="btn accent" href="call-detail.html" data-od-id="btn-return-to-call">Вернуться к разбору звонка</a></div>';
    if (window.App && typeof window.App.hydrate === 'function') window.App.hydrate();
  }

  function discardAttempt() {
    try { localStorage.removeItem(STORE_KEY); } catch (e) {}
    state.status = 'abandoned';
  }

  function proceed() {
    allowNavigation = true;
    return true;
  }

  /* Один обработчик на документ: он переживает перерисовку экрана, поэтому
     предупреждение о выходе действительно срабатывает. */
  function bindExitGuards() {
    if (bindExitGuards.bound) return;
    bindExitGuards.bound = true;

    document.addEventListener('click', function (event) {
      var link = event.target.closest && event.target.closest('a[href]');
      if (!link) return;
      var href = link.getAttribute('href') || '';
      if (href.charAt(0) === '#') return;
      if (link.target === '_blank') return;
      if (state.status === 'completed') return;
      if (!confirm(EXIT_COPY.replace('{href}', href))) {
        event.preventDefault();
        return;
      }
      discardAttempt();
      proceed();
    });
  }

  function init() {
    bindExitGuards();
    render();
    /* Общие данные шапки подтягиваются после отрисовки разметки. */
    if (window.App && typeof window.App.hydrate === 'function') window.App.hydrate();
  }

  if (state.status === 'in_progress') saveState();
  init();
})();

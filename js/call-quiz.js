(function () {
  'use strict';

  var CALL_ID = '54115';
  var BASE_REWARD = 58;
  var STORE_KEY = 'callQuiz:v2:' + CALL_ID;
  var LETTERS = ['А', 'Б', 'В', 'Г'];
  var TYPE_LABELS = {
    correct: 'Верно',
    partial: 'Частично · 50%',
    wrong: 'Неверно · 0 очков',
    joke: 'Шуточный ответ · 0 очков'
  };

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

  function textForContribution(kind) {
    if (kind === 'correct') return '1/6 доли награды';
    if (kind === 'partial') return '1/12 доли награды';
    return '0 долей награды';
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
      var className = 'quiz-option';
      var meta = '';
      if (selected) {
        if (option.kind === 'correct') {
          className += option.kind === 'correct' ? ' is-correct' : '';
          meta = option.id === selectedId ? 'Верно · полная доля' : 'Правильный ответ';
        } else if (isSelected && option.kind === 'partial') {
          className += ' is-partial'; meta = 'Частично · половина доли';
        } else if (isSelected) {
          className += ' is-selected-wrong'; meta = TYPE_LABELS[option.kind];
        }
      }
      return '<button type="button" class="' + className + '" data-option-id="' + escapeHTML(option.id) + '"' + (selected ? ' disabled' : '') + '>' +
        '<span class="quiz-letter" aria-hidden="true">' + LETTERS[i] + '</span>' +
        '<span class="quiz-option-copy">' + escapeHTML(option.text) + (meta ? '<span class="quiz-option-meta">' + escapeHTML(meta) + '</span>' : '') + '</span>' +
        '</button>';
    }).join('');

    var dockHTML = '';
    if (selected) {
      var resultLine = selected.kind === 'correct' ? 'Полная доля вопроса' : selected.kind === 'partial' ? 'Половина доли вопроса' : 'Доля вопроса не начисляется';
      dockHTML = '<div class="quiz-feedback" role="status"><strong>' + escapeHTML(TYPE_LABELS[selected.kind]) + ' — ' + escapeHTML(resultLine) + '</strong>' +
        '<p>' + escapeHTML(selected.explanation) + '</p>' +
        '<span class="mono">' + escapeHTML(textForContribution(selected.kind)) + ' · промежуточный результат</span></div>' +
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
      '<div class="quiz-options" role="group" aria-labelledby="question-title">' + optionsHTML + '</div>';

    content.querySelectorAll('[data-option-id]').forEach(function (button) {
      button.addEventListener('click', function () {
        if (state.answers[index]) return;
        state.answers[index] = this.getAttribute('data-option-id');
        state.status = 'in_progress';
        saveState();
        renderQuestion();
      });
    });

    var next = document.getElementById('quiz-next');
    if (next) next.addEventListener('click', goNext);
    bindExitWarning();
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
        '<div class="quiz-result-score">' + escapeHTML(textForContribution(selected.kind)) + '<span class="quiz-result-mark">' + escapeHTML(resultText) + '</span></div></div>' +
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
    bindExitWarning();
  }

  function discardAttempt() {
    try { localStorage.removeItem(STORE_KEY); } catch (e) {}
    state.status = 'abandoned';
  }

  function bindExitWarning() {
    var back = document.getElementById('quiz-back');
    if (back && !back.dataset.quizBound) {
      back.dataset.quizBound = 'true';
      back.addEventListener('click', function (event) {
        if (state.status === 'completed') return;
        if (!window.confirm('Квиз не завершён. При выходе попытка сбросится без начисления; при новом старте придётся пройти всё заново. Выйти?')) {
          event.preventDefault();
          return;
        }
        discardAttempt();
        allowNavigation = true;
      });
    }
    content.querySelectorAll('[data-quiz-exit]').forEach(function (link) {
      if (link.dataset.quizBound) return;
      link.dataset.quizBound = 'true';
      link.addEventListener('click', function (event) {
        if (state.status === 'completed') return;
        if (!window.confirm('Квиз не завершён. При выходе попытка сбросится без начисления; при новом старте придётся пройти всё заново. Перейти к записи?')) {
          event.preventDefault();
          return;
        }
        discardAttempt();
        allowNavigation = true;
      });
    });
  }

  window.addEventListener('beforeunload', function (event) {
    if (state.status === 'completed' || allowNavigation) return;
    event.preventDefault();
    event.returnValue = '';
  });

  if (state.status === 'in_progress') saveState();
  render();
})();

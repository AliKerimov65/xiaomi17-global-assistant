/* Global Assistant PWA — каталог, состояние, рендер */
(function () {
  'use strict';

  /* ================================================================
     ДАННЫЕ КАТАЛОГА
     level: safe (без риска) · warn (внимание) · deep (разблок./root)
     ================================================================ */
  const SECTIONS = [
    {
      id: 'stock',
      tab: 'A · Сток',
      anchor: 'tab-stock',
      verdict: 'safe',
      verdictText: 'Без разблокировки · гарантия сохранена',
      intro: 'Базовый сценарий для <strong>любой</strong> версии прошивки: китайский мусор удаляется через Shizuku, ставятся сервисы Google, ассистентом становится <strong>Gemini</strong>, Circle to Search возвращается через MiCTS. Система останется англоязычной — русского в CN-прошивке нет физически.'
    },
    {
      id: 'unlock',
      tab: 'B · Разблокировка',
      anchor: 'tab-unlock',
      verdict: 'risk',
      verdictText: 'Требует версию ≤3.0.45 или 3.0.3xx до июнь.2026',
      intro: 'Официальная разблокировка CN-аппаратов иностранцу недоступна. Рабочий путь — <strong>бесплатный GBL/efisp-эксплойт</strong> для семейства Snapdragon 8 Elite Gen 5. Классический метод <strong>стирает все данные</strong>. Android 17 и июльский патч 2026+ не разблокируются.'
    },
    {
      id: 'rom',
      tab: 'C · xiaomi.eu',
      anchor: 'tab-rom',
      verdict: 'risk',
      verdictText: 'Полная мультиязычность · 27 языков',
      intro: 'Прошивка <strong>xiaomi.eu для POPSICLE</strong> — это и есть «глобальная версия» для этой модели: русский и ещё 26 языков, предустановленные GMS, никакого китайского bloatware, Gemini-стек вместо XiaoAI, рабочие Android Auto и Wallet.'
    },
    {
      id: 'root',
      tab: 'D · Root и банки',
      anchor: 'tab-root',
      verdict: 'deep',
      verdictText: 'KernelSU · Play Integrity · модули',
      intro: 'Root на Android 16 через <strong>KernelSU-Next</strong> и GKI-ядро, плюс стек модулей для прохождения Play Integrity — после этого работают банковские приложения и Google Wallet. Помните: GKI-ядро прошивается в <code>boot</code>, LKM-патч — в <code>init_boot</code>.'
    },
    {
      id: 'stores',
      tab: 'Магазины',
      anchor: 'tab-stores',
      verdict: 'safe',
      verdictText: 'Мультиязычные магазины приложений',
      intro: '<strong>Авто-режим:</strong> каталог ниже скачивает APK напрямую из приложения — версии и ссылки подтягиваются автоматически с GitHub и F-Droid, устанавливать сами магазины не нужно. Ниже — классические магазины (Aurora, Obtainium, RuStore и др.) для тех, кто хочет полноценную витрину: все они <strong>мультиязычны</strong> и работают на HyperOS как на CN-прошивке, так и на xiaomi.eu.'
    },
    {
      id: 'debloat',
      tab: 'Деблоат',
      anchor: 'tab-debloat',
      verdict: 'safe',
      verdictText: 'Сканер · безопасное удаление · очистка остатков',
      intro: '<strong>Интерактивный сканер</strong> китайских приложений CN-прошивки: вставьте вывод <code>pm list packages</code> — приложение сверит его с базой из ~70 пакетов, покажет, что установлено именно на вашем смартфоне, рассортирует по риску удаления и выдаст готовые команды, включая <strong>очистку остатков</strong>. Ничего не удаляется автоматически — вы выполняете команды сами через Termux/Shizuku или ADB с ПК.'
    },
    {
      id: 'ref',
      tab: 'Справка',
      anchor: 'tab-ref',
      verdict: 'ref',
      verdictText: 'Источники и утилиты ПК',
      intro: 'Агрегаторы прошивок для popsicle, драйверы, platform-tools и профильные ветки сообществ — всё, что понадобится на ПК и для сверки информации.'
    }
  ];

  const ITEMS = [
    /* ---------- ДЕБЛОАТ ---------- */
    {
      id: 'db-setup', sec: 'debloat', level: 'safe', levelText: 'шаг 1',
      name: 'Где выполнять команды', src: 'Termux + Shizuku / ADB',
      tagline: 'Два способа: прямо на телефоне или с ПК',
      desc: 'Команды сканера выполняются там, где есть shell-доступ. <strong>Вариант на телефоне:</strong> установите Termux из авто-каталога (магазины) и приложение <code>rish</code>/Shizuku — команды <code>pm</code> будут работать локально через Shizuku. <strong>Вариант с ПК:</strong> обычный <code>adb shell</code> по кабелю или Wi-Fi. Оба варианта не требуют root и не снимают гарантию.',
      steps: [
        'На телефоне: Termux + Shizuku запущен → <code>rish</code> даёт shell-права внутри Termux.',
        'С ПК: <code>adb shell</code> → выполняйте команды сканера как есть.',
        'Все операции — только для user 0: данные не стираются у других пользователей/клонов.',
        'Перед массовым удалением сделайте скриншот списка — это ваша «карта отката».'
      ],
      links: [
        { label: 'Termux · прямая APK (авто-каталог)', url: '#tab-stores' },
        { label: 'Shizuku · GitHub', url: 'https://github.com/RikkaApps/Shizuku/releases', primary: true }
      ]
    },
    {
      id: 'db-rules', sec: 'debloat', level: 'warn', levelText: 'правила',
      name: 'Правила безопасного деблоата', src: 'чеклист',
      tagline: 'Что можно, что нельзя, и как не получить бутлуп',
      desc: 'Сканер намеренно консервативен: красные пакеты (Security, SystemUI, PowerKeeper, Mi Account, PackageInstaller, Launcher, камера) <strong>не отмечаются</strong> — их удаление ломает систему или превращает аппарат в кирпич до перепрошивки. Жёлтые — функциональные (погода, галерея, заметки, клавиатуры): удаляйте, только если поставили замену. Зелёные — чистый CN-мусор и реклама.',
      steps: [
        'Никогда не удаляйте: com.miui.securitycenter, com.miui.systemui, com.miui.powerkeeper, com.xiaomi.account, com.miui.packageinstaller, com.miui.home (без замены лаунчера).',
        'Сначала замена — потом удаление: Gboard до удаления CN-клавиатур, Fossify Gallery до Галереи Mi, Chrome до Mi Browser.',
        'Удаляйте порциями по 5–8 пакетов и проверяйте, что система работает: звонки, уведомления, перезагрузка.',
        'XiaoAI-пакеты (voiceassist и ко) — только после того, как Gemini назначен ассистентом по умолчанию.'
      ],
      note: { type: 'warn', html: '<strong>OTA-предупреждение:</strong> системные обновления могут вернуть удалённые CN-приложения. Если планируете оставаться на стоке и обновляться — деблоат придётся повторять; на xiaomi.eu этой проблемы нет.' },
      links: [
        { label: 'Universal Debloat List (справочник)', url: 'https://github.com/Universal-Debloater-Alliance/universal-android-debloater-next-generation' }
      ]
    },
    {
      id: 'db-cleanup', sec: 'debloat', level: 'safe', levelText: 'шаг 3',
      name: 'Очистка остатков после удаления', src: 'сканер → кнопка «+ очистка»',
      tagline: 'Кэш, данные user 0 и мусор на общем хранилище',
      desc: '<code>pm uninstall --user 0</code> убирает приложение, но оставляет следы: кэш в <code>/data/data</code>, папки в <code>/sdcard/Android/data</code>, логи MIUI. Кнопка сканера «+ очистка остатков» генерирует расширенный набор команд: <code>pm clear</code> для каждого удалённого пакета, удаление типовых CN-директорий (miui, MIUI/debug_log) и поиск остаточных папок по имени пакета.',
      steps: [
        'Сгенерируйте команды «+ очистка» сразу после удаления — пока список свежий.',
        '<code>pm clear --user 0</code> безопасен: чистит только данные удалённого приложения.',
        'Папки на /sdcard удаляются через Termux или любой файловый менеджер (Material Files из авто-каталога).',
        'Финал: перезагрузка — ядро сбрасывает кэши dex, интерфейс пересобирается чистым.'
      ],
      links: []
    },

    /* ---------- A · СТОК ---------- */
    {
      id: 'updater-off', sec: 'stock', level: 'warn', levelText: 'первым шагом',
      name: 'Удалить системный апдейтер', src: 'ADB / Shizuku',
      tagline: 'Защита от принудительного «фьюзинга» загрузчика',
      desc: 'Xiaomi рассылает <strong>принудительные «тихие» обновления</strong> даже при выключенном автообновлении. Прошивки выше 3.0.45 отключают раздел efisp, а полное OTA может прошить аппаратные qfuse — после этого разблокировка невозможна <strong>навсегда</strong>. Выполните до любых других шагов, даже если «пока просто думаете».',
      steps: [
        'Включите <strong>параметры разработчика</strong>: Настройки → О телефоне → 7 нажатий на «Версия ОС».',
        'Включите <strong>отладку по USB</strong> (или беспроводную отладку) и подключитесь к ПК.',
        'Выполните команду ниже. Ответ <code>Success</code> = апдейтер удалён, пункт «Обновление» перестанет открываться.'
      ],
      cmd: 'adb shell pm uninstall --user 0 com.android.updater',
      note: { type: 'danger', html: '<strong>Не обновляйте систему ни при каких условиях.</strong> Если апдейтер вернётся после сброса — удалите снова. Вернуть его можно командой <code>pm install-existing com.android.updater</code>.' },
      links: [
        { label: 'Google Platform Tools', url: 'https://developer.android.com/tools/releases/platform-tools', primary: true },
        { label: 'XDA · гайд по эксплойту', url: 'https://xdaforums.com/t/free-xiaomi-17-series-redmi-k90-pro-max-bootloader-unlock-no-disassembly.4781471/' }
      ]
    },
    {
      id: 'shizuku', sec: 'stock', level: 'safe', levelText: 'уровень 0',
      name: 'Shizuku', src: 'RikkaApps · GitHub',
      tagline: 'Даёт приложениям права shell без root — основа деблоата',
      desc: 'Сервис, который предоставляет сторонним приложениям API уровня shell через ADB или <strong>беспроводную отладку</strong> — без root и без ПК при каждом запуске. Актуальные версии поддерживают Android 16. Без Shizuku не работают Canta, SetEdit-записи и часть других инструментов.',
      steps: [
        'Установите APK из GitHub Releases (кнопка ниже).',
        'Настройки → Параметры разработчика → <strong>Беспроводная отладка</strong> → «Сопряжение устройства с кодом».',
        'Откройте Shizuku → «Запуск через беспроводную отладку» → введите код сопряжения в уведомлении.',
        'Проверка: статус «Shizuku работает». После перезагрузки запуск повторяется (без root — это норма).'
      ],
      links: [
        { label: 'Скачать APK · GitHub', url: 'https://github.com/RikkaApps/Shizuku/releases', primary: true }
      ]
    },
    {
      id: 'canta', sec: 'stock', level: 'safe', levelText: 'уровень 0',
      name: 'Canta', src: 'samolego · GitHub',
      tagline: 'Удаление китайского bloatware с маркировкой безопасности',
      desc: 'Деблоатер на базе Shizuku со встроенным <strong>Universal Android Debloat List</strong>: каждый пакет помечен как Recommended / Advanced / Expert / Unsafe / Unsupported. Удаление идёт через <code>pm uninstall --user 0</code> — обратимо командой <code>pm install-existing</code>, данные системы не затрагиваются.',
      steps: [
        'Установите APK, запустите, выдайте доступ Shizuku.',
        'Фильтр «Recommended» — безопасно удаляйте китайские сервисы: Mi Video, Mi Music, GetApps-витрины, CN-браузер.',
        '<strong>Не трогайте</strong>: Безопасность (Security), SystemUI, настройки, телефон/смс — удаление ломает функции.',
        'Список удалённого сохраните скриншотом — пригодится для восстановления.'
      ],
      links: [
        { label: 'Скачать APK · GitHub', url: 'https://github.com/samolego/Canta/releases', primary: true },
        { label: 'Universal Debloat List', url: 'https://github.com/Universal-Debloater-Alliance/universal-android-debloater-next-generation' }
      ]
    },
    {
      id: 'gms', sec: 'stock', level: 'safe', levelText: 'уровень 0',
      name: 'Google-сервисы и Play Store', src: 'GetApps / APK',
      tagline: 'Play Store, Gmail, Карты, FCM-уведомления',
      desc: 'На CN-прошивке GMS не предустановлены, но каркас совместим: Google Play ставится прямо из китайского магазина <strong>GetApps</strong> (поиск «Google Play») либо APK-набором. После установки критично настроить энергосбережение, иначе HyperOS будет убивать push-уведомления.',
      steps: [
        'GetApps → поиск «Google Play» → установить, войти в аккаунт.',
        'Каждому Google-приложению: Настройки → Приложения → <strong>Автозапуск: вкл</strong>, Батарея: <strong>Нет ограничений</strong>.',
        'В recents «закрепите» важные мессенджеры свайпом вниз (замочек).',
        'Проверьте уведомления: FCM должен доставлять сразу, без открытия приложения.'
      ],
      links: [
        { label: 'Google Play (APKMirror)', url: 'https://www.apkmirror.com/apk/google-inc/google-play-store/', primary: true }
      ]
    },
    {
      id: 'gemini', sec: 'stock', level: 'safe', levelText: 'уровень 0',
      name: 'Gemini — ассистент по умолчанию', src: 'Google',
      tagline: 'Мультиязычный AI вместо китайского XiaoAI',
      desc: 'XiaoAI переключить на другой язык <strong>невозможно</strong> — только китайский. Замена: назначить Gemini системным цифровым ассистентом — тогда удержание кнопки питания/жест вызывает его, полностью на русском. XiaoAI после этого можно отключить или снести через Canta.',
      steps: [
        'Установите <strong>Gemini</strong> из Play Store, войдите в аккаунт.',
        'Настройки → Приложения → <strong>Приложения по умолчанию</strong> → Цифровой ассистент → выберите Google/Gemini.',
        'Проверьте вызов: удержание кнопки питания или свайп от угла (зависит от настроек жестов).',
        'Опционально: Canta → удалить VoiceAssist/XiaoAI-пакеты (метка Advanced).'
      ],
      links: [
        { label: 'Gemini · Play Store', url: 'https://play.google.com/store/apps/details?id=com.google.android.apps.bard', primary: true }
      ]
    },
    {
      id: 'micts', sec: 'stock', level: 'safe', levelText: 'уровень 0',
      name: 'MiCTS — Circle to Search', src: 'parallelcc · GitHub',
      tagline: 'Возвращает CtS на CN-прошивку, Android 9–16',
      desc: 'Утилита триггерит <strong>Circle to Search</strong> на устройствах, где Google его не отдаёт из-за региона. Работает без root: запуск приложения или тайл в шторке вызывает CtS. С LSPosed-модулем добавляется нативный жест — долгое нажатие на полоску навигации, как на глобальных аппаратах.',
      steps: [
        'Установите APK MiCTS из GitHub Releases, запустите один раз.',
        'Проверьте: открылся ли Circle to Search. Если нет — следуйте встроенной справке (спуф fingerprint для Google, флаг GMS <code>45631784</code>).',
        'Добавьте <strong>тайл MiCTS</strong> в быстрые настройки для вызова в один тап.',
        'Для жеста долгого нажатия нужен LSPosed — см. раздел «Root и банки».'
      ],
      links: [
        { label: 'Скачать APK · GitHub', url: 'https://github.com/parallelcc/MiCTS/releases', primary: true }
      ]
    },
    {
      id: 'setedit', sec: 'stock', level: 'safe', levelText: 'уровень 0',
      name: 'SetEdit — локали приложений', src: '4A · Play Store',
      tagline: 'Русский язык в пользовательских приложениях',
      desc: 'MoreLocale 2 на HyperOS сломан с марта 2024 — вместо него используется SetEdit с правом WRITE_SECURE_SETTINGS через Shizuku: запись <code>system_locale = ru-RU</code> переводит приложения, где русские ресурсы физически есть (почти все из Play Store). <strong>Системные меню HyperOS останутся английскими</strong> — русских ресурсов в CN-сборке нет.',
      steps: [
        'Установите SetEdit, выдайте WRITE_SECURE_SETTINGS (приложение покажет ADB-команду, либо через Shizuku-форк).',
        'Найдите ключ <code>system_locale</code> → установите значение <code>ru-RU</code>.',
        'Перезагрузите устройство и проверьте несколько приложений.',
        'Откат: значение <code>en-US</code> или удаление ключа.'
      ],
      links: [
        { label: 'SetEdit · Play Store', url: 'https://play.google.com/store/apps/details?id=by4a.setedit22', primary: true }
      ]
    },

    /* ---------- B · РАЗБЛОКИРОВКА ---------- */
    {
      id: 'version-check', sec: 'unlock', level: 'warn', levelText: 'обязательно',
      name: 'Сверить версию прошивки', src: 'Настройки → О телефоне',
      tagline: 'Разблокируемо: ≤3.0.45 или 3.0.3xx с патчем ≤ июнь 2026',
      desc: 'Нумерация неочевидна: <strong>3.0.45 — старше, чем 3.0.304</strong> (45 &lt; 300). Мартовский инструмент работает на ≤3.0.45; июльский — на линейке 3.0.3xx под Android 16 с патчем безопасности <strong>февраль–июнь 2026</strong>. Июльский патч и новее, а также любой Android 17 — неразблокируемы. Отдельная модель Xiaomi 17 Max эксплойтом <strong>не поддерживается</strong> — не путайте с 17 Pro Max.',
      steps: [
        'Настройки → О телефоне → запишите «Версия ОС» (например OS3.0.45.0.WPBCNXM) и «Уровень патча безопасности».',
        '≤3.0.45 → используйте мартовский one-click tool.',
        '3.0.300–3.0.3xx, Android 16, патч ≤ июнь 2026 → июльский новый инструмент из той же ветки XDA.',
        'Выше → не обновляйтесь дальше, заморозьте апдейтер и следите за веткой XDA.'
      ],
      note: { type: 'warn', html: '<strong>Покупаете аппарат «с рук»?</strong> Требуйте скриншот «О телефоне» до оплаты — реселлеры массово обновляют сток, и аппарат может оказаться неразблокируемым.' },
      links: [
        { label: 'XDA · ветка эксплойта', url: 'https://xdaforums.com/t/free-xiaomi-17-series-redmi-k90-pro-max-bootloader-unlock-no-disassembly.4781471/', primary: true }
      ]
    },
    {
      id: 'backup', sec: 'unlock', level: 'warn', levelText: 'обязательно',
      name: 'Полный бэкап данных', src: 'ПК / облако',
      tagline: 'Классическая разблокировка стирает устройство полностью',
      desc: 'Разблокировка one-click методом выполняет <strong>полный сброс</strong>: фото, мессенджеры, 2FA, банковские ключи — всё удаляется. Заранее: фото и файлы на ПК, WhatsApp/Telegram-бэкапы в облако, экспорт 2FA (Aegis → файл, Google Authenticator → перенос), пароли — в менеджер. Существует метод data-retention (июльский, через CVE-2026-43499), но он для опытных и рискованнее.',
      steps: [
        'Фото/видео/документы → на ПК по USB (режим передачи файлов).',
        'Мессенджеры: встроенные облачные бэкапы + экспорт важных чатов.',
        '2FA: экспорт/перенос <strong>до</strong> сброса, иначе потеряете доступ к аккаунтам.',
        'Банковские приложения: убедитесь, что сможете перевыпустить вход.'
      ],
      links: []
    },
    {
      id: 'unlock-tool', sec: 'unlock', level: 'deep', levelText: 'необратимо',
      name: 'One-click GBL/efisp-эксплойт', src: 'XDA · Win / macOS',
      tagline: 'Бесплатная разблокировка загрузчика без разборки',
      desc: 'Эксплойт использует загрузку библиотеки GBL из раздела <strong>efisp</strong> без проверки подписи: исполняется неподписанный UEFI-код и выставляются флаги <code>is_unlocked</code>/<code>is_unlocked_critical</code>. Инструмент «plug-and-play»: включить USB-отладку, подключить к ПК, запустить скрипт. Есть Windows-версия (.bat из ветки XDA) и macOS-версия на GitHub.',
      steps: [
        'Выйдите из Mi-аккаунта, отключите «Найти устройство», <strong>снимите блокировку экрана и отпечатки</strong>.',
        'Включите USB-отладку, подключите к ПК, установите драйверы (через Xiaomi Flash Tool — снимает 90% проблем).',
        'Запустите инструмент для вашей версии (мартовский ≤3.0.45 / июльский для 3.0.3xx) и следуйте экрану.',
        'После перезагрузки: значок открытого замка при старте = загрузчик разблокирован.'
      ],
      cmd: 'fastboot getvar unlocked',
      note: { type: 'danger', html: '<strong>Не отключайте кабель во время процедуры.</strong> Зависание в fastboot почти всегда лечится драйверами и повторным запуском, а не паникой.' },
      links: [
        { label: 'XDA · инструмент и зеркала', url: 'https://xdaforums.com/t/free-xiaomi-17-series-redmi-k90-pro-max-bootloader-unlock-no-disassembly.4781471/', primary: true },
        { label: 'macOS-версия · GitHub', url: 'https://github.com/GomezJuanPablo/Xiaomi17PM_MacOSBootloader' }
      ]
    },
    {
      id: 'ncunlock', sec: 'unlock', level: 'warn', levelText: 'опция',
      name: 'NCUnlock — платный удалённый анлок', src: 'сервис · ~$30–100',
      tagline: 'Если бесплатный метод вашу версию не берёт',
      desc: 'Коммерческие сервисы разблокируют удалённо: вы ставите UltraViewer/ToDesk, оператор подключается к вашему ПК и выполняет процедуру. Цена зависит от сценария (от ~$30–40, доходит до ~$100). Минусы: посторонний получает <strong>полный контроль над вашим ПК и телефоном</strong>, никаких гарантий. Используйте только при невозможности бесплатного пути и с отдельного/чистого ПК.',
      steps: [
        'Сначала проверьте бесплатный эксплойт — для 17 Pro Max он работает на большинстве версий.',
        'Если всё же сервис: отдельный ПК или чистая Windows-сессия, никаких личных данных.',
        'Не передавайте доступ к банковским приложениям и почте.'
      ],
      links: [
        { label: 'NCUnlock · услуга', url: 'https://ncunlock.com/product/unlock-bootloader-xiaomi-without-7-days/' }
      ]
    },

    /* ---------- C · XIAOMI.EU ---------- */
    {
      id: 'eu-rom', sec: 'rom', level: 'deep', levelText: 'fastboot',
      name: 'Прошивка xiaomi.eu POPSICLE', src: 'xiaomi.eu · mifirm',
      tagline: '27 языков включая русский, GMS из коробки, без CN-мусора',
      desc: 'Комьюнити-ROM на базе китайской HyperOS: удалены китайские сервисы, предустановлены полноценные GMS, добавлены <strong>27 языков интерфейса включая русский</strong>. Распространяется как fastboot-пакет со скриптом установки. По отчётам пользователей на 17 Pro Max работают камера, Android Auto, Google Wallet и банковские приложения (после integrity-фиксов).',
      steps: [
        'Скачайте пакет для <strong>popsicle</strong> (гибридная сборка xiaomi.eu, см. mifirm).',
        'Распакуйте на ПК, загрузите телефон в fastboot (питание + громкость вниз).',
        'Запустите скрипт из архива под вашу ОС; дождитесь окончания и перезагрузки.',
        'Первый запуск: выберите русский язык, войдите в Google-аккаунт, проверьте связь и камеру.'
      ],
      note: { type: 'warn', html: '<strong>OTA от Xiaomi на xiaomi.eu не используются</strong> — обновления ставятся вручную новыми пакетами из ветки релиза. Перед обновлением — бэкап.' },
      links: [
        { label: 'mifirm · прошивки popsicle', url: 'https://mifirm.net/model/popsicle.ttt', primary: true },
        { label: 'xiaomi.eu · опыт пользователей', url: 'https://xiaomi.eu/community/threads/thanks-xiaomi-17-pro-max-xiaomi-eu-rom-is-great.76506/' },
        { label: 'Ветка релизов HyperOS 3.0', url: 'https://xiaomi.eu/community/threads/hyperos-3-0-stable-release.76151/' }
      ]
    },
    {
      id: 'eu-post', sec: 'rom', level: 'safe', levelText: 'чеклист',
      name: 'Настройка после прошивки', src: '30–40 минут',
      tagline: 'Gemini, CtS, уведомления, банковские приложения',
      desc: 'После установки xiaomi.eu пройдите чеклист: язык и регион, Google-аккаунт и синхронизация, ассистент по умолчанию (Gemini), проверка Circle to Search, автозапуск и батарея для мессенджеров, установка банковских приложений и проверка их запуска. Что-то не завелось — добро пожаловать в раздел «Root и банки».',
      steps: [
        'Язык: Русский; регион: ваш; часовой пояс и номеронабиратель.',
        'Gemini → ассистент по умолчанию; проверка вызова удержанием питания.',
        'Circle to Search: на xiaomi.eu обычно работает нативно; если нет — MiCTS из раздела «Сток».',
        'Банки/Wallet: если ругаются на безопасность — нужен integrity-стек (раздел D).'
      ],
      links: []
    },

    /* ---------- D · ROOT ---------- */
    {
      id: 'kernelsu', sec: 'root', level: 'deep', levelText: 'root',
      name: 'KernelSU-Next + GKI-ядро', src: 'GitHub · WildKernels',
      tagline: 'Kernel-based root для Android 16, ядро 6.12',
      desc: 'Root через <strong>KernelSU-Next</strong> (менеджер модулей с Magic Mount/metamodule) поверх GKI-ядра. Готовые сборки с SUSFS — у WildKernels для ветки <code>android16-6.12</code>. Критично: <strong>GKI-ядро прошивается в раздел boot, LKM-патч KernelSU — в init_boot</strong>; путаница разделов — типичная причина бутлупа.',
      steps: [
        'Скачайте образ ядра для вашей версии прошивки (ветка android16-6.12, SUSFS).',
        '<code>fastboot flash boot &lt;образ&gt;</code> — для GKI-варианта; либо LKM-патч в <code>init_boot</code>.',
        'Установите менеджер KernelSU-Next (APK), проверьте статус «Installed».',
        'Держите под рукой стоковый boot-образ — возврат из бутлупа одной командой.'
      ],
      cmd: 'fastboot flash boot boot.img',
      note: { type: 'danger', html: '<strong>boot ≠ init_boot.</strong> Прошили GKI-ядро в init_boot — получите бутлуп. Лечится: <code>fastboot flash boot</code> стоковым образом вашей версии.' },
      links: [
        { label: 'KernelSU-Next · GitHub', url: 'https://github.com/KernelSU-Next/KernelSU-Next', primary: true },
        { label: 'WildKernels GKI SUSFS', url: 'https://github.com/WildKernels/GKI_KernelSU_SUSFS' }
      ]
    },
    {
      id: 'integrity', sec: 'root', level: 'deep', levelText: 'модули',
      name: 'Play Integrity: PIF + Tricky Addon + HMA', src: 'GitHub',
      tagline: 'Банковские приложения и Google Wallet на рутованном аппарате',
      desc: 'Связка модулей для прохождения проверок Google: <strong>PlayIntegrityFix</strong> (подмена ответов), <strong>Tricky Addon</strong> (управление keybox target-list), <strong>Hide-My-Applist</strong> (сокрытие root-артефактов от банков), поверх — ZygiskNext и LSPosed-форк JingMatrix. Это «кошки-мышки»: после серверных обновлений Google методы временно отваливаются и обновляются сообществом.',
      steps: [
        'ZygiskNext → LSPosed (JingMatrix) → перезагрузка.',
        'PlayIntegrityFix + Tricky Addon: актуальный keybox (ищется в теме модуля).',
        'Hide-My-Applist: скройте менеджер root и модули от банковских приложений.',
        'Проверка: integrity-checker из Play Store — минимум MEETS_DEVICE_INTEGRITY, затем реальные банки и Wallet.'
      ],
      links: [
        { label: 'PlayIntegrityFix · GitHub', url: 'https://github.com/chiteroman/PlayIntegrityFix', primary: true },
        { label: 'LSPosed (JingMatrix)', url: 'https://github.com/JingMatrix/LSPosed' },
        { label: 'Hide-My-Applist', url: 'https://github.com/Dr-TSNG/Hide-My-Applist' }
      ]
    },
    {
      id: 'hyperceiler', sec: 'root', level: 'deep', levelText: 'модуль',
      name: 'HyperCeiler', src: 'ReChronoRain · GitHub',
      tagline: 'Сотни переключателей тонкой настройки HyperOS',
      desc: 'LSPosed-модуль кастомизации HyperOS: интерфейс, жесты, шторка, экран блокировки, поведение системы — сотни опций, адаптирован под HyperOS 3.0 / Android 16. Ставится после root + LSPosed. Меняйте параметры небольшими группами с перезагрузкой — так проще локализовать конфликт.',
      steps: [
        'Требуется: root (KernelSU-Next) + активный LSPosed.',
        'Установите APK HyperCeiler, активируйте модуль в LSPosed, перезагрузитесь.',
        'Настройки применяйте порциями; конфликтующие опции модуль подсвечивает.'
      ],
      links: [
        { label: 'HyperCeiler · GitHub', url: 'https://github.com/ReChronoRain/HyperCeiler', primary: true }
      ]
    },
    {
      id: 'micts-lsposed', sec: 'root', level: 'deep', levelText: 'модуль',
      name: 'MiCTS-модуль: CtS по жесту', src: 'parallelcc · GitHub',
      tagline: 'Долгое нажатие на полоску навигации — как на глобале',
      desc: 'С активным LSPosed MiCTS превращается в полноценную замену: Circle to Search вызывается <strong>долгим нажатием на полоску жестов</strong>, как на пикселях и глобальных HyperOS. Для срабатывания Google должен «видеть» поддерживаемое устройство — модуль делает спуф fingerprint, флаг GMS <code>45631784</code> включается через GMS-Flags.',
      steps: [
        'Установите MiCTS (APK) + активируйте его модуль в LSPosed.',
        'В настройках MiCTS: триггер «долгое нажатие на handle навигации».',
        'Проверьте на любой странице: выделение текста по кругу работает.'
      ],
      links: [
        { label: 'MiCTS · GitHub', url: 'https://github.com/parallelcc/MiCTS', primary: true }
      ]
    },

    /* ---------- МАГАЗИНЫ ---------- */
    {
      id: 'store-aurora', sec: 'stores', level: 'safe', levelText: 'ru · en',
      name: 'Aurora Store', src: 'Aurora OSS · GitHub',
      tagline: 'Каталог Google Play анонимно, без Google-аккаунта',
      desc: 'Открытый (GPLv3) клиент Play Store со <strong>всем каталогом Google</strong>: скачивание и обновление бесплатных приложений через анонимные сессии — свой аккаунт не нужен, работает и без Google Play Services. Есть спуф устройства и региона для доступа к геозаблокированным приложениям, интеграция Exodus Privacy (видны трекеры в APK). Интерфейс переведён, в т.ч. на русский. Ограничения: платные приложения не скачиваются анонимно, анонимные сессии иногда ограничиваются Google — лечится ротацией или входом со своим аккаунтом.',
      steps: [
        'Установите APK из GitHub Releases (или через F-Droid).',
        'На старте выберите <strong>анонимный вход</strong> — аккаунт Google не требуется.',
        'Настройки → язык интерфейса; при геоблоках — спуф региона/устройства.',
        'Платные купленные приложения: войдите своим Google-аккаунтом (опционально).'
      ],
      links: [
        { label: 'Скачать APK · GitHub', url: 'https://github.com/whyorean/AuroraStore/releases', primary: true },
        { label: 'auroraoss.com', url: 'https://auroraoss.com/' }
      ]
    },
    {
      id: 'store-obtainium', sec: 'stores', level: 'safe', levelText: 'ru · en',
      name: 'Obtainium', src: 'ImranR98 · GitHub',
      tagline: 'Обновления приложений напрямую с источника — GitHub, F-Droid, RuStore',
      desc: '«Магазин без магазина»: ставит и <strong>обновляет приложения прямо со страниц релизов</strong> — GitHub, GitLab, F-Droid, APKPure, Aptoide, Uptodown, RuStore, Huawei AppGallery и десятки других источников, включая прямые APK-ссылки. Идеально для инструментов этого гайда: Shizuku, Canta, MiCTS и KernelSU-Next обновляются сами, без ручной проверки GitHub. Интерфейс мультиязычный, русская локализация активно поддерживается сообществом. При десятках GitHub-приложений добавьте Personal Access Token, чтобы не упираться в rate limit API.',
      steps: [
        'Установите APK из GitHub Releases, при желании сверьте SHA-256 сертификата (на странице проекта).',
        '«Добавить приложение» → вставьте ссылку на репозиторий/страницу — источник определится сам.',
        'Готовые конфигурации: каталог apps.obtainium.imranr.dev — импорт в один тап.',
        'Включите фоновую проверку обновлений — уведомления о новых релизах придут сами.'
      ],
      links: [
        { label: 'Скачать APK · GitHub', url: 'https://github.com/ImranR98/Obtainium/releases', primary: true },
        { label: 'Каталог конфигураций', url: 'https://apps.obtainium.imranr.dev/' }
      ]
    },
    {
      id: 'store-fdroid', sec: 'stores', level: 'safe', levelText: '30+ языков',
      name: 'F-Droid', src: 'F-Droid Ltd / Commons Conservancy',
      tagline: 'Эталонный репозиторий свободных приложений без аккаунта',
      desc: 'Классический FOSS-магазин: тысячи приложений с открытым кодом, <strong>без регистрации, трекинга и рекламы</strong>; «анти-функции» (реклама, трекеры) честно помечаются в описании. Сайт и клиент переведены более чем на 30 языков, включая русский. Клиент умеет прокси и Tor, офлайн-раздачу приложений по Wi-Fi/Bluetooth. Внимание к подписям: приложение из F-Droid подписано ключом F-Droid — поверх него не встанет сборка с GitHub, и наоборот.',
      steps: [
        'Скачайте APK только с официального f-droid.org, установите.',
        'При первом запуске дождитесь загрузки репозитория (2–10 минут).',
        'Разрешите F-Droid установку из неизвестных источников; браузеру после этого можно запретить.',
        'Обновления приходят через сам клиент — автообновление по умолчанию выключено.'
      ],
      links: [
        { label: 'Скачать APK · f-droid.org', url: 'https://f-droid.org/F-Droid.apk', primary: true },
        { label: 'Каталог · f-droid.org', url: 'https://f-droid.org/en/packages/' }
      ]
    },
    {
      id: 'store-droidify', sec: 'stores', level: 'safe', levelText: 'ru · en',
      name: 'Droid-ify', src: 'Droid-ify · GitHub',
      tagline: 'Быстрый Material 3 клиент для F-Droid',
      desc: 'Неофициальный клиент к репозиторию F-Droid: тот же каталог FOSS-приложений, но <strong>заметно быстрее и современнее</strong> официального — Material 3, Material You-темы, фоновая синхронизация, добавление сторонних репозиториев по QR-коду. Русская локализация на месте. Хорошая замена стоковому клиенту, если F-Droid кажется медленным.',
      steps: [
        'Установите APK из GitHub Releases (или с f-droid.org).',
        'Репозиторий F-Droid подключён по умолчанию; сторонние репы — Настройки → Репозитории.',
        'Включите автообновление в настройках, если хотите «поставил и забыл».'
      ],
      links: [
        { label: 'Скачать APK · GitHub', url: 'https://github.com/Droid-ify/client/releases', primary: true },
        { label: 'Страница на F-Droid', url: 'https://f-droid.org/en/packages/com.looker.droidify/' }
      ]
    },
    {
      id: 'store-apkmirror', sec: 'stores', level: 'safe', levelText: 'en · web',
      name: 'APKMirror', src: 'Illogical Robot · веб',
      tagline: 'Проверенные APK с историей версий и контролем подписей',
      desc: 'Не магазин, а эталонный <strong>архив APK</strong>: все файлы проходят криптографическую проверку подписей, для каждого приложения доступна история версий, варианты архитектур (arm64 и т.д.) и требования к Android. Незаменим, когда нужна конкретная старая версия или приложение, которого нет в вашем регионе. Интерфейс английский, но навигация элементарная. Для bundles (APKM) используйте их установщик APKMirror Installer.',
      steps: [
        'Найдите приложение → выберите версию → вариант <strong>arm64-v8a</strong>, APK (не bundle, если сомневаетесь).',
        'Скачанное ставится штатным установщиком HyperOS.',
        'Для .apkm-файлов: установите APKMirror Installer из Play Store или с самого APKMirror.'
      ],
      links: [
        { label: 'apkmirror.com', url: 'https://www.apkmirror.com/', primary: true }
      ]
    },
    {
      id: 'store-rustore', sec: 'stores', level: 'safe', levelText: 'ru',
      name: 'RuStore', src: 'VK · официальный магазин РФ',
      tagline: 'Русскоязычная витрина: банки, госуслуги, локальные сервисы',
      desc: 'Официальный российский магазин приложений: полностью <strong>русскоязычный интерфейс</strong>, обязательная модерация приложений, вся локальная экосистема — банки, маркетплейсы, госсервисы, игры. На китайском Xiaomi ставится обычным APK и работает без дополнительных настроек. Дополняет Aurora/F-Droid там, где нужны именно российские сервисы; заграничный Play Store их часто не показывает.',
      steps: [
        'Скачайте APK с официального rustore.ru и установите.',
        'Войдите с VK ID или номером телефона — нужен для покупок и части функций.',
        'Проверьте настройки энергосбережения: RuStore → автозапуск вкл, батарея «нет ограничений», чтобы обновления приходили вовремя.'
      ],
      links: [
        { label: 'Скачать APK · rustore.ru', url: 'https://www.rustore.ru/', primary: true }
      ]
    },

    /* ---------- СПРАВКА ---------- */
    {
      id: 'platform-tools', sec: 'ref', level: 'info', levelText: 'ПК',
      name: 'Google Platform Tools', src: 'Android Developers',
      tagline: 'Официальные adb и fastboot для Windows / macOS / Linux',
      desc: 'Единственный правильный источник adb/fastboot — официальная страница Google. Сторонние «ADB installer» часто тащат устаревшие бинарники, на которых fastboot-команды семейства SM8850 ведут себя непредсказуемо. Распакуйте, добавьте в PATH, проверьте <code>adb version</code>.',
      links: [
        { label: 'Скачать · Google', url: 'https://developer.android.com/tools/releases/platform-tools', primary: true }
      ]
    },
    {
      id: 'drivers', sec: 'ref', level: 'info', levelText: 'ПК',
      name: 'Драйверы Xiaomi (через Flash Tool)', src: 'Xiaomi',
      tagline: 'Лечит 90% зависаний в fastboot и «device not found»',
      desc: 'Большинство неудач при разблокировке и прошивке — не эксплойт, а драйверы. Установка Xiaomi Flash Tool подтягивает корректные Qualcomm/Xiaomi-драйверы; после этого <code>fastboot devices</code> должен видеть аппарат стабильно. На macOS драйверы не нужны — только platform-tools.',
      links: []
    },
    {
      id: 'mifirm', sec: 'ref', level: 'info', levelText: 'агрегатор',
      name: 'mifirm / xmfirmwareupdater', src: 'агрегаторы прошивок',
      tagline: 'Вся история fastboot-пакетов для popsicle',
      desc: 'Полная история прошивок модели: стоковые fastboot-пакеты CN (от OS3.0.16 до актуальных 3.0.3xx) и гибридные сборки xiaomi.eu. Нужен стоковый boot-образ для отката из бутлупа или сверки версии — берите здесь. Сверяйте codename: <strong>popsicle</strong>, иначе прошьёте чужой образ.',
      links: [
        { label: 'mifirm · popsicle', url: 'https://mifirm.net/model/popsicle.ttt', primary: true }
      ]
    },
    {
      id: 'community', sec: 'ref', level: 'info', levelText: 'сообщества',
      name: 'XDA · xiaomi.eu · 4PDA', src: 'форумы',
      tagline: 'Живые ветки по 17 Pro Max — сверяйтесь перед действиями',
      desc: 'Три источника истины: ветка эксплойта разблокировки на XDA (апдейты по версиям и фьюзам), форум xiaomi.eu (релизы и баги прошивки для popsicle), 4PDA (русскоязычный опыт, инструкции, ответы). Правила игры меняются каждые несколько месяцев — перед разблокировкой перечитайте свежие страницы ветки XDA.',
      links: [
        { label: 'XDA · разблокировка 17-й серии', url: 'https://xdaforums.com/t/free-xiaomi-17-series-redmi-k90-pro-max-bootloader-unlock-no-disassembly.4781471/', primary: true },
        { label: 'xiaomi.eu · форум', url: 'https://xiaomi.eu/community/' }
      ]
    }
  ];

  /* ================================================================
     АВТО-РЕЖИМ: встроенный каталог с прямой загрузкой APK
     github: "owner/repo" → api.github.com (последний релиз, .apk-ассет)
     fdroid: "package.id" → f-droid.org API v1 (suggestedVersion → APK)
     direct: статичная прямая ссылка · web: только страница
     ================================================================ */
  const AUTO_APPS = [
    /* — Инструменты устройства — */
    { aid: 'shizuku', cat: 'tools', name: 'Shizuku', tag: 'Права shell без root — основа деблоата',
      alias: 'shizuku шизуку adb права', github: 'RikkaApps/Shizuku', fdroid: 'moe.shizuku.privileged.api',
      web: 'https://shizuku.rikka.app/' },
    { aid: 'canta', cat: 'tools', name: 'Canta', tag: 'Удаление китайского bloatware (UAD-список)',
      alias: 'canta канта деблоат удаление bloatware', github: 'samolego/Canta', fdroid: 'org.samo_lego.canta',
      web: 'https://github.com/samolego/Canta' },
    { aid: 'micts', cat: 'tools', name: 'MiCTS', tag: 'Circle to Search на CN-прошивке',
      alias: 'micts circle to search поиск кругом', github: 'parallelcc/MiCTS',
      web: 'https://github.com/parallelcc/MiCTS' },
    { aid: 'kernelsu', cat: 'tools', name: 'KernelSU-Next', tag: 'Менеджер root и модулей (Android 16)',
      alias: 'kernelsu рут root модули', github: 'KernelSU-Next/KernelSU-Next',
      web: 'https://github.com/KernelSU-Next/KernelSU-Next' },
    { aid: 'hyperceiler', cat: 'tools', name: 'HyperCeiler', tag: 'Тонкая настройка HyperOS (LSPosed)',
      alias: 'hyperceiler настройка hyperos модуль', github: 'ReChronoRain/HyperCeiler',
      web: 'https://github.com/ReChronoRain/HyperCeiler' },
    { aid: 'termux', cat: 'tools', name: 'Termux', tag: 'Терминал: ADB-команды прямо с телефона',
      alias: 'termux терминал adb команды консоль', github: 'termux/termux-app', fdroid: 'com.termux',
      web: 'https://termux.dev/' },
    { aid: 'setedit', cat: 'tools', name: 'SetEdit', tag: 'Локали приложений (system_locale → ru-RU)',
      alias: 'setedit локаль язык русский locale', web: 'https://play.google.com/store/apps/details?id=by4a.setedit22' },
    /* — Магазины (сами ставятся прямо отсюда) — */
    { aid: 'aurora', cat: 'stores', name: 'Aurora Store', tag: 'Каталог Google Play анонимно, без аккаунта',
      alias: 'aurora аврора google play плей маркет', github: 'whyorean/AuroraStore', fdroid: 'com.aurora.store',
      web: 'https://auroraoss.com/' },
    { aid: 'obtainium', cat: 'stores', name: 'Obtainium', tag: 'Автообновления приложений с источника',
      alias: 'obtainium обновления github релизы', github: 'ImranR98/Obtainium',
      web: 'https://github.com/ImranR98/Obtainium' },
    { aid: 'droidify', cat: 'stores', name: 'Droid-ify', tag: 'Быстрый Material 3 клиент F-Droid',
      alias: 'droidify дроидифай fdroid фдроид', github: 'Droid-ify/client', fdroid: 'com.looker.droidify',
      web: 'https://github.com/Droid-ify/client' },
    { aid: 'fdroid', cat: 'stores', name: 'F-Droid', tag: 'Эталонный FOSS-репозиторий без аккаунта',
      alias: 'fdroid фдроид foss свободные', direct: 'https://f-droid.org/F-Droid.apk',
      web: 'https://f-droid.org/' },
    { aid: 'rustore', cat: 'stores', name: 'RuStore', tag: 'Русскоязычная витрина: банки, сервисы РФ',
      alias: 'rustore рустор банки россия', web: 'https://www.rustore.ru/' },
    /* — Повседневные — */
    { aid: 'aegis', cat: 'daily', name: 'Aegis Authenticator', tag: '2FA-коды с экспортом — перед сбросом!',
      alias: 'aegis 2fa двухфакторка коды', github: 'beemdevelopment/Aegis', fdroid: 'com.beemdevelopment.aegis',
      web: 'https://getaegis.app/' },
    { aid: 'keepassdx', cat: 'daily', name: 'KeePassDX', tag: 'Пароли локально, мультиязычный',
      alias: 'keepass пароли менеджер', github: 'Kunzisoft/KeePassDX', fdroid: 'com.kunzisoft.keepass.free',
      web: 'https://www.keepassdx.com/' },
    { aid: 'localsend', cat: 'daily', name: 'LocalSend', tag: 'Передача файлов на ПК без кабеля',
      alias: 'localsend файлы передача wifi airdrop', github: 'localsend/localsend', fdroid: 'org.localsend.localsend_app',
      web: 'https://localsend.org/' },
    { aid: 'newpipe', cat: 'daily', name: 'NewPipe', tag: 'YouTube без рекламы и аккаунта',
      alias: 'newpipe ютуб видео без рекламы', github: 'TeamNewPipe/NewPipe', fdroid: 'org.schabi.newpipe',
      web: 'https://newpipe.net/' },
    { aid: 'matfiles', cat: 'daily', name: 'Material Files', tag: 'Файловый менеджер вместо CN-проводника',
      alias: 'material files файлы менеджер проводник', fdroid: 'me.zhanghai.android.files',
      web: 'https://github.com/zhanghai/MaterialFiles' },
    { aid: 'fossify-gallery', cat: 'daily', name: 'Fossify Gallery', tag: 'Галерея вместо китайской «Галереи Mi»',
      alias: 'fossify gallery галерея фото замена', github: 'FossifyOrg/Gallery', fdroid: 'org.fossify.gallery',
      web: 'https://github.com/FossifyOrg/Gallery' },
    { aid: 'wireguard', cat: 'daily', name: 'WireGuard', tag: 'VPN-туннель, официальный клиент',
      alias: 'wireguard vpn впрн туннель', fdroid: 'com.wireguard.android',
      web: 'https://www.wireguard.com/' }
  ];

  const AUTO_CATS = { tools: 'инструмент', stores: 'магазин', daily: 'ежедневное' };
  const STORE_CACHE_KEY = 'ga-store-v1';
  const STORE_TTL = 6 * 3600 * 1000;

  function storeCacheRead() {
    try { return JSON.parse(localStorage.getItem(STORE_CACHE_KEY)) || {}; }
    catch (e) { return {}; }
  }
  function storeCacheWrite(aid, entry) {
    const c = storeCacheRead();
    c[aid] = Object.assign({}, entry, { ts: Date.now() });
    try { localStorage.setItem(STORE_CACHE_KEY, JSON.stringify(c)); } catch (e) {}
  }

  function pickApkAsset(assets) {
    const apks = (assets || []).filter((a) => /\.apk$/i.test(a.name));
    if (!apks.length) return null;
    const score = (a) => {
      const n = a.name.toLowerCase();
      let s = 0;
      if (n.indexOf('universal') !== -1) s += 4;
      if (n.indexOf('arm64') !== -1) s += 3;
      if (n.indexOf('release') !== -1) s += 2;
      if (n.indexOf('x86') !== -1) s -= 5;
      if (n.indexOf('source') !== -1) s -= 5;
      return s;
    };
    return apks.slice().sort((a, b) => score(b) - score(a))[0];
  }

  function fetchJSON(url) {
    const opts = { headers: { 'Accept': 'application/json' } };
    if (typeof AbortSignal !== 'undefined' && AbortSignal.timeout) {
      opts.signal = AbortSignal.timeout(8000);
    }
    return fetch(url, opts)
      .then((r) => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); });
  }

  /* Резолвер: возвращает {v, url, size, src, icon} или null */
  function resolveApp(app) {
    const cached = storeCacheRead()[app.aid];
    const fresh = cached && (Date.now() - cached.ts < STORE_TTL);
    if (fresh) return Promise.resolve(Object.assign({ cached: true }, cached));

    let attempt;
    if (app.github) {
      attempt = fetchJSON('https://api.github.com/repos/' + app.github + '/releases/latest')
        .then((rel) => {
          const asset = pickApkAsset(rel.assets);
          if (!asset) throw new Error('no apk');
          return { v: (rel.tag_name || rel.name || '').replace(/^v/i, ''), url: asset.browser_download_url,
                   size: asset.size, src: 'GitHub' };
        })
        .catch((e) => {
          if (app.fdroid) return resolveFdroid(app.fdroid);
          throw e;
        });
    } else if (app.fdroid) {
      attempt = resolveFdroid(app.fdroid);
    } else if (app.direct) {
      attempt = Promise.resolve({ v: '', url: app.direct, size: 0, src: 'прямая ссылка · официальный источник' });
    } else {
      attempt = Promise.reject(new Error('web only'));
    }

    return attempt
      .then((res) => { storeCacheWrite(app.aid, res); return res; })
      .catch((e) => {
        if (cached) return Object.assign({ cached: true, stale: true }, cached);
        return null;
      });
  }

  function resolveFdroid(pkg) {
    return fetchJSON('https://f-droid.org/api/v1/packages/' + pkg)
      .then((d) => {
        const code = String(d.suggestedVersionCode || '');
        if (!code) throw new Error('no version');
        let name = d.suggestedVersionName || '';
        if (!name && d.packages && d.packages[code]) name = d.packages[code].versionName || '';
        return { v: name, url: 'https://f-droid.org/repo/' + pkg + '_' + code + '.apk',
                 size: 0, src: 'F-Droid', icon: 'https://f-droid.org/repo/icons-640/' + pkg + '.' + code + '.png' };
      });
  }

  function autoCardHTML(app) {
    const letter = app.name.trim().charAt(0).toUpperCase();
    const pageUrl = app.web || (app.github ? 'https://github.com/' + app.github : 'https://f-droid.org/en/packages/' + app.fdroid + '/');
    return '' +
      '<div class="a-card" data-aid="' + app.aid + '" data-search="' + esc((app.name + ' ' + app.tag + ' ' + app.alias).toLowerCase()) + '">' +
        '<div class="a-ico" data-ico>' + esc(letter) + '</div>' +
        '<div class="a-main">' +
          '<div class="a-name">' + esc(app.name) + '<span class="a-cat">' + AUTO_CATS[app.cat] + '</span></div>' +
          '<div class="a-tag">' + esc(app.tag) + '</div>' +
          '<div class="a-meta" data-meta>версия: проверка…</div>' +
        '</div>' +
        '<div class="a-btns">' +
          '<a class="a-dl is-disabled" data-dl href="#" rel="noopener">APK</a>' +
          '<a class="a-page" href="' + pageUrl + '" target="_blank" rel="noopener noreferrer" aria-label="Страница проекта">' + EXT_SVG + '</a>' +
        '</div>' +
      '</div>';
  }

  function paintResolved(card, app, res) {
    const meta = card.querySelector('[data-meta]');
    const dl = card.querySelector('[data-dl]');
    const ico = card.querySelector('[data-ico]');
    if (res && res.url) {
      let txt = res.src + (res.v ? ' · v' + res.v : '');
      if (res.size) txt += ' · ' + (res.size / 1048576).toFixed(1) + ' МБ';
      if (res.stale || (res.cached && !navigator.onLine)) txt += ' · кэш';
      meta.textContent = txt;
      meta.classList.add('ok');
      dl.href = res.url;
      dl.classList.remove('is-disabled');
      dl.setAttribute('target', '_blank');
      if (res.icon) {
        const img = document.createElement('img');
        img.src = res.icon; img.alt = '';
        img.onload = () => { ico.innerHTML = ''; ico.appendChild(img); ico.classList.add('has-img'); };
      }
    } else {
      meta.textContent = app.web ? 'прямая ссылка недоступна — откройте страницу' : 'источник недоступен';
      meta.classList.add('fail');
      if (app.web) {
        dl.textContent = 'Сайт';
        dl.href = app.web;
        dl.classList.remove('is-disabled');
        dl.setAttribute('target', '_blank');
        dl.classList.add('a-dl-web');
      }
    }
  }

  function initAutoStore() {
    const grid = $('#autoGrid');
    if (!grid) return;
    grid.innerHTML = AUTO_APPS.map(autoCardHTML).join('');
    const resolved = {};
    const io = ('IntersectionObserver' in window)
      ? new IntersectionObserver((entries) => {
          entries.forEach((en) => {
            if (!en.isIntersecting) return;
            const card = en.target;
            const aid = card.dataset.aid;
            io.unobserve(card);
            if (resolved[aid]) return;
            resolved[aid] = true;
            const app = AUTO_APPS.find((a) => a.aid === aid);
            resolveApp(app).then((res) => paintResolved(card, app, res));
          });
        }, { rootMargin: '200px' })
      : null;
    grid.querySelectorAll('.a-card').forEach((card) => {
      if (io) io.observe(card);
      else {
        const aid = card.dataset.aid;
        resolved[aid] = true;
        const app = AUTO_APPS.find((a) => a.aid === aid);
        resolveApp(app).then((res) => paintResolved(card, app, res));
      }
    });
    /* поиск */
    const search = $('#autoSearch');
    if (search) {
      search.addEventListener('input', () => {
        const q = search.value.trim().toLowerCase();
        grid.querySelectorAll('.a-card').forEach((card) => {
          card.style.display = (!q || card.dataset.search.indexOf(q) !== -1) ? '' : 'none';
        });
      });
    }
    /* принудительное обновление версий */
    const refresh = $('#autoRefresh');
    if (refresh) {
      refresh.addEventListener('click', () => {
        try { localStorage.removeItem(STORE_CACHE_KEY); } catch (e) {}
        grid.querySelectorAll('.a-card').forEach((card) => {
          const aid = card.dataset.aid;
          const app = AUTO_APPS.find((a) => a.aid === aid);
          const meta = card.querySelector('[data-meta]');
          meta.textContent = 'версия: проверка…';
          meta.classList.remove('ok', 'fail');
          resolved[aid] = true;
          resolveApp(app).then((res) => paintResolved(card, app, res));
        });
        toast('Версии обновляются…');
      });
    }
  }

  /* ================================================================
     ДЕБЛОАТ: база CN-пакетов + сканер + очистка остатков
     risk: green (безопасно) · yellow (подумать) · red (не трогать)
     ================================================================ */
  const DEBLOAT_DB = [
    /* — Магазины и витрины — */
    { pkg: 'com.xiaomi.mipicks', name: 'GetApps (китайский магазин)', cat: 'stores', risk: 'green', note: 'Реклама и CN-витрина. Замена: Aurora Store / F-Droid.' },
    { pkg: 'com.mi.global.shop', name: 'Mi Store', cat: 'stores', risk: 'green', note: 'Магазин устройств Xiaomi, не нужен за пределами КНР.' },
    { pkg: 'com.mi.global.bbs', name: 'Mi Community', cat: 'stores', risk: 'green', note: 'Форум-приложение, только китайский.' },
    { pkg: 'com.xiaomi.joyose', name: 'Joyose (аналитика/трекинг)', cat: 'sys-extra', risk: 'green', note: 'Фоновый сбор телеметрии и «игровые» сервисы CN.' },
    /* — Медиа CN — */
    { pkg: 'com.miui.video', name: 'Mi Video (小米视频)', cat: 'media', risk: 'green', note: 'CN-видеосервис с рекламой.' },
    { pkg: 'com.miui.player', name: 'Mi Music (小米音乐)', cat: 'media', risk: 'green', note: 'CN-музыкальный сервис.' },
    { pkg: 'com.mi.globalbrowser', name: 'Mi Browser', cat: 'media', risk: 'yellow', note: 'Если пользуетесь Chrome — удаляйте. Некоторые CN-ссылки открываются в нём по умолчанию.' },
    { pkg: 'com.duokan.reader', name: 'Duokan Reader (多看阅读)', cat: 'media', risk: 'green', note: 'CN-читалка книг.' },
    /* — Игры и развлечения — */
    { pkg: 'com.xiaomi.glgm', name: 'Игры Xiaomi (游戏中心)', cat: 'media', risk: 'green', note: 'CN-игровой центр.' },
    { pkg: 'com.miui.videoplayer', name: 'Видеоплеер (компонент)', cat: 'media', risk: 'red', note: 'Системный кодек-плеер, используется другими приложениями.' },
    /* — Аналитика и реклама — */
    { pkg: 'com.miui.analytics', name: 'Analytics (аналитика MIUI)', cat: 'sys-extra', risk: 'green', note: 'Сбор статистики использования.' },
    { pkg: 'com.miui.msa.global', name: 'MSA (рекламный сервис)', cat: 'sys-extra', risk: 'yellow', note: 'Рекламный идентификатор. После удаления проверьте, что приложения не падают; вернуть: pm install-existing.' },
    { pkg: 'com.miui.daemon', name: 'MiuiDaemon (фоновые CN-сервисы)', cat: 'sys-extra', risk: 'yellow', note: 'Фоновые задачи CN-экосистемы.' },
    { pkg: 'com.miui.systemAdSolution', name: 'Рекламные решения (AdSolution)', cat: 'sys-extra', risk: 'green', note: 'Встроенная реклама в системных приложениях.' },
    { pkg: 'com.miui.hybrid', name: 'Quick Apps (快应用)', cat: 'sys-extra', risk: 'green', note: 'CN-платформа «быстрых приложений» — источник рекламных пушей.' },
    { pkg: 'com.miui.hybrid.accessory', name: 'Quick Apps Accessory', cat: 'sys-extra', risk: 'green', note: 'Компаньон Quick Apps.' },
    /* — AI и голос (CN) — */
    { pkg: 'com.miui.voiceassist', name: 'XiaoAI (голосовой ассистент)', cat: 'ai', risk: 'yellow', note: 'Только китайский. Удаляйте после настройки Gemini как ассистента по умолчанию.' },
    { pkg: 'com.miui.voicetrigger', name: 'Voice Trigger (активация голосом)', cat: 'ai', risk: 'yellow', note: '«Привет, XiaoAI». Не нужен без XiaoAI.' },
    { pkg: 'com.xiaomi.aiasst.service', name: 'AI-сервисы Xiaomi', cat: 'ai', risk: 'yellow', note: 'Фоновые AI-сервисы CN (переводчик, субтитры).' },
    { pkg: 'com.xiaomi.aicr', name: 'AI Call / AI Call Recorder', cat: 'ai', risk: 'green', note: 'CN-функции звонков с AI.' },
    { pkg: 'com.miui.audiomonitor', name: 'Audio Monitor', cat: 'ai', risk: 'green', note: 'Прослушивание окружения для XiaoAI.' },
    /* — CN-утилиты — */
    { pkg: 'com.miui.weather2', name: 'Погода (CN-сервисы)', cat: 'cn-utils', risk: 'yellow', note: 'Виджет погоды на рабочем столе зависит от него. Замена: Google Weather.' },
    { pkg: 'com.miui.calculator', name: 'Калькулятор Mi', cat: 'cn-utils', risk: 'yellow', note: 'Удобный, но есть альтернативы в Play Store.' },
    { pkg: 'com.miui.notes', name: 'Заметки Mi', cat: 'cn-utils', risk: 'yellow', note: 'Если не пользуетесь — удаляйте. Замена: Google Keep.' },
    { pkg: 'com.miui.compass', name: 'Компас', cat: 'cn-utils', risk: 'green', note: '' },
    { pkg: 'com.miui.screenrecorder', name: 'Запись экрана (Mi)', cat: 'cn-utils', risk: 'yellow', note: 'Штатный рекордер экрана HyperOS.' },
    { pkg: 'com.miui.soundrecorder', name: 'Диктофон (Mi)', cat: 'cn-utils', risk: 'yellow', note: '' },
    { pkg: 'com.miui.scanner', name: 'Сканер (扫一扫)', cat: 'cn-utils', risk: 'green', note: 'CN-сканер QR/документов. Замена: Google Lens.' },
    { pkg: 'com.mi.health', name: 'Mi Health / Здоровье', cat: 'cn-utils', risk: 'yellow', note: 'Если носите Mi Band через Zepp Life — оставьте.' },
    { pkg: 'com.xiaomi.wearable', name: 'Xiaomi Wear / Носимые', cat: 'cn-utils', risk: 'yellow', note: 'Нужен только с CN-версиями носимых устройств.' },
    { pkg: 'com.miui.fm', name: 'FM-радио', cat: 'cn-utils', risk: 'green', note: '' },
    { pkg: 'com.miui.miservice', name: 'Mi Services (CN-услуги)', cat: 'cn-utils', risk: 'yellow', note: 'Фоновые CN-сервисы (доставка, такси в Пиксель-записных).' },
    { pkg: 'com.miui.misound', name: 'Mi Sound / Dirac', cat: 'cn-utils', risk: 'red', note: 'Аудиодвижок — после удаления возможны проблемы со звуком.' },
    /* — Сервисы Xiaomi — */
    { pkg: 'com.xiaomi.account', name: 'Mi Account', cat: 'xiaomi-svc', risk: 'red', note: 'Удаление ломает облако, темы и «Найти устройство». Оставьте.' },
    { pkg: 'com.xiaomi.xmsf', name: 'Xiaomi Service Framework', cat: 'xiaomi-svc', risk: 'red', note: 'Ядро CN-пушей и Mi-аккаунта.' },
    { pkg: 'com.xiaomi.xmsfkeeper', name: 'XMSF Keeper', cat: 'xiaomi-svc', risk: 'red', note: 'Держатель сервис-фреймворка.' },
    { pkg: 'com.xiaomi.market', name: 'Mi Market (витрина)', cat: 'xiaomi-svc', risk: 'green', note: 'CN-витрина внутри GetApps.' },
    { pkg: 'com.xiaomi.payment', name: 'Mi Pay / Оплата', cat: 'xiaomi-svc', risk: 'yellow', note: 'CN-платежи; без китайской карты бесполезен.' },
    { pkg: 'com.miui.micloudsync', name: 'Mi Cloud Sync', cat: 'xiaomi-svc', risk: 'yellow', note: 'Синхронизация CN-облака. Если не пользуетесь — удаляйте.' },
    { pkg: 'com.miui.cloudservice', name: 'Mi Cloud Service', cat: 'xiaomi-svc', risk: 'yellow', note: 'То же: нужен только для CN-облака.' },
    { pkg: 'com.xiaomi.simactivate.service', name: 'SIM Activate (CN)', cat: 'xiaomi-svc', risk: 'red', note: 'Активация SIM на CN ROM.' },
    /* — Темы, персонализация — */
    { pkg: 'com.android.thememanager', name: 'Темы (Theme Manager)', cat: 'cn-utils', risk: 'yellow', note: 'CN-магазин тем; при удалении темы перестанут скачиваться.' },
    { pkg: 'com.miui.personalassistant', name: 'App Vault / Лента (智能助理)', cat: 'cn-utils', risk: 'green', note: 'Лента слева от рабочего стола с CN-контентом.' },
    { pkg: 'com.miui.contentextension', name: 'Content Extension', cat: 'cn-utils', risk: 'green', note: 'Рекламные подсказки при выделении текста.' },
    { pkg: 'com.miui.extraphoto', name: 'Extra Photo (CN-фильтры)', cat: 'cn-utils', risk: 'green', note: 'Доп. фильтры CN-камеры.' },
    /* — Системные: НЕ ТРОГАТЬ — */
    { pkg: 'com.miui.securitycenter', name: 'Безопасность (Security)', cat: 'system', risk: 'red', note: 'Удаление ломает разрешения приложений и «оптимизацию».' },
    { pkg: 'com.miui.securitycore', name: 'Security Core', cat: 'system', risk: 'red', note: '' },
    { pkg: 'com.miui.powerkeeper', name: 'PowerKeeper (батарея)', cat: 'system', risk: 'red', note: 'Управление энергосбережением; удаление вызывает зависания.' },
    { pkg: 'com.miui.systemui', name: 'SystemUI', cat: 'system', risk: 'red', note: 'Статус-бар и шторка. Никогда.' },
    { pkg: 'com.android.settings', name: 'Настройки', cat: 'system', risk: 'red', note: '' },
    { pkg: 'com.android.phone', name: 'Телефон (компонент)', cat: 'system', risk: 'red', note: '' },
    { pkg: 'com.miui.home', name: 'Launcher (рабочий стол)', cat: 'system', risk: 'red', note: 'Удаление без установленного Nova/Lawnchair = кирпич интерфейса.' },
    { pkg: 'com.miui.gallery', name: 'Галерея Mi', cat: 'cn-utils', risk: 'yellow', note: 'Замена: Fossify Gallery из авто-каталога. Некоторые функции камеры (просмотр) зависят от неё.' },
    { pkg: 'com.android.camera', name: 'Камера (Mi/Leica)', cat: 'system', risk: 'red', note: 'Удаление лишает Leica-режимов и второго экрана.' },
    { pkg: 'com.miui.packageinstaller', name: 'Установщик пакетов', cat: 'system', risk: 'red', note: 'Без него APK не ставятся!' },
    { pkg: 'com.miui.bugreport', name: 'Bug Report (отчёты)', cat: 'sys-extra', risk: 'green', note: 'Отправка отчётов Xiaomi.' },
    { pkg: 'com.miui.yellowpage', name: 'Yellow Page (жёлтые страницы CN)', cat: 'sys-extra', risk: 'green', note: 'CN-справочник в «Телефоне».' },
    { pkg: 'com.android.midrive', name: 'Mi Drive', cat: 'xiaomi-svc', risk: 'yellow', note: 'CN-облачный диск.' },
    { pkg: 'com.miui.touchassistant', name: 'Touch Assistant (плавающий шар)', cat: 'cn-utils', risk: 'green', note: '' },
    { pkg: 'com.miui.voiceassistoverlay', name: 'XiaoAI Overlay', cat: 'ai', risk: 'green', note: 'Оверлей ассистента.' },
    { pkg: 'com.miui.accessibility', name: 'Mi Accessibility', cat: 'system', risk: 'red', note: 'Специальные возможности.' },
    { pkg: 'com.xiaomi.discover', name: 'Xiaomi Discover (реклама)', cat: 'sys-extra', risk: 'green', note: 'Рекламные рекомендации приложений.' },
    { pkg: 'com.miui.cleaner', name: 'Cleaner (очистка мусора)', cat: 'sys-extra', risk: 'yellow', note: 'Агрессивный «очиститель» с рекламой. Замена не нужна.' },
    { pkg: 'com.miui.guardprovider', name: 'Guard Provider (антивирус CN)', cat: 'sys-extra', risk: 'green', note: 'CN-антивирусный движок (Tencent/Avast CN).' },
    { pkg: 'com.miui.translation.kingsoft', name: 'Перевод Kingsoft', cat: 'ai', risk: 'green', note: 'CN-движок перевода.' },
    { pkg: 'com.miui.translation.youdao', name: 'Перевод Youdao', cat: 'ai', risk: 'green', note: 'CN-движок перевода.' },
    { pkg: 'com.miui.translation.xmcloud', name: 'XM Cloud Translate', cat: 'ai', risk: 'green', note: '' },
    { pkg: 'com.miui.face', name: 'Face Unlock (Mi)', cat: 'system', risk: 'red', note: 'Разблокировка по лицу перестанет работать.' },
    { pkg: 'com.xiaomi.barrage', name: 'Barrage (данму-комментарии)', cat: 'media', risk: 'green', note: 'CN-комментарии поверх видео.' },
    { pkg: 'com.miui.smarttravel', name: 'Smart Travel (поездки CN)', cat: 'cn-utils', risk: 'green', note: 'CN-функции поездок.' },
    { pkg: 'com.miui.mishare.connectivity', name: 'Mi Share (обмен)', cat: 'cn-utils', risk: 'yellow', note: 'Обмен с устройствами Xiaomi. Замена: LocalSend.' },
    { pkg: 'com.miui.miinput', name: 'Клавиатура Mi (CN)', cat: 'cn-utils', risk: 'yellow', note: 'Сначала установите Gboard! Иначе останетесь без клавиатуры.' },
    { pkg: 'com.iflytek.inputmethod.miui', name: 'iFlytek IME (CN-ввод)', cat: 'cn-utils', risk: 'green', note: 'Китайская клавиатура. Замена: Gboard.' },
    { pkg: 'com.sohu.inputmethod.sogou.xiaomi', name: 'Sogou IME (CN-ввод)', cat: 'cn-utils', risk: 'green', note: 'Китайская клавиатура Sogou.' },
    { pkg: 'com.baidu.input_mi', name: 'Baidu IME (CN-ввод)', cat: 'cn-utils', risk: 'green', note: 'Китайская клавиатура Baidu.' },
    { pkg: 'com.miui.carlink', name: 'CarWith (CN-авто)', cat: 'cn-utils', risk: 'green', note: 'CN-аналог Android Auto; не работает с зарубежными авто.' },
    { pkg: 'com.milink.service', name: 'MiLink (часть Mi Share)', cat: 'cn-utils', risk: 'yellow', note: 'Связь с экосистемой Xiaomi.' }
  ];

  const DEBLOAT_CATS = {
    'stores': 'Магазины и витрины', 'media': 'Медиа CN', 'sys-extra': 'Аналитика и реклама',
    'ai': 'AI и голос (CN)', 'cn-utils': 'CN-утилиты', 'xiaomi-svc': 'Сервисы Xiaomi',
    'system': 'Системные — не трогать'
  };
  const RISK_META = {
    green: { label: 'Безопасно', cls: 'r-green' },
    yellow: { label: 'Подумать', cls: 'r-yellow' },
    red: { label: 'Не трогать', cls: 'r-red' }
  };

  function debloatRenderResults(found) {
    const wrap = $('#dbResults');
    if (!wrap) return;
    if (!found.length) {
      wrap.innerHTML = '<div class="db-empty">Совпадений не найдено. Проверьте, что вставлен вывод <code>pm list packages</code> (или имена пакетов через запятую/пробел).</div>';
      return;
    }
    const groups = { green: [], yellow: [], red: [] };
    found.forEach((d) => groups[d.risk].push(d));
    const summary = '<div class="db-summary">' +
      '<span class="db-chip r-green">● безопасно: ' + groups.green.length + '</span>' +
      '<span class="db-chip r-yellow">● подумать: ' + groups.yellow.length + '</span>' +
      '<span class="db-chip r-red">● не трогать: ' + groups.red.length + '</span>' +
      '</div>';

    const section = (riskKey, title, hint) => {
      const arr = groups[riskKey];
      if (!arr.length) return '';
      return '<div class="db-group">' +
        '<div class="db-group-title">' + title + ' <span>' + hint + '</span></div>' +
        arr.map((d) => {
          const rm = RISK_META[d.risk];
          return '<label class="db-item">' +
            (d.risk !== 'red'
              ? '<input type="checkbox" class="db-check" data-pkg="' + d.pkg + '"' + (d.risk === 'green' ? ' checked' : '') + '>'
              : '<span class="db-nocheck" title="Системный пакет">⌀</span>') +
            '<span class="db-item-main">' +
              '<span class="db-item-name">' + esc(d.name) + ' <span class="db-risk ' + rm.cls + '">' + rm.label + '</span></span>' +
              '<span class="db-item-pkg">' + esc(d.pkg) + '</span>' +
              (d.note ? '<span class="db-item-note">' + esc(d.note) + '</span>' : '') +
            '</span>' +
          '</label>';
        }).join('') + '</div>';
    };

    wrap.innerHTML = summary +
      '<div class="db-toolbar">' +
        '<button class="db-btn" id="dbGenCmd" type="button">Сгенерировать команды удаления</button>' +
        '<button class="db-btn ghost" id="dbGenCleanup" type="button">+ очистка остатков</button>' +
        '<button class="db-btn ghost" id="dbGenRestore" type="button">Команды восстановления</button>' +
      '</div>' +
      '<div id="dbCmdOut"></div>' +
      section('green', 'Можно удалять', '— отмечены автоматически') +
      section('yellow', 'Удалять с осторожностью', '— отметьте осознанно') +
      section('red', 'Не удалять', '— системные, риск кирпича');
  }

  function debloatSelected() {
    return Array.from(document.querySelectorAll('.db-check:checked')).map((c) => c.dataset.pkg);
  }

  function debloatCmdBlock(title, lines) {
    const text = lines.join('\n');
    return '<div class="db-cmd-title">' + esc(title) + '</div>' +
      '<div class="cmd"><code>' + esc(text) + '</code><button class="copy-btn" data-copy="' + esc(text) + '" type="button">копия</button></div>';
  }

  function debloatGenerate(withCleanup) {
    const pkgs = debloatSelected();
    const out = $('#dbCmdOut');
    if (!pkgs.length) { toast('Отметьте хотя бы один пакет'); return; }
    const lines = ['# Удаление для текущего пользователя (обратимо):'];
    pkgs.forEach((p) => lines.push('pm uninstall --user 0 ' + p));
    if (withCleanup) {
      lines.push('');
      lines.push('# Очистка остатков: кэш и данные для user 0');
      pkgs.forEach((p) => lines.push('pm clear --user 0 ' + p));
      lines.push('');
      lines.push('# Остатки на SD/общем хранилище (через Termux/файловый менеджер):');
      lines.push('rm -rf /sdcard/Android/data/*xiao* /sdcard/Android/data/*miui* 2>/dev/null');
      lines.push('rm -rf /sdcard/MIUI/debug_log /sdcard/miui 2>/dev/null');
      lines.push('');
      lines.push('# Точечная проверка остатков по удалённым пакетам:');
      pkgs.forEach((p) => lines.push('ls /sdcard/Android/data/ | grep -i "' + p.split('.').pop() + '"'));
    }
    const title = 'Команды для Termux (Shizuku) или adb shell — ' + pkgs.length + ' пакетов' + (withCleanup ? ' + очистка' : '');
    out.innerHTML = debloatCmdBlock(title, lines);
    out.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function debloatRestore() {
    const pkgs = debloatSelected();
    const out = $('#dbCmdOut');
    if (!pkgs.length) { toast('Отметьте хотя бы один пакет'); return; }
    const lines = ['# Восстановление удалённого (user 0):'];
    pkgs.forEach((p) => lines.push('pm install-existing ' + p));
    out.innerHTML = debloatCmdBlock('Откат — вернуть ' + pkgs.length + ' пакетов как было', lines);
    out.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function debloatScan() {
    const raw = ($('#dbInput').value || '').toLowerCase();
    const present = new Set();
    raw.split(/[\s,;]+/).forEach((tok) => {
      tok = tok.replace(/^package:/, '').trim();
      if (tok.indexOf('.') !== -1) present.add(tok);
    });
    const found = DEBLOAT_DB.filter((d) => present.has(d.pkg));
    debloatRenderResults(found);
    if (found.length) toast('Найдено пакетов: ' + found.length);
  }

  function initDebloat() {
    const pane = document.querySelector('.pane[data-sec="debloat"]');
    if (!pane || pane.dataset.dbInit) return;
    pane.dataset.dbInit = '1';
    pane.addEventListener('click', (e) => {
      if (e.target.closest('#dbScan')) debloatScan();
      else if (e.target.closest('#dbSample')) {
        $('#dbInput').value = [
          'package:com.xiaomi.mipicks', 'package:com.miui.video', 'package:com.miui.player',
          'package:com.miui.analytics', 'package:com.miui.hybrid', 'package:com.miui.voiceassist',
          'package:com.miui.weather2', 'package:com.xiaomi.account', 'package:com.miui.securitycenter',
          'package:com.miui.notes', 'package:com.iflytek.inputmethod.miui', 'package:com.miui.cleaner'
        ].join('\n');
        debloatScan();
      }
      else if (e.target.closest('#dbGenCmd')) debloatGenerate(false);
      else if (e.target.closest('#dbGenCleanup')) debloatGenerate(true);
      else if (e.target.closest('#dbGenRestore')) debloatRestore();
    });
  }

  /* ================================================================
     СОСТОЯНИЕ
     ================================================================ */
  const LS_KEY = 'ga-pwa-state-v1';
  let state;
  try { state = JSON.parse(localStorage.getItem(LS_KEY)) || {}; }
  catch (e) { state = {}; }
  const save = () => { try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch (e) {} };

  /* ================================================================
     РЕНДЕР
     ================================================================ */
  const $ = (s, r) => (r || document).querySelector(s);
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const CHECK_SVG = '<svg viewBox="0 0 24 24"><polyline points="4 12.5 10 18.5 20 6.5"/></svg>';
  const CHEV_SVG = '<svg class="chevron" viewBox="0 0 24 24"><polyline points="5 9 12 16 19 9"/></svg>';
  const EXT_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M7 17L17 7M9 7h8v8"/></svg>';
  const DL_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 4v11m0 0l-4.5-4.5M12 15l4.5-4.5M5 20h14"/></svg>';

  function itemHTML(it) {
    const on = !!state[it.id];
    const steps = it.steps && it.steps.length
      ? '<ol class="step-list">' + it.steps.map((s) => '<li>' + s + '</li>').join('') + '</ol>' : '';
    const cmd = it.cmd
      ? '<div class="cmd"><code>' + esc(it.cmd) + '</code><button class="copy-btn" data-copy="' + esc(it.cmd) + '" type="button">копия</button></div>' : '';
    const note = it.note ? '<div class="note ' + it.note.type + '">' + it.note.html + '</div>' : '';
    const links = it.links && it.links.length
      ? '<div class="actions">' + it.links.map((l) =>
          '<a class="dl-btn ' + (l.primary ? 'primary' : 'ghost') + '" href="' + l.url + '" target="_blank" rel="noopener noreferrer">' +
          (l.primary ? DL_SVG : EXT_SVG) + esc(l.label) + '</a>').join('') + '</div>' : '';
    return '' +
      '<article class="item' + (on ? ' installed' : '') + '" data-id="' + it.id + '">' +
        '<div class="item-head">' +
          '<button class="check' + (on ? ' on' : '') + '" type="button" aria-label="Отметить выполненным" aria-pressed="' + on + '">' + CHECK_SVG + '</button>' +
          '<div class="item-title">' +
            '<div class="name">' + esc(it.name) + '<span class="src">' + esc(it.src) + '</span></div>' +
            '<div class="tagline">' + esc(it.tagline) + '</div>' +
          '</div>' +
          '<div class="head-right"><span class="level l-' + it.level + '">' + esc(it.levelText) + '</span>' + CHEV_SVG + '</div>' +
        '</div>' +
        '<div class="item-body"><div class="item-body-inner"><div class="item-body-pad">' +
          '<p class="desc">' + it.desc + '</p>' + steps + cmd + note + links +
        '</div></div></div>' +
      '</article>';
  }

  function render() {
    const tabsEl = $('#tabs');
    const contentEl = $('#content');
    tabsEl.innerHTML = '';
    contentEl.innerHTML = '';

    SECTIONS.forEach((sec, i) => {
      const items = ITEMS.filter((it) => it.sec === sec.id);
      const done = items.filter((it) => state[it.id]).length;

      const tab = document.createElement('button');
      tab.className = 'tab' + (i === 0 ? ' active' : '') + (done === items.length && items.length ? ' done-all' : '');
      tab.type = 'button';
      tab.dataset.sec = sec.id;
      tab.id = sec.anchor;
      tab.innerHTML = esc(sec.tab) + ' <span class="tab-count" data-count="' + sec.id + '">' + done + '/' + items.length + '</span>';
      tab.addEventListener('click', () => switchTab(sec.id));
      tabsEl.appendChild(tab);

      const pane = document.createElement('section');
      pane.className = 'pane' + (i === 0 ? ' active' : '');
      pane.dataset.sec = sec.id;
      const autoBlock = sec.id === 'stores'
        ? '<div class="auto-store">' +
            '<div class="auto-head">' +
              '<div class="auto-title">Авто-режим · прямая загрузка APK</div>' +
              '<button class="auto-refresh" id="autoRefresh" type="button">Обновить версии</button>' +
            '</div>' +
            '<div class="auto-sub">Содержимое магазинов — прямо здесь: версии и ссылки на APK подтягиваются автоматически с GitHub и F-Droid. Нажмите «APK» — файл скачается и установится штатным установщиком HyperOS. Сами магазины ставить не обязательно.</div>' +
            '<input class="auto-search" id="autoSearch" type="search" placeholder="Поиск: shizuku, галерея, пароли…" autocomplete="off">' +
            '<div class="auto-grid" id="autoGrid"></div>' +
            '<div class="auto-note">Google Play и RuStore не отдают APK напрямую из браузера — для них кнопка «Сайт» открывает официальную страницу.</div>' +
          '</div>' +
          '<div class="classic-title">Классические магазины — по желанию</div>'
        : '';
      const debloatBlock = sec.id === 'debloat'
        ? '<div class="auto-store db-store">' +
            '<div class="auto-head">' +
              '<div class="auto-title">Сканер китайских приложений</div>' +
              '<button class="auto-refresh" id="dbSample" type="button">Демо-данные</button>' +
            '</div>' +
            '<div class="auto-sub"><strong>Шаг 1.</strong> Получите список пакетов со смартфона одной из команд ниже (Termux с Shizuku — прямо на телефоне, либо adb shell с ПК). <strong>Шаг 2.</strong> Вставьте вывод в поле и нажмите «Сканировать».</div>' +
            '<div class="cmd"><code>pm list packages | grep -iE "xiaomi|miui|mi\\.|duokan|iflytek|sogou|baidu"</code><button class="copy-btn" data-copy="pm list packages | grep -iE &quot;xiaomi|miui|mi\\.|duokan|iflytek|sogou|baidu&quot;" type="button">копия</button></div>' +
            '<textarea class="db-input" id="dbInput" rows="6" placeholder="package:com.xiaomi.mipicks&#10;package:com.miui.video&#10;…" spellcheck="false"></textarea>' +
            '<button class="db-scan" id="dbScan" type="button">Сканировать установленное</button>' +
            '<div id="dbResults"></div>' +
            '<div class="auto-note">Удаление идёт через <code>pm uninstall --user 0</code> — APK остаётся в системном разделе, поэтому всё обратимо командой <code>pm install-existing</code> без прошивки. Системные пакеты (красные) сканер помечает, но не даёт отметить.</div>' +
          '</div>'
        : '';
      pane.innerHTML =
        '<div class="pane-intro"><span class="verdict ' + sec.verdict + '">' + esc(sec.verdictText) + '</span><br>' + sec.intro + '</div>' +
        autoBlock +
        debloatBlock +
        items.map(itemHTML).join('');
      contentEl.appendChild(pane);
    });
    updateOverall();
    initAutoStore();
    initDebloat();
  }

  function switchTab(secId) {
    document.querySelectorAll('.tab').forEach((t) => t.classList.toggle('active', t.dataset.sec === secId));
    document.querySelectorAll('.pane').forEach((p) => p.classList.toggle('active', p.dataset.sec === secId));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function updateOverall() {
    const total = ITEMS.length;
    const done = ITEMS.filter((it) => state[it.id]).length;
    $('#overallPct').textContent = done + ' / ' + total;
    $('#overallFill').style.width = (total ? (done / total) * 100 : 0) + '%';
    SECTIONS.forEach((sec) => {
      const items = ITEMS.filter((it) => it.sec === sec.id);
      const d = items.filter((it) => state[it.id]).length;
      const c = document.querySelector('[data-count="' + sec.id + '"]');
      if (c) c.textContent = d + '/' + items.length;
      const tab = document.querySelector('.tab[data-sec="' + sec.id + '"]');
      if (tab) tab.classList.toggle('done-all', d === items.length && items.length > 0);
    });
  }

  /* ================================================================
     ВЗАИМОДЕЙСТВИЯ
     ================================================================ */
  let toastTimer = null;
  function toast(msg) {
    const t = $('#toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
  }

  document.addEventListener('click', (e) => {
    const check = e.target.closest('.check');
    if (check) {
      const item = check.closest('.item');
      const id = item.dataset.id;
      state[id] = !state[id];
      if (!state[id]) delete state[id];
      save();
      const on = !!state[id];
      check.classList.toggle('on', on);
      check.setAttribute('aria-pressed', on);
      item.classList.toggle('installed', on);
      updateOverall();
      if (on) toast('Отмечено выполненным');
      return;
    }
    const head = e.target.closest('.item-head');
    if (head && !e.target.closest('a') && !e.target.closest('.copy-btn')) {
      head.closest('.item').classList.toggle('open');
      return;
    }
    const copyBtn = e.target.closest('.copy-btn');
    if (copyBtn) {
      const text = copyBtn.dataset.copy;
      const done = () => {
        copyBtn.textContent = 'скопировано';
        copyBtn.classList.add('copied');
        setTimeout(() => { copyBtn.textContent = 'копия'; copyBtn.classList.remove('copied'); }, 1600);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done).catch(() => fallbackCopy(text, done));
      } else fallbackCopy(text, done);
    }
  });

  function fallbackCopy(text, cb) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); cb(); } catch (e) {}
    document.body.removeChild(ta);
  }

  $('#resetBtn').addEventListener('click', () => {
    state = {};
    save();
    render();
    toast('Прогресс сброшен');
  });

  /* Deep-link: #tab-unlock и т.п. */
  function applyHash() {
    const h = (location.hash || '').replace('#', '');
    const sec = SECTIONS.find((s) => s.anchor === h);
    if (sec) switchTab(sec.id);
  }
  window.addEventListener('hashchange', applyHash);

  /* ================================================================
     PWA: install prompt, SW, online/offline
     ================================================================ */
  let deferredPrompt = null;
  const installBtn = $('#installBtn');
  const installHint = $('#installHint');

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installBtn.classList.add('show');
    installHint.classList.remove('show');
  });
  installBtn.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    installBtn.classList.remove('show');
  });
  window.addEventListener('appinstalled', () => {
    installBtn.classList.remove('show');
    installHint.classList.remove('show');
    toast('Приложение установлено');
  });

  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  if (!isStandalone && (isIOS || !('onbeforeinstallprompt' in window))) {
    installHint.classList.add('show');
  }

  function netStatus() {
    const on = navigator.onLine;
    $('#netDot').className = 'dot ' + (on ? 'on' : 'off');
    $('#netText').textContent = on ? 'онлайн' : 'офлайн';
  }
  window.addEventListener('online', netStatus);
  window.addEventListener('offline', netStatus);
  netStatus();

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }

  render();
  applyHash();
})();

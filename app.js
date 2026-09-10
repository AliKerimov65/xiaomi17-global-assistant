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
      intro: 'Китайский GetApps — не единственный вариант. Эти магазины полностью <strong>мультиязычны (включая русский)</strong> и работают на HyperOS как на CN-прошивке, так и на xiaomi.eu: каталог Google Play без аккаунта, FOSS-репозитории, прямые обновления с GitHub и русскоязычная витрина. Все ставятся обычным APK.'
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
      pane.innerHTML =
        '<div class="pane-intro"><span class="verdict ' + sec.verdict + '">' + esc(sec.verdictText) + '</span><br>' + sec.intro + '</div>' +
        items.map(itemHTML).join('');
      contentEl.appendChild(pane);
    });
    updateOverall();
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

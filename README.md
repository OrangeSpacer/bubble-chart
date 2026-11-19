# Bubble Chart Playground

Интерактивная диаграмма на React, TypeScript, react-konva и d3-scale.

## Запуск

Требуется Node.js 22.12+ (ветка 22), 24 или 26+ и npm. CI использует Node.js 22.

```bash
npm ci
npm run dev
```

Откройте адрес, который выведет Vite (обычно http://localhost:5173).

## Возможности

- Linear: непрерывная числовая шкала с подписями всех делений.
- Grouped: пустые интервалы сжимаются. Подпись `40+` отмечает начало следующего занятого интервала; точка `45` располагается правее.
- Независимые типы осей X/Y через `axisSettings.x.mode` и `axisSettings.y.mode`, общий или отдельные шаги делений.
- Отдельные названия и знаки значений делений через `axisSettings.x/y.title` и `tickSuffix`, например `10 ₽` и `40+%`.
- Настройки осей сгруппированы в `axisSettings`: независимые X/Y с названием, суффиксом, режимом и шагом. Типы `AxisSettings` и `AxesSettings` экспортируются для подключения в другом проекте.
- Независимые медианы X/Y через `medianSettings`: значение и собственный знак, подпись `Медиана {value}{sign}` на существующей границе зоны, без отдельной линии и белой подложки.
- Выбор объекта на диаграмме или кнопками списка, изменение названия, координат и размера, добавление объектов.
- Относительные размеры пузырьков: радиусы нормализуются по максимальному `size` в текущем массиве, без привязки к фиксированному значению 100.
- Автоматический поиск свободного места для подписей с учётом пузырьков, других названий и подписей зон; соединительные линии для отодвинутых названий.
- Произвольные прямоугольные зоны из данных бэка (`x1/x2/y1/y2`), с title/subtitle и расположением текста top/bottom + left/right. В демо показаны четыре зоны и слайдеры их границ.
- Выбор активной зоны извне через `activeZoneId`: остальные зоны, пузырьки с другим `zoneId` и без привязки приглушаются вместе с подписями и линиями; `null` сбрасывает выбор и приглушение.
- Сброс данных и всех настроек к исходным значениям.
- Адаптивный Canvas: график заполняет контейнер, пересчитывает геометрию и подписи при изменении его размера. В демо используется вся ширина страницы и доступная высота окна.
- Динамические отступы по осям защищают крайние пузырьки от обрезки; настройка `axisSettings.autoGap` включена по умолчанию и переключается в демо.

Координаты могут быть отрицательными и дробными. Нечисловые значения не попадают в состояние. Для подсчёта объектов зоны используют полуоткрытые интервалы: общая граница относится к правой/верхней зоне. Подробный контракт зон и пример JSON — в [документации chart](src/chart/README.md).

## Структура

```text
src/
  main.tsx
  chart/
    index.ts
    README.md
    types/chart.ts
    components/
      Axis/
        ChartAxes.tsx
        hooks/useChartAxes.ts
        utils/axis.ts
        __tests__/axis.test.ts
      Bubble/
        BubbleMark.tsx
        BubbleLabels.tsx
        hooks/useBubbles.ts
        utils/
          bubbleSize.ts
          labelLayout.ts
          labelText.ts
        __tests__/
          bubbleSize.test.ts
          labelLayout.test.ts
      Zone/
        ChartZones.tsx
        hooks/useChartZones.ts
        utils/
          zones.ts
          zoneLabels.ts
          projectZones.ts
        __tests__/
          zones.test.ts
          zoneLabels.test.ts
      Median/
        MedianOverlay.tsx
        hooks/useMedians.ts
        utils/medianGeometry.ts
        __tests__/medianGeometry.test.ts
      Chart/
        BubbleChart.tsx
        hooks/useBubbleChart.ts
        hooks/useChartSize.ts
        utils/geometry.ts
        utils/layout.ts
        utils/observeSize.ts
        constants/chart.ts
        styles/Chart.styles.ts
        __tests__/
          BubbleChart.test.tsx
          geometry.test.ts
  demo/
    App.tsx
    model.ts
    state.ts
    zones.ts
    style.css
    components/
      ChartControls.tsx
      AxisSettings.tsx
      MedianSettings.tsx
      Panels.tsx
    __tests__/state.test.ts
```

При вычислении занятых интервалов используются **только координаты объектов**. Границы зон проецируются через готовые шкалы и ограничиваются областью графика. Изменение границ не меняет шкалы.

Внутри `chart/components` каждая группа `Bubble`, `Axis`, `Zone` и `Chart` содержит свои компоненты, `hooks`, `utils` и `__tests__`. Общие размеры и стили принадлежат `Chart/constants` и `Chart/styles`; публичные типы находятся в `chart/types`. Хук `Chart/hooks/useBubbleChart` связывает локальные хуки осей, пузырьков и зон. Тесты демо остаются в `demo/__tests__`.

Диаграмма импортируется из `src/chart` и управляется через props. Инструкция переноса и полный API: [src/chart/README.md](src/chart/README.md). Для переноса скопируйте папку `chart` и установите её зависимости.

Состояние демо обновляется через типизированные действия reducer. Добавление объекта и его выбор происходят одним действием; сброс создаёт новые исходные данные. Диаграмма не зависит от reducer, панелей или стилей демо.

## Проверки

```bash
npm test              # Тесты шкал, состояния, зон и геометрии
npm run test:watch    # Тесты при разработке
npm run typecheck    # TypeScript без сборки
npm run typecheck:chart # Изолированная компиляция переносимой диаграммы
npm run build        # Проверка TypeScript и production-сборка
npm run format       # Форматирование
npm run check        # Форматирование, изоляция chart, тесты и production-сборка
```

GitHub Actions запускает `npm ci` и `npm run check` для push и pull request. Версии установленных зависимостей зафиксированы в `package-lock.json`.

Canvas занимает размер контейнера и автоматически перестраивается через `ResizeObserver`. Для встраивания задайте высоту родителя либо передайте `height`, например `<BubbleChart data={data} height="70vh" />`; минимальная высота — 280 px. Подписи размещаются эвристически: при недостатке места пересечения всё ещё возможны.

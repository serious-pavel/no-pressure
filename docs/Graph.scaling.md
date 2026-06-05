# Graph scaling notes

The graph uses the wrapper width plus the number of visible points to size the dots.
The current dot-size rule is:

```ts
pointCount = visibleReadings.length * 2
widthBasedSize = round(wrapperWidth / 96)
densityBasedSize = round((wrapperWidth / pointCount) * 0.75)
dotSize = clamp(min(widthBasedSize, densityBasedSize), 5, 12)
```

Current knobs:

- `MIN_DOT_SIZE`: floor for tiny screens and dense year views.
- `MAX_DOT_SIZE`: ceiling for large screens with low point density.
- `wrapperWidth / 96`: how quickly dots grow with available width.
- `0.75` in the density term: how aggressively dot size shrinks as point count rises.
- `yAxisWidth`: `28 + scale * 10`
- `XAxis.padding`: `6` on each side
- `XAxis.tickMargin`: `4`
- tick label size: `clamp(0.5rem, 2.6cqi, 0.9rem)`
- `Scatter.isAnimationActive`: `false` for systolic and diastolic series
- `Tooltip.cursor`: custom dashed segment between systolic and diastolic hover values

How to tune it:

- Bigger dots everywhere: raise `MIN_DOT_SIZE` and `MAX_DOT_SIZE`.
- Smaller dots everywhere: lower `MIN_DOT_SIZE` and `MAX_DOT_SIZE`.
- Dots grow faster on wide containers: lower the divisor in `wrapperWidth / 96`.
- Dots stay larger for dense data: raise the `0.75` density factor.
- Dots shrink more for dense data: lower the `0.75` density factor.
- More left room for Y-axis labels on large screens: raise `yAxisWidth`.
- More room for date labels at the edges: raise `XAxis.padding` and `tickMargin`.


### Control the outer chart margins.

`chartMargin.top` and `chartMargin.bottom`: `6 + scale * 4`

`chartMargin.right`: `8 + scale * 10`

`chartMargin.left`: keep at `0`

- Increase the first number for more padding on small screens.
- Increase the second number for more padding on big screens.
- Decrease either one to tighten it.

Avoid negative `chartMargin.left`. It pushes the plot outside the chart viewport and causes overflow.

### Control scale.

```const scale = Math.min(1, Math.max(0, (wrapperWidth - 320) / 500))```
- This is the master switch for when scaling starts and how fast it grows.
- 320 is the width where scaling begins.
- 500 is how much width it takes to reach the max size.

If you want the chart to start scaling earlier, lower 320. If you want it to scale more slowly, raise 500.

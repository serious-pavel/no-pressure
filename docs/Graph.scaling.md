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
- `chartMargin.top` and `chartMargin.bottom`: `6 + scale * 4`
- `chartMargin.right`: `8 + scale * 10`
- `chartMargin.left`: keep at `0`
- `yAxisWidth`: `28 + scale * 10`
- `XAxis.padding`: `6` on each side
- `XAxis.tickMargin`: `4`
- tick label size: `clamp(0.5rem, 2.6cqi, 0.9rem)`

How to tune it:

- Bigger dots everywhere: raise `MIN_DOT_SIZE` and `MAX_DOT_SIZE`.
- Smaller dots everywhere: lower `MIN_DOT_SIZE` and `MAX_DOT_SIZE`.
- Dots grow faster on wide containers: lower the divisor in `wrapperWidth / 96`.
- Dots stay larger for dense data: raise the `0.75` density factor.
- Dots shrink more for dense data: lower the `0.75` density factor.
- More left room for Y-axis labels on large screens: raise `yAxisWidth`.
- More room for date labels at the edges: raise `XAxis.padding` and `tickMargin`.

Avoid negative `chartMargin.left`. It pushes the plot outside the chart viewport and causes overflow.

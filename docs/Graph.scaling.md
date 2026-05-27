# Graph scaling notes

The graph uses the wrapper width to scale spacing. The main driver is:

```ts
scale = clamp((wrapperWidth - 320) / 500, 0, 1)
```

Current knobs:

- `chartMargin.top` and `chartMargin.bottom`: `6 + scale * 4`
- `chartMargin.right`: `8 + scale * 10`
- `chartMargin.left`: keep at `0`
- `yAxisWidth`: `28 + scale * 10`
- `XAxis.padding`: `6` on each side
- `XAxis.tickMargin`: `4`
- tick label size: `clamp(0.5rem, 2.6cqi, 0.9rem)`

How to tune it:

- Smaller padding on all sizes: lower the base values.
- Bigger padding on all sizes: raise the base values.
- More change between small and large screens: raise the multiplier after `scale *`.
- Less change between small and large screens: lower the multiplier after `scale *`.
- More left room for Y-axis labels on large screens: raise `yAxisWidth`.
- More room for date labels at the edges: raise `XAxis.padding` and `tickMargin`.

Avoid negative `chartMargin.left`. It pushes the plot outside the chart viewport and causes overflow.

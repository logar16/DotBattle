import * as Slider from '@radix-ui/react-slider'

type SliderInputProps = {
  value: number
  min: number
  max: number
  step: number
  onValueChange: (value: number) => void
}

export function SliderInput({ value, min, max, step, onValueChange }: SliderInputProps) {
  return (
    <Slider.Root
      className="slider-root"
      value={[value]}
      min={min}
      max={max}
      step={step}
      onValueChange={(values) => {
        if (typeof values[0] === 'number') onValueChange(values[0])
      }}
    >
      <Slider.Track className="slider-track">
        <Slider.Range className="slider-range" />
      </Slider.Track>
      <Slider.Thumb className="slider-thumb" />
    </Slider.Root>
  )
}

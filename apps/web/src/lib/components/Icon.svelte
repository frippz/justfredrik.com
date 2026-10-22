<script lang="ts">
  interface Props {
    icon: string
    classes?: string
    width?: number
    height?: number
  }

  let { icon, classes, width = 16, height = 16 }: Props = $props()
</script>

<svg class={['svg-icon', classes]} {height} {width} aria-hidden="true">
  <use href="/images/sprite.svg#{icon}"></use>
</svg>

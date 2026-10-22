import { defineParams } from '@sveltejs/kit/params'

export const params = defineParams({
  // Kept as a string so zero-padded dates like `03` survive
  integer: (param) => (/^\d+$/.test(param) ? param : undefined),
})

import * as migration_20261022_185837_initial from './20261022_185837_initial';

export const migrations = [
  {
    up: migration_20261022_185837_initial.up,
    down: migration_20261022_185837_initial.down,
    name: '20261022_185837_initial'
  },
];
